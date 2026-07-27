import { Request, Response } from 'express';
import sensorService, { Senal } from '../services/sensorService';

const SENALES_VALIDAS: Senal[] = ['alfa', 'beta', 'gamma', 'delta'];

class SensorController {
  async validarAbsoluta(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, senal, valor } = req.body;

      if (!id_estudiante || !senal || valor === undefined) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, senal, valor',
        });
        return;
      }

      if (!SENALES_VALIDAS.includes(senal)) {
        res.status(200).json({
          success: false,
          mensaje: 'La señal debe ser "alfa", "beta", "gamma" o "delta".',
        });
        return;
      }

      const result = await sensorService.validarAbsoluta({
        id_estudiante: Number(id_estudiante),
        senal,
        valor: Number(valor),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarAbsoluta:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarRelativa(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, senal, valorTexto } = req.body;

      if (!id_estudiante || !senal || valorTexto === undefined || valorTexto === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, senal, valorTexto',
        });
        return;
      }

      if (!SENALES_VALIDAS.includes(senal)) {
        res.status(200).json({
          success: false,
          mensaje: 'La señal debe ser "alfa", "beta", "gamma" o "delta".',
        });
        return;
      }

      const result = await sensorService.validarRelativa({
        id_estudiante: Number(id_estudiante),
        senal,
        valorTexto: String(valorTexto),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarRelativa:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async calcularZonaOrigen(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, pregunta_senal_frecuente, pregunta_zona_origen } = req.body;

      if (!id_estudiante || !pregunta_senal_frecuente || !pregunta_zona_origen) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios para calcular la zona de origen.',
        });
        return;
      }

      const result = await sensorService.calcularZonaOrigen({
        id_estudiante: Number(id_estudiante),
        pregunta_senal_frecuente: String(pregunta_senal_frecuente),
        pregunta_zona_origen: String(pregunta_zona_origen),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en calcularZonaOrigen:', error);
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

      if (!id_estudiante || (pantalla !== 4 && pantalla !== 6)) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante o "pantalla" debe ser 4 o 6.',
        });
        return;
      }

      const result = await sensorService.registrarConsultaPista(Number(id_estudiante), pantalla);

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

      const progreso = await sensorService.obtenerProgreso(id_estudiante);

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

      const result = await sensorService.reiniciarActividad(Number(id_estudiante));

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

export default new SensorController();