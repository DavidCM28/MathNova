import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startGuestSession, saveAuthSession } from "../../utils/authSession";

import "./Login.css";

import zorritoLogin from "../../assets/zorrito_login.png";
import zorritoCrearCuenta from "../../assets/zorrito_crear-cuenta.png";
import logo from "../../assets/logo_MathNova.png";

import { MdOutlineEmail } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FiEye, FiEyeOff } from "react-icons/fi";

import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";

import { iniciarSesion } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    from?: string;
    authMessage?: string;
  } | null;

  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [correoUsuario, setCorreoUsuario] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const entrarComoEspectador = () => {
    startGuestSession();
    navigate("/dashboard", { replace: true });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!correoUsuario.trim() || !loginPassword.trim()) {
      alert("Ingresa tu correo/usuario y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const data = await iniciarSesion({
        correoUsuario,
        password: loginPassword,
      });

      saveAuthSession(data.token, data.usuario);

      console.log("Usuario logueado:", data.usuario);

      // ==========================================================
      // CAMBIO AQUÍ: Redirección condicional según el rol
      // ==========================================================
      if (state?.from) {
        // Si el usuario intentaba entrar a una página protegida antes de loguearse, va directo allá
        navigate(state.from, { replace: true });
      } else {
        // Extraemos el rol desde los datos devueltos por Supabase
        const rol = data.usuario.role_id;

        if (rol === 1) {
          navigate("/dashboard-docente", { replace: true }); // Maestro
        } else if (rol === 2) {
          navigate("/dashboard", { replace: true });         // Alumno
        } else if (rol === 3) {
          navigate("/dashboard-admin", { replace: true });   // Administrador
        } else {
          navigate("/dashboard", { replace: true });         // Respaldo por si acaso
        }
      }
      // ==========================================================

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.error("Error al iniciar sesión:", error.message);
      } else {
        alert("No se pudo iniciar sesión.");
        console.error("Error desconocido:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

  return (
    <main className="login-page">
      <div className="login-scene">
        <div className={`login-card-flip ${isRegister ? "is-flipped" : ""}`}>
          <div className="login-card card-face card-front">
            <section className="login-left">
              <div className="poster">
                <img src={logo} alt="MathNova" className="login-logo" />

                <p className="poster-text">
                  Explorando el universo de las matemáticas
                </p>

                <img
                  src={zorritoLogin}
                  alt="Zorrito MathNova"
                  className="fox-img"
                />
              </div>
            </section>

            <section className="login-right">
              <form className="login-form" onSubmit={handleLogin}>
                <h1>¡Bienvenido de nuevo!</h1>

                <p className="login-subtitle">
                  Inicia sesión para continuar aprendiendo con MathNova.
                </p>

                {state?.authMessage && (
                  <div className="login-alert">{state.authMessage}</div>
                )}

                <div className="input-box">
                  <MdOutlineEmail className="input-icon" />

                  <input
                    type="text"
                    placeholder="Correo o usuario"
                    value={correoUsuario}
                    onChange={(e) => setCorreoUsuario(e.target.value)}
                  />
                </div>

                <div className="input-box">
                  <LuLockKeyhole className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />

                  {showPassword ? (
                    <FiEye
                      className="input-icon eye"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <FiEyeOff
                      className="input-icon eye"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>

                <a
                  href="#"
                  className="forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgot(true);
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>

                <button
                  type="button"
                  className="guest-button"
                  onClick={entrarComoEspectador}
                >
                  Entrar como espectador
                </button>

                <div className="divider">
                  <span>¿Eres nuevo aquí?</span>
                </div>

                <button
                  type="button"
                  className="create-btn"
                  onClick={() => setIsRegister(true)}
                >
                  Crear cuenta
                </button>
              </form>
            </section>
          </div>

          <div className="login-card card-face card-back">
            <section className="login-left">
              <div className="poster">
                <img src={logo} alt="MathNova" className="login-logo" />

                <p className="poster-text">
                  Explorando el universo de las matemáticas
                </p>

                <img
                  src={zorritoCrearCuenta}
                  alt="Zorrito crear cuenta"
                  className="fox-img"
                />
              </div>
            </section>

            <section className="login-right">
              <RegisterForm onBack={() => setIsRegister(false)} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;