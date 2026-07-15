import { useEffect, useMemo, useState } from "react";
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
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiPlus,
  FiSearch,
  FiUpload,
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
  id_alumno: number;
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

function formatearFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AdministrarAlumnosDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [resumen, setResumen] = useState<Resumen>(resumenInicial);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [alumnoEditar, setAlumnoEditar] = useState<Alumno | null>(null);
  const [formEditar, setFormEditar] = useState({
    nombre: "",
    grupo: "",
    modulo: "",
    asistencia: "",
    promedio: "",
    estado: "Activo" as "Activo" | "Rezago",
  });

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
      menuOpen || modalAgregarOpen || alumnoEditar ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, modalAgregarOpen, alumnoEditar]);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalAgregarOpen(false);
        setAlumnoEditar(null);
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

        const token = localStorage.getItem("token");

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

        const texto = await response.text();

        let data: DocenteAlumnosResponse;

        try {
          data = texto ? JSON.parse(texto) : null;
        } catch {
          throw new Error(
            "El backend no devolvió JSON. Revisa que la ruta /api/docente/alumnos esté registrada.",
          );
        }

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
  }, [busqueda]);

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

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const abrirModalEditar = (alumno: Alumno) => {
    setFormEditar({
      nombre: alumno.nombre,
      grupo: alumno.grupo,
      modulo: alumno.modulo,
      asistencia: alumno.asistencia !== null ? String(alumno.asistencia) : "",
      promedio: alumno.promedio !== null ? String(alumno.promedio) : "",
      estado: alumno.estado,
    });
    setAlumnoEditar(alumno);
  };

  const cerrarModalEditar = () => {
    setAlumnoEditar(null);
    setFormEditar({
      nombre: "",
      grupo: "",
      modulo: "",
      asistencia: "",
      promedio: "",
      estado: "Activo",
    });
  };

  const cambiarCampoEditar = (
    campo: "nombre" | "grupo" | "modulo" | "asistencia" | "promedio" | "estado",
    valor: string,
  ) => {
    setFormEditar((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const cambiarPagina = (pagina: number) => {
    const paginaSegura = Math.min(Math.max(pagina, 1), totalPaginas);
    setPaginaActual(paginaSegura);
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
              onClick={() => setModalAgregarOpen(true)}
            >
              <FiPlus />
              Agregar alumno
            </button>

            <button type="button" className="admin-action-btn">
              <FiUpload />
              Importar lista
            </button>

            <button type="button" className="admin-action-btn">
              <FiUserPlus />
              Asignar grupo
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
                <div className="admin-table-row" key={alumno.id_alumno}>
                  <span className="student-cell">
                    <b className={`student-avatar ${alumno.color}`}>
                      {alumno.iniciales}
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
                    <button type="button" aria-label="Ver alumno">
                      <FiEye />
                    </button>

                    <button
                      type="button"
                      aria-label={`Editar a ${alumno.nombre}`}
                      onClick={() => abrirModalEditar(alumno)}
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      className="delete"
                      aria-label="Eliminar alumno"
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
                <div className="recent-row" key={alumno.id_alumno}>
                  <span className={`mini-avatar ${alumno.color}`}>
                    {alumno.iniciales}
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

            <button type="button" className="link-btn">
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
              <button type="button">Ver alumnos</button>
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

      {modalAgregarOpen && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalAgregarOpen(false);
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
              onClick={() => setModalAgregarOpen(false)}
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

            <form
              className="admin-modal-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="admin-modal-field">
                <span>Nombre completo</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    placeholder="Ej. María Fernanda López"
                    autoComplete="name"
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
                  />
                </div>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn secondary"
                  onClick={() => setModalAgregarOpen(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="admin-modal-btn primary">
                  <FiUserPlus />
                  Agregar alumno
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
            className="admin-modal admin-modal-edit"
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

            <header className="admin-modal-header">
              <div className="admin-modal-icon admin-modal-edit-icon">
                <FiEdit2 />
              </div>

              <div>
                <span className="admin-modal-badge admin-modal-edit-badge">
                  Editando estudiante
                </span>
                <h2 id="admin-edit-modal-title">Editar alumno</h2>
                <p>
                  Actualiza la información de {alumnoEditar.nombre}. Verifica
                  los cambios antes de guardar.
                </p>
              </div>
            </header>

            <div className="admin-edit-student-card">
              <span className={`student-avatar ${alumnoEditar.color}`}>
                {alumnoEditar.iniciales}
              </span>

              <div>
                <strong>{formEditar.nombre || alumnoEditar.nombre}</strong>
                <p>
                  {formEditar.grupo || "Sin grupo"} ·{" "}
                  {formEditar.modulo || "Sin módulo"}
                </p>
              </div>

              <span
                className={`status-pill ${
                  formEditar.estado === "Activo" ? "activo" : "rezago"
                }`}
              >
                {formEditar.estado}
              </span>
            </div>

            <form
              className="admin-modal-form admin-edit-table-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="admin-modal-field admin-edit-full-field">
                <span>Alumno</span>
                <div className="admin-modal-input">
                  <FiUser />
                  <input
                    type="text"
                    value={formEditar.nombre}
                    onChange={(event) =>
                      cambiarCampoEditar("nombre", event.target.value)
                    }
                    placeholder="Nombre completo del alumno"
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Grupo</span>
                <div className="admin-modal-input">
                  <FiUsers />
                  <input
                    type="text"
                    value={formEditar.grupo}
                    onChange={(event) =>
                      cambiarCampoEditar("grupo", event.target.value)
                    }
                    placeholder="Ej. 3° A o Sin grupo"
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Módulo</span>
                <div className="admin-modal-input">
                  <FiEdit />
                  <input
                    type="text"
                    value={formEditar.modulo}
                    onChange={(event) =>
                      cambiarCampoEditar("modulo", event.target.value)
                    }
                    placeholder="Ej. Geometría o Sin módulo"
                  />
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Asistencia</span>
                <div className="admin-modal-input admin-modal-number-input">
                  <FiCheckCircle />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formEditar.asistencia}
                    onChange={(event) =>
                      cambiarCampoEditar("asistencia", event.target.value)
                    }
                    placeholder="0 a 100"
                  />
                  <b>%</b>
                </div>
              </label>

              <label className="admin-modal-field">
                <span>Promedio</span>
                <div className="admin-modal-input">
                  <FiStar />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formEditar.promedio}
                    onChange={(event) =>
                      cambiarCampoEditar("promedio", event.target.value)
                    }
                    placeholder="0.0 a 10.0"
                  />
                </div>
              </label>

              <label className="admin-modal-field admin-edit-full-field">
                <span>Estado</span>
                <div className="admin-modal-input admin-modal-select-input">
                  <FiCheckCircle />
                  <select
                    value={formEditar.estado}
                    onChange={(event) =>
                      cambiarCampoEditar("estado", event.target.value)
                    }
                  >
                    <option value="Activo">Activo</option>
                    <option value="Rezago">Rezago</option>
                  </select>
                </div>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn secondary"
                  onClick={cerrarModalEditar}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-modal-btn primary admin-modal-save-btn"
                >
                  <FiCheckCircle />
                  Guardar cambios
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdministrarAlumnosDocente;
