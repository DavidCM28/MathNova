import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CalificacionesDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";
import heroCalificaciones from "../../assets/hero-banner-calificaciones-docente.png";

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
  FiBookOpen,
  FiCalendar,
  FiSearch,
  FiPlus,
  FiUserCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

function CalificacionesDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("calificaciones");

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

  const seleccionarMenu = (menu: string) => {
    setSelectedMenu(menu);
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const alumnos = [
    {
      numero: "1",
      iniciales: "MF",
      nombre: "Mariana Fuentes Ruiz",
      color: "blue",
      tarea1: "9.2",
      tarea2: "9.5",
      examen: "9.8",
      proyecto: "9.5",
      promedio: "9.5",
      estado: "excelente",
    },
    {
      numero: "2",
      iniciales: "SJ",
      nombre: "Santiago Jiménez López",
      color: "purple",
      tarea1: "8.5",
      tarea2: "8.8",
      examen: "8.0",
      proyecto: "9.0",
      promedio: "8.6",
      estado: "bien",
    },
    {
      numero: "3",
      iniciales: "SA",
      nombre: "Ana Sofía García",
      color: "orange",
      tarea1: "8.0",
      tarea2: "9.0",
      examen: "7.5",
      proyecto: "8.8",
      promedio: "8.3",
      estado: "bien",
    },
    {
      numero: "4",
      iniciales: "DG",
      nombre: "Diego Hernández",
      color: "gray",
      tarea1: "7.0",
      tarea2: "8.0",
      examen: "6.5",
      proyecto: "8.0",
      promedio: "7.4",
      estado: "pendiente",
    },
    {
      numero: "5",
      iniciales: "LM",
      nombre: "Lucía Medina",
      color: "silver",
      tarea1: "7.5",
      tarea2: "7.0",
      examen: "7.0",
      proyecto: "7.5",
      promedio: "7.3",
      estado: "pendiente",
    },
    {
      numero: "6",
      iniciales: "CT",
      nombre: "Carla Torres",
      color: "green",
      tarea1: "8.8",
      tarea2: "9.0",
      examen: "9.0",
      proyecto: "9.2",
      promedio: "9.0",
      estado: "bien",
    },
    {
      numero: "7",
      iniciales: "OL",
      nombre: "Óscar López",
      color: "yellow",
      tarea1: "6.0",
      tarea2: "6.5",
      examen: "6.0",
      proyecto: "6.8",
      promedio: "6.3",
      estado: "alerta",
    },
    {
      numero: "8",
      iniciales: "VS",
      nombre: "Valeria Sánchez",
      color: "violet",
      tarea1: "7.8",
      tarea2: "8.2",
      examen: "7.5",
      proyecto: "8.0",
      promedio: "7.9",
      estado: "pendiente",
    },
  ];

  return (
    <main className="docente-page">
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
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
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
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
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
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <button
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
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

      <section className="docente-content calificaciones-content">
        <section className="calif-header">
          <div className="calif-title-box">
            <h1>Calificaciones</h1>
            <p>Revisa y actualiza el rendimiento académico de tus alumnos.</p>
          </div>

          <img
            src={heroCalificaciones}
            alt="Calificaciones docente"
            className="calif-hero-img"
          />
        </section>

        <section className="calif-filters">
          <button className="calif-filter-card">
            <FiUsers />
            <div>
              <small>Grupo</small>
              <strong>2°A - Secundaria</strong>
            </div>
            <FiChevronDown className="filter-chevron" />
          </button>

          <button className="calif-filter-card">
            <FiBookOpen />
            <div>
              <small>Módulo</small>
              <strong>Álgebra</strong>
            </div>
            <FiChevronDown className="filter-chevron" />
          </button>

          <button className="calif-filter-card">
            <FiCalendar />
            <div>
              <small>Periodo</small>
              <strong>Mayo - Junio 2024</strong>
            </div>
            <FiChevronDown className="filter-chevron" />
          </button>

          <label className="calif-search">
            <FiSearch />
            <input type="text" placeholder="Buscar alumno..." />
          </label>

          <button className="calif-register-btn">
            <FiPlus />
            Registrar calificación
          </button>
        </section>

        <section className="calif-stats-row">
          <article className="calif-stat-card green">
            <div>
              <h3>Promedio del grupo</h3>
              <strong>8.2</strong>
            </div>
            <span className="calif-stat-icon">
              <FiBarChart2 />
            </span>
          </article>

          <article className="calif-stat-card blue">
            <div>
              <h3>Aprobados</h3>
              <strong>
                26 <small>(86.7%)</small>
              </strong>
            </div>
            <span className="calif-stat-icon">
              <FiUserCheck />
            </span>
          </article>

          <article className="calif-stat-card orange">
            <div>
              <h3>Pendientes de evaluar</h3>
              <strong>
                8 <small>(13.3%)</small>
              </strong>
            </div>
            <span className="calif-stat-icon">
              <FiClipboard />
            </span>
          </article>

          <article className="calif-stat-card purple">
            <div>
              <h3>Mejor promedio</h3>
              <strong>
                9.8 <small>Mariana Fuentes Ruiz</small>
              </strong>
            </div>
            <span className="calif-stat-icon">
              <FiAward />
            </span>
          </article>
        </section>

        <section className="calif-main-grid">
          <article className="calif-table-card">
            <div className="calif-table">
              <div className="calif-table-row calif-table-head">
                <span>#</span>
                <span>Alumno</span>
                <span>
                  Tarea 1 <small>(20%)</small>
                </span>
                <span>
                  Tarea 2 <small>(20%)</small>
                </span>
                <span>
                  Examen <small>(30%)</small>
                </span>
                <span>
                  Proyecto <small>(30%)</small>
                </span>
                <span>
                  Promedio <small>(100%)</small>
                </span>
                <span></span>
              </div>

              {alumnos.map((alumno) => (
                <div className="calif-table-row" key={alumno.numero}>
                  <span className="calif-number">{alumno.numero}</span>

                  <span className="calif-student">
                    <b className={`student-avatar ${alumno.color}`}>
                      {alumno.iniciales}
                    </b>
                    {alumno.nombre}
                  </span>

                  <span>{alumno.tarea1}</span>
                  <span>{alumno.tarea2}</span>
                  <span>{alumno.examen}</span>
                  <span>{alumno.proyecto}</span>

                  <span>
                    <b
                      className={`calif-average ${
                        Number(alumno.promedio) >= 8.5
                          ? "good"
                          : Number(alumno.promedio) >= 7
                            ? "medium"
                            : "bad"
                      }`}
                    >
                      {alumno.promedio}
                    </b>
                  </span>

                  <span className={`calif-status ${alumno.estado}`}>
                    {alumno.estado === "excelente" && <FiAward />}
                    {alumno.estado === "bien" && <FiCheckCircle />}
                    {alumno.estado === "pendiente" && <FiAlertCircle />}
                    {alumno.estado === "alerta" && <FiAlertCircle />}
                  </span>
                </div>
              ))}
            </div>

            <div className="calif-table-footer">
              <p>Mostrando 1 a 8 de 30 alumnos</p>

              <div className="calif-pagination">
                <button>
                  <FiChevronLeft />
                </button>
                <button className="active-page">1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </article>

          <aside className="calif-side-panel">
            <article className="calif-chart-card">
              <h2>Promedio por actividad</h2>

              <div className="bar-chart">
                <div className="bar-item">
                  <strong>8.1</strong>
                  <span className="bar blue-bar"></span>
                  <small>
                    Tarea 1<br />
                    (20%)
                  </small>
                </div>

                <div className="bar-item">
                  <strong>8.4</strong>
                  <span className="bar green-bar"></span>
                  <small>
                    Tarea 2<br />
                    (20%)
                  </small>
                </div>

                <div className="bar-item">
                  <strong>7.8</strong>
                  <span className="bar orange-bar"></span>
                  <small>
                    Examen
                    <br />
                    (30%)
                  </small>
                </div>

                <div className="bar-item">
                  <strong>8.3</strong>
                  <span className="bar purple-bar"></span>
                  <small>
                    Proyecto
                    <br />
                    (30%)
                  </small>
                </div>
              </div>
            </article>

            <article className="calif-top-card">
              <h2>Top 5 del grupo</h2>

              {[
                ["1", "Mariana Fuentes Ruiz", "9.5"],
                ["2", "Carla Torres", "9.0"],
                ["3", "Santiago Jiménez López", "8.6"],
                ["4", "Ana Sofía García", "8.3"],
                ["5", "Valeria Sánchez", "7.9"],
              ].map((item, index) => (
                <div className="top-row" key={index}>
                  <span className={`top-rank top-${index + 1}`}>{item[0]}</span>
                  <p>{item[1]}</p>
                  <b>{item[2]}</b>
                </div>
              ))}
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button onClick={() => irARuta("/login")}>
              <FiLogOut className="logout-icon" />
            </button>

            <button>
              <FiHelpCircle className="help-icon" />
            </button>

            <button>
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default CalificacionesDocente;
