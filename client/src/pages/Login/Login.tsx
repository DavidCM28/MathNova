import { useState } from "react";
import "./Login.css";

import zorritoLogin from "../../assets/zorrito_login.png";
import zorritoCrearCuenta from "../../assets/zorrito_crear-cuenta.png";
import logo from "../../assets/logo_MathNova.png";

import { MdOutlineEmail } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FiEye, FiEyeOff } from "react-icons/fi";

import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

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
              <form className="login-form">
                <h1>¡Bienvenido de nuevo!</h1>

                <p className="login-subtitle">
                  Inicia sesión para continuar aprendiendo con MathNova.
                </p>

                <div className="input-box">
                  <MdOutlineEmail className="input-icon" />
                  <input type="text" placeholder="Correo o usuario" />
                </div>

                <div className="input-box">
                  <LuLockKeyhole className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
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

                <button type="submit" className="login-btn">
                  Iniciar sesión
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
