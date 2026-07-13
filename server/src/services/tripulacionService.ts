import { ActividadTripulacion } from '../models';

export interface CeldaRequest {
  id_estudiante: number;
  celda: 'desierto' | 'cueva';
  valor: number;
}

export interface CeldaResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista?: boolean;
  respuesta_correcta?: number;
  celda_completada?: boolean;
}

export interface ModuloRequest {
  id_estudiante: number;
  modulo: string;
}

export interface ModuloResponse {
  correcto: boolean;
  mensaje: string;
  intentos: number;
  completada?: boolean;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class TripulacionService {
  // Datos fijos de la encuesta según el documento de especificación
  private readonly FRECUENCIAS_CORRECTAS: Record<string, number> = {
    bosque: 4,
    desierto: 3,
    cueva: 3,
  };

  private readonly MODULO_GANADOR = 'bosque';

  async validarCelda(data: CeldaRequest): Promise<CeldaResponse> {
    const { id_estudiante, celda, valor } = data;

    if (!Number.isInteger(valor) || valor < 1 || valor > 10) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero del 1 al 10.',
      };
    }

    let progreso = await ActividadTripulacion.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      progreso = await ActividadTripulacion.create({
        id_estudiante,
        valores_tabla: {},
        intentos_tabla: {},
        modulo_seleccionado: null,
        intentos_modulo: 0,
        completada: false,
        resultado_correcto: null,
        tiempo_total: 0,
        xp_obtenido: 0,
        historial_intentos: [],
      });
    }

    // Clonamos el objeto (no mutamos la referencia original) para que
    // Sequelize detecte el cambio y lo guarde en la base de datos.
    const intentosTabla = { ...(progreso.intentos_tabla as Record<string, number>) };
    const intentoActual = (intentosTabla[celda] || 0) + 1;

    const esperado = this.FRECUENCIAS_CORRECTAS[celda];
    const esCorrecto = valor === esperado;

    intentosTabla[celda] = intentoActual;
    await progreso.update({
      intentos_tabla: intentosTabla,
    });

    if (esCorrecto) {
      const valoresTabla = { ...(progreso.valores_tabla as Record<string, number>) };
      valoresTabla[celda] = valor;
      await progreso.update({
        valores_tabla: valoresTabla,
      });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: `¡Correcto! ${celda === 'desierto' ? 'El Desierto' : 'La Cueva de Cristal'} recibió ${valor} votos.`,
        celda_completada: true,
      };
    }

    if (intentoActual >= 3) {
      // Al 3er intento fallido se revela la respuesta y la celda queda bloqueada
      const valoresTabla = { ...(progreso.valores_tabla as Record<string, number>) };
      valoresTabla[celda] = esperado;
      await progreso.update({
        valores_tabla: valoresTabla,
      });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: '¡Esta es la respuesta. Obsérvala bien!',
        mostrar_pista: true,
        respuesta_correcta: esperado,
        celda_completada: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: observa la columna de palitos. Cada grupo de 4 palitos con una diagonal es 5 votos.',
        mostrar_pista: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: celda === 'desierto'
        ? 'Revisa el conteo del Desierto. ¿Cuántos palitos ves?'
        : 'Cuenta los votos de la Cueva de Cristal con cuidado.',
      celda_completada: false,
    };
  }

  async validarModulo(data: ModuloRequest): Promise<ModuloResponse> {
    const { id_estudiante, modulo } = data;

    const progreso = await ActividadTripulacion.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return {
        correcto: false,
        mensaje: 'No se encontró el progreso. Inicia la actividad primero.',
        intentos: 0,
      };
    }

    const intentoActual = progreso.intentos_modulo + 1;
    const esCorrecto = modulo === this.MODULO_GANADOR;

    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      modulo_intentado: modulo,
      correcto: esCorrecto,
    });

    const actualizacion: Record<string, unknown> = {
      modulo_seleccionado: modulo,
      intentos_modulo: intentoActual,
      historial_intentos: historial,
    };

    if (esCorrecto) {
      actualizacion.completada = true;
      actualizacion.resultado_correcto = true;
      actualizacion.xp_obtenido = 100;
    }

    await progreso.update(actualizacion);

    if (esCorrecto) {
      return {
        correcto: true,
        mensaje: '¡Exacto! El Bosque fue el módulo más votado con 4 votos. ¡La ruta está aprobada por el Centro de Mando!',
        intentos: intentoActual,
        completada: true,
      };
    }

    return {
      correcto: false,
      mensaje: 'Revisa la tabla: ¿qué módulo tiene el número mayor de votos?',
      intentos: intentoActual,
    };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ActividadTripulacion.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    return {
      valores_tabla: progreso.valores_tabla,
      intentos_tabla: progreso.intentos_tabla,
      modulo_seleccionado: progreso.modulo_seleccionado,
      intentos_modulo: progreso.intentos_modulo,
      completada: progreso.completada,
      resultado_correcto: progreso.resultado_correcto,
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // Reinicia los campos de trabajo; intentos_tabla, intentos_modulo e
  // historial_intentos se conservan como registro acumulado para el docente.
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ActividadTripulacion.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      valores_tabla: {},
      modulo_seleccionado: null,
      completada: false,
      resultado_correcto: null,
      tiempo_total: 0,
      xp_obtenido: 0,
    });

    return {
      mensaje: 'Actividad reiniciada, puedes intentarlo de nuevo.',
    };
  }
}

export default new TripulacionService();