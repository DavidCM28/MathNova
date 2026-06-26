import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import "./Estadisticas.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import zorroHola from "../../assets/zorrito-hola-explorador.png";
import zorroIdeas from "../../assets/zorrito-ideas.png";
import heroEstadisticas from "../../assets/hero-banner-estadisticas.png";

import leccionesIcon from "../../assets/lecciones-completadas.png";
import estrellasIcon from "../../assets/estrellas-totales.png";
import rachaIcon from "../../assets/racha.png";
import promedioIcon from "../../assets/promedio-general.png";

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

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiZap,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

import { FaChartLine, FaChartPie, FaLightbulb, FaStar } from "react-icons/fa";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function Estadisticas() {
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
    const cargarEstadisticas = async () => {
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
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
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

  const leccionesCompletadas = numero(estadisticas?.completadas);
  const estrellasGanadas = numero(alumno?.estrellas_totales);
  const rachaActual = numero(alumno?.racha_actual);
  const promedioGeneral = numero(estadisticas?.promedio);
  const progresoGeneral = numero(estadisticas?.progreso_general);
  const tiempoEstudio = estadisticas?.tiempo_formateado || "0m";

  const progresoSemanal = useMemo(() => {
    const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const total = leccionesCompletadas;
    const base = Math.floor(total / dias.length);
    const sobrante = total % dias.length;

    const valores = dias.map((dia, index) => ({
      dia,
      valor: base + (index < sobrante ? 1 : 0),
    }));

    const maximo = Math.max(...valores.map((item) => item.valor), 1);

    return valores.map((item, index) => ({
      ...item,
      altura: `${Math.max((item.valor / maximo) * 88, item.valor > 0 ? 18 : 4)}%`,
      index,
    }));
  }, [leccionesCompletadas]);

  const rendimientoPorTema = useMemo(() => {
    const grupos = actividades.reduce<Record<string, { total: number; suma: number }>>(
      (acumulador, actividad) => {
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
      },
      {}
    );

    const colores = ["blue", "green", "purple", "orange", "cyan"];

    const temas = Object.entries(grupos).map(([tema, datos], index) => ({
      tema,
      porcentaje:
        datos.total > 0 ? Math.round(datos.suma / datos.total) : 0,
      color: colores[index % colores.length],
    }));

    if (temas.length === 0) {
      return [
        { tema: "MathNumbers", porcentaje: 0, color: "blue" },
        { tema: "MathGeometry", porcentaje: 0, color: "green" },
        { tema: "MathData", porcentaje: 0, color: "purple" },
      ];
    }

    return temas.slice(0, 5);
  }, [actividades]);

  const dominioPorMundo = useMemo(() => {
    const nombres: Record<string, string> = {
      MathNumbers: "Planeta Números",
      MathGeometry: "Mundo Geometría",
      MathData: "Galaxia Datos",
    };

    const grupos = actividades.reduce<Record<string, { total: number; suma: number }>>(
      (acumulador, actividad) => {
        const modulo = actividad.modulo || "General";

        if (!acumulador[modulo]) {
          acumulador[modulo] = {
            total: 0,
            suma: 0,
          };
        }

        acumulador[modulo].total += 1;
        acumulador[modulo].suma += numero(actividad.porcentaje);

        return acumulador;
      },
      {}
    );

    const mundos = Object.entries(grupos).map(([modulo, datos]) => ({
      nombre: nombres[modulo] || modulo,
      porcentaje:
        datos.total > 0 ? Math.round(datos.suma / datos.total) : 0,
    }));

    if (mundos.length === 0) {
      return [
        { nombre: "Planeta Números", porcentaje: 0 },
        { nombre: "Mundo Geometría", porcentaje: 0 },
        { nombre: "Galaxia Datos", porcentaje: 0 },
      ];
    }

    return mundos;
  }, [actividades]);

  const textoPromedio =
    promedioGeneral >= 80
      ? "Buen trabajo"
      : promedioGeneral >= 60
      ? "Vas mejorando"
      : "Sigue practicando";

  return (
    <main className="estadisticas-page">
      <button
        className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="sidebar-logo" />

        <nav className="sidebar-menu">
          <button className="menu-item" onClick={() => irARuta("/dashboard")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/recompensas")}>
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="menu-item active"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="estadisticas-explorer-box">
          <img src={zorroHola} alt="Zorrito explorador" />
          <span>¡Hola, explorador!</span>
        </div>
      </aside>

      <section className="dashboard-content estadisticas-content">
        <img src={heroEstadisticas} alt="" className="stats-hero-bg" />

        <header className="stats-header">
          <h1>Estadísticas</h1>
          <p>Visualiza tu progreso y rendimiento.</p>
        </header>

        <section className="stats-summary">
          <article className="summary-card estadisticas-green-card">
            <div>
              <h3>Lecciones completadas</h3>
              <strong>{cargando ? "..." : leccionesCompletadas}</strong>
              <p>
                {leccionesCompletadas > 0
                  ? "Actividades completadas"
                  : "Sin actividades todavía"}
              </p>
            </div>
            <img src={leccionesIcon} alt="Lecciones" />
          </article>

          <article className="summary-card estadisticas-yellow-card">
            <div>
              <h3>Estrellas ganadas</h3>
              <strong>{cargando ? "..." : estrellasGanadas}</strong>
              <p>Se calculan con tu progreso</p>
            </div>
            <img src={estrellasIcon} alt="Estrellas" />
          </article>

          <article className="summary-card estadisticas-red-card">
            <div>
              <h3>Racha actual</h3>
              <strong>{cargando ? "..." : rachaActual}</strong>
              <p>{rachaActual > 0 ? "¡Sigue así!" : "Inicia una actividad"}</p>
            </div>
            <img src={rachaIcon} alt="Racha" />
          </article>

          <article className="summary-card estadisticas-blue-card">
            <div>
              <h3>Promedio general</h3>
              <strong>{cargando ? "..." : `${promedioGeneral}%`}</strong>
              <p>{textoPromedio}</p>
            </div>
            <img src={promedioIcon} alt="Promedio" />
          </article>
        </section>

        <section className="stats-grid">
          <article className="stats-panel weekly-panel">
            <div className="panel-title">
              <span className="panel-icon blue-icon">
                <FaChartLine />
              </span>
              <h2>Progreso semanal</h2>
            </div>

            <div className="weekly-chart-area">
              <span className="weekly-axis-title">Lecciones</span>

              <div className="weekly-y-axis">
                <span>16</span>
                <span>12</span>
                <span>8</span>
                <span>4</span>
                <span>0</span>
              </div>

              <div className="weekly-chart">
                {progresoSemanal.map((item) => (
                  <div className="weekly-column" key={item.dia}>
                    <strong>{item.valor}</strong>
                    <span
                      className={`weekly-bar weekly-bar-${item.index}`}
                      style={{ height: item.altura }}
                    ></span>
                    <p>{item.dia}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="weekly-note">
              <div className="weekly-note-left">
                <span className="weekly-note-icon">
                  <FiTrendingUp />
                </span>
                <div>
                  <b>{leccionesCompletadas} lecciones</b>
                  <p>registradas actualmente</p>
                </div>
              </div>

              <div className="weekly-note-right">
                <b>{progresoGeneral}%</b>
                <p>avance total</p>
              </div>
            </div>
          </article>

          <article className="stats-panel performance-panel">
            <div className="panel-title">
              <span className="panel-icon multi-icon">
                <FiBarChart2 />
              </span>
              <h2>Rendimiento por tema</h2>
            </div>

            {rendimientoPorTema.map((item) => (
              <div className="topic-row" key={item.tema}>
                <div>
                  <span>{item.tema}</span>
                  <b>{item.porcentaje}%</b>
                </div>
                <div className="topic-line">
                  <span
                    className={`topic-fill ${item.color}`}
                    style={{ width: `${item.porcentaje}%` }}
                  ></span>
                </div>
              </div>
            ))}

            <div className="legend">
              <span className="legend-green"></span>90-100%
              <span className="legend-blue"></span>70-89%
              <span className="legend-yellow"></span>50-69%
              <span className="legend-red"></span>&lt;50%
            </div>
          </article>

          <article className="stats-panel world-panel">
            <div className="panel-title">
              <span className="panel-icon pie-icon">
                <FaChartPie />
              </span>
              <h2>Dominio por mundo</h2>
            </div>

            <div className="world-content">
              <div className="donut">
                <div className="donut-inner">
                  <strong>{progresoGeneral}%</strong>
                  <span>Promedio</span>
                </div>
              </div>

              <div className="world-list">
                {dominioPorMundo.map((mundo) => (
                  <p key={mundo.nombre}>
                    <b>{mundo.nombre}</b>
                    <strong>{mundo.porcentaje}%</strong>
                  </p>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="bottom-grid">
          <article className="stats-panel time-panel">
            <div className="panel-title">
              <span className="panel-icon clock-icon">
                <FiClock />
              </span>
              <h2>Tiempo de estudio</h2>
            </div>

            <div className="study-info">
              <div className="study-summary">
                <strong>{cargando ? "..." : tiempoEstudio}</strong>
                <p>tiempo acumulado</p>
                <span>
                  {leccionesCompletadas}
                  <br />
                  actividades completas
                </span>
              </div>

              <div className="clean-line-chart">
                <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="520" y2="20" />
                  <line x1="0" y1="55" x2="520" y2="55" />
                  <line x1="0" y1="90" x2="520" y2="90" />
                  <line x1="0" y1="125" x2="520" y2="125" />

                  <polyline points="10,130 85,108 165,82 245,42 325,70 405,22 500,72" />

                  <circle cx="10" cy="130" r="6" />
                  <circle cx="85" cy="108" r="6" />
                  <circle cx="165" cy="82" r="6" />
                  <circle cx="245" cy="42" r="6" />
                  <circle cx="325" cy="70" r="6" />
                  <circle cx="405" cy="22" r="6" />
                  <circle cx="500" cy="72" r="6" />
                </svg>

                <div className="chart-days">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </div>
            </div>
          </article>

          <article className="stats-panel ideas-panel">
            <img src={zorroIdeas} alt="Zorrito ideas" className="ideas-fox" />

            <div className="panel-title">
              <span className="panel-icon idea-title-icon">
                <FaLightbulb />
              </span>
              <h2>Ideas para mejorar</h2>
            </div>

            <div className="idea purple">
              <span className="idea-icon">
                <FiZap />
              </span>
              <div>
                <b>
                  {progresoGeneral >= 70
                    ? "Sigue practicando para dominar todos los mundos."
                    : "Practica Geometría para mejorar tu dominio."}
                </b>
                <p>Tu progreso se actualiza al completar actividades.</p>
              </div>
              <button onClick={() => irARuta("/temas/geometria")}>
                Practicar ahora
              </button>
            </div>

            <div className="idea green">
              <span className="idea-icon">
                <FiBarChart2 />
              </span>
              <div>
                <b>Mantén tu racha activa cada día.</b>
                <p>
                  {rachaActual > 0
                    ? `¡${rachaActual} actividades completadas!`
                    : "Completa tu primera actividad para iniciar tu racha."}
                </p>
              </div>
              <button onClick={() => irARuta("/recompensas")}>Ver racha</button>
            </div>

            <div className="idea orange">
              <span className="idea-icon">
                <FaStar />
              </span>
              <div>
                <b>¡Estás en el camino correcto!</b>
                <p>Sigue así y alcanza nuevas metas.</p>
              </div>
              <button onClick={() => irARuta("/recompensas")}>Ver metas</button>
            </div>
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button className="footer-icon-btn" onClick={cerrarSesion}>
              <FiLogOut className="logout-icon" />
            </button>

            <FiHelpCircle className="help-icon" />
            <FiSettings className="settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Estadisticas;