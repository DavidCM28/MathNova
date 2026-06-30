export type Grupo = {
  id_grupo: number;
  nombre_grupo: string;
  id_profesor: number;
  total_alumnos?: number;
};

type GrupoResponse = {
  ok: boolean;
  mensaje: string;
  grupo: Grupo;
};

type ObtenerGruposResponse = {
  ok: boolean;
  grupos: Grupo[];
};

const API_GRUPOS = "http://localhost:3001/api/grupos";

function obtenerToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  return token;
}

export async function obtenerGrupos(): Promise<Grupo[]> {
  const token = obtenerToken();

  const response = await fetch(API_GRUPOS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: ObtenerGruposResponse = await response.json();

  if (!response.ok) {
    throw new Error("No se pudieron obtener los grupos.");
  }

  return data.grupos;
}

export async function crearGrupo(
  nombreGrupo: string,
): Promise<GrupoResponse> {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo crear el grupo.");
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo editar el grupo.");
  }

  return data;
}