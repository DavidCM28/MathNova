import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaAlumnosDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";

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
  FiDownload,
  FiMoreVertical,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type Alumno = {
  id_alumno: number;
  iniciales: string;
  nombre: string;
  correo?: string;
  usuario?: string | null;
  grupo: string;
  modulo: string;
  asistencia: number | null;
  promedio: number | null;
  estado: "Activo" | "Rezago";
  color: string;
  barra?: string;
  fecha_registro?: string;
};

type Grupo = {
  id_grupo: number;
  nombre_grupo: string;
  total_alumnos?: number;
};

type DocenteAlumnosResponse = {
  ok: boolean;
  alumnos: Alumno[];
  mensaje?: string;
};

type GruposResponse = {
  ok: boolean;
  grupos: Grupo[];
  mensaje?: string;
};

type EstadoLista =
  | "Todos"
  | "Excelente"
  | "Bueno"
  | "Regular"
  | "En riesgo"
  | "Sin datos";

const API_DOCENTE_ALUMNOS = "http://localhost:3001/api/docente/alumnos";
const API_GRUPOS = "http://localhost:3001/api/grupos";

function obtenerToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token")
  );
}

async function leerRespuesta(response: Response) {
  const texto = await response.text();

  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error(
      "El backend no devolvió JSON. Revisa que la ruta exista y que el servidor esté encendido.",
    );
  }
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerColorAvatar(color: string, idAlumno: number) {
  const colores: Record<string, string> = {
    blue: "#0058ff",
    azul: "#0058ff",
    purple: "#7c3aed",
    morado: "#7c3aed",
    dark: "#334155",
    green: "#00a86b",
    verde: "#00a86b",
    orange: "#f59e0b",
    naranja: "#f59e0b",
    red: "#ef4444",
    rojo: "#ef4444",
    turquesa: "#14b8a6",
  };

  if (color && colores[color]) {
    return colores[color];
  }

  const respaldo = [
    "#0058ff",
    "#7c3aed",
    "#334155",
    "#00a86b",
    "#f59e0b",
    "#14b8a6",
  ];
  return respaldo[Math.abs(Number(idAlumno) || 0) % respaldo.length];
}

function obtenerEstadoLista(alumno: Alumno): Exclude<EstadoLista, "Todos"> {
  const sinPromedio = alumno.promedio === null || alumno.promedio === undefined;
  const sinAsistencia =
    alumno.asistencia === null || alumno.asistencia === undefined;

  if (sinPromedio && sinAsistencia) {
    return "Sin datos";
  }

  const promedio = alumno.promedio ?? 10;
  const asistencia = alumno.asistencia ?? 100;

  if (promedio < 6.5 || asistencia < 65) {
    return "En riesgo";
  }

  if (promedio < 7.5 || asistencia < 80) {
    return "Regular";
  }

  if (promedio >= 9 && asistencia >= 90) {
    return "Excelente";
  }

  return "Bueno";
}

function obtenerClaseEstado(estado: EstadoLista) {
  return estado.toLowerCase().replace(" ", "-");
}

function obtenerClasePunto(asistencia: number | null) {
  if (asistencia === null) return "gray";
  if (asistencia < 65) return "red";
  if (asistencia < 80) return "orange";
  return "green";
}

function descargarCsv(alumnos: Alumno[]) {
  const encabezados = [
    "Nombre",
    "Correo",
    "Usuario",
    "Grupo",
    "Modulo actual",
    "Asistencia",
    "Promedio",
    "Estado",
  ];

  const filas = alumnos.map((alumno) => [
    alumno.nombre,
    alumno.correo || "",
    alumno.usuario || "",
    alumno.grupo,
    alumno.modulo,
    alumno.asistencia !== null ? `${alumno.asistencia}%` : "",
    alumno.promedio !== null ? String(alumno.promedio) : "",
    obtenerEstadoLista(alumno),
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
  link.download = "lista-alumnos-mathnova.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function ListaAlumnosDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoLista>("Todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [notificacion, setNotificacion] = useState("");
  const ALUMNOS_POR_PAGINA = 10;

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu] = useState("lista");

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
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const token = obtenerToken();

        if (!token) {
          throw new Error("Debes iniciar sesión para ver la lista de alumnos.");
        }

        const [alumnosResponse, gruposResponse] = await Promise.all([
          fetch(API_DOCENTE_ALUMNOS, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(API_GRUPOS, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const alumnosData = (await leerRespuesta(
          alumnosResponse,
        )) as DocenteAlumnosResponse;
        const gruposData = (await leerRespuesta(
          gruposResponse,
        )) as GruposResponse;

        if (!alumnosResponse.ok) {
          throw new Error(
            alumnosData?.mensaje || "No se pudieron cargar los alumnos.",
          );
        }

        if (!gruposResponse.ok) {
          throw new Error(
            gruposData?.mensaje || "No se pudieron cargar los grupos.",
          );
        }

        setAlumnos(alumnosData.alumnos || []);
        setGrupos(gruposData.grupos || []);
      } catch (error) {
        setAlumnos([]);
        setGrupos([]);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos.",
        );
      } finally {
        setCargando(false);
      }
    };

    void cargarDatos();
  }, []);

  const alumnosFiltrados = useMemo(() => {
    const textoBusqueda = normalizarTexto(busqueda.trim());

    return alumnos.filter((alumno) => {
      const gruposAlumno = alumno.grupo
        .split(",")
        .map((grupo) => grupo.trim())
        .filter(Boolean);

      const coincideGrupo =
        grupoSeleccionado === "todos" ||
        gruposAlumno.includes(grupoSeleccionado);

      const estadoAlumno = obtenerEstadoLista(alumno);

      const coincideEstado =
        filtroEstado === "Todos" || estadoAlumno === filtroEstado;

      const textoAlumno = normalizarTexto(
        `${alumno.nombre} ${alumno.correo || ""} ${alumno.usuario || ""} ${alumno.grupo}`,
      );

      const coincideBusqueda =
        textoBusqueda === "" || textoAlumno.includes(textoBusqueda);

      return coincideGrupo && coincideEstado && coincideBusqueda;
    });
  }, [alumnos, grupoSeleccionado, filtroEstado, busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [grupoSeleccionado, filtroEstado, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / ALUMNOS_POR_PAGINA),
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const alumnosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ALUMNOS_POR_PAGINA;
    return alumnosFiltrados.slice(inicio, inicio + ALUMNOS_POR_PAGINA);
  }, [alumnosFiltrados, paginaActual]);

  const paginasVisibles = useMemo(() => {
    const paginas: number[] = [];
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, inicio + 4);
    const inicioAjustado = Math.max(1, fin - 4);

    for (let pagina = inicioAjustado; pagina <= fin; pagina += 1) {
      paginas.push(pagina);
    }

    return paginas;
  }, [paginaActual, totalPaginas]);

  const resumen = useMemo(() => {
    const total = alumnosFiltrados.length;

    const conPromedio = alumnosFiltrados.filter(
      (alumno) => alumno.promedio !== null && alumno.promedio !== undefined,
    );

    const conAsistencia = alumnosFiltrados.filter(
      (alumno) => alumno.asistencia !== null && alumno.asistencia !== undefined,
    );

    const promedioGeneral =
      conPromedio.length > 0
        ? Number(
            (
              conPromedio.reduce(
                (suma, alumno) => suma + Number(alumno.promedio),
                0,
              ) / conPromedio.length
            ).toFixed(1),
          )
        : null;

    const asistenciaPromedio =
      conAsistencia.length > 0
        ? Math.round(
            conAsistencia.reduce(
              (suma, alumno) => suma + Number(alumno.asistencia),
              0,
            ) / conAsistencia.length,
          )
        : null;

    const alumnosEnRiesgo = alumnosFiltrados.filter(
      (alumno) => obtenerEstadoLista(alumno) === "En riesgo",
    ).length;

    return {
      total,
      promedioGeneral,
      asistenciaPromedio,
      alumnosEnRiesgo,
    };
  }, [alumnosFiltrados]);

  const alumnosGrafica = alumnosFiltrados
    .filter((alumno) => alumno.asistencia !== null)
    .slice(0, 5);

  const manejarExportacion = () => {
    if (alumnosFiltrados.length === 0) {
      setNotificacion("No hay alumnos para exportar.");
      window.setTimeout(() => setNotificacion(""), 3200);
      return;
    }

    descargarCsv(alumnosFiltrados);
    setNotificacion("Archivo descargado correctamente.");

    window.setTimeout(() => {
      setNotificacion("");
    }, 3200);
  };

  const cambiarPagina = (pagina: number) => {
    const nuevaPagina = Math.min(Math.max(pagina, 1), totalPaginas);
    setPaginaActual(nuevaPagina);

    window.requestAnimationFrame(() => {
      document
        .querySelector(".lista-table-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  return (
    <main className="docente-page lista-page">
      {notificacion && (
        <div
          className={`lista-toast ${
            notificacion.includes("correctamente") ? "success" : "warning"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="lista-toast-icon">
            <FiCheckCircle />
          </span>
          <div>
            <strong>
              {notificacion.includes("correctamente")
                ? "Descarga completada"
                : "Aviso"}
            </strong>
            <p>{notificacion}</p>
          </div>
        </div>
      )}

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
              onClick={() => irARuta("/dashboard-docente")}
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
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
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
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
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
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/avance-actividad-docente")}
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
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

      <section className="lista-content">
        <header className="lista-header">
          <div className="lista-header-text">
            <h1>Lista de alumnos</h1>
            <p>
              Consulta la lista completa del grupo y la información académica de
              tus alumnos.
            </p>
          </div>
        </header>

        <section className="lista-toolbar">
          <div className="lista-field grupo-field">
            <label>Grupo</label>
            <select
              value={grupoSeleccionado}
              onChange={(event) => setGrupoSeleccionado(event.target.value)}
            >
              <option value="todos">Todos los grupos</option>

              {grupos.map((grupo) => (
                <option key={grupo.id_grupo} value={grupo.nombre_grupo}>
                  {grupo.nombre_grupo}
                </option>
              ))}
            </select>
          </div>

          <div className="lista-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar alumno por nombre..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          <div className="lista-field filtro-field">
            <label>Filtrar por</label>
            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value as EstadoLista)
              }
            >
              <option value="Todos">Todos</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="En riesgo">En riesgo</option>
              <option value="Sin datos">Sin datos</option>
            </select>
          </div>

          <button
            type="button"
            className="lista-outline-btn"
            onClick={manejarExportacion}
          >
            <FiDownload />
            Exportar
          </button>
        </section>

        {error && <section className="lista-message">{error}</section>}

        <section className="lista-layout">
          <article className="lista-table-card">
            <div className="lista-table-scroll">
              <div className="lista-table">
                <div className="lista-table-row lista-table-head">
                  <span>No.</span>
                  <span>Nombre</span>
                  <span>Grupo</span>
                  <span>Edad</span>
                  <span>Módulo actual</span>
                  <span>Asistencia</span>
                  <span>Promedio</span>
                  <span>Estado</span>
                  <span></span>
                </div>

                {cargando ? (
                  <div className="lista-table-row">
                    <span>—</span>
                    <span>Cargando alumnos...</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span></span>
                  </div>
                ) : alumnosFiltrados.length > 0 ? (
                  alumnosPaginados.map((alumno, index) => {
                    const estadoLista = obtenerEstadoLista(alumno);

                    return (
                      <div className="lista-table-row" key={alumno.id_alumno}>
                        <span>
                          {(paginaActual - 1) * ALUMNOS_POR_PAGINA + index + 1}
                        </span>

                        <span className="lista-student">
                          <span
                            className="lista-avatar"
                            style={{
                              background: obtenerColorAvatar(
                                alumno.color,
                                alumno.id_alumno,
                              ),
                            }}
                          >
                            {alumno.iniciales}
                          </span>
                          {alumno.nombre}
                        </span>

                        <span>{alumno.grupo || "Sin grupo"}</span>
                        <span>—</span>
                        <span>{alumno.modulo || "Sin módulo"}</span>

                        <span className="lista-assistance">
                          <span
                            className={`lista-dot ${obtenerClasePunto(
                              alumno.asistencia,
                            )}`}
                          ></span>
                          {alumno.asistencia !== null
                            ? `${alumno.asistencia}%`
                            : "—"}
                        </span>

                        <span>
                          {alumno.promedio !== null ? alumno.promedio : "—"}
                        </span>

                        <span>
                          <span
                            className={`lista-status ${obtenerClaseEstado(
                              estadoLista,
                            )}`}
                          >
                            {estadoLista}
                          </span>
                        </span>

                        <button
                          type="button"
                          className="lista-more-btn"
                          aria-label="Más opciones"
                          onClick={() =>
                            window.alert(
                              `Alumno: ${alumno.nombre}\nCorreo: ${
                                alumno.correo || "Sin correo"
                              }\nUsuario: ${
                                alumno.usuario || "Sin usuario"
                              }\nGrupo: ${alumno.grupo || "Sin grupo"}`,
                            )
                          }
                        >
                          <FiMoreVertical />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="lista-table-row">
                    <span>—</span>
                    <span>No se encontraron alumnos.</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span></span>
                  </div>
                )}
              </div>
            </div>

            {!cargando && alumnosFiltrados.length > 0 && (
              <div className="lista-pagination">
                <p>
                  Mostrando{" "}
                  <strong>{(paginaActual - 1) * ALUMNOS_POR_PAGINA + 1}</strong>{" "}
                  a{" "}
                  <strong>
                    {Math.min(
                      paginaActual * ALUMNOS_POR_PAGINA,
                      alumnosFiltrados.length,
                    )}
                  </strong>{" "}
                  de <strong>{alumnosFiltrados.length}</strong> alumnos
                </p>

                <div className="lista-pagination-controls">
                  <button
                    type="button"
                    className="lista-pagination-arrow"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    aria-label="Página anterior"
                  >
                    <FiChevronLeft />
                  </button>

                  {paginasVisibles.map((pagina) => (
                    <button
                      type="button"
                      key={pagina}
                      className={`lista-page-number ${
                        paginaActual === pagina ? "active" : ""
                      }`}
                      onClick={() => cambiarPagina(pagina)}
                      aria-current={
                        paginaActual === pagina ? "page" : undefined
                      }
                    >
                      {pagina}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="lista-pagination-arrow"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </article>

          <aside className="lista-side">
            <article className="lista-side-card resumen-card">
              <div className="side-title-row">
                <h2>Resumen del grupo</h2>
                <FiUser />
              </div>

              <div className="resumen-grid">
                <div>
                  <p>Total de alumnos</p>
                  <strong className="blue-number">{resumen.total}</strong>
                </div>

                <div>
                  <p>Promedio general</p>
                  <strong className="green-number">
                    {resumen.promedioGeneral !== null
                      ? resumen.promedioGeneral
                      : "—"}
                  </strong>
                </div>

                <div>
                  <p>Alumnos en riesgo</p>
                  <strong className="red-number">
                    {resumen.alumnosEnRiesgo}
                  </strong>
                </div>

                <div>
                  <p>Asistencia promedio</p>
                  <strong className="blue-number">
                    {resumen.asistenciaPromedio !== null
                      ? `${resumen.asistenciaPromedio}%`
                      : "—"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="lista-side-card asistencia-card">
              <div className="side-title-row">
                <h2>Asistencia del grupo</h2>
                <FiCalendar />
              </div>

              {alumnosGrafica.length > 0 ? (
                <div className="lista-chart">
                  <div className="lista-chart-labels">
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>

                  <div className="lista-chart-bars">
                    {alumnosGrafica.map((alumno, index) => {
                      const coloresBarra = [
                        "lista-blue-bar",
                        "lista-green-bar",
                        "lista-yellow-bar",
                        "lista-purple-bar",
                        "lista-red-bar",
                      ];

                      return (
                        <div
                          className="lista-chart-item"
                          key={alumno.id_alumno}
                        >
                          <strong>{alumno.asistencia}%</strong>
                          <span
                            className={`lista-bar ${coloresBarra[index]}`}
                            style={{
                              height: `${Math.max(
                                10,
                                Number(alumno.asistencia),
                              )}%`,
                            }}
                          ></span>
                          <small>{alumno.iniciales}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="lista-empty-chart">
                  Aún no hay datos reales de asistencia para mostrar.
                </p>
              )}
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button type="button" onClick={() => irARuta("/login")}>
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

export default ListaAlumnosDocente;
