import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
  FiUsers as FiUsersIcon,
  FiUser,
  FiShuffle,
  FiBookOpen,
  FiBox,
  FiDatabase,
  FiHash,
  FiPlayCircle,
  FiStar,
  FiUserCheck,
  FiClock,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
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

type Mundo = "MathData" | "MathGeometry" | "MathNumbers";

type ModoAsignacion = "individual" | "equipos";
type EstrategiaEquipos = "seleccionar" | "aleatorio";

type Actividad = {
  id: number;
  titulo: string;
  mundo: Mundo;
  tema: string;
  descripcion: string;
  dificultad: "Básica" | "Media" | "Reto";
  duracion: string;
  habilitada: boolean;
  color: "blue" | "green" | "orange" | "purple";
  icono: ReactNode;
};

type AlumnoAsignacion = {
  id: number;
  iniciales: string;
  nombre: string;
  grupo: string;
  color: string;
};

const actividadesIniciales: Actividad[] = [
  {
    id: 1,
    titulo: "El Generador de Energía Inversa",
    mundo: "MathData",
    tema: "Proporcionalidad y funciones",
    descripcion:
      "Reconoce relaciones de proporcionalidad inversa usando tablas y gráficas.",
    dificultad: "Media",
    duracion: "20 min",
    habilitada: true,
    color: "blue",
    icono: <FiDatabase />,
  },
  {
    id: 2,
    titulo: "Gráficas de barras",
    mundo: "MathData",
    tema: "Estadística",
    descripcion:
      "Interpreta datos, compara cantidades y analiza resultados con gráficas.",
    dificultad: "Básica",
    duracion: "15 min",
    habilitada: true,
    color: "purple",
    icono: <FiBarChart2 />,
  },
  {
    id: 3,
    titulo: "La Ruta Perdida",
    mundo: "MathGeometry",
    tema: "Rectas y ángulos",
    descripcion:
      "Identifica segmentos faltantes para completar caminos dentro de un mapa.",
    dificultad: "Básica",
    duracion: "18 min",
    habilitada: true,
    color: "green",
    icono: <FiBox />,
  },
  {
    id: 4,
    titulo: "Detectores de Giro",
    mundo: "MathGeometry",
    tema: "Ángulos",
    descripcion:
      "Reconoce ángulos agudos, rectos y obtusos mediante giros visuales.",
    dificultad: "Media",
    duracion: "20 min",
    habilitada: false,
    color: "green",
    icono: <FiLayers />,
  },
  {
    id: 5,
    titulo: "Operaciones con fracciones",
    mundo: "MathNumbers",
    tema: "Números y operaciones",
    descripcion:
      "Resuelve operaciones con fracciones mediante una práctica guiada.",
    dificultad: "Media",
    duracion: "25 min",
    habilitada: true,
    color: "orange",
    icono: <FiHash />,
  },
  {
    id: 6,
    titulo: "Reto de cálculo mental",
    mundo: "MathNumbers",
    tema: "Cálculo mental",
    descripcion:
      "Ejercicios rápidos para mejorar agilidad numérica y toma de decisiones.",
    dificultad: "Reto",
    duracion: "12 min",
    habilitada: false,
    color: "orange",
    icono: <FiStar />,
  },
  {
    id: 7,
    titulo: "Pictogramas inteligentes",
    mundo: "MathData",
    tema: "Representación de datos",
    descripcion:
      "Organiza información usando pictogramas sencillos y lectura visual.",
    dificultad: "Básica",
    duracion: "16 min",
    habilitada: true,
    color: "blue",
    icono: <FiDatabase />,
  },
  {
    id: 8,
    titulo: "El Escudo Perfecto",
    mundo: "MathGeometry",
    tema: "Construcciones geométricas",
    descripcion:
      "Reconoce divisiones iguales y construcciones visuales dentro de figuras.",
    dificultad: "Media",
    duracion: "22 min",
    habilitada: false,
    color: "green",
    icono: <FiBox />,
  },
];

const alumnosAsignacion: AlumnoAsignacion[] = [
  {
    id: 1,
    iniciales: "MF",
    nombre: "Mariana Fuentes Ruiz",
    grupo: "2°A",
    color: "#0058ff",
  },
  {
    id: 2,
    iniciales: "SJ",
    nombre: "Santiago Jiménez López",
    grupo: "2°A",
    color: "#7c3aed",
  },
  {
    id: 3,
    iniciales: "AG",
    nombre: "Ana Sofía García Pérez",
    grupo: "2°A",
    color: "#f59e0b",
  },
  {
    id: 4,
    iniciales: "DH",
    nombre: "Diego Hernández Torres",
    grupo: "2°A",
    color: "#334155",
  },
  {
    id: 5,
    iniciales: "LM",
    nombre: "Lucía Medina Chávez",
    grupo: "2°A",
    color: "#00a651",
  },
  {
    id: 6,
    iniciales: "VS",
    nombre: "Valeria Sánchez Morales",
    grupo: "2°A",
    color: "#ec4899",
  },
];

function ActividadesDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("actividades");

  const [actividadesSistema, setActividadesSistema] =
    useState<Actividad[]>(actividadesIniciales);

  const [mundoFiltro, setMundoFiltro] = useState("Todos");
  const [temaFiltro, setTemaFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActividades, setPaginaActividades] = useState(0);

  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState<
    number | null
  >(1);

  const [modoAsignacion, setModoAsignacion] =
    useState<ModoAsignacion>("equipos");

  const [estrategiaEquipos, setEstrategiaEquipos] =
    useState<EstrategiaEquipos>("seleccionar");

  const [cantidadEquipos, setCantidadEquipos] = useState(4);

  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<number[]>(
    alumnosAsignacion.map((alumno) => alumno.id),
  );

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

  const irARuta = (ruta: string, menu?: MenuKey) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const temas = useMemo(() => {
    const temasUnicos = Array.from(
      new Set(actividadesSistema.map((actividad) => actividad.tema)),
    );

    return ["Todos", ...temasUnicos];
  }, [actividadesSistema]);

  const actividadesFiltradas = useMemo(() => {
    return actividadesSistema.filter((actividad) => {
      const coincideMundo =
        mundoFiltro === "Todos" || actividad.mundo === mundoFiltro;

      const coincideTema =
        temaFiltro === "Todos" || actividad.tema === temaFiltro;

      const coincideBusqueda =
        actividad.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        actividad.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        actividad.tema.toLowerCase().includes(busqueda.toLowerCase());

      return coincideMundo && coincideTema && coincideBusqueda;
    });
  }, [actividadesSistema, mundoFiltro, temaFiltro, busqueda]);

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
    actividadesSistema.find(
      (actividad) => actividad.id === actividadSeleccionadaId,
    ) ?? null;

  const totalHabilitadas = actividadesSistema.filter(
    (actividad) => actividad.habilitada,
  ).length;

  const totalNoHabilitadas = actividadesSistema.length - totalHabilitadas;

  const cambiarPagina = (direccion: "anterior" | "siguiente") => {
    setPaginaActividades((paginaActual) => {
      if (direccion === "anterior") {
        return paginaActual === 0 ? totalPaginas - 1 : paginaActual - 1;
      }

      return paginaActual + 1 >= totalPaginas ? 0 : paginaActual + 1;
    });
  };

  const cambiarEstadoActividad = (id: number) => {
    setActividadesSistema((actividadesActuales) =>
      actividadesActuales.map((actividad) =>
        actividad.id === id
          ? { ...actividad, habilitada: !actividad.habilitada }
          : actividad,
      ),
    );
  };

  const cambiarAlumnoSeleccionado = (id: number) => {
    setAlumnosSeleccionados((alumnosActuales) => {
      if (alumnosActuales.includes(id)) {
        return alumnosActuales.filter((alumnoId) => alumnoId !== id);
      }

      return [...alumnosActuales, id];
    });
  };

  const alumnosParaAsignar = useMemo(() => {
    if (modoAsignacion === "equipos" && estrategiaEquipos === "aleatorio") {
      return alumnosAsignacion;
    }

    return alumnosAsignacion.filter((alumno) =>
      alumnosSeleccionados.includes(alumno.id),
    );
  }, [alumnosSeleccionados, estrategiaEquipos, modoAsignacion]);

  const cuposPorEquipo =
    modoAsignacion === "equipos"
      ? Math.max(1, Math.ceil(alumnosParaAsignar.length / cantidadEquipos))
      : 0;

  const equiposPreview = useMemo(() => {
    const equipos = Array.from({ length: cantidadEquipos }, (_, index) => ({
      numero: index + 1,
      alumnos: [] as AlumnoAsignacion[],
    }));

    alumnosParaAsignar.forEach((alumno, index) => {
      equipos[index % cantidadEquipos].alumnos.push(alumno);
    });

    return equipos.map((equipo) => ({
      ...equipo,
      cuposDisponibles: Math.max(cuposPorEquipo - equipo.alumnos.length, 0),
    }));
  }, [alumnosParaAsignar, cantidadEquipos, cuposPorEquipo]);

  const totalCuposEquipos = cuposPorEquipo * cantidadEquipos;
  const cuposDisponiblesTotales = Math.max(
    totalCuposEquipos - alumnosParaAsignar.length,
    0,
  );

  const puedeAsignar =
    Boolean(actividadSeleccionada?.habilitada) && alumnosParaAsignar.length > 0;

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
              Elige actividades del sistema, habilítalas o déjalas
              deshabilitadas y asígnalas a tus alumnos.
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

        <section className="act-stats-row">
          <article className="act-stat-card green">
            <div>
              <h3>Habilitadas</h3>
              <strong>{totalHabilitadas}</strong>
              <p>Disponibles para asignar</p>
            </div>

            <span>
              <FiCheckCircle />
            </span>
          </article>

          <article className="act-stat-card gray">
            <div>
              <h3>Deshabilitadas</h3>
              <strong>{totalNoHabilitadas}</strong>
              <p>No visibles para alumnos</p>
            </div>

            <span>
              <FiLock />
            </span>
          </article>

          <article className="act-stat-card blue">
            <div>
              <h3>Actividades del sistema</h3>
              <strong>{actividadesSistema.length}</strong>
              <p>No se crean manualmente</p>
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
              placeholder="Buscar actividad, tema o descripción..."
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
              <span>Catálogo del sistema</span>
              <b>Solo habilitar o deshabilitar</b>
            </div>
          </div>
        </section>

        <section className="act-main-layout">
          <section className="activities-zone">
            <div className="activities-list-header">
              <div>
                <h2>Actividades disponibles</h2>
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

            <section className="teams-wide-card">
              <div className="teams-wide-header">
                <div>
                  <h2>
                    {modoAsignacion === "equipos"
                      ? "Equipos creados"
                      : "Alumnos seleccionados"}
                  </h2>

                  <p>
                    {modoAsignacion === "equipos"
                      ? `${alumnosParaAsignar.length} alumnos organizados en ${cantidadEquipos} equipos · ${cuposDisponiblesTotales} cupos disponibles`
                      : `${alumnosParaAsignar.length} alumnos recibirán la actividad de forma individual`}
                  </p>
                </div>

                {modoAsignacion === "equipos" && (
                  <div className="wide-team-count-options">
                    {[2, 3, 4].map((numero) => (
                      <button
                        type="button"
                        key={numero}
                        className={cantidadEquipos === numero ? "active" : ""}
                        onClick={() => setCantidadEquipos(numero)}
                      >
                        {numero} equipos
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {modoAsignacion === "equipos" ? (
                <div className="teams-wide-grid">
                  {equiposPreview.map((equipo) => (
                    <article className="team-wide-box" key={equipo.numero}>
                      <div className="team-wide-box-head">
                        <div>
                          <h3>Equipo {equipo.numero}</h3>
                          <p>Cupos disponibles: {equipo.cuposDisponibles}</p>
                        </div>

                        <span>
                          {equipo.alumnos.length}/{cuposPorEquipo}
                        </span>
                      </div>

                      <div className="team-wide-members">
                        {equipo.alumnos.length > 0 ? (
                          equipo.alumnos.map((alumno) => (
                            <div className="team-wide-member" key={alumno.id}>
                              <b style={{ background: alumno.color }}>
                                {alumno.iniciales}
                              </b>

                              <span>{alumno.nombre}</span>
                            </div>
                          ))
                        ) : (
                          <small>Sin alumnos todavía</small>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="individual-wide-grid">
                  {alumnosParaAsignar.length > 0 ? (
                    alumnosParaAsignar.map((alumno) => (
                      <article className="individual-wide-card" key={alumno.id}>
                        <b style={{ background: alumno.color }}>
                          {alumno.iniciales}
                        </b>

                        <div>
                          <h3>{alumno.nombre}</h3>
                          <p>{alumno.grupo} · Individual</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <small className="empty-wide-text">
                      Selecciona alumnos para verlos aquí.
                    </small>
                  )}
                </div>
              )}
            </section>

            <section className="activities-grid">
              {actividadesVisibles.map((actividad) => (
                <article
                  className={`activity-card ${
                    actividad.habilitada ? "enabled" : "disabled"
                  } ${actividad.color} ${
                    actividadSeleccionadaId === actividad.id ? "selected" : ""
                  }`}
                  key={actividad.id}
                  onClick={() => {
                    if (actividad.habilitada) {
                      setActividadSeleccionadaId(actividad.id);
                    }
                  }}
                >
                  <div className="activity-card-top">
                    <span className={`activity-icon ${actividad.color}`}>
                      {actividad.icono}
                    </span>

                    <button
                      type="button"
                      className={`enable-toggle-btn ${
                        actividad.habilitada ? "enabled" : "disabled"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        cambiarEstadoActividad(actividad.id);
                      }}
                    >
                      {actividad.habilitada ? (
                        <>
                          <FiCheckCircle />
                          Habilitada
                        </>
                      ) : (
                        <>
                          <FiLock />
                          Deshabilitada
                        </>
                      )}
                    </button>
                  </div>

                  <h2>{actividad.titulo}</h2>

                  <p>{actividad.descripcion}</p>

                  <div className="activity-tags">
                    <span>{actividad.mundo}</span>
                    <span>{actividad.tema}</span>
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
                    disabled={!actividad.habilitada}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (actividad.habilitada) {
                        setActividadSeleccionadaId(actividad.id);
                      }
                    }}
                  >
                    {actividad.habilitada
                      ? "Seleccionar para asignar"
                      : "Actividad bloqueada"}
                  </button>
                </article>
              ))}
            </section>
          </section>

          <aside className="assignment-panel">
            <div className="assignment-panel-header">
              <span>
                <FiPlayCircle />
              </span>

              <div>
                <h2>Asignar actividad</h2>
                <p>Selecciona alumnos o usa equipos aleatorios.</p>
              </div>
            </div>

            {actividadSeleccionada ? (
              <>
                <article
                  className={`selected-activity-box ${
                    actividadSeleccionada.habilitada ? "" : "blocked"
                  }`}
                >
                  <small>Actividad seleccionada</small>
                  <h3>{actividadSeleccionada.titulo}</h3>
                  <p>
                    {actividadSeleccionada.mundo} · {actividadSeleccionada.tema}
                  </p>

                  {!actividadSeleccionada.habilitada && (
                    <b className="blocked-text">
                      Debes habilitar esta actividad para poder asignarla.
                    </b>
                  )}
                </article>

                <div className="assignment-options">
                  <button
                    type="button"
                    className={modoAsignacion === "individual" ? "active" : ""}
                    onClick={() => setModoAsignacion("individual")}
                  >
                    <FiUser />
                    Individual
                  </button>

                  <button
                    type="button"
                    className={modoAsignacion === "equipos" ? "active" : ""}
                    onClick={() => setModoAsignacion("equipos")}
                  >
                    <FiUsersIcon />
                    Equipos
                  </button>
                </div>

                <article className="students-assignment-card">
                  <div className="students-assignment-title">
                    <h3>Alumnos del grupo</h3>
                    <span>
                      {modoAsignacion === "equipos"
                        ? estrategiaEquipos === "aleatorio"
                          ? "Equipos aleatorios"
                          : `${alumnosSeleccionados.length} para equipos`
                        : `${alumnosSeleccionados.length} seleccionados`}
                    </span>
                  </div>

                  <div className="students-list">
                    {alumnosAsignacion.map((alumno) => (
                      <label
                        className={`student-check-row ${
                          modoAsignacion === "equipos" ? "random-mode" : ""
                        }`}
                        key={alumno.id}
                      >
                        <input
                          type="checkbox"
                          checked={
                            (modoAsignacion === "equipos" &&
                              estrategiaEquipos === "aleatorio") ||
                            alumnosSeleccionados.includes(alumno.id)
                          }
                          disabled={
                            modoAsignacion === "equipos" &&
                            estrategiaEquipos === "aleatorio"
                          }
                          onChange={() => cambiarAlumnoSeleccionado(alumno.id)}
                        />

                        <span
                          className="student-mini-avatar"
                          style={{ background: alumno.color }}
                        >
                          {alumno.iniciales}
                        </span>

                        <div>
                          <p>{alumno.nombre}</p>
                          <small>{alumno.grupo}</small>
                        </div>
                      </label>
                    ))}
                  </div>
                </article>

                <article className="random-card">
                  <div>
                    <span>
                      <FiShuffle />
                    </span>

                    <div>
                      <h3>
                        {modoAsignacion === "equipos"
                          ? estrategiaEquipos === "aleatorio"
                            ? "Equipos aleatorios"
                            : "Equipos con alumnos seleccionados"
                          : "Asignación individual"}
                      </h3>

                      <p>
                        {modoAsignacion === "equipos"
                          ? estrategiaEquipos === "aleatorio"
                            ? "El sistema formará los equipos automáticamente."
                            : "Marca los alumnos que participarán y después se organizarán en equipos."
                          : "Puedes marcar los alumnos que recibirán la actividad."}
                      </p>

                      {modoAsignacion === "equipos" && (
                        <div className="team-strategy-options">
                          <button
                            type="button"
                            className={
                              estrategiaEquipos === "seleccionar"
                                ? "active"
                                : ""
                            }
                            onClick={() => setEstrategiaEquipos("seleccionar")}
                          >
                            Seleccionar alumnos
                          </button>

                          <button
                            type="button"
                            className={
                              estrategiaEquipos === "aleatorio" ? "active" : ""
                            }
                            onClick={() => setEstrategiaEquipos("aleatorio")}
                          >
                            Aleatorio
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>

                <article className="assignment-mini-summary">
                  <span>
                    <FiUsersIcon />
                  </span>

                  <div>
                    <h3>
                      {modoAsignacion === "equipos"
                        ? `${cantidadEquipos} equipos listos`
                        : `${alumnosParaAsignar.length} alumnos listos`}
                    </h3>

                    <p>
                      {modoAsignacion === "equipos"
                        ? "La lista completa de equipos aparece a la izquierda."
                        : "La lista de alumnos seleccionados aparece a la izquierda."}
                    </p>
                  </div>
                </article>

                <button
                  type="button"
                  className="publish-btn"
                  disabled={!puedeAsignar}
                >
                  <FiCheckCircle />
                  Asignar actividad
                </button>
              </>
            ) : (
              <article className="empty-selection">
                <FiBookOpen />
                <h3>Selecciona una actividad</h3>
                <p>Solo las actividades habilitadas se pueden asignar.</p>
              </article>
            )}
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

export default ActividadesDocente;
