import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EvaluacionesDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";

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
  FiUser,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiTrendingUp,
  FiChevronRight,
  FiBookOpen,
  FiPieChart,
  FiBarChart,
  FiAward,
} from "react-icons/fi";

function EvaluacionesDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("evaluaciones");

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

  const evaluaciones = [
    {
      icono: <FiBookOpen />,
      color: "blue",
      nombre: "Fracciones equivalentes",
      modulo: "Módulo 3: Fracciones",
      tipo: "Quiz",
      fecha: "22 may 2024",
      duracion: "30 min",
      grupo: "2°A",
      estado: "Activa",
    },
    {
      icono: <FiClipboard />,
      color: "purple",
      nombre: "Examen: Operaciones mixtas",
      modulo: "Módulo 2: Operaciones",
      tipo: "Examen",
      fecha: "28 may 2024",
      duracion: "60 min",
      grupo: "2°A",
      estado: "Programada",
    },
    {
      icono: <FiBookOpen />,
      color: "orange",
      nombre: "Proyecto: Mi presupuesto",
      modulo: "Módulo 4: Porcentajes",
      tipo: "Proyecto",
      fecha: "5 jun 2024",
      duracion: "7 días",
      grupo: "2°A",
      estado: "Programada",
    },
    {
      icono: <FiClipboard />,
      color: "green",
      nombre: "Decimales y redondeo",
      modulo: "Módulo 3: Decimales",
      tipo: "Quiz",
      fecha: "15 may 2024",
      duracion: "25 min",
      grupo: "2°A",
      estado: "Cerrada",
    },
    {
      icono: <FiAward />,
      color: "violet",
      nombre: "Ecuaciones lineales",
      modulo: "Módulo 5: Álgebra",
      tipo: "Examen",
      fecha: "8 may 2024",
      duracion: "45 min",
      grupo: "2°A",
      estado: "Cerrada",
    },
    {
      icono: <FiBookOpen />,
      color: "orange",
      nombre: "Proyecto: Figuras 3D",
      modulo: "Módulo 1: Geometría",
      tipo: "Proyecto",
      fecha: "30 abr 2024",
      duracion: "5 días",
      grupo: "2°A",
      estado: "Calificada",
    },
    {
      icono: <FiClipboard />,
      color: "blue",
      nombre: "Ángulos y triángulos",
      modulo: "Módulo 1: Geometría",
      tipo: "Quiz",
      fecha: "22 abr 2024",
      duracion: "20 min",
      grupo: "2°A",
      estado: "Calificada",
    },
  ];

  const recientes = [
    ["Decimales y redondeo", "15 may 2024", "82%", "green"],
    ["Ecuaciones lineales", "9 may 2024", "74%", "orange"],
    ["Proyecto: Figuras 3D", "30 abr 2024", "88%", "green"],
    ["Ángulos y triángulos", "22 abr 2024", "68%", "red"],
  ];

  return (
    <main className="eval-page">
      <button
        className={`eval-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="eval-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`eval-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="eval-sidebar-scroll">
          <img src={logo} alt="MathNova" className="eval-sidebar-logo" />

          <nav className="eval-sidebar-menu">
            <button
              className={`eval-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="eval-menu-group">
              <button
                className="eval-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`eval-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`eval-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`eval-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="eval-menu-divider"></div>

            <div className="eval-menu-group">
              <button
                className="eval-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`eval-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`eval-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`eval-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`eval-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="eval-menu-divider"></div>

            <button
              className={`eval-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`eval-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`eval-menu-item ${
                selectedMenu === "evaluaciones" ? "active" : ""
              }`}
              onClick={() => seleccionarMenu("evaluaciones")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`eval-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => seleccionarMenu("estadisticas")}
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="eval-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="eval-content">
        <header className="eval-header">
          <div>
            <h1>Evaluaciones</h1>
            <p>
              Crea, programa y revisa evaluaciones para medir el aprendizaje de
              tus alumnos.
            </p>
          </div>

          <button className="eval-bell-btn">
            <FiBell />
          </button>
        </header>

        <section className="eval-toolbar">
          <div className="eval-toolbar-actions">
            <button className="eval-new-btn">
              <FiPlus />
              Nueva evaluación
            </button>

            <button className="eval-bank-btn">
              <FiBookOpen />
              Banco de preguntas
            </button>
          </div>

          <div className="eval-toolbar-field">
            <label>Grupo</label>
            <select>
              <option>2°A - Matemáticas</option>
              <option>1°B - Matemáticas</option>
              <option>3°A - Matemáticas</option>
            </select>
          </div>

          <div className="eval-toolbar-field">
            <label>Módulo / Unidad</label>
            <select>
              <option>Todos los módulos</option>
              <option>Fracciones</option>
              <option>Geometría</option>
              <option>Álgebra</option>
            </select>
          </div>

          <div className="eval-search-box">
            <FiSearch />
            <input type="text" placeholder="Buscar evaluación..." />
          </div>

          <button className="eval-filter-btn">
            <FiFilter />
          </button>
        </section>

        <section className="eval-stats-row">
          <article className="eval-stat-card green">
            <div>
              <h3>Evaluaciones activas</h3>
              <strong>8</strong>
            </div>
            <span>
              <FiClipboard />
            </span>
          </article>

          <article className="eval-stat-card orange">
            <div>
              <h3>Próximas</h3>
              <strong>3</strong>
            </div>
            <span>
              <FiCalendar />
            </span>
          </article>

          <article className="eval-stat-card red">
            <div>
              <h3>Sin calificar</h3>
              <strong>17</strong>
            </div>
            <span>
              <FiUser />
            </span>
          </article>

          <article className="eval-stat-card blue">
            <div>
              <h3>Promedio obtenido</h3>
              <strong>78%</strong>
            </div>
            <span>
              <FiTrendingUp />
            </span>
          </article>
        </section>

        <section className="eval-main-grid">
          <article className="eval-card eval-table-card">
            <div className="eval-card-title">
              <h2>Todas las evaluaciones</h2>
            </div>

            <div className="eval-table">
              <div className="eval-table-row eval-table-head">
                <span>Evaluación</span>
                <span>Tipo</span>
                <span>Fecha</span>
                <span>Duración</span>
                <span>Grupo</span>
                <span>Estado</span>
                <span></span>
              </div>

              {evaluaciones.map((item, index) => (
                <div className="eval-table-row" key={index}>
                  <div className="eval-name-cell">
                    <div className={`eval-icon ${item.color}`}>
                      {item.icono}
                    </div>
                    <div>
                      <h4>{item.nombre}</h4>
                      <p>{item.modulo}</p>
                    </div>
                  </div>

                  <span className={`eval-type ${item.tipo.toLowerCase()}`}>
                    {item.tipo}
                  </span>

                  <span>{item.fecha}</span>
                  <span>{item.duracion}</span>
                  <span>{item.grupo}</span>

                  <span
                    className={`eval-status ${item.estado
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {item.estado}
                  </span>

                  <button className="eval-more-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              ))}
            </div>

            <button className="eval-see-all">
              Ver todas las evaluaciones
              <FiChevronRight />
            </button>
          </article>

          <aside className="eval-right-column">
            <article className="eval-card eval-next-card">
              <div>
                <h3>Próxima evaluación</h3>
                <h2>Examen: Operaciones mixtas</h2>

                <p>
                  <FiUsers />
                  2°A - Matemáticas
                </p>

                <p>
                  <FiCalendar />
                  28 mayo 2024 · 10:00 a.m.
                </p>

                <p>
                  <FiClock />
                  Duración: 60 minutos · Total de puntos: 100
                </p>

                <h4>Instrucciones para los alumnos:</h4>
                <p className="eval-next-description">
                  Lee cuidadosamente cada pregunta. Muestra tu procedimiento y
                  revisa tu trabajo antes de enviar.
                </p>
              </div>

              <div className="eval-next-icon">
                <FiCalendar />
              </div>

              <button>Ver detalles</button>
            </article>

            <div className="eval-small-grid">
              <article className="eval-card eval-results-card">
                <h2>Resultados recientes</h2>
                <p className="eval-muted">Últimas 4 evaluaciones cerradas</p>

                {recientes.map((item, index) => (
                  <div className="eval-result-row" key={index}>
                    <div>
                      <h4>{item[0]}</h4>
                      <p>{item[1]}</p>
                    </div>
                    <strong className={`result-${item[3]}`}>{item[2]}</strong>
                  </div>
                ))}

                <button>
                  Ver reporte completo
                  <FiChevronRight />
                </button>
              </article>

              <article className="eval-card eval-distribution-card">
                <h2>Distribución de puntajes</h2>
                <p className="eval-muted">
                  Última evaluación: Decimales y redondeo
                </p>

                <div className="distribution-chart">
                  <FiPieChart />
                </div>

                <div className="distribution-row">
                  <span className="dot green"></span>
                  <p>90 - 100</p>
                  <strong>30%</strong>
                </div>

                <div className="distribution-row">
                  <span className="dot blue"></span>
                  <p>70 - 89</p>
                  <strong>40%</strong>
                </div>

                <div className="distribution-row">
                  <span className="dot orange"></span>
                  <p>50 - 69</p>
                  <strong>20%</strong>
                </div>

                <div className="distribution-row">
                  <span className="dot red"></span>
                  <p>0 - 49</p>
                  <strong>10%</strong>
                </div>

                <button>
                  Ver análisis detallado
                  <FiChevronRight />
                </button>
              </article>
            </div>

            <article className="eval-card eval-calendar-card">
              <div className="eval-calendar-top">
                <h2>Calendario de evaluaciones</h2>

                <div className="calendar-legend">
                  <span>
                    <i className="active"></i>
                    Activa
                  </span>
                  <span>
                    <i className="next"></i>
                    Próxima
                  </span>
                  <span>
                    <i className="program"></i>
                    Programada
                  </span>
                </div>
              </div>

              <div className="calendar-month">
                <button>‹</button>
                <strong>Mayo 2024</strong>
                <button>›</button>
              </div>

              <div className="calendar-days">
                {[
                  ["L", "20", ""],
                  ["M", "21", "active"],
                  ["X", "22", ""],
                  ["J", "23", ""],
                  ["V", "24", ""],
                  ["S", "25", ""],
                  ["D", "26", ""],
                  ["L", "27", ""],
                  ["M", "28", "next"],
                  ["X", "29", ""],
                  ["J", "30", "program"],
                ].map((day, index) => (
                  <div className={`calendar-day ${day[2]}`} key={index}>
                    <span>{day[0]}</span>
                    <strong>{day[1]}</strong>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <footer className="eval-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="eval-footer-icons">
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

export default EvaluacionesDocente;
