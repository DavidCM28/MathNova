export const TOKEN_KEY = "token";
export const USER_KEY = "usuario";
export const GUEST_KEY = "modoInvitado";

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(GUEST_KEY);
}

export function startGuestSession() {
  clearAuthSession();
  localStorage.setItem(GUEST_KEY, "true");
}

export function saveAuthSession(token: string, usuario: unknown) {
  localStorage.removeItem(GUEST_KEY);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario ?? {}));
}

export function hasAuthSession() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function isGuestSession() {
  return localStorage.getItem(GUEST_KEY) === "true" && !hasAuthSession();
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getDisplayName() {
  if (isGuestSession()) return "Explorador";

  const usuario = getSessionUser();

  const nombre =
    usuario?.nombre_completo ||
    usuario?.nombreCompleto ||
    usuario?.nombre ||
    usuario?.usuario ||
    usuario?.correo ||
    "Alumno";

  return String(nombre).split(" ")[0];
}