import { getSessionUser, hasAuthSession, isGuestSession } from "./authSession";

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

const normalizarRol = (rol?: string, roleId?: number | string) => {
  const valor = String(rol || "").toLowerCase().trim();
  const idRol = Number(roleId);

  if (
    [
      "docente_estudiante",
      "docente-estudiante",
      "docente-alumno",
      "docente_alumno",
      "maestro_estudiante",
      "maestro-estudiante",
      "mixto"
    ].includes(valor)
  ) {
    return "docente_estudiante";
  }

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  if (idRol === 1) return "docente";
  if (idRol === 2) return "estudiante";
  if (idRol === 3) return "admin";
  if (idRol === 4) return "docente_estudiante";

  return "estudiante";
};

export const getDashboardRoute = () => {
  if (isGuestSession() && !hasAuthSession()) {
    return "/dashboard";
  }

  const usuario = getSessionUser() as SessionUser | null;

  const rolUsuario = normalizarRol(
    usuario?.rol || usuario?.role || usuario?.tipo_usuario,
    usuario?.role_id || usuario?.roleId || usuario?.id_rol
  );

  if (rolUsuario === "admin") {
    return "/dashboard-admin";
  }

  if (rolUsuario === "docente" || rolUsuario === "docente_estudiante") {
    return "/dashboard-docente";
  }

  return "/dashboard";
};