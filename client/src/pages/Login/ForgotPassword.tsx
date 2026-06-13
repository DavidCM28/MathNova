import { MdOutlineEmail } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { FiHelpCircle } from "react-icons/fi";

import zorritoCambio from "../../assets/zorrito_cambio-contrasena.png";

type ForgotPasswordProps = {
  onBack: () => void;
};

function ForgotPassword({ onBack }: ForgotPasswordProps) {
  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <section className="forgot-left">
          <div className="forgot-image-card">
            <img
              src={zorritoCambio}
              alt="Zorrito cambio contraseña"
              className="forgot-fox"
            />
          </div>

          <h2>
            ¡No te preocupes! Te ayudamos a volver al espacio de MathNova.
          </h2>
        </section>

        <section className="forgot-right">
          <div className="forgot-form">
            <button type="button" className="back-login-btn" onClick={onBack}>
              <IoArrowBack />
              Volver al login
            </button>

            <h1>Restablece tu contraseña</h1>

            <p>
              Ingresa tu dirección de correo electrónico y te enviaremos un
              enlace para restablecer tu contraseña.
            </p>

            <div className="forgot-input">
              <MdOutlineEmail className="forgot-icon" />

              <input type="email" placeholder="tu_correo@ejemplo.com" />
            </div>

            <button type="button" className="forgot-btn">
              Enviar enlace de restablecimiento
            </button>

            <button type="button" className="forgot-link" onClick={onBack}>
              ¿Recordaste tu contraseña? Inicia sesión
            </button>

            <a href="#" className="forgot-help">
              <FiHelpCircle />
              ¿Necesitas ayuda?
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ForgotPassword;
