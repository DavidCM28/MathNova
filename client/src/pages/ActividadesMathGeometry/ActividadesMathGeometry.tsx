import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-mathGeometri.png";
import profesor from "../../assets/profesor-explicando.png";
import byteRobot from "../../assets/byte-sigue-explorando.png";
import zorritoHola from "../../assets/hola-explorador-mathgeometry.png";

import actividad1 from "../../assets/Actividad 1-MathGeometry.png";
import actividad2 from "../../assets/Actividad 2-MathGeometry.png";
import actividad3 from "../../assets/Actividad-3-MathGeometry.png";
import actividad4 from "../../assets/Actividad-4-MathGeometry.png";
import actividad5 from "../../assets/Actividad-5-MathGeometry.png";
import actividad6 from "../../assets/Actividad-6-MathGeometry.png";
import actividad7 from "../../assets/Actividad-7-MathGeometry.png";
import actividad8 from "../../assets/Actividad-8-MathGeometry.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function ActividadesMathGeometry() {
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

  const actividades = [
    {
      img: actividad1,
      titulo: "El Constructor de Caminos",
      texto:
        "Une puntos para formar figuras como triángulos, cuadrados y rectángulos.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad2,
      titulo: "La Ruta Perdida",
      texto: "Completa los caminos conectando los puntos correctos.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad3,
      titulo: "Detectores de Giro",
      texto: "Identifica si los ángulos son agudos, rectos u obtusos.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad4,
      titulo: "Cruce de Láser",
      texto: "Señala los láser según las instrucciones dadas.",
      nivel: "Medio",
      tiempo: "12 min",
    },
    {
      img: actividad5,
      titulo: "El Taller del Ingeniero",
      texto: "Encuentra el punto medio en segmentos de recta.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad6,
      titulo: "El Escudo Perfecto",
      texto:
        "Selecciona la línea que divide mejor el ángulo en dos partes iguales.",
      nivel: "Medio",
      tiempo: "12 min",
    },
    {
      img: actividad7,
      titulo: "La Fortaleza Triangular",
      texto: "Identifica rectas importantes dentro de triángulos.",
      nivel: "Medio",
      tiempo: "12 min",
    },
    {
      img: actividad8,
      titulo: "El Centro de Control",
      texto: "Reconoce las diagonales en cuadriláteros.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
  ];

  return (
    <main className="geomx-page">
      <button
        className={`geomx-hamburger-btn ${
          menuOpen ? "geomx-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="geomx-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`geomx-sidebar ${menuOpen ? "geomx-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="geomx-sidebar-logo" />

        <nav className="geomx-sidebar-menu">
          <button className="geomx-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="geomx-menu-item geomx-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="geomx-sidebar-bottom">
          <div className="geomx-hello-box">
            <img src={zorritoHola} alt="Zorrito explorador" />
            <span>¡Hola, explorador!</span>
          </div>

          <div className="geomx-weekly-progress">
            <div className="geomx-weekly-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="geomx-star-progress">
              <span>☆</span>
              <div>
                <b></b>
              </div>
            </div>

            <p>60%</p>

            <img src={byteRobot} alt="Byte explorando" />
            <small>¡Sigue explorando!</small>
          </div>
        </div>
      </aside>

      <section className="geomx-content">
        <img src={heroBanner} alt="Banner Geometry" className="geomx-bg" />

        <section className="geomx-main">
          <div className="geomx-breadcrumb-bar">
            <button onClick={() => irARuta("/seleccion-mundos")}>Mundos</button>

            <span>›</span>

            <strong>Actividades MathGeometry</strong>
          </div>

          <div className="geomx-header">
            <div className="geomx-title-box">
              <h1>Actividades</h1>
              <p>
                Practica geometría con retos, juegos y ejercicios interactivos.
              </p>

              <div className="geomx-status-tabs">
                <button>
                  <FiCircle />
                  Pendientes
                </button>

                <button>
                  <FiCircle />
                  En curso
                </button>

                <button>
                  <FiCheckCircle />
                  Completadas
                </button>
              </div>
            </div>

            <div className="geomx-search-area">
              <div className="geomx-search-box">
                <FiSearch />
                <input placeholder="Buscar actividades o temas..." />
              </div>

              <button className="geomx-filter-btn">
                <FiFilter />
                Filtros
              </button>
            </div>
          </div>

          <h2 className="geomx-section-title">1. Rectas y Ángulos</h2>

          <div className="geomx-activities-grid">
            {actividades.slice(0, 4).map((item, index) => (
              <article className="geomx-activity-card" key={index}>
                <img src={item.img} alt={item.titulo} />

                <div className="geomx-activity-info">
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>

                  <span
                    className={
                      item.nivel === "Fácil" ? "geomx-easy" : "geomx-medium"
                    }
                  >
                    {item.nivel}
                  </span>

                  <div className="geomx-activity-bottom">
                    <small>
                      <FiClock />
                      {item.tiempo}
                    </small>

                    <button>Iniciar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <h2 className="geomx-section-title">
            2. Construcción y propiedades de las figuras planas y cuerpos
          </h2>

          <div className="geomx-activities-grid">
            {actividades.slice(4, 8).map((item, index) => (
              <article className="geomx-activity-card" key={index}>
                <img src={item.img} alt={item.titulo} />

                <div className="geomx-activity-info">
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>

                  <span
                    className={
                      item.nivel === "Fácil" ? "geomx-easy" : "geomx-medium"
                    }
                  >
                    {item.nivel}
                  </span>

                  <div className="geomx-activity-bottom">
                    <small>
                      <FiClock />
                      {item.tiempo}
                    </small>

                    <button>Iniciar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <img
          src={profesor}
          alt="Profesor explicando"
          className="geomx-profesor-img"
        />

        <footer className="geomx-footer">
          <div className="geomx-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut className="geomx-logout-icon" />
            </button>

            <FiHelpCircle className="geomx-help-icon" />
            <FiSettings className="geomx-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathGeometry;
