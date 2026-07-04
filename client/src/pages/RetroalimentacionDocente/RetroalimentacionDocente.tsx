import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RetroalimentacionDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiChevronDown,
  FiPlus,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiClock,
  FiSend,
  FiSave,
  FiBookmark,
  FiChevronRight,
} from "react-icons/fi";

const alumnosFeedback = [
  {
    iniciales: "OM",
    nombre: "Orelana Martínez",
    grupo: "2°A",
    actividad: "Ecuaciones lineales",
    estado: "Pendiente",
    estadoClase: "pendiente",
    hora: "Hace 30 min",
    avatar: "blue",
    entregado: "Hoy, 9:45",
    intentos: "1 de 3",
    puntaje: "16",
  },
  {
    iniciales: "VM",
    nombre: "Valeria Sánchez",
    grupo: "2°A",
    actividad: "Fracciones",
    estado: "Pendiente",
    estadoClase: "pendiente",
    hora: "Hace 1 h",
    avatar: "purple",
    entregado: "Hoy, 9:20",
    intentos: "1 de 3",
    puntaje: "14",
  },
  {
    iniciales: "JR",
    nombre: "Juan Ramírez",
    grupo: "2°A",
    actividad: "Área de figuras",
    estado: "Enviado",
    estadoClase: "enviado",
    hora: "Hoy, 9:15",
    avatar: "dark",
    entregado: "Hoy, 9:15",
    intentos: "2 de 3",
    puntaje: "18",
  },
  {
    iniciales: "CT",
    nombre: "Carla Torres",
    grupo: "2°A",
    actividad: "Proporciones",
    estado: "Con revisión",
    estadoClase: "revision",
    hora: "Hoy, 8:40",
    avatar: "green",
    entregado: "Hoy, 8:40",
    intentos: "2 de 3",
    puntaje: "15",
  },
  {
    iniciales: "OL",
    nombre: "Óscar López",
    grupo: "2°A",
    actividad: "Ecuaciones lineales",
    estado: "Enviado",
    estadoClase: "enviado",
    hora: "Ayer, 20:10",
    avatar: "orange",
    entregado: "Ayer, 20:10",
    intentos: "1 de 3",
    puntaje: "19",
  },
  {
    iniciales: "SG",
    nombre: "Sofía García",
    grupo: "2°A",
    actividad: "Geometría: ángulos",
    estado: "Pendiente",
    estadoClase: "pendiente",
    hora: "Ayer, 18:35",
    avatar: "pink",
    entregado: "Ayer, 18:35",
    intentos: "1 de 3",
    puntaje: "13",
  },
  {
    iniciales: "DM",
    nombre: "Diego Hernández",
    grupo: "2°A",
    actividad: "Porcentajes",
    estado: "Enviado",
    estadoClase: "enviado",
    hora: "Ayer, 17:20",
    avatar: "teal",
    entregado: "Ayer, 17:20",
    intentos: "3 de 3",
    puntaje: "20",
  },
  {
    iniciales: "LM",
    nombre: "Lucía Medina",
    grupo: "2°A",
    actividad: "Ecuaciones lineales",
    estado: "Con revisión",
    estadoClase: "revision",
    hora: "Ayer, 16:05",
    avatar: "blue",
    entregado: "Ayer, 16:05",
    intentos: "2 de 3",
    puntaje: "17",
  },
];

const rubricaRevision = [
  {
    titulo: "Comprende el problema",
    descripcion: "Identifica datos y lo que se pide.",
    estrellas: 4,
  },
  {
    titulo: "Plantea correctamente la ecuación",
    descripcion: "Traduce la situación a una ecuación.",
    estrellas: 2,
  },
  {
    titulo: "Resuelve la ecuación",
    descripcion: "Aplica operaciones correctamente.",
    estrellas: 4,
  },
  {
    titulo: "Verifica la solución",
    descripcion: "Comprueba el resultado en contexto.",
    estrellas: 2,
  },
];

const comentariosFrecuentes = [
  "Revisa el signo al pasar términos de un lado a otro.",
  "Muy bien al plantear la ecuación. Solo cuida los cálculos.",
  "Verifica tu resultado sustituyendo en la ecuación original.",
  "Recuerda simplificar antes de resolver.",
  "Excelente esfuerzo y presentación clara.",
];

function RetroalimentacionDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("retroalimentacion");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(0);

  const alumnoActual = alumnosFeedback[alumnoSeleccionado];

  const [puntaje, setPuntaje] = useState(alumnoActual.puntaje);

  const [comentario, setComentario] = useState(
    "¡Buen trabajo, Orelana! Planteaste bien la ecuación y resolviste correctamente. Te recomiendo verificar siempre la solución en el contexto del problema.",
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
    setPuntaje(alumnoActual.puntaje);
    setComentario(
      `¡Buen trabajo, ${alumnoActual.nombre.split(" ")[0]}! Planteaste bien la actividad. Te recomiendo revisar tus respuestas y verificar el resultado final.`,
    );
  }, [alumnoSeleccionado, alumnoActual.nombre, alumnoActual.puntaje]);

  const seleccionarMenu = (menu: string) => {
    setSelectedMenu(menu);
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const pintarEstrellas = (cantidad: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={index < cantidad ? "star-filled" : "star-empty"}
      >
        ★
      </span>
    ));
  };

  return (
    <main className="docente-page">
      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
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
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
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
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
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
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
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
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "retroalimentacion" ? "active" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "evaluaciones" ? "active" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active" : ""
              }`}
              onClick={() => seleccionarMenu("estadisticas")}
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

      <section className="docente-content retro-content">
        <header className="retro-header">
          <div>
            <h1>Retroalimentación</h1>
            <p>
              Comenta los avances y orienta a tus alumnos para que sigan
              mejorando.
            </p>
          </div>

          <section className="retro-stats">
            <article className="retro-stat-card orange">
              <div>
                <span>Pendientes por revisar</span>
                <strong>18</strong>
              </div>

              <div className="retro-stat-icon">
                <FiClock />
              </div>
            </article>

            <article className="retro-stat-card green">
              <div>
                <span>Enviadas hoy</span>
                <strong>12</strong>
              </div>

              <div className="retro-stat-icon">
                <FiSend />
              </div>
            </article>

            <article className="retro-stat-card blue">
              <div>
                <span>Mensajes sin leer</span>
                <strong>5</strong>
              </div>

              <div className="retro-stat-icon">
                <FiMessageSquare />
              </div>
            </article>
          </section>
        </header>

        <section className="retro-toolbar">
          <div className="retro-search-box">
            <FiSearch />
            <input type="text" placeholder="Buscar alumno..." />
          </div>

          <button className="retro-filter-btn">Grupo: 2°A</button>

          <button className="retro-filter-btn">
            Actividad: Ecuaciones lineales
          </button>

          <button className="retro-new-btn">
            <FiPlus />
            Nueva retroalimentación
          </button>
        </section>

        <section className="retro-main-grid">
          <article className="retro-card retro-list-card">
            <div className="retro-list-head">
              <span>Alumno</span>
              <span>Actividad</span>
              <span>Estado</span>
              <span>Última actualización</span>
              <span></span>
            </div>

            <div className="retro-list">
              {alumnosFeedback.map((alumno, index) => (
                <button
                  key={index}
                  className={`retro-student-row ${
                    alumnoSeleccionado === index ? "selected" : ""
                  }`}
                  onClick={() => setAlumnoSeleccionado(index)}
                >
                  <div className={`retro-avatar ${alumno.avatar}`}>
                    {alumno.iniciales}
                  </div>

                  <div className="retro-student-info">
                    <strong>{alumno.nombre}</strong>
                    <small>{alumno.actividad}</small>
                  </div>

                  <span className={`retro-status ${alumno.estadoClase}`}>
                    {alumno.estado}
                  </span>

                  <span className="retro-update-time">{alumno.hora}</span>

                  <FiChevronRight className="retro-row-arrow" />
                </button>
              ))}
            </div>
          </article>

          <article className="retro-card retro-detail-card">
            <header className="retro-detail-header">
              <div className="retro-student-main">
                <div className={`retro-avatar big ${alumnoActual.avatar}`}>
                  {alumnoActual.iniciales}
                </div>

                <div>
                  <h2>{alumnoActual.nombre}</h2>
                  <p>Grupo {alumnoActual.grupo}</p>
                </div>
              </div>

              <span className="retro-detail-time">
                <FiClock />
                {alumnoActual.hora}
              </span>
            </header>

            <section className="retro-info-grid">
              <article>
                <span>Actividad</span>
                <strong>{alumnoActual.actividad}</strong>
              </article>

              <article>
                <span>Entregado</span>
                <strong>{alumnoActual.entregado}</strong>
              </article>

              <article>
                <span>Intentos</span>
                <strong>{alumnoActual.intentos}</strong>
              </article>

              <article>
                <span>Estado</span>
                <strong className={`detail-status ${alumnoActual.estadoClase}`}>
                  {alumnoActual.estado}
                </strong>
              </article>
            </section>

            <section className="retro-review-grid">
              <div className="retro-rubric">
                <h3>Rúbrica de revisión</h3>

                {rubricaRevision.map((item, index) => (
                  <div className="retro-rubric-row" key={index}>
                    <div>
                      <strong>{item.titulo}</strong>
                      <span>{item.descripcion}</span>
                    </div>

                    <div className="retro-stars">
                      {pintarEstrellas(item.estrellas)}
                    </div>

                    <button className="retro-comment-mini">
                      <FiMessageSquare />
                    </button>
                  </div>
                ))}
              </div>

              <div className="retro-comment-box">
                <label>Puntaje total</label>

                <div className="retro-score-row">
                  <input
                    type="number"
                    value={puntaje}
                    onChange={(e) => setPuntaje(e.target.value)}
                  />
                  <span>/ 20</span>
                </div>

                <label>
                  Comentario para {alumnoActual.nombre.split(" ")[0]}
                </label>

                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  maxLength={500}
                />

                <span className="retro-counter">
                  {comentario.length}/500 caracteres
                </span>

                <h4>Retroalimentación rápida</h4>

                <div className="retro-quick-actions">
                  <button className="quick-green">Excelente trabajo</button>
                  <button className="quick-blue">Buen progreso</button>
                  <button className="quick-orange">Revisa este punto</button>
                  <button className="quick-purple">Sigue practicando</button>
                </div>
              </div>
            </section>

            <div className="retro-detail-actions">
              <button className="retro-outline-btn">
                <FiBookmark />
                Guardar como borrador
              </button>

              <button className="retro-save-btn">
                <FiSave />
                Guardar
              </button>

              <button className="retro-send-btn">
                <FiSend />
                Enviar
              </button>
            </div>
          </article>
        </section>

        <section className="retro-card retro-comments-card">
          <div className="retro-comments-head">
            <h2>
              <FiMessageSquare />
              Comentarios frecuentes
            </h2>

            <button>
              <FiSettings />
              Gestionar sugerencias
            </button>
          </div>

          <div className="retro-comments-list">
            {comentariosFrecuentes.map((comentarioItem, index) => (
              <button key={index}>{comentarioItem}</button>
            ))}
          </div>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button onClick={() => irARuta("/login")}>
              <FiLogOut className="logout-icon" />
            </button>

            <button>
              <FiHelpCircle className="help-icon" />
            </button>

            <button>
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default RetroalimentacionDocente;
