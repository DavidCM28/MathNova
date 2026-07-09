const API_URL = "http://localhost:3001/api/progreso";

export type GuardarProgresoPayload = {
  id_usuario: number | string;
  mundo: string;
  tema?: string;
  actividad_codigo: string;
  actividad_titulo: string;
  respuestas: Record<string, unknown>;
  aciertos: number;
  total_preguntas: number;
  tiempo_segundos?: number;
  xp_base?: number;
};

export type ProgresoActividad = {
  id_progreso: number;
  id_usuario: number;
  mundo: string;
  tema: string | null;
  actividad_codigo: string;
  actividad_titulo: string;
  respuestas: Record<string, unknown>;
  aciertos: number;
  total_preguntas: number;
  precision: number;
  estrellas_obtenidas: number;
  xp_obtenido: number;
  intentos: number;
  completada: boolean;
  tiempo_segundos: number;
  fecha_inicio: string;
  fecha_ultimo_intento: string;
};

export type ResumenAlumno = {
  estrellas_totales: number;
  xp_total: number;
  actividades_completadas: number;
  actividades_intentadas: number;
  precision_promedio: number;
  tiempo_total_segundos: number;
};

export type MundoResumen = {
  mundo: string;
  completadas: number;
  intentadas: number;
  estrellas: number;
  xp: number;
  precision: number;
};

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("mathnova_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const manejarRespuesta = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.mensaje || "Error en la solicitud de progreso.");
  }

  return data as T;
};

export const guardarProgresoActividad = async (
  payload: GuardarProgresoPayload
) => {
  const response = await fetch(`${API_URL}/actividad`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return manejarRespuesta<{
    ok: boolean;
    mensaje: string;
    progreso: ProgresoActividad;
  }>(response);
};

export const obtenerProgresoAlumno = async (idUsuario: number | string) => {
  const response = await fetch(`${API_URL}/alumno/${idUsuario}`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  return manejarRespuesta<{
    ok: boolean;
    progreso: ProgresoActividad[];
  }>(response);
};

export const obtenerResumenAlumno = async (idUsuario: number | string) => {
  const response = await fetch(`${API_URL}/resumen/${idUsuario}`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  return manejarRespuesta<{
    ok: boolean;
    resumen: ResumenAlumno;
    mundos: MundoResumen[];
  }>(response);
};

export const obtenerProgresoActividad = async (
  idUsuario: number | string,
  actividadCodigo: string
) => {
  const codigoSeguro = encodeURIComponent(actividadCodigo);

  const response = await fetch(
    `${API_URL}/actividad/${idUsuario}/${codigoSeguro}`,
    {
      method: "GET",
      headers: getAuthHeaders()
    }
  );

  return manejarRespuesta<{
    ok: boolean;
    progreso: ProgresoActividad | null;
  }>(response);
};