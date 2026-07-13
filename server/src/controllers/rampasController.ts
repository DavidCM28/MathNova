import { Request, Response } from 'express';
import rampasService from '../services/rampasService';

class RampasController {
  async verificarRespuestas(req: Request, res: Response): Promise<void> {
    try {
      const {
        id_estudiante,
        pendiente_ascenso,
        pendiente_descenso,
        ecuacion_ascenso,
        ecuacion_descenso,
        bitacora_pendiente_ascenso,
        bitacora_ecuacion_ascenso,
        bitacora_pendiente_descenso,
        bitacora_ecuacion_descenso,
        tiempo_total,
      } = req.body;

      if (
        !id_estudiante ||
        !pendiente_ascenso ||
        !pendiente_descenso ||
        ecuacion_ascenso === undefined ||
        ecuacion_descenso === undefined ||
        bitacora_pendiente_ascenso === undefined ||
        bitacora_ecuacion_ascenso === undefined ||
        bitacora_pendiente_descenso === undefined ||
        bitacora_ecuacion_descenso === undefined
      ) {
        // 200 en vez de 400: evita el "Failed to load resource" en consola.
        // Sigue siendo un rechazo real (success: false), solo cambia el código HTTP.
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios para verificar la actividad.',
        });
        return;
      }

      const result = await rampasService.verificarRespuestas({
        id_estudiante: Number(id_estudiante),
        pendiente_ascenso: String(pendiente_ascenso),
        pendiente_descenso: String(pendiente_descenso),
        ecuacion_ascenso: String(ecuacion_ascenso),
        ecuacion_descenso: String(ecuacion_descenso),
        bitacora_pendiente_ascenso: String(bitacora_pendiente_ascenso),
        bitacora_ecuacion_ascenso: String(bitacora_ecuacion_ascenso),
        bitacora_pendiente_descenso: String(bitacora_pendiente_descenso),
        bitacora_ecuacion_descenso: String(bitacora_ecuacion_descenso),
        tiempo_total: tiempo_total !== undefined ? Number(tiempo_total) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error en verificarRespuestas:', error);
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

      const progreso = await rampasService.obtenerProgreso(id_estudiante);

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

      const result = await rampasService.reiniciarActividad(Number(id_estudiante));

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

export default new RampasController();