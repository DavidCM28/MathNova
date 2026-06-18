const API_URL = "http://localhost:3001/api/auth";

type LoginData = {
  correoUsuario: string;
  password: string;
};

type RegisterData = {
  nombre_completo: string;
  correo: string;
  usuario?: string;
  password: string;
  confirmarPassword: string;
  acepto_terminos: boolean;
};

type Usuario = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  usuario: string | null;
  rol: string;
};

type LoginResponse = {
  ok: boolean;
  mensaje: string;
  token: string;
  usuario: Usuario;
};

type RegisterResponse = {
  ok: boolean;
  mensaje: string;
  usuario: Usuario;
};

export const iniciarSesion = async (
  datos: LoginData
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al iniciar sesión");
  }

  return data;
};

export const registrarUsuario = async (
  datos: RegisterData
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al registrar usuario");
  }

  return data;
};