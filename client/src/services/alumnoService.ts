const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export type ActividadProgreso = {
  mundo: string;
  actividadSlug: string;
  actividadNombre: string;
  puntaje: number;
  estrellas: number;
  completada: boolean;
  fechaCompletado?: string | null;
};

export type Alumno = {
  id?: number | string;
  id_usuario?: number | string;
  nombreCompleto?: string;
  nombre_completo?: string;
  correo?: string;
  usuario?: string | null;
  rol?: string;
  estado?: boolean;
  estrellas_totales?: number;
  racha_actual?: number;
};

export type Actividad = ActividadProgreso & {
  titulo?: string;
  estado?: string;
  porcentaje?: number;
  tema?: string;
  modulo?: string;
};

export type EstadisticasAlumno = {
  completadas?: number;
  promedio?: number;
  progreso_general?: number;
  tiempo_formateado?: string;

  leccionesCompletadas?: number;
  estrellasGanadas?: number;
  rachaActual?: number;
  promedioGeneral?: number;
  progresoSemanal?: { dia: string; lecciones: number }[];
  rendimientoPorTema?: { tema: string; promedio: number }[];
  dominioPorMundo?: { mundo: string; promedio: number }[];
  tiempoEstudio?: {
    minutos: number;
    actividadesCompletas: number;
    semanal: { dia: string; minutos: number }[];
  };
};

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeaders = () => {
  const token = getToken();

  if (!token) {
    throw new Error("No hay token guardado. Inicia sesión otra vez.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const requestJSON = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    throw new Error(
      `El servidor no devolvió JSON. URL: ${url}. Respuesta: ${text.slice(
        0,
        120
      )}`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error en la petición");
  }

  return data;
};

const asegurarArray = <T>(valor: unknown): T[] => {
  return Array.isArray(valor) ? valor : [];
};

export const obtenerPerfilAlumno = async () => {
  return requestJSON(`${API_URL}/alumno/perfil`, {
    method: "GET",
    headers: authHeaders(),
  });
};

export const obtenerEstadisticasAlumno = async () => {
  return requestJSON(`${API_URL}/alumno/estadisticas`, {
    method: "GET",
    headers: authHeaders(),
  });
};

export const obtenerProgresoAlumno = async (): Promise<ActividadProgreso[]> => {
  const data = await obtenerPerfilAlumno();

  const actividades = asegurarArray<ActividadProgreso>(
    data.actividadesRecientes || data.actividades || data.progreso
  );

  return actividades;
};

export const guardarProgresoAlumno = async (payload: {
  mundo: string;
  actividadSlug: string;
  actividadNombre: string;
  puntaje: number;
  estrellas: number;
  completada: boolean;
  tiempoSegundos?: number;
  respuestasCorrectas?: number;
  totalPreguntas?: number;
}) => {
  return requestJSON(`${API_URL}/alumno/progreso`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
};