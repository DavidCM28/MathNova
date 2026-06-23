import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import zorritoRe from "../../assets/zorrito-re.png";
import zorritoRetroalimentacion from "../../assets/zorrito-retroalimentacion.png";
import estrellaRe from "../../assets/estrella-re.png";

import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiEdit,
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function Feedback() {
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

  const topics = [
    { label: "Álgebra", level: "Básico", value: 75 },
    { label: "Geometría", level: "Intermedio", value: 60 },
    { label: "Fracciones", level: "Intermedio", value: 45 },
    { label: "Estadística", level: "Básico", value: 50 },
  ];

  return (
    <main className="fbk-page">
      <button
        className={`fbk-hamburger-btn ${menuOpen ? "fbk-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="fbk-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`fbk-sidebar ${menuOpen ? "fbk-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="fbk-sidebar-logo" />

        <nav className="fbk-sidebar-menu">
          <button className="fbk-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button className="fbk-menu-item fbk-active">
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="fbk-sidebar-bottom-card">
          <div className="fbk-mini-fox-circle">
            <img src={zorritoRe} alt="Nova" />
          </div>

          <h3>¡Sigue así, Alex!</h3>
          <p>Cada paso te acerca a tus metas.</p>

          <div className="fbk-mini-status">
            <img src={estrellaRe} alt="Estrella" />
            <span>Estás haciendo un gran trabajo</span>
          </div>
        </div>
      </aside>

      <section className="fbk-content">
        <header className="fbk-topbar">
          <div>
            <h1>Retroalimentación</h1>
            <p>
              Revisa tu progreso, consejos y recomendaciones personalizadas.
            </p>
          </div>

          <div className="fbk-topbar-user-area">
            <button className="fbk-bell-btn">
              <FiBell />
            </button>

            <div className="fbk-profile-chip">
              <img src={zorritoRe} alt="Alex" />
              <div>
                <strong>Alex</strong>
                <span>1° Secundaria</span>
              </div>
              <FiChevronDown />
            </div>
          </div>
        </header>

        <section className="fbk-grid">
          <article className="fbk-card fbk-summary-card">
            <div className="fbk-card-icon fbk-blue-icon">
              <FiBarChart2 />
            </div>

            <h2>Resumen de Desempeño</h2>
            <span className="fbk-summary-badge">General</span>

            <div className="fbk-summary-box">
              <div className="fbk-summary-row">
                <FiCheck />
                <span>Ejercicios Correctos:</span>
                <strong>95%</strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>Tiempo Promedio:</span>
                <strong>45s</strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>Mejor Tema:</span>
                <strong>Álgebra</strong>
              </div>
            </div>

            <button>Ver Detalles →</button>
          </article>

          <article className="fbk-card fbk-guide-card">
            <div className="fbk-card-icon fbk-green-icon">
              <FiBookOpen />
            </div>

            <h2>Tu Guía de Estudio</h2>
            <p>Recomendaciones basadas en tus últimas actividades, Alex.</p>

            <div className="fbk-main-progress">
              <span style={{ width: "75%" }}></span>
            </div>

            <strong className="fbk-percent-text">75% completado</strong>

            <div className="fbk-guide-list">
              {topics.map((topic) => (
                <div className="fbk-guide-item" key={topic.label}>
                  <div>
                    <span>{topic.label}</span>
                    <b>{topic.level}</b>
                  </div>

                  <i>
                    <span style={{ width: `${topic.value}%` }}></span>
                  </i>
                </div>
              ))}
            </div>

            <button>Comenzar Guía →</button>
          </article>

          <article className="fbk-card fbk-nova-card">
            <div className="fbk-card-icon fbk-orange-icon">
              <img src={zorritoRe} alt="Nova" />
            </div>

            <h2>Mensaje de Nova</h2>

            <div className="fbk-message-panel">
              <p>¡Estás haciendo un trabajo increíble, Alex!</p>

              <p>
                Tus habilidades en <strong>Geometría</strong> han mejorado
                mucho.
              </p>

              <p>
                Te sugiero que practiques un poco más las{" "}
                <strong>Fracciones</strong> esta semana.
              </p>
            </div>

            <button>Ver Historial →</button>
          </article>

          <aside className="fbk-progress-panel">
            <h2>¡Progreso Constante!</h2>
            <p>Sigue las guías de Nova para avanzar.</p>

            <img
              src={zorritoRetroalimentacion}
              alt="Zorrito retroalimentación"
              className="fbk-progress-fox"
            />

            <div className="fbk-progress-stats">
              <div>
                <img src={estrellaRe} alt="Estrella" />
                <strong>4</strong>
                <span>Guías completadas</span>
              </div>

              <div>
                <img src={estrellaRe} alt="Estrella" />
                <strong>22</strong>
                <span>Estrellas ganadas por feedback</span>
              </div>
            </div>
          </aside>
        </section>
        <footer className="fbk-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="fbk-footer-icons">
            <button
              className="fbk-footer-icon-btn"
              onClick={() => navigate("/login")}
            >
              <FiLogOut className="fbk-logout-icon" />
            </button>

            <FiHelpCircle className="fbk-help-icon" />
            <FiSettings className="fbk-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Feedback;
