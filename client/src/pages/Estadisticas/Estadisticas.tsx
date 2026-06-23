import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import "./Estadisticas.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import zorroHola from "../../assets/zorrito-hola-explorador.png";
import zorroIdeas from "../../assets/zorrito-ideas.png";
import heroEstadisticas from "../../assets/hero-banner-estadisticas.png";

import leccionesIcon from "../../assets/lecciones-completadas.png";
import estrellasIcon from "../../assets/estrellas-totales.png";
import rachaIcon from "../../assets/racha.png";
import promedioIcon from "../../assets/promedio-general.png";

import {
  FiGrid,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiZap,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

import { FaChartLine, FaChartPie, FaLightbulb, FaStar } from "react-icons/fa";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function Estadisticas() {
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

  return (
    <main className="estadisticas-page">
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
            onClick={() => irARuta("/retroalimentacion")}
          >
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
            className="menu-item active"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="estadisticas-explorer-box">
          <img src={zorroHola} alt="Zorrito explorador" />
          <span>¡Hola, explorador!</span>
        </div>
      </aside>

      <section className="dashboard-content estadisticas-content">
        <img src={heroEstadisticas} alt="" className="stats-hero-bg" />

        <header className="stats-header">
          <h1>Estadísticas</h1>
          <p>Visualiza tu progreso y rendimiento.</p>
        </header>

        <section className="stats-summary">
          <article className="summary-card estadisticas-green-card">
            <div>
              <h3>Lecciones completadas</h3>
              <strong>12</strong>
              <p>+3 esta semana</p>
            </div>
            <img src={leccionesIcon} alt="Lecciones" />
          </article>

          <article className="summary-card estadisticas-yellow-card">
            <div>
              <h3>Estrellas ganadas</h3>
              <strong>850</strong>
              <p>+120 esta semana</p>
            </div>
            <img src={estrellasIcon} alt="Estrellas" />
          </article>

          <article className="summary-card estadisticas-red-card">
            <div>
              <h3>Racha actual</h3>
              <strong>5</strong>
              <p>¡Sigue así!</p>
            </div>
            <img src={rachaIcon} alt="Racha" />
          </article>

          <article className="summary-card estadisticas-blue-card">
            <div>
              <h3>Promedio general</h3>
              <strong>78%</strong>
              <p>Buen trabajo</p>
            </div>
            <img src={promedioIcon} alt="Promedio" />
          </article>
        </section>

        <section className="stats-grid">
          <article className="stats-panel weekly-panel">
            <div className="panel-title">
              <span className="panel-icon blue-icon">
                <FaChartLine />
              </span>
              <h2>Progreso semanal</h2>
            </div>

            <div className="weekly-chart-area">
              <span className="weekly-axis-title">Lecciones</span>

              <div className="weekly-y-axis">
                <span>16</span>
                <span>12</span>
                <span>8</span>
                <span>4</span>
                <span>0</span>
              </div>

              <div className="weekly-chart">
                {[
                  ["Lun", "4", "25%"],
                  ["Mar", "7", "44%"],
                  ["Mié", "9", "56%"],
                  ["Jue", "13", "81%"],
                  ["Vie", "11", "69%"],
                  ["Sáb", "14", "88%"],
                  ["Dom", "8", "50%"],
                ].map((item, index) => (
                  <div className="weekly-column" key={item[0]}>
                    <strong>{item[1]}</strong>
                    <span
                      className={`weekly-bar weekly-bar-${index}`}
                      style={{ height: item[2] }}
                    ></span>
                    <p>{item[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="weekly-note">
              <div className="weekly-note-left">
                <span className="weekly-note-icon">
                  <FiTrendingUp />
                </span>
                <div>
                  <b>66 lecciones</b>
                  <p>totales esta semana</p>
                </div>
              </div>

              <div className="weekly-note-right">
                <b>+18%</b>
                <p>vs. semana anterior</p>
              </div>
            </div>
          </article>

          <article className="stats-panel performance-panel">
            <div className="panel-title">
              <span className="panel-icon multi-icon">
                <FiBarChart2 />
              </span>
              <h2>Rendimiento por tema</h2>
            </div>

            {[
              ["Álgebra Básica", "85%", "blue"],
              ["Números y Operaciones", "72%", "green"],
              ["Geometría", "68%", "purple"],
              ["Estadística y Probabilidad", "60%", "orange"],
              ["Medición", "55%", "cyan"],
            ].map((item) => (
              <div className="topic-row" key={item[0]}>
                <div>
                  <span>{item[0]}</span>
                  <b>{item[1]}</b>
                </div>
                <div className="topic-line">
                  <span
                    className={`topic-fill ${item[2]}`}
                    style={{ width: item[1] }}
                  ></span>
                </div>
              </div>
            ))}

            <div className="legend">
              <span className="legend-green"></span>90-100%
              <span className="legend-blue"></span>70-89%
              <span className="legend-yellow"></span>50-69%
              <span className="legend-red"></span>&lt;50%
            </div>
          </article>

          <article className="stats-panel world-panel">
            <div className="panel-title">
              <span className="panel-icon pie-icon">
                <FaChartPie />
              </span>
              <h2>Dominio por mundo</h2>
            </div>

            <div className="world-content">
              <div className="donut">
                <div className="donut-inner">
                  <strong>72%</strong>
                  <span>Promedio</span>
                </div>
              </div>

              <div className="world-list">
                <p>
                  <b>Planeta Números</b>
                  <strong>85%</strong>
                </p>
                <p>
                  <b>Mundo Geometría</b>
                  <strong>70%</strong>
                </p>
                <p>
                  <b>Isla Álgebra</b>
                  <strong>72%</strong>
                </p>
                <p>
                  <b>Galaxia Datos</b>
                  <strong>60%</strong>
                </p>
                <p>
                  <b>Mundo Medición</b>
                  <strong>58%</strong>
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="bottom-grid">
          <article className="stats-panel time-panel">
            <div className="panel-title">
              <span className="panel-icon clock-icon">
                <FiClock />
              </span>
              <h2>Tiempo de estudio</h2>
            </div>

            <div className="study-info">
              <div className="study-summary">
                <strong>4h 32m</strong>
                <p>esta semana</p>
                <span>
                  +45 min
                  <br />
                  vs. semana anterior
                </span>
              </div>

              <div className="clean-line-chart">
                <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="520" y2="20" />
                  <line x1="0" y1="55" x2="520" y2="55" />
                  <line x1="0" y1="90" x2="520" y2="90" />
                  <line x1="0" y1="125" x2="520" y2="125" />

                  <polyline points="10,130 85,108 165,82 245,42 325,70 405,22 500,72" />

                  <circle cx="10" cy="130" r="6" />
                  <circle cx="85" cy="108" r="6" />
                  <circle cx="165" cy="82" r="6" />
                  <circle cx="245" cy="42" r="6" />
                  <circle cx="325" cy="70" r="6" />
                  <circle cx="405" cy="22" r="6" />
                  <circle cx="500" cy="72" r="6" />
                </svg>

                <div className="chart-days">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </div>
            </div>
          </article>

          <article className="stats-panel ideas-panel">
            <img src={zorroIdeas} alt="Zorrito ideas" className="ideas-fox" />

            <div className="panel-title">
              <span className="panel-icon idea-title-icon">
                <FaLightbulb />
              </span>
              <h2>Ideas para mejorar</h2>
            </div>

            <div className="idea purple">
              <span className="idea-icon">
                <FiZap />
              </span>
              <div>
                <b>Practica Geometría para mejorar tu dominio.</b>
                <p>Tu rendimiento en este tema puede mejorar.</p>
              </div>
              <button>Practicar ahora</button>
            </div>

            <div className="idea green">
              <span className="idea-icon">
                <FiBarChart2 />
              </span>
              <div>
                <b>Mantén tu racha activa cada día.</b>
                <p>¡5 días seguidos! Intenta llegar a 7.</p>
              </div>
              <button>Ver racha</button>
            </div>

            <div className="idea orange">
              <span className="idea-icon">
                <FaStar />
              </span>
              <div>
                <b>¡Estás en el camino correcto!</b>
                <p>Sigue así y alcanza nuevas metas.</p>
              </div>
              <button>Ver metas</button>
            </div>
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button
              className="footer-icon-btn"
              onClick={() => navigate("/login")}
            >
              <FiLogOut className="logout-icon" />
            </button>

            <FiHelpCircle className="help-icon" />
            <FiSettings className="settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Estadisticas;
