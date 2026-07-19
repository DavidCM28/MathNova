import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import "./AdministrarAlumnosDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import heroAdminAlumnos from "../../assets/docente/administrarAlumnos/hero-banner-admin-alumnos-docentes.png";

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
  FiPlus,
  FiSearch,
  FiDownload,
  FiUserPlus,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiStar,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiUser,
  FiMail,
  FiLock,
} from "react-icons/fi";

type Alumno = {
  id?: number;
  id_alumno?: number;
  iniciales: string;
  nombre: string;
  correo: string;
  usuario: string | null;
  grupo: string;
  modulo: string;
  asistencia: number | null;
  promedio: number | null;
  estado: "Activo" | "Rezago";
  color: string;
  barra: string;
  fecha_registro?: string;
};

type Resumen = {
  total: number;
  activos: number;
  rezago: number;
  asistencia_baja: number;
  promedio_general: number | null;
  porcentaje_activos: number;
  porcentaje_rezago: number;
};

type DocenteAlumnosResponse = {
  ok: boolean;
  resumen: Resumen;
  alumnos: Alumno[];
  mensaje?: string;
};

type ApiResponse = {
  ok?: boolean;
  mensaje?: string;
  [key: string]: unknown;
};

type AlertaVisual = {
  tipo: "success" | "error";
  titulo: string;
  mensaje: string;
  nombre?: string;
};

const API_DOCENTE_ALUMNOS = "http://localhost:3001/api/docente/alumnos";
const ALUMNOS_POR_PAGINA = 5;

const resumenInicial: Resumen = {
  total: 0,
  activos: 0,
  rezago: 0,
  asistencia_baja: 0,
  promedio_general: null,
  porcentaje_activos: 0,
  porcentaje_rezago: 0,
};

const formAgregarInicial = {
  nombre_completo: "",
  correo: "",
  usuario: "",
  password: "",
};

const formEditarInicial = {
  nombre_completo: "",
  correo: "",
  usuario: "",
  password: "",
};

function obtenerToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token")
  );
}

async function leerRespuesta(response: Response): Promise<ApiResponse> {
  const texto = await response.text();

  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error("El backend no devolvió JSON.");
  }
}

function formatearFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function obtenerIdAlumno(alumno: Alumno): number {
  return Number(alumno.id_alumno ?? alumno.id);
}

function obtenerIniciales(alumno: Alumno) {
  const inicialesBackend = alumno.iniciales?.trim();

  if (inicialesBackend) {
    return inicialesBackend.slice(0, 2).toUpperCase();
  }

  return (
    alumno.nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join("")
      .toUpperCase() || "AL"
  );
}

const PALETA_AVATARES = [
  "#ff4d57",
  "#ff9800",
  "#7c3aed",
  "#0f62fe",
  "#14b8a6",
  "#ec4899",
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f97316",
];

function obtenerColorPersonalizado(color?: string) {
  if (!color) return null;

  const colores: Record<string, string> = {
    blue: "#0f62fe",
    purple: "#7c3aed",
    dark: "#32405f",
    green: "#14b8a6",
    orange: "#ff9800",
    pink: "#ec4899",
    red: "#ff4d57",
    teal: "#14b8a6",
  };

  const colorNormalizado = color.trim().toLowerCase();

  if (colores[colorNormalizado]) {
    return colores[colorNormalizado];
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(colorNormalizado)) {
    return colorNormalizado;
  }

  if (/^(rgb|rgba|hsl|hsla)\(/i.test(colorNormalizado)) {
    return colorNormalizado;
  }

  return null;
}

function obtenerColorAvatar(alumno: Alumno) {
  const colorPersonalizado = obtenerColorPersonalizado(alumno.color);

  if (colorPersonalizado && alumno.color?.trim().toLowerCase() !== "blue") {
    return colorPersonalizado;
  }

  const semilla = `${obtenerIdAlumno(alumno)}-${alumno.nombre}`;
  const valorSemilla = Array.from(semilla).reduce(
    (acumulado, caracter) => acumulado + caracter.charCodeAt(0),
    0,
  );

  return PALETA_AVATARES[valorSemilla % PALETA_AVATARES.length];
}

function estiloAvatar(alumno: Alumno): CSSProperties {
  return {
    backgroundColor: obtenerColorAvatar(alumno),
  };
}

function AdministrarAlumnosDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [resumen, setResumen] = useState<Resumen>(resumenInicial);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [formAgregar, setFormAgregar] = useState(formAgregarInicial);

  const [alumnoDetalle, setAlumnoDetalle] = useState<Alumno | null>(null);
  const [alumnoEditar, setAlumnoEditar] = useState<Alumno | null>(null);
  const [alumnoEliminar, setAlumnoEliminar] = useState<Alumno | null>(null);
  const [alertaVisual, setAlertaVisual] = useState<AlertaVisual | null>(null);
  const [formEditar, setFormEditar] = useState(formEditarInicial);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("administrar-alumnos");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ||
      modalAgregarOpen ||
      Boolean(alumnoDetalle) ||
      Boolean(alumnoEditar) ||
      Boolean(alumnoEliminar) ||
      Boolean(alertaVisual)
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    menuOpen,
    modalAgregarOpen,
    alumnoDetalle,
    alumnoEditar,
    alumnoEliminar,
    alertaVisual,
  ]);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cerrarModalAgregar();
        cerrarModalDetalle();
        cerrarModalEditar();
        setAlumnoEliminar(null);
        setAlertaVisual(null);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        setCargando(true);
        setError("");
        setPaginaActual(1);

        const token = obtenerToken();

        if (!token) {
          throw new Error("Debes iniciar sesión para ver los alumnos.");
        }

        const params = new URLSearchParams();

        if (busqueda.trim()) {
          params.set("buscar", busqueda.trim());
        }

        const url = params.toString()
          ? `${API_DOCENTE_ALUMNOS}?${params.toString()}`
          : API_DOCENTE_ALUMNOS;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await leerRespuesta(response)) as DocenteAlumnosResponse;

        if (!response.ok) {
          throw new Error(
            data?.mensaje || "No se pudieron cargar los alumnos.",
          );
        }

        setResumen(data.resumen || resumenInicial);
        setAlumnos(data.alumnos || []);
      } catch (error) {
        setResumen(resumenInicial);
        setAlumnos([]);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los alumnos.",
        );
      } finally {
        setCargando(false);
      }
    };

    const timer = window.setTimeout(() => {
      void cargarAlumnos();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [busqueda, reloadKey]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnos.length / ALUMNOS_POR_PAGINA),
  );

  const alumnosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * ALUMNOS_POR_PAGINA;
    const fin = inicio + ALUMNOS_POR_PAGINA;

    return alumnos.slice(inicio, fin);
  }, [alumnos, paginaActual]);

  const alumnosRecientes = alumnos.slice(0, 3);

  const limpiarMensajes = () => {
    setError("");
    setMensajeExito("");
  };

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarModalAgregar = () => {
    setModalAgregarOpen(false);
    setFormAgregar(formAgregarInicial);
  };

  const abrirModalDetalle = (alumno: Alumno) => {
    limpiarMensajes();
    setAlumnoDetalle(alumno);
  };

  const cerrarModalDetalle = () => {
    setAlumnoDetalle(null);
  };

  const abrirModalEditar = (alumno: Alumno) => {
    setFormEditar({
      nombre_completo: alumno.nombre,
      correo: alumno.correo,
      usuario: alumno.usuario || "",
      password: "",
    });

    setAlumnoEditar(alumno);
  };

  const cerrarModalEditar = () => {
    setAlumnoEditar(null);
    setFormEditar(formEditarInicial);
  };

  const cambiarPagina = (pagina: number) => {
    const paginaSegura = Math.min(Math.max(pagina, 1), totalPaginas);
    setPaginaActual(paginaSegura);
  };

  const crearAlumno = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setGuardando(true);
      limpiarMensajes();

      const token = obtenerToken();

      if (!token) {
        throw new Error("Debes iniciar sesión para agregar alumnos.");
      }

      const response = await fetch(API_DOCENTE_ALUMNOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formAgregar),
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        throw new Error(data?.mensaje || "No se pudo agregar el alumno.");
      }

      const nombreAlumnoNuevo = formAgregar.nombre_completo.trim();

      cerrarModalAgregar();
      setMensajeExito("");
      setAlertaVisual({
        tipo: "success",
        titulo: "¡Alumno agregado!",
        mensaje: "El estudiante fue registrado correctamente en MathNova.",
        nombre: nombreAlumnoNuevo,
      });
      setReloadKey((valor) => valor + 1);
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo agregar el alumno.";

      setError("");
      setAlertaVisual({
        tipo: "error",
        titulo: "No se pudo agregar",
        mensaje,
      });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarAlumno = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!alumnoEditar) return;

    try {
      setGuardando(true);
      limpiarMensajes();

      const token = obtenerToken();

      if (!token) {
        throw new Error("Debes iniciar sesión para editar alumnos.");
      }

      const idAlumno = obtenerIdAlumno(alumnoEditar);

      if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
        throw new Error("No se encontró el identificador del alumno.");
      }

      const response = await fetch(`${API_DOCENTE_ALUMNOS}/${idAlumno}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formEditar),
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        throw new Error(data?.mensaje || "No se pudo editar el alumno.");
      }

      const nombreAlumnoActualizado =
        formEditar.nombre_completo.trim() || alumnoEditar.nombre;

      cerrarModalEditar();
      setMensajeExito("");
      setAlertaVisual({
        tipo: "success",
        titulo: "¡Alumno actualizado!",
        mensaje:
          "Los datos del estudiante se actualizaron correctamente en MathNova.",
        nombre: nombreAlumnoActualizado,
      });
      setReloadKey((valor) => valor + 1);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudo editar el alumno.";

      setError("");
      setAlertaVisual({
        tipo: "error",
        titulo: "No se pudo actualizar",
        mensaje,
        nombre: formEditar.nombre_completo.trim() || alumnoEditar.nombre,
      });
    } finally {
      setGuardando(false);
    }
  };

  const solicitarEliminarAlumno = (alumno: Alumno) => {
    limpiarMensajes();
    setAlumnoEliminar(alumno);
  };

  const cancelarEliminarAlumno = () => {
    if (!guardando) setAlumnoEliminar(null);
  };

  const eliminarAlumno = async () => {
    if (!alumnoEliminar) return;

    const alumnoSeleccionado = alumnoEliminar;

    try {
      setGuardando(true);
      limpiarMensajes();

      const token = obtenerToken();

      if (!token) {
        throw new Error("Debes iniciar sesión para eliminar alumnos.");
      }

      const idAlumno = obtenerIdAlumno(alumnoSeleccionado);

      if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
        throw new Error("No se encontró el identificador del alumno.");
      }

      const response = await fetch(`${API_DOCENTE_ALUMNOS}/${idAlumno}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        throw new Error(data?.mensaje || "No se pudo eliminar el alumno.");
      }

      setAlumnoEliminar(null);
      setMensajeExito("");
      setAlertaVisual({
        tipo: "success",
        titulo: "Alumno eliminado",
        mensaje: "La cuenta del estudiante fue desactivada correctamente.",
        nombre: alumnoSeleccionado.nombre,
      });
      setReloadKey((valor) => valor + 1);
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el alumno.";

      setAlumnoEliminar(null);
      setError("");
      setAlertaVisual({
        tipo: "error",
        titulo: "No se pudo eliminar",
        mensaje,
        nombre: alumnoSeleccionado.nombre,
      });
    } finally {
      setGuardando(false);
    }
  };

  const descargarListaAlumnos = () => {
    const encabezados = [
      "Nombre",
      "Correo",
      "Usuario",
      "Grupo",
      "Modulo",
      "Asistencia",
      "Promedio",
      "Estado",
    ];

    const filas = alumnos.map((alumno) => [
      alumno.nombre,
      alumno.correo,
      alumno.usuario || "",
      alumno.grupo,
      alumno.modulo,
      alumno.asistencia !== null ? `${alumno.asistencia}%` : "",
      alumno.promedio !== null ? String(alumno.promedio) : "",
      alumno.estado,
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) =>
        fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const archivo = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(archivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "alumnos-mathnova.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const inicioMostrado =
    alumnos.length === 0 ? 0 : (paginaActual - 1) * ALUMNOS_POR_PAGINA + 1;

  const finMostrado = Math.min(
    paginaActual * ALUMNOS_POR_PAGINA,
    alumnos.length,
  );

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
                  className={`docente-submenu-item ${
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

      <section className="admin-content">
        <section className="admin-top">
          <div className="admin-top-text">
            <h1>Administrar alumnos</h1>
            <p>
              Organiza, edita y da seguimiento al progreso académico de tus
              estudiantes.
            </p>
          </div>

          <img
            src={heroAdminAlumnos}
            alt="Administrar alumnos"
            className="admin-hero-img"
          />
        </section>

        <section className="admin-toolbar">
          <div className="admin-toolbar-buttons">
            <button
              type="button"
              className="admin-action-btn primary"
              onClick={() => {
                limpiarMensajes();
                setModalAgregarOpen(true);
              }}
            >
              <FiPlus />
              Agregar alumno
            </button>

            <button
              type="button"
              className="admin-action-btn"
              onClick={descargarListaAlumnos}
            >
              <FiDownload />
              Descargar lista
            </button>
          </div>

          <label className="admin-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>
        </section>

        {error && (
          <section className="admin-table-card">
            <p>{error}</p>
          </section>
        )}

        {mensajeExito && (
          <section className="admin-table-card">
            <p>{mensajeExito}</p>
          </section>
        )}

        <section className="admin-stats-grid">
          <article className="admin-stat-card blue-card">
            <div>
              <h3>Total de alumnos</h3>
              <strong>{resumen.total}</strong>
              <p>Usuarios con rol estudiante</p>
            </div>

            <div className="admin-stat-icon">
              <FiUsers />
            </div>
          </article>

          <article className="admin-stat-card green-card">
            <div>
              <h3>Activos</h3>
              <strong>{resumen.activos}</strong>
              <p>{resumen.porcentaje_activos}% del total</p>
            </div>

            <div className="admin-stat-icon">
              <FiCheckCircle />
            </div>
          </article>

          <article className="admin-stat-card orange-card">
            <div>
              <h3>Rezago detectado</h3>
              <strong>{resumen.rezago}</strong>
              <p>{resumen.porcentaje_rezago}% del total</p>
            </div>

            <div className="admin-stat-icon">
              <FiAlertTriangle />
            </div>
          </article>

          <article className="admin-stat-card purple-card">
            <div>
              <h3>Promedio general</h3>
              <strong>
                {resumen.promedio_general !== null
                  ? resumen.promedio_general
                  : "—"}
              </strong>
              <p>Calculado con datos disponibles</p>
            </div>

            <div className="admin-stat-icon">
              <FiStar />
            </div>
          </article>
        </section>

        <section className="admin-table-card">
          <div className="admin-table">
            <div className="admin-table-row admin-table-head">
              <span>Alumno</span>
              <span>Grupo</span>
              <span>Módulo</span>
              <span>Asistencia</span>
              <span>Promedio</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {cargando ? (
              <div className="admin-table-row">
                <span>Cargando alumnos...</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            ) : alumnosPagina.length > 0 ? (
              alumnosPagina.map((alumno) => (
                <div className="admin-table-row" key={obtenerIdAlumno(alumno)}>
                  <span className="student-cell">
                    <b
                      className="student-avatar"
                      style={estiloAvatar(alumno)}
                      aria-hidden="true"
                    >
                      {obtenerIniciales(alumno)}
                    </b>
                    {alumno.nombre}
                  </span>

                  <span>{alumno.grupo}</span>
                  <span>{alumno.modulo}</span>

                  <span className="attendance-cell">
                    {alumno.asistencia !== null ? `${alumno.asistencia}%` : "—"}
                    <i className={`attendance-line ${alumno.barra}`}></i>
                  </span>

                  <span
                    className={`average ${
                      alumno.promedio !== null && alumno.promedio < 7
                        ? "low"
                        : "good"
                    }`}
                  >
                    {alumno.promedio !== null ? alumno.promedio : "—"}
                  </span>

                  <span>
                    <b
                      className={`status-pill ${
                        alumno.estado === "Activo" ? "activo" : "rezago"
                      }`}
                    >
                      {alumno.estado}
                    </b>
                  </span>

                  <span className="actions-cell">
                    <button
                      type="button"
                      aria-label={`Ver a ${alumno.nombre}`}
                      onClick={() => abrirModalDetalle(alumno)}
                    >
                      <FiEye />
                    </button>

                    <button
                      type="button"
                      aria-label={`Editar a ${alumno.nombre}`}
                      onClick={() => {
                        limpiarMensajes();
                        abrirModalEditar(alumno);
                      }}
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      className="delete"
                      aria-label={`Eliminar a ${alumno.nombre}`}
                      onClick={() => solicitarEliminarAlumno(alumno)}
                      disabled={guardando}
                    >
                      <FiTrash2 />
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <div className="admin-table-row">
                <span>No se encontraron alumnos.</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            )}
          </div>

          <div className="admin-table-bottom">
            <p>
              Mostrando {inicioMostrado} a {finMostrado} de {alumnos.length}{" "}
              alumnos
            </p>

            <div className="pagination">
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPaginas }, (_, index) => index + 1)
                .slice(0, 3)
                .map((pagina) => (
                  <button
                    type="button"
                    key={pagina}
                    className={paginaActual === pagina ? "current" : ""}
                    onClick={() => cambiarPagina(pagina)}
                  >
                    {pagina}
                  </button>
                ))}

              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                {">"}
              </button>
            </div>
          </div>
        </section>

        <section className="admin-bottom-grid">
          <article className="admin-small-card recent-card">
            <h2>
              <FiInfo />
              Alumnos recientes
            </h2>

            {alumnosRecientes.length > 0 ? (
              alumnosRecientes.map((alumno) => (
                <div className="recent-row" key={obtenerIdAlumno(alumno)}>
                  <span
                    className="mini-avatar"
                    style={estiloAvatar(alumno)}
                    aria-hidden="true"
                  >
                    {obtenerIniciales(alumno)}
                  </span>
                  <p>{alumno.nombre}</p>
                  <b>{formatearFecha(alumno.fecha_registro)}</b>
                </div>
              ))
            ) : (
              <div className="recent-row">
                <span className="mini-avatar blue">—</span>
                <p>No hay alumnos recientes</p>
                <b>—</b>
              </div>
            )}

            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setBusqueda("");
                setPaginaActual(1);
              }}
            >
              Ver todos los alumnos
              <span>→</span>
            </button>
          </article>

          <article className="admin-small-card alerts-card">
            <h2>
              <FiAlertTriangle />
              Alertas
            </h2>

            <div className="alert-line alert-red">
              <span></span>
              <p>
                {resumen.rezago} alumnos presentan rezago o bajo rendimiento.
              </p>
              <button type="button">Ver detalles</button>
            </div>

            <div className="alert-line alert-orange">
              <span></span>
              <p>
                {resumen.asistencia_baja} alumnos tienen asistencia menor al
                70%.
              </p>
              <button type="button">Ver detalles</button>
            </div>

            <div className="alert-line alert-blue">
              <span></span>
              <p>{resumen.total} alumnos registrados como estudiantes.</p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setPaginaActual(1);
                }}
              >
                Ver alumnos
              </button>
            </div>

            <button type="button" className="link-btn">
              Ver todas las alertas
              <span>→</span>
            </button>
          </article>
        </section>

        <footer className="admin-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="admin-footer-icons">
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
          className="admin-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModalDetalle();
            }
          }}
        >
          <section
            className="admin-modal admin-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-detail-modal-title"
          >
            <div className="admin-modal-decoration admin-modal-circle-one"></div>
            <div className="admin-modal-decoration admin-modal-circle-two"></div>

            <button
              type="button"
              className="admin-modal-close"
              onClick={cerrarModalDetalle}
              aria-label="Cerrar detalle del alumno"
            >
              <FiX />
            </button>

            <header className="admin-detail-header">
              <span
                className="admin-detail-avatar"
                style={estiloAvatar(alumnoDetalle)}
                aria-hidden="true"
              >
                {obtenerIniciales(alumnoDetalle)}
              </span>

              <div className="admin-detail-title">
                <span className="admin-modal-badge">Ficha del estudiante</span>
                <h2 id="admin-detail-modal-title">{alumnoDetalle.nombre}</h2>
                <p>
                  ¿Quieres editar a este estudiante? Revisa su información y
                  selecciona “Editar alumno”.
                </p>
              </div>

              <span
                className={`status-pill ${
                  alumnoDetalle.estado === "Activo" ? "activo" : "rezago"
                }`}
              >
                {alumnoDetalle.estado}
              </span>
            </header>

            <div className="admin-detail-grid">
              <article className="admin-detail-item">
                <span className="admin-detail-item-icon">
                  <FiMail />
                </span>
                <div>
                  <small>Correo electrónico</small>
                  <strong>{alumnoDetalle.correo || "Sin correo"}</strong>
                </div>
              </article>

              <article className="admin-detail-item">
                <span className="admin-detail-item-icon">
                  <FiUser />
                </span>
                <div>
                  <small>Nombre de usuario</small>
                  <strong>{alumnoDetalle.usuario || "Sin usuario"}</strong>
                </div>
              </article>

              <article className="admin-detail-item">
                <span className="admin-detail-item-icon">
                  <FiUsers />
                </span>
                <div>
                  <small>Grupo asignado</small>
                  <strong>{alumnoDetalle.grupo || "Sin grupo"}</strong>
                </div>
              </article>

              <article className="admin-detail-item">
                <span className="admin-detail-item-icon">
                  <FiGrid />
                </span>
                <div>
                  <small>Módulo actual</small>
                  <strong>{alumnoDetalle.modulo || "Sin módulo"}</strong>
                </div>
              </article>
            </div>

            <div className="admin-detail-performance">
              <div className="admin-detail-metric">
                <span>Asistencia</span>
                <strong>
                  {alumnoDetalle.asistencia !== null
                    ? `${alumnoDetalle.asistencia}%`
                    : "—"}
                </strong>
                <div className="admin-detail-progress">
                  <i
                    style={{
                      width: `${Math.min(
                        Math.max(alumnoDetalle.asistencia || 0, 0),
                        100,
                      )}%`,
                    }}
                  ></i>
                </div>
              </div>

              <div className="admin-detail-metric">
                <span>Promedio</span>
                <strong
                  className={
                    alumnoDetalle.promedio !== null &&
                    alumnoDetalle.promedio < 7
                      ? "metric-low"
                      : "metric-good"
                  }
                >
                  {alumnoDetalle.promedio !== null
                    ? alumnoDetalle.promedio
                    : "—"}
                </strong>
                <small>Calificación actual</small>
              </div>

              <div className="admin-detail-metric">
                <span>Fecha de registro</span>
                <strong className="metric-date">
                  {formatearFecha(alumnoDetalle.fecha_registro)}
                </strong>
                <small>Alta en MathNova</small>
              </div>
            </div>

            <div className="admin-detail-actions">
              <button
                type="button"
                className="admin-modal-btn secondary"
                onClick={cerrarModalDetalle}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="admin-modal-btn primary admin-detail-edit-btn"
                onClick={() => {
                  const alumnoSeleccionado = alumnoDetalle;
                  cerrarModalDetalle();
                  abrirModalEditar(alumnoSeleccionado);
                }}
              >
                <FiEdit2 />
                Editar alumno
              </button>
            </div>
          </section>
        </div>
      )}

      {modalAgregarOpen && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModalAgregar();
            }
          }}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <div className="admin-modal-decoration admin-modal-circle-one"></div>
            <div className="admin-modal-decoration admin-modal-circle-two"></div>

            <button
              type="button"
              className="admin-modal-close"
              onClick={cerrarModalAgregar}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <header className="admin-modal-header">
              <div className="admin-modal-icon">
                <FiUserPlus />
              </div>

              <div>
                <span className="admin-modal-badge">Nuevo estudiante</span>
                <h2 id="admin-modal-title">Agregar alumno</h2>
                <p>
                  Completa los datos del nuevo alumno para registrarlo en
                  MathNova.
                </p>
              </div>
            </header>

            <form className="admin-modal-form" onSubmit={crearAlumno}>
              <label className="admin-modal-field">
                <span>Nombre completo</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    placeholder="Ej. María Fernanda López"
                    autoComplete="name"
                    value={formAgregar.nombre_completo}
                    onChange={(event) =>
                      setFormAgregar((actual) => ({
                        ...actual,
                        nombre_completo: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Correo</span>
                <div className="admin-modal-input">
                  <FiMail />
                  <input
                    type="email"
                    placeholder="Ej. maria@correo.com"
                    autoComplete="email"
                    value={formAgregar.correo}
                    onChange={(event) =>
                      setFormAgregar((actual) => ({
                        ...actual,
                        correo: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Usuario</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    placeholder="Ej. maria.lopez"
                    autoComplete="username"
                    value={formAgregar.usuario}
                    onChange={(event) =>
                      setFormAgregar((actual) => ({
                        ...actual,
                        usuario: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Contraseña</span>
                <div className="admin-modal-input">
                  <FiLock />
                  <input
                    type="password"
                    placeholder="Escribe una contraseña"
                    autoComplete="new-password"
                    value={formAgregar.password}
                    onChange={(event) =>
                      setFormAgregar((actual) => ({
                        ...actual,
                        password: event.target.value,
                      }))
                    }
                    minLength={6}
                    required
                  />
                </div>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn secondary"
                  onClick={cerrarModalAgregar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-modal-btn primary"
                  disabled={guardando}
                >
                  <FiUserPlus />
                  {guardando ? "Guardando..." : "Agregar alumno"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {alumnoEditar && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModalEditar();
            }
          }}
        >
          <section
            className="admin-modal admin-modal-edit admin-edit-detail-style"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-edit-modal-title"
          >
            <div className="admin-modal-decoration admin-modal-circle-one"></div>
            <div className="admin-modal-decoration admin-modal-circle-two"></div>

            <button
              type="button"
              className="admin-modal-close"
              onClick={cerrarModalEditar}
              aria-label="Cerrar modal de edición"
            >
              <FiX />
            </button>

            <header className="admin-edit-detail-header">
              <span
                className="admin-edit-detail-avatar"
                style={estiloAvatar(alumnoEditar)}
                aria-hidden="true"
              >
                {obtenerIniciales(alumnoEditar)}
              </span>

              <div className="admin-edit-detail-title">
                <span className="admin-modal-badge admin-modal-edit-badge">
                  Editando estudiante
                </span>
                <h2 id="admin-edit-modal-title">Editar alumno</h2>
                <p className="admin-edit-description">
                  Actualiza la información de{" "}
                  <strong
                    className="admin-edit-highlight-name"
                    style={
                      {
                        "--student-color": obtenerColorAvatar(alumnoEditar),
                      } as CSSProperties
                    }
                  >
                    {alumnoEditar.nombre}
                  </strong>{" "}
                  y guarda los cambios cuando termines.
                </p>
              </div>

              <span
                className={`status-pill ${
                  alumnoEditar.estado === "Activo" ? "activo" : "rezago"
                }`}
              >
                {alumnoEditar.estado}
              </span>
            </header>

            <div className="admin-edit-summary">
              <div className="admin-edit-summary-item">
                <span className="admin-edit-summary-icon">
                  <FiMail />
                </span>
                <div>
                  <small>Correo actual</small>
                  <strong>{alumnoEditar.correo || "Sin correo"}</strong>
                </div>
              </div>

              <div className="admin-edit-summary-item">
                <span className="admin-edit-summary-icon">
                  <FiUser />
                </span>
                <div>
                  <small>Usuario actual</small>
                  <strong>{alumnoEditar.usuario || "Sin usuario"}</strong>
                </div>
              </div>
            </div>

            <form
              className="admin-modal-form admin-edit-table-form"
              onSubmit={actualizarAlumno}
            >
              <label className="admin-modal-field admin-edit-full-field">
                <span>Nombre completo</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    value={formEditar.nombre_completo}
                    onChange={(event) =>
                      setFormEditar((actual) => ({
                        ...actual,
                        nombre_completo: event.target.value,
                      }))
                    }
                    placeholder="Nombre completo del alumno"
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Correo</span>
                <div className="admin-modal-input">
                  <FiMail />
                  <input
                    type="email"
                    value={formEditar.correo}
                    onChange={(event) =>
                      setFormEditar((actual) => ({
                        ...actual,
                        correo: event.target.value,
                      }))
                    }
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Usuario</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    value={formEditar.usuario}
                    onChange={(event) =>
                      setFormEditar((actual) => ({
                        ...actual,
                        usuario: event.target.value,
                      }))
                    }
                    placeholder="usuario"
                    required
                  />
                </div>
              </label>

              <label className="admin-modal-field admin-edit-full-field">
                <span>Nueva contraseña (opcional)</span>
                <div className="admin-modal-input">
                  <FiLock />
                  <input
                    type="password"
                    value={formEditar.password}
                    onChange={(event) =>
                      setFormEditar((actual) => ({
                        ...actual,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Deja vacío si no quieres cambiarla"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn secondary"
                  onClick={cerrarModalEditar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-modal-btn primary admin-modal-save-btn"
                  disabled={guardando}
                >
                  <FiCheckCircle />
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {alumnoEliminar && (
        <div
          className="admin-feedback-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardando)
              cancelarEliminarAlumno();
          }}
        >
          <section
            className="admin-feedback-modal admin-delete-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            aria-describedby="admin-delete-description"
          >
            <div className="admin-feedback-decoration feedback-decoration-one"></div>
            <div className="admin-feedback-decoration feedback-decoration-two"></div>
            <button
              type="button"
              className="admin-feedback-close"
              onClick={cancelarEliminarAlumno}
              aria-label="Cancelar eliminación"
              disabled={guardando}
            >
              <FiX />
            </button>
            <div className="admin-feedback-icon danger">
              <FiTrash2 />
            </div>
            <span className="admin-feedback-badge danger">
              Confirmar acción
            </span>
            <h2 id="admin-delete-title">¿Eliminar estudiante?</h2>
            <p id="admin-delete-description">
              Estás a punto de desactivar la cuenta de:
            </p>
            <div className="admin-feedback-student">
              <span
                className="admin-feedback-avatar"
                style={estiloAvatar(alumnoEliminar)}
                aria-hidden="true"
              >
                {obtenerIniciales(alumnoEliminar)}
              </span>
              <div>
                <strong>{alumnoEliminar.nombre}</strong>
                <small>
                  {alumnoEliminar.correo || "Sin correo registrado"}
                </small>
              </div>
            </div>
            <div className="admin-feedback-warning">
              <FiAlertTriangle />
              <p>
                Esta acción desactivará su cuenta. Confirma solamente si estás
                seguro de continuar.
              </p>
            </div>
            <div className="admin-feedback-actions">
              <button
                type="button"
                className="admin-feedback-btn secondary"
                onClick={cancelarEliminarAlumno}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-feedback-btn danger"
                onClick={() => void eliminarAlumno()}
                disabled={guardando}
              >
                <FiTrash2 />
                {guardando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}

      {alertaVisual && (
        <div
          className="admin-feedback-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAlertaVisual(null);
          }}
        >
          <section
            className={`admin-feedback-modal admin-result-modal ${alertaVisual.tipo}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-result-title"
            aria-describedby="admin-result-description"
          >
            <div className="admin-feedback-decoration feedback-decoration-one"></div>
            <div className="admin-feedback-decoration feedback-decoration-two"></div>
            <button
              type="button"
              className="admin-feedback-close"
              onClick={() => setAlertaVisual(null)}
              aria-label="Cerrar mensaje"
            >
              <FiX />
            </button>
            <div
              className={`admin-feedback-icon ${alertaVisual.tipo === "success" ? "success" : "error"}`}
            >
              {alertaVisual.tipo === "success" ? (
                <FiCheckCircle />
              ) : (
                <FiAlertTriangle />
              )}
            </div>
            <span
              className={`admin-feedback-badge ${alertaVisual.tipo === "success" ? "success" : "danger"}`}
            >
              {alertaVisual.tipo === "success"
                ? "Operación completada"
                : "Ocurrió un problema"}
            </span>
            <h2 id="admin-result-title">{alertaVisual.titulo}</h2>
            {alertaVisual.nombre && (
              <div className="admin-result-name">
                <FiUser />
                <strong>{alertaVisual.nombre}</strong>
              </div>
            )}
            <p id="admin-result-description">{alertaVisual.mensaje}</p>
            <button
              type="button"
              className={`admin-feedback-btn ${alertaVisual.tipo === "success" ? "success" : "primary"} full`}
              onClick={() => setAlertaVisual(null)}
            >
              <FiCheckCircle />
              Entendido
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdministrarAlumnosDocente;
