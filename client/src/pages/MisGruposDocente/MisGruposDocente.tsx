import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./MisGruposDocente.css";

import {
  obtenerGrupos,
  actualizarGrupo,
  type Grupo,
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

const alumnosExistentesDemo = [
  {
    id_alumno: 1,
    id_grupo: 0,
    nombre: "Mariana Fernanda Ruiz",
    correo: "mariana.ruiz@mathnova.com",
  },
  {
    id_alumno: 2,
    id_grupo: 0,
    nombre: "Santiago Jiménez",
    correo: "santiago.jimenez@mathnova.com",
  },
  {
    id_alumno: 3,
    id_grupo: 0,
    nombre: "Ana Sofía García",
    correo: "ana.garcia@mathnova.com",
  },
  {
    id_alumno: 4,
    id_grupo: 0,
    nombre: "Diego Hernández",
    correo: "diego.hernandez@mathnova.com",
  },
  {
    id_alumno: 5,
    id_grupo: 0,
    nombre: "Lucía Medina",
    correo: "lucia.medina@mathnova.com",
  },
  {
    id_alumno: 6,
    id_grupo: 0,
    nombre: "Emiliano Morales",
    correo: "emiliano.morales@mathnova.com",
  },
  {
    id_alumno: 7,
    id_grupo: 0,
    nombre: "Valeria Sánchez",
    correo: "valeria.sanchez@mathnova.com",
  },
  {
    id_alumno: 8,
    id_grupo: 0,
    nombre: "José Ramírez",
    correo: "jose.ramirez@mathnova.com",
  },
  {
    id_alumno: 9,
    id_grupo: 0,
    nombre: "Camila Torres",
    correo: "camila.torres@mathnova.com",
  },
  {
    id_alumno: 10,
    id_grupo: 0,
    nombre: "Oscar López",
    correo: "oscar.lopez@mathnova.com",
  },
  {
    id_alumno: 11,
    id_grupo: 0,
    nombre: "Renata Castillo",
    correo: "renata.castillo@mathnova.com",
  },
  {
    id_alumno: 12,
    id_grupo: 0,
    nombre: "Mateo González",
    correo: "mateo.gonzalez@mathnova.com",
  },
  {
    id_alumno: 13,
    id_grupo: 0,
    nombre: "Daniela Vargas",
    correo: "daniela.vargas@mathnova.com",
  },
  {
    id_alumno: 14,
    id_grupo: 0,
    nombre: "Iván Martínez",
    correo: "ivan.martinez@mathnova.com",
  },
  {
    id_alumno: 15,
    id_grupo: 0,
    nombre: "Paulina Reyes",
    correo: "paulina.reyes@mathnova.com",
  },
  {
    id_alumno: 16,
    id_grupo: 0,
    nombre: "Luis Fernando Cruz",
    correo: "luis.cruz@mathnova.com",
  },
  {
    id_alumno: 17,
    id_grupo: 0,
    nombre: "Regina Flores",
    correo: "regina.flores@mathnova.com",
  },
  {
    id_alumno: 18,
    id_grupo: 0,
    nombre: "Andrés Navarro",
    correo: "andres.navarro@mathnova.com",
  },
];

type Alerta = {
  tipo: "success" | "error";
  titulo: string;
  mensaje: string;
};

type AlumnoGrupo = {
  id_alumno: number;
  id_grupo: number;
  nombre: string;
  correo: string;
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

const crearAlumnosInicialesGrupo = (grupo: Grupo): AlumnoGrupo[] => {
  const total = grupo.total_alumnos ?? 0;

  if (total <= 0) return [];

  return Array.from({ length: total }, (_, index) => {
    const alumnoExistente = alumnosExistentesDemo[index];

    if (alumnoExistente) {
      return {
        ...alumnoExistente,
        id_grupo: grupo.id_grupo,
      };
    }

    const numeroExtra = index + 1;

    return {
      id_alumno: grupo.id_grupo * 10000 + numeroExtra,
      id_grupo: grupo.id_grupo,
      nombre: `Alumno demo ${numeroExtra}`,
      correo: `alumno${numeroExtra}.grupo${grupo.id_grupo}@mathnova.com`,
    };
  });
};

function MisGruposDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState<AlumnosPorGrupo>({});
  const [cargandoGrupos, setCargandoGrupos] = useState(true);
  const [errorGrupos, setErrorGrupos] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

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

  const idsAlumnosEnGrupo = new Set(
    alumnosDelGrupoEditando.map((alumno) => alumno.id_alumno),
  );

  const textoBusquedaAlumno = busquedaAlumnoDisponible.toLowerCase().trim();

  const alumnosDisponiblesParaGrupo = grupoEditando
    ? alumnosExistentesDemo.filter((alumno) => {
        const yaEstaEnGrupo = idsAlumnosEnGrupo.has(alumno.id_alumno);
        const coincideBusqueda =
          alumno.nombre.toLowerCase().includes(textoBusquedaAlumno) ||
          alumno.correo.toLowerCase().includes(textoBusquedaAlumno);

        return !yaEstaEnGrupo && coincideBusqueda;
      })
    : [];

  const obtenerCantidadAlumnos = (grupo: Grupo) => {
    const alumnosLocales = alumnosPorGrupo[grupo.id_grupo];

    if (Array.isArray(alumnosLocales)) {
      return alumnosLocales.length;
    }

    return grupo.total_alumnos ?? 0;
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

        const alumnosIniciales = gruposBD.reduce<AlumnosPorGrupo>(
          (acumulador, grupo) => {
            acumulador[grupo.id_grupo] = crearAlumnosInicialesGrupo(grupo);
            return acumulador;
          },
          {},
        );

        setAlumnosPorGrupo(alumnosIniciales);
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
  };

  const abrirModalEditar = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setNombreEditado(grupo.nombre_grupo);
    setErrorModal("");
    setErrorGrupos("");
    setAlerta(null);
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
  };

  const cerrarModalEditar = () => {
    if (editandoId !== null) return;

    setGrupoEditando(null);
    setNombreEditado("");
    setErrorModal("");
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
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
    setMostrarBancoAlumnos(true);
    setBusquedaAlumnoDisponible("");
    setErrorModal("");
  };

  const cerrarBancoAlumnos = () => {
    setMostrarBancoAlumnos(false);
    setBusquedaAlumnoDisponible("");
    setErrorModal("");
  };

  const agregarAlumnoExistenteAlGrupo = (alumno: AlumnoGrupo) => {
    if (!grupoEditando) return;

    const alumnosActuales = alumnosPorGrupo[grupoEditando.id_grupo] ?? [];

    const alumnoYaExiste = alumnosActuales.some(
      (alumnoActual) => alumnoActual.id_alumno === alumno.id_alumno,
    );

    if (alumnoYaExiste) {
      setErrorModal("Este alumno ya pertenece al grupo seleccionado.");
      return;
    }

    const alumnoAsignado: AlumnoGrupo = {
      ...alumno,
      id_grupo: grupoEditando.id_grupo,
    };

    const alumnosActualizados = [alumnoAsignado, ...alumnosActuales];

    setAlumnosPorGrupo((alumnosActualesPorGrupo) => ({
      ...alumnosActualesPorGrupo,
      [grupoEditando.id_grupo]: alumnosActualizados,
    }));

    actualizarTotalLocalGrupo(
      grupoEditando.id_grupo,
      alumnosActualizados.length,
    );

    setBusquedaAlumnoDisponible("");
    setErrorModal("");

    setAlerta({
      tipo: "success",
      titulo: "¡Alumno asignado!",
      mensaje: `${alumno.nombre} fue agregado al grupo ${grupoEditando.nombre_grupo}.`,
    });
  };

  const eliminarAlumnoDelGrupo = (alumnoId: number) => {
    if (!grupoEditando) return;

    const alumnosActuales = alumnosPorGrupo[grupoEditando.id_grupo] ?? [];
    const alumnoEliminado = alumnosActuales.find(
      (alumno) => alumno.id_alumno === alumnoId,
    );

    const alumnosActualizados = alumnosActuales.filter(
      (alumno) => alumno.id_alumno !== alumnoId,
    );

    setAlumnosPorGrupo((alumnosActualesPorGrupo) => ({
      ...alumnosActualesPorGrupo,
      [grupoEditando.id_grupo]: alumnosActualizados,
    }));

    actualizarTotalLocalGrupo(
      grupoEditando.id_grupo,
      alumnosActualizados.length,
    );

    setAlerta({
      tipo: "success",
      titulo: "Alumno eliminado",
      mensaje: `${alumnoEliminado?.nombre ?? "El alumno"} fue eliminado del grupo.`,
    });
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

  const promedioGeneral = 0;

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
              disabled={editandoId !== null}
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
                  disabled={editandoId !== null}
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
                        Elige un alumno de muestra para asignarlo a este grupo.
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
                    {alumnosDisponiblesParaGrupo.length > 0 ? (
                      alumnosDisponiblesParaGrupo.map((alumno) => (
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
                          >
                            <FiUserCheck />
                            Agregar
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="mgd-existing-empty">
                        <h4>No hay alumnos disponibles</h4>
                        <p>
                          Todos los alumnos de muestra ya están en este grupo o
                          no coinciden con la búsqueda.
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
                      >
                        <FiTrash2 />
                        Eliminar
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
              <strong>{promedioGeneral}%</strong>
              <p>Rendimiento promedio</p>
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
                const promedioTexto = "0%";

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
