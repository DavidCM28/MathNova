import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { logo, menuHamburguesa, zorritoConsejo } from "../mathNumbersAssets";
import type { ShellProps } from "../types";

export function MathNumbersShell({
  crumb,
  title,
  subtitle,
  progress,
  progressValue = 0,
  heroImage,
  heroAlt = "Imagen de MathNumbers",
  rewardTitle,
  rewardText,
  children,
}: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="mnx-page">
      <button
        type="button"
        className={`mnx-hamburger-btn ${menuOpen ? "mnx-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && <div className="mnx-menu-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`mnx-sidebar ${menuOpen ? "mnx-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="mnx-sidebar-logo" />

        <nav className="mnx-sidebar-menu">
          <button className="mnx-menu-item" type="button" onClick={() => irARuta("/dashboard")}>
            <FiGrid />
            <span>Panel de control principal</span>
          </button>

          <button className="mnx-menu-item mnx-active" type="button" onClick={() => irARuta("/seleccion-mundos")}>
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button className="mnx-menu-item" type="button" onClick={() => irARuta("/retroalimentacion")}>
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button className="mnx-menu-item" type="button" onClick={() => irARuta("/recompensas")}>
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button className="mnx-menu-item" type="button" onClick={() => irARuta("/perfil-alumno")}>
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button className="mnx-menu-item" type="button" onClick={() => irARuta("/estadisticas")}>
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mnx-sidebar-fox-box">
          <img src={zorritoConsejo} alt="Zorrito consejo MathNova" className="mnx-sidebar-fox" />
        </div>
      </aside>

      <section className="mnx-content">
        <section className="mnx-hero-section">
          <div className="mnx-hero-text">
            <p className="mnx-breadcrumb">{crumb}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>

            <div className="mnx-hero-actions">
              <button className="mnx-primary-action" type="button" onClick={() => irARuta(activityListRoute)}>
                Volver a actividades <FiArrowRight />
              </button>

              {progress && (
                <div className="mnx-progress-pill" aria-label={`Progreso ${progress}`}>
                  <span>
                    Progreso: <b>{progress}</b>
                  </span>
                  <div>
                    <i style={{ width: `${progressValue}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {(heroImage || (rewardTitle && rewardText)) && (
            <div className="mnx-hero-media-card">
              {rewardTitle && rewardText && (
                <article className="mnx-reward-card">
                  <span>🏆</span>
                  <div>
                    <small>{rewardTitle}</small>
                    <strong>{rewardText}</strong>
                  </div>
                </article>
              )}

              {heroImage && <img src={heroImage} alt={heroAlt} className="mnx-hero-character" />}
            </div>
          )}
        </section>

        <section className="mnx-workspace">{children}</section>

        <footer className="mnx-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="mnx-footer-icons">
            <button type="button" onClick={cerrarSesion} aria-label="Cerrar sesión">
              <FiLogOut className="mnx-logout-icon" />
            </button>
            <FiHelpCircle className="mnx-help-icon" />
            <FiSettings className="mnx-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}
