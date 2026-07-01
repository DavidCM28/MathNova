import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-mathGeometri.png";
import profesor from "../../assets/profesor-explicando.png";
import byteRobot from "../../assets/byte-sigue-explorando.png";

import actividad1 from "../../assets/Actividad 1-MathGeometry.png";
import actividad2 from "../../assets/Actividad 2-MathGeometry.png";

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
  FiPlayCircle,
  FiStar,
  FiTarget,
  FiBookOpen,
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
      numero: "01",
      titulo: "El Constructor de Caminos",
      texto:
        "Une puntos para formar figuras como triángulos, cuadrados y rectángulos.",
      nivel: "Fácil",
      tiempo: "10 min",
      estado: "Pendiente",
      ruta: "/actividades/geometria/actividad-1",
    },
    {
      img: actividad2,
      numero: "02",
      titulo: "La Ruta Perdida",
      texto: "Completa los caminos conectando los puntos correctos.",
      nivel: "Fácil",
      tiempo: "10 min",
      estado: "Pendiente",
      ruta: "/actividades/geometria/actividad-2",
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

        <div className="geomx-sidebar-mascot">
          <img src={profesor} alt="Profesor MathGeometry" />
        </div>
      </aside>

      <section className="geomx-content">
        <img src={heroBanner} alt="Banner Geometry" className="geomx-bg" />

        <section className="geomx-main">
          <div className="geomx-breadcrumb">
            <button type="button" onClick={() => irARuta("/seleccion-mundos")}>
              Mundos
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              Actividades MathGeometry
            </button>
          </div>

          <div className="geomx-header">
            <div className="geomx-title-box">
              <h1>Actividades</h1>

              <p>
                Practica geometría con retos sencillos, visuales e interactivos.
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

          <div className="geomx-summary-row">
            <article>
              <FiBookOpen />
              <div>
                <strong>2</strong>
                <span>Actividades</span>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <strong>1</strong>
                <span>Tema principal</span>
              </div>
            </article>

            <article>
              <FiStar />
              <div>
                <strong>Fácil</strong>
                <span>Nivel recomendado</span>
              </div>
            </article>
          </div>

          <section className="geomx-activities-panel">
            <div className="geomx-section-heading">
              <span>Tema 1</span>

              <div>
                <h2>Rectas y Ángulos</h2>
                <p>
                  Inicia con actividades cortas para reconocer puntos, segmentos
                  y caminos dentro de figuras geométricas.
                </p>
              </div>
            </div>

            <div className="geomx-activities-zone">
              <div className="geomx-activities-grid">
                {actividades.map((item, index) => (
                  <article
                    className={`geomx-activity-card geomx-card-${index + 1}`}
                    key={item.titulo}
                  >
                    <div className="geomx-activity-image">
                      <img src={item.img} alt={item.titulo} />
                      <span className="geomx-card-number">{item.numero}</span>
                    </div>

                    <div className="geomx-activity-info">
                      <div className="geomx-card-tags">
                        <span className="geomx-easy">{item.nivel}</span>
                        <span className="geomx-state">{item.estado}</span>
                      </div>

                      <h3>{item.titulo}</h3>

                      <p>{item.texto}</p>

                      <div className="geomx-activity-bottom">
                        <small>
                          <FiClock />
                          {item.tiempo}
                        </small>

                        <button onClick={() => irARuta(item.ruta)}>
                          <FiPlayCircle />
                          Iniciar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <article className="geomx-side-progress-card">
                <div className="geomx-weekly-head">
                  <strong>Progreso semanal</strong>
                  <span>Nivel 3</span>
                </div>

                <div className="geomx-star-progress">
                  <span>☆</span>

                  <strong>60%</strong>

                  <div>
                    <b></b>
                  </div>
                </div>

                <img src={byteRobot} alt="Byte explorando" />

                <small>¡Sigue explorando!</small>
              </article>
            </div>
          </section>
        </section>

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
