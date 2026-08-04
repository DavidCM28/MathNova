# MathNova Desktop

## Instalación en Windows

1. Ejecuta `MathNova Setup 1.0.0.exe`.
2. Elige la carpeta de instalación.
3. Abre MathNova desde el acceso directo o el menú Inicio.
4. Si Windows Defender Firewall pregunta, permite el acceso en redes privadas para usar MathNova desde otros dispositivos.

El instalador no está firmado con un certificado comercial, por lo que Windows puede mostrar `Editor desconocido`. Los metadatos del archivo identifican a Brayan David Casas Morales como autor.

## Uso en la red local

MathNova intenta usar el puerto `3001`. Si está ocupado, prueba automáticamente hasta el `3020`.

En el menú de la aplicación selecciona `MathNova > Información de red`. Ahí aparecen:

- Dirección para esta PC: `http://127.0.0.1:PUERTO`.
- Dirección para otros dispositivos: `http://IP_LOCAL:PUERTO`.

Los otros dispositivos deben estar conectados a la misma red. Si no responden:

1. Comprueba que el acceso LAN esté habilitado en el menú de MathNova.
2. Reinicia MathNova después de cambiar esa opción.
3. Permite MathNova en el firewall para redes privadas.
4. Verifica que el router no tenga aislamiento de clientes.

## Registros y configuración

Windows guarda los archivos en:

```text
%APPDATA%\mathnova\
├── config.json
└── logs\mathnova.log
```

macOS utiliza:

```text
~/Library/Application Support/mathnova/
```

La carpeta de registros puede abrirse desde el menú de MathNova. Las cadenas sensibles conocidas se enmascaran en los logs.

## Compilación desde el código fuente

```bash
npm ci
npm --prefix client ci
npm --prefix server ci
npm run build
```

Windows x64:

```bash
npm run dist:win
```

macOS Intel y Apple Silicon:

```bash
npm run dist:mac
```

`server/.env` debe existir antes de empaquetar. La aplicación instalada incorpora este archivo como recurso.

## GitHub Actions

El workflow `.github/workflows/desktop-build.yml` se ejecuta manualmente y necesita estos secretos:

- `DATABASE_URL`
- `JWT_SECRET`

Produce artifacts separados para Windows y macOS sin crear un release público.

## Limitaciones conocidas

- Requiere internet para las operaciones que dependen de Supabase.
- No implementa una base de datos offline local.
- El instalador Windows no tiene firma comercial.
- La primera carga puede tardar mientras se valida y sincroniza el esquema de PostgreSQL.
- El paquete es grande por los recursos multimedia incluidos.
