import { ActividadNucleo } from '../models';

export type Pantalla = 'orden' | 'media' | 'mediana' | 'moda' | 'rango' | 'decision';

export interface OrdenRequest {
  id_estudiante: number;
  orden: number[];
}

export interface OrdenResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista_bait?: boolean;
  celda_completada?: boolean;
  posiciones_correctas: boolean[];
  posiciones_pista?: boolean[];
}

export interface CampoRequest {
  id_estudiante: number;
  valor: string;
}

export interface CampoResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista_bait?: boolean;
  celda_completada?: boolean;
  respuesta_correcta?: string;
}

export interface EnviarDecisionResponse {
  correcto: boolean;
  mensaje: string;
  completada?: boolean;
  xp_obtenido?: number;
  aciertos?: number;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class NucleoService {
  private readonly SECUENCIA_CORRECTA = [44, 44, 48, 52, 58, 60];
  private readonly MEDIA_CORRECTA = '51';
  private readonly MEDIANA_CORRECTA = '50';
  private readonly MODA_CORRECTA = '44';
  private readonly RANGO_CORRECTA = '16';

  private readonly LIMITE_INTENTOS = 3;

  private async obtenerOCrearProgreso(id_estudiante: number) {
    let progreso = await ActividadNucleo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      progreso = await ActividadNucleo.create({
        id_estudiante,
        orden_valores: [],
        orden_posiciones_correctas: [],
        intentos_orden: 0,
        orden_asistido: false,
        valor_media: null,
        intentos_media: 0,
        media_asistida: false,
        valor_mediana: null,
        intentos_mediana: 0,
        mediana_asistida: false,
        valor_moda: null,
        intentos_moda: 0,
        moda_asistida: false,
        valor_rango: null,
        intentos_rango: 0,
        rango_asistida: false,
        veces_pista_orden: 0,
        veces_pista_media: 0,
        veces_pista_mediana: 0,
        veces_pista_moda: 0,
        veces_pista_rango: 0,
        veces_pista_decision: 0,
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

  // ==========================================
  // PASO: ORDENAR (arreglo completo, un solo intento por revisión)
  // ==========================================

  async validarOrden(data: OrdenRequest): Promise<OrdenResponse> {
    const { id_estudiante, orden } = data;

    if (!Array.isArray(orden) || orden.length !== 6) {
      return { correcto: false, intento: 0, mensaje: 'El orden debe tener 6 valores.', posiciones_correctas: [] };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    // Una posición que ya fue correcta alguna vez permanece correcta
    // (no se puede "desmarcar" moviendo las demás).
    const posicionesPrevias = (progreso.orden_posiciones_correctas as boolean[] | null) || [];
    const posicionesCorrectas = orden.map(
      (v, i) => Boolean(posicionesPrevias[i]) || v === this.SECUENCIA_CORRECTA[i]
    );

    const todoCorrecto = posicionesCorrectas.every(Boolean);
    const intentoActual = progreso.intentos_orden + 1;

    await this.registrarHistorial(progreso, {
      tipo: 'orden',
      orden,
      posicionesCorrectas,
      correcto: todoCorrecto,
      intento: intentoActual,
    });

    await progreso.update({
      intentos_orden: intentoActual,
      orden_valores: orden,
      orden_posiciones_correctas: posicionesCorrectas,
    });

    if (todoCorrecto) {
      return {
        correcto: true,
        intento: intentoActual,
        mensaje: '¡Datos ordenados! Ahora podemos analizarlos.',
        celda_completada: true,
        posiciones_correctas: posicionesCorrectas,
      };
    }

    // Nunca se revela ni se auto-acomoda: solo escalamos la intensidad
    // de la pista. El estudiante siempre coloca las tarjetas él mismo.
    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({ orden_asistido: true });
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Fíjate bien: estas posiciones todavía no son correctas. Muévelas con cuidado.',
        celda_completada: false,
        posiciones_correctas: posicionesCorrectas,
        posiciones_pista: posicionesCorrectas.map((c) => !c),
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: 44 es el valor menor y 60 es el mayor. Ubícalos primero.',
        mostrar_pista_bait: true,
        celda_completada: false,
        posiciones_correctas: posicionesCorrectas,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa qué número debe ir primero y cuál después.',
      celda_completada: false,
      posiciones_correctas: posicionesCorrectas,
    };
  }

  // ==========================================
  // Validador genérico reutilizable para media, mediana, moda y rango
  // ==========================================

  private async validarCampoSimple(
    id_estudiante: number,
    campo: 'media' | 'mediana' | 'moda' | 'rango',
    valorTexto: string,
    respuestaCorrecta: string,
    mensajes: { intento1: string; pistaBait: string; revelado: string; correcto: string }
  ): Promise<CampoResponse> {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    const campoIntentos = `intentos_${campo}` as const;
    const campoValor = `valor_${campo}` as const;
    const campoAsistido = campo === 'media' ? 'media_asistida'
      : campo === 'mediana' ? 'mediana_asistida'
      : campo === 'moda' ? 'moda_asistida'
      : 'rango_asistida';

    const intentoActual = (progreso[campoIntentos] as number) + 1;
    const texto = valorTexto.trim();
    const esCorrecto = texto === respuestaCorrecta;

    await this.registrarHistorial(progreso, { tipo: campo, valor: texto, correcto: esCorrecto, intento: intentoActual });

    if (esCorrecto) {
      await progreso.update({ [campoIntentos]: intentoActual, [campoValor]: texto });
      return { correcto: true, intento: intentoActual, mensaje: mensajes.correcto, celda_completada: true };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      await progreso.update({
        [campoIntentos]: intentoActual,
        [campoValor]: respuestaCorrecta,
        [campoAsistido]: true,
      });
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: mensajes.revelado,
        celda_completada: true,
        respuesta_correcta: respuestaCorrecta,
      };
    }

    await progreso.update({ [campoIntentos]: intentoActual });

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: mensajes.pistaBait,
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: mensajes.intento1,
      celda_completada: false,
    };
  }

  async validarMedia(data: CampoRequest): Promise<CampoResponse> {
    return this.validarCampoSimple(data.id_estudiante, 'media', data.valor, this.MEDIA_CORRECTA, {
      intento1: 'Revisa la suma de los seis tiempos y divídela entre seis.',
      pistaBait: 'Pista: suma los seis tiempos (306) y divide el resultado entre 6, porque hay seis expediciones.',
      revelado: '¡Esta es la media correcta! 306 entre 6 es 51 minutos.',
      correcto: '¡Exacto! 306 entre 6 es 51 minutos.',
    });
  }

  async validarMediana(data: CampoRequest): Promise<CampoResponse> {
    return this.validarCampoSimple(data.id_estudiante, 'mediana', data.valor, this.MEDIANA_CORRECTA, {
      intento1: 'Con seis datos ordenados, usa el tercero y el cuarto valor.',
      pistaBait: 'Pista: los dos valores centrales son 48 y 52. Promédialos: (48 + 52) ÷ 2.',
      revelado: '¡Esta es la mediana correcta! El promedio de 48 y 52 es 50.',
      correcto: '¡Bien! El promedio de 48 y 52 es 50.',
    });
  }

  async validarModa(data: CampoRequest): Promise<CampoResponse> {
    return this.validarCampoSimple(data.id_estudiante, 'moda', data.valor, this.MODA_CORRECTA, {
      intento1: 'Cuenta cuántas veces aparece cada tiempo en el registro.',
      pistaBait: 'Pista: el 44 aparece dos veces; los demás tiempos solo aparecen una vez.',
      revelado: '¡Esta es la moda correcta! 44 es el único tiempo que se repite.',
      correcto: '¡Correcto! 44 es el único tiempo que se repite.',
    });
  }

  async validarRango(data: CampoRequest): Promise<CampoResponse> {
    return this.validarCampoSimple(data.id_estudiante, 'rango', data.valor, this.RANGO_CORRECTA, {
      intento1: 'Resta el tiempo menor al tiempo mayor.',
      pistaBait: 'Pista: el valor mínimo es 44 y el máximo es 60. Calcula 60 − 44.',
      revelado: '¡Este es el rango correcto! 60 menos 44 es 16.',
      correcto: '¡Perfecto! 60 menos 44 es 16.',
    });
  }

  // ==========================================
  // ENVÍO FINAL DE LA DECISIÓN
  // ==========================================

  async enviarDecision(id_estudiante: number, tiempo_total?: number): Promise<EnviarDecisionResponse> {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    const posicionesOrden = (progreso.orden_posiciones_correctas as boolean[]) || [];
    const ordenOk = posicionesOrden.length === 6 && posicionesOrden.every(Boolean);
    const mediaOk = progreso.valor_media === this.MEDIA_CORRECTA;
    const medianaOk = progreso.valor_mediana === this.MEDIANA_CORRECTA;
    const modaOk = progreso.valor_moda === this.MODA_CORRECTA;
    const rangoOk = progreso.valor_rango === this.RANGO_CORRECTA;

    const aciertos = [ordenOk, mediaOk, medianaOk, modaOk, rangoOk].filter(Boolean).length;
    const todoCorrecto = aciertos === 5;

    await this.registrarHistorial(progreso, { tipo: 'enviar_decision', aciertos, correcto: todoCorrecto });

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
        mensaje: '¡Decisión autorizada, agente! Estimamos una misión de 51 minutos y cargamos 16 minutos adicionales de reserva. La nave está preparada para operar durante 67 minutos.',
        completada: true,
        xp_obtenido: 100,
        aciertos,
      };
    }

    return {
      correcto: false,
      mensaje: 'El Núcleo aún necesita completar los campos señalados antes de autorizar la energía.',
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
    const progreso = await ActividadNucleo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    return {
      orden_valores: progreso.orden_valores,
      orden_posiciones_correctas: progreso.orden_posiciones_correctas,
      intentos_orden: progreso.intentos_orden,
      orden_asistido: progreso.orden_asistido,
      valor_media: progreso.valor_media,
      media_asistida: progreso.media_asistida,
      valor_mediana: progreso.valor_mediana,
      mediana_asistida: progreso.mediana_asistida,
      valor_moda: progreso.valor_moda,
      moda_asistida: progreso.moda_asistida,
      valor_rango: progreso.valor_rango,
      rango_asistida: progreso.rango_asistida,
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
    const progreso = await ActividadNucleo.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      orden_valores: [],
      orden_posiciones_correctas: [],
      intentos_orden: 0,
      orden_asistido: false,
      valor_media: null,
      intentos_media: 0,
      media_asistida: false,
      valor_mediana: null,
      intentos_mediana: 0,
      mediana_asistida: false,
      valor_moda: null,
      intentos_moda: 0,
      moda_asistida: false,
      valor_rango: null,
      intentos_rango: 0,
      rango_asistida: false,
      completada: false,
      resultado_correcto: null,
      tiempo_total: 0,
      xp_obtenido: 0,
    });

    return { mensaje: 'Actividad reiniciada, puedes intentarlo de nuevo.' };
  }
}

export default new NucleoService();