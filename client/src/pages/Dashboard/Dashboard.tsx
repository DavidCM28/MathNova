import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import logo from "../../assets/logo_MathNova.png";
import heroBanner from "../../assets/Hero-Banner.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import leccionesIcon from "../../assets/lecciones-completadas.png";
import estrellasIcon from "../../assets/estrellas-totales.png";
import rachaIcon from "../../assets/racha.png";
import promedioIcon from "../../assets/promedio-general.png";
import algebraIcon from "../../assets/icono-algebra-basica.png";
import geometriaIcon from "../../assets/geometria.png";
import numerosIcon from "../../assets/numeros.png";
import estadisticaIcon from "../../assets/estadistica.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowRight,
  FiMoreHorizontal,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function Dashboard() {
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
    <main className="dashboard-page">
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
          <button className="menu-item active">
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/temas/numeros")}>
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/temas/numeros")}>
            <FiBookOpen />
            <span>Temas</span>
          </button>

          <button className="menu-item">
            <FiEdit />
            <span>Actividades</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/retroalimentacion")}>
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button className="menu-item">
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/perfil-alumno")}>
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/estadisticas")}>
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
            <span className="bar blue tall"></span>
            <span className="bar green"></span>
            <span className="bar blue large"></span>
            <span className="bar green tall"></span>
          </div>
        </div>
      </aside>

      <section className="dashboard-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Bienvenido al Dashboard Principal</h1>
            <p>
              Aprende, practica y mejora tus habilidades de observación paso a
              paso.
            </p>

            <div className="hero-actions">
              <button
                className="primary-action"
                onClick={() => irARuta("/temas/numeros")}
              >
                Comenzar ahora <FiArrowRight />
              </button>

              <button
                className="secondary-action"
                onClick={() => irARuta("/estadisticas")}
              >
                Ver mi progreso <FiBarChart2 />
              </button>
            </div>
          </div>

          <img src={heroBanner} alt="Hero MathNova" className="hero-img" />
        </section>

        <section className="stats-row">
          <article className="stat-card green-card">
            <div>
              <h3>Lecciones completadas</h3>
              <strong>12</strong>
              <p>+3 esta semana</p>
            </div>
            <img src={leccionesIcon} alt="Lecciones" />
          </article>

          <article className="stat-card yellow-card">
            <div>
              <h3>Estrellas totales</h3>
              <strong>850</strong>
              <p>¡Sigue sumando estrellas!</p>
            </div>
            <img src={estrellasIcon} alt="Estrellas" />
          </article>

          <article className="stat-card red-card">
            <div>
              <h3>Racha actual</h3>
              <strong>5</strong>
              <p>¡Sigue así!</p>
            </div>
            <img src={rachaIcon} alt="Racha" />
          </article>

          <article className="stat-card blue-card">
            <div>
              <h3>Promedio general</h3>
              <strong>78%</strong>
              <p>Buen trabajo</p>
            </div>
            <img src={promedioIcon} alt="Promedio" />
          </article>
        </section>

        <section className="bottom-section">
          <article className="continue-card">
            <h2>Continúa donde lo dejaste</h2>

            <div className="course-progress">
              <img src={algebraIcon} alt="Álgebra básica" />

              <div className="course-info">
                <div className="course-header">
                  <h3>Álgebra Básica</h3>
                  <FiMoreHorizontal />
                </div>

                <div className="progress-line">
                  <span className="progress-blue"></span>
                  <span className="progress-green"></span>
                </div>
              </div>

              <strong>65%</strong>
            </div>
          </article>

          <article className="modules-card">
            <h2>Módulos recomendados</h2>

            <div className="modules-list">
              <button
                className="module-item"
                type="button"
                onClick={() => irARuta("/temas/geometria")}
              >
                <img src={geometriaIcon} alt="Geometría" />
                <span>Geometría</span>
              </button>

              <button
                className="module-item"
                type="button"
                onClick={() => irARuta("/temas/numeros")}
              >
                <img src={numerosIcon} alt="Números" />
                <span>Números</span>
              </button>

              <button
                className="module-item"
                type="button"
                onClick={() => irARuta("/estadisticas")}
              >
                <img src={estadisticaIcon} alt="Estadística" />
                <span>Estadística</span>
              </button>
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

export default Dashboard;