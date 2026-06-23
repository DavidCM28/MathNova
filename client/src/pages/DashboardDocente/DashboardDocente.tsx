import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroDocente from "../../assets/hero-banner-docentes.png";
import holaProfe from "../../assets/hola-profe-docente.png";

import algebraDocente from "../../assets/algebra-docente.png";
import geometriaDocente from "../../assets/geometria-docente.png";
import estadisticaDocente from "../../assets/estadistica-docente.png";

import puntosEstrellas from "../../assets/puntos-estrellas-docente.png";

import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiUser,
  FiAlertTriangle,
  FiAward,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

function DashboardDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("dashboard");

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

      <section className="docente-content">
        <section className="docente-hero">
          <div className="docente-hero-text">
            <h1>Bienvenido al Dashboard Docente</h1>
            <p>
              Gestiona tus grupos, revisa actividades y da seguimiento al
              progreso de tus alumnos.
            </p>

            <div className="docente-hero-actions">
              <button
                className="docente-primary-btn"
                onClick={() => seleccionarMenu("crear-grupo")}
              >
                <FiPlus />
                Crear grupo
              </button>

              <button
                className="docente-secondary-btn"
                onClick={() => irARuta("/mis-grupos-docente")}
              >
                <FiUserPlus />
                Ver mis grupos
              </button>
            </div>
          </div>

          <img
            src={heroDocente}
            alt="Dashboard docente"
            className="docente-hero-img"
          />
        </section>

        <section className="docente-stats-row">
          <article className="docente-stat-card green-card">
            <div>
              <h3>Grupos activos</h3>
              <strong>6</strong>
            </div>
            <div className="stat-icon-circle">
              <FiUsers />
            </div>
          </article>

          <article className="docente-stat-card yellow-card">
            <div>
              <h3>Alumnos registrados</h3>
              <strong>148</strong>
            </div>
            <div className="stat-icon-circle">
              <FiUser />
            </div>
          </article>

          <article className="docente-stat-card red-card">
            <div>
              <h3>Actividades por revisar</h3>
              <strong>12</strong>
            </div>
            <div className="stat-icon-circle">
              <FiClipboard />
            </div>
          </article>
        </section>

        <section className="docente-main-grid">
          <article className="docente-card lag-card">
            <h2>
              <FiAlertTriangle />
              Alumnos rezagados
            </h2>

            <div className="docente-table">
              <div className="table-row table-head">
                <span>Alumno</span>
                <span>Grupo</span>
                <span>Tema</span>
                <span>Situación</span>
              </div>

              <div className="table-row">
                <span className="student-name blue-dot">Emiliano Morales</span>
                <span>2°B</span>
                <span></span>
                <span className="tag red-tag">Bajo rendimiento</span>
              </div>

              <div className="table-row">
                <span className="student-name light-dot">Valeria Sánchez</span>
                <span>1°C</span>
                <span></span>
                <span className="tag orange-tag">Tareas pendientes</span>
              </div>

              <div className="table-row">
                <span className="student-name gray-dot">Jose Ramírez</span>
                <span>2°A</span>
                <span></span>
                <span className="tag strong-red-tag">Sin entregar</span>
              </div>

              <div className="table-row">
                <span className="student-name green-dot">Camila Torres</span>
                <span>1°C</span>
                <span></span>
                <span className="tag red-tag">Bajo rendimiento</span>
              </div>

              <div className="table-row">
                <span className="student-name yellow-dot">Oscar López</span>
                <span>2°B</span>
                <span></span>
                <span className="tag green-tag">Asistencia baja</span>
              </div>
            </div>
          </article>

          <article className="docente-card performance-card">
            <h2>
              <FiAward />
              Mejor desempeño
            </h2>

            <div className="performance-list">
              <div className="performance-row performance-head">
                <span>#</span>
                <span>Alumno</span>
                <span>Grupo</span>
                <span>Puntos/Estrellas</span>
                <span></span>
              </div>

              {[
                ["1", "Mariana Fernanda Ruiz", "2°A", "320"],
                ["2", "Santiago Jiménez", "1°B", "250"],
                ["3", "Ana Sofía García", "3°A", "210"],
                ["4", "Diego Hernández", "1°C", "129"],
                ["5", "Lucía Medina", "3°B", "90"],
              ].map((item, index) => (
                <div className="performance-row" key={index}>
                  <span className={`rank rank-${index + 1}`}>{item[0]}</span>
                  <span>{item[1]}</span>
                  <span>{item[2]}</span>
                  <span>{item[3]}</span>
                  <img src={puntosEstrellas} alt="Estrella" />
                </div>
              ))}
            </div>
          </article>

          <aside className="docente-right-column">
            <article className="docente-card resources-card">
              <h2>Recursos recomendados</h2>

              <div className="resources-list">
                <button>
                  <img src={algebraDocente} alt="Álgebra" />
                  <span>Álgebra</span>
                </button>

                <button>
                  <img src={geometriaDocente} alt="Geometría" />
                  <span>Geometría</span>
                </button>

                <button>
                  <img src={estadisticaDocente} alt="Estadística" />
                  <span>Estadística</span>
                </button>
              </div>
            </article>

            <article className="docente-card notices-card">
              <h2>
                <FiBell />
                Avisos
              </h2>

              <p>• Retroalimentación: entrega de calificaciones viernes.</p>
              <p>• Nueva guía de evaluación disponible.</p>
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

export default DashboardDocente;
