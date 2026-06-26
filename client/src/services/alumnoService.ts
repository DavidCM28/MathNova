const API_URL = "http://localhost:3001/api/alumno";

export type EstadoActividad = "pendiente" | "en_curso" | "completada";

export type Alumno = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  usuario: string | null;
  rol: string;
  estado: boolean;
  miembro_desde?: string;
  grado?: string;
  escuela?: string;
  nivel?: number;
  titulo?: string;
  estrellas_totales?: number;
  racha_actual?: number;
  lecciones_completadas?: number;
  tiempo_estudio_segundos?: number;
  tiempo_estudio?: string;
  progreso_general?: number;
  promedio?: number;
  total_actividades?: number;
  actividades_en_curso?: number;
  mundos_completados?: unknown[];
  insignias?: unknown[];
};

export type Actividad = {
  id: number;
  titulo: string;
  modulo: string;
  tema: string;
  dificultad: string;
  duracion_min: number;
  estado: EstadoActividad;
  porcentaje: number;
  puntaje: number;
  intentos: number;
  tiempo_segundos: number;
  updated_at?: string | null;
};

export type EstadisticasAlumno = {
  total_actividades: number;
  completadas: number;
  en_curso: number;
  pendientes: number;
  promedio: number;
  tiempo_total: number;
  progreso_general: number;
  nivel: number;
  tiempo_formateado: string;
};

type ApiResponse<T> = {
  ok: boolean;
  mensaje?: string;
} & T;

const obtenerToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
  }

  return token;
};

const obtenerHeaders = () => {
  const token = obtenerToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const procesarRespuesta = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error en la solicitud");
  }

  return data;
};

export const obtenerPerfilAlumno = async (): Promise<Alumno> => {
  const response = await fetch(`${API_URL}/perfil`, {
    method: "GET",
    headers: obtenerHeaders(),
  });

  const data = await procesarRespuesta<ApiResponse<{ alumno: Alumno }>>(
    response
  );

  return data.alumno;
};

export const obtenerProgresoAlumno = async (): Promise<Actividad[]> => {
  const response = await fetch(`${API_URL}/progreso`, {
    method: "GET",
    headers: obtenerHeaders(),
  });

  const data = await procesarRespuesta<ApiResponse<{ actividades: Actividad[] }>>(
    response
  );

  return data.actividades;
};

export const obtenerEstadisticasAlumno =
  async (): Promise<EstadisticasAlumno> => {
    const response = await fetch(`${API_URL}/estadisticas`, {
      method: "GET",
      headers: obtenerHeaders(),
    });

    const data = await procesarRespuesta<
      ApiResponse<{ estadisticas: EstadisticasAlumno }>
    >(response);

    return data.estadisticas;
  };

export const guardarProgresoActividad = async (
  actividadId: number,
  estado: EstadoActividad,
  porcentaje: number,
  puntaje: number,
  tiempoSegundos: number
) => {
  const response = await fetch(`${API_URL}/progreso`, {
    method: "POST",
    headers: obtenerHeaders(),
    body: JSON.stringify({
      actividad_id: actividadId,
      estado,
      porcentaje,
      puntaje,
      tiempo_segundos: tiempoSegundos,
    }),
  });

  return procesarRespuesta<
    ApiResponse<{
      progreso: {
        id: number;
        alumno_id: number;
        actividad_id: number;
        estado: EstadoActividad;
        porcentaje: number;
        puntaje: number;
        intentos: number;
        tiempo_segundos: number;
        updated_at: string;
      };
    }>
  >(response);
};



export const reiniciarProgresoAlumno = async () => {
  const response = await fetch(`${API_URL}/progreso`, {
    method: "DELETE",
    headers: obtenerHeaders(),
  });

  return procesarRespuesta<{
    ok: boolean;
    mensaje: string;
  }>(response);
};

export const reiniciarActividadAlumno = async (actividadId: number) => {
  const response = await fetch(`${API_URL}/progreso/${actividadId}`, {
    method: "DELETE",
    headers: obtenerHeaders(),
  });

  return procesarRespuesta<{
    ok: boolean;
    mensaje: string;
  }>(response);
};