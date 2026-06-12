import app from './app';
import { initDb } from './models';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database models (Postgres / MySQL dynamically configured)
    await initDb();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 MathNova Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting MathNova server:', error);
    process.exit(1);
  }
};

startServer();
