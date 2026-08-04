import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface DesktopConfig {
  preferredPort: number;
  lanEnabled: boolean;
}

const defaults: DesktopConfig = {
  preferredPort: 3001,
  lanEnabled: true,
};

function configPath(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

export function loadConfig(): DesktopConfig {
  try {
    const stored = JSON.parse(fs.readFileSync(configPath(), 'utf8')) as Partial<DesktopConfig>;
    return {
      preferredPort:
        Number.isInteger(stored.preferredPort) && Number(stored.preferredPort) > 0
          ? Number(stored.preferredPort)
          : defaults.preferredPort,
      lanEnabled:
        typeof stored.lanEnabled === 'boolean' ? stored.lanEnabled : defaults.lanEnabled,
    };
  } catch {
    saveConfig(defaults);
    return { ...defaults };
  }
}

export function saveConfig(config: DesktopConfig): void {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}
