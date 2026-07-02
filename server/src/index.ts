import app from './app';
import { initDb } from './models';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Intentar sincronizar DB pero sin detener el servidor si falla
  await initDb().catch(err => {
    console.warn('⚠️ DB sync falló (probablemente tablas pendientes):', err.message);
  });

  // El servidor arranca siempre
  app.listen(PORT, () => {
    console.log(`🚀 MathNova Server running on http://localhost:${PORT}`);
  });
};

startServer().catch(error => {
  console.error('Fatal error starting MathNova server:', error);
  process.exit(1);
});