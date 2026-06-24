const API_URL = "http://localhost:3001/api/admin";

export const obtenerDashboardAdmin = async () => {
  const response = await fetch(`${API_URL}/dashboard`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener dashboard administrador");
  }

  return data.dashboard;
};

export const obtenerUsuariosAdmin = async () => {
  const response = await fetch(`${API_URL}/usuarios`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener usuarios");
  }

  return data.usuarios;
};