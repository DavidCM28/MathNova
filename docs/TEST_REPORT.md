# Reporte de pruebas — MathNova Desktop 1.0.0

Fecha: 4 de agosto de 2026.

## Resultado

| Prueba | Resultado |
|---|---|
| Build React + TypeScript | Correcto |
| Build Express + TypeScript | Correcto |
| Build Electron + TypeScript | Correcto |
| Inicio de Electron | Correcto |
| Conexión con Supabase | Correcto |
| Endpoint `/api/health` | Correcto |
| Servicio de React desde Express | HTTP 200 |
| Detección de IP LAN | Correcto |
| Selección de puerto alternativo | Correcto |
| Instancia única | Implementado |
| Cierre del backend con Electron | Correcto |
| Paquete Windows desempaquetado | Correcto |
| Instalador Windows x64 | Generado |
| DMG macOS Intel | Pendiente de runner macOS |
| DMG macOS Apple Silicon | Pendiente de runner macOS |

## Pruebas de red

- Dirección local verificada: `http://127.0.0.1:3001`.
- La API detectó correctamente una dirección IPv4 LAN.
- Con el puerto preferido ocupado, MathNova seleccionó el puerto siguiente.

## Prueba del paquete Windows

- El paquete incluyó `client/dist`, `server/dist`, dependencias y configuración.
- `/api/health` respondió correctamente desde el ejecutable empaquetado.
- La página principal respondió HTTP 200.
- Al cerrar Electron, el backend liberó el puerto.

## Artefacto actual

- Archivo: `release/MathNova Setup 1.0.0.exe`.
- Plataforma: Windows x64.
- Firma digital comercial: no incluida.
- Autor en metadatos: Brayan David Casas Morales.

El hash debe recalcularse después de cualquier nueva generación del instalador.
