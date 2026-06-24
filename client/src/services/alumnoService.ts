const API_URL = "http://localhost:3001/api/alumno";

export const obtenerPerfilAlumno = async (idUsuario: number) => {
  const response = await fetch(`${API_URL}/perfil/${idUsuario}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener perfil del alumno");
  }

  return data.alumno;
};