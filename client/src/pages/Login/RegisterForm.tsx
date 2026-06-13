import { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { LuLockKeyhole, LuUser } from "react-icons/lu";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";

type RegisterFormProps = {
  onBack: () => void;
};

function RegisterForm({ onBack }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form className="login-form register-form">
      <h1>¡Crea tu cuenta!</h1>

      <p className="login-subtitle register-subtitle">
        Regístrate para comenzar tu aventura de aprendizaje en MathNova.
      </p>

      <div className="input-box">
        <LuUser className="input-icon" />
        <input type="text" placeholder="Nombre completo" />
      </div>

      <div className="input-box">
        <MdOutlineEmail className="input-icon" />
        <input type="email" placeholder="Correo electrónico" />
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

      <div className="input-box">
        <FaRegAddressCard className="input-icon" />

        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmar contraseña"
        />

        {showConfirmPassword ? (
          <FiEye
            className="input-icon eye"
            onClick={() => setShowConfirmPassword(false)}
          />
        ) : (
          <FiEyeOff
            className="input-icon eye"
            onClick={() => setShowConfirmPassword(true)}
          />
        )}
      </div>

      <label className="terms">
        <input type="checkbox" className="terms-checkbox" />
        <span className="custom-check"></span>
        <span>Acepto los términos y condiciones</span>
      </label>

      <button type="submit" className="login-btn">
        Crear cuenta
      </button>

      <div className="divider">
        <span>¿Ya tienes cuenta?</span>
      </div>

      <button type="button" className="create-btn" onClick={onBack}>
        Iniciar sesión
      </button>
    </form>
  );
}

export default RegisterForm;
