import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathData.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-MathData.png";
import holaMathData from "../../assets/hola-MathData.png";

import actividad1 from "../../assets/Actividad-1-MathData.png";
import actividad2 from "../../assets/Actividad-2-MathData.png";
import actividad3 from "../../assets/Actividad-3-3MathData.png";
import actividad4 from "../../assets/Actividad-4-MathData.png";
import actividad5 from "../../assets/Actividad-5-MathData.png";
import actividad6 from "../../assets/Activity-6-MathData.png";
import actividad7 from "../../assets/Actividad-7-MathData.png";
import actividad8 from "../../assets/Actividad-8-MathData.png";
import actividad9 from "../../assets/Actividad-9-MathData.png";
import actividad10 from "../../assets/Actividad-10-MathData.png";

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

function ActividadesMathData() {
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
      titulo: "1. Generador de Energía",
      texto: "Completa la tabla de reactores y traza la gráfica.",
      nivel: "Fácil",
      tiempo: "12 min",
    },
    {
      img: actividad2,
      titulo: "2. Rampas de Lanzamiento",
      texto: "Calibra rampas identificando pendientes (+/-) y ecuaciones.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad3,
      titulo: "3. Encuesta de Tripulación",
      texto: "Diseña la encuesta y construye una tabla de frecuencias.",
      nivel: "Fácil",
      tiempo: "12 min",
    },
    {
      img: actividad4,
      titulo: "4. Holograma de Reportes",
      texto: "Transforma datos en gráficas de barras y circulares.",
      nivel: "Medio",
      tiempo: "15 min",
    },
    {
      img: actividad5,
      titulo: "5. Sensor de Frecuencias",
      texto: "Determina frecuencia absoluta y relativa (%) de señales.",
      nivel: "Fácil",
      tiempo: "8 min",
    },
    {
      img: actividad6,
      titulo: "6. Núcleo de Decisiones",
      texto: "Calcula media, mediana y moda para estimar tiempos.",
      nivel: "Medio",
      tiempo: "14 min",
    },
    {
      img: actividad7,
      titulo: "7. Oráculo de la Estación",
      texto: "Determina espacio muestral y compara cualitativamente eventos.",
      nivel: "Fácil",
      tiempo: "15 min",
    },
    {
      img: actividad8,
      titulo: "8. Sala de Tres Caminos",
      texto:
        "Clasifica eventos como independientes, dependientes o excluyentes.",
      nivel: "Fácil",
      tiempo: "8 min",
    },
    {
      img: actividad9,
      titulo: "9. Código de Combinaciones",
      texto:
        "Aplica procedimientos de conteo con multiplicación, aditivo, etc.",
      nivel: "Medio",
      tiempo: "11 min",
    },
    {
      img: actividad10,
      titulo: "10. Probabilidad Flash",
      texto: "Calcula probabilidades y toma decisiones basadas en azar.",
      nivel: "Medio",
      tiempo: "10 min",
    },
  ];

  return (
    <main className="mathdatax-page">
      <button
        className={`mathdatax-hamburger-btn ${
          menuOpen ? "mathdatax-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="mathdatax-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`mathdatax-sidebar ${
          menuOpen ? "mathdatax-sidebar-open" : ""
        }`}
      >
        <img src={logo} alt="MathNova" className="mathdatax-sidebar-logo" />

        <nav className="mathdatax-sidebar-menu">
          <button className="mathdatax-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="mathdatax-menu-item mathdatax-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mathdatax-sidebar-bottom">
          <div className="mathdatax-hello-box">
            <img src={holaMathData} alt="Explorador Math Data" />
            <span>¡Hola, explorador!</span>
          </div>

          <div className="mathdatax-weekly-progress">
            <div className="mathdatax-weekly-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 4</span>
            </div>

            <div className="mathdatax-star-progress">
              <span>☆</span>

              <div>
                <b></b>
              </div>

              <p>60%</p>
            </div>

            <div className="mathdatax-chart-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </aside>

      <section className="mathdatax-content">
        <img src={heroBanner} alt="Banner Math Data" className="mathdatax-bg" />

        <section className="mathdatax-main">
          <div className="mathdatax-header">
            <div className="mathdatax-title-box">
              <h1>Actividades de Math Data</h1>

              <p>Explora datos, tablas y gráficas con retos interactivos.</p>

              <div className="mathdatax-status-tabs">
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

            <div className="mathdatax-search-area">
              <div className="mathdatax-search-box">
                <FiSearch />
                <input placeholder="Buscar actividades o temas..." />
              </div>

              <button className="mathdatax-filter-btn">
                <FiFilter />
                Filtros
              </button>
            </div>
          </div>

          <div className="mathdatax-activities-grid">
            {actividades.map((item, index) => (
              <article className="mathdatax-activity-card" key={index}>
                <img src={item.img} alt={item.titulo} />

                <div className="mathdatax-activity-info">
                  <h3>{item.titulo}</h3>

                  <p>{item.texto}</p>

                  <span
                    className={
                      item.nivel === "Fácil"
                        ? "mathdatax-easy"
                        : "mathdatax-medium"
                    }
                  >
                    {item.nivel}
                  </span>

                  <div className="mathdatax-activity-bottom">
                    <small>
                      <FiClock />
                      {item.tiempo}
                    </small>

                    <button
                      onClick={() => {
                        if (index === 0) {
                          navigate("/actividades-math-data/generador-energia");
                        }
                      }}
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <footer className="mathdatax-footer">
          <div className="mathdatax-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut className="mathdatax-logout-icon" />
            </button>

            <FiHelpCircle className="mathdatax-help-icon" />
            <FiSettings className="mathdatax-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathData;
