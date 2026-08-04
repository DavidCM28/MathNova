import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/authSession";
import "./CalificacionesDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import heroCalificaciones from "../../assets/docente/calificaciones/hero-banner-calificaciones-docente.png";
import mundoMathNumbers from "../../assets/docente/calificaciones/mundo-1-MathNumbers.png";
import mundoMathGeometry from "../../assets/docente/calificaciones/mundo-2-MathGeometry.png";
import mundoMathData from "../../assets/docente/calificaciones/mundo-3-MathData.png";

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
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
  FiLock,
  FiClock,
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
  ultimo_mundo?: string | null;
  ultima_actividad?: string | null;
  actividades_intentadas: number;
  actividades_completadas: number;
  actividades_calificadas: number;
  intentos_totales: number;
  promedio: number | null;
  estrellas: number;
  tiempo_total_segundos?: number;
  estado: string;
  estado_clase: "excelente" | "bien" | "pendiente" | "alerta";
};

type PromedioActividad = {
  actividad_titulo: string;
  mundo?: string;
  promedio: number | null;
  completadas: number;
  intentadas?: number;
  intentos?: number;
};

type ResumenCalificaciones = {
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

type MundoId = "MathNumbers" | "MathGeometry" | "MathData";

type MundoDetalle = {
  id: MundoId;
  nombre: MundoId;
  imagen: string;
  clase: "numbers" | "geometry" | "data";
  actividades_realizadas: number;
  actividades_completadas: number;
  promedio: number | null;
  intentos: number;
  respuestas_abiertas: number;
};

type RespuestaDetalle = {
  campo: string;
  etiqueta: string;
  valor: string;
  abierta: boolean;
};

type ActividadDetalleAlumno = {
  codigo: string;
  titulo: string;
  mundo: MundoId | string;
  tema: string;
  aciertos: number;
  total_preguntas: number;
  precision: number | null;
  calificacion: number | null;
  estrellas: number;
  xp: number;
  completada: boolean;
  intentos: number;
  tiempo_segundos: number;
  fecha_ultimo_intento: string | null;
  estado: string;
  estado_clase: "completed" | "progress" | "open" | "locked";
  recomendacion: string;
  respuestas_abiertas: RespuestaDetalle[];
  respuestas_detalle: RespuestaDetalle[];
};

type DetalleAlumnoData = {
  alumno: AlumnoCalificacion;
  resumen: {
    actividades_intentadas: number;
    actividades_completadas: number;
    actividades_calificadas: number;
    intentos_totales: number;
    estrellas_totales: number;
    xp_total: number;
    tiempo_total_segundos: number;
    respuestas_abiertas: number;
    promedio: number | null;
  };
  mundos: Omit<MundoDetalle, "imagen" | "clase">[];
  actividades: ActividadDetalleAlumno[];
};

type DetalleAlumnoResponse = {
  ok: boolean;
  mensaje?: string;
} & DetalleAlumnoData;

const MUNDOS_VISUALES: Record<
  MundoId,
  Pick<MundoDetalle, "id" | "nombre" | "imagen" | "clase">
> = {
  MathNumbers: {
    id: "MathNumbers",
    nombre: "MathNumbers",
    imagen: mundoMathNumbers,
    clase: "numbers",
  },
  MathGeometry: {
    id: "MathGeometry",
    nombre: "MathGeometry",
    imagen: mundoMathGeometry,
    clase: "geometry",
  },
  MathData: {
    id: "MathData",
    nombre: "MathData",
    imagen: mundoMathData,
    clase: "data",
  },
};

const API_CALIFICACIONES_DOCENTE =
  "/api/docente/calificaciones";

const datosIniciales: CalificacionesData = {
  grupos: [],
  alumnos: [],
  promedio_por_actividad: [],
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

function formatearFechaCorta(valor: string | null | undefined) {
  if (!valor) return "";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "";

  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

function formatearFechaDetalle(valor: string | null | undefined) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatearTiempo(segundos: number | null | undefined) {
  const totalSegundos = Number(segundos || 0);

  if (totalSegundos <= 0) return "—";

  const minutos = Math.floor(totalSegundos / 60);
  const horas = Math.floor(minutos / 60);

  if (horas > 0) {
    return `${horas} h ${minutos % 60} min`;
  }

  return `${Math.max(1, minutos)} min`;
}

function normalizarMundoId(mundo: string | null | undefined): MundoId | string {
  const texto = normalizarTexto(String(mundo || ""))
    .replace(/[\s_-]+/g, "");

  if (texto === "mathnumbers" || texto === "numbers") return "MathNumbers";
  if (texto === "mathgeometry" || texto === "geometry") return "MathGeometry";
  if (texto === "mathdata" || texto === "data") return "MathData";

  return mundo || "MathNova";
}

function clasePromedio(promedio: number | null) {
  if (promedio === null) return "empty";
  if (promedio >= 8.5) return "good";
  if (promedio >= 7) return "medium";
  return "bad";
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
  const [alumnoDetalle, setAlumnoDetalle] = useState<AlumnoCalificacion | null>(
    null,
  );
  const [detalleAlumno, setDetalleAlumno] = useState<DetalleAlumnoData | null>(
    null,
  );
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [mundoSeleccionado, setMundoSeleccionado] =
    useState<MundoId>("MathNumbers");
  const scrollBloqueadoRef = useRef(0);

  const navigate = useNavigate();
  const alumnosPorPagina = 8;

  useEffect(() => {
    if (alumnoDetalle) {
      scrollBloqueadoRef.current = window.scrollY;

      document.documentElement.classList.add("calif-modal-open");
      document.body.classList.add("calif-modal-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollBloqueadoRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.documentElement.classList.remove("calif-modal-open");
      document.body.classList.remove("calif-modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = menuOpen ? "hidden" : "";

      window.scrollTo(0, scrollBloqueadoRef.current);
    }

    return () => {
      document.documentElement.classList.remove("calif-modal-open");
      document.body.classList.remove("calif-modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [menuOpen, alumnoDetalle]);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  const irARuta = (ruta: string, menu?: string) => {
    if (ruta === "/login" || menu === "logout") {
      clearAuthSession();
    }

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
          resumen: {
            ...datosIniciales.resumen,
            ...(data.resumen || {}),
          },
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
    if (!alumnoDetalle) {
      setDetalleAlumno(null);
      setCargandoDetalle(false);
      setErrorDetalle("");
      return;
    }

    const controller = new AbortController();
    const alumnoSeleccionado = alumnoDetalle;

    async function cargarDetalleAlumno() {
      try {
        setCargandoDetalle(true);
        setErrorDetalle("");

        const token = obtenerToken();
        const response = await fetch(
          `${API_CALIFICACIONES_DOCENTE}/alumno/${alumnoSeleccionado.id}`,
          {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        const data = await leerRespuesta<DetalleAlumnoResponse>(response);

        if (!response.ok || data.ok === false) {
          throw new Error(
            data.mensaje || "No se pudo cargar el detalle del alumno.",
          );
        }

        setDetalleAlumno({
          alumno: data.alumno,
          resumen: data.resumen,
          mundos: data.mundos || [],
          actividades: data.actividades || [],
        });

        const mundoConActividad = (data.mundos || []).find(
          (mundo) => mundo.actividades_realizadas > 0,
        );
        const mundoNormalizado = normalizarMundoId(
          mundoConActividad?.id || "",
        );

        setMundoSeleccionado(
          mundoNormalizado === "MathNumbers" ||
            mundoNormalizado === "MathGeometry" ||
            mundoNormalizado === "MathData"
            ? mundoNormalizado
            : "MathNumbers",
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setDetalleAlumno(null);
        setErrorDetalle(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el detalle del alumno.",
        );
      } finally {
        setCargandoDetalle(false);
      }
    }

    cargarDetalleAlumno();

    return () => controller.abort();
  }, [alumnoDetalle]);

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

  const rangoInicial = alumnosFiltrados.length === 0 ? 0 : indiceInicial + 1;
  const rangoFinal = Math.min(indiceFinal, alumnosFiltrados.length);

  const mundosDetalle = useMemo<MundoDetalle[]>(() => {
    return (Object.keys(MUNDOS_VISUALES) as MundoId[]).map((id) => {
      const datosMundo = detalleAlumno?.mundos.find(
        (mundo) => normalizarMundoId(mundo.id) === id,
      );

      return {
        ...MUNDOS_VISUALES[id],
        actividades_realizadas: Number(
          datosMundo?.actividades_realizadas || 0,
        ),
        actividades_completadas: Number(
          datosMundo?.actividades_completadas || 0,
        ),
        promedio:
          datosMundo?.promedio === null || datosMundo?.promedio === undefined
            ? null
            : Number(datosMundo.promedio),
        intentos: Number(datosMundo?.intentos || 0),
        respuestas_abiertas: Number(datosMundo?.respuestas_abiertas || 0),
      };
    });
  }, [detalleAlumno]);

  const actividadesDetalleMundo = useMemo(() => {
    return (detalleAlumno?.actividades || [])
      .filter((actividad) => normalizarMundoId(actividad.mundo) === mundoSeleccionado)
      .sort((a, b) => {
        const fechaA = a.fecha_ultimo_intento
          ? new Date(a.fecha_ultimo_intento).getTime()
          : 0;
        const fechaB = b.fecha_ultimo_intento
          ? new Date(b.fecha_ultimo_intento).getTime()
          : 0;

        return fechaB - fechaA;
      });
  }, [detalleAlumno, mundoSeleccionado]);

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
              Consulta los resultados que MathNova calcula automáticamente
              cuando tus alumnos completan sus actividades.
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
              <strong>
                {formatearPromedio(datos.resumen.promedio_general)}
              </strong>
            </div>

            <span className="calif-stat-icon">
              <FiBarChart2 />
            </span>
          </article>

          <article className="calif-stat-card blue">
            <div>
              <h3>Resultados guardados</h3>
              <strong>
                {datos.resumen.actividades_calificadas}
                <small>calificaciones</small>
              </strong>
            </div>

            <span className="calif-stat-icon">
              <FiUserCheck />
            </span>
          </article>

          <article className="calif-stat-card orange">
            <div>
              <h3>Intentos registrados</h3>
              <strong>
                {datos.resumen.intentos_totales}
                <small>intentos</small>
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
                <span>Intentos</span>
                <span>Promedio</span>
                <span>Estrellas</span>
                <span>Detalles</span>
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
                        <small>
                          {alumno.ultimo_modulo}
                          {alumno.ultima_actividad
                            ? ` · ${formatearFechaCorta(
                                alumno.ultima_actividad,
                              )}`
                            : ""}
                        </small>
                      </span>
                    </span>

                    <span>{alumno.grupo}</span>
                    <span>{alumno.actividades_completadas}</span>
                    <span>{alumno.intentos_totales}</span>

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

                    <span className="calif-details-cell">
                      <button
                        type="button"
                        className="calif-details-btn"
                        onClick={() => {
                          setMundoSeleccionado("MathNumbers");
                          setAlumnoDetalle(alumno);
                        }}
                        aria-label={`Ver detalles de ${alumno.nombre}`}
                        title="Ver detalles"
                      >
                        <FiEye />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="calif-table-footer">
              <p>
                Mostrando {rangoInicial} a {rangoFinal} de{" "}
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
                  Todavía no hay actividades calificadas.
                </p>
              ) : (
                <div className="calif-bar-chart">
                  {datos.promedio_por_actividad.map((actividad, index) => {
                    const promedioActividad = Number(actividad.promedio || 0);
                    const colores = [
                      "blue-bar",
                      "green-bar",
                      "orange-bar",
                      "purple-bar",
                    ];

                    return (
                      <div
                        className="calif-bar-item"
                        key={`${actividad.actividad_titulo}-${index}`}
                      >
                        <strong>{formatearPromedio(actividad.promedio)}</strong>
                        <span
                          className={`calif-bar ${colores[index % colores.length]}`}
                          style={{
                            height: `${Math.max(18, promedioActividad * 12)}px`,
                          }}
                        ></span>
                        <small>
                          {actividad.actividad_titulo}
                          {actividad.mundo ? ` · ${actividad.mundo}` : ""}
                        </small>
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

      {alumnoDetalle && (
        <div
          className="calif-detail-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAlumnoDetalle(null);
          }}
        >
          <section
            className="calif-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calif-detail-title"
          >
            <div className="calif-detail-accent" />

            <button
              type="button"
              className="calif-detail-close"
              onClick={() => setAlumnoDetalle(null)}
              aria-label="Cerrar detalles"
            >
              <FiX />
            </button>

            <div className="calif-detail-scroll">
              <header className="calif-detail-header">
                <div className={`calif-detail-avatar ${alumnoDetalle.color}`}>
                  {alumnoDetalle.iniciales}
                </div>

                <div className="calif-detail-title-wrap">
                  <span className="calif-detail-label">
                    Ficha del estudiante
                  </span>
                  <h2 id="calif-detail-title">{alumnoDetalle.nombre}</h2>
                  <p>
                    Revisa el progreso del estudiante en todos los mundos y
                    actividades.
                  </p>
                </div>

                <span
                  className={`calif-detail-active ${alumnoDetalle.estado_clase}`}
                >
                  {detalleAlumno?.alumno.estado || alumnoDetalle.estado}
                </span>
              </header>

              {cargandoDetalle ? (
                <div className="calif-detail-state-card">
                  <FiClock />
                  <p>Cargando actividades reales del alumno...</p>
                </div>
              ) : errorDetalle ? (
                <div className="calif-detail-state-card error">
                  <FiX />
                  <p>{errorDetalle}</p>
                </div>
              ) : detalleAlumno ? (
                <>
                  <div className="calif-world-helper">
                    <FiEye />
                    <span>
                      Datos leídos desde el progreso real guardado por el alumno.
                    </span>
                  </div>

                  <div className="calif-detail-summary-grid">
                    <article>
                      <span>Promedio</span>
                      <strong>
                        {formatearPromedio(detalleAlumno.resumen.promedio)}
                      </strong>
                    </article>
                    <article>
                      <span>Completadas</span>
                      <strong>
                        {detalleAlumno.resumen.actividades_completadas}
                      </strong>
                    </article>
                    <article>
                      <span>Intentos</span>
                      <strong>{detalleAlumno.resumen.intentos_totales}</strong>
                    </article>
                    <article>
                      <span>Tiempo total</span>
                      <strong>
                        {formatearTiempo(
                          detalleAlumno.resumen.tiempo_total_segundos,
                        )}
                      </strong>
                    </article>
                    <article>
                      <span>Respuestas abiertas</span>
                      <strong>{detalleAlumno.resumen.respuestas_abiertas}</strong>
                    </article>
                  </div>

                  <div className="calif-world-grid">
                    {mundosDetalle.map((mundo) => (
                      <button
                        type="button"
                        className={`calif-world-card ${mundo.clase} ${
                          mundoSeleccionado === mundo.id ? "selected" : ""
                        }`}
                        key={mundo.id}
                        onClick={() => setMundoSeleccionado(mundo.id)}
                        aria-pressed={mundoSeleccionado === mundo.id}
                      >
                        <img src={mundo.imagen} alt={mundo.nombre} />
                        <div>
                          <h3>{mundo.nombre}</h3>
                          <p>
                            {mundo.actividades_completadas}/
                            {mundo.actividades_realizadas} realizadas
                          </p>
                          <span>
                            Promedio:{" "}
                            <b>{formatearPromedio(mundo.promedio)}</b>
                          </span>
                          <small>
                            {mundo.intentos} intentos ·{" "}
                            {mundo.respuestas_abiertas} abiertas
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>

                  <section className="calif-activities-detail">
                    <div className="calif-activities-title">
                      <div>
                        <span>Actividades realizadas</span>
                        <h3>Detalle - {mundoSeleccionado}</h3>
                      </div>
                      <b>{actividadesDetalleMundo.length} registros</b>
                    </div>

                    <div className="calif-detail-table-wrap">
                      <div className="calif-detail-table">
                        <div className="calif-detail-row calif-detail-head">
                          <span>#</span>
                          <span>Actividad</span>
                          <span>Estado</span>
                          <span>Calificación</span>
                          <span>Aciertos</span>
                          <span>Intentos</span>
                          <span>Último intento</span>
                        </div>

                        {actividadesDetalleMundo.length === 0 ? (
                          <div className="calif-detail-empty">
                            <FiLock />
                            <p>
                              Este alumno todavía no tiene actividades guardadas
                              en {mundoSeleccionado}.
                            </p>
                          </div>
                        ) : (
                          actividadesDetalleMundo.map((actividad, index) => (
                            <div
                              className="calif-activity-detail-block"
                              key={`${actividad.codigo}-${actividad.fecha_ultimo_intento || index}`}
                            >
                              <div className="calif-detail-row">
                                <span>{index + 1}</span>
                                <span className="calif-detail-activity-name">
                                  {actividad.titulo}
                                  <small>{actividad.tema}</small>
                                </span>
                                <span>
                                  <b
                                    className={`calif-detail-status ${actividad.estado_clase}`}
                                  >
                                    {actividad.completada ? (
                                      <FiCheckCircle />
                                    ) : (
                                      <FiClock />
                                    )}
                                    {actividad.estado}
                                  </b>
                                </span>
                                <span className="calif-detail-grade">
                                  {formatearPromedio(actividad.calificacion)}
                                </span>
                                <span>
                                  {actividad.aciertos}/
                                  {actividad.total_preguntas}
                                </span>
                                <span>{actividad.intentos}</span>
                                <span>
                                  {formatearFechaDetalle(
                                    actividad.fecha_ultimo_intento,
                                  )}
                                </span>
                              </div>

                              <div className="calif-activity-evidence">
                                <div className="calif-activity-mini-metrics">
                                  <span>
                                    Precisión:{" "}
                                    <b>
                                      {actividad.precision === null
                                        ? "—"
                                        : `${actividad.precision.toFixed(1)}%`}
                                    </b>
                                  </span>
                                  <span>
                                    Estrellas: <b>{actividad.estrellas}</b>
                                  </span>
                                  <span>
                                    XP: <b>{actividad.xp}</b>
                                  </span>
                                  <span>
                                    Tiempo:{" "}
                                    <b>
                                      {formatearTiempo(
                                        actividad.tiempo_segundos,
                                      )}
                                    </b>
                                  </span>
                                </div>

                                <p className="calif-activity-recommendation">
                                  {actividad.recomendacion}
                                </p>

                                <div className="calif-answer-section">
                                  <h4>Respuestas abiertas</h4>
                                  {actividad.respuestas_abiertas.length > 0 ? (
                                    actividad.respuestas_abiertas.map(
                                      (respuesta) => (
                                        <article
                                          className="calif-answer-card open"
                                          key={`${actividad.codigo}-${respuesta.campo}`}
                                        >
                                          <span>{respuesta.etiqueta}</span>
                                          <p>{respuesta.valor}</p>
                                        </article>
                                      ),
                                    )
                                  ) : (
                                    <p className="calif-answer-empty">
                                      Esta actividad no tiene respuestas abiertas
                                      guardadas.
                                    </p>
                                  )}
                                </div>

                                <div className="calif-answer-section compact">
                                  <h4>Respuestas guardadas</h4>
                                  {actividad.respuestas_detalle.length > 0 ? (
                                    <div className="calif-answer-grid">
                                      {actividad.respuestas_detalle.map(
                                        (respuesta) => (
                                          <article
                                            className="calif-answer-card"
                                            key={`${actividad.codigo}-${respuesta.campo}-${respuesta.valor}`}
                                          >
                                            <span>{respuesta.etiqueta}</span>
                                            <p>{respuesta.valor}</p>
                                          </article>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <p className="calif-answer-empty">
                                      No se guardaron respuestas detalladas para
                                      esta actividad.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="calif-detail-state-card">
                  <FiEye />
                  <p>Selecciona un alumno para consultar sus actividades.</p>
                </div>
              )}

              <footer className="calif-detail-footer">
                <div className="calif-detail-legend">
                  <span>
                    <i className="completed">
                      <FiCheckCircle />
                    </i>
                    Buen resultado
                  </span>
                  <span>
                    <i className="progress">
                      <FiClock />
                    </i>
                    En proceso
                  </span>
                  <span>
                    <i className="locked">
                      <FiLock />
                    </i>
                    Requiere apoyo
                  </span>
                </div>

                <button type="button" onClick={() => setAlumnoDetalle(null)}>
                  Cerrar
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default CalificacionesDocente;
