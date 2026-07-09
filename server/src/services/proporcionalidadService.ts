import { ProporcionalidadInversa } from '../models';

export interface TablaRequest {
  id_estudiante: number;
  reactores: number;
  tiempo: number;
}

export interface TablaResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista?: boolean;
  respuesta_correcta?: number;
  celda_completada?: boolean;
}

export interface PrediccionRequest {
  id_estudiante: number;
  prediccion: number;
}

export interface PrediccionResponse {
  correcto: boolean;
  mensaje: string;
  intentos: number;
  respuesta_correcta?: number;
  completada?: boolean;
}

export interface ReiniciarResponse {
  mensaje: string;
  intentos_completados: number;
}

class ProporcionalidadService {
  private readonly CONSTANTE = 12;

  async validarTabla(data: TablaRequest): Promise<TablaResponse> {
    const { id_estudiante, reactores, tiempo } = data;

    if (reactores <= 0 || tiempo <= 0) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero mayor a 0.',
      };
    }

    let progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      progreso = await ProporcionalidadInversa.create({
        id_estudiante,
        valores_tabla: {},
        intentos_tabla: {},
        prediccion: null,
        prediccion_correcta: null,
        pantalla_actual: 3,
        completada: false,
        tiempo_total: 0,
        xp_obtenido: 0,
        intentos_completados: 0,
        historial_intentos: [],
      });
    }

    const intentosTabla = progreso.intentos_tabla as Record<string, number>;
    const clave = String(reactores);
    const intentoActual = (intentosTabla[clave] || 0) + 1;

    const esperado = this.CONSTANTE / reactores;
    const esCorrecto = tiempo === esperado;

    intentosTabla[clave] = intentoActual;
    await progreso.update({
      intentos_tabla: intentosTabla,
    });

    if (esCorrecto) {
      const valoresTabla = progreso.valores_tabla as Record<string, number>;
      valoresTabla[clave] = tiempo;
      await progreso.update({
        valores_tabla: valoresTabla,
        pantalla_actual: 4,
      });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: `✅ ¡Correcto! ${reactores} × ${tiempo} = ${this.CONSTANTE}`,
        celda_completada: true,
      };
    }

    if (intentoActual >= 3) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: `❌ La respuesta correcta es ${esperado}. Recuerda: reactores × tiempo = ${this.CONSTANTE}`,
        mostrar_pista: true,
        respuesta_correcta: esperado,
        celda_completada: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: '💡 Pista: reactores × tiempo siempre debe dar el mismo número. ¿Cuál es?',
        mostrar_pista: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: '❌ Revisa el valor. Recuerda que reactores × tiempo = 12',
      celda_completada: false,
    };
  }

  async validarPrediccion(data: PrediccionRequest): Promise<PrediccionResponse> {
    const { id_estudiante, prediccion } = data;

    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return {
        correcto: false,
        mensaje: '⚠️ No se encontró el progreso. Inicia la actividad primero.',
        intentos: 0,
      };
    }

    const intentosTabla = progreso.intentos_tabla as Record<string, number>;
    const clavePrediccion = 'prediccion';
    const intentoActual = (intentosTabla[clavePrediccion] || 0) + 1;

    const esCorrecto = prediccion === 6;

    intentosTabla[clavePrediccion] = intentoActual;
    await progreso.update({
      intentos_tabla: intentosTabla,
      prediccion: prediccion,
      prediccion_correcta: esCorrecto,
    });

    if (esCorrecto) {
      await progreso.update({
        pantalla_actual: 8,
        completada: true,
        xp_obtenido: 100,
      });

      return {
        correcto: true,
        mensaje: '🎉 ¡Misión completada! 6 × 2 = 12. ¡El escudo está activo!',
        intentos: intentoActual,
        completada: true,
      };
    }

    if (intentoActual >= 3) {
      await progreso.update({
        pantalla_actual: 8,
        completada: true,
        xp_obtenido: 50,
      });

      return {
        correcto: false,
        mensaje: '❌ La respuesta correcta es 6. Recuerda: 6 × 2 = 12. ¡Siempre la misma constante!',
        intentos: intentoActual,
        respuesta_correcta: 6,
        completada: true,
      };
    }

    return {
      correcto: false,
      mensaje: '💡 Recuerda: reactores × tiempo = 12. Si tiempo = 2, ¿cuánto es reactores?',
      intentos: intentoActual,
    };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    return {
      pantalla_actual: progreso.pantalla_actual,
      valores_tabla: progreso.valores_tabla,
      intentos_tabla: progreso.intentos_tabla,
      completada: progreso.completada,
      xp_obtenido: progreso.xp_obtenido,
      intentos_completados: progreso.intentos_completados,
    };
  }

  async guardarProgreso(id_estudiante: number, pantalla_actual: number) {
    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    await progreso.update({ pantalla_actual });
    return { pantalla_actual };
  }

  async finalizarActividad(id_estudiante: number, tiempo_total: number) {
    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      tiempo_total,
      completada: true,
    });

    return {
      mensaje: '🎉 Actividad completada. ¡Buen trabajo, agente!',
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // ✅ NUEVO: reiniciar actividad conservando el historial de intentos anteriores
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    const historial = (progreso.historial_intentos as any[]) || [];
    let nuevosIntentosCompletados = progreso.intentos_completados;

    // Solo archivamos en el historial si la actividad ya estaba completada
    if (progreso.completada) {
      historial.push({
        fecha: new Date().toISOString(),
        prediccion_correcta: progreso.prediccion_correcta,
        xp_obtenido: progreso.xp_obtenido,
        tiempo_total: progreso.tiempo_total,
        valores_tabla: progreso.valores_tabla,
      });
      nuevosIntentosCompletados = progreso.intentos_completados + 1;
    }

    await progreso.update({
      valores_tabla: {},
      intentos_tabla: {},
      prediccion: null,
      prediccion_correcta: null,
      pantalla_actual: 1,
      completada: false,
      tiempo_total: 0,
      xp_obtenido: 0,
      intentos_completados: nuevosIntentosCompletados,
      historial_intentos: historial,
    });

    return {
      mensaje: 'Actividad reiniciada, puedes intentarlo de nuevo.',
      intentos_completados: nuevosIntentosCompletados,
    };
  }
}

export default new ProporcionalidadService();