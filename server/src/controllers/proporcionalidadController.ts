import { Request, Response } from 'express';
import proporcionalidadService from '../services/proporcionalidadService';

class ProporcionalidadController {
  async validarTabla(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, reactores, tiempo } = req.body;

      if (!id_estudiante || reactores === undefined || tiempo === undefined) {
        res.status(400).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, reactores, tiempo',
        });
        return;
      }

      const result = await proporcionalidadService.validarTabla({
        id_estudiante: Number(id_estudiante),
        reactores: Number(reactores),
        tiempo: Number(tiempo),
      });

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en validarTabla:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarPrediccion(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, prediccion } = req.body;

      if (!id_estudiante || prediccion === undefined) {
        res.status(400).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, prediccion',
        });
        return;
      }

      const result = await proporcionalidadService.validarPrediccion({
        id_estudiante: Number(id_estudiante),
        prediccion: Number(prediccion),
      });

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en validarPrediccion:', error);
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
        res.status(400).json({
          success: false,
          mensaje: 'El ID del estudiante es requerido',
        });
        return;
      }

      const id_estudiante = parseInt(idParam, 10);

      if (isNaN(id_estudiante)) {
        res.status(400).json({
          success: false,
          mensaje: 'El ID del estudiante debe ser un número válido',
        });
        return;
      }

      const progreso = await proporcionalidadService.obtenerProgreso(id_estudiante);

      if (!progreso) {
        res.status(404).json({
          success: false,
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

  async guardarProgreso(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, pantalla_actual } = req.body;

      if (!id_estudiante || pantalla_actual === undefined) {
        res.status(400).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, pantalla_actual',
        });
        return;
      }

      const result = await proporcionalidadService.guardarProgreso(
        Number(id_estudiante),
        Number(pantalla_actual)
      );

      if (!result) {
        res.status(404).json({
          success: false,
          mensaje: 'No se encontró progreso para este estudiante',
        });
        return;
      }

      res.status(200).json({
        success: true,
        mensaje: 'Progreso guardado correctamente',
        data: result,
      });

    } catch (error) {
      console.error('Error en guardarProgreso:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async finalizarActividad(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, tiempo_total } = req.body;

      if (!id_estudiante || tiempo_total === undefined) {
        res.status(400).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, tiempo_total',
        });
        return;
      }

      const result = await proporcionalidadService.finalizarActividad(
        Number(id_estudiante),
        Number(tiempo_total)
      );

      if (!result) {
        res.status(404).json({
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
      console.error('Error en finalizarActividad:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
}

export default new ProporcionalidadController();