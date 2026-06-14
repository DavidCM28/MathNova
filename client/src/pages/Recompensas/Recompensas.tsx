import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Recompensas.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import estrellasTotales from "../../assets/estrellas-totales2.png";
import insigniasGanadas from "../../assets/insignias-ganadas.png";
import nivelActual from "../../assets/nivel-actual.png";
import rachaActual from "../../assets/racha-actual.png";

import primerosPasos from "../../assets/primeros-pasos.png";
import diezLogros from "../../assets/diez-logros.png";
import aprendizDedicado from "../../assets/aprendiz-dedicado.png";
import menteMatematica from "../../assets/mente-matematica.png";
import estrellaConstante from "../../assets/estrella-constante.png";

import avatares from "../../assets/avatares.png";
import marcos from "../../assets/marcos.png";
import stickers from "../../assets/stickers.png";
import trofeos from "../../assets/trofeos.png";
import proximaRecompensa from "../../assets/proxima-recompensa.png";
import avatarAstroNova from "../../assets/avatar-astro-nova.png";
import avatarhola from "../../assets/zorrito-hola-explorador.png";
import heroRecompensas from "../../assets/hero-banner-recompensas.png";
import estrellaRe from "../../assets/estrella-re.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiArrowRight,
  FiHome,
  FiShield,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function Recompensas() {
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
    <main className="recompensas-page">
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
            <span>Selección de mundos </span>
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

          <button
            className="menu-item active"
            onClick={() => irARuta("/recompensas")}
          >
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

        <div className="explorer-card">
          <img src={avatarhola} alt="Explorador" />
          <p>
            ¡Hola,
            <br />
            explorador!
          </p>
        </div>

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

      <section className="recompensas-content">
        <header className="recompensas-header">
          <div>
            <h1>Recompensas</h1>
            <p>Celebra tus logros y desbloquea nuevos premios.</p>
          </div>

          <img
            src={heroRecompensas}
            alt="Recompensas"
            className="hero-rewards-img"
          />
        </header>

        <section className="rewards-stats">
          <article className="reward-stat yellow-stat">
            <div>
              <h3>Estrellas totales</h3>
              <strong>850</strong>
              <p>¡Sigue sumando estrellas!</p>
            </div>

            <div className="icon-circle">
              <img src={estrellasTotales} alt="Estrellas" />
            </div>
          </article>

          <article className="reward-stat blue-stat">
            <div>
              <h3>Insignias ganadas</h3>
              <strong>18</strong>
              <p>¡Vas por un gran camino!</p>
            </div>

            <div className="icon-circle">
              <img src={insigniasGanadas} alt="Insignias" />
            </div>
          </article>

          <article className="reward-stat purple-stat">
            <div>
              <h3>Nivel actual</h3>
              <strong>Nivel 7</strong>
              <p>Explorador Estelar</p>
            </div>

            <div className="icon-circle">
              <img src={nivelActual} alt="Nivel" />
            </div>
          </article>

          <article className="reward-stat green-stat">
            <div>
              <h3>Racha actual</h3>
              <strong>5</strong>
              <p>¡Sigue así!</p>
            </div>

            <div className="icon-circle">
              <img src={rachaActual} alt="Racha" />
            </div>
          </article>
        </section>

        <section className="main-rewards-grid">
          <article className="panel badges-panel">
            <div className="panel-head">
              <h2>Insignias ganadas</h2>
              <button>
                Ver todas <FiArrowRight />
              </button>
            </div>

            <div className="badges-grid">
              <div className="badge-card">
                <img src={primerosPasos} alt="Primeros Pasos" />
                <h4>Primeros Pasos</h4>
                <p>Completaste tu primera lección</p>
              </div>

              <div className="badge-card">
                <img src={diezLogros} alt="Diez Logros" />
                <h4>Diez Logros</h4>
                <p>Completaste 10 lecciones</p>
              </div>

              <div className="badge-card">
                <img src={aprendizDedicado} alt="Aprendiz Dedicado" />
                <h4>Aprendiz Dedicado</h4>
                <p>Completaste 5 temas</p>
              </div>

              <div className="badge-card">
                <img src={menteMatematica} alt="Mente Matemática" />
                <h4>Mente Matemática</h4>
                <p>Respondiste 50 problemas</p>
              </div>

              <div className="badge-card">
                <img src={estrellaConstante} alt="Estrella Constante" />
                <h4>Estrella Constante</h4>
                <p>Racha de 7 días</p>
              </div>
            </div>
          </article>

          <article className="panel unlock-panel">
            <div className="panel-head">
              <h2>Recompensas desbloqueables</h2>
              <button>
                Ver todas <FiArrowRight />
              </button>
            </div>

            <div className="unlock-grid">
              <div className="unlock-card">
                <h4>Avatares</h4>
                <strong>
                  4 <span>/ 12</span>
                </strong>
                <img src={avatares} alt="Avatares" />
              </div>

              <div className="unlock-card">
                <h4>Marcos</h4>
                <strong>
                  3 <span>/ 10</span>
                </strong>
                <img src={marcos} alt="Marcos" />
              </div>

              <div className="unlock-card">
                <h4>Stickers</h4>
                <strong>
                  8 <span>/ 20</span>
                </strong>
                <img src={stickers} alt="Stickers" />
              </div>

              <div className="unlock-card">
                <h4>Trofeos</h4>
                <strong>
                  2 <span>/ 8</span>
                </strong>
                <img src={trofeos} alt="Trofeos" />
              </div>
            </div>
          </article>

          <article className="panel next-panel">
            <h2>Próxima recompensa</h2>
            <p>¡Estás muy cerca de desbloquear algo increíble!</p>

            <div className="reward-progress-wrap">
              <div className="reward-progress-line">
                <span className="reward-check reward-check-1">✓</span>
                <span className="reward-check reward-check-2">✓</span>
                <span className="reward-check reward-check-3">✓</span>
                <span className="reward-dot"></span>
                <span className="reward-green-line"></span>
              </div>

              <div className="reward-gift-circle">
                <img src={proximaRecompensa} alt="Próxima recompensa" />
              </div>

              <div className="reward-empty-circle"></div>

              <div className="reward-missing">
                <span>Faltan</span>
                <b>150</b>
                <img src={estrellaRe} alt="Estrella" />
                <span>estrellas</span>
              </div>
            </div>

            <h3>
              <span>850</span> / 1000 estrellas
            </h3>
          </article>

          <article className="featured-reward">
            <div>
              <h3>
                Recompensa destacada <span>Épica</span>
              </h3>
              <h2>Avatar Astro Nova</h2>
              <p>Un avatar exclusivo para los exploradores más dedicados.</p>
              <button>Ver cómo obtenerla</button>
            </div>

            <img src={avatarAstroNova} alt="Avatar Astro Nova" />
          </article>
        </section>

        <footer className="recompensas-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button
              className="footer-icon-btn"
              onClick={() => navigate("/login")}
            >
              <FiLogOut className="logout-icon" />
            </button>
            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Recompensas;
