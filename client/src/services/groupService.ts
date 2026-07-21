export type Grupo = {
  id_grupo: number;
  nombre_grupo: string;
  id_profesor: number;
  total_alumnos?: number;
};

export type AlumnoGrupo = {
  id_grupo?: number;
  id_alumno: number;
  nombre: string;
  correo: string;
  usuario?: string | null;
};

type GrupoResponse = {
  ok: boolean;
  mensaje: string;
  grupo: Grupo;
};

type ObtenerGruposResponse = {
  ok: boolean;
  grupos: Grupo[];
  mensaje?: string;
};

type ObtenerAlumnosGrupoResponse = {
  ok: boolean;
  alumnos: AlumnoGrupo[];
  mensaje?: string;
};

type AlumnoGrupoResponse = {
  ok: boolean;
  mensaje: string;
  alumno?: AlumnoGrupo;
};

const API_GRUPOS = "http://localhost:3001/api/grupos";

function obtenerToken() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token");

  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  return token;
}

async function leerJson<T>(
  response: Response,
  mensajeDefault: string,
): Promise<T> {
  const texto = await response.text();

  let data: any = {};

  try {
    data = texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error("El backend no devolvió JSON.");
  }

  if (!response.ok) {
    throw new Error(data.mensaje || mensajeDefault);
  }

  return data as T;
}

export async function obtenerGrupos(): Promise<Grupo[]> {
  const token = obtenerToken();

  const response = await fetch(API_GRUPOS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await leerJson<ObtenerGruposResponse>(
    response,
    "No se pudieron obtener los grupos.",
  );

  return data.grupos || [];
}

export async function crearGrupo(nombreGrupo: string): Promise<GrupoResponse> {
  const token = obtenerToken();

  const response = await fetch(API_GRUPOS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre_grupo: nombreGrupo,
    }),
  });

  return leerJson<GrupoResponse>(response, "No se pudo crear el grupo.");
}

export async function actualizarGrupo(
  idGrupo: number,
  nombreGrupo: string,
): Promise<GrupoResponse> {
  const token = obtenerToken();

  const response = await fetch(`${API_GRUPOS}/${idGrupo}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre_grupo: nombreGrupo,
    }),
  });

  return leerJson<GrupoResponse>(response, "No se pudo editar el grupo.");
}

export async function obtenerAlumnosGrupo(
  idGrupo: number,
): Promise<AlumnoGrupo[]> {
  const token = obtenerToken();

  const response = await fetch(`${API_GRUPOS}/${idGrupo}/alumnos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await leerJson<ObtenerAlumnosGrupoResponse>(
    response,
    "No se pudieron obtener los alumnos del grupo.",
  );

  return data.alumnos || [];
}

export async function obtenerAlumnosDisponibles(
  idGrupo: number,
  buscar = "",
): Promise<AlumnoGrupo[]> {
  const token = obtenerToken();

  const params = new URLSearchParams();

  if (buscar.trim()) {
    params.set("buscar", buscar.trim());
  }

  const url = params.toString()
    ? `${API_GRUPOS}/${idGrupo}/alumnos-disponibles?${params.toString()}`
    : `${API_GRUPOS}/${idGrupo}/alumnos-disponibles`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await leerJson<ObtenerAlumnosGrupoResponse>(
    response,
    "No se pudieron obtener los alumnos disponibles.",
  );

  return data.alumnos || [];
}

export async function agregarAlumnoAGrupo(
  idGrupo: number,
  idAlumno: number,
): Promise<AlumnoGrupoResponse> {
  const token = obtenerToken();

  const response = await fetch(`${API_GRUPOS}/${idGrupo}/alumnos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_alumno: idAlumno,
    }),
  });

  return leerJson<AlumnoGrupoResponse>(
    response,
    "No se pudo agregar el alumno al grupo.",
  );
}

export async function eliminarAlumnoDeGrupo(
  idGrupo: number,
  idAlumno: number,
): Promise<AlumnoGrupoResponse> {
  const token = obtenerToken();

  const response = await fetch(`${API_GRUPOS}/${idGrupo}/alumnos/${idAlumno}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return leerJson<AlumnoGrupoResponse>(
    response,
    "No se pudo eliminar el alumno del grupo.",
  );
}