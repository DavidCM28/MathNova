# MathNova

MathNova es una plataforma interactiva de aprendizaje de matemáticas para estudiantes de secundaria. Incluye una aplicación React, una API Express y una aplicación de escritorio Electron para Windows y macOS.

## Aplicación de escritorio

La versión instalada:

- No requiere Git, Node.js ni npm en el equipo del usuario.
- Inicia automáticamente la API local.
- Sirve React y la API desde el mismo puerto.
- Se conecta a PostgreSQL alojado en Supabase.
- Permite que otros dispositivos de la red abran MathNova usando la IP de la PC principal.

Consulta [docs/DESKTOP.md](docs/DESKTOP.md) para instalación, compilación, acceso por red y solución de problemas.

## Desarrollo

Requisitos para compilar el código fuente:

- Node.js 22.
- npm.

Instalación:

```bash
npm ci
npm --prefix client ci
npm --prefix server ci
```

Configura `server/.env` basándote en `server/.env.example` y ejecuta:

```bash
npm run dev:server
npm run dev:client
```

## Builds

```bash
npm run build
npm run desktop:dev
npm run dist:win
npm run dist:mac
```

Los artefactos se generan en `release/`. El build de macOS debe ejecutarse en macOS o mediante el workflow `Build MathNova Desktop`.

## Arquitectura

```text
Electron
└── Express (0.0.0.0:3001 o siguiente puerto libre)
    ├── /api/*
    ├── React compilado
    └── PostgreSQL / Supabase
```

Autor: Brayan David Casas Morales.
