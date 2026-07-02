import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../utils/authSession";

const START_KEY = "mathnova_dev_started";

export default function StartupRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (sessionStorage.getItem(START_KEY)) return;

    sessionStorage.setItem(START_KEY, "true");
    clearAuthSession();

    if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}