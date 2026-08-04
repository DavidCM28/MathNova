import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let logPath = '';

function sanitize(value: unknown): string {
  return String(value)
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgresql://***')
    .replace(/(DATABASE_URL|JWT_SECRET)=\S+/gi, '$1=***');
}

export function initializeLogger(): string {
  const logDirectory = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(logDirectory, { recursive: true });
  logPath = path.join(logDirectory, 'mathnova.log');
  return logPath;
}

export function log(message: string, error?: unknown): void {
  const detail = error instanceof Error ? error.stack ?? error.message : error;
  const line = `[${new Date().toISOString()}] ${sanitize(message)}${
    detail ? ` ${sanitize(detail)}` : ''
  }\n`;
  if (logPath) fs.appendFileSync(logPath, line, 'utf8');
  console.log(line.trim());
}

export function getLogPath(): string {
  return logPath;
}
