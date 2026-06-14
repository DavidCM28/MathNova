import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SeleccionMundos.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-seleccion-mundo.png";
import estrellaIcon from "../../assets/estrella-sigue-explorando.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import mundoGeometry from "../../assets/mundo-2-MathGeometry.png";
import mundoData from "../../assets/mundo-3-MathData.png";
import zorritoFooter from "../../assets/zorrito-footer.png";
import zorritoHola from "../../assets/zorrito-hola-explorador.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHome,
  FiShield,
  FiSettings,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup, GiRocket } from "react-icons/gi";

function SeleccionMundos() {
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
    <main className="mundos-page">
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

          <button className="menu-item active">
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

        <div className="sidebar-bottom">
          <div className="hello-box">
            <img src={zorritoHola} alt="Zorrito explorador" />
            <span>¡Hola, explorador!</span>
          </div>

          <div className="weekly-progress">
            <h3>Progreso semanal</h3>
            <div className="bars">
              <span className="bar red small"></span>
              <span className="bar blue"></span>
              <span className="bar yellow medium"></span>
              <span className="bar blue tall"></span>
              <span className="bar yellow large"></span>
              <span className="bar green"></span>
              <span className="bar blue large"></span>
              <span className="bar green tall"></span>
            </div>
          </div>
        </div>
      </aside>

      <section className="mundos-content">
        <section className="mundos-hero">
          <div className="mundos-title">
            <h1>Selección de mundos matemáticos</h1>
            <p>Explora, aprende y conquista nuevos mundos.</p>
          </div>

          <img
            src={heroBanner}
            alt="Banner mundos matemáticos"
            className="mundos-hero-img"
          />

          <article className="mundos-stars-card">
            <h3>Estrellas totales</h3>

            <div className="mundos-stars-row">
              <strong>850</strong>
              <span>⭐</span>
            </div>

            <p>Sigue explorando y gana más estrellas</p>
          </article>
        </section>

        <section className="worlds-grid">
          <article className="world-card">
            <div className="world-image green-world">
              <h2>math Numbers</h2>
              <img src={mundoNumbers} alt="Math Numbers" />
            </div>

            <div className="world-progress">
              <div className="level-pill green-pill">
                <strong>Nivel 4</strong>
                <span>120</span>
              </div>
              <div className="progress-track">
                <span className="progress-fill green-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/temas/numeros")}>
              <GiRocket />
              Explorar math Numbers
            </button>
          </article>

          <article className="world-card">
            <div className="world-image orange-world">
              <h2>math Geometry</h2>
              <img src={mundoGeometry} alt="Math Geometry" />
            </div>

            <div className="world-progress">
              <div className="level-pill orange-pill">
                <strong>Intermedio</strong>
                <span>150</span>
              </div>
              <div className="progress-track">
                <span className="progress-fill orange-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/temas/geometria")}>
              <GiRocket />
              Explorar math Geometry
            </button>
          </article>

          <article className="world-card">
            <div className="world-image blue-world">
              <h2>math Data</h2>
              <img src={mundoData} alt="Math Data" />
            </div>

            <div className="world-progress">
              <div className="level-pill blue-pill">
                <strong>Avanzado</strong>
                <span>200</span>
              </div>
              <div className="progress-track">
                <span className="progress-fill blue-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/estadisticas")}>
              <GiRocket />
              Explorar math Data
            </button>
          </article>
        </section>

        <section className="reward-banner">
          <img src={estrellaIcon} alt="Estrella" />

          <div>
            <h2>¡Cada mundo tiene nuevos retos y recompensas!</h2>
            <p>
              Explora todos los mundos y conviértete en un Maestro de las
              Matemáticas.
            </p>
          </div>

          <img
            src={zorritoFooter}
            alt="Zorrito saludando"
            className="footer-fox"
          />
        </section>

        <footer className="mundos-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button onClick={() => navigate("/")}>
              <FiHome />
            </button>
            <button>
              <FiShield />
            </button>
            <button>
              <FiSettings />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default SeleccionMundos;
