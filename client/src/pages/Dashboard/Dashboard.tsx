import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import logo from "../../assets/logo_MathNova.png";
import heroBanner from "../../assets/Hero-Banner.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import zorritoConsejo from "../../assets/zorrito-consejo-nova.png";

import leccionesIcon from "../../assets/lecciones-completadas.png";
import estrellasIcon from "../../assets/estrellas-totales.png";
import rachaIcon from "../../assets/racha.png";
import promedioIcon from "../../assets/promedio-general.png";
import algebraIcon from "../../assets/icono-algebra-basica.png";
import geometriaIcon from "../../assets/geometria.png";
import numerosIcon from "../../assets/numeros.png";
import estadisticaIcon from "../../assets/estadistica.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowRight,
  FiMoreHorizontal,
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

import type { ActividadProgreso } from "../../services/alumnoService";

import {
  clearAuthSession,
  getDisplayName,
  isGuestSession,
} from "../../utils/authSession";

type Alumno = {
  id?: number | string;
  id_usuario?: number | string;
  nombreCompleto?: string;
  nombre_completo?: string;
  correo?: string;
  usuario?: string | null;
  rol?: string;
  estado?: boolean;
  estrellas_totales?: number;
  racha_actual?: number;
};

type Actividad = ActividadProgreso & {
  titulo?: string;
  estado?: string;
  porcentaje?: number;
  tema?: string;
  modulo?: string;
};

type EstadisticasAlumno = {
  completadas?: number;
  promedio?: number;
  progreso_general?: number;
  tiempo_formateado?: string;

  leccionesCompletadas?: number;
  estrellasGanadas?: number;
  rachaActual?: number;
  promedioGeneral?: number;
  progresoSemanal?: { dia: string; lecciones: number }[];
  rendimientoPorTema?: { tema: string; promedio: number }[];
  dominioPorMundo?: { mundo: string; promedio: number }[];
  tiempoEstudio?: {
    minutos: number;
    actividadesCompletas: number;
    semanal: { dia: string; minutos: number }[];
  };
};

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasAlumno | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState("");

  const navigate = useNavigate();

  const modoInvitado = isGuestSession();

  const nombreAlumno =
    alumno?.nombre_completo ||
    alumno?.nombreCompleto ||
    alumno?.usuario ||
    alumno?.correo;

  const nombreUsuario = nombreAlumno
    ? String(nombreAlumno).split(" ")[0]
    : getDisplayName();

  const cargarDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    const invitado = isGuestSession();

    if (!token && !invitado) {
      navigate("/login", { replace: true });
      return;
    }

    if (invitado) {
      setAlumno(null);
      setEstadisticas(null);
      setActividades([]);
      setErrorDashboard("");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setErrorDashboard("");

      const [perfilData, estadisticasData, actividadesData] =
        await Promise.all([
          obtenerPerfilAlumno(),
          obtenerEstadisticasAlumno(),
          obtenerProgresoAlumno(),
        ]);

      setAlumno(perfilData?.perfil ?? perfilData);
      setEstadisticas(estadisticasData?.estadisticas ?? estadisticasData);
      setActividades(Array.isArray(actividadesData) ? actividadesData : []);
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el dashboard";

      setErrorDashboard(mensaje);
      setActividades([]);
      console.error("Error al cargar dashboard:", error);
    } finally {
      setCargando(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const numero = (valor: number | string | null | undefined) => {
    const convertido = Number(valor ?? 0);
    return Number.isNaN(convertido) ? 0 : convertido;
  };

  const actividadesSeguras = Array.isArray(actividades) ? actividades : [];

  const leccionesCompletadas = numero(
    estadisticas?.leccionesCompletadas ?? estadisticas?.completadas
  );

  const estrellasTotales = numero(
    estadisticas?.estrellasGanadas ?? alumno?.estrellas_totales
  );

  const rachaActual = numero(
    estadisticas?.rachaActual ?? alumno?.racha_actual
  );

  const promedioGeneral = numero(
    estadisticas?.promedioGeneral ?? estadisticas?.promedio
  );

  const progresoGeneral = numero(
    estadisticas?.progreso_general ?? estadisticas?.promedioGeneral
  );

  const actividadActual =
    actividadesSeguras.find(
      (actividad) =>
        actividad.estado === "en_curso" || actividad.completada === false
    ) ||
    actividadesSeguras.find((actividad) => actividad.estado === "pendiente") ||
    actividadesSeguras[0];

  const tituloActividad = modoInvitado
    ? "Explora MathNova"
    : actividadActual?.titulo ||
      actividadActual?.actividadNombre ||
      actividadActual?.actividadSlug ||
      "MathNova";

  const progresoCurso =
    actividadActual?.estado === "en_curso"
      ? numero(actividadActual.porcentaje ?? actividadActual.puntaje)
      : progresoGeneral;

  const progresoVisual = modoInvitado
    ? 0
    : Math.min(Math.max(progresoCurso, 0), 100);

  const tieneProgreso = actividadesSeguras.some(
    (actividad) =>
      actividad.estado === "completada" ||
      actividad.estado === "en_curso" ||
      actividad.completada === true ||
      numero(actividad.porcentaje ?? actividad.puntaje) > 0
  );

  const modulosRecomendados = tieneProgreso
    ? [
        {
          nombre: "Geometría",
          icono: geometriaIcon,
          ruta: "/actividades/geometria",
        },
        {
          nombre: "Números",
          icono: numerosIcon,
          ruta: "/temas/numeros",
        },
        {
          nombre: "Estadística",
          icono: estadisticaIcon,
          ruta: "/estadisticas",
        },
      ]
    : [];

  const textoHero = cargando
    ? "Cargando tu progreso..."
    : errorDashboard
    ? errorDashboard
    : modoInvitado
    ? "Explora los mundos, conoce las actividades y descubre cómo funciona MathNova antes de iniciar sesión."
    : "Aprende, practica y mejora tus habilidades de observación paso a paso.";

  return (
    <main className="dashboard-page">
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
          <button className="menu-item active">
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
            className="menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="sidebar-fox"
          />
        </div>
      </aside>

      <section className="dashboard-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Bienvenido, {nombreUsuario}</h1>

            <p>{textoHero}</p>

            <div className="hero-actions">
              <button
                className="primary-action"
                onClick={() => irARuta("/seleccion-mundos")}
              >
                Comenzar ahora <FiArrowRight />
              </button>

              <button
                className="secondary-action"
                onClick={() => irARuta("/estadisticas")}
              >
                Ver mi progreso <FiBarChart2 />
              </button>
            </div>

            {modoInvitado && (
              <div className="guest-hero-alert">
                Estás viendo MathNova como espectador. Puedes explorar el
                dashboard y los mundos disponibles, pero para iniciar actividades
                y guardar progreso necesitas iniciar sesión o crear una cuenta.
              </div>
            )}
          </div>

          <img src={heroBanner} alt="Hero MathNova" className="hero-img" />
        </section>

        <section className="stats-row">
          <article className="stat-card green-card">
            <div>
              <h3>Lecciones completadas</h3>
              <strong>{cargando ? "..." : leccionesCompletadas}</strong>
              <p>
                {leccionesCompletadas > 0
                  ? "¡Buen avance!"
                  : "Empieza tu primera actividad"}
              </p>
            </div>
            <img src={leccionesIcon} alt="Lecciones" />
          </article>

          <article className="stat-card yellow-card">
            <div>
              <h3>Estrellas totales</h3>
              <strong>{cargando ? "..." : estrellasTotales}</strong>
              <p>
                {estrellasTotales > 0
                  ? "¡Sigue sumando estrellas!"
                  : "Aún no tienes estrellas"}
              </p>
            </div>
            <img src={estrellasIcon} alt="Estrellas" />
          </article>

          <article className="stat-card red-card">
            <div>
              <h3>Racha actual</h3>
              <strong>{cargando ? "..." : rachaActual}</strong>
              <p>{rachaActual > 0 ? "¡Sigue así!" : "Inicia tu racha"}</p>
            </div>
            <img src={rachaIcon} alt="Racha" />
          </article>

          <article className="stat-card blue-card">
            <div>
              <h3>Promedio general</h3>
              <strong>{cargando ? "..." : `${promedioGeneral}%`}</strong>
              <p>
                {promedioGeneral >= 80
                  ? "Excelente trabajo"
                  : promedioGeneral > 0
                  ? "Puedes mejorar"
                  : "Sin calificaciones todavía"}
              </p>
            </div>
            <img src={promedioIcon} alt="Promedio" />
          </article>
        </section>

        <section className="bottom-section">
          <article className="continue-card">
            <h2>Continúa donde lo dejaste</h2>

            <div className="course-progress">
              <img src={algebraIcon} alt={tituloActividad} />

              <div className="course-info">
                <div className="course-header">
                  <h3>{tituloActividad}</h3>
                  <FiMoreHorizontal />
                </div>

                <div className="progress-line">
                  <span
                    className="progress-blue"
                    style={{ width: `${progresoVisual}%` }}
                  ></span>
                  <span
                    className="progress-green"
                    style={{ width: "0%" }}
                  ></span>
                </div>
              </div>

              <strong>{cargando ? "..." : `${progresoVisual}%`}</strong>
            </div>
          </article>

          <article className="modules-card">
            <h2>Módulos recomendados</h2>

            {cargando ? (
              <p className="modules-empty-text">Cargando recomendaciones...</p>
            ) : modulosRecomendados.length > 0 ? (
              <div className="modules-list">
                {modulosRecomendados.map((modulo) => (
                  <button
                    className="module-item"
                    type="button"
                    key={modulo.nombre}
                    onClick={() => irARuta(modulo.ruta)}
                  >
                    <img src={modulo.icono} alt={modulo.nombre} />
                    <span>{modulo.nombre}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="modules-empty-box">
                <p>Aún no hay módulos recomendados.</p>
                <span>
                  Inicia una actividad para que Nova pueda sugerirte qué
                  practicar según tu progreso.
                </span>
                <button
                  type="button"
                  onClick={() => irARuta("/seleccion-mundos")}
                >
                  Explorar mundos
                </button>
              </div>
            )}
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

export default Dashboard;