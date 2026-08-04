import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EstadisticasDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import { clearAuthSession } from "../../utils/authSession";
import {
  FiGrid,
  FiUsers,
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

type EstadoClase =
  | "sobresaliente"
  | "bien"
  | "rezago"
  | "sin-progreso"
  | "en-proceso";

type AlumnoEstadistica = {
  id: number;
  nombre: string;
  correo?: string | null;
  usuario?: string | null;
  iniciales: string;
  grupo: string;
  promedio: number | null;
  estado: string;
  estado_clase: string;
  color: string;
  ultimo_modulo?: string | null;
  ultimo_mundo?: string | null;
  actividades_intentadas: number;
  actividades_completadas: number;
  intentos_totales: number;
  estrellas: number;
};

type GrupoApi = {
  id_grupo: number;
  nombre_grupo: string;
  total_alumnos: number;
};

type RespuestaEstadisticas = {
  ok: boolean;
  mensaje?: string;
  grupos: GrupoApi[];
  alumnos: AlumnoEstadistica[];
  top_alumnos: AlumnoEstadistica[];
  resumen: {
    total_alumnos: number;
    alumnos_con_progreso: number;
    alumnos_sin_progreso: number;
    actividades_calificadas: number;
    actividades_completadas: number;
    intentos_totales: number;
    estrellas_totales: number;
    promedio_general: number | null;
    mejor_promedio: number | null;
    mejor_alumno: string | null;
  };
};

const API_URL = "/api/docente/estadisticas";

const datosIniciales: RespuestaEstadisticas = {
  ok: true,
  grupos: [],
  alumnos: [],
  top_alumnos: [],
  resumen: {
    total_alumnos: 0,
    alumnos_con_progreso: 0,
    alumnos_sin_progreso: 0,
    actividades_calificadas: 0,
    actividades_completadas: 0,
    intentos_totales: 0,
    estrellas_totales: 0,
    promedio_general: null,
    mejor_promedio: null,
    mejor_alumno: null,
  },
};

const coloresValidos = ["blue", "green", "orange", "purple", "pink", "dark"];

function normalizarColor(color: string, id: number) {
  if (coloresValidos.includes(color)) return color;

  const colores = ["blue", "green", "orange", "purple", "pink", "dark"];
  return colores[Math.abs(id) % colores.length];
}

function obtenerEstadoVisual(alumno: AlumnoEstadistica): {
  texto: string;
  clase: EstadoClase;
} {
  const estado = (alumno.estado || "").toLowerCase();
  const clase = (alumno.estado_clase || "").toLowerCase();

  if (estado.includes("sin progreso")) {
    return { texto: "Sin progreso", clase: "sin-progreso" };
  }

  if (estado.includes("proceso")) {
    return { texto: "En proceso", clase: "en-proceso" };
  }

  if (clase === "excelente" || estado.includes("excelente")) {
    return { texto: "Sobresaliente", clase: "sobresaliente" };
  }

  if (clase === "bien" || estado.includes("bien")) {
    return { texto: "Bien", clase: "bien" };
  }

  return { texto: "Rezago", clase: "rezago" };
}

function obtenerPromedioTexto(promedio: number | null) {
  return promedio === null || promedio === undefined
    ? "—"
    : promedio.toFixed(1);
}

function escaparCsv(valor: unknown) {
  return `"${String(valor ?? "").replace(/"/g, '""')}"`;
}

function EstadisticasDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("estadisticas");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState<RespuestaEstadisticas>(datosIniciales);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const alumnosPorPagina = 9;

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

    const cargarEstadisticas = async () => {
      setCargando(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (grupoFiltro !== "todos") {
          params.set("grupo", grupoFiltro);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "El backend no devolvió JSON. Revisa que la ruta /api/docente/estadisticas esté registrada.",
          );
        }

        const data: RespuestaEstadisticas = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            data.mensaje || "No se pudieron cargar las estadísticas.",
          );
        }

        if (!activo) return;
        setDatos(data);
      } catch (err) {
        if (!activo) return;
        setDatos(datosIniciales);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las estadísticas.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarEstadisticas();

    return () => {
      activo = false;
    };
  }, [grupoFiltro]);

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

  const alumnosConEstado = useMemo(() => {
    return datos.alumnos.map((alumno) => {
      const estadoVisual = obtenerEstadoVisual(alumno);

      return {
        ...alumno,
        estadoVisual: estadoVisual.texto,
        estadoClaseVisual: estadoVisual.clase,
        colorVisual: normalizarColor(alumno.color, alumno.id),
      };
    });
  }, [datos.alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    if (!textoBusqueda) return alumnosConEstado;

    return alumnosConEstado.filter((alumno) => {
      return (
        alumno.nombre.toLowerCase().includes(textoBusqueda) ||
        alumno.grupo.toLowerCase().includes(textoBusqueda) ||
        alumno.estadoVisual.toLowerCase().includes(textoBusqueda) ||
        (alumno.ultimo_modulo || "").toLowerCase().includes(textoBusqueda) ||
        (alumno.correo || "").toLowerCase().includes(textoBusqueda)
      );
    });
  }, [alumnosConEstado, busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [grupoFiltro, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / alumnosPorPagina),
  );

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * alumnosPorPagina;
  const indiceFinal = indiceInicial + alumnosPorPagina;
  const alumnosPagina = alumnosFiltrados.slice(indiceInicial, indiceFinal);

  const rangoInicial = alumnosFiltrados.length === 0 ? 0 : indiceInicial + 1;
  const rangoFinal = Math.min(indiceFinal, alumnosFiltrados.length);

  const resumenVisual = useMemo(() => {
    const sobresalientes = alumnosConEstado.filter(
      (alumno) => alumno.estadoClaseVisual === "sobresaliente",
    ).length;
    const bien = alumnosConEstado.filter(
      (alumno) =>
        alumno.estadoClaseVisual === "bien" ||
        alumno.estadoClaseVisual === "en-proceso",
    ).length;
    const rezago = alumnosConEstado.filter(
      (alumno) => alumno.estadoClaseVisual === "rezago",
    ).length;
    const sinProgreso = alumnosConEstado.filter(
      (alumno) => alumno.estadoClaseVisual === "sin-progreso",
    ).length;

    return {
      sobresalientes,
      bien,
      rezago,
      sinProgreso,
    };
  }, [alumnosConEstado]);

  const mejorAlumno =
    [...alumnosConEstado]
      .filter((alumno) => alumno.promedio !== null)
      .sort((a, b) => Number(b.promedio) - Number(a.promedio))[0] || null;

  const recomendacion = useMemo(() => {
    if (datos.resumen.total_alumnos === 0) {
      return "Todavía no hay alumnos registrados para este filtro.";
    }

    if (resumenVisual.rezago > 0) {
      return "Empieza con los alumnos en rezago: tienen actividad registrada, pero su promedio indica que necesitan refuerzo.";
    }

    if (resumenVisual.sinProgreso > 0) {
      return "Hay alumnos sin progreso. Conviene confirmar si ya tienen grupo y si han entrado al dashboard de alumno.";
    }

    return "El grupo va estable. Puedes identificar las actividades con menor promedio para preparar refuerzos.";
  }, [
    datos.resumen.total_alumnos,
    resumenVisual.rezago,
    resumenVisual.sinProgreso,
  ]);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    window.setTimeout(() => setMensaje(""), 2500);
  };

  const descargarReporte = () => {
    const encabezados = [
      "Alumno",
      "Correo",
      "Grupo",
      "Promedio",
      "Estado",
      "Actividades intentadas",
      "Actividades completadas",
      "Intentos",
      "Última actividad",
    ];

    const filas = alumnosFiltrados.map((alumno) => [
      alumno.nombre,
      alumno.correo || "",
      alumno.grupo,
      obtenerPromedioTexto(alumno.promedio),
      alumno.estadoVisual,
      alumno.actividades_intentadas,
      alumno.actividades_completadas,
      alumno.intentos_totales,
      alumno.ultimo_modulo || "Sin actividades",
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
    enlace.download = "estadisticas-docente-mathnova.csv";
    enlace.click();
    URL.revokeObjectURL(url);

    mostrarMensaje("Reporte descargado correctamente.");
  };

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
        {mensaje && <div className="stats-error-box success">{mensaje}</div>}

        <section className="stats-hero-card">
          <div className="stats-hero-text">
            <h1>Estadísticas</h1>
            <p>
              Consulta el desempeño real de tus estudiantes según las
              actividades que realizan y se califican automáticamente.
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
              <option value="todos">Todos los grupos</option>
              {datos.grupos.map((grupo) => (
                <option key={grupo.id_grupo} value={grupo.id_grupo}>
                  {grupo.nombre_grupo}
                </option>
              ))}
            </select>
          </label>

          <label className="stats-search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Buscar alumno, grupo, actividad o estado..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="stats-export-btn"
            onClick={descargarReporte}
            disabled={alumnosFiltrados.length === 0}
          >
            <FiDownload />
            Exportar reporte
          </button>
        </section>

        {error && (
          <div className="stats-error-box" role="alert">
            {error}
          </div>
        )}

        <section className="stats-summary-row">
          <article className="summary-card blue-summary">
            <div>
              <h3>
                Promedio general <FiInfo />
              </h3>

              <strong>
                {datos.resumen.promedio_general === null
                  ? "—"
                  : datos.resumen.promedio_general.toFixed(1)}
              </strong>
              <p>Calculado con actividades reales</p>
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

              <strong>{resumenVisual.sobresalientes}</strong>
              <p>Alumnos con alto desempeño</p>
            </div>

            <span className="summary-icon">
              <FiAward />
            </span>
          </article>

          <article className="summary-card orange-summary">
            <div>
              <h3>
                Con progreso <FiInfo />
              </h3>

              <strong>{datos.resumen.alumnos_con_progreso}</strong>
              <p>Ya realizaron al menos una actividad</p>
            </div>

            <span className="summary-icon">
              <FiCheckCircle />
            </span>
          </article>

          <article className="summary-card red-summary">
            <div>
              <h3>
                Necesitan apoyo <FiInfo />
              </h3>

              <strong>
                {resumenVisual.rezago + resumenVisual.sinProgreso}
              </strong>
              <p>Rezago o sin progreso registrado</p>
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
                  Nombre, grupo, promedio real, progreso e intentos de cada
                  alumno.
                </p>
              </div>

              <span>
                {cargando
                  ? "Cargando..."
                  : `${alumnosFiltrados.length} alumnos`}
              </span>
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

                {cargando ? (
                  <div className="students-row stats-empty-row">
                    <span>Cargando estadísticas...</span>
                  </div>
                ) : alumnosFiltrados.length === 0 ? (
                  <div className="students-row stats-empty-row">
                    <span>No se encontraron estudiantes.</span>
                  </div>
                ) : (
                  alumnosPagina.map((alumno, index) => (
                    <div className="students-row" key={alumno.id}>
                      <span className="student-number">
                        {indiceInicial + index + 1}
                      </span>

                      <span className="student-name-cell">
                        <b className={`student-avatar ${alumno.colorVisual}`}>
                          {alumno.iniciales}
                        </b>

                        {alumno.nombre}
                      </span>

                      <span>{alumno.grupo}</span>

                      <span>
                        <b
                          className={`student-average ${
                            alumno.promedio === null
                              ? "empty"
                              : alumno.promedio >= 9
                                ? "high"
                                : alumno.promedio >= 7
                                  ? "medium"
                                  : "low"
                          }`}
                        >
                          {obtenerPromedioTexto(alumno.promedio)}
                        </b>
                      </span>

                      <span>
                        <b
                          className={`student-status ${alumno.estadoClaseVisual}`}
                        >
                          {alumno.estadoVisual}
                        </b>
                      </span>

                      <button
                        type="button"
                        className="student-action-btn"
                        onClick={() =>
                          irARuta("/calificaciones-docente", "calificaciones")
                        }
                      >
                        Ver <FiArrowRight />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!cargando && alumnosFiltrados.length > 0 && (
              <div className="students-pagination">
                <p>
                  Mostrando {rangoInicial} a {rangoFinal} de{" "}
                  {alumnosFiltrados.length} alumnos
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual((pagina) => Math.max(1, pagina - 1))
                    }
                    disabled={paginaSegura === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPaginas }, (_, index) => index + 1)
                    .filter((numero) => {
                      if (totalPaginas <= 5) return true;
                      if (paginaSegura <= 3) return numero <= 5;
                      if (paginaSegura >= totalPaginas - 2) {
                        return numero >= totalPaginas - 4;
                      }
                      return (
                        numero >= paginaSegura - 2 && numero <= paginaSegura + 2
                      );
                    })
                    .map((numero) => (
                      <button
                        key={numero}
                        type="button"
                        className={paginaSegura === numero ? "active" : ""}
                        onClick={() => setPaginaActual(numero)}
                      >
                        {numero}
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual((pagina) =>
                        Math.min(totalPaginas, pagina + 1),
                      )
                    }
                    disabled={paginaSegura === totalPaginas}
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
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
                  <strong>{resumenVisual.sobresalientes}</strong>
                </div>

                <div className="state-row orange">
                  <span></span>
                  <p>Bien / en proceso</p>
                  <strong>{resumenVisual.bien}</strong>
                </div>

                <div className="state-row red">
                  <span></span>
                  <p>Rezago</p>
                  <strong>{resumenVisual.rezago}</strong>
                </div>

                <div className="state-row gray">
                  <span></span>
                  <p>Sin progreso</p>
                  <strong>{resumenVisual.sinProgreso}</strong>
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
                  <strong>{obtenerPromedioTexto(mejorAlumno.promedio)}</strong>
                  <span>{mejorAlumno.grupo}</span>
                </>
              ) : (
                <>
                  <p>No hay promedios para mostrar</p>
                  <strong>—</strong>
                  <span>Sin datos</span>
                </>
              )}
            </article>

            <article className="stats-card advice-card">
              <h2>
                <FiInfo />
                Recomendación rápida
              </h2>

              <p>{recomendacion}</p>

              <button
                type="button"
                onClick={() =>
                  irARuta("/avance-actividad-docente", "avance-actividad")
                }
              >
                Ver avance de actividad <FiArrowRight />
              </button>
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              type="button"
              onClick={cerrarSesion}
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
