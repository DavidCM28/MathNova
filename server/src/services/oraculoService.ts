import { ActividadOraculo } from '../models';

export type Pantalla = 'espacio' | 'orden' | 'comparacion' | 'prediccion';

export interface EspacioRequest {
  id_estudiante: number;
  colores: string[];
}

export interface Paso2Request {
  id_estudiante: number;
  posible_imposible: string;
  num_resultados: string;
}

export interface OrdenRequest {
  id_estudiante: number;
  orden: string[];
}

export interface ComparacionRequest {
  id_estudiante: number;
  comp1: string;
  comp2: string;
}

export interface PrediccionRequest {
  id_estudiante: number;
  color: string;
}

export interface PasoResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista_bait?: boolean;
  celda_completada?: boolean;
  asistido?: boolean;
}

export interface ActivarFinalResponse {
  correcto: boolean;
  mensaje: string;
  completada?: boolean;
  xp_obtenido?: number;
  aciertos?: number;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class OraculoService {
  private readonly COLORES_CAPSULA = ['azul', 'verde', 'rojo', 'dorado'];
  private readonly ORDEN_CORRECTO = ['azul', 'verde', 'rojo', 'dorado'];
  private readonly RESPUESTA_ENUNCIADO_1 = 'verdadero';
  private readonly RESPUESTA_ENUNCIADO_2 = 'verdadero';
  private readonly PREDICCION_CORRECTA = 'azul';
  private readonly POSIBLE_MORADO_CORRECTO = 'imposible';
  private readonly NUM_RESULTADOS_CORRECTO = '4';

  private readonly LIMITE_INTENTOS = 3;

  private async obtenerOCrearProgreso(id_estudiante: number) {
    let progreso = await ActividadOraculo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      progreso = await ActividadOraculo.create({
        id_estudiante,
        espacio_valores: [],
        intentos_espacio: 0,
        espacio_asistido: false,
        posible_valor: null,
        num_resultados_valor: null,
        intentos_paso2: 0,
        paso2_asistido: false,
        orden_valores: [],
        intentos_orden: 0,
        orden_asistido: false,
        comp1_valor: null,
        comp2_valor: null,
        intentos_comparacion: 0,
        comparacion_asistida: false,
        prediccion_valor: null,
        intentos_prediccion: 0,
        prediccion_asistida: false,
        veces_pista_espacio: 0,
        veces_pista_orden: 0,
        veces_pista_comparacion: 0,
        veces_pista_prediccion: 0,
        mejor_aciertos: 0,
        completada: false,
        resultado_correcto: null,
        tiempo_total: 0,
        xp_obtenido: 0,
        historial_intentos: [],
      });
    }

    return progreso;
  }

  private async registrarHistorial(progreso: any, entrada: Record<string, unknown>) {
    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({ fecha: new Date().toISOString(), ...entrada });
    await progreso.update({ historial_intentos: historial });
  }

  private setsIguales(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    return b.every((x) => setA.has(x));
  }

  // ==========================================
  // PASO 1: ESPACIO MUESTRAL
  // ==========================================

  async validarEspacio(data: EspacioRequest): Promise<PasoResponse> {
    const { id_estudiante, colores } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const intentoActual = progreso.intentos_espacio + 1;
    const esCorrecto = this.setsIguales(colores, this.COLORES_CAPSULA);

    await this.registrarHistorial(progreso, { tipo: 'espacio', colores, correcto: esCorrecto, intento: intentoActual });
    await progreso.update({ intentos_espacio: intentoActual, espacio_valores: colores });

    if (esCorrecto) {
      return { correcto: true, intento: intentoActual, mensaje: '¡Correcto! Ese es el espacio muestral completo.', celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({ espacio_valores: this.COLORES_CAPSULA, espacio_asistido: true });
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Esta es la respuesta correcta.',
        celda_completada: true,
        asistido: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: observa solo los colores que en verdad están dentro de la cápsula, ignora los distractores.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa de nuevo la cápsula: hay colores que no pertenecen a ella.',
      celda_completada: false,
    };
  }

  // ==========================================
  // PASO 2: POSIBLE / IMPOSIBLE + CANTIDAD DE RESULTADOS
  // ==========================================

  async validarPaso2(data: Paso2Request): Promise<PasoResponse> {
    const { id_estudiante, posible_imposible, num_resultados } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const intentoActual = progreso.intentos_paso2 + 1;
    const esCorrecto =
      posible_imposible === this.POSIBLE_MORADO_CORRECTO &&
      num_resultados.trim() === this.NUM_RESULTADOS_CORRECTO;

    await this.registrarHistorial(progreso, {
      tipo: 'paso2', posible_imposible, num_resultados, correcto: esCorrecto, intento: intentoActual,
    });
    await progreso.update({
      intentos_paso2: intentoActual,
      posible_valor: posible_imposible,
      num_resultados_valor: num_resultados,
    });

    if (esCorrecto) {
      return { correcto: true, intento: intentoActual, mensaje: '¡Exacto! Morado no está en la cápsula, y hay 4 resultados posibles.', celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({
        posible_valor: this.POSIBLE_MORADO_CORRECTO,
        num_resultados_valor: this.NUM_RESULTADOS_CORRECTO,
        paso2_asistido: true,
      });
      return { correcto: false, intento: intentoActual, mensaje: 'Esta es la respuesta correcta.', celda_completada: true, asistido: true };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: morado no aparece entre los cristales de la cápsula, y el espacio muestral tiene 4 colores distintos.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa si morado realmente está dentro de la cápsula, y cuenta los colores diferentes.',
      celda_completada: false,
    };
  }

  // ==========================================
  // PASO 3: ORDEN DE PROBABILIDAD
  // ==========================================

  async validarOrden(data: OrdenRequest): Promise<PasoResponse> {
    const { id_estudiante, orden } = data;

    if (!Array.isArray(orden) || orden.length !== 4) {
      return { correcto: false, intento: 0, mensaje: 'El orden debe tener 4 colores.' };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const intentoActual = progreso.intentos_orden + 1;
    const esCorrecto = orden.every((c, i) => c === this.ORDEN_CORRECTO[i]);

    await this.registrarHistorial(progreso, { tipo: 'orden', orden, correcto: esCorrecto, intento: intentoActual });
    await progreso.update({ intentos_orden: intentoActual, orden_valores: orden });

    if (esCorrecto) {
      return { correcto: true, intento: intentoActual, mensaje: '¡Correcto! Ese es el orden de mayor a menor probabilidad.', celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({ orden_valores: this.ORDEN_CORRECTO, orden_asistido: true });
      return { correcto: false, intento: intentoActual, mensaje: 'Este es el orden correcto.', celda_completada: true, asistido: true };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: el color con más cristales es el más probable; el de menos, el menos probable.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa cuántos cristales tiene cada color y ordénalos de mayor a menor.',
      celda_completada: false,
    };
  }

  // ==========================================
  // PASO 4: COMPARACIÓN DE EVENTOS
  // ==========================================

  async validarComparacion(data: ComparacionRequest): Promise<PasoResponse> {
    const { id_estudiante, comp1, comp2 } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const intentoActual = progreso.intentos_comparacion + 1;
    const esCorrecto = comp1 === this.RESPUESTA_ENUNCIADO_1 && comp2 === this.RESPUESTA_ENUNCIADO_2;

    await this.registrarHistorial(progreso, { tipo: 'comparacion', comp1, comp2, correcto: esCorrecto, intento: intentoActual });
    await progreso.update({ intentos_comparacion: intentoActual, comp1_valor: comp1, comp2_valor: comp2 });

    if (esCorrecto) {
      return { correcto: true, intento: intentoActual, mensaje: '¡Ambas comparaciones son correctas!', celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({
        comp1_valor: this.RESPUESTA_ENUNCIADO_1,
        comp2_valor: this.RESPUESTA_ENUNCIADO_2,
        comparacion_asistida: true,
      });
      return { correcto: false, intento: intentoActual, mensaje: 'Estas son las respuestas correctas.', celda_completada: true, asistido: true };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: compara la cantidad de cristales de cada color (azul: 4, verde: 3, rojo: 2, dorado: 1).',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa ambos enunciados comparando cuántos cristales tiene cada color.',
      celda_completada: false,
    };
  }

  // ==========================================
  // PASO 5: PREDICCIÓN
  // ==========================================

  async validarPrediccion(data: PrediccionRequest): Promise<PasoResponse> {
    const { id_estudiante, color } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const intentoActual = progreso.intentos_prediccion + 1;
    const esCorrecto = color === this.PREDICCION_CORRECTA;

    await this.registrarHistorial(progreso, { tipo: 'prediccion', color, correcto: esCorrecto, intento: intentoActual });
    await progreso.update({ intentos_prediccion: intentoActual, prediccion_valor: color });

    if (esCorrecto) {
      return { correcto: true, intento: intentoActual, mensaje: '¡Buena predicción! Azul tiene más cristales que cualquier otro color.', celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({ prediccion_valor: this.PREDICCION_CORRECTA, prediccion_asistida: true });
      return { correcto: false, intento: intentoActual, mensaje: 'La predicción con más respaldo es azul.', celda_completada: true, asistido: true };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: el color más probable es el que tiene más cristales dentro de la cápsula.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: '¿Qué color tiene más cristales? Ese es el más probable de salir.',
      celda_completada: false,
    };
  }

  // ==========================================
  // ACTIVAR ORÁCULO (envío final)
  // ==========================================

  async activarFinal(id_estudiante: number, tiempo_total?: number): Promise<ActivarFinalResponse> {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    const espacioOk = this.setsIguales(progreso.espacio_valores as string[], this.COLORES_CAPSULA);
    const paso2Ok =
      progreso.posible_valor === this.POSIBLE_MORADO_CORRECTO &&
      progreso.num_resultados_valor === this.NUM_RESULTADOS_CORRECTO;
    const ordenOk = (progreso.orden_valores as string[]).every((c, i) => c === this.ORDEN_CORRECTO[i]);
    const comparacionOk =
      progreso.comp1_valor === this.RESPUESTA_ENUNCIADO_1 && progreso.comp2_valor === this.RESPUESTA_ENUNCIADO_2;
    const prediccionOk = progreso.prediccion_valor === this.PREDICCION_CORRECTA;

    const aciertos = [espacioOk, paso2Ok, ordenOk, comparacionOk, prediccionOk].filter(Boolean).length;
    const todoCorrecto = aciertos === 5;

    await this.registrarHistorial(progreso, { tipo: 'activar_final', aciertos, correcto: todoCorrecto });

    const actualizacion: Record<string, unknown> = {};

    if (aciertos > progreso.mejor_aciertos) {
      actualizacion.mejor_aciertos = aciertos;
    }

    if (typeof tiempo_total === 'number' && tiempo_total >= 0) {
      actualizacion.tiempo_total = tiempo_total;
    }

    if (todoCorrecto) {
      actualizacion.completada = true;
      actualizacion.resultado_correcto = true;
      actualizacion.xp_obtenido = 100;
    }

    await progreso.update(actualizacion);

    if (todoCorrecto) {
      return {
        correcto: true,
        mensaje: '¡El Oráculo se activó con éxito! Tu análisis fue correcto.',
        completada: true,
        xp_obtenido: 100,
        aciertos,
      };
    }

    return {
      correcto: false,
      mensaje: 'El Oráculo aún necesita que corrijas algunos pasos antes de activarse.',
      aciertos,
    };
  }

  async registrarConsultaPista(id_estudiante: number, pantalla: Pantalla) {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const campo = `veces_pista_${pantalla}` as const;
    await progreso.update({ [campo]: (progreso[campo] as number) + 1 });
    return { [campo]: (progreso[campo] as number) + 1 };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ActividadOraculo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    return {
      espacio_valores: progreso.espacio_valores,
      espacio_asistido: progreso.espacio_asistido,
      posible_valor: progreso.posible_valor,
      num_resultados_valor: progreso.num_resultados_valor,
      paso2_asistido: progreso.paso2_asistido,
      orden_valores: progreso.orden_valores,
      orden_asistido: progreso.orden_asistido,
      comp1_valor: progreso.comp1_valor,
      comp2_valor: progreso.comp2_valor,
      comparacion_asistida: progreso.comparacion_asistida,
      prediccion_valor: progreso.prediccion_valor,
      prediccion_asistida: progreso.prediccion_asistida,
      mejor_aciertos: progreso.mejor_aciertos,
      completada: progreso.completada,
      resultado_correcto: progreso.resultado_correcto,
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // Reinicia los campos de trabajo Y los contadores de intentos de la
  // sesión actual. mejor_aciertos, historial_intentos y las consultas de
  // pista NUNCA se borran: quedan como registro permanente para el docente.
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ActividadOraculo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      espacio_valores: [],
      intentos_espacio: 0,
      espacio_asistido: false,
      posible_valor: null,
      num_resultados_valor: null,
      intentos_paso2: 0,
      paso2_asistido: false,
      orden_valores: [],
      intentos_orden: 0,
      orden_asistido: false,
      comp1_valor: null,
      comp2_valor: null,
      intentos_comparacion: 0,
      comparacion_asistida: false,
      prediccion_valor: null,
      intentos_prediccion: 0,
      prediccion_asistida: false,
      completada: false,
      resultado_correcto: null,
      tiempo_total: 0,
      xp_obtenido: 0,
    });

    return { mensaje: 'Actividad reiniciada, puedes intentarlo de nuevo.' };
  }
}

export default new OraculoService();