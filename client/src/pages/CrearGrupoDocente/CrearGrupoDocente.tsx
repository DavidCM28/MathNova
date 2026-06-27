import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CrearGrupoDocente.css";

import { crearGrupo } from "../../services/groupService";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";
import crearGrupoDocentes from "../../assets/crear-grupo-docentes.png";

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
  FiPlus,
  FiUser,
  FiCheckCircle,
  FiInfo,
  FiStar,
} from "react-icons/fi";

function CrearGrupoDocente() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu] = useState("crear-grupo");

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

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const handleCrearGrupo = async () => {
    const nombreLimpio = nombreGrupo.trim();

    if (!nombreLimpio) {
      setError("Escribe el nombre del grupo.");
      setMensaje("");
      return;
    }

    if (nombreLimpio.length > 100) {
      setError("El nombre no puede superar los 100 caracteres.");
      setMensaje("");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Debes iniciar sesión para crear un grupo.");
      setMensaje("");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const resultado = await crearGrupo(nombreLimpio);

      setMensaje(
        `${resultado.mensaje} Identificador: ${resultado.grupo.id_grupo}.`,
      );

      setNombreGrupo("");

      setTimeout(() => {
        navigate("/mis-grupos-docente");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el grupo.",
      );
    } finally {
      setGuardando(false);
    }
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
                  <span />
                  Ver grupos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span />
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

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
                  <span />
                  Administrar alumnos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span />
                  Lista
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span />
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

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

      <section className="crear-docente-content">
        <section className="crear-main-area">
          <div className="crear-left-content">
            <header className="crear-header">
              <h1>Crear grupo</h1>
              <p>Registra un nuevo grupo para organizar a tus alumnos.</p>
            </header>

            <section className="crear-form-card">
              <div className="crear-form-header">
                <div className="crear-form-icon">
                  <FiUsers />
                </div>

                <div>
                  <h2>Información del grupo</h2>
                  <p>Escribe el nombre del grupo que deseas crear.</p>
                </div>
              </div>

              <div className="crear-form-grid">
                <div className="crear-field nombre-grupo-field">
                  <label htmlFor="nombre-grupo">Nombre del grupo</label>

                  <input
                    id="nombre-grupo"
                    type="text"
                    placeholder="Ej. 1°A, 1°B, 2°A..."
                    maxLength={100}
                    value={nombreGrupo}
                    disabled={guardando}
                    onChange={(event) => {
                      setNombreGrupo(event.target.value);
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleCrearGrupo();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="crear-name-examples">
                <span>Ejemplos rápidos:</span>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setNombreGrupo("1°A")}
                >
                  1°A
                </button>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setNombreGrupo("1°B")}
                >
                  1°B
                </button>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setNombreGrupo("2°A")}
                >
                  2°A
                </button>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setNombreGrupo("3°A")}
                >
                  3°A
                </button>
              </div>

              {error && (
                <div role="alert" className="crear-alert crear-alert-error">
                  {error}
                </div>
              )}

              {mensaje && (
                <div role="status" className="crear-alert crear-alert-success">
                  {mensaje}
                </div>
              )}
            </section>

            <section className="crear-students-card">
              <div className="crear-section-title">
                <div>
                  <h2>Agregar alumnos</h2>
                  <p>Busca y agrega alumnos para incluirlos en el grupo.</p>
                </div>

                <button type="button" className="add-student-btn">
                  <FiPlus />
                  Agregar alumnos
                </button>
              </div>

              <div className="crear-search-box">
                <FiSearch />

                <input type="text" placeholder="Buscar alumnos por nombre" />
              </div>

              <p className="selected-count">5 alumnos seleccionados</p>

              <div className="student-tags">
                <span>
                  <b>OM</b>
                  Orelana Martínez
                  <button type="button">×</button>
                </span>

                <span>
                  <b className="purple">VS</b>
                  Valeria Sánchez
                  <button type="button">×</button>
                </span>

                <span>
                  <b className="dark">JR</b>
                  Juan Ramírez
                  <button type="button">×</button>
                </span>

                <span>
                  <b className="green">CT</b>
                  Carina Torres
                  <button type="button">×</button>
                </span>

                <span>
                  <b className="orange">OL</b>
                  Óscar López
                  <button type="button">×</button>
                </span>
              </div>
            </section>

            <div className="crear-actions-bar">
              <button
                type="button"
                className="cancel-btn"
                disabled={guardando}
                onClick={() => irARuta("/mis-grupos-docente")}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="draft-btn"
                disabled
                title="La tabla todavía no tiene una columna para borradores"
              >
                Guardar borrador
              </button>

              <button
                type="button"
                className="create-btn"
                disabled={guardando}
                onClick={() => void handleCrearGrupo()}
              >
                <FiUsers />
                {guardando ? "Creando grupo..." : "Crear grupo"}
              </button>
            </div>
          </div>

          <aside className="crear-right-panel">
            <article className="tips-card">
              <h2>
                <FiInfo />
                Consejos para crear tu grupo
              </h2>

              <div className="tip-item">
                <div className="tip-icon green-tip">
                  <FiUser />
                </div>

                <div>
                  <h3>Usa un nombre claro</h3>
                  <p>Escribe nombres cortos como 1°A, 1°B, 2°A o 3°A.</p>
                </div>
              </div>

              <div className="tip-item">
                <div className="tip-icon blue-tip">
                  <FiUsers />
                </div>

                <div>
                  <h3>Agrega tus alumnos</h3>
                  <p>Selecciona los alumnos que pertenecerán a este grupo.</p>
                </div>
              </div>

              <div className="tip-item">
                <div className="tip-icon orange-tip">
                  <FiStar />
                </div>

                <div>
                  <h3>Revisa antes de crear</h3>
                  <p>Verifica que el nombre y los alumnos estén correctos.</p>
                </div>
              </div>

              <img
                src={crearGrupoDocentes}
                alt="Docente creando grupo"
                className="crear-teacher-img"
              />
            </article>

            <article className="help-card">
              <div className="help-icon-circle">
                <FiHelpCircle />
              </div>

              <div>
                <h3>¿Necesitas ayuda?</h3>
                <p>Consulta nuestra guía para crear y gestionar grupos.</p>

                <button type="button">
                  Ver guía completa
                  <FiCheckCircle />
                </button>
              </div>
            </article>
          </aside>
        </section>

        <footer className="crear-docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="crear-docente-footer-icons">
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

export default CrearGrupoDocente;
