import { Request, Response } from 'express';
import tripulacionService from '../services/tripulacionService';

class TripulacionController {
  async validarCelda(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, celda, valor } = req.body;

      if (!id_estudiante || !celda || valor === undefined) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, celda, valor',
        });
        return;
      }

      if (celda !== 'desierto' && celda !== 'cueva') {
        res.status(200).json({
          success: false,
          mensaje: 'La celda debe ser "desierto" o "cueva".',
        });
        return;
      }

      const result = await tripulacionService.validarCelda({
        id_estudiante: Number(id_estudiante),
        celda,
        valor: Number(valor),
      });

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en validarCelda:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarModulo(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, modulo } = req.body;

      if (!id_estudiante || !modulo) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, modulo',
        });
        return;
      }

      const result = await tripulacionService.validarModulo({
        id_estudiante: Number(id_estudiante),
        modulo: String(modulo),
      });

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en validarModulo:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async obtenerProgreso(req: Request, res: Response): Promise<void> {
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

      const progreso = await tripulacionService.obtenerProgreso(id_estudiante);

      if (!progreso) {
        res.status(200).json({
          success: true,
          data: null,
          mensaje: 'No se encontró progreso para este estudiante',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: progreso,
      });

    } catch (error) {
      console.error('Error en obtenerProgreso:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async reiniciarActividad(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante } = req.body;

      if (!id_estudiante) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante',
        });
        return;
      }

      const result = await tripulacionService.reiniciarActividad(Number(id_estudiante));

      if (!result) {
        res.status(200).json({
          success: false,
          mensaje: 'No se encontró progreso para este estudiante',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en reiniciarActividad:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
}

export default new TripulacionController();