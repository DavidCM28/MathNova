import { Request, Response } from 'express';
import progresoGeneralService from '../services/progresoGeneralService';

class ProgresoGeneralController {
  async obtenerEstadoActividades(req: Request, res: Response): Promise<void> {
    try {
      let idParam: string | undefined;

      if (Array.isArray(req.params.id_estudiante)) {
        idParam = req.params.id_estudiante[0];
      } else {
        idParam = req.params.id_estudiante;
      }

      if (!idParam) {
        res.status(200).json({
          success: false,
          mensaje: 'El ID del estudiante es requerido',
        });
        return;
      }

      const id_estudiante = parseInt(idParam, 10);

      if (isNaN(id_estudiante)) {
        res.status(200).json({
          success: false,
          mensaje: 'El ID del estudiante debe ser un número válido',
        });
        return;
      }

      const estado = await progresoGeneralService.obtenerEstadoActividades(id_estudiante);

      res.status(200).json({
        success: true,
        data: estado,
      });

    } catch (error) {
      console.error('Error en obtenerEstadoActividades:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
}

export default new ProgresoGeneralController();