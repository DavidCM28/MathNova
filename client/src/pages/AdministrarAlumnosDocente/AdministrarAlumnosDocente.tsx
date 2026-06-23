import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdministrarAlumnosDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";
import heroAdminAlumnos from "../../assets/hero-banner-admin-alumnos-docentes.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiPlus,
  FiUser,
  FiSearch,
  FiUpload,
  FiUserPlus,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiStar,
  FiCheckCircle,
  FiInfo,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";

function AdministrarAlumnosDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("administrar-alumnos");

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
      iniciales: "OM",
      nombre: "Orellana Martínez, Mariana",
      grupo: "2°B",
      modulo: "Ecuaciones lineales",
      asistencia: "96%",
      promedio: "8.6",
      estado: "Activo",
      color: "blue",
      barra: "alta",
    },
    {
      iniciales: "VS",
      nombre: "Valeria Sánchez Torres",
      grupo: "1°C",
      modulo: "Fracciones",
      asistencia: "88%",
      promedio: "7.4",
      estado: "Rezago",
      color: "purple",
      barra: "media",
    },
    {
      iniciales: "JR",
      nombre: "Juan Ramírez López",
      grupo: "2°A",
      modulo: "Áreas de figuras",
      asistencia: "92%",
      promedio: "8.1",
      estado: "Activo",
      color: "dark",
      barra: "alta",
    },
    {
      iniciales: "CT",
      nombre: "Carla Torres Mendoza",
      grupo: "1°C",
      modulo: "Proporciones",
      asistencia: "76%",
      promedio: "6.2",
      estado: "Rezago",
      color: "green",
      barra: "baja",
    },
    {
      iniciales: "OL",
      nombre: "Óscar López Hernández",
      grupo: "2°B",
      modulo: "Ecuaciones lineales",
      asistencia: "61%",
      promedio: "5.4",
      estado: "Rezago",
      color: "orange",
      barra: "critica",
    },
  ];

  return (
    <main className="admin-page">
      <button
        className={`admin-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="admin-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="admin-sidebar-scroll">
          <img src={logo} alt="MathNova" className="admin-sidebar-logo" />

          <nav className="admin-sidebar-menu">
            <button
              className={`admin-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="admin-menu-group">
              <button
                className="admin-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`admin-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`admin-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`admin-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="admin-menu-divider"></div>

            <div className="admin-menu-group">
              <button
                className="admin-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUser />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`admin-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`admin-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`admin-submenu-item ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`admin-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="admin-menu-divider"></div>

            <button
              className={`admin-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`admin-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`admin-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`admin-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="admin-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="admin-content">
        <section className="admin-top">
          <div className="admin-top-text">
            <h1>Administrar alumnos</h1>
            <p>
              Organiza, edita y da seguimiento al progreso académico de tus
              estudiantes.
            </p>
          </div>

          <img
            src={heroAdminAlumnos}
            alt="Administrar alumnos"
            className="admin-hero-img"
          />
        </section>

        <section className="admin-toolbar">
          <div className="admin-toolbar-buttons">
            <button className="admin-action-btn primary">
              <FiPlus />
              Agregar alumno
            </button>

            <button className="admin-action-btn">
              <FiUpload />
              Importar lista
            </button>

            <button className="admin-action-btn">
              <FiUserPlus />
              Asignar grupo
            </button>
          </div>

          <label className="admin-search">
            <FiSearch />
            <input type="text" placeholder="Buscar alumno..." />
          </label>
        </section>

        <section className="admin-stats-grid">
          <article className="admin-stat-card blue-card">
            <div>
              <h3>Total de alumnos</h3>
              <strong>148</strong>
              <p>+8 respecto al mes anterior</p>
            </div>
            <div className="admin-stat-icon">
              <FiUsers />
            </div>
          </article>

          <article className="admin-stat-card green-card">
            <div>
              <h3>Activos</h3>
              <strong>132</strong>
              <p>89% del total</p>
            </div>
            <div className="admin-stat-icon">
              <FiCheckCircle />
            </div>
          </article>

          <article className="admin-stat-card orange-card">
            <div>
              <h3>Rezago detectado</h3>
              <strong>16</strong>
              <p>11% del total</p>
            </div>
            <div className="admin-stat-icon">
              <FiAlertTriangle />
            </div>
          </article>

          <article className="admin-stat-card purple-card">
            <div>
              <h3>Promedio general</h3>
              <strong>7.8</strong>
              <p>+0.4 respecto al mes anterior</p>
            </div>
            <div className="admin-stat-icon">
              <FiStar />
            </div>
          </article>
        </section>

        <section className="admin-table-card">
          <div className="admin-table">
            <div className="admin-table-row admin-table-head">
              <span>Alumno</span>
              <span>Grupo</span>
              <span>Módulo</span>
              <span>Asistencia</span>
              <span>Promedio</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {alumnos.map((alumno, index) => (
              <div className="admin-table-row" key={index}>
                <span className="student-cell">
                  <b className={`student-avatar ${alumno.color}`}>
                    {alumno.iniciales}
                  </b>
                  {alumno.nombre}
                </span>

                <span>{alumno.grupo}</span>
                <span>{alumno.modulo}</span>

                <span className="attendance-cell">
                  {alumno.asistencia}
                  <i className={`attendance-line ${alumno.barra}`}></i>
                </span>

                <span
                  className={`average ${
                    Number(alumno.promedio) < 7 ? "low" : "good"
                  }`}
                >
                  {alumno.promedio}
                </span>

                <span>
                  <b
                    className={`status-pill ${
                      alumno.estado === "Activo" ? "activo" : "rezago"
                    }`}
                  >
                    {alumno.estado}
                  </b>
                </span>

                <span className="actions-cell">
                  <button>
                    <FiEye />
                  </button>
                  <button>
                    <FiEdit2 />
                  </button>
                  <button className="delete">
                    <FiTrash2 />
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="admin-table-bottom">
            <p>Mostrando 1 a 5 de 148 alumnos</p>

            <div className="pagination">
              <button>{"<"}</button>
              <button className="current">1</button>
              <button>2</button>
              <button>3</button>
              <button>{">"}</button>
            </div>
          </div>
        </section>

        <section className="admin-bottom-grid">
          <article className="admin-small-card recent-card">
            <h2>
              <FiInfo />
              Alumnos recientes
            </h2>

            <div className="recent-row">
              <span className="mini-avatar green">LM</span>
              <p>Lis Medina García</p>
              <b>12 may. 2025</b>
            </div>

            <div className="recent-row">
              <span className="mini-avatar pink">NG</span>
              <p>Natalia Gómez Ruiz</p>
              <b>10 may. 2025</b>
            </div>

            <div className="recent-row">
              <span className="mini-avatar blue">EP</span>
              <p>Emilio Pérez Juárez</p>
              <b>9 may. 2025</b>
            </div>

            <button className="link-btn">
              Ver todos los alumnos
              <span>→</span>
            </button>
          </article>

          <article className="admin-small-card alerts-card">
            <h2>
              <FiAlertTriangle />
              Alertas
            </h2>

            <div className="alert-line alert-red">
              <span></span>
              <p>16 alumnos presentan rezago en uno o más módulos.</p>
              <button>Ver detalles</button>
            </div>

            <div className="alert-line alert-orange">
              <span></span>
              <p>5 alumnos tienen asistencia menor al 70%.</p>
              <button>Ver detalles</button>
            </div>

            <div className="alert-line alert-blue">
              <span></span>
              <p>3 módulos próximos a evaluación final.</p>
              <button>Ver calendario</button>
            </div>
            <button className="link-btn">
              Ver todas las alertas
              <span>→</span>
            </button>
          </article>

          <article className="admin-small-card distribution-card">
            <h2>
              <FiPieChart />
              Distribución por grupo
            </h2>

            <div className="distribution-content">
              <div className="donut-chart"></div>

              <div className="group-list">
                <p>
                  <span className="dot blue"></span>
                  2°B <b>34 alumnos</b>
                </p>
                <p>
                  <span className="dot green"></span>
                  2°A <b>32 alumnos</b>
                </p>
                <p>
                  <span className="dot purple"></span>
                  1°C <b>31 alumnos</b>
                </p>
                <p>
                  <span className="dot orange"></span>
                  1°A <b>27 alumnos</b>
                </p>
              </div>
            </div>

            <button className="link-btn">
              Ver reporte completo
              <span>→</span>
            </button>
          </article>
        </section>

        <footer className="admin-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="admin-footer-icons">
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

export default AdministrarAlumnosDocente;
