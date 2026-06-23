import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesDocente.css";

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
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiPlus,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiBox,
  FiBarChart,
  FiList,
  FiBookOpen,
} from "react-icons/fi";

type MenuKey =
  | "dashboard"
  | "ver-grupos"
  | "crear-grupo"
  | "administrar-alumnos"
  | "lista"
  | "calificaciones"
  | "actividades"
  | "retroalimentacion"
  | "evaluaciones"
  | "estadisticas";

type ColorIcono = "blue" | "green" | "orange";

type ActividadBorrador = {
  titulo: string;
  modulo: string;
  fecha: string;
  grupo: string;
  icono: ReactNode;
  color: ColorIcono;
};

type ActividadProgreso = {
  titulo: string;
  fecha?: string;
  grupo?: string;
  progreso: string;
  porcentaje: string;
};

function ActividadesDocente() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [gruposOpen, setGruposOpen] = useState<boolean>(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState<boolean>(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("actividades");

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

  const seleccionarMenu = (menu: MenuKey) => {
    setSelectedMenu(menu);
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const borradores: ActividadBorrador[] = [
    {
      titulo: "Ecuaciones lineales - práctica",
      modulo: "Álgebra",
      fecha: "Sin fecha límite",
      grupo: "2°A",
      icono: <FiCheckCircle />,
      color: "blue",
    },
    {
      titulo: "Área de triángulos",
      modulo: "Geometría",
      fecha: "",
      grupo: "1°B",
      icono: <FiBox />,
      color: "green",
    },
    {
      titulo: "Introducción a la estadística",
      modulo: "Estadística",
      fecha: "",
      grupo: "3°A",
      icono: <FiBarChart />,
      color: "orange",
    },
  ];

  const publicadas: ActividadProgreso[] = [
    {
      titulo: "Ecuaciones lineales I",
      fecha: "Fecha límite: 24 may 2024",
      grupo: "2°A",
      progreso: "18/24",
      porcentaje: "75%",
    },
    {
      titulo: "Teorema de Pitágoras",
      fecha: "Fecha límite: 28 may 2024",
      grupo: "1°B",
      progreso: "16/20",
      porcentaje: "80%",
    },
    {
      titulo: "Gráficas de barras",
      fecha: "",
      grupo: "",
      progreso: "12/22",
      porcentaje: "55%",
    },
  ];

  const revision: ActividadProgreso[] = [
    {
      titulo: "Sistemas de ecuaciones",
      progreso: "8/24",
      porcentaje: "33%",
    },
    {
      titulo: "Ángulos y polígonos",
      progreso: "6/18",
      porcentaje: "33%",
    },
    {
      titulo: "Medidas de tendencia central",
      progreso: "10/20",
      porcentaje: "50%",
    },
  ];

  const completadas: ActividadProgreso[] = [
    {
      titulo: "Operaciones con fracciones",
      progreso: "18/18",
      porcentaje: "100%",
    },
    {
      titulo: "Circunferencia y círculo",
      progreso: "24/24",
      porcentaje: "100%",
    },
    {
      titulo: "Pictogramas",
      progreso: "20/20",
      porcentaje: "100%",
    },
  ];

  return (
    <main className="act-page">
      <button
        className={`act-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="act-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`act-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="act-sidebar-scroll">
          <img src={logo} alt="MathNova" className="act-sidebar-logo" />

          <nav className="act-sidebar-menu">
            <button
              className={`act-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente")}
              type="button"
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="act-menu-group">
              <button
                className="act-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
                type="button"
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`act-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`act-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente")}
                  type="button"
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`act-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                  type="button"
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="act-menu-divider"></div>

            <div className="act-menu-group">
              <button
                className="act-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
                type="button"
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`act-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`act-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                  type="button"
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`act-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                  type="button"
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`act-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => seleccionarMenu("calificaciones")}
                  type="button"
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="act-menu-divider"></div>

            <button
              className={`act-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
              type="button"
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`act-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => seleccionarMenu("retroalimentacion")}
              type="button"
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`act-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
              type="button"
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`act-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
              type="button"
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="act-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="act-content">
        <header className="act-header">
          <div>
            <h1>Actividades</h1>
            <p>
              Planea, publica y revisa actividades de aprendizaje para tus
              grupos.
            </p>
          </div>
        </header>

        <section className="act-filter-card">
          <div className="act-modules">
            <button className="module-btn active" type="button">
              Todos los módulos
            </button>

            <button className="module-btn" type="button">
              <FiCheckCircle />
              Álgebra
            </button>

            <button className="module-btn" type="button">
              <FiBox />
              Geometría
            </button>

            <button className="module-btn" type="button">
              <FiBarChart />
              Estadística
            </button>
          </div>

          <div className="act-top-actions">
            <button className="act-primary-btn" type="button">
              <FiPlus />
              Nueva actividad
            </button>

            <button className="act-template-btn" type="button">
              <FiFileText />
              Plantillas
            </button>
          </div>
        </section>

        <section className="act-search-card">
          <div className="act-search-box">
            <FiSearch />
            <input type="text" placeholder="Buscar actividades..." />
          </div>

          <select defaultValue="Todos los grupos">
            <option>Todos los grupos</option>
            <option>1°A</option>
            <option>1°B</option>
            <option>2°A</option>
            <option>3°A</option>
          </select>

          <select defaultValue="Todos los estados">
            <option>Todos los estados</option>
            <option>Borradores</option>
            <option>Publicadas</option>
            <option>En revisión</option>
            <option>Completadas</option>
          </select>
        </section>

        <section className="act-stats-row">
          <article className="act-stat-card green">
            <div>
              <h3>Actividades activas</h3>
              <strong>18</strong>
              <p>Publicadas y en curso</p>
            </div>
            <span>
              <FiCalendar />
            </span>
          </article>

          <article className="act-stat-card orange">
            <div>
              <h3>Por revisar</h3>
              <strong>12</strong>
              <p>Esperando revisión</p>
            </div>
            <span>
              <FiClipboard />
            </span>
          </article>

          <article className="act-stat-card blue">
            <div>
              <h3>Completadas</h3>
              <strong>36</strong>
              <p>Finalizadas por los alumnos</p>
            </div>
            <span>
              <FiAward />
            </span>
          </article>

          <article className="act-stat-card purple">
            <div>
              <h3>Próximas a vencer</h3>
              <strong>7</strong>
              <p>En los próximos 7 días</p>
            </div>
            <span>
              <FiCalendar />
            </span>
          </article>
        </section>

        <section className="act-board-layout">
          <section className="act-board">
            <article className="board-column draft">
              <div className="board-title">
                <h2>Borradores</h2>
                <span>4</span>
              </div>

              {borradores.map((item, index) => (
                <div className="activity-card" key={index}>
                  <div className={`activity-icon ${item.color}`}>
                    {item.icono}
                  </div>

                  <div className="activity-info">
                    <h3>{item.titulo}</h3>
                    <p>Módulo: {item.modulo}</p>
                    {item.fecha && <p>{item.fecha}</p>}
                    <p>Grupo: {item.grupo}</p>
                  </div>

                  <button className="small-edit-btn" type="button">
                    <FiEdit />
                  </button>
                </div>
              ))}

              <button className="new-activity-link" type="button">
                <FiPlus />
                Nueva actividad
              </button>
            </article>

            <article className="board-column published">
              <div className="board-title">
                <h2>Publicadas</h2>
                <span>7</span>
              </div>

              {publicadas.map((item, index) => (
                <div className="activity-progress-card" key={index}>
                  <h3>{item.titulo}</h3>
                  {item.fecha && <p>{item.fecha}</p>}
                  {item.grupo && <p>Grupo: {item.grupo}</p>}

                  <div className="progress-row">
                    <small>{item.progreso}</small>
                    <small>{item.porcentaje}</small>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill green-fill"
                      style={{ width: item.porcentaje }}
                    ></div>
                  </div>
                </div>
              ))}

              <button className="new-activity-link left" type="button">
                Nueva actividad
              </button>
            </article>

            <article className="board-column review">
              <div className="board-title">
                <h2>En revisión</h2>
                <span>3</span>
              </div>

              {revision.map((item, index) => (
                <div className="activity-progress-card" key={index}>
                  <h3>{item.titulo}</h3>

                  <div className="progress-row">
                    <small>{item.progreso}</small>
                    <small>{item.porcentaje}</small>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill orange-fill"
                      style={{ width: item.porcentaje }}
                    ></div>
                  </div>

                  {index === 0 && (
                    <button className="review-badge" type="button">
                      <FiClock />
                    </button>
                  )}
                </div>
              ))}
            </article>

            <article className="board-column completed">
              <div className="board-title">
                <h2>Completadas</h2>
                <span>4</span>
              </div>

              {completadas.map((item, index) => (
                <div className="activity-progress-card" key={index}>
                  <h3>{item.titulo}</h3>

                  <div className="progress-row">
                    <small>{item.progreso}</small>
                    <small>{item.porcentaje}</small>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill complete-fill"
                      style={{ width: item.porcentaje }}
                    ></div>
                  </div>
                </div>
              ))}
            </article>
          </section>

          <aside className="act-right-panel">
            <article className="side-card calendar-card">
              <h2>
                <FiCalendar />
                Calendario semanal
              </h2>

              <div className="calendar-list">
                <div>
                  <strong>Lun 20</strong>
                  <p>
                    <span className="dot blue"></span>
                    Ecuaciones lineales I
                  </p>
                  <small>Clase 2°A</small>
                </div>

                <div>
                  <strong>Mar 21</strong>
                  <p>
                    <span className="dot orange"></span>
                    Ángulos y polígonos
                  </p>
                  <small>Revisión pendiente</small>
                </div>

                <div>
                  <strong>Mié 22</strong>
                  <p>
                    <span className="dot blue"></span>
                    Sistemas de ecuaciones
                  </p>
                  <small>Fecha límite</small>
                </div>
              </div>

              <button className="view-calendar-btn" type="button">
                <FiCalendar />
                Ver calendario completo
              </button>
            </article>

            <article className="side-card resources-card">
              <h2>
                <FiBookOpen />
                Sugerencias de recursos
              </h2>

              <div className="resource-item">
                <span className="resource-icon green">
                  <FiFileText />
                </span>

                <div>
                  <h3>Video: Sistemas de ecuaciones</h3>
                  <p>Khan Academy</p>
                </div>

                <b>Álgebra</b>
              </div>

              <div className="resource-item">
                <span className="resource-icon purple">
                  <FiList />
                </span>

                <div>
                  <h3>Ejercicios interactivos</h3>
                  <p>GeoGebra</p>
                </div>

                <b className="green-tag">Geometría</b>
              </div>

              <div className="resource-item">
                <span className="resource-icon orange">
                  <FiClock />
                </span>

                <div>
                  <h3>Infografía: Tipos de gráficas</h3>
                  <p>Math Is Fun</p>
                </div>

                <b className="purple-tag">Estadística</b>
              </div>

              <button className="see-more-btn" type="button">
                <FiList />
                Ver más recursos
              </button>
            </article>
          </aside>
        </section>

        <footer className="act-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="act-footer-icons">
            <button onClick={() => irARuta("/login")} type="button">
              <FiLogOut className="logout-icon" />
            </button>

            <button type="button">
              <FiHelpCircle className="help-icon" />
            </button>

            <button type="button">
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesDocente;
