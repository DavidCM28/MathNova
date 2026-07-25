import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CalificacionesDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import heroCalificaciones from "../../assets/docente/calificaciones/hero-banner-calificaciones-docente.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiBarChart2,
  FiTrendingUp,
  FiClipboard,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiUserCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type Grupo = {
  id_grupo: number;
  nombre_grupo: string;
  total_alumnos?: number;
};

type AlumnoCalificacion = {
  id: number;
  nombre: string;
  correo?: string;
  usuario?: string | null;
  iniciales: string;
  color: string;
  id_grupo: number | null;
  grupo: string;
  ultimo_modulo: string;
  actividades_intentadas: number;
  actividades_completadas: number;
  promedio: number | null;
  estrellas: number;
  estado: string;
  estado_clase: "excelente" | "bien" | "pendiente" | "alerta";
};

type PromedioActividad = {
  actividad_titulo: string;
  promedio: number;
  completadas: number;
};

type ResumenCalificaciones = {
  total_alumnos: number;
  alumnos_con_progreso: number;
  alumnos_sin_progreso: number;
  promedio_general: number | null;
  mejor_promedio: number | null;
  mejor_alumno: string | null;
};

type CalificacionesData = {
  grupos: Grupo[];
  alumnos: AlumnoCalificacion[];
  promedio_por_actividad: PromedioActividad[];
  top_alumnos: AlumnoCalificacion[];
  resumen: ResumenCalificaciones;
};

type CalificacionesResponse = {
  ok: boolean;
  mensaje?: string;
} & CalificacionesData;

const API_CALIFICACIONES_DOCENTE =
  "http://localhost:3001/api/docente/calificaciones";

const datosIniciales: CalificacionesData = {
  grupos: [],
  alumnos: [],
  promedio_por_actividad: [],
  top_alumnos: [],
  resumen: {
    total_alumnos: 0,
    alumnos_con_progreso: 0,
    alumnos_sin_progreso: 0,
    promedio_general: null,
    mejor_promedio: null,
    mejor_alumno: null,
  },
};

function obtenerToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token")
  );
}

async function leerRespuesta<T>(response: Response): Promise<T> {
  const texto = await response.text();

  try {
    return texto ? JSON.parse(texto) : ({} as T);
  } catch {
    throw new Error(
      "El backend no devolvió JSON. Revisa que la ruta /api/docente/calificaciones esté registrada.",
    );
  }
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearPromedio(valor: number | null | undefined) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "—";
  }

  return Number(valor).toFixed(1);
}

function clasePromedio(promedio: number | null) {
  if (promedio === null) return "empty";
  if (promedio >= 8.5) return "good";
  if (promedio >= 7) return "medium";
  return "bad";
}

function obtenerIconoEstado(estado: string) {
  const estadoNormalizado = estado.toLowerCase();

  if (estadoNormalizado.includes("excelente")) return <FiAward />;
  if (estadoNormalizado.includes("bien")) return <FiCheckCircle />;

  return <FiAlertCircle />;
}

function limitarPagina(pagina: number, totalPaginas: number) {
  if (pagina < 1) return 1;
  if (pagina > totalPaginas) return totalPaginas;
  return pagina;
}

function CalificacionesDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("calificaciones");
  const [datos, setDatos] = useState<CalificacionesData>(datosIniciales);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const navigate = useNavigate();
  const alumnosPorPagina = 8;

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

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function cargarCalificaciones() {
      try {
        setCargando(true);
        setError("");

        const params = new URLSearchParams();

        if (grupoSeleccionado !== "todos") {
          params.set("grupo", grupoSeleccionado);
        }

        const token = obtenerToken();
        const response = await fetch(
          params.toString()
            ? `${API_CALIFICACIONES_DOCENTE}?${params.toString()}`
            : API_CALIFICACIONES_DOCENTE,
          {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        const data = await leerRespuesta<CalificacionesResponse>(response);

        if (!response.ok || data.ok === false) {
          throw new Error(
            data.mensaje || "No se pudieron cargar las calificaciones.",
          );
        }

        setDatos({
          grupos: data.grupos || [],
          alumnos: data.alumnos || [],
          promedio_por_actividad: data.promedio_por_actividad || [],
          top_alumnos: data.top_alumnos || [],
          resumen: data.resumen || datosIniciales.resumen,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las calificaciones.",
        );
        setDatos(datosIniciales);
      } finally {
        setCargando(false);
      }
    }

    cargarCalificaciones();

    return () => controller.abort();
  }, [grupoSeleccionado]);

  useEffect(() => {
    setPaginaActual(1);
  }, [grupoSeleccionado, busqueda]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim());

    if (!texto) return datos.alumnos;

    return datos.alumnos.filter((alumno) => {
      return [alumno.nombre, alumno.correo || "", alumno.usuario || ""]
        .map(normalizarTexto)
        .some((valor) => valor.includes(texto));
    });
  }, [datos.alumnos, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / alumnosPorPagina),
  );

  const paginaSegura = limitarPagina(paginaActual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * alumnosPorPagina;
  const indiceFinal = indiceInicial + alumnosPorPagina;
  const alumnosPagina = alumnosFiltrados.slice(indiceInicial, indiceFinal);

  const rangoInicial =
    alumnosFiltrados.length === 0 ? 0 : indiceInicial + 1;
  const rangoFinal = Math.min(indiceFinal, alumnosFiltrados.length);

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
                type="button"
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
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active-soft" : ""
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
                selectedMenu === "estadisticas" ? "active-soft" : ""
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

      <section className="calificaciones-content">
        <section className="calif-hero-card">
          <div className="calif-hero-text">
            <h1>Calificaciones</h1>
            <p>
              Consulta los resultados que MathNova calcula automáticamente cuando
              tus alumnos completan sus actividades.
            </p>
          </div>

          <img
            src={heroCalificaciones}
            alt="Calificaciones docente"
            className="calif-hero-img"
          />
        </section>

        <section className="calif-filters calif-filters-connected">
          <label className="calif-filter-card calif-filter-select-card">
            <FiUsers />
            <div>
              <small>Grupo</small>
              <select
                className="calif-filter-select"
                value={grupoSeleccionado}
                onChange={(event) => setGrupoSeleccionado(event.target.value)}
              >
                <option value="todos">Todos los grupos</option>
                {datos.grupos.map((grupo) => (
                  <option key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre_grupo}
                  </option>
                ))}
              </select>
            </div>
            <FiChevronDown className="filter-chevron" />
          </label>

          <label className="calif-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>
        </section>

        {error && <div className="calif-error-card">{error}</div>}

        <section className="calif-stats-row">
          <article className="calif-stat-card green">
            <div>
              <h3>Promedio general</h3>
              <strong>{formatearPromedio(datos.resumen.promedio_general)}</strong>
            </div>

            <span className="calif-stat-icon">
              <FiBarChart2 />
            </span>
          </article>

          <article className="calif-stat-card blue">
            <div>
              <h3>Con progreso</h3>
              <strong>
                {datos.resumen.alumnos_con_progreso}
                <small>alumnos</small>
              </strong>
            </div>

            <span className="calif-stat-icon">
              <FiUserCheck />
            </span>
          </article>

          <article className="calif-stat-card orange">
            <div>
              <h3>Sin progreso</h3>
              <strong>
                {datos.resumen.alumnos_sin_progreso}
                <small>alumnos</small>
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
                {formatearPromedio(datos.resumen.mejor_promedio)}
                <small>{datos.resumen.mejor_alumno || "Sin datos"}</small>
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
                <span>Grupo</span>
                <span>Completadas</span>
                <span>Intentadas</span>
                <span>Promedio</span>
                <span>Estrellas</span>
                <span>Estado</span>
              </div>

              {cargando ? (
                <div className="calif-table-row calif-empty-row">
                  <span className="calif-empty-message">
                    Cargando calificaciones...
                  </span>
                </div>
              ) : alumnosPagina.length === 0 ? (
                <div className="calif-table-row calif-empty-row">
                  <span className="calif-empty-message">
                    No se encontraron alumnos con esos filtros.
                  </span>
                </div>
              ) : (
                alumnosPagina.map((alumno, index) => (
                  <div className="calif-table-row" key={alumno.id}>
                    <span className="calif-number">
                      {indiceInicial + index + 1}
                    </span>

                    <span className="calif-student">
                      <b className={`calif-student-avatar ${alumno.color}`}>
                        {alumno.iniciales}
                      </b>
                      <span className="calif-student-name-wrap">
                        <strong>{alumno.nombre}</strong>
                        <small>{alumno.ultimo_modulo}</small>
                      </span>
                    </span>

                    <span>{alumno.grupo}</span>
                    <span>{alumno.actividades_completadas}</span>
                    <span>{alumno.actividades_intentadas}</span>

                    <span>
                      <b
                        className={`calif-average ${clasePromedio(
                          alumno.promedio,
                        )}`}
                      >
                        {formatearPromedio(alumno.promedio)}
                      </b>
                    </span>

                    <span>{alumno.estrellas}</span>

                    <span
                      className={`calif-status ${alumno.estado_clase}`}
                      title={alumno.estado}
                    >
                      {obtenerIconoEstado(alumno.estado)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="calif-table-footer">
              <p>
                Mostrando {rangoInicial} a {rangoFinal} de {" "}
                {alumnosFiltrados.length} alumnos
              </p>

              <div className="calif-pagination">
                <button
                  type="button"
                  onClick={() => setPaginaActual((pagina) => pagina - 1)}
                  disabled={paginaSegura === 1}
                >
                  <FiChevronLeft />
                </button>
                <button type="button" className="active-page">
                  {paginaSegura}
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaActual((pagina) => pagina + 1)}
                  disabled={paginaSegura === totalPaginas}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </article>

          <aside className="calif-side-panel">
            <article className="calif-chart-card">
              <h2>Promedio por actividad</h2>

              {datos.promedio_por_actividad.length === 0 ? (
                <p className="calif-side-empty">
                  Todavía no hay actividades completadas.
                </p>
              ) : (
                <div className="calif-bar-chart">
                  {datos.promedio_por_actividad.map((actividad, index) => {
                    const colores = [
                      "blue-bar",
                      "green-bar",
                      "orange-bar",
                      "purple-bar",
                    ];

                    return (
                      <div
                        className="calif-bar-item"
                        key={actividad.actividad_titulo}
                      >
                        <strong>{formatearPromedio(actividad.promedio)}</strong>
                        <span
                          className={`calif-bar ${colores[index % colores.length]}`}
                          style={{
                            height: `${Math.max(18, actividad.promedio * 12)}px`,
                          }}
                        ></span>
                        <small>{actividad.actividad_titulo}</small>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="calif-top-card">
              <h2>Top 5 del grupo</h2>

              {datos.top_alumnos.length === 0 ? (
                <p className="calif-side-empty">Sin datos todavía</p>
              ) : (
                datos.top_alumnos.map((alumno, index) => (
                  <div className="top-row" key={alumno.id}>
                    <span className={`top-rank top-${index + 1}`}>
                      {index + 1}
                    </span>
                    <p>{alumno.nombre}</p>
                    <b>{formatearPromedio(alumno.promedio)}</b>
                  </div>
                ))
              )}
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              type="button"
              onClick={() => irARuta("/login", "logout")}
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

export default CalificacionesDocente;
