import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AvanceActividadDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import bannerActividad from "../../assets/banner_actividades_docente_alumnos.png";
import { clearAuthSession } from "../../utils/authSession";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiBarChart2,
  FiTrendingUp,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiFilter,
  FiDownload,
  FiClock,
  FiRefreshCw,
  FiCheck,
  FiUserCheck,
  FiEye,
  FiAlertTriangle,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type EstadoActividad =
  | "No iniciada"
  | "En progreso"
  | "Completada"
  | "Requiere apoyo";

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

type GrupoApi = {
  id_grupo: number;
  nombre_grupo: string;
  total_alumnos: number;
};

type ActividadApi = {
  codigo: string;
  titulo: string;
  mundo: string;
  tema: string;
  estudiantes_intentaron: number;
  completadas: number;
  intentos: number;
  promedio: number | null;
};

type AlumnoSeguimiento = {
  id: number;
  id_alumno?: number;
  iniciales: string;
  nombre: string;
  correo?: string | null;
  estado: EstadoActividad;
  progreso: number;
  descripcionProgreso: string;
  intentos: number;
  ultimaActividad: string | null;
  promedio: number | null;
  grupo: string;
  mundo: string | null;
  tema: string | null;
  actividad_titulo: string;
  color: string;
};

type AtencionApi = {
  id: number;
  iniciales: string;
  nombre: string;
  color: string;
  motivo: string;
};

type RespuestaAvance = {
  ok: boolean;
  mensaje?: string;
  grupos: GrupoApi[];
  mundos: string[];
  actividades: ActividadApi[];
  actividad_seleccionada: string | null;
  alumnos: AlumnoSeguimiento[];
  atencion: AtencionApi[];
  resumen: {
    total: number;
    noIniciada: number;
    enProgreso: number;
    completada: number;
    requiereApoyo: number;
    progresoPromedio: number;
    promedioActividad: number | null;
    intentosTotales: number;
    tiempoPromedioMinutos: number;
  };
};

const API_URL = "http://localhost:3001/api/docente/avance-actividad";
const ALUMNOS_POR_PAGINA = 7;

const datosIniciales: RespuestaAvance = {
  ok: true,
  grupos: [],
  mundos: [],
  actividades: [],
  actividad_seleccionada: null,
  alumnos: [],
  atencion: [],
  resumen: {
    total: 0,
    noIniciada: 0,
    enProgreso: 0,
    completada: 0,
    requiereApoyo: 0,
    progresoPromedio: 0,
    promedioActividad: null,
    intentosTotales: 0,
    tiempoPromedioMinutos: 0,
  },
};

function claseEstado(valor: EstadoActividad) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function porcentaje(parcial: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((parcial / total) * 100);
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "—";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function escaparCsv(valor: unknown) {
  return `"${String(valor ?? "").replace(/"/g, '""')}"`;
}

function AvanceActividadDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });
  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [grupo, setGrupo] = useState("todos");
  const [mundo, setMundo] = useState("todos");
  const [actividad, setActividad] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState<RespuestaAvance>(datosIniciales);

  const [selectedMenu, setSelectedMenu] =
    useState<MenuKey>("avance-actividad");
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

  useEffect(() => {
    let activo = true;

    const cargarAvance = async () => {
      setCargando(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (grupo !== "todos") params.set("grupo", grupo);
        if (mundo !== "todos") params.set("mundo", mundo);
        if (actividad) params.set("actividad", actividad);

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "El backend no devolvió JSON. Revisa que la ruta /api/docente/avance-actividad esté registrada.",
          );
        }

        const data: RespuestaAvance = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.mensaje || "No se pudo cargar el avance.");
        }

        if (!activo) return;

        setDatos(data);

        if (!actividad && data.actividad_seleccionada) {
          setActividad(data.actividad_seleccionada);
        }
      } catch (err) {
        if (!activo) return;
        setDatos(datosIniciales);
        setError(err instanceof Error ? err.message : "No se pudo cargar el avance.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarAvance();

    return () => {
      activo = false;
    };
  }, [grupo, mundo, actividad]);

  const irARuta = (ruta: string, menu?: MenuKey) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    irARuta("/login");
  };

  const mundos = useMemo(() => {
    const desdeActividades = datos.actividades.map((item) => item.mundo);
    return Array.from(new Set([...datos.mundos, ...desdeActividades])).filter(
      Boolean,
    );
  }, [datos.actividades, datos.mundos]);

  const actividadesFiltradas = useMemo(() => {
    if (mundo === "todos") return datos.actividades;

    return datos.actividades.filter(
      (item) => item.mundo.toLowerCase() === mundo.toLowerCase(),
    );
  }, [datos.actividades, mundo]);

  const actividadActual = useMemo(() => {
    return (
      datos.actividades.find(
        (item) => item.codigo === datos.actividad_seleccionada,
      ) || null
    );
  }, [datos.actividades, datos.actividad_seleccionada]);

  const alumnosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return datos.alumnos.filter((alumno) => {
      const coincideBusqueda =
        texto === "" ||
        alumno.nombre.toLowerCase().includes(texto) ||
        alumno.grupo.toLowerCase().includes(texto) ||
        (alumno.correo || "").toLowerCase().includes(texto);

      const coincideEstado = estado === "Todos" || alumno.estado === estado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, datos.alumnos, estado]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estado, grupo, mundo, actividad]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / ALUMNOS_POR_PAGINA),
  );

  const alumnosPaginados = alumnosFiltrados.slice(
    (paginaActual - 1) * ALUMNOS_POR_PAGINA,
    paginaActual * ALUMNOS_POR_PAGINA,
  );

  const inicioTabla =
    alumnosFiltrados.length > 0
      ? (paginaActual - 1) * ALUMNOS_POR_PAGINA + 1
      : 0;
  const finTabla = Math.min(
    paginaActual * ALUMNOS_POR_PAGINA,
    alumnosFiltrados.length,
  );

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    window.setTimeout(() => setMensaje(""), 2800);
  };

  const limpiarFiltros = () => {
    setGrupo("todos");
    setMundo("todos");
    setActividad("");
    setEstado("Todos");
    setBusqueda("");
    mostrarMensaje("Filtros limpiados.");
  };

  const descargarReporte = () => {
    const encabezados = [
      "Alumno",
      "Grupo",
      "Actividad",
      "Mundo",
      "Tema",
      "Estado",
      "Progreso",
      "Promedio",
      "Intentos",
      "Última actividad",
    ];

    const filas = alumnosFiltrados.map((alumno) => [
      alumno.nombre,
      alumno.grupo,
      actividadActual?.titulo || alumno.actividad_titulo || "Sin actividad",
      alumno.mundo || actividadActual?.mundo || "—",
      alumno.tema || actividadActual?.tema || "—",
      alumno.estado,
      `${alumno.progreso}%`,
      alumno.promedio === null ? "—" : alumno.promedio,
      alumno.intentos,
      formatearFecha(alumno.ultimaActividad),
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) => fila.map(escaparCsv).join(","))
      .join("\n");

    const archivo = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "avance-actividad-mathnova.csv";
    enlace.click();
    URL.revokeObjectURL(url);

    mostrarMensaje("El reporte se descargó correctamente.");
  };

  const total = datos.resumen.total;
  const pNoIniciada = porcentaje(datos.resumen.noIniciada, total);
  const pEnProgreso = porcentaje(datos.resumen.enProgreso, total);
  const pCompletada = porcentaje(datos.resumen.completada, total);
  const pRequiereApoyo = porcentaje(datos.resumen.requiereApoyo, total);
  const corte1 = pNoIniciada;
  const corte2 = corte1 + pEnProgreso;
  const corte3 = corte2 + pCompletada;
  const corte4 = corte3 + pRequiereApoyo;

  return (
    <main className="docente-page avance-page">
      {mensaje && (
        <div className="avance-toast" role="status" aria-live="polite">
          <FiCheck />
          <span>{mensaje}</span>
        </div>
      )}

      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
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
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
              type="button"
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
                type="button"
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
                  onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                  type="button"
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                  type="button"
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
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                  type="button"
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                  type="button"
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                  type="button"
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
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
              type="button"
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active" : ""
              }`}
              onClick={() =>
                irARuta("/avance-actividad-docente", "avance-actividad")
              }
              type="button"
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
              type="button"
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

      <section className="avance-content">
        <header className="avance-header">
          <div className="avance-header-text">
            <h1>Avance de actividad</h1>
            <p>
              Visualiza el progreso real de tus alumnos en las actividades que
              se califican automáticamente en MathNova.
            </p>
          </div>

          <img
            src={bannerActividad}
            alt="Docente revisando actividades con un alumno"
            className="avance-header-image"
          />
        </header>

        <section className="avance-filtros">
          <label>
            <span>Grupo</span>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="todos">Todos los grupos</option>
              {datos.grupos.map((item) => (
                <option key={item.id_grupo} value={item.id_grupo}>
                  {item.nombre_grupo}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Mundo</span>
            <select
              value={mundo}
              onChange={(e) => {
                setMundo(e.target.value);
                setActividad("");
              }}
            >
              <option value="todos">Todos los mundos</option>
              {mundos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="avance-actividad-select">
            <span>Actividad</span>
            <select
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
            >
              <option value="">Actividad con más avance</option>
              {actividadesFiltradas.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.titulo}
                </option>
              ))}
            </select>
          </label>

          <label className="avance-busqueda">
            <span className="sr-only">Buscar alumno</span>
            <FiSearch />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar alumno..."
            />
          </label>

          <label>
            <span>Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option>Todos</option>
              <option>No iniciada</option>
              <option>En progreso</option>
              <option>Completada</option>
              <option>Requiere apoyo</option>
            </select>
          </label>

          <button
            type="button"
            className="avance-icon-button"
            aria-label="Limpiar filtros"
            onClick={limpiarFiltros}
          >
            <FiFilter />
          </button>

          <div className="avance-filter-actions">
            <button
              type="button"
              className="avance-secondary-button"
              onClick={descargarReporte}
              disabled={alumnosFiltrados.length === 0}
            >
              <FiDownload />
              Exportar reporte
            </button>

            <button
              type="button"
              className="avance-primary-button"
              onClick={() =>
                irARuta("/calificaciones-docente", "calificaciones")
              }
            >
              <FiBarChart2 />
              Ver calificaciones
            </button>
          </div>
        </section>

        {error && (
          <div className="avance-error-box" role="alert">
            {error}
          </div>
        )}

        <section className="avance-dashboard-grid">
          <div className="avance-main-column">
            <section className="avance-summary-grid">
              <article className="avance-summary-card total-card">
                <div>
                  <span>Total de alumnos</span>
                  <strong>{datos.resumen.total}</strong>
                  <small>
                    {actividadActual
                      ? actividadActual.titulo
                      : cargando
                        ? "Cargando actividad"
                        : "Sin actividad seleccionada"}
                  </small>
                </div>
                <i>
                  <FiUsers />
                </i>
              </article>

              <article className="avance-summary-card not-started-card">
                <div>
                  <span>No iniciada</span>
                  <strong>{datos.resumen.noIniciada}</strong>
                  <small>{pNoIniciada}% del total</small>
                </div>
                <i>
                  <FiClock />
                </i>
              </article>

              <article className="avance-summary-card progress-card">
                <div>
                  <span>En progreso</span>
                  <strong>{datos.resumen.enProgreso}</strong>
                  <small>{pEnProgreso}% del total</small>
                </div>
                <i>
                  <FiRefreshCw />
                </i>
              </article>

              <article className="avance-summary-card completed-card">
                <div>
                  <span>Completada</span>
                  <strong>{datos.resumen.completada}</strong>
                  <small>{pCompletada}% del total</small>
                </div>
                <i>
                  <FiCheck />
                </i>
              </article>
            </section>

            <article className="avance-card avance-table-card">
              <h2>Seguimiento de alumnos</h2>

              <div className="avance-table-scroll">
                <div className="avance-table">
                  <div className="avance-table-row avance-table-head">
                    <span>Alumno</span>
                    <span>Estado</span>
                    <span>Progreso actual</span>
                    <span>Intentos</span>
                    <span>Última actividad</span>
                    <span>Acción</span>
                  </div>

                  {cargando ? (
                    <div className="avance-table-row avance-empty-row">
                      <span>Cargando avance...</span>
                    </div>
                  ) : alumnosPaginados.length === 0 ? (
                    <div className="avance-table-row avance-empty-row">
                      <span>No se encontraron alumnos con estos filtros.</span>
                    </div>
                  ) : (
                    alumnosPaginados.map((alumno) => (
                      <div className="avance-table-row" key={alumno.id}>
                        <span className="avance-student">
                          <i style={{ background: alumno.color }}>
                            {alumno.iniciales}
                          </i>
                          {alumno.nombre}
                        </span>

                        <span>
                          <b
                            className={`avance-status ${claseEstado(
                              alumno.estado,
                            )}`}
                          >
                            {alumno.estado}
                          </b>
                        </span>

                        <span className="avance-progress-cell">
                          <span>
                            <small>{alumno.descripcionProgreso}</small>
                            <small>{alumno.progreso}%</small>
                          </span>
                          <i>
                            <b
                              className={claseEstado(alumno.estado)}
                              style={{ width: `${alumno.progreso}%` }}
                            />
                          </i>
                        </span>

                        <span>{alumno.intentos}</span>
                        <span>{formatearFecha(alumno.ultimaActividad)}</span>

                        <span>
                          <button
                            type="button"
                            className="avance-row-button"
                            onClick={() =>
                              irARuta(
                                "/calificaciones-docente",
                                "calificaciones",
                              )
                            }
                          >
                            <FiEye /> Ver
                          </button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="avance-pagination">
                <p>
                  Mostrando {inicioTabla} a {finTabla} de{" "}
                  {alumnosFiltrados.length} alumnos
                </p>

                <div>
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((actual) => actual - 1)}
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from(
                    { length: totalPaginas },
                    (_, index) => index + 1,
                  ).map((pagina) => (
                    <button
                      type="button"
                      key={pagina}
                      className={paginaActual === pagina ? "active" : ""}
                      onClick={() => setPaginaActual(pagina)}
                    >
                      {pagina}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((actual) => actual + 1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <aside className="avance-side-column">
            <article className="avance-card avance-distribution-card">
              <h2>Distribución del grupo</h2>

              <div className="avance-distribution">
                <div
                  className="avance-donut"
                  style={{
                    background:
                      total > 0
                        ? `conic-gradient(
                            #94a3b8 0 ${corte1}%,
                            #f59e0b ${corte1}% ${corte2}%,
                            #22c55e ${corte2}% ${corte3}%,
                            #ef4444 ${corte3}% ${Math.max(corte4, 100)}%
                          )`
                        : "#edf1f6",
                  }}
                >
                  <div>
                    <strong>{datos.resumen.total}</strong>
                    <span>alumnos</span>
                  </div>
                </div>

                <ul>
                  <li>
                    <i className="gray" /> No iniciada{" "}
                    <b>{datos.resumen.noIniciada}</b>
                  </li>
                  <li>
                    <i className="orange" /> En progreso{" "}
                    <b>{datos.resumen.enProgreso}</b>
                  </li>
                  <li>
                    <i className="green" /> Completada{" "}
                    <b>{datos.resumen.completada}</b>
                  </li>
                  <li>
                    <i className="red" /> Requiere apoyo{" "}
                    <b>{datos.resumen.requiereApoyo}</b>
                  </li>
                </ul>
              </div>
            </article>

            <article className="avance-card avance-performance-card">
              <h2>Resumen del rendimiento</h2>

              <div className="avance-performance-grid">
                <div className="green-box">
                  <span>Progreso promedio</span>
                  <strong>{datos.resumen.progresoPromedio}%</strong>
                  <FiBarChart2 />
                </div>
                <div className="orange-box">
                  <span>Tiempo promedio</span>
                  <strong>
                    {datos.resumen.tiempoPromedioMinutos}
                    <small> min</small>
                  </strong>
                  <FiClock />
                </div>
                <div className="purple-box">
                  <span>Promedio de la actividad</span>
                  <strong>
                    {datos.resumen.promedioActividad ?? "—"}
                    <small>/10</small>
                  </strong>
                  <FiCheck />
                </div>
                <div className="blue-box">
                  <span>Intentos registrados</span>
                  <strong>{datos.resumen.intentosTotales}</strong>
                  <FiRefreshCw />
                </div>
              </div>
            </article>

            <article className="avance-card avance-attention-card">
              <h2>Alumnos que necesitan atención</h2>

              <div className="avance-attention-list">
                {datos.atencion.length === 0 ? (
                  <p className="avance-side-empty">
                    No hay alumnos en alerta para esta actividad.
                  </p>
                ) : (
                  datos.atencion.map((alumno) => (
                    <div key={alumno.id}>
                      <i style={{ background: alumno.color }}>
                        {alumno.iniciales}
                      </i>
                      <span>{alumno.nombre}</span>
                      <small>
                        <FiAlertTriangle /> {alumno.motivo}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => irARuta("/lista-alumnos-docente", "lista")}
              >
                Ver todos los alumnos <FiArrowRight />
              </button>
            </article>
          </aside>
        </section>

        <footer className="docente-footer avance-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              onClick={cerrarSesion}
              type="button"
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

export default AvanceActividadDocente;
