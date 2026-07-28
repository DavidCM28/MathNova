import { Request, Response } from 'express';
import oraculoService, { Pantalla } from '../services/oraculoService';

const PANTALLAS_VALIDAS: Pantalla[] = ['espacio', 'orden', 'comparacion', 'prediccion'];

class OraculoController {
  async validarEspacio(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, colores } = req.body;

      if (!id_estudiante || !Array.isArray(colores)) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, colores (arreglo).',
        });
        return;
      }

      const result = await oraculoService.validarEspacio({
        id_estudiante: Number(id_estudiante),
        colores: colores.map((c: unknown) => String(c)),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarEspacio:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarPaso2(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, posible_imposible, num_resultados } = req.body;

      if (!id_estudiante || !posible_imposible || num_resultados === undefined || num_resultados === null) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, posible_imposible, num_resultados',
        });
        return;
      }

      const result = await oraculoService.validarPaso2({
        id_estudiante: Number(id_estudiante),
        posible_imposible: String(posible_imposible),
        num_resultados: String(num_resultados),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarPaso2:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

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

      const result = await oraculoService.validarOrden({
        id_estudiante: Number(id_estudiante),
        orden: orden.map((c: unknown) => String(c)),
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

  async validarComparacion(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, comp1, comp2 } = req.body;

      if (!id_estudiante || !comp1 || !comp2) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, comp1, comp2',
        });
        return;
      }

      const result = await oraculoService.validarComparacion({
        id_estudiante: Number(id_estudiante),
        comp1: String(comp1),
        comp2: String(comp2),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarComparacion:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async validarPrediccion(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, color } = req.body;

      if (!id_estudiante || !color) {
        res.status(200).json({
          success: false,
          mensaje: 'Faltan campos obligatorios: id_estudiante, color',
        });
        return;
      }

      const result = await oraculoService.validarPrediccion({
        id_estudiante: Number(id_estudiante),
        color: String(color),
      });

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en validarPrediccion:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async activarFinal(req: Request, res: Response): Promise<void> {
    try {
      const { id_estudiante, tiempo_total } = req.body;

      if (!id_estudiante) {
        res.status(200).json({
          success: false,
          mensaje: 'Falta id_estudiante',
        });
        return;
      }

      const result = await oraculoService.activarFinal(
        Number(id_estudiante),
        tiempo_total !== undefined ? Number(tiempo_total) : undefined
      );

      res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error en activarFinal:', error);
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
          mensaje: 'Falta id_estudiante o "pantalla" no es válida (espacio, orden, comparacion, prediccion).',
        });
        return;
      }

      const result = await oraculoService.registrarConsultaPista(Number(id_estudiante), pantalla);

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

      const progreso = await oraculoService.obtenerProgreso(id_estudiante);

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

      const result = await oraculoService.reiniciarActividad(Number(id_estudiante));

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

export default new OraculoController();