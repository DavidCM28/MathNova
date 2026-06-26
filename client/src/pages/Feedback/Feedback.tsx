import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import zorritoRe from "../../assets/zorrito-re.png";
import zorritoRetroalimentacion from "../../assets/zorrito-retroalimentacion.png";
import estrellaRe from "../../assets/estrella-re.png";

import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import {
  obtenerEstadisticasAlumno,
  obtenerPerfilAlumno,
  obtenerProgresoAlumno,
} from "../../services/alumnoService";

import type {
  Alumno,
  Actividad,
  EstadisticasAlumno,
} from "../../services/alumnoService";

function Feedback() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasAlumno | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const cargarRetroalimentacion = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setCargando(true);

        const [perfilData, estadisticasData, actividadesData] =
          await Promise.all([
            obtenerPerfilAlumno(),
            obtenerEstadisticasAlumno(),
            obtenerProgresoAlumno(),
          ]);

        setAlumno(perfilData);
        setEstadisticas(estadisticasData);
        setActividades(actividadesData);
      } catch (error) {
        console.error("Error al cargar retroalimentación:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarRetroalimentacion();
  }, [navigate]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  const numero = (valor: number | string | null | undefined) => {
    return Number(valor ?? 0);
  };

  const nombreAlumno =
    alumno?.nombre_completo?.split(" ")[0] ||
    alumno?.usuario ||
    "explorador";

  const gradoAlumno = alumno?.grado || "Estudiante";

  const promedioGeneral = numero(estadisticas?.promedio);
  const progresoGeneral = numero(estadisticas?.progreso_general);
  const leccionesCompletadas = numero(estadisticas?.completadas);
  const estrellasGanadas = numero(alumno?.estrellas_totales);
  const tiempoTotal = numero(estadisticas?.tiempo_total);

  const tiempoPromedio =
    leccionesCompletadas > 0
      ? Math.round(tiempoTotal / leccionesCompletadas)
      : 0;

  const tiempoPromedioTexto =
    tiempoPromedio >= 60
      ? `${Math.floor(tiempoPromedio / 60)}m ${tiempoPromedio % 60}s`
      : `${tiempoPromedio}s`;

  const topics = useMemo(() => {
    const grupos = actividades.reduce<
      Record<string, { total: number; suma: number }>
    >((acumulador, actividad) => {
      const tema = actividad.tema || actividad.modulo || "General";

      if (!acumulador[tema]) {
        acumulador[tema] = {
          total: 0,
          suma: 0,
        };
      }

      acumulador[tema].total += 1;
      acumulador[tema].suma += numero(actividad.porcentaje);

      return acumulador;
    }, {});

    const lista = Object.entries(grupos).map(([label, datos]) => {
      const value =
        datos.total > 0 ? Math.round(datos.suma / datos.total) : 0;

      let level = "Pendiente";

      if (value >= 80) {
        level = "Avanzado";
      } else if (value >= 50) {
        level = "Intermedio";
      } else if (value > 0) {
        level = "Básico";
      }

      return {
        label,
        level,
        value,
      };
    });

    if (lista.length === 0) {
      return [
        { label: "MathNumbers", level: "Pendiente", value: 0 },
        { label: "MathGeometry", level: "Pendiente", value: 0 },
        { label: "MathData", level: "Pendiente", value: 0 },
      ];
    }

    return lista.slice(0, 4);
  }, [actividades]);

  const mejorTema = useMemo(() => {
    const temaConProgreso = topics
      .filter((topic) => topic.value > 0)
      .sort((a, b) => b.value - a.value)[0];

    return temaConProgreso?.label || "Sin datos";
  }, [topics]);

  const temaPorPracticar = useMemo(() => {
    const temaPendiente = topics
      .filter((topic) => topic.value < 100)
      .sort((a, b) => a.value - b.value)[0];

    return temaPendiente?.label || "nuevas actividades";
  }, [topics]);

  const mensajeNova =
    leccionesCompletadas > 0
      ? `¡Estás haciendo un gran trabajo, ${nombreAlumno}!`
      : `¡Hola, ${nombreAlumno}! Es momento de comenzar tu aventura.`;

  const consejoNova =
    leccionesCompletadas > 0
      ? `Tus habilidades en ${mejorTema} están avanzando.`
      : "Completa tu primera actividad para generar tu progreso.";

  const sugerenciaNova =
    leccionesCompletadas > 0
      ? `Te sugiero que practiques un poco más ${temaPorPracticar} esta semana.`
      : "Cuando completes actividades, Nova te dará consejos personalizados.";

  return (
    <main className="fbk-page">
      <button
        className={`fbk-hamburger-btn ${menuOpen ? "fbk-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="fbk-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`fbk-sidebar ${menuOpen ? "fbk-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="fbk-sidebar-logo" />

        <nav className="fbk-sidebar-menu">
          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button className="fbk-menu-item fbk-active">
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="fbk-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="fbk-sidebar-bottom-card">
          <div className="fbk-mini-fox-circle">
            <img src={zorritoRe} alt="Nova" />
          </div>

          <h3>¡Sigue así, {nombreAlumno}!</h3>
          <p>Cada paso te acerca a tus metas.</p>

          <div className="fbk-mini-status">
            <img src={estrellaRe} alt="Estrella" />
            <span>
              {leccionesCompletadas > 0
                ? "Estás haciendo un gran trabajo"
                : "Comienza una actividad para avanzar"}
            </span>
          </div>
        </div>
      </aside>

      <section className="fbk-content">
        <header className="fbk-topbar">
          <div>
            <h1>Retroalimentación</h1>
            <p>
              Revisa tu progreso, consejos y recomendaciones personalizadas.
            </p>
          </div>

          <div className="fbk-topbar-user-area">
            <button className="fbk-bell-btn">
              <FiBell />
            </button>

            <div className="fbk-profile-chip">
              <img src={zorritoRe} alt={nombreAlumno} />
              <div>
                <strong>{cargando ? "..." : nombreAlumno}</strong>
                <span>{gradoAlumno}</span>
              </div>
              <FiChevronDown />
            </div>
          </div>
        </header>

        <section className="fbk-grid">
          <article className="fbk-card fbk-summary-card">
            <div className="fbk-card-icon fbk-blue-icon">
              <FiBarChart2 />
            </div>

            <h2>Resumen de Desempeño</h2>
            <span className="fbk-summary-badge">General</span>

            <div className="fbk-summary-box">
              <div className="fbk-summary-row">
                <FiCheck />
                <span>Ejercicios Correctos:</span>
                <strong>{cargando ? "..." : `${promedioGeneral}%`}</strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>Tiempo Promedio:</span>
                <strong>{cargando ? "..." : tiempoPromedioTexto}</strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>Mejor Tema:</span>
                <strong>{cargando ? "..." : mejorTema}</strong>
              </div>
            </div>

            <button onClick={() => irARuta("/estadisticas")}>
              Ver Detalles →
            </button>
          </article>

          <article className="fbk-card fbk-guide-card">
            <div className="fbk-card-icon fbk-green-icon">
              <FiBookOpen />
            </div>

            <h2>Tu Guía de Estudio</h2>
            <p>
              Recomendaciones basadas en tus últimas actividades, {nombreAlumno}.
            </p>

            <div className="fbk-main-progress">
              <span style={{ width: `${progresoGeneral}%` }}></span>
            </div>

            <strong className="fbk-percent-text">
              {cargando ? "..." : `${progresoGeneral}% completado`}
            </strong>

            <div className="fbk-guide-list">
              {topics.map((topic) => (
                <div className="fbk-guide-item" key={topic.label}>
                  <div>
                    <span>{topic.label}</span>
                    <b>{topic.level}</b>
                  </div>

                  <i>
                    <span style={{ width: `${topic.value}%` }}></span>
                  </i>
                </div>
              ))}
            </div>

            <button onClick={() => irARuta("/seleccion-mundos")}>
              Comenzar Guía →
            </button>
          </article>

          <article className="fbk-card fbk-nova-card">
            <div className="fbk-card-icon fbk-orange-icon">
              <img src={zorritoRe} alt="Nova" />
            </div>

            <h2>Mensaje de Nova</h2>

            <div className="fbk-message-panel">
              <p>{mensajeNova}</p>

              <p>{consejoNova}</p>

              <p>{sugerenciaNova}</p>
            </div>

            <button onClick={() => irARuta("/estadisticas")}>
              Ver Historial →
            </button>
          </article>

          <aside className="fbk-progress-panel">
            <h2>¡Progreso Constante!</h2>
            <p>Sigue las guías de Nova para avanzar.</p>

            <img
              src={zorritoRetroalimentacion}
              alt="Zorrito retroalimentación"
              className="fbk-progress-fox"
            />

            <div className="fbk-progress-stats">
              <div>
                <img src={estrellaRe} alt="Estrella" />
                <strong>{cargando ? "..." : leccionesCompletadas}</strong>
                <span>Guías completadas</span>
              </div>

              <div>
                <img src={estrellaRe} alt="Estrella" />
                <strong>{cargando ? "..." : estrellasGanadas}</strong>
                <span>Estrellas ganadas por feedback</span>
              </div>
            </div>
          </aside>
        </section>

        <footer className="fbk-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="fbk-footer-icons">
            <button className="fbk-footer-icon-btn" onClick={cerrarSesion}>
              <FiLogOut className="fbk-logout-icon" />
            </button>

            <FiHelpCircle className="fbk-help-icon" />
            <FiSettings className="fbk-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Feedback;