import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiArrowRight,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";

import "./Introduccion.css";

import logo from "../../assets/logo_MathNova.png";
import introMathNova from "../../assets/videos/intro-mathnova.mp4";

type IntroduccionProps = {
  onCerrar: () => void;
};

function Introduccion({ onCerrar }: IntroduccionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [silenciado, setSilenciado] = useState(true);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCerrar();
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [onCerrar]);

  const alternarSonido = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nuevoEstado = !video.muted;

    video.muted = nuevoEstado;
    setSilenciado(nuevoEstado);

    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.warn(
          "El navegador bloqueó la reproducción automática:",
          error,
        );
      }
    }
  };

  return createPortal(
    <div
      className="intro-fullscreen"
      role="dialog"
      aria-modal="true"
      aria-label="Introducción de MathNova"
    >
      <video
        ref={videoRef}
        className="intro-fullscreen-video"
        src={introMathNova}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        onEnded={onCerrar}
      >
        Tu navegador no puede reproducir este video.
      </video>

      <div
        className="intro-fullscreen-shadow"
        aria-hidden="true"
      />

      <div className="intro-fullscreen-top">
        <div className="intro-logo-box">
          <img
            src={logo}
            alt="MathNova"
            className="intro-fullscreen-logo"
          />
        </div>

        <button
          type="button"
          className="intro-floating-button intro-skip-button"
          onClick={onCerrar}
        >
          <span>Omitir introducción</span>
          <FiX />
        </button>
      </div>

      <div className="intro-fullscreen-bottom">
        <button
          type="button"
          className="intro-floating-button intro-sound-button"
          onClick={alternarSonido}
        >
          {silenciado ? <FiVolumeX /> : <FiVolume2 />}

          <span>
            {silenciado
              ? "Activar sonido"
              : "Silenciar video"}
          </span>
        </button>

        <div className="intro-message">
          <strong>Bienvenido a MathNova</strong>

          <span>
            Tu aventura matemática está por comenzar.
          </span>
        </div>

        <button
          type="button"
          className="intro-enter-button"
          onClick={onCerrar}
        >
          <span>Entrar a MathNova</span>
          <FiArrowRight />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default Introduccion;