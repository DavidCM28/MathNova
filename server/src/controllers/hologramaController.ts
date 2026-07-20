import { Request, Response } from 'express';
import hologramaService, { Modulo } from '../services/hologramaService';

const MODULOS_VALIDOS: Modulo[] = ['bosque', 'desierto', 'cueva'];

class HologramaController {
  async validarBarra(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, modulo, valor } = req.body;

      if (!id_estudiante || !modulo || valor === undefined) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, modulo, valor',
        });
        return;
      }

      if (!MODULOS_VALIDOS.includes(modulo)) {
        res.status(200).json({
          success: false,
          mensaje: 'El módulo debe ser "bosque", "desierto" o "cueva".',
        });
        return;
      }

      const result = await hologramaService.validarBarra({
        id_estudiante: Number(id_estudiante),
        modulo,
        valor: Number(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarBarra:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarSector(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, modulo, valor } = req.body;

      if (!id_estudiante || !modulo || valor === undefined) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, modulo, valor',
        });
        return;
      }

      if (!MODULOS_VALIDOS.includes(modulo)) {
        res.status(200).json({
          success: false,
          mensaje: 'El módulo debe ser "bosque", "desierto" o "cueva".',
        });
        return;
      }

      const result = await hologramaService.validarSector({
        id_estudiante: Number(id_estudiante),
        modulo,
        valor: Number(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarSector:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async activar(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, tipo_grafica, pregunta_barra_alta, pregunta_sector_mayor } = req.body;

      if (!id_estudiante || !tipo_grafica || !pregunta_barra_alta || !pregunta_sector_mayor) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios para activar el holograma.',
        });
        return;
      }

      const result = await hologramaService.activar({
        id_estudiante: Number(id_estudiante),
        tipo_grafica: String(tipo_grafica),
        pregunta_barra_alta: String(pregunta_barra_alta),
        pregunta_sector_mayor: String(pregunta_sector_mayor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en activar:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async registrarConsultaPista(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante } = req.body;

      if (!id_estudiante) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante',
        });
        return;
      }

      const result = await hologramaService.registrarConsultaPista(Number(id_estudiante));

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en registrarConsultaPista:', error);
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

      const progreso = await hologramaService.obtenerProgreso(id_estudiante);

      if (!progreso) {
        res.status(200).json({
          success: true,
          data: null,
          mensaje: 'No se encontró progreso para este estudiante',
        });
        return;
      }

      res.status(200).json({ success: true, data: progreso });

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

      const result = await hologramaService.reiniciarActividad(Number(id_estudiante));

      if (!result) {
        res.status(200).json({
          success: false,
          mensaje: 'No se encontró progreso para este estudiante',
        });
        return;
      }

      res.status(200).json({ success: true, data: result });

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

export default new HologramaController();