import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Recompensas.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import estrellasTotalesIcon from "../../assets/estrellas-totales2.png";
import insigniasGanadasIcon from "../../assets/insignias-ganadas.png";
import nivelActualIcon from "../../assets/nivel-actual.png";
import rachaActualIcon from "../../assets/racha-actual.png";

import primerosPasos from "../../assets/primeros-pasos.png";
import diezLogros from "../../assets/diez-logros.png";
import aprendizDedicado from "../../assets/aprendiz-dedicado.png";
import menteMatematica from "../../assets/mente-matematica.png";
import estrellaConstante from "../../assets/estrella-constante.png";

import avatares from "../../assets/avatares.png";
import marcos from "../../assets/marcos.png";
import stickers from "../../assets/stickers.png";
import trofeos from "../../assets/trofeos.png";
import proximaRecompensa from "../../assets/proxima-recompensa.png";
import avatarAstroNova from "../../assets/avatar-astro-nova.png";
import heroRecompensas from "../../assets/hero-banner-recompensas.png";
import estrellaRe from "../../assets/estrella-re.png";
import zorritoRecompensa from "../../assets/zorrito_recompensa.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiArrowRight,
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

function Recompensas() {
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
    const cargarRecompensas = async () => {
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
        console.error("Error al cargar recompensas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarRecompensas();
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

  const estrellasTotales = numero(alumno?.estrellas_totales);
  const nivelActual = numero(alumno?.nivel);
  const tituloNivel = alumno?.titulo || "Aprendiz Nova";
  const rachaActual = numero(alumno?.racha_actual);
  const completadas = numero(estadisticas?.completadas);
  const promedio = numero(estadisticas?.promedio);
  const progresoGeneral = numero(estadisticas?.progreso_general);

  const insignias = useMemo(
    () => [
      {
        id: 1,
        nombre: "Primeros Pasos",
        descripcion: "Completa tu primera lección",
        imagen: primerosPasos,
        desbloqueada: completadas >= 1,
      },
      {
        id: 2,
        nombre: "Diez Logros",
        descripcion: "Completa 10 lecciones",
        imagen: diezLogros,
        desbloqueada: completadas >= 10,
      },
      {
        id: 3,
        nombre: "Aprendiz Dedicado",
        descripcion: "Completa 5 actividades",
        imagen: aprendizDedicado,
        desbloqueada: completadas >= 5,
      },
      {
        id: 4,
        nombre: "Mente Matemática",
        descripcion: "Obtén promedio mayor a 80%",
        imagen: menteMatematica,
        desbloqueada: promedio >= 80,
      },
      {
        id: 5,
        nombre: "Estrella Constante",
        descripcion: "Logra una racha de 7",
        imagen: estrellaConstante,
        desbloqueada: rachaActual >= 7,
      },
    ],
    [completadas, promedio, rachaActual]
  );

  const insigniasGanadas = insignias.filter(
    (insignia) => insignia.desbloqueada
  ).length;

  const recompensasDesbloqueables = [
    {
      nombre: "Avatares",
      obtenidas: Math.min(Math.floor(estrellasTotales / 50), 12),
      total: 12,
      imagen: avatares,
    },
    {
      nombre: "Marcos",
      obtenidas: Math.min(Math.floor(completadas / 2), 10),
      total: 10,
      imagen: marcos,
    },
    {
      nombre: "Stickers",
      obtenidas: Math.min(Math.floor(estrellasTotales / 25), 20),
      total: 20,
      imagen: stickers,
    },
    {
      nombre: "Trofeos",
      obtenidas: Math.min(Math.floor(nivelActual / 2), 8),
      total: 8,
      imagen: trofeos,
    },
  ];

  const metaEstrellas = 1000;
  const estrellasFaltantes = Math.max(metaEstrellas - estrellasTotales, 0);
  const progresoRecompensa = Math.min(
    Math.round((estrellasTotales / metaEstrellas) * 100),
    100
  );

  const textoMotivacion =
    estrellasTotales > 0
      ? "¡Estás muy cerca de desbloquear algo increíble!"
      : "Completa actividades para empezar a ganar recompensas.";

  return (
    <main className="recompensas-page">
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

          <button
            className="menu-item active"
            onClick={() => irARuta("/recompensas")}
          >
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

        <div className="recompensa-menu-fox-box">
          <img
            src={zorritoRecompensa}
            alt="Zorrito recompensas"
            className="recompensa-menu-fox"
          />
        </div>
      </aside>

      <section className="recompensas-content">
        <header className="recompensas-header">
          <div>
            <h1>Recompensas</h1>
            <p>Celebra tus logros y desbloquea nuevos premios.</p>
          </div>

          <img
            src={heroRecompensas}
            alt="Recompensas"
            className="hero-rewards-img"
          />
        </header>

        <section className="rewards-stats">
          <article className="reward-stat yellow-stat">
            <div>
              <h3>Estrellas totales</h3>
              <strong>{cargando ? "..." : estrellasTotales}</strong>
              <p>
                {estrellasTotales > 0
                  ? "¡Sigue sumando estrellas!"
                  : "Aún no tienes estrellas"}
              </p>
            </div>

            <div className="icon-circle">
              <img src={estrellasTotalesIcon} alt="Estrellas" />
            </div>
          </article>

          <article className="reward-stat blue-stat">
            <div>
              <h3>Insignias ganadas</h3>
              <strong>{cargando ? "..." : insigniasGanadas}</strong>
              <p>
                {insigniasGanadas > 0
                  ? "¡Vas por un gran camino!"
                  : "Completa actividades para ganar insignias"}
              </p>
            </div>

            <div className="icon-circle">
              <img src={insigniasGanadasIcon} alt="Insignias" />
            </div>
          </article>

          <article className="reward-stat purple-stat">
            <div>
              <h3>Nivel actual</h3>
              <strong>{cargando ? "..." : `Nivel ${nivelActual || 1}`}</strong>
              <p>{tituloNivel}</p>
            </div>

            <div className="icon-circle">
              <img src={nivelActualIcon} alt="Nivel" />
            </div>
          </article>

          <article className="reward-stat green-stat">
            <div>
              <h3>Racha actual</h3>
              <strong>{cargando ? "..." : rachaActual}</strong>
              <p>{rachaActual > 0 ? "¡Sigue así!" : "Inicia tu racha"}</p>
            </div>

            <div className="icon-circle">
              <img src={rachaActualIcon} alt="Racha" />
            </div>
          </article>
        </section>

        <section className="main-rewards-grid">
          <article className="panel badges-panel">
            <div className="panel-head">
              <h2>Insignias ganadas</h2>
              <button onClick={() => irARuta("/estadisticas")}>
                Ver todas <FiArrowRight />
              </button>
            </div>

            <div className="badges-grid">
              {insignias.map((insignia) => (
                <div
                  className="badge-card"
                  key={insignia.id}
                  style={{
                    opacity: insignia.desbloqueada ? 1 : 0.45,
                    filter: insignia.desbloqueada
                      ? "none"
                      : "grayscale(0.9)",
                  }}
                >
                  <img src={insignia.imagen} alt={insignia.nombre} />
                  <h4>{insignia.nombre}</h4>
                  <p>
                    {insignia.desbloqueada
                      ? "Insignia desbloqueada"
                      : insignia.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel unlock-panel">
            <div className="panel-head">
              <h2>Recompensas desbloqueables</h2>
              <button onClick={() => irARuta("/estadisticas")}>
                Ver todas <FiArrowRight />
              </button>
            </div>

            <div className="unlock-grid">
              {recompensasDesbloqueables.map((recompensa) => (
                <div className="unlock-card" key={recompensa.nombre}>
                  <h4>{recompensa.nombre}</h4>
                  <strong>
                    {cargando ? "..." : recompensa.obtenidas}{" "}
                    <span>/ {recompensa.total}</span>
                  </strong>
                  <img src={recompensa.imagen} alt={recompensa.nombre} />
                </div>
              ))}
            </div>
          </article>

          <article className="panel next-panel">
            <h2>Próxima recompensa</h2>
            <p>{textoMotivacion}</p>

            <div className="reward-progress-wrap">
              <div className="reward-progress-line">
                <span className="reward-check reward-check-1">
                  {progresoRecompensa >= 20 ? "✓" : ""}
                </span>
                <span className="reward-check reward-check-2">
                  {progresoRecompensa >= 40 ? "✓" : ""}
                </span>
                <span className="reward-check reward-check-3">
                  {progresoRecompensa >= 60 ? "✓" : ""}
                </span>
                <span className="reward-dot"></span>
                <span
                  className="reward-green-line"
                  style={{ width: `${progresoRecompensa}%` }}
                ></span>
              </div>

              <div className="reward-gift-circle">
                <img src={proximaRecompensa} alt="Próxima recompensa" />
              </div>

              <div className="reward-empty-circle"></div>

              <div className="reward-missing">
                <span>Faltan</span>
                <b>{cargando ? "..." : estrellasFaltantes}</b>
                <img src={estrellaRe} alt="Estrella" />
                <span>estrellas</span>
              </div>
            </div>

            <h3>
              <span>{cargando ? "..." : estrellasTotales}</span> /{" "}
              {metaEstrellas} estrellas
            </h3>
          </article>

          <article className="featured-reward">
            <div>
              <h3>
                Recompensa destacada <span>Épica</span>
              </h3>
              <h2>Avatar Astro Nova</h2>
              <p>
                {progresoRecompensa >= 100
                  ? "¡Ya puedes desbloquear este avatar exclusivo!"
                  : "Un avatar exclusivo para los exploradores más dedicados."}
              </p>
              <button onClick={() => irARuta("/estadisticas")}>
                Ver cómo obtenerla
              </button>
            </div>

            <img src={avatarAstroNova} alt="Avatar Astro Nova" />
          </article>
        </section>

        <footer className="recompensas-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button className="footer-icon-btn" onClick={cerrarSesion}>
              <FiLogOut className="logout-icon" />
            </button>
            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Recompensas;