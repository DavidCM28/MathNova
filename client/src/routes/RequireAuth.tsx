import { Navigate, useLocation } from "react-router-dom";
import { hasAuthSession } from "../utils/authSession";

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (!hasAuthSession()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage:
            "Para iniciar una actividad necesitas iniciar sesión o crear una cuenta.",
        }}
      />
    );
  }

  return <>{children}</>;
}