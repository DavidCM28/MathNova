import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EstadisticasDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";

import alumnaDocentes from "../../assets/alumna-docentes.png";
import alumnoDocentes from "../../assets/alumno-docentes.png";
import extraAlumnoDocente from "../../assets/extra-alumno-docente.png";

import algebraDocente from "../../assets/algebra-docente.png";
import geometriaDocente from "../../assets/geometria-docente.png";
import estadisticaDocente from "../../assets/estadistica-docente.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiDownload,
  FiCalendar,
  FiLayers,
  FiAward,
  FiTrendingUp,
  FiCheckSquare,
  FiStar,
  FiInfo,
  FiArrowUp,
  FiArrowRight,
  FiHome,
  FiShield,
} from "react-icons/fi";

function EstadisticasDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const alumnosDestacados = [
    {
      numero: "1",
      nombre: "Mariana Fuentes Ruiz",
      grupo: "2°A",
      promedio: "96",
      foto: alumnaDocentes,
      tipo: "oro",
    },
    {
      numero: "2",
      nombre: "Diego Hernández",
      grupo: "3°A",
      promedio: "94",
      foto: alumnoDocentes,
      tipo: "plata",
    },
    {
      numero: "3",
      nombre: "Santiago Jiménez",
      grupo: "2°B",
      promedio: "92",
      foto: alumnaDocentes,
      tipo: "bronce",
    },
    {
      numero: "4",
      nombre: "Valeria Sánchez",
      grupo: "1°C",
      promedio: "91",
      foto: alumnoDocentes,
      tipo: "normal",
    },
    {
      numero: "5",
      nombre: "Juan Ramírez",
      grupo: "2°A",
      promedio: "90",
      foto: extraAlumnoDocente,
      tipo: "normal",
    },
  ];

  return (
    <main className="stats-page">
      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="docente-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`docente-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="docente-sidebar-scroll">
          <img src={logo} alt="MathNova" className="docente-sidebar-logo" />

          <nav className="docente-sidebar-menu">
            <button
              className="docente-menu-item"
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className="docente-submenu-item"
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className="docente-submenu-item"
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className="docente-submenu-item"
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className="docente-submenu-item small-sub"
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className="docente-submenu-item"
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <button
              className="docente-menu-item"
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className="docente-menu-item"
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className="docente-menu-item"
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className="docente-menu-item active-soft"
              onClick={() => irARuta("/estadisticas-docente")}
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="docente-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="stats-content">
        <header className="stats-header">
          <div>
            <h1>Estadísticas</h1>
            <p>
              Analiza el desempeño académico y la participación de tus grupos.
            </p>
          </div>

          <div className="stats-filters">
            <button className="filter-card">
              <FiCalendar />
              <div>
                <span>Periodo</span>
                <strong>Mayo - Junio 2024</strong>
              </div>
              <FiChevronDown className="filter-arrow" />
            </button>

            <button className="filter-card">
              <FiUsers />
              <div>
                <span>Grupo</span>
                <strong>Todos los grupos</strong>
              </div>
              <FiChevronDown className="filter-arrow" />
            </button>

            <button className="filter-card">
              <FiLayers />
              <div>
                <span>Módulo</span>
                <strong>Todos los módulos</strong>
              </div>
              <FiChevronDown className="filter-arrow" />
            </button>

            <button className="export-btn">
              <FiDownload />
              Exportar reporte
            </button>
          </div>
        </header>

        <section className="stats-summary-row">
          <article className="summary-card blue-summary">
            <div>
              <h3>
                Promedio general <FiInfo />
              </h3>
              <strong>
                82 <span>/100</span>
              </strong>
              <p>
                <FiArrowUp /> 6.4 pts <small>vs. periodo anterior</small>
              </p>
            </div>

            <div className="summary-icon">
              <FiTrendingUp />
            </div>
          </article>

          <article className="summary-card green-summary">
            <div>
              <h3>
                Asistencia <FiInfo />
              </h3>
              <strong>93%</strong>
              <p>
                <FiArrowUp /> 4% <small>vs. periodo anterior</small>
              </p>
            </div>

            <div className="summary-icon">
              <FiUsers />
            </div>
          </article>

          <article className="summary-card orange-summary">
            <div>
              <h3>
                Actividades completadas <FiInfo />
              </h3>
              <strong>87%</strong>
              <p>
                <FiArrowUp /> 7% <small>vs. periodo anterior</small>
              </p>
            </div>

            <div className="summary-icon">
              <FiCheckSquare />
            </div>
          </article>

          <article className="summary-card purple-summary">
            <div>
              <h3>
                Nivel de logro <FiInfo />
              </h3>
              <strong>Alto</strong>
              <p>
                <small>Basado en el desempeño general</small>
              </p>
            </div>

            <div className="summary-icon">
              <FiAward />
            </div>
          </article>
        </section>

        <section className="stats-grid">
          <article className="stats-card evolution-card">
            <div className="card-title-row">
              <h2>
                Evolución del promedio <FiInfo />
              </h2>

              <button>
                Promedio de grupo <FiChevronDown />
              </button>
            </div>

            <div className="line-chart">
              <div className="chart-label y100">100</div>
              <div className="chart-label y75">75</div>
              <div className="chart-label y50">50</div>
              <div className="chart-label y25">25</div>
              <div className="chart-label y0">0</div>

              <svg viewBox="0 0 520 210" className="chart-svg">
                <line x1="35" y1="25" x2="505" y2="25" />
                <line x1="35" y1="68" x2="505" y2="68" />
                <line x1="35" y1="111" x2="505" y2="111" />
                <line x1="35" y1="154" x2="505" y2="154" />
                <line x1="35" y1="197" x2="505" y2="197" />

                <polyline
                  points="35,120 125,105 215,98 305,90 395,82 485,78"
                  className="area-line"
                />

                <polyline
                  points="35,120 125,105 215,98 305,90 395,82 485,78"
                  className="line-blue"
                />

                <circle cx="35" cy="120" r="5" />
                <circle cx="125" cy="105" r="5" />
                <circle cx="215" cy="98" r="5" />
                <circle cx="305" cy="90" r="5" />
                <circle cx="395" cy="82" r="5" />
                <circle cx="485" cy="78" r="5" />
              </svg>

              <div className="line-values">
                <span style={{ left: "9%" }}>68</span>
                <span style={{ left: "26%" }}>72</span>
                <span style={{ left: "43%" }}>75</span>
                <span style={{ left: "60%" }}>78</span>
                <span style={{ left: "77%" }}>81</span>
                <span style={{ left: "94%" }}>82</span>
              </div>

              <div className="months-row">
                <span>Ene</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </article>

          <article className="stats-card groups-card">
            <div className="card-title-row">
              <h2>
                Rendimiento por grupo <FiInfo />
              </h2>
            </div>

            <div className="bar-chart">
              <div className="bar-y-label y100">100</div>
              <div className="bar-y-label y75">75</div>
              <div className="bar-y-label y50">50</div>
              <div className="bar-y-label y25">25</div>
              <div className="bar-y-label y0">0</div>

              <div className="bars-area">
                <div className="bar-item">
                  <strong>88</strong>
                  <span className="bar bar-blue"></span>
                  <p>2°A</p>
                </div>

                <div className="bar-item">
                  <strong>82</strong>
                  <span className="bar bar-green"></span>
                  <p>2°B</p>
                </div>

                <div className="bar-item">
                  <strong>79</strong>
                  <span className="bar bar-yellow"></span>
                  <p>3°A</p>
                </div>

                <div className="bar-item">
                  <strong>74</strong>
                  <span className="bar bar-purple"></span>
                  <p>3°B</p>
                </div>

                <div className="bar-item">
                  <strong>70</strong>
                  <span className="bar bar-red"></span>
                  <p>1°C</p>
                </div>
              </div>

              <p className="bar-caption">Grupos</p>
            </div>
          </article>

          <article className="stats-card distribution-card">
            <div className="card-title-row">
              <h2>
                Distribución del desempeño <FiInfo />
              </h2>
            </div>

            <div className="distribution-body">
              <div className="donut-chart">
                <span className="donut-center"></span>

                <b className="donut-label label-green">30%</b>
                <b className="donut-label label-blue">28%</b>
                <b className="donut-label label-yellow">24%</b>
                <b className="donut-label label-orange">12%</b>
                <b className="donut-label label-red">6%</b>
              </div>

              <div className="donut-list">
                <div>
                  <span className="dot green"></span>
                  Excelente (90-100) <strong>30</strong>
                </div>

                <div>
                  <span className="dot blue"></span>
                  Bueno (75-89) <strong>28</strong>
                </div>

                <div>
                  <span className="dot yellow"></span>
                  Satisfactorio (60-74) <strong>24</strong>
                </div>

                <div>
                  <span className="dot orange"></span>
                  En desarrollo (40-59) <strong>12</strong>
                </div>

                <div>
                  <span className="dot red"></span>
                  Inicial (0-39) <strong>6</strong>
                </div>

                <div className="total-row">
                  Total de alumnos <strong>148</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="stats-card module-card">
            <div className="card-title-row">
              <h2>
                Desempeño por módulo <FiInfo />
              </h2>
            </div>

            <div className="module-legend">
              <span>
                <b className="legend-blue"></b>
                Promedio del grupo
              </span>

              <span>
                <b className="legend-gray"></b>
                Promedio global
              </span>
            </div>

            <div className="module-bars">
              <div className="module-item">
                <div className="module-values">
                  <b>84</b>
                  <b>78</b>
                </div>

                <div className="module-bar-group">
                  <span className="module-bar blue h84"></span>
                  <span className="module-bar gray h78"></span>
                </div>

                <div className="module-icon">
                  <img src={algebraDocente} alt="Álgebra" />
                </div>

                <p>Álgebra</p>
              </div>

              <div className="module-item">
                <div className="module-values">
                  <b>80</b>
                  <b>76</b>
                </div>

                <div className="module-bar-group">
                  <span className="module-bar blue h80"></span>
                  <span className="module-bar gray h76"></span>
                </div>

                <div className="module-icon">
                  <img src={geometriaDocente} alt="Geometría" />
                </div>

                <p>Geometría</p>
              </div>

              <div className="module-item">
                <div className="module-values">
                  <b>82</b>
                  <b>74</b>
                </div>

                <div className="module-bar-group">
                  <span className="module-bar blue h82"></span>
                  <span className="module-bar gray h74"></span>
                </div>

                <div className="module-icon">
                  <img src={estadisticaDocente} alt="Estadística" />
                </div>

                <p>Estadística</p>
              </div>
            </div>
          </article>

          <article className="stats-card students-card">
            <div className="card-title-row">
              <h2>
                Alumnos destacados <FiInfo />
              </h2>
            </div>

            <div className="students-list">
              {alumnosDestacados.map((alumno) => (
                <div className="student-row" key={alumno.numero}>
                  <span className={`student-rank ${alumno.tipo}`}>
                    {alumno.numero}
                  </span>

                  <img src={alumno.foto} alt={alumno.nombre} />

                  <p>{alumno.nombre}</p>

                  <span>{alumno.grupo}</span>

                  <strong>{alumno.promedio}</strong>

                  <FiStar className="star-icon" />
                </div>
              ))}
            </div>

            <button
              className="see-more-btn"
              onClick={() => irARuta("/lista-alumnos-docente")}
            >
              Ver todos los alumnos <FiArrowRight />
            </button>
          </article>

          <article className="stats-card improvement-card">
            <div className="card-title-row">
              <h2>
                Áreas de mejora <FiInfo />
              </h2>
            </div>

            <div className="improvement-head">
              <span>Área</span>
              <span>Promedio</span>
              <span>Alumnos a reforzar</span>
            </div>

            <div className="improvement-list">
              <div className="improvement-row">
                <p>Resolución de problemas</p>
                <div className="progress gray-progress">
                  <span className="progress-red"></span>
                </div>
                <strong className="red-text">58%</strong>
                <b className="red-pill">42</b>
              </div>

              <div className="improvement-row">
                <p>Fracciones y decimales</p>
                <div className="progress gray-progress">
                  <span className="progress-orange"></span>
                </div>
                <strong className="orange-text">63%</strong>
                <b className="orange-pill">37</b>
              </div>

              <div className="improvement-row">
                <p>Geometría plana</p>
                <div className="progress gray-progress">
                  <span className="progress-yellow"></span>
                </div>
                <strong className="yellow-text">68%</strong>
                <b className="yellow-pill">29</b>
              </div>

              <div className="improvement-row">
                <p>Ecuaciones lineales</p>
                <div className="progress gray-progress">
                  <span className="progress-green"></span>
                </div>
                <strong className="green-text">76%</strong>
                <b className="green-pill">19</b>
              </div>

              <div className="improvement-row">
                <p>Análisis de datos</p>
                <div className="progress gray-progress">
                  <span className="progress-green-two"></span>
                </div>
                <strong className="green-text">82%</strong>
                <b className="green-pill">12</b>
              </div>
            </div>

            <button className="see-more-btn">
              Ver recomendaciones <FiArrowRight />
            </button>
          </article>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button onClick={() => irARuta("/dashboard-docente")}>
              <FiHome className="home-icon" />
            </button>

            <button>
              <FiShield className="help-icon" />
            </button>

            <button>
              <FiSettings className="settings-icon" />
            </button>

            <button onClick={() => irARuta("/login")}>
              <FiLogOut className="logout-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default EstadisticasDocente;
