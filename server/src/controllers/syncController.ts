import { Request, Response } from 'express';
import { syncService } from '../services/syncService';
import { sequelize } from '../models';

export const syncController = {
  /**
   * Health status endpoint
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const dialect = sequelize.getDialect();
      res.json({
        status: 'online',
        databaseDialect: dialect,
        message: `Servidor MathNova activo. Conectado a base de datos ${dialect.toUpperCase()}.`
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al conectar con la base de datos',
        error: String(error)
      });
    }
  },

  /**
   * Sync transaction logs
   */
  async postSync(req: Request, res: Response): Promise<void> {
    const { queue, studentName } = req.body;

    if (!queue || !Array.isArray(queue)) {
      res.status(400).json({ error: 'La cola de sincronización (queue) es requerida y debe ser un arreglo' });
      return;
    }

    if (!studentName) {
      res.status(400).json({ error: 'El nombre del estudiante (studentName) es requerido' });
      return;
    }

    try {
      const syncedCount = await syncService.processSyncQueue(queue, studentName);
      res.json({
        success: true,
        syncedCount,
        message: `Sincronizados ${syncedCount} elementos con éxito.`
      });
    } catch (error) {
      console.error('Error in sync endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Fallo al procesar la sincronización en el servidor',
        details: String(error)
      });
    }
  }
};
export default syncController;
