import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./MisGruposDocente.css";

import {
  obtenerGrupos,
  actualizarGrupo,
  obtenerAlumnosGrupo,
  obtenerAlumnosDisponibles,
  agregarAlumnoAGrupo,
  eliminarAlumnoDeGrupo,
  type Grupo,
  type AlumnoGrupo,
} from "../../services/groupService";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import heroMisGrupos from "../../assets/docente/misGrupos/hero-banner-docentes-mis-grupos.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiBarChart2,
  FiChevronDown,
  FiPlus,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiUserPlus,
  FiEye,
  FiPieChart,
  FiX,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";

const coloresGrupo = ["blue", "purple", "green", "orange"];

type Alerta = {
  tipo: "success" | "error";
  titulo: string;
  mensaje: string;
};

type AlumnosPorGrupo = Record<number, AlumnoGrupo[]>;

const obtenerIniciales = (nombre: string) => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "A";

  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
};

function MisGruposDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState<AlumnosPorGrupo>({});
  const [alumnosDisponibles, setAlumnosDisponibles] = useState<AlumnoGrupo[]>(
    [],
  );

  const [cargandoGrupos, setCargandoGrupos] = useState(true);
  const [cargandoAlumnosModal, setCargandoAlumnosModal] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardandoAlumnoId, setGuardandoAlumnoId] = useState<number | null>(
    null,
  );

  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [alerta, setAlerta] = useState<Alerta | null>(null);

  const [mostrarBancoAlumnos, setMostrarBancoAlumnos] = useState(false);
  const [busquedaAlumnoDisponible, setBusquedaAlumnoDisponible] = useState("");

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("ver-grupos");

  const navigate = useNavigate();

  const alumnosDelGrupoEditando = grupoEditando
    ? (alumnosPorGrupo[grupoEditando.id_grupo] ?? [])
    : [];

  const obtenerCantidadAlumnos = (grupo: Grupo) => {
    const alumnosLocales = alumnosPorGrupo[grupo.id_grupo];

    if (Array.isArray(alumnosLocales)) {
      return alumnosLocales.length;
    }

    return grupo.total_alumnos ?? 0;
  };

  const actualizarTotalLocalGrupo = (idGrupo: number, total: number) => {
    setGrupos((gruposActuales) =>
      gruposActuales.map((grupoActual) =>
        grupoActual.id_grupo === idGrupo
          ? {
              ...grupoActual,
              total_alumnos: total,
            }
          : grupoActual,
      ),
    );

    setGrupoEditando((grupoActual) =>
      grupoActual && grupoActual.id_grupo === idGrupo
        ? {
            ...grupoActual,
            total_alumnos: total,
          }
        : grupoActual,
    );
  };

  const cargarAlumnosDeGrupo = async (idGrupo: number) => {
    try {
      const alumnosBD = await obtenerAlumnosGrupo(idGrupo);

      setAlumnosPorGrupo((actual) => ({
        ...actual,
        [idGrupo]: alumnosBD,
      }));

      actualizarTotalLocalGrupo(idGrupo, alumnosBD.length);
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los alumnos del grupo.";

      setErrorModal(mensaje);

      setAlerta({
        tipo: "error",
        titulo: "No se pudieron cargar alumnos",
        mensaje,
      });
    }
  };

  const cargarAlumnosDisponibles = async (idGrupo: number, buscar = "") => {
    try {
      setCargandoAlumnosModal(true);

      const alumnosBD = await obtenerAlumnosDisponibles(idGrupo, buscar);

      setAlumnosDisponibles(alumnosBD);
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los alumnos disponibles.";

      setErrorModal(mensaje);
      setAlumnosDisponibles([]);
    } finally {
      setCargandoAlumnosModal(false);
    }
  };

  useEffect(() => {
    const bloquearFondo = menuOpen || Boolean(grupoEditando);
    const html = document.documentElement;
    const body = document.body;

    const overflowHtmlAnterior = html.style.overflow;
    const overflowBodyAnterior = body.style.overflow;
    const heightHtmlAnterior = html.style.height;
    const heightBodyAnterior = body.style.height;

    if (bloquearFondo) {
      html.classList.add("mgd-body-modal-open");
      body.classList.add("mgd-body-modal-open");
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      html.style.height = "100%";
      body.style.height = "100%";
    } else {
      html.classList.remove("mgd-body-modal-open");
      body.classList.remove("mgd-body-modal-open");
      html.style.overflow = overflowHtmlAnterior;
      body.style.overflow = overflowBodyAnterior;
      html.style.height = heightHtmlAnterior;
      body.style.height = heightBodyAnterior;
    }

    return () => {
      html.classList.remove("mgd-body-modal-open");
      body.classList.remove("mgd-body-modal-open");
      html.style.overflow = overflowHtmlAnterior;
      body.style.overflow = overflowBodyAnterior;
      html.style.height = heightHtmlAnterior;
      body.style.height = heightBodyAnterior;
    };
  }, [menuOpen, grupoEditando]);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  useEffect(() => {
    if (!alerta) return;

    const timer = window.setTimeout(() => {
      setAlerta(null);
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alerta]);

  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        setCargandoGrupos(true);
        setErrorGrupos("");

        const gruposBD = await obtenerGrupos();

        setGrupos(gruposBD);
        setAlumnosPorGrupo({});
      } catch (error) {
        setErrorGrupos(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los grupos.",
        );
      } finally {
        setCargandoGrupos(false);
      }
    };

    void cargarGrupos();
  }, []);

  useEffect(() => {
    if (!grupoEditando || !mostrarBancoAlumnos) return;

    const timer = window.setTimeout(() => {
      void cargarAlumnosDisponibles(
        grupoEditando.id_grupo,
        busquedaAlumnoDisponible,
      );
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [grupoEditando, mostrarBancoAlumnos, busquedaAlumnoDisponible]);

  const seleccionarMenu = (menu: string) => {
    setSelectedMenu(menu);
  };

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const abrirModalEditar = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setNombreEditado(grupo.nombre_grupo);
    setErrorModal("");
    setErrorGrupos("");
    setAlerta(null);
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
    setAlumnosDisponibles([]);

    void cargarAlumnosDeGrupo(grupo.id_grupo);
  };

  const cerrarModalEditar = () => {
    if (editandoId !== null || guardandoAlumnoId !== null) return;

    setGrupoEditando(null);
    setNombreEditado("");
    setErrorModal("");
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
    setAlumnosDisponibles([]);
  };

  const guardarEdicionGrupo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!grupoEditando) return;

    const nombreLimpio = nombreEditado.trim();

    if (!nombreLimpio) {
      setErrorModal("El nombre del grupo no puede estar vacío.");
      return;
    }

    if (nombreLimpio.length > 100) {
      setErrorModal("El nombre no puede superar los 100 caracteres.");
      return;
    }

    if (nombreLimpio === grupoEditando.nombre_grupo.trim()) {
      setErrorModal("Escribe un nombre diferente para guardar cambios.");
      return;
    }

    try {
      setEditandoId(grupoEditando.id_grupo);
      setErrorModal("");
      setErrorGrupos("");

      const resultado = await actualizarGrupo(
        grupoEditando.id_grupo,
        nombreLimpio,
      );

      setGrupos((gruposActuales) =>
        gruposActuales.map((grupoActual) =>
          grupoActual.id_grupo === grupoEditando.id_grupo
            ? {
                ...grupoActual,
                nombre_grupo: resultado.grupo.nombre_grupo,
              }
            : grupoActual,
        ),
      );

      setGrupoEditando((grupoActual) =>
        grupoActual
          ? {
              ...grupoActual,
              nombre_grupo: resultado.grupo.nombre_grupo,
            }
          : grupoActual,
      );

      setNombreEditado(resultado.grupo.nombre_grupo);

      setAlerta({
        tipo: "success",
        titulo: "¡Grupo actualizado!",
        mensaje: `El grupo ahora se llama ${resultado.grupo.nombre_grupo}.`,
      });
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudo editar el grupo.";

      setErrorModal(mensaje);

      setAlerta({
        tipo: "error",
        titulo: "No se pudo guardar",
        mensaje,
      });
    } finally {
      setEditandoId(null);
    }
  };

  const abrirBancoAlumnos = () => {
    if (!grupoEditando) return;

    setMostrarBancoAlumnos(true);
    setBusquedaAlumnoDisponible("");
    setErrorModal("");

    void cargarAlumnosDisponibles(grupoEditando.id_grupo);
  };

  const cerrarBancoAlumnos = () => {
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
    setAlumnosDisponibles([]);
    setErrorModal("");
  };

  const agregarAlumnoExistenteAlGrupo = async (alumno: AlumnoGrupo) => {
    if (!grupoEditando) return;

    try {
      setGuardandoAlumnoId(alumno.id_alumno);
      setErrorModal("");

      await agregarAlumnoAGrupo(grupoEditando.id_grupo, alumno.id_alumno);
      await cargarAlumnosDeGrupo(grupoEditando.id_grupo);
      await cargarAlumnosDisponibles(
        grupoEditando.id_grupo,
        busquedaAlumnoDisponible,
      );

      setAlerta({
        tipo: "success",
        titulo: "¡Alumno asignado!",
        mensaje: `${alumno.nombre} fue agregado al grupo ${grupoEditando.nombre_grupo}.`,
      });
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo agregar el alumno al grupo.";

      setErrorModal(mensaje);

      setAlerta({
        tipo: "error",
        titulo: "No se pudo asignar",
        mensaje,
      });
    } finally {
      setGuardandoAlumnoId(null);
    }
  };

  const eliminarAlumnoDelGrupo = async (alumnoId: number) => {
    if (!grupoEditando) return;

    const alumnoEliminado = alumnosDelGrupoEditando.find(
      (alumno) => alumno.id_alumno === alumnoId,
    );

    const confirmado = window.confirm(
      `¿Seguro que quieres quitar a ${
        alumnoEliminado?.nombre ?? "este alumno"
      } del grupo?`,
    );

    if (!confirmado) return;

    try {
      setGuardandoAlumnoId(alumnoId);
      setErrorModal("");

      await eliminarAlumnoDeGrupo(grupoEditando.id_grupo, alumnoId);
      await cargarAlumnosDeGrupo(grupoEditando.id_grupo);

      if (mostrarBancoAlumnos) {
        await cargarAlumnosDisponibles(
          grupoEditando.id_grupo,
          busquedaAlumnoDisponible,
        );
      }

      setAlerta({
        tipo: "success",
        titulo: "Alumno eliminado",
        mensaje: `${alumnoEliminado?.nombre ?? "El alumno"} fue eliminado del grupo.`,
      });
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el alumno del grupo.";

      setErrorModal(mensaje);

      setAlerta({
        tipo: "error",
        titulo: "No se pudo eliminar",
        mensaje,
      });
    } finally {
      setGuardandoAlumnoId(null);
    }
  };

  const gruposFiltrados = grupos.filter((grupo) => {
    const textoBusqueda = busqueda.toLowerCase().trim();

    const coincideBusqueda = grupo.nombre_grupo
      .toLowerCase()
      .includes(textoBusqueda);

    const coincideGrupo =
      grupoSeleccionado === "Todos" ||
      String(grupo.id_grupo) === grupoSeleccionado;

    return coincideBusqueda && coincideGrupo;
  });

  const totalAlumnos = grupos.reduce((total, grupo) => {
    return total + obtenerCantidadAlumnos(grupo);
  }, 0);

  const promedioGeneral = "—";

  return (
    <main className={`docente-page ${grupoEditando ? "mgd-page-locked" : ""}`}>
      {alerta && (
        <div className={`mgd-swal-alert ${alerta.tipo}`}>
          <div className="mgd-swal-icon">
            {alerta.tipo === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          </div>

          <div className="mgd-swal-text">
            <h3>{alerta.titulo}</h3>
            <p>{alerta.mensaje}</p>
          </div>

          <button
            type="button"
            className="mgd-swal-close"
            onClick={() => setAlerta(null)}
            aria-label="Cerrar alerta"
          >
            <FiX />
          </button>
        </div>
      )}

      {grupoEditando && (
        <div className="mgd-modal-overlay" onClick={cerrarModalEditar}>
          <section
            className="mgd-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mgd-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="mgd-modal-close"
              onClick={cerrarModalEditar}
              aria-label="Cerrar modal"
              disabled={editandoId !== null || guardandoAlumnoId !== null}
            >
              <FiX />
            </button>

            <div className="mgd-modal-icon">
              <FiEdit />
            </div>

            <div className="mgd-modal-header">
              <h2 id="mgd-edit-title">Editar grupo</h2>
              <p>
                Cambia el nombre del grupo, asigna alumnos existentes o elimina
                alumnos de este grupo.
              </p>
            </div>

            <form
              onSubmit={guardarEdicionGrupo}
              className="mgd-modal-form mgd-modal-group-form"
            >
              <div className="mgd-modal-group-title-row">
                <label>
                  Nombre actual
                  <span>{grupoEditando.nombre_grupo}</span>
                </label>

                <div className="mgd-modal-students-pill">
                  <FiUsers />
                  {alumnosDelGrupoEditando.length} alumnos
                </div>
              </div>

              <div className="mgd-modal-input-box">
                <FiUsers />
                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) => {
                    setNombreEditado(e.target.value);
                    setErrorModal("");
                  }}
                  placeholder="Ejemplo: 4°A"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="mgd-modal-count">
                {nombreEditado.trim().length}/100 caracteres
              </div>

              {errorModal && (
                <div className="mgd-modal-error">
                  <FiAlertCircle />
                  <span>{errorModal}</span>
                </div>
              )}

              <div className="mgd-modal-actions">
                <button
                  type="button"
                  className="mgd-modal-cancel"
                  onClick={cerrarModalEditar}
                  disabled={editandoId !== null || guardandoAlumnoId !== null}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="mgd-modal-save"
                  disabled={editandoId === grupoEditando.id_grupo}
                >
                  <FiSave />
                  {editandoId === grupoEditando.id_grupo
                    ? "Guardando..."
                    : "Guardar nombre"}
                </button>
              </div>
            </form>

            <div className="mgd-modal-divider"></div>

            <section className="mgd-modal-students-section">
              <div className="mgd-modal-students-header">
                <div>
                  <h3>Alumnos del grupo</h3>
                  <p>
                    Selecciona alumnos ya registrados para agregarlos a este
                    grupo o elimina los que ya no pertenecen aquí.
                  </p>
                </div>

                <button
                  type="button"
                  className="mgd-add-student-btn"
                  onClick={
                    mostrarBancoAlumnos ? cerrarBancoAlumnos : abrirBancoAlumnos
                  }
                  disabled={guardandoAlumnoId !== null}
                >
                  {mostrarBancoAlumnos ? <FiX /> : <FiUserPlus />}
                  {mostrarBancoAlumnos ? "Cerrar lista" : "Agregar alumno"}
                </button>
              </div>

              {mostrarBancoAlumnos && (
                <section className="mgd-existing-students-panel">
                  <div className="mgd-existing-students-top">
                    <div>
                      <h4>Alumnos existentes</h4>
                      <p>
                        Elige un alumno registrado para asignarlo a este grupo.
                      </p>
                    </div>

                    <div className="mgd-existing-search-box">
                      <FiSearch />
                      <input
                        type="text"
                        value={busquedaAlumnoDisponible}
                        onChange={(e) =>
                          setBusquedaAlumnoDisponible(e.target.value)
                        }
                        placeholder="Buscar alumno..."
                      />
                    </div>
                  </div>

                  <div className="mgd-existing-students-grid">
                    {cargandoAlumnosModal ? (
                      <div className="mgd-existing-empty">
                        <h4>Cargando alumnos...</h4>
                        <p>Estamos buscando los alumnos registrados.</p>
                      </div>
                    ) : alumnosDisponibles.length > 0 ? (
                      alumnosDisponibles.map((alumno) => (
                        <article
                          className="mgd-existing-student-card"
                          key={alumno.id_alumno}
                        >
                          <div className="mgd-student-avatar mgd-existing-avatar">
                            {obtenerIniciales(alumno.nombre)}
                          </div>

                          <div className="mgd-existing-student-info">
                            <strong>{alumno.nombre}</strong>
                            <span>{alumno.correo}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              agregarAlumnoExistenteAlGrupo(alumno)
                            }
                            disabled={guardandoAlumnoId === alumno.id_alumno}
                          >
                            <FiUserCheck />
                            {guardandoAlumnoId === alumno.id_alumno
                              ? "Agregando..."
                              : "Agregar"}
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="mgd-existing-empty">
                        <h4>No hay alumnos disponibles</h4>
                        <p>
                          Todos los alumnos ya están en este grupo o no
                          coinciden con la búsqueda.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="mgd-students-list">
                {alumnosDelGrupoEditando.length > 0 ? (
                  alumnosDelGrupoEditando.map((alumno) => (
                    <article className="mgd-student-row" key={alumno.id_alumno}>
                      <div className="mgd-student-avatar">
                        {obtenerIniciales(alumno.nombre)}
                      </div>

                      <div className="mgd-student-info">
                        <strong>{alumno.nombre}</strong>
                        <span>{alumno.correo}</span>
                      </div>

                      <button
                        type="button"
                        className="mgd-delete-student-btn"
                        onClick={() => eliminarAlumnoDelGrupo(alumno.id_alumno)}
                        disabled={guardandoAlumnoId === alumno.id_alumno}
                      >
                        <FiTrash2 />
                        {guardandoAlumnoId === alumno.id_alumno
                          ? "Quitando..."
                          : "Eliminar"}
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="mgd-student-empty">
                    <div>
                      <h4>Este grupo todavía no tiene alumnos</h4>
                      <p>
                        Presiona “Agregar alumno” y selecciona uno de los
                        alumnos existentes para asignarlo aquí.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </section>
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
                  onClick={() => seleccionarMenu("ver-grupos")}
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
                selectedMenu === "gestion-docentes" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/gestion-docentes")}
            >
              <FiUserCheck />
              <span>Gestión de docentes</span>
            </button>
            <button
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
              type="button"
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
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

      <section className="mgd-content">
        <section className="mgd-header">
          <div className="mgd-header-text">
            <h1>Mis grupos</h1>
            <p>Administra y revisa los grupos que tienes a tu cargo.</p>
          </div>

          <img
            src={heroMisGrupos}
            alt="Mis grupos docente"
            className="mgd-hero-img"
          />
        </section>

        <section className="mgd-filter-card">
          <div className="mgd-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar grupo por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <label className="mgd-filter-box">
            <span>Filtrar por grupo</span>
            <select
              value={grupoSeleccionado}
              onChange={(e) => setGrupoSeleccionado(e.target.value)}
            >
              <option value="Todos">Todos</option>

              {grupos.map((grupo) => (
                <option key={grupo.id_grupo} value={grupo.id_grupo}>
                  {grupo.nombre_grupo}
                </option>
              ))}
            </select>
          </label>

          <button
            className="mgd-create-btn"
            onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
            type="button"
          >
            <FiPlus />
            Crear grupo
          </button>
        </section>

        {errorGrupos && (
          <article className="mgd-empty-card">
            <h3>{errorGrupos}</h3>
            <p>
              Revisa que el backend esté encendido y que tu sesión siga activa.
            </p>
          </article>
        )}

        <section className="mgd-stats-row">
          <article className="mgd-stat-card blue-card">
            <div>
              <h3>Total de grupos</h3>
              <strong>{grupos.length}</strong>
              <p>Activos este ciclo</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUsers />
            </div>
          </article>

          <article className="mgd-stat-card green-card">
            <div>
              <h3>Alumnos totales</h3>
              <strong>{totalAlumnos}</strong>
              <p>En todos tus grupos</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUserPlus />
            </div>
          </article>

          <article className="mgd-stat-card orange-card">
            <div>
              <h3>Promedio general</h3>
              <strong>{promedioGeneral}</strong>
              <p>Sin datos académicos todavía</p>
            </div>

            <div className="mgd-stat-icon">
              <FiPieChart />
            </div>
          </article>
        </section>

        <section className="mgd-main-grid">
          <section className="mgd-groups-grid">
            {cargandoGrupos ? (
              <article className="mgd-empty-card">
                <h3>Cargando grupos...</h3>
                <p>
                  Estamos buscando los grupos registrados en la base de datos.
                </p>
              </article>
            ) : gruposFiltrados.length > 0 ? (
              gruposFiltrados.map((grupo, index) => {
                const color = coloresGrupo[index % coloresGrupo.length];
                const alumnosTexto = `${obtenerCantidadAlumnos(grupo)} alumnos`;
                const promedioTexto = "—";

                return (
                  <article className="mgd-group-card" key={grupo.id_grupo}>
                    <div className="mgd-group-top">
                      <h2 className={`mgd-title-${color}`}>
                        {grupo.nombre_grupo}
                      </h2>

                      <span className="mgd-students-pill">
                        <FiUsers />
                        {alumnosTexto}
                      </span>
                    </div>

                    <div className="mgd-group-average-block">
                      <div className={`mgd-average-icon icon-${color}`}>
                        <FiPieChart />
                      </div>

                      <div>
                        <span>Promedio del grupo</span>
                        <strong className={`mgd-average-${color}`}>
                          {promedioTexto}
                        </strong>
                      </div>
                    </div>

                    <div className="mgd-card-actions">
                      <button
                        onClick={() =>
                          irARuta("/lista-alumnos-docente", "lista")
                        }
                        type="button"
                      >
                        <FiEye />
                        Ver detalle
                      </button>

                      <button
                        onClick={() => abrirModalEditar(grupo)}
                        type="button"
                        disabled={editandoId === grupo.id_grupo}
                      >
                        <FiEdit />
                        {editandoId === grupo.id_grupo
                          ? "Guardando..."
                          : "Editar"}
                      </button>

                      <button
                        className="stats-btn"
                        onClick={() =>
                          irARuta("/estadisticas-docente", "estadisticas")
                        }
                        type="button"
                      >
                        <FiBarChart2 />
                        Ver estadísticas
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="mgd-empty-card">
                <h3>No se encontraron grupos</h3>
                <p>
                  Intenta buscar otro nombre, cambia el filtro o crea un nuevo
                  grupo.
                </p>
              </article>
            )}
          </section>
        </section>

        <footer className="mgd-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="mgd-footer-icons">
            <button
              onClick={() => irARuta("/login", "logout")}
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

export default MisGruposDocente;
