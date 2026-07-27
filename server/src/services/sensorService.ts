import { ActividadSensor } from '../models';

export type Senal = 'alfa' | 'beta' | 'gamma' | 'delta';
export type Zona = 'norte' | 'sur' | 'este' | 'oeste';

export interface AbsolutaRequest {
  id_estudiante: number;
  senal: Senal;
  valor: number;
}

export interface AbsolutaResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista_bait?: boolean;
  celda_completada?: boolean;
  respuesta_correcta?: number;
}

export interface RelativaRequest {
  id_estudiante: number;
  senal: Senal;
  valorTexto: string;
}

export interface RelativaResponse {
  correcto: boolean;
  intento: number;
  mensaje: string;
  mostrar_pista_bait?: boolean;
  celda_completada?: boolean;
  respuesta_correcta?: string;
  error_formato?: boolean;
}

export interface CalcularZonaRequest {
  id_estudiante: number;
  pregunta_senal_frecuente: string;
  pregunta_zona_origen: string;
}

export interface CalcularZonaResponse {
  correcto: boolean;
  mensaje: string;
  completada?: boolean;
  xp_obtenido?: number;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class SensorService {
  // Datos fijos del registro nocturno, según el documento de especificación
  private readonly FRECUENCIAS_CORRECTAS: Record<Senal, number> = {
    alfa: 5,
    beta: 8,
    gamma: 4,
    delta: 3,
  };

  private readonly PORCENTAJES_CORRECTOS: Record<Senal, string> = {
    alfa: '25',
    beta: '40',
    gamma: '20',
    delta: '15',
  };

  private readonly SENAL_MAYOR_FRECUENCIA: Senal = 'beta';
  private readonly ZONA_MAS_PROBABLE: Zona = 'sur';

  // A partir de este intento se revela la respuesta. Antes de llegar aquí,
  // en el intento anterior, Bait interviene con su video de ayuda.
  private readonly LIMITE_INTENTOS = 3;

  private async obtenerOCrearProgreso(id_estudiante: number) {
    let progreso = await ActividadSensor.findOne({ where: { id_estudiante } });

    if (!progreso) {
      progreso = await ActividadSensor.create({
        id_estudiante,
        valores_absoluta: {},
        intentos_absoluta: {},
        valores_relativa: {},
        intentos_relativa: {},
        pregunta_senal_frecuente: null,
        intentos_pregunta_senal: 0,
        pregunta_zona_origen: null,
        intentos_pregunta_zona: 0,
        veces_pista_p4: 0,
        veces_pista_p6: 0,
        completada: false,
        resultado_correcto: null,
        tiempo_total: 0,
        xp_obtenido: 0,
        historial_intentos: [],
      });
    }

    return progreso;
  }

  async validarAbsoluta(data: AbsolutaRequest): Promise<AbsolutaResponse> {
    const { id_estudiante, senal, valor } = data;

    if (!Number.isInteger(valor) || valor < 1 || valor > 20) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero del 1 al 20.',
      };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const esperado = this.FRECUENCIAS_CORRECTAS[senal];

    const intentosAbsoluta = { ...(progreso.intentos_absoluta as Record<string, number>) };
    const intentoActual = (intentosAbsoluta[senal] || 0) + 1;
    const esCorrecto = valor === esperado;

    intentosAbsoluta[senal] = intentoActual;

    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'absoluta',
      senal,
      valor,
      correcto: esCorrecto,
      intento: intentoActual,
    });

    await progreso.update({
      intentos_absoluta: intentosAbsoluta,
      historial_intentos: historial,
    });

    if (esCorrecto) {
      const valoresAbsoluta = { ...(progreso.valores_absoluta as Record<string, number>) };
      valoresAbsoluta[senal] = valor;
      await progreso.update({ valores_absoluta: valoresAbsoluta });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: '¡Frecuencia registrada correctamente!',
        celda_completada: true,
      };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      // Bait ya intervino en el intento anterior; si sigue sin poder,
      // ahora sí se revela la respuesta como último recurso.
      const valoresAbsoluta = { ...(progreso.valores_absoluta as Record<string, number>) };
      valoresAbsoluta[senal] = esperado;
      await progreso.update({ valores_absoluta: valoresAbsoluta });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: '¡Esta es la respuesta! Obsérvala bien.',
        celda_completada: true,
        respuesta_correcta: esperado,
      };
    }

    if (intentoActual === 2) {
      // Aquí es donde el frontend debe abrir el modal de Bait (video + audio)
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: cada grupo de 4 líneas con una diagonal representa 5 señales.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Cuenta de nuevo las marcas de esa señal. Cada línea es una aparición.',
      celda_completada: false,
    };
  }

  async validarRelativa(data: RelativaRequest): Promise<RelativaResponse> {
    const { id_estudiante, senal, valorTexto } = data;

    const textoLimpio = valorTexto.trim();

    // Detecta formatos mal escritos (con %, con /, o con punto decimal)
    // antes de contar el intento como tal.
    if (
      textoLimpio.includes('%') ||
      textoLimpio.includes('/') ||
      textoLimpio.includes('.') ||
      textoLimpio.includes(',')
    ) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Escribe solo el número del porcentaje, sin el símbolo %. Por ejemplo: 40.',
        error_formato: true,
      };
    }

    const valor = Number(textoLimpio);

    if (!Number.isInteger(valor) || valor < 1 || valor > 100) {
      return {
        correcto: false,
        intento: 0,
        mensaje: 'Ingresa un número entero del 1 al 100.',
      };
    }

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);
    const esperado = this.PORCENTAJES_CORRECTOS[senal];

    const intentosRelativa = { ...(progreso.intentos_relativa as Record<string, number>) };
    const intentoActual = (intentosRelativa[senal] || 0) + 1;
    const esCorrecto = textoLimpio === esperado;

    intentosRelativa[senal] = intentoActual;

    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'relativa',
      senal,
      valor: textoLimpio,
      correcto: esCorrecto,
      intento: intentoActual,
    });

    await progreso.update({
      intentos_relativa: intentosRelativa,
      historial_intentos: historial,
    });

    if (esCorrecto) {
      const valoresRelativa = { ...(progreso.valores_relativa as Record<string, string>) };
      valoresRelativa[senal] = textoLimpio;
      await progreso.update({ valores_relativa: valoresRelativa });

      return {
        correcto: true,
        intento: intentoActual,
        mensaje: '¡Porcentaje correcto!',
        celda_completada: true,
      };
    }

    if (intentoActual >= this.LIMITE_INTENTOS) {
      const valoresRelativa = { ...(progreso.valores_relativa as Record<string, string>) };
      valoresRelativa[senal] = esperado;
      await progreso.update({ valores_relativa: valoresRelativa });

      return {
        correcto: false,
        intento: intentoActual,
        mensaje: '¡Este es el porcentaje correcto! Consérvalo en mente.',
        celda_completada: true,
        respuesta_correcta: esperado,
      };
    }

    if (intentoActual === 2) {
      return {
        correcto: false,
        intento: intentoActual,
        mensaje: 'Pista: Alfa es 5 entre 20 por 100, igual a 25%. Usa la misma fórmula para las demás.',
        mostrar_pista_bait: true,
        celda_completada: false,
      };
    }

    return {
      correcto: false,
      intento: intentoActual,
      mensaje: 'Revisa la fórmula: frecuencia entre total, por 100. ¿Cuánto da para esa señal?',
      celda_completada: false,
    };
  }

  async calcularZonaOrigen(data: CalcularZonaRequest): Promise<CalcularZonaResponse> {
    const { id_estudiante, pregunta_senal_frecuente, pregunta_zona_origen } = data;

    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    const absolutaOk = (Object.keys(this.FRECUENCIAS_CORRECTAS) as Senal[]).every(
      (s) => (progreso.valores_absoluta as Record<string, number>)[s] === this.FRECUENCIAS_CORRECTAS[s]
    );
    const relativaOk = (Object.keys(this.PORCENTAJES_CORRECTOS) as Senal[]).every(
      (s) => (progreso.valores_relativa as Record<string, string>)[s] === this.PORCENTAJES_CORRECTOS[s]
    );

    const senalOk = pregunta_senal_frecuente === this.SENAL_MAYOR_FRECUENCIA;
    const zonaOk = pregunta_zona_origen === this.ZONA_MAS_PROBABLE;

    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      tipo: 'calcular_zona',
      pregunta_senal_frecuente,
      pregunta_zona_origen,
      correcto: absolutaOk && relativaOk && senalOk && zonaOk,
    });

    const actualizacion: Record<string, unknown> = {
      pregunta_senal_frecuente,
      intentos_pregunta_senal: progreso.intentos_pregunta_senal + 1,
      pregunta_zona_origen,
      intentos_pregunta_zona: progreso.intentos_pregunta_zona + 1,
      historial_intentos: historial,
    };

    const todoCorrecto = absolutaOk && relativaOk && senalOk && zonaOk;

    if (todoCorrecto) {
      actualizacion.completada = true;
      actualizacion.resultado_correcto = true;
      actualizacion.xp_obtenido = 100;
    }

    await progreso.update(actualizacion);

    if (todoCorrecto) {
      return {
        correcto: true,
        mensaje: '¡Lo lograste, agente! El reporte del sensor está listo para el Centro de Mando.',
        completada: true,
        xp_obtenido: 100,
      };
    }

    if (!absolutaOk || !relativaOk) {
      return {
        correcto: false,
        mensaje: 'Todavía hay frecuencias sin completar correctamente. Revísalas antes de calcular la zona de origen.',
      };
    }

    return {
      correcto: false,
      mensaje: 'Piensa: ¿qué señal tiene el número mayor, y en qué zona predomina?',
    };
  }

  async registrarConsultaPista(id_estudiante: number, pantalla: 4 | 6) {
    const progreso = await this.obtenerOCrearProgreso(id_estudiante);

    if (pantalla === 4) {
      await progreso.update({ veces_pista_p4: progreso.veces_pista_p4 + 1 });
      return { veces_pista_p4: progreso.veces_pista_p4 + 1 };
    }

    await progreso.update({ veces_pista_p6: progreso.veces_pista_p6 + 1 });
    return { veces_pista_p6: progreso.veces_pista_p6 + 1 };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ActividadSensor.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    return {
      valores_absoluta: progreso.valores_absoluta,
      intentos_absoluta: progreso.intentos_absoluta,
      valores_relativa: progreso.valores_relativa,
      intentos_relativa: progreso.intentos_relativa,
      pregunta_senal_frecuente: progreso.pregunta_senal_frecuente,
      pregunta_zona_origen: progreso.pregunta_zona_origen,
      veces_pista_p4: progreso.veces_pista_p4,
      veces_pista_p6: progreso.veces_pista_p6,
      completada: progreso.completada,
      resultado_correcto: progreso.resultado_correcto,
      xp_obtenido: progreso.xp_obtenido,
      historial_intentos: progreso.historial_intentos,
    };
  }

  // Reinicia los campos de trabajo Y los contadores de intentos de la
  // sesión actual (para dar 3 intentos frescos otra vez en cada celda).
  // El historial y las consultas de pista NUNCA se borran: quedan como
  // registro permanente para el docente.
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ActividadSensor.findOne({ where: { id_estudiante } });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      valores_absoluta: {},
      intentos_absoluta: {},
      valores_relativa: {},
      intentos_relativa: {},
      pregunta_senal_frecuente: null,
      pregunta_zona_origen: null,
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

export default new SensorService();