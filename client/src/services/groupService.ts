type Grupo = {
  id_grupo: number;
  nombre_grupo: string;
  id_profesor: number;
};

type CrearGrupoResponse = {
  ok: boolean;
  mensaje: string;
  grupo: Grupo;
};

export async function crearGrupo(
  nombreGrupo: string,
): Promise<CrearGrupoResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión para crear un grupo.");
  }

  const response = await fetch("http://localhost:3001/api/grupos", {
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