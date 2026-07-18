import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AvanceActividadDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import bannerActividad from "../../assets/banner_actividades_docente_alumnos.png";

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
  FiBell,
  FiClock,
  FiRefreshCw,
  FiCheck,
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

type AlumnoSeguimiento = {
  id: number;
  iniciales: string;
  nombre: string;
  estado: EstadoActividad;
  progreso: number;
  descripcionProgreso: string;
  intentos: number;
  ultimaActividad: string;
  color: string;
};

const ALUMNOS_POR_PAGINA = 7;

const alumnosDemo: AlumnoSeguimiento[] = [
  {
    id: 1,
    iniciales: "MF",
    nombre: "Mariana Fuentes Ruiz",
    estado: "No iniciada",
    progreso: 0,
    descripcionProgreso: "0%",
    intentos: 0,
    ultimaActividad: "—",
    color: "#1264e8",
  },
  {
    id: 2,
    iniciales: "SJ",
    nombre: "Santiago Jiménez López",
    estado: "En progreso",
    progreso: 60,
    descripcionProgreso: "Pregunta 3 de 5",
    intentos: 2,
    ultimaActividad: "Hoy, 10:24 a.m.",
    color: "#7c3aed",
  },
  {
    id: 3,
    iniciales: "AG",
    nombre: "Ana Sofía García Niño",
    estado: "Completada",
    progreso: 100,
    descripcionProgreso: "5 de 5",
    intentos: 1,
    ultimaActividad: "Ayer, 04:15 p.m.",
    color: "#f59e0b",
  },
  {
    id: 4,
    iniciales: "DH",
    nombre: "Diego Hernández Torres",
    estado: "En progreso",
    progreso: 40,
    descripcionProgreso: "Pregunta 2 de 5",
    intentos: 3,
    ultimaActividad: "Hoy, 09:12 a.m.",
    color: "#4f46e5",
  },
  {
    id: 5,
    iniciales: "LM",
    nombre: "Lucía Medina Chávez",
    estado: "Completada",
    progreso: 100,
    descripcionProgreso: "5 de 5",
    intentos: 1,
    ultimaActividad: "Ayer, 08:45 p.m.",
    color: "#0f9f9b",
  },
  {
    id: 6,
    iniciales: "JV",
    nombre: "José Valdez Roa",
    estado: "Requiere apoyo",
    progreso: 20,
    descripcionProgreso: "Pregunta 1 de 5",
    intentos: 4,
    ultimaActividad: "Hoy, 07:30 a.m.",
    color: "#0f9f9b",
  },
  {
    id: 7,
    iniciales: "VP",
    nombre: "Valeria Sánchez Morales",
    estado: "No iniciada",
    progreso: 0,
    descripcionProgreso: "0%",
    intentos: 0,
    ultimaActividad: "—",
    color: "#1264e8",
  },
  {
    id: 8,
    iniciales: "CR",
    nombre: "Camila Rodríguez Pérez",
    estado: "Completada",
    progreso: 100,
    descripcionProgreso: "5 de 5",
    intentos: 2,
    ultimaActividad: "Ayer, 05:40 p.m.",
    color: "#ec4899",
  },
  {
    id: 9,
    iniciales: "OL",
    nombre: "Óscar López Medina",
    estado: "En progreso",
    progreso: 80,
    descripcionProgreso: "Pregunta 4 de 5",
    intentos: 2,
    ultimaActividad: "Hoy, 11:10 a.m.",
    color: "#f97316",
  },
];

function AvanceActividadDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });
  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [grupo, setGrupo] = useState("2°A - Matemáticas");
  const [modulo, setModulo] = useState("Fracciones");
  const [actividad, setActividad] = useState(
    "Identificar fracciones equivalentes",
  );
  const [estado, setEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const [selectedMenu, setSelectedMenu] = useState<string>("avance-actividad");
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

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const alumnosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alumnosDemo.filter((alumno) => {
      const coincideBusqueda =
        texto === "" || alumno.nombre.toLowerCase().includes(texto);
      const coincideEstado = estado === "Todos" || alumno.estado === estado;
      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, estado]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / ALUMNOS_POR_PAGINA),
  );

  const alumnosPaginados = alumnosFiltrados.slice(
    (paginaActual - 1) * ALUMNOS_POR_PAGINA,
    paginaActual * ALUMNOS_POR_PAGINA,
  );

  const resumen = useMemo(() => {
    const total = alumnosDemo.length;
    const noIniciada = alumnosDemo.filter(
      (alumno) => alumno.estado === "No iniciada",
    ).length;
    const enProgreso = alumnosDemo.filter(
      (alumno) => alumno.estado === "En progreso",
    ).length;
    const completada = alumnosDemo.filter(
      (alumno) => alumno.estado === "Completada",
    ).length;
    const requiereApoyo = alumnosDemo.filter(
      (alumno) => alumno.estado === "Requiere apoyo",
    ).length;

    const progresoPromedio = Math.round(
      alumnosDemo.reduce((suma, alumno) => suma + alumno.progreso, 0) / total,
    );

    return {
      total,
      noIniciada,
      enProgreso,
      completada,
      requiereApoyo,
      progresoPromedio,
    };
  }, []);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    window.setTimeout(() => setMensaje(""), 2800);
  };

  const descargarReporte = () => {
    const encabezados = [
      "Alumno",
      "Estado",
      "Progreso",
      "Intentos",
      "Última actividad",
    ];

    const filas = alumnosFiltrados.map((alumno) => [
      alumno.nombre,
      alumno.estado,
      `${alumno.progreso}%`,
      alumno.intentos,
      alumno.ultimaActividad,
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
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "avance-actividad-mathnova.csv";
    enlace.click();
    URL.revokeObjectURL(url);

    mostrarMensaje("El reporte se descargó correctamente.");
  };

  const claseEstado = (valor: EstadoActividad) =>
    valor.toLowerCase().replaceAll(" ", "-");

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
              Visualiza el progreso de tus alumnos en una actividad específica.
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
              <option>2°A - Matemáticas</option>
              <option>3°A - Matemáticas</option>
              <option>4°A - Matemáticas</option>
            </select>
          </label>

          <label>
            <span>Módulo</span>
            <select value={modulo} onChange={(e) => setModulo(e.target.value)}>
              <option>Fracciones</option>
              <option>Ángulos</option>
              <option>Geometría</option>
            </select>
          </label>

          <label className="avance-actividad-select">
            <span>Actividad</span>
            <select
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
            >
              <option>Identificar fracciones equivalentes</option>
              <option>Comparar fracciones</option>
              <option>Resolver problemas con fracciones</option>
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
            <span className="sr-only">Estado</span>
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
            aria-label="Aplicar filtros"
            onClick={() => mostrarMensaje("Filtros aplicados.")}
          >
            <FiFilter />
          </button>

          <div className="avance-filter-actions">
            <button
              type="button"
              className="avance-secondary-button"
              onClick={descargarReporte}
            >
              <FiDownload />
              Exportar reporte
            </button>

            <button
              type="button"
              className="avance-primary-button"
              onClick={() => mostrarMensaje("Recordatorio preparado.")}
            >
              <FiBell />
              Enviar recordatorio
            </button>
          </div>
        </section>

        <section className="avance-dashboard-grid">
          <div className="avance-main-column">
            <section className="avance-summary-grid">
              <article className="avance-summary-card total-card">
                <div>
                  <span>Total de alumnos</span>
                  <strong>{resumen.total}</strong>
                  <small>En la actividad</small>
                </div>
                <i>
                  <FiUsers />
                </i>
              </article>

              <article className="avance-summary-card not-started-card">
                <div>
                  <span>No iniciada</span>
                  <strong>{resumen.noIniciada}</strong>
                  <small>
                    {Math.round((resumen.noIniciada / resumen.total) * 100)}%
                    del total
                  </small>
                </div>
                <i>
                  <FiClock />
                </i>
              </article>

              <article className="avance-summary-card progress-card">
                <div>
                  <span>En progreso</span>
                  <strong>{resumen.enProgreso}</strong>
                  <small>
                    {Math.round((resumen.enProgreso / resumen.total) * 100)}%
                    del total
                  </small>
                </div>
                <i>
                  <FiRefreshCw />
                </i>
              </article>

              <article className="avance-summary-card completed-card">
                <div>
                  <span>Completada</span>
                  <strong>{resumen.completada}</strong>
                  <small>
                    {Math.round((resumen.completada / resumen.total) * 100)}%
                    del total
                  </small>
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

                  {alumnosPaginados.map((alumno) => (
                    <div className="avance-table-row" key={alumno.id}>
                      <span className="avance-student">
                        <i style={{ background: alumno.color }}>
                          {alumno.iniciales}
                        </i>
                        {alumno.nombre}
                      </span>

                      <span>
                        <b
                          className={`avance-status ${claseEstado(alumno.estado)}`}
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
                      <span>{alumno.ultimaActividad}</span>

                      <span>
                        <button
                          type="button"
                          className="avance-row-button"
                          onClick={() =>
                            mostrarMensaje(
                              alumno.estado === "No iniciada"
                                ? `Recordatorio preparado para ${alumno.nombre}.`
                                : `Abriendo detalle de ${alumno.nombre}.`,
                            )
                          }
                        >
                          {alumno.estado === "No iniciada" ? (
                            <>
                              <FiBell /> Recordar
                            </>
                          ) : (
                            <>
                              <FiEye /> Ver detalle
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="avance-pagination">
                <p>
                  Mostrando {(paginaActual - 1) * ALUMNOS_POR_PAGINA + 1} a{" "}
                  {Math.min(
                    paginaActual * ALUMNOS_POR_PAGINA,
                    alumnosFiltrados.length,
                  )}{" "}
                  de {alumnosFiltrados.length} alumnos
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
                    background: `conic-gradient(
                      #94a3b8 0 21%,
                      #f59e0b 21% 50%,
                      #22c55e 50% 93%,
                      #ef4444 93% 100%
                    )`,
                  }}
                >
                  <div>
                    <strong>{resumen.total}</strong>
                    <span>alumnos</span>
                  </div>
                </div>

                <ul>
                  <li>
                    <i className="gray" /> No iniciada{" "}
                    <b>{resumen.noIniciada}</b>
                  </li>
                  <li>
                    <i className="orange" /> En progreso{" "}
                    <b>{resumen.enProgreso}</b>
                  </li>
                  <li>
                    <i className="green" /> Completada{" "}
                    <b>{resumen.completada}</b>
                  </li>
                  <li>
                    <i className="red" /> Requiere apoyo{" "}
                    <b>{resumen.requiereApoyo}</b>
                  </li>
                </ul>
              </div>
            </article>

            <article className="avance-card avance-performance-card">
              <h2>Resumen del rendimiento</h2>

              <div className="avance-performance-grid">
                <div className="green-box">
                  <span>Progreso promedio</span>
                  <strong>{resumen.progresoPromedio}%</strong>
                  <FiBarChart2 />
                </div>
                <div className="orange-box">
                  <span>Tiempo promedio</span>
                  <strong>
                    32 <small>min</small>
                  </strong>
                  <FiClock />
                </div>
                <div className="purple-box">
                  <span>Calificación promedio</span>
                  <strong>
                    8.1<small>/10</small>
                  </strong>
                  <FiCheck />
                </div>
                <div className="blue-box">
                  <span>Pistas usadas</span>
                  <strong>18</strong>
                  <FiHelpCircle />
                </div>
              </div>
            </article>

            <article className="avance-card avance-attention-card">
              <h2>Alumnos que necesitan atención</h2>

              <div className="avance-attention-list">
                <div>
                  <i style={{ background: "#6d3fdc" }}>DH</i>
                  <span>Diego Hernández Torres</span>
                  <small>
                    <FiAlertTriangle /> Sin avanzar
                  </small>
                </div>
                <div>
                  <i style={{ background: "#0f9f9b" }}>JV</i>
                  <span>José Valdez Roa</span>
                  <small>
                    <FiAlertTriangle /> 4 intentos
                  </small>
                </div>
                <div>
                  <i style={{ background: "#1264e8" }}>VP</i>
                  <span>Valeria Sánchez Morales</span>
                  <small>
                    <FiAlertTriangle /> Muchos errores
                  </small>
                </div>
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
              onClick={() => irARuta("/login")}
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
