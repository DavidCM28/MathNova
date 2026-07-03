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
  role_id: number;
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

async function leerRespuesta(response: Response) {
  const texto = await response.text();

  let data;

  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    throw new Error(
      `El backend no devolvió JSON. Revisa si existe esta ruta: ${response.url}`
    );
  }

  if (!response.ok) {
    throw new Error(data?.mensaje || data?.message || "Error en la petición");
  }

  return data;
}

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

  return leerRespuesta(response);
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

  return leerRespuesta(response);
};