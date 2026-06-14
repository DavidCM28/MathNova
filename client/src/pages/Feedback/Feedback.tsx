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
    <main className="feedback-page">
      <button
        className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="sidebar-logo" />

        <nav className="sidebar-menu">
          <button className="menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/temas/numeros")}
          >
            <FiBookOpen />
            <span>Temas</span>
          </button>

          <button className="menu-item">
            <FiEdit />
            <span>Actividades</span>
          </button>

          <button className="menu-item active">
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/recompensas")}>
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="sidebar-bottom-card">
          <div className="mini-fox-circle">
            <img src={zorritoRe} alt="Nova" />
          </div>

          <h3>¡Sigue así, Alex!</h3>
          <p>Cada paso te acerca a tus metas.</p>

          <div className="mini-status">
            <img src={estrellaRe} alt="Estrella" />
            <span>Estás haciendo un gran trabajo</span>
          </div>
        </div>
      </aside>

      <section className="feedback-content">
        <header className="feedback-topbar">
          <div>
            <h1>Retroalimentación</h1>
            <p>
              Revisa tu progreso, consejos y recomendaciones personalizadas.
            </p>
          </div>

          <div className="topbar-user-area">
            <button className="bell-btn">
              <FiBell />
            </button>

            <div className="profile-chip">
              <img src={zorritoRe} alt="Alex" />
              <div>
                <strong>Alex</strong>
                <span>1° Secundaria</span>
              </div>
              <FiChevronDown />
            </div>
          </div>
        </header>

        <section className="feedback-grid">
          <article className="feedback-card summary-card">
            <div className="card-icon blue-icon">
              <FiBarChart2 />
            </div>

            <h2>Resumen de Desempeño</h2>
            <span className="summary-badge">General</span>

            <div className="summary-box">
              <div className="summary-row">
                <FiCheck />
                <span>Ejercicios Correctos:</span>
                <strong>95%</strong>
              </div>

              <div className="summary-row">
                <FiCheck />
                <span>Tiempo Promedio:</span>
                <strong>45s</strong>
              </div>

              <div className="summary-row">
                <FiCheck />
                <span>Mejor Tema:</span>
                <strong>Álgebra</strong>
              </div>
            </div>

            <button>Ver Detalles →</button>
          </article>

          <article className="feedback-card guide-card">
            <div className="card-icon green-icon">
              <FiBookOpen />
            </div>

            <h2>Tu Guía de Estudio</h2>
            <p>Recomendaciones basadas en tus últimas actividades, Alex.</p>

            <div className="main-progress">
              <span style={{ width: "75%" }}></span>
            </div>

            <strong className="percent-text">75% completado</strong>

            <div className="guide-list">
              {topics.map((topic) => (
                <div className="guide-item" key={topic.label}>
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

          <article className="feedback-card nova-card">
            <div className="card-icon orange-icon">
              <img src={zorritoRe} alt="Nova" />
            </div>

            <h2>Mensaje de Nova</h2>

            <div className="message-panel">
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

          <aside className="progress-panel">
            <h2>¡Progreso Constante!</h2>
            <p>Sigue las guías de Nova para avanzar.</p>

            <img
              src={zorritoRetroalimentacion}
              alt="Zorrito retroalimentación"
              className="progress-fox"
            />

            <div className="progress-stats">
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
      </section>
    </main>
  );
}

export default Feedback;
