import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MisGruposDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";
import heroMisGrupos from "../../assets/hero-banner-docentes-mis-grupos.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiCalendar,
  FiUserPlus,
  FiEye,
  FiArrowRight,
  FiPieChart,
} from "react-icons/fi";

function MisGruposDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("ver-grupos");

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

  const grupos = [
    {
      nombre: "2°A",
      alumnos: "24 alumnos",
      modulo: "Geometría",
      promedio: "85%",
      color: "blue",
      actividad: "Triángulos y sus tipos",
      fecha: "13 may 2025",
    },
    {
      nombre: "2°B",
      alumnos: "22 alumnos",
      modulo: "Fracciones",
      promedio: "78%",
      color: "purple",
      actividad: "Suma y resta de fracciones",
      fecha: "14 may 2025",
    },
    {
      nombre: "1°C",
      alumnos: "26 alumnos",
      modulo: "Números y operaciones",
      promedio: "88%",
      color: "green",
      actividad: "Multiplicación por 2 cifras",
      fecha: "13 may 2025",
    },
    {
      nombre: "3°A",
      alumnos: "24 alumnos",
      modulo: "Álgebra",
      promedio: "76%",
      color: "orange",
      actividad: "Expresiones algebraicas",
      fecha: "15 may 2025",
    },
  ];

  return (
    <main className="mgd-page">
      <button
        className={`mgd-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="mgd-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`mgd-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="mgd-sidebar-scroll">
          <img src={logo} alt="MathNova" className="mgd-sidebar-logo" />

          <nav className="mgd-sidebar-menu">
            <button
              className={`mgd-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="mgd-menu-group">
              <button
                className="mgd-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`mgd-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => seleccionarMenu("ver-grupos")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="mgd-menu-divider"></div>

            <div className="mgd-menu-group">
              <button
                className="mgd-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`mgd-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`mgd-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="mgd-menu-divider"></div>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="mgd-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="mgd-content">
        <section className="mgd-header">
          <div className="mgd-header-text">
            <h1>Mis grupos</h1>
            <p>Administra y revisa los grupos que tienes a tu cargo.</p>
          </div>

          <img
            src={heroMisGrupos}
            alt="Mis grupos docente"
            className="mgd-hero-img"
          />
        </section>

        <section className="mgd-filter-card">
          <div className="mgd-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar grupo por nombre o grado..."
            />
          </div>

          <label className="mgd-filter-box">
            <span>Filtrar por grado</span>
            <select>
              <option>Todos</option>
              <option>1°</option>
              <option>2°</option>
              <option>3°</option>
            </select>
          </label>

          <label className="mgd-filter-box">
            <span>Filtrar por módulo</span>
            <select>
              <option>Todos</option>
              <option>Geometría</option>
              <option>Fracciones</option>
              <option>Álgebra</option>
            </select>
          </label>

          <button className="mgd-create-btn">
            <FiPlus />
            Crear grupo
          </button>
        </section>

        <section className="mgd-stats-row">
          <article className="mgd-stat-card blue-card">
            <div>
              <h3>Total de grupos</h3>
              <strong>4</strong>
              <p>Activos este ciclo</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUsers />
            </div>
          </article>

          <article className="mgd-stat-card green-card">
            <div>
              <h3>Alumnos totales</h3>
              <strong>96</strong>
              <p>En todos tus grupos</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUserPlus />
            </div>
          </article>

          <article className="mgd-stat-card orange-card">
            <div>
              <h3>Promedio general</h3>
              <strong>82%</strong>
              <p>Rendimiento promedio</p>
            </div>

            <div className="mgd-stat-icon">
              <FiPieChart />
            </div>
          </article>
        </section>

        <section className="mgd-main-grid">
          <section className="mgd-groups-grid">
            {grupos.map((grupo, index) => (
              <article className="mgd-group-card" key={index}>
                <div className="mgd-group-top">
                  <h2 className={`mgd-title-${grupo.color}`}>{grupo.nombre}</h2>

                  <span className="mgd-students-pill">
                    <FiUsers />
                    {grupo.alumnos}
                  </span>
                </div>

                <div className="mgd-group-info">
                  <div>
                    <span>Módulo principal</span>
                    <strong>{grupo.modulo}</strong>
                  </div>

                  <div>
                    <span>Promedio del grupo</span>
                    <strong className={`mgd-average-${grupo.color}`}>
                      {grupo.promedio}
                    </strong>
                  </div>
                </div>

                <div className="mgd-next-activity">
                  <FiCalendar />
                  <span>
                    Próxima actividad: <b>{grupo.actividad}</b>
                  </span>
                  <small>{grupo.fecha}</small>
                </div>

                <div className="mgd-card-actions">
                  <button>
                    <FiEye />
                    Ver detalle
                  </button>

                  <button>
                    <FiEdit />
                    Editar
                  </button>

                  <button className="enter-btn">
                    <FiArrowRight />
                    Entrar
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="mgd-right-column">
            <article className="mgd-side-card mgd-sessions-card">
              <div className="mgd-side-title">
                <h2>
                  <FiCalendar />
                  Próximas sesiones
                </h2>

                <button>Ver calendario</button>
              </div>

              <div className="mgd-session-item">
                <span className="session-dot green">A</span>
                <div>
                  <strong>2°A Geometría</strong>
                  <p>Triángulos y sus tipos</p>
                </div>
                <small>
                  13 may
                  <br />
                  10:00 a. m.
                </small>
              </div>

              <div className="mgd-session-item">
                <span className="session-dot purple">B</span>
                <div>
                  <strong>2°B Fracciones</strong>
                  <p>Suma y resta</p>
                </div>
                <small>
                  14 may
                  <br />
                  11:00 a. m.
                </small>
              </div>

              <div className="mgd-session-item">
                <span className="session-dot orange">C</span>
                <div>
                  <strong>3°A Álgebra</strong>
                  <p>Expresiones algebraicas</p>
                </div>
                <small>
                  15 may
                  <br />
                  9:00 a. m.
                </small>
              </div>
            </article>

            <article className="mgd-side-card mgd-reminders-card">
              <h2>
                <FiBell />
                Recordatorios del grupo
              </h2>

              <p>
                <span className="mini-dot green"></span>
                <b>2°A</b> 3 actividades pendientes de revisión.
              </p>

              <p>
                <span className="mini-dot purple"></span>
                <b>2°B</b> 2 alumnos sin entregar la tarea.
              </p>

              <p>
                <span className="mini-dot orange"></span>
                <b>3°A</b> Evaluación diagnóstica disponible.
              </p>

              <p>
                <span className="mini-dot blue"></span>
                <b>1°C</b> Revisar resultados del quiz semanal.
              </p>

              <button>Ver todos los recordatorios</button>
            </article>
          </aside>
        </section>

        <footer className="mgd-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="mgd-footer-icons">
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

export default MisGruposDocente;
