import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard/Dashboard.css";
import "./PerfilAlumno.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import alexPerfil from "../../assets/alex-perfil.png";
import estrellasPerfil from "../../assets/estrellas-totales-perfil.png";

import mundo1 from "../../assets/mundo-1-MathNumbers.png";
import mundo2 from "../../assets/mundo-2-MathGeometry.png";
import mundo3 from "../../assets/mundo-3-MathData.png";

import primerosPasos from "../../assets/primeros-pasos (2).png";
import explorador from "../../assets/explorador.png";
import calculadorAgil from "../../assets/calculador-agil.png";
import constancia from "../../assets/constancia.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHome,
  FiCalendar,
  FiClock,
  FiArrowUpRight,
  FiCheckCircle,
  FiAward,
  FiCheck,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup, GiFlame } from "react-icons/gi";

function PerfilAlumno() {
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
    <main className="dashboard-page perfil-layout">
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
            onClick={() => irARuta("/temas/numeros")}
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
          <button className="menu-item active">
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

        <div className="weekly-progress">
          <h3>Progreso semanal</h3>

          <div className="bars">
            <span className="bar red small"></span>
            <span className="bar blue"></span>
            <span className="bar yellow medium"></span>
            <span className="bar yellow tall"></span>
            <span className="bar green"></span>
            <span className="bar blue large"></span>
            <span className="bar green tall"></span>
          </div>
        </div>
      </aside>

      <section className="perfil-content">
        <header className="perfil-title">
          <h1>Perfil del alumno</h1>
          <p>Consulta tu información y tus logros.</p>
        </header>

        <section className="perfil-top-grid">
          <article className="perfil-main-card">
            <img src={alexPerfil} alt="Alex" className="alex-img" />

            <div className="perfil-name">
              <h2>Alex</h2>
              <span>⭐ Nivel 4 • Explorador Estelar</span>

              <div className="racha-box">
                <GiFlame />
                <div>
                  <p>Racha actual</p>
                  <strong>5 días</strong>
                </div>
              </div>
            </div>

            <div className="perfil-divider"></div>

            <div className="estrellas-box">
              <p>Estrellas totales</p>
              <div>
                <img src={estrellasPerfil} alt="Estrellas" />
                <strong>850</strong>
              </div>
              <span>¡Sigue así, vas increíble!</span>
            </div>
          </article>

          <article className="mini-card green-mini">
            <h3>Lecciones completadas</h3>
            <strong>12</strong>
            <FiBookOpen className="card-icon" />
          </article>

          <article className="mini-card blue-mini">
            <h3>Tiempo de estudio</h3>
            <strong>3h 45m</strong>
            <FiClock />
          </article>

          <article className="mini-card purple-mini">
            <h3>Progreso general</h3>
            <strong>65%</strong>
            <FiArrowUpRight />
          </article>
        </section>

        <section className="perfil-middle-grid">
          <article className="perfil-panel datos-panel">
            <h2>Datos del alumno</h2>

            <div className="dato-row">
              <FiUser />
              <span>Nombre completo</span>
              <strong>Alex Martínez</strong>
            </div>

            <div className="dato-row">
              <FiBookOpen />
              <span>Grado</span>
              <strong>4.º de Primaria</strong>
            </div>

            <div className="dato-row">
              <FiHome />
              <span>Escuela</span>
              <strong>Colegio Mathema</strong>
            </div>

            <div className="dato-row">
              <FiCalendar />
              <span>Miembro desde</span>
              <strong>Marzo 2024</strong>
            </div>
          </article>

          <article className="perfil-panel mundos-panel">
            <h2>Mundos completados</h2>

            <div className="mundos-list">
              <div className="mundo-item">
                <div className="mundo-img-box">
                  <img src={mundo1} alt="MathNumbers" />
                  <span className="check-badge">
                    <FiCheck />
                  </span>
                </div>
                <span>MathNumbers</span>
              </div>

              <div className="mundo-item">
                <div className="mundo-img-box">
                  <img src={mundo2} alt="MathGeometry" />
                  <span className="check-badge">
                    <FiCheck />
                  </span>
                </div>
                <span>MathGeometry</span>
              </div>

              <div className="mundo-item">
                <div className="mundo-img-box">
                  <img src={mundo3} alt="MathData" />
                  <span className="check-badge">
                    <FiCheck />
                  </span>
                </div>
                <span>MathData</span>
              </div>
            </div>

            <button
              className="ver-link"
              onClick={() => irARuta("/temas/numeros")}
            >
              Ver todos los mundos →
            </button>
          </article>

          <article className="perfil-panel insignias-panel">
            <div className="panel-header">
              <h2>Insignias destacadas</h2>
              <button className="ver-link">Ver todas</button>
            </div>

            <div className="insignias-list">
              <div className="insignia-item">
                <img src={primerosPasos} alt="Primeros Pasos" />
                <strong>Primeros Pasos</strong>
                <span>Completada</span>
              </div>

              <div className="insignia-item">
                <img src={explorador} alt="Explorador" />
                <strong>Explorador</strong>
                <span>Completada</span>
              </div>

              <div className="insignia-item">
                <img src={calculadorAgil} alt="Cálculo Ágil" />
                <strong>Cálculo Ágil</strong>
                <span>Completada</span>
              </div>

              <div className="insignia-item">
                <img src={constancia} alt="Constancia" />
                <strong>Constancia</strong>
                <span>Nivel 2</span>
              </div>
            </div>
          </article>
        </section>

        <section className="perfil-bottom-grid">
          <article className="perfil-panel actividad-panel">
            <h2>Actividad reciente</h2>

            <div className="actividad-row">
              <FiCheckCircle className="green-icon" />
              <span>Completaste la lección “Suma de fracciones”</span>
              <small>Hoy, 10:30 a.m.</small>
              <strong>⭐ +20</strong>
            </div>

            <div className="actividad-row">
              <FiAward className="purple-icon" />
              <span>Ganaste la insignia “Cálculo Ágil”</span>
              <small>Ayer, 4:15 p.m.</small>
              <strong>⭐ +50</strong>
            </div>

            <div className="actividad-row">
              <FiBookOpen className="blue-icon" />
              <span>Iniciaste la lección “Ángulos y triángulos”</span>
              <small>Ayer, 11:20 a.m.</small>
              <strong>⭐ +10</strong>
            </div>

            <button className="ver-link">Ver toda tu actividad →</button>
          </article>

          <article className="perfil-panel metas-panel">
            <div className="panel-header">
              <h2>Metas de la semana</h2>
              <span>Semana 20–26 de mayo</span>
            </div>

            <div className="meta-row">
              <FiBookOpen />
              <span>Completa 10 lecciones</span>
              <div className="meta-bar">
                <span style={{ width: "70%" }}></span>
              </div>
              <strong>7/10</strong>
              <b>⭐ +100</b>
            </div>

            <div className="meta-row">
              <FiClock />
              <span>Estudia 5 horas esta semana</span>
              <div className="meta-bar">
                <span style={{ width: "75%" }}></span>
              </div>
              <strong>3h 45m / 5h</strong>
              <b>⭐ +100</b>
            </div>

            <div className="meta-row">
              <FiEdit />
              <span>Resuelve 20 actividades</span>
              <div className="meta-bar">
                <span style={{ width: "70%" }}></span>
              </div>
              <strong>14/20</strong>
              <b>⭐ +100</b>
            </div>

            <button className="ver-link">Ver todas mis metas →</button>
          </article>
        </section>
      </section>
    </main>
  );
}

export default PerfilAlumno;
