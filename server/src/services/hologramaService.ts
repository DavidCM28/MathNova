import { ActividadHolograma, ActividadTripulacion } from '../models';

export type Modulo = 'bosque' | 'desierto' | 'cueva';

export interface BarraRequest {
  id_estudiante: number;
  modulo: Modulo;
  valor: number;
}

export interface BarraResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista?: boolean;
  respuesta_correcta?: number;
  celda_completada?: boolean;
}

export interface SectorRequest {
  id_estudiante: number;
  modulo: Modulo;
  valor: number;
}

export interface SectorResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista?: boolean;
  respuesta_correcta?: number;
  celda_completada?: boolean;
}

export interface ActivarRequest {
  id_estudiante: number;
  tipo_grafica: string;
  pregunta_barra_alta: string;
  pregunta_sector_mayor: string;
}

export interface ActivarResponse {
  correcto: boolean;
  mensaje: string;
  completada?: boolean;
  xp_obtenido?: number;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class HologramaService {
  private readonly TIPO_GRAFICA_CORRECTO = 'barras';
  private readonly MODULO_GANADOR: Modulo = 'bosque';
  private readonly BOSQUE_FIJO = 4;
  private readonly TOTAL_VOTOS = 10;

  // Hereda los votos de la Actividad 3 (Tripulación) si el estudiante ya la
  // completó; si no, usa los valores fijos del documento como respaldo.
  private async obtenerVotosBase(id_estudiante: number): Promise<Record<Modulo, number>> {
    const progresoTripulacion = await ActividadTripulacion.findOne({
      where: { id_estudiante },
    });

    const valores = (progresoTripulacion?.valores_tabla || {}) as Record<string, number>;

    return {
      bosque: this.BOSQUE_FIJO, // nunca se le pregunta al estudiante en Tripulación
      desierto: valores.desierto ?? 3,
      cueva: valores.cueva ?? 3,
    };
  }

  private calcularPorcentajes(votos: Record<Modulo, number>): Record<Modulo, number> {
    return {
      bosque: Math.round((votos.bosque / this.TOTAL_VOTOS) * 100),
      desierto: Math.round((votos.desierto / this.TOTAL_VOTOS) * 100),
      cueva: Math.round((votos.cueva / this.TOTAL_VOTOS) * 100),
    };
  }

  private async obtenerOCrearProgreso(id_estudiante: number) {
    let progreso = await ActividadHolograma.findOne({ where: { id_estudiante } });

    if (!progreso) {
      progreso = await ActividadHolograma.create({
        id_estudiante,
        valores_barras: {},
        intentos_barras: {},
        valores_porcentajes: {},
        intentos_porcentajes: {},
        tipo_grafica_seleccionado: null,
        intentos_tipo_grafica: 0,
        pregunta_barra_alta: null,
        intentos_pregunta_barra: 0,
        pregunta_sector_mayor: null,
        intentos_pregunta_sector: 0,
        veces_pista_consultada: 0,
        completada: false,
        resultado_correcto: null,
        tiempo_total: 0,
        xp_obtenido: 0,
        historial_intentos: [],
      });
    }

    return progreso;
  }

  async validarBarra(data: BarraRequest): Promise<BarraResponse> {
    const { id_estudiante, modulo, valor } = data;

    if (!Number.isInteger(valor) || valor < 0 || valor > 10) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero válido.',
      };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const votosBase = await this.obtenerVotosBase(id_estudiante);
    const esperado = votosBase[modulo];

    const intentosBarras = { ...(progreso.intentos_barras as Record<string, number>) };
    const intentoActual = (intentosBarras[modulo] || 0) + 1;

    const esCorrecto = valor === esperado;

    intentosBarras[modulo] = intentoActual;

    // ✅ NUEVO: historial permanente por intento individual (sobrevive al reinicio)
    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'barra',
      modulo,
      valor,
      correcto: esCorrecto,
      intento: intentoActual,
    });

    await progreso.update({
      intentos_barras: intentosBarras,
      historial_intentos: historial,
    });

    if (esCorrecto) {
      const valoresBarras = { ...(progreso.valores_barras as Record<string, number>) };
      valoresBarras[modulo] = valor;
      await progreso.update({ valores_barras: valoresBarras });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: '¡Barra colocada correctamente!',
        celda_completada: true,
      };
    }

    if (intentoActual >= 3) {
      const valoresBarras = { ...(progreso.valores_barras as Record<string, number>) };
      valoresBarras[modulo] = esperado;
      await progreso.update({ valores_barras: valoresBarras });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Esta es la altura correcta. Obsérvala bien antes de continuar.',
        mostrar_pista: true,
        respuesta_correcta: esperado,
        celda_completada: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: los números de la tabla son exactamente la altura de cada barra.',
        mostrar_pista: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa la tabla: ¿cuántos votos tuvo ese módulo? Ese número es la altura de la barra.',
      celda_completada: false,
    };
  }

  async validarSector(data: SectorRequest): Promise<SectorResponse> {
    const { id_estudiante, modulo, valor } = data;

    if (!Number.isInteger(valor) || valor < 0 || valor > 100) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero del 1 al 100.',
      };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const votosBase = await this.obtenerVotosBase(id_estudiante);
    const porcentajesCorrectos = this.calcularPorcentajes(votosBase);
    const esperado = porcentajesCorrectos[modulo];

    const intentosPorcentajes = { ...(progreso.intentos_porcentajes as Record<string, number>) };
    const intentoActual = (intentosPorcentajes[modulo] || 0) + 1;

    const esCorrecto = valor === esperado;

    intentosPorcentajes[modulo] = intentoActual;

    // ✅ NUEVO: historial permanente por intento individual (sobrevive al reinicio)
    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'sector',
      modulo,
      valor,
      correcto: esCorrecto,
      intento: intentoActual,
    });

    await progreso.update({
      intentos_porcentajes: intentosPorcentajes,
      historial_intentos: historial,
    });

    if (esCorrecto) {
      const valoresPorcentajes = { ...(progreso.valores_porcentajes as Record<string, number>) };
      valoresPorcentajes[modulo] = valor;
      await progreso.update({ valores_porcentajes: valoresPorcentajes });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: '¡Sector correcto!',
        celda_completada: true,
      };
    }

    if (intentoActual >= 3) {
      const valoresPorcentajes = { ...(progreso.valores_porcentajes as Record<string, number>) };
      valoresPorcentajes[modulo] = esperado;
      await progreso.update({ valores_porcentajes: valoresPorcentajes });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Esta es la proporción correcta. Consérvala en mente para seguir adelante.',
        mostrar_pista: true,
        respuesta_correcta: esperado,
        celda_completada: true,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: `Pista: Bosque es 4 entre 10 por 100, igual a 40%. Usa la misma fórmula para los demás.`,
        mostrar_pista: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Recuerda la fórmula: votos entre 10, por 100. ¿Cuánto da para ese módulo?',
      celda_completada: false,
    };
  }

  async activar(data: ActivarRequest): Promise<ActivarResponse> {
    const { id_estudiante, tipo_grafica, pregunta_barra_alta, pregunta_sector_mayor } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const votosBase = await this.obtenerVotosBase(id_estudiante);

    const barrasOk = (['bosque', 'desierto', 'cueva'] as Modulo[]).every(
      (m) => (progreso.valores_barras as Record<string, number>)[m] === votosBase[m]
    );
    const porcentajesCorrectos = this.calcularPorcentajes(votosBase);
    const sectoresOk = (['bosque', 'desierto', 'cueva'] as Modulo[]).every(
      (m) => (progreso.valores_porcentajes as Record<string, number>)[m] === porcentajesCorrectos[m]
    );

    const tipoOk = tipo_grafica === this.TIPO_GRAFICA_CORRECTO;
    const barraAltaOk = pregunta_barra_alta === this.MODULO_GANADOR;
    const sectorMayorOk = pregunta_sector_mayor === this.MODULO_GANADOR;

    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'activar',
      tipo_grafica,
      pregunta_barra_alta,
      pregunta_sector_mayor,
      correcto: tipoOk && barraAltaOk && sectorMayorOk && barrasOk && sectoresOk,
    });

    const actualizacion: Record<string, unknown> = {
      tipo_grafica_seleccionado: tipo_grafica,
      intentos_tipo_grafica: progreso.intentos_tipo_grafica + 1,
      pregunta_barra_alta,
      intentos_pregunta_barra: progreso.intentos_pregunta_barra + 1,
      pregunta_sector_mayor,
      intentos_pregunta_sector: progreso.intentos_pregunta_sector + 1,
      historial_intentos: historial,
    };

    const todoCorrecto = tipoOk && barraAltaOk && sectorMayorOk && barrasOk && sectoresOk;

    if (todoCorrecto) {
      actualizacion.completada = true;
      actualizacion.resultado_correcto = true;
      actualizacion.xp_obtenido = 100;
    }

    await progreso.update(actualizacion);

    if (todoCorrecto) {
      return {
        correcto: true,
        mensaje: '¡Lo lograste, agente! El holograma está proyectado sobre la mesa de mando.',
        completada: true,
        xp_obtenido: 100,
      };
    }

    if (!barrasOk || !sectoresOk) {
      return {
        correcto: false,
        mensaje: 'Todavía hay barras o sectores sin completar correctamente. Revísalos antes de activar el holograma.',
      };
    }

    return {
      correcto: false,
      mensaje: '¿Qué barra o sector es más grande? Ese es el módulo con más votos.',
    };
  }

  async registrarConsultaPista(id_estudiante: number) {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    await progreso.update({
      veces_pista_consultada: progreso.veces_pista_consultada + 1,
    });
    return { veces_pista_consultada: progreso.veces_pista_consultada + 1 };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ActividadHolograma.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    return {
      valores_barras: progreso.valores_barras,
      intentos_barras: progreso.intentos_barras,
      valores_porcentajes: progreso.valores_porcentajes,
      intentos_porcentajes: progreso.intentos_porcentajes,
      tipo_grafica_seleccionado: progreso.tipo_grafica_seleccionado,
      pregunta_barra_alta: progreso.pregunta_barra_alta,
      pregunta_sector_mayor: progreso.pregunta_sector_mayor,
      veces_pista_consultada: progreso.veces_pista_consultada,
      completada: progreso.completada,
      resultado_correcto: progreso.resultado_correcto,
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // Reinicia los campos de trabajo Y los contadores de intentos de la
  // sesión actual (para dar 3 intentos frescos cada vez). El
  // historial_intentos y veces_pista_consultada NUNCA se borran: ahí
  // queda el registro permanente para el docente.
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ActividadHolograma.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      valores_barras: {},
      intentos_barras: {},              // ✅ NUEVO: se resetea
      valores_porcentajes: {},
      intentos_porcentajes: {},         // ✅ NUEVO: se resetea
      tipo_grafica_seleccionado: null,
      intentos_tipo_grafica: 0,         // ✅ NUEVO: se resetea
      pregunta_barra_alta: null,
      intentos_pregunta_barra: 0,       // ✅ NUEVO: se resetea
      pregunta_sector_mayor: null,
      intentos_pregunta_sector: 0,      // ✅ NUEVO: se resetea
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

export default new HologramaService();