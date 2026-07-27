import { Request, Response } from 'express';
import nucleoService, { Pantalla } from '../services/nucleoService';

const PANTALLAS_VALIDAS: Pantalla[] = ['orden', 'media', 'mediana', 'moda', 'rango', 'decision'];

class NucleoController {
  async validarOrden(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, orden } = req.body;

      if (!id_estudiante || !Array.isArray(orden)) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, orden (arreglo).',
        });
        return;
      }

      const result = await nucleoService.validarOrden({
        id_estudiante: Number(id_estudiante),
        orden: orden.map((v: unknown) => Number(v)),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarOrden:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, valor } = req.body;

      if (!id_estudiante || valor === undefined || valor === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, valor',
        });
        return;
      }

      const result = await nucleoService.validarMedia({
        id_estudiante: Number(id_estudiante),
        valor: String(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarMedia:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarMediana(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, valor } = req.body;

      if (!id_estudiante || valor === undefined || valor === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, valor',
        });
        return;
      }

      const result = await nucleoService.validarMediana({
        id_estudiante: Number(id_estudiante),
        valor: String(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarMediana:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarModa(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, valor } = req.body;

      if (!id_estudiante || valor === undefined || valor === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, valor',
        });
        return;
      }

      const result = await nucleoService.validarModa({
        id_estudiante: Number(id_estudiante),
        valor: String(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarModa:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarRango(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, valor } = req.body;

      if (!id_estudiante || valor === undefined || valor === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, valor',
        });
        return;
      }

      const result = await nucleoService.validarRango({
        id_estudiante: Number(id_estudiante),
        valor: String(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarRango:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async enviarDecision(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, tiempo_total } = req.body;

      if (!id_estudiante) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante',
        });
        return;
      }

      const result = await nucleoService.enviarDecision(
        Number(id_estudiante),
        tiempo_total !== undefined ? Number(tiempo_total) : undefined
      );

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en enviarDecision:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async registrarConsultaPista(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, pantalla } = req.body;

      if (!id_estudiante || !PANTALLAS_VALIDAS.includes(pantalla)) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante o "pantalla" no es válida (orden, media, mediana, moda, rango, decision).',
        });
        return;
      }

      const result = await nucleoService.registrarConsultaPista(Number(id_estudiante), pantalla);

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

      const progreso = await nucleoService.obtenerProgreso(id_estudiante);

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

      const result = await nucleoService.reiniciarActividad(Number(id_estudiante));

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

export default new NucleoController();