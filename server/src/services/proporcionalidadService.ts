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
  asistido?: boolean;
}

export interface PrediccionRequest {
  id_estudiante: number;
  prediccion: number;
  tiempo_total?: number;
}

export interface PrediccionResponse {
  correcto: boolean;
  mensaje: string;
  intentos: number;
  respuesta_correcta?: number;
  completada?: boolean;
  asistido?: boolean;
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
        mensaje: 'Ingresa un n\u00famero entero mayor a 0.',
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
        celdas_asistidas: {},
        prediccion: null,
        prediccion_correcta: null,
        prediccion_asistida: false,
        pantalla_actual: 3,
        completada: false,
        tiempo_total: 0,
        xp_obtenido: 0,
        intentos_completados: 0,
        historial_intentos: [],
      });
    }

    const intentosTabla = { ...(progreso.intentos_tabla as Record<string, number>) };
    const clave = String(reactores);
    const intentoActual = (intentosTabla[clave] || 0) + 1;

    const esperado = this.CONSTANTE / reactores;
    const esCorrecto = tiempo === esperado;

    intentosTabla[clave] = intentoActual;
    await progreso.update({
      intentos_tabla: intentosTabla,
    });

    if (esCorrecto) {
      const valoresTabla = { ...(progreso.valores_tabla as Record<string, number>) };
      valoresTabla[clave] = tiempo;
      await progreso.update({
        valores_tabla: valoresTabla,
        pantalla_actual: 4,
      });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: `\u2705 \u00a1Correcto! ${reactores} \u00d7 ${tiempo} = ${this.CONSTANTE}`,
        celda_completada: true,
      };
    }

    if (intentoActual >= 3) {
      // \u2705 CORREGIDO: ahora s\u00ed se guarda el valor revelado (antes se
      // perd\u00eda al recargar la p\u00e1gina), y se marca la celda como
      // "asistida" para pintarla en naranja en vez de tratarla como error.
      const valoresTabla = { ...(progreso.valores_tabla as Record<string, number>) };
      valoresTabla[clave] = esperado;

      const celdasAsistidas = { ...(progreso.celdas_asistidas as Record<string, boolean>) };
      celdasAsistidas[clave] = true;

      await progreso.update({
        valores_tabla: valoresTabla,
        celdas_asistidas: celdasAsistidas,
        pantalla_actual: 4,
      });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: `\u2705 Esta es la respuesta correcta: ${esperado}. Recuerda: reactores \u00d7 tiempo = ${this.CONSTANTE}`,
        mostrar_pista: true,
        respuesta_correcta: esperado,
        celda_completada: true,
        asistido: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: '\ud83d\udca1 Pista: reactores \u00d7 tiempo siempre debe dar el mismo n\u00famero. \u00bfCu\u00e1l es?',
        mostrar_pista: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: '\u274c Revisa el valor. Recuerda que reactores \u00d7 tiempo = 12',
      celda_completada: false,
    };
  }

  async validarPrediccion(data: PrediccionRequest): Promise<PrediccionResponse> {
    const { id_estudiante, prediccion, tiempo_total } = data;

    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return {
        correcto: false,
        mensaje: '\u26a0\ufe0f No se encontr\u00f3 el progreso. Inicia la actividad primero.',
        intentos: 0,
      };
    }

    const intentosTabla = { ...(progreso.intentos_tabla as Record<string, number>) };
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
        ...(typeof tiempo_total === 'number' && tiempo_total >= 0 ? { tiempo_total } : {}),
      });

      return {
        correcto: true,
        mensaje: '\ud83c\udf89 \u00a1Misi\u00f3n completada! 6 \u00d7 2 = 12. \u00a1El escudo est\u00e1 activo!',
        intentos: intentoActual,
        completada: true,
      };
    }

    if (intentoActual >= 3) {
      // \u2705 CORREGIDO: antes esto mandaba a la pantalla de "fallo"
      // (completada=true pero prediccion_correcta=false) y daba solo 50
      // XP. Ahora, igual que en las dem\u00e1s actividades, "asistido"
      // cuenta como completado con \u00e9xito (color naranja, mismo XP).
      await progreso.update({
        pantalla_actual: 8,
        completada: true,
        prediccion_asistida: true,
        xp_obtenido: 100,
        ...(typeof tiempo_total === 'number' && tiempo_total >= 0 ? { tiempo_total } : {}),
      });

      return {
        correcto: false,
        mensaje: '\u2705 Esta es la respuesta correcta: 6. Recuerda: 6 \u00d7 2 = 12. \u00a1Siempre la misma constante!',
        intentos: intentoActual,
        respuesta_correcta: 6,
        completada: true,
        asistido: true,
      };
    }

    return {
      correcto: false,
      mensaje: '\ud83d\udca1 Recuerda: reactores \u00d7 tiempo = 12. Si tiempo = 2, \u00bfcu\u00e1nto es reactores?',
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
      celdas_asistidas: progreso.celdas_asistidas,
      prediccion: progreso.prediccion,
      prediccion_correcta: progreso.prediccion_correcta,
      prediccion_asistida: progreso.prediccion_asistida,
      completada: progreso.completada,
      xp_obtenido: progreso.xp_obtenido,
      tiempo_total: progreso.tiempo_total,
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
      mensaje: '\ud83c\udf89 Actividad completada. \u00a1Buen trabajo, agente!',
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // \u2705 reiniciar actividad conservando el historial de intentos anteriores
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ProporcionalidadInversa.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    const historial = (progreso.historial_intentos as any[]) || [];
    let nuevosIntentosCompletados = progreso.intentos_completados;

    if (progreso.completada) {
      historial.push({
        fecha: new Date().toISOString(),
        prediccion_correcta: progreso.prediccion_correcta,
        prediccion_asistida: progreso.prediccion_asistida,
        xp_obtenido: progreso.xp_obtenido,
        tiempo_total: progreso.tiempo_total,
        valores_tabla: progreso.valores_tabla,
      });
      nuevosIntentosCompletados = progreso.intentos_completados + 1;
    }

    await progreso.update({
      valores_tabla: {},
      intentos_tabla: {},
      celdas_asistidas: {},
      prediccion: null,
      prediccion_correcta: null,
      prediccion_asistida: false,
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