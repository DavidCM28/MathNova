import {
  ProporcionalidadInversa,
  ActividadRampas,
  ActividadTripulacion,
  ActividadHolograma,
} from '../models';

export interface EstadoActividades {
  proporcionalidad: boolean;
  rampas: boolean;
  tripulacion: boolean;
  holograma: boolean;
}

class ProgresoGeneralService {
  // Consulta las 4 actividades de una sola vez para un estudiante, y
  // devuelve si cada una está completada. Si el estudiante nunca ha
  // tocado una actividad, no existe fila para ella todavía, así que se
  // considera "no completada" (false), no un error.
  async obtenerEstadoActividades(id_estudiante: number): Promise<EstadoActividades> {
    const [proporcionalidad, rampas, tripulacion, holograma] = await Promise.all([
      ProporcionalidadInversa.findOne({ where: { id_estudiante } }),
      ActividadRampas.findOne({ where: { id_estudiante } }),
      ActividadTripulacion.findOne({ where: { id_estudiante } }),
      ActividadHolograma.findOne({ where: { id_estudiante } }),
    ]);

    return {
      proporcionalidad: proporcionalidad?.completada ?? false,
      rampas: rampas?.completada ?? false,
      tripulacion: tripulacion?.completada ?? false,
      holograma: holograma?.completada ?? false,
    };
  }
}

export default new ProgresoGeneralService();