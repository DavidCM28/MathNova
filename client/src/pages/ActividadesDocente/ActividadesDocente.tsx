import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/authSession";
import "./ActividadesDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";

import mundoMathNumbers from "../../assets/mundo-1-MathNumbers.png";
import mundoMathGeometry from "../../assets/mundo-2-MathGeometry.png";
import mundoMathData from "../../assets/mundo-3-MathData.png";

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
  FiCheckCircle,
  FiLock,
  FiUserCheck,
  FiShuffle,
  FiBookOpen,
  FiBox,
  FiDatabase,
  FiHash,
  FiPlayCircle,
  FiStar,
  FiClock,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiAlertCircle,
  FiMessageSquare,
  FiAward,
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
  | "estadisticas"
  | "logout";

type Mundo = "MathData" | "MathGeometry" | "MathNumbers" | "MathNova";
type ColorActividad = "blue" | "green" | "orange" | "purple";
type EstadoActividadClase = "enabled" | "disabled" | "warning";

type RespuestaAbierta = {
  id_usuario: number;
  alumno: string;
  iniciales: string;
  actividad_codigo: string;
  actividad_titulo: string;
  campo: string;
  respuesta: string;
  fecha: string | null;
};

type ActividadReal = {
  id: number;
  codigo: string;
  titulo: string;
  mundo: Mundo | string;
  tema: string;
  descripcion: string;
  dificultad: "Básica" | "Media" | "Reto" | string;
  duracion: string;
  color: ColorActividad;
  estudiantes_intentaron: number;
  estudiantes_completaron: number;
  completadas: number;
  intentos: number;
  promedio: number | null;
  estrellas: number;
  tiempo_total_segundos: number;
  respuestas_abiertas: number;
  muestras_respuestas: RespuestaAbierta[];
  ultima_actividad: string | null;
  estado: string;
  estado_clase: EstadoActividadClase;
};

type ResumenActividades = {
  total_actividades: number;
  actividades_con_intentos: number;
  actividades_sin_intentos: number;
  estudiantes_alcanzados: number;
  intentos_totales: number;
  completadas_totales: number;
  respuestas_abiertas: number;
  promedio_general: number | null;
};

type ActividadesData = {
  actividades: ActividadReal[];
  respuestas_abiertas_recientes: RespuestaAbierta[];
  resumen: ResumenActividades;
};

type ActividadesResponse = {
  ok: boolean;
  mensaje?: string;
} & ActividadesData;

const API_ACTIVIDADES_DOCENTE =
  "http://localhost:3001/api/docente/actividades";

const resumenInicial: ResumenActividades = {
  total_actividades: 0,
  actividades_con_intentos: 0,
  actividades_sin_intentos: 0,
  estudiantes_alcanzados: 0,
  intentos_totales: 0,
  completadas_totales: 0,
  respuestas_abiertas: 0,
  promedio_general: null,
};

const datosIniciales: ActividadesData = {
  actividades: [],
  respuestas_abiertas_recientes: [],
  resumen: resumenInicial,
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
      "El backend no devolvió JSON. Revisa que la ruta /api/docente/actividades esté registrada.",
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

function formatearFechaCorta(valor: string | null | undefined) {
  if (!valor) return "Sin intentos";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Sin intentos";

  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearTiempo(segundos: number | null | undefined) {
  const totalSegundos = Number(segundos || 0);

  if (totalSegundos <= 0) return "—";

  const minutos = Math.floor(totalSegundos / 60);
  const horas = Math.floor(minutos / 60);

  if (horas > 0) {
    const minutosRestantes = minutos % 60;
    return `${horas} h ${minutosRestantes} min`;
  }

  return `${Math.max(1, minutos)} min`;
}

function clasePromedio(promedio: number | null) {
  if (promedio === null) return "empty";
  if (promedio >= 8.5) return "good";
  if (promedio >= 7) return "medium";
  return "bad";
}

function obtenerIconoActividad(actividad: ActividadReal) {
  const mundo = normalizarTexto(String(actividad.mundo));
  const codigo = normalizarTexto(actividad.codigo);

  if (mundo.includes("mathdata")) return <FiDatabase />;
  if (mundo.includes("mathgeometry")) return <FiBox />;
  if (codigo.includes("enigma") || codigo.includes("espejos")) {
    return <FiStar />;
  }
  if (codigo.includes("escuadron") || codigo.includes("puente")) {
    return <FiLayers />;
  }

  return <FiHash />;
}

function obtenerTextoEstado(clase: EstadoActividadClase) {
  if (clase === "disabled") return <FiLock />;
  if (clase === "warning") return <FiAlertCircle />;
  return <FiCheckCircle />;
}

function ActividadesDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("actividades");
  const [datos, setDatos] = useState<ActividadesData>(datosIniciales);
  const [mundoFiltro, setMundoFiltro] = useState("Todos");
  const [temaFiltro, setTemaFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActividades, setPaginaActividades] = useState(0);
  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState<
    number | null
  >(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
    setPaginaActividades(0);
  }, [mundoFiltro, temaFiltro, busqueda]);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarActividades() {
      try {
        setCargando(true);
        setError("");

        const token = obtenerToken();
        const response = await fetch(API_ACTIVIDADES_DOCENTE, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const data = await leerRespuesta<ActividadesResponse>(response);

        if (!response.ok || data.ok === false) {
          throw new Error(
            data.mensaje || "No se pudieron cargar las actividades.",
          );
        }

        setDatos({
          actividades: data.actividades || [],
          respuestas_abiertas_recientes:
            data.respuestas_abiertas_recientes || [],
          resumen: data.resumen || resumenInicial,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las actividades.",
        );
        setDatos(datosIniciales);
      } finally {
        setCargando(false);
      }
    }

    cargarActividades();

    return () => controller.abort();
  }, []);

  const irARuta = (ruta: string, menu?: MenuKey) => {
    if (ruta === "/login" || menu === "logout") {
      clearAuthSession();
    }

    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const temas = useMemo(() => {
    const temasUnicos = Array.from(
      new Set(datos.actividades.map((actividad) => actividad.tema)),
    ).filter(Boolean);

    return ["Todos", ...temasUnicos];
  }, [datos.actividades]);

  const actividadesFiltradas = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busqueda);

    return datos.actividades.filter((actividad) => {
      const coincideMundo =
        mundoFiltro === "Todos" || actividad.mundo === mundoFiltro;

      const coincideTema =
        temaFiltro === "Todos" || actividad.tema === temaFiltro;

      const textoActividad = normalizarTexto(
        `${actividad.titulo} ${actividad.descripcion} ${actividad.tema} ${actividad.mundo}`,
      );

      const coincideBusqueda =
        !busquedaNormalizada || textoActividad.includes(busquedaNormalizada);

      return coincideMundo && coincideTema && coincideBusqueda;
    });
  }, [datos.actividades, mundoFiltro, temaFiltro, busqueda]);

  const actividadesPorPagina = 4;

  const totalPaginas = Math.max(
    1,
    Math.ceil(actividadesFiltradas.length / actividadesPorPagina),
  );

  const inicioPagina = paginaActividades * actividadesPorPagina;
  const finPagina = inicioPagina + actividadesPorPagina;

  const actividadesVisibles = actividadesFiltradas.slice(
    inicioPagina,
    finPagina,
  );

  const actividadSeleccionada =
    datos.actividades.find(
      (actividad) => actividad.id === actividadSeleccionadaId,
    ) ||
    actividadesFiltradas[0] ||
    null;

  useEffect(() => {
    if (
      actividadesFiltradas.length > 0 &&
      !actividadesFiltradas.some(
        (actividad) => actividad.id === actividadSeleccionadaId,
      )
    ) {
      setActividadSeleccionadaId(actividadesFiltradas[0].id);
    }
  }, [actividadesFiltradas, actividadSeleccionadaId]);

  const cambiarPagina = (direccion: "anterior" | "siguiente") => {
    setPaginaActividades((paginaActual) => {
      if (direccion === "anterior") {
        return paginaActual === 0 ? totalPaginas - 1 : paginaActual - 1;
      }

      return paginaActual + 1 >= totalPaginas ? 0 : paginaActual + 1;
    });
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

      <section className="actividades-content">
        <section className="actividades-hero-card">
          <div className="actividades-hero-text">
            <h1>Actividades</h1>
            <p>
              Consulta el uso real de las actividades: intentos, completadas,
              promedios automáticos y respuestas abiertas guardadas por tus
              alumnos.
            </p>
          </div>

          <div className="actividades-hero-visual">
            <div className="hero-world-card data">
              <img src={mundoMathData} alt="MathData" />
              <div>
                <span>MathData</span>
                <small>Datos y gráficas</small>
              </div>
            </div>

            <div className="hero-world-card geometry">
              <img src={mundoMathGeometry} alt="MathGeometry" />
              <div>
                <span>MathGeometry</span>
                <small>Figuras y ángulos</small>
              </div>
            </div>

            <div className="hero-world-card numbers">
              <img src={mundoMathNumbers} alt="MathNumbers" />
              <div>
                <span>MathNumbers</span>
                <small>Números y operaciones</small>
              </div>
            </div>
          </div>
        </section>

        {error && <section className="act-error-box">{error}</section>}

        <section className="act-stats-row">
          <article className="act-stat-card green">
            <div>
              <h3>Con intentos</h3>
              <strong>{datos.resumen.actividades_con_intentos}</strong>
              <p>{datos.resumen.total_actividades} actividades del catálogo</p>
            </div>

            <span>
              <FiCheckCircle />
            </span>
          </article>

          <article className="act-stat-card gray">
            <div>
              <h3>Sin intentos</h3>
              <strong>{datos.resumen.actividades_sin_intentos}</strong>
              <p>Disponibles cuando un alumno las trabaje</p>
            </div>

            <span>
              <FiLock />
            </span>
          </article>

          <article className="act-stat-card blue">
            <div>
              <h3>Intentos registrados</h3>
              <strong>{datos.resumen.intentos_totales}</strong>
              <p>{datos.resumen.estudiantes_alcanzados} alumnos alcanzados</p>
            </div>

            <span>
              <FiBookOpen />
            </span>
          </article>
        </section>

        <section className="act-filter-panel">
          <div className="act-search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Buscar actividad, tema o mundo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          <label className="act-select-field">
            <span>Filtrar por mundo</span>

            <select
              value={mundoFiltro}
              onChange={(event) => setMundoFiltro(event.target.value)}
            >
              <option>Todos</option>
              <option>MathData</option>
              <option>MathGeometry</option>
              <option>MathNumbers</option>
              <option>MathNova</option>
            </select>
          </label>

          <label className="act-select-field">
            <span>Filtrar por tema</span>

            <select
              value={temaFiltro}
              onChange={(event) => setTemaFiltro(event.target.value)}
            >
              {temas.map((tema) => (
                <option key={tema}>{tema}</option>
              ))}
            </select>
          </label>

          <div className="system-load-pill">
            <FiSliders />
            <div>
              <span>Seguimiento automático</span>
              <b>Sin revisión manual</b>
            </div>
          </div>
        </section>

        <section className="act-main-layout">
          <section className="activities-zone">
            <div className="activities-list-header">
              <div>
                <h2>Actividades del sistema</h2>
                <p>
                  Mostrando {actividadesVisibles.length} de{" "}
                  {actividadesFiltradas.length} actividades
                </p>
              </div>

              <div className="activities-page-actions">
                <button
                  type="button"
                  onClick={() => cambiarPagina("anterior")}
                  disabled={totalPaginas <= 1}
                  aria-label="Ver actividades anteriores"
                >
                  <FiChevronLeft />
                </button>

                <button
                  type="button"
                  className="view-more-btn"
                  onClick={() => cambiarPagina("siguiente")}
                  disabled={totalPaginas <= 1}
                >
                  Ver más
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <section className="teams-wide-card real-overview-card">
              <div className="teams-wide-header">
                <div>
                  <h2>Resumen real de actividades</h2>
                  <p>
                    Se alimenta con los intentos guardados cuando los alumnos
                    completan actividades desde su dashboard.
                  </p>
                </div>
              </div>

              <div className="real-overview-grid">
                <article>
                  <span>Promedio general</span>
                  <strong>{formatearPromedio(datos.resumen.promedio_general)}</strong>
                </article>

                <article>
                  <span>Completadas</span>
                  <strong>{datos.resumen.completadas_totales}</strong>
                </article>

                <article>
                  <span>Respuestas abiertas</span>
                  <strong>{datos.resumen.respuestas_abiertas}</strong>
                </article>

                <article>
                  <span>Alumnos con actividad</span>
                  <strong>{datos.resumen.estudiantes_alcanzados}</strong>
                </article>
              </div>
            </section>

            <section className="activities-grid">
              {cargando ? (
                <article className="activity-card empty-real">
                  <div className="activity-card-top">
                    <span className="activity-icon blue">
                      <FiBookOpen />
                    </span>
                  </div>

                  <h2>Cargando actividades...</h2>
                  <p>Estamos leyendo el progreso real de tus alumnos.</p>
                </article>
              ) : actividadesVisibles.length > 0 ? (
                actividadesVisibles.map((actividad) => (
                  <article
                    className={`activity-card ${actividad.color} ${
                      actividadSeleccionada?.id === actividad.id
                        ? "selected"
                        : ""
                    }`}
                    key={actividad.id}
                    onClick={() => setActividadSeleccionadaId(actividad.id)}
                  >
                    <div className="activity-card-top">
                      <span className={`activity-icon ${actividad.color}`}>
                        {obtenerIconoActividad(actividad)}
                      </span>

                      <button
                        type="button"
                        className={`enable-toggle-btn ${actividad.estado_clase}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActividadSeleccionadaId(actividad.id);
                        }}
                      >
                        {obtenerTextoEstado(actividad.estado_clase)}
                        {actividad.estado}
                      </button>
                    </div>

                    <h2>{actividad.titulo}</h2>

                    <p>{actividad.descripcion}</p>

                    <div className="activity-tags">
                      <span>{actividad.mundo}</span>
                      <span>{actividad.tema}</span>
                    </div>

                    <div className="activity-real-metrics">
                      <article>
                        <span>Alumnos</span>
                        <strong>{actividad.estudiantes_intentaron}</strong>
                      </article>

                      <article>
                        <span>Hechas</span>
                        <strong>{actividad.completadas}</strong>
                      </article>

                      <article>
                        <span>Intentos</span>
                        <strong>{actividad.intentos}</strong>
                      </article>

                      <article className={clasePromedio(actividad.promedio)}>
                        <span>Promedio</span>
                        <strong>{formatearPromedio(actividad.promedio)}</strong>
                      </article>
                    </div>

                    <div className="activity-bottom">
                      <small>
                        <FiClock />
                        {actividad.duracion}
                      </small>

                      <small>
                        <FiStar />
                        {actividad.dificultad}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="activity-action-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActividadSeleccionadaId(actividad.id);
                      }}
                    >
                      Ver detalle
                    </button>
                  </article>
                ))
              ) : (
                <article className="activity-card empty-real">
                  <div className="activity-card-top">
                    <span className="activity-icon gray">
                      <FiSearch />
                    </span>
                  </div>

                  <h2>No se encontraron actividades</h2>
                  <p>Cambia los filtros o limpia la búsqueda.</p>
                </article>
              )}
            </section>
          </section>

          <aside className="assignment-panel">
            <div className="assignment-panel-header">
              <span>
                <FiPlayCircle />
              </span>

              <div>
                <h2>Detalle de actividad</h2>
                <p>Información real generada por el progreso del alumno.</p>
              </div>
            </div>

            {actividadSeleccionada ? (
              <>
                <article className="selected-activity-box">
                  <small>Actividad seleccionada</small>
                  <h3>{actividadSeleccionada.titulo}</h3>
                  <p>
                    {actividadSeleccionada.mundo} · {actividadSeleccionada.tema}
                  </p>

                  <b className={`activity-detail-status ${actividadSeleccionada.estado_clase}`}>
                    {actividadSeleccionada.estado}
                  </b>
                </article>

                <div className="activity-detail-grid">
                  <article>
                    <span>Promedio</span>
                    <strong>
                      {formatearPromedio(actividadSeleccionada.promedio)}
                    </strong>
                  </article>

                  <article>
                    <span>Completadas</span>
                    <strong>{actividadSeleccionada.completadas}</strong>
                  </article>

                  <article>
                    <span>Intentos</span>
                    <strong>{actividadSeleccionada.intentos}</strong>
                  </article>

                  <article>
                    <span>Tiempo total</span>
                    <strong>
                      {formatearTiempo(
                        actividadSeleccionada.tiempo_total_segundos,
                      )}
                    </strong>
                  </article>
                </div>

                <article className="students-assignment-card">
                  <div className="students-assignment-title">
                    <h3>Respuestas abiertas</h3>
                    <span>{actividadSeleccionada.respuestas_abiertas}</span>
                  </div>

                  <div className="open-answer-list">
                    {actividadSeleccionada.muestras_respuestas.length > 0 ? (
                      actividadSeleccionada.muestras_respuestas.map(
                        (respuesta, index) => (
                          <article
                            className="open-answer-row"
                            key={`${respuesta.id_usuario}-${respuesta.campo}-${index}`}
                          >
                            <b>{respuesta.iniciales}</b>

                            <div>
                              <h4>{respuesta.alumno}</h4>
                              <small>
                                {respuesta.campo} ·{" "}
                                {formatearFechaCorta(respuesta.fecha)}
                              </small>
                              <p>{respuesta.respuesta}</p>
                            </div>
                          </article>
                        ),
                      )
                    ) : (
                      <div className="open-answer-empty">
                        <FiMessageSquare />
                        <p>
                          Esta actividad todavía no tiene respuestas abiertas
                          guardadas.
                        </p>
                      </div>
                    )}
                  </div>
                </article>

                <article className="random-card activity-note-card">
                  <div>
                    <span>
                      <FiShuffle />
                    </span>

                    <div>
                      <h3>Sin revisión manual</h3>

                      <p>
                        Las calificaciones se calculan en automático cuando el
                        alumno responde. Las respuestas abiertas se muestran
                        como evidencia, no como pendientes por revisar.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="assignment-mini-summary">
                  <span>
                    <FiAward />
                  </span>

                  <div>
                    <h3>
                      Último intento:{" "}
                      {formatearFechaCorta(
                        actividadSeleccionada.ultima_actividad,
                      )}
                    </h3>

                    <p>
                      Estrellas obtenidas por alumnos:{" "}
                      {actividadSeleccionada.estrellas}
                    </p>
                  </div>
                </article>

                <button
                  type="button"
                  className="publish-btn"
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                >
                  <FiCheckCircle />
                  Ver calificaciones
                </button>
              </>
            ) : (
              <article className="empty-selection">
                <FiBookOpen />
                <h3>Selecciona una actividad</h3>
                <p>
                  Cuando haya progreso real, aquí aparecerá el detalle de cada
                  actividad.
                </p>
              </article>
            )}
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

export default ActividadesDocente;
