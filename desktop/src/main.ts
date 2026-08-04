import fs from 'fs';
import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { app, BrowserWindow, clipboard, dialog, Menu, shell } from 'electron';
import { getLogPath, initializeLogger, log } from './logger';
import { DesktopConfig, loadConfig, saveConfig } from './config';

interface NetworkInfo {
  ok: boolean;
  port: number;
  local: string;
  lanEnabled: boolean;
  lan: Array<{ name: string; address: string }>;
}

let desktopConfig: DesktopConfig = { preferredPort: 3001, lanEnabled: true };
let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let networkInfo: NetworkInfo | null = null;
let isQuitting = false;

function resourcesRoot(): string {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '../..');
}

function backendPaths(): { entry: string; cwd: string; clientDist: string } {
  const root = resourcesRoot();
  return {
    entry: path.join(root, 'server', 'dist', 'index.js'),
    cwd: path.join(root, 'server'),
    clientDist: path.join(root, 'client', 'dist'),
  };
}

function startBackend(): void {
  const paths = backendPaths();
  if (!fs.existsSync(paths.entry)) {
    throw new Error(`No se encontró el backend compilado: ${paths.entry}`);
  }

  const backendLog = fs.openSync(getLogPath(), 'a');
  backendProcess = spawn(process.execPath, [paths.entry], {
    cwd: paths.cwd,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: String(desktopConfig.preferredPort),
      LAN_ENABLED: String(desktopConfig.lanEnabled),
      CLIENT_DIST_PATH: paths.clientDist,
    },
    stdio: ['ignore', backendLog, backendLog],
    windowsHide: true,
  });
  fs.closeSync(backendLog);

  backendProcess.once('exit', (code, signal) => {
    log(`El backend terminó (código=${code}, señal=${signal}).`);
    backendProcess = null;
    if (!isQuitting && mainWindow) {
      void dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'MathNova se detuvo',
        message: 'El servidor local dejó de funcionar.',
        detail: `Consulta el registro en ${getLogPath()}`,
      });
    }
  });
  backendProcess.once('error', (error) => log('No se pudo iniciar el backend.', error));
  log(`Backend iniciado con PID ${backendProcess.pid}.`);
}

async function requestNetworkInfo(port: number): Promise<NetworkInfo | null> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/network-info`, {
      signal: AbortSignal.timeout(800),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as NetworkInfo;
    return payload.ok ? payload : null;
  } catch {
    return null;
  }
}

async function waitForBackend(): Promise<NetworkInfo> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (backendProcess?.exitCode !== null) {
      throw new Error('El servidor local terminó durante el arranque.');
    }
    const candidates = await Promise.all(
      Array.from({ length: 20 }, (_, offset) =>
        requestNetworkInfo(desktopConfig.preferredPort + offset),
      ),
    );
    const info = candidates.find((candidate) => candidate !== null);
    if (info) return info;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('El servidor local no respondió después de 30 segundos.');
}

function createMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'MathNova',
      submenu: [
        {
          label: 'Información de red',
          click: async () => {
            const lanUrls = networkInfo?.lan.map((item) => item.address).join('\n') ||
              'No hay direcciones LAN disponibles.';
            const result = await dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Acceso a MathNova',
              message: 'Direcciones para abrir MathNova',
              detail: `En esta PC:\n${networkInfo?.local ?? 'No disponible'}\n\nEn otros dispositivos:\n${lanUrls}`,
              buttons: ['Cerrar', 'Copiar dirección LAN'],
              defaultId: 0,
            });
            if (result.response === 1 && networkInfo?.lan[0]) {
              clipboard.writeText(networkInfo.lan[0].address);
            }
          },
        },
        {
          label: 'Abrir carpeta de registros',
          click: () => void shell.showItemInFolder(getLogPath()),
        },
        {
          label: 'Permitir acceso desde la red local',
          type: 'checkbox',
          checked: desktopConfig.lanEnabled,
          click: async (item) => {
            desktopConfig.lanEnabled = item.checked;
            saveConfig(desktopConfig);
            await dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Configuración guardada',
              message: 'El cambio se aplicará la próxima vez que abras MathNova.',
            });
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

function createWindow(): BrowserWindow {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.resolve(__dirname, '../../mathnova-icon.png');
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#f5f7ff',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  window.once('ready-to-show', () => window.show());
  window.on('closed', () => { mainWindow = null; });
  return window;
}

async function initialize(): Promise<void> {
  initializeLogger();
  desktopConfig = loadConfig();
  log(`Iniciando MathNova ${app.getVersion()}.`);
  createMenu();
  mainWindow = createWindow();
  try {
    startBackend();
    networkInfo = await waitForBackend();
    log(`Servidor listo en ${networkInfo.local}.`);
    await mainWindow.loadURL(networkInfo.local);
  } catch (error) {
    log('Falló el inicio de MathNova.', error);
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'No se pudo iniciar MathNova',
      message: 'El servidor local no pudo iniciarse.',
      detail: `${error instanceof Error ? error.message : error}\n\nRegistro: ${getLogPath()}`,
    });
    app.quit();
  }
}

function stopBackend(): void {
  if (!backendProcess || backendProcess.killed) return;
  log('Cerrando el backend local.');
  backendProcess.kill('SIGTERM');
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(initialize);
  app.on('before-quit', () => {
    isQuitting = true;
    stopBackend();
  });
  app.on('window-all-closed', () => app.quit());
}
