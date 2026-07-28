import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";
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
  FiLock,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

const API_URL = "http://localhost:3001/api";

function ActividadesMathData() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // El ID del estudiante se obtiene de la sesión activa en cada render
  const usuarioSesion = getSessionUser();
  const ID_ESTUDIANTE = usuarioSesion?.id_usuario;

  // completadas[0] = Generador de Energía, [1] = Rampas, [2] = Tripulación, [3] = Holograma
  const [completadas, setCompletadas] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  // ==========================================
  // CARGAR ESTADO DE LAS 4 ACTIVIDADES
  // ==========================================

  useEffect(() => {
    const cargarEstado = async () => {
      try {
        const response = await fetch(`${API_URL}/progreso-general/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          setCompletadas([
            data.data.proporcionalidad,
            data.data.rampas,
            data.data.tripulacion,
            data.data.holograma,
          ]);
        }
      } catch (error) {
        console.error("Error al cargar el estado de las actividades:", error);
      }
    };

    cargarEstado();
  }, []);

  // La actividad 0 siempre está desbloqueada; las demás necesitan que la
  // anterior (índice - 1) esté completada. Las actividades 4 en adelante
  // (índice 4+) todavía no tienen backend propio, así que no se bloquean.
  const estaDesbloqueada = (index: number) => {
    if (index === 0) return true;
    if (index >= 4) return true;
    return completadas[index - 1];
  };

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
            {actividades.map((item, index) => {
              const bloqueada = !estaDesbloqueada(index);

              return (
                <article
                  className={`mathdatax-activity-card ${
                    bloqueada ? "mathdatax-activity-bloqueada" : ""
                  }`}
                  key={index}
                >
                  <div className="mathdatax-activity-img-wrap">
                    <img src={item.img} alt={item.titulo} />

                    {bloqueada && (
                      <div className="mathdatax-lock-overlay">
                        <FiLock />
                      </div>
                    )}
                  </div>

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
                        disabled={bloqueada}
                        onClick={() => {
                          if (bloqueada) return;

                          if (index === 0) {
                            navigate("/actividades-math-data/generador-energia");
                          } else if (index === 1) {
                            navigate("/actividades-math-data/rampas-lanzamiento");
                          } else if (index === 2) {
                            navigate("/actividades-math-data/encuesta-tripulacion");
                          } else if (index === 3) {
                            navigate("/actividades-math-data/holograma-reportes");
                          } else if (index === 4) {
                            navigate("/actividades-math-data/sensor-frecuencias");
                          } else if (index === 5) {
                            navigate("/actividades-math-data/nucleo-decisiones");
                          } else if (index === 6) {
                            navigate("/actividades-math-data/oraculo-estacion");
                          } else if (index === 7) {
                            navigate("/actividades-math-data/sala-tres-caminos");
                          }
                        }}
                      >
                        {bloqueada ? "Bloqueada" : "Iniciar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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