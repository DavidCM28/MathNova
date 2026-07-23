import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EstadisticasDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiEdit,
  FiBarChart2,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiDownload,
  FiAward,
  FiTrendingUp,
  FiUserCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";

type MenuKey =
  | "dashboard"
  | "ver-grupos"
  | "crear-grupo"
  | "administrar-alumnos"
  | "lista"
  | "calificaciones"
  | "gestion-docentes"
  | "actividades"
  | "avance-actividad"
  | "estadisticas";

type EstadoAlumno = "Sobresaliente" | "Bien" | "Rezago";

type AlumnoEstadistica = {
  id: number;
  iniciales: string;
  nombre: string;
  grupo: string;
  promedio: number;
  estado: EstadoAlumno;
  estadoClase: "sobresaliente" | "bien" | "rezago";
  color: "blue" | "green" | "orange" | "purple" | "pink" | "dark";
};

const alumnosEstadisticas: AlumnoEstadistica[] = [
  {
    id: 1,
    iniciales: "MF",
    nombre: "Mariana Fuentes Ruiz",
    grupo: "2°A",
    promedio: 9.6,
    estado: "Sobresaliente",
    estadoClase: "sobresaliente",
    color: "blue",
  },
  {
    id: 2,
    iniciales: "SJ",
    nombre: "Santiago Jiménez López",
    grupo: "2°A",
    promedio: 8.7,
    estado: "Bien",
    estadoClase: "bien",
    color: "purple",
  },
  {
    id: 3,
    iniciales: "AG",
    nombre: "Ana Sofía García Pérez",
    grupo: "2°A",
    promedio: 7.8,
    estado: "Bien",
    estadoClase: "bien",
    color: "orange",
  },
  {
    id: 4,
    iniciales: "DH",
    nombre: "Diego Hernández Torres",
    grupo: "2°A",
    promedio: 6.1,
    estado: "Rezago",
    estadoClase: "rezago",
    color: "dark",
  },
  {
    id: 5,
    iniciales: "LM",
    nombre: "Lucía Medina Chávez",
    grupo: "2°B",
    promedio: 9.2,
    estado: "Sobresaliente",
    estadoClase: "sobresaliente",
    color: "green",
  },
  {
    id: 6,
    iniciales: "JV",
    nombre: "José Valdez Ríos",
    grupo: "2°B",
    promedio: 8.3,
    estado: "Bien",
    estadoClase: "bien",
    color: "pink",
  },
  {
    id: 7,
    iniciales: "VS",
    nombre: "Valeria Sánchez Morales",
    grupo: "1°C",
    promedio: 7.1,
    estado: "Bien",
    estadoClase: "bien",
    color: "purple",
  },
  {
    id: 8,
    iniciales: "JR",
    nombre: "Juan Ramírez Díaz",
    grupo: "1°C",
    promedio: 5.8,
    estado: "Rezago",
    estadoClase: "rezago",
    color: "blue",
  },
  {
    id: 9,
    iniciales: "CT",
    nombre: "Carla Torres Aguilar",
    grupo: "3°A",
    promedio: 8.9,
    estado: "Bien",
    estadoClase: "bien",
    color: "green",
  },
  {
    id: 10,
    iniciales: "OL",
    nombre: "Óscar López Navarro",
    grupo: "3°A",
    promedio: 6.6,
    estado: "Rezago",
    estadoClase: "rezago",
    color: "orange",
  },
];

function EstadisticasDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("estadisticas");
  const [grupoFiltro, setGrupoFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

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

  const irARuta = (ruta: string, menu?: MenuKey) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const grupos = useMemo(() => {
    return [
      "Todos",
      ...Array.from(new Set(alumnosEstadisticas.map((alumno) => alumno.grupo))),
    ];
  }, []);

  const alumnosFiltrados = alumnosEstadisticas.filter((alumno) => {
    const coincideGrupo =
      grupoFiltro === "Todos" || alumno.grupo === grupoFiltro;

    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      alumno.nombre.toLowerCase().includes(textoBusqueda) ||
      alumno.grupo.toLowerCase().includes(textoBusqueda) ||
      alumno.estado.toLowerCase().includes(textoBusqueda);

    return coincideGrupo && coincideBusqueda;
  });

  const promedioGeneral =
    alumnosFiltrados.length > 0
      ? (
          alumnosFiltrados.reduce(
            (total, alumno) => total + alumno.promedio,
            0,
          ) / alumnosFiltrados.length
        ).toFixed(1)
      : "0.0";

  const sobresalientes = alumnosFiltrados.filter(
    (alumno) => alumno.estado === "Sobresaliente",
  ).length;

  const bien = alumnosFiltrados.filter(
    (alumno) => alumno.estado === "Bien",
  ).length;

  const rezago = alumnosFiltrados.filter(
    (alumno) => alumno.estado === "Rezago",
  ).length;

  const mejorAlumno = [...alumnosFiltrados].sort(
    (a, b) => b.promedio - a.promedio,
  )[0];

  return (
    <main className="docente-page">
      <button
        type="button"
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
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
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                type="button"
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
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
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
                type="button"
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "gestion-docentes" ? "active" : ""
              }`}
              onClick={() => irARuta("/gestion-docentes", "gestion-docentes")}
            >
              <FiUserCheck />
              <span>Gestión de docentes</span>
            </button>
            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active" : ""
              }`}
              onClick={() =>
                irARuta("/avance-actividad-docente", "avance-actividad")
              }
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
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
        <section className="stats-hero-card">
          <div className="stats-hero-text">
            <h1>Estadísticas</h1>
            <p>
              Consulta el desempeño de tus estudiantes por grupo, promedio y
              estado académico.
            </p>
          </div>
        </section>

        <section className="stats-filter-panel">
          <label className="stats-select-field">
            <span>Grupo</span>

            <select
              value={grupoFiltro}
              onChange={(event) => setGrupoFiltro(event.target.value)}
            >
              {grupos.map((grupo) => (
                <option key={grupo}>{grupo}</option>
              ))}
            </select>
          </label>

          <label className="stats-search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Buscar alumno, grupo o estado..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <button type="button" className="stats-export-btn">
            <FiDownload />
            Exportar reporte
          </button>
        </section>

        <section className="stats-summary-row">
          <article className="summary-card blue-summary">
            <div>
              <h3>
                Promedio general <FiInfo />
              </h3>

              <strong>{promedioGeneral}</strong>
              <p>Promedio del grupo seleccionado</p>
            </div>

            <span className="summary-icon">
              <FiTrendingUp />
            </span>
          </article>

          <article className="summary-card green-summary">
            <div>
              <h3>
                Sobresalientes <FiInfo />
              </h3>

              <strong>{sobresalientes}</strong>
              <p>Alumnos con alto desempeño</p>
            </div>

            <span className="summary-icon">
              <FiAward />
            </span>
          </article>

          <article className="summary-card orange-summary">
            <div>
              <h3>
                En buen avance <FiInfo />
              </h3>

              <strong>{bien}</strong>
              <p>Alumnos con desempeño estable</p>
            </div>

            <span className="summary-icon">
              <FiCheckCircle />
            </span>
          </article>

          <article className="summary-card red-summary">
            <div>
              <h3>
                En rezago <FiInfo />
              </h3>

              <strong>{rezago}</strong>
              <p>Necesitan seguimiento</p>
            </div>

            <span className="summary-icon">
              <FiAlertTriangle />
            </span>
          </article>
        </section>

        <section className="stats-main-grid">
          <article className="stats-card students-table-card">
            <div className="card-title-row">
              <div>
                <h2>
                  <FiUsers />
                  Lista de estudiantes
                </h2>

                <p>
                  Nombre, grupo, promedio y estado académico de cada alumno.
                </p>
              </div>

              <span>{alumnosFiltrados.length} alumnos</span>
            </div>

            <div className="students-table-wrap">
              <div className="students-table">
                <div className="students-row students-head">
                  <span>No.</span>
                  <span>Alumno</span>
                  <span>Grupo</span>
                  <span>Promedio</span>
                  <span>Estado</span>
                  <span>Acción</span>
                </div>

                {alumnosFiltrados.map((alumno, index) => (
                  <div className="students-row" key={alumno.id}>
                    <span className="student-number">{index + 1}</span>

                    <span className="student-name-cell">
                      <b className={`student-avatar ${alumno.color}`}>
                        {alumno.iniciales}
                      </b>

                      {alumno.nombre}
                    </span>

                    <span>{alumno.grupo}</span>

                    <span>
                      <b
                        className={`student-average ${
                          alumno.promedio >= 9
                            ? "high"
                            : alumno.promedio >= 7
                              ? "medium"
                              : "low"
                        }`}
                      >
                        {alumno.promedio}
                      </b>
                    </span>

                    <span>
                      <b className={`student-status ${alumno.estadoClase}`}>
                        {alumno.estado}
                      </b>
                    </span>

                    <button
                      type="button"
                      className="student-action-btn"
                      onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                    >
                      Ver <FiArrowRight />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="stats-side-column">
            <article className="stats-card state-card">
              <div className="card-title-row small-title">
                <h2>
                  <FiBarChart2 />
                  Estado del grupo
                </h2>
              </div>

              <div className="state-list">
                <div className="state-row green">
                  <span></span>
                  <p>Sobresaliente</p>
                  <strong>{sobresalientes}</strong>
                </div>

                <div className="state-row orange">
                  <span></span>
                  <p>Bien</p>
                  <strong>{bien}</strong>
                </div>

                <div className="state-row red">
                  <span></span>
                  <p>Rezago</p>
                  <strong>{rezago}</strong>
                </div>
              </div>
            </article>

            <article className="stats-card best-card">
              <div className="best-icon">
                <FiAward />
              </div>

              <h2>Mejor promedio</h2>

              {mejorAlumno ? (
                <>
                  <p>{mejorAlumno.nombre}</p>
                  <strong>{mejorAlumno.promedio}</strong>
                  <span>{mejorAlumno.grupo}</span>
                </>
              ) : (
                <>
                  <p>No hay alumnos para mostrar</p>
                  <strong>0.0</strong>
                  <span>Sin grupo</span>
                </>
              )}
            </article>

            <article className="stats-card advice-card">
              <h2>
                <FiInfo />
                Recomendación rápida
              </h2>

              <p>
                Revisa primero a los alumnos en rezago para identificar qué
                temas necesitan refuerzo.
              </p>

              <button
                type="button"
                onClick={() => irARuta("/lista-alumnos-docente", "lista")}
              >
                Ir a lista de alumnos <FiArrowRight />
              </button>
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              type="button"
              onClick={() => irARuta("/login")}
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <button type="button" aria-label="Ayuda">
              <FiHelpCircle className="help-icon" />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default EstadisticasDocente;
