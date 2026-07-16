import "./HintModal.css";

import { useEffect } from "react";
import {
  FiCheckCircle,
  FiHelpCircle,
  FiLightbulb,
  FiX,
} from "react-icons/fi";

type HintModalProps = {
  title: string;
  message: string;
  quickTip?: string;
  onClose: () => void;
};

export function HintModal({
  title,
  message,
  quickTip = "Observa la guía visual y divide el problema en pasos pequeños.",
  onClose,
}: HintModalProps) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  return (
    <div
      className="hint-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className="hint-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-modal-title"
      >
        <button
          type="button"
          className="hint-modal-close"
          onClick={onClose}
          aria-label="Cerrar ayuda"
        >
          <FiX />
        </button>

        <div className="hint-modal-decoration hint-modal-decoration--one" />
        <div className="hint-modal-decoration hint-modal-decoration--two" />

        <header className="hint-modal-header">
          <div className="hint-modal-header-icon">
            <FiHelpCircle />
          </div>

          <div>
            <span className="hint-modal-badge">
              <FiLightbulb />
              Aquí tienes una pista
            </span>

            <h1 id="hint-modal-title">
              {title}
            </h1>

            <p>
              Lee con calma y usa esta ayuda para
              continuar la actividad.
            </p>
          </div>
        </header>

        <div className="hint-modal-content">
          <article className="hint-modal-message">
            <span className="hint-modal-message-icon">
              <FiLightbulb />
            </span>

            <div>
              <h2>
                Consejo del Comandante Suma
              </h2>

              <p>{message}</p>
            </div>
          </article>

          <aside className="hint-modal-tip">
            <FiCheckCircle />

            <div>
              <strong>Tip rápido</strong>
              <span>{quickTip}</span>
            </div>
          </aside>
        </div>

        <footer className="hint-modal-footer">
          <button
            type="button"
            className="hint-modal-continue"
            onClick={onClose}
          >
            <FiCheckCircle />
            Continuar actividad
          </button>
        </footer>
      </section>
    </div>
  );
}