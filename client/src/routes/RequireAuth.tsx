import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  hasAuthSession,
  isGuestSession,
  getSessionUser
} from "../utils/authSession";

type RequireAuthProps = {
  children: ReactNode;
  rolesPermitidos?: string[];
  permitirInvitado?: boolean;
};

const normalizarRol = (rol?: string, roleId?: number) => {
  const valor = String(rol || "").toLowerCase().trim();

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  if (roleId === 1) return "docente";
  if (roleId === 2) return "estudiante";
  if (roleId === 3) return "admin";

  return "estudiante";
};

export default function RequireAuth({
  children,
  rolesPermitidos,
  permitirInvitado = false
}: RequireAuthProps) {
  const location = useLocation();

  const tieneSesion = hasAuthSession();
  const esInvitado = isGuestSession();

  if (!tieneSesion && !esInvitado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage:
            "Para iniciar una actividad necesitas iniciar sesión o crear una cuenta."
        }}
      />
    );
  }

  if (esInvitado && !permitirInvitado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage: "Esta sección requiere iniciar sesión."
        }}
      />
    );
  }

  if (esInvitado && permitirInvitado) {
    return <>{children}</>;
  }

  const usuario = getSessionUser();
  const rolUsuario = normalizarRol(usuario?.rol, usuario?.role_id);

  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const rolesNormalizados = rolesPermitidos.map((rol) => normalizarRol(rol));

    if (!rolesNormalizados.includes(rolUsuario)) {
      if (rolUsuario === "admin") {
        return <Navigate to="/dashboard-admin" replace />;
      }

      if (rolUsuario === "docente") {
        return <Navigate to="/dashboard-docente" replace />;
      }

      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}