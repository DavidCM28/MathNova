import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerPerfilAlumno,
  obtenerProgresoAlumno,
} from "../../services/alumnoService";

import type { Alumno, Actividad } from "../../services/alumnoService";

import "../Dashboard/Dashboard.css";
import "./PerfilAlumno.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import alexPerfil from "../../assets/alex-perfil.png";
import estrellasPerfil from "../../assets/estrellas-totales-perfil.png";
import zorritoPerfilAlumno from "../../assets/zorrito_perfil_alumno.png";

import mundo1 from "../../assets/mundo-1-MathNumbers.png";
import mundo2 from "../../assets/mundo-2-MathGeometry.png";
import mundo3 from "../../assets/mundo-3-MathData.png";

import primerosPasos from "../../assets/primeros-pasos (2).png";
import explorador from "../../assets/explorador.png";
import calculadorAgil from "../../assets/calculador-agil.png";
import constancia from "../../assets/constancia.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHome,
  FiCalendar,
  FiClock,
  FiArrowUpRight,
  FiCheckCircle,
  FiCheck,
  FiHelpCircle,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup, GiFlame } from "react-icons/gi";

type MundoCompletado = {
  id: number;
  nombre: string;
  completado: boolean;
};

type InsigniaAlumno = {
  id: number;
  nombre: string;
  estado: string;
};

type AlumnoPerfil = Alumno & {
  miembro_desde?: string;
  grado?: string;
  escuela?: string;
  nivel?: number;
  titulo?: string;
  estrellas_totales?: number;
  racha_actual?: number;
  lecciones_completadas?: number;
  tiempo_estudio_segundos?: number;
  tiempo_estudio?: string;
  progreso_general?: number;
  mundos_completados?: MundoCompletado[];
  insignias?: InsigniaAlumno[];
};

type ActividadPerfil = Actividad & {
  updated_at?: string | number | Date | null;
};

function PerfilAlumno() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] = useState<AlumnoPerfil | null>(null);
  const [actividades, setActividades] = useState<ActividadPerfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        setCargando(true);
        setError("");

        const [perfilData, actividadesData] = await Promise.all([
          obtenerPerfilAlumno(),
          obtenerProgresoAlumno(),
        ]);

        setAlumno(perfilData as AlumnoPerfil);
        setActividades(actividadesData as ActividadPerfil[]);
      } catch (error) {
        console.error("Error al cargar perfil del alumno:", error);
        setError("No se pudo cargar el perfil del alumno.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
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

  const formatearFecha = (fecha?: string) => {
    if (!fecha) {
      return "Sin fecha";
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return "Sin fecha";
    }

    return fechaConvertida.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
  };

  const formatearFechaActividad = (
    fecha: string | number | Date | null | undefined
  ) => {
    if (!fecha) {
      return "Reciente";
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return "Reciente";
    }

    return fechaConvertida.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerImagenMundo = (nombre: string) => {
    const imagenes: Record<string, string> = {
      MathNumbers: mundo1,
      MathGeometry: mundo2,
      MathData: mundo3,
    };

    return imagenes[nombre] || mundo1;
  };

  const obtenerImagenInsignia = (nombre: string) => {
    const imagenes: Record<string, string> = {
      "Primeros Pasos": primerosPasos,
      Explorador: explorador,
      "Cálculo Ágil": calculadorAgil,
      Constancia: constancia,
    };

    return imagenes[nombre] || primerosPasos;
  };

  const actividadReciente = actividades
    .filter(
      (actividad) =>
        actividad.estado === "completada" || actividad.estado === "en_curso"
    )
    .slice(0, 3);

  const textoActividad = (actividad: ActividadPerfil) => {
    if (actividad.estado === "completada") {
      return `Completaste la actividad “${actividad.titulo}”`;
    }

    return `Iniciaste la actividad “${actividad.titulo}”`;
  };

  const iconoActividad = (actividad: ActividadPerfil) => {
    if (actividad.estado === "completada") {
      return <FiCheckCircle className="green-icon" />;
    }

    return <FiBookOpen className="blue-icon" />;
  };

  const mundosCompletados: MundoCompletado[] =
  alumno?.mundos_completados ?? [];

const insignias: InsigniaAlumno[] =
  alumno?.insignias ?? [];

  const segundosEstudio = alumno?.tiempo_estudio_segundos ?? 0;
  const leccionesCompletadas = alumno?.lecciones_completadas ?? 0;
  const progresoGeneral = alumno?.progreso_general ?? 0;

  const progresoMetaHoras = Math.min((segundosEstudio / 18000) * 100, 100);
  const progresoMetaActividades = Math.min((progresoGeneral / 100) * 100, 100);

  if (cargando) {
    return (
      <main className="dashboard-page perfil-layout">
        <section className="perfil-content">
          <header className="perfil-title">
            <h1>Cargando perfil...</h1>
            <p>Estamos preparando tu información.</p>
          </header>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page perfil-layout">
        <section className="perfil-content">
          <header className="perfil-title">
            <h1>Perfil del alumno</h1>
            <p>{error}</p>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page perfil-layout">
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

          <button className="menu-item active">
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

        <div className="perfil-menu-fox-box">
          <img
            src={zorritoPerfilAlumno}
            alt="Zorrito perfil alumno"
            className="perfil-menu-fox"
          />
        </div>
      </aside>

      <section className="perfil-content">
        <header className="perfil-title">
          <h1>Perfil del alumno</h1>
          <p>Consulta tu información y tus logros.</p>
        </header>

        <section className="perfil-top-grid">
          <article className="perfil-main-card">
            <img
              src={alexPerfil}
              alt={alumno?.nombre_completo || "Alumno"}
              className="alex-img"
            />

            <div className="perfil-name">
              <h2>{alumno?.nombre_completo ?? "Alumno"}</h2>

              <span>
                ⭐ Nivel {alumno?.nivel ?? 1} •{" "}
                {alumno?.titulo ?? "Aprendiz Nova"}
              </span>

              <div className="racha-box">
                <GiFlame />
                <div>
                  <p>Racha actual</p>
                  <strong>{alumno?.racha_actual ?? 0} días</strong>
                </div>
              </div>
            </div>

            <div className="perfil-divider"></div>

            <div className="estrellas-box">
              <p>Estrellas totales</p>

              <div>
                <img src={estrellasPerfil} alt="Estrellas" />
                <strong>{alumno?.estrellas_totales ?? 0}</strong>
              </div>

              <span>
                {(alumno?.estrellas_totales ?? 0) > 0
                  ? "¡Sigue así, vas increíble!"
                  : "Completa actividades para ganar estrellas"}
              </span>
            </div>
          </article>

          <article className="mini-card green-mini">
            <h3>Lecciones completadas</h3>
            <strong>{leccionesCompletadas}</strong>
            <FiBookOpen className="card-icon" />
          </article>

          <article className="mini-card blue-mini">
            <h3>Tiempo de estudio</h3>
            <strong>{alumno?.tiempo_estudio ?? "0m"}</strong>
            <FiClock />
          </article>

          <article className="mini-card purple-mini">
            <h3>Progreso general</h3>
            <strong>{progresoGeneral}%</strong>
            <FiArrowUpRight />
          </article>
        </section>

        <section className="perfil-middle-grid">
          <article className="perfil-panel datos-panel">
            <h2>Datos del alumno</h2>

            <div className="dato-row">
              <FiUser />
              <span>Nombre completo</span>
              <strong>{alumno?.nombre_completo ?? "Sin nombre"}</strong>
            </div>

            <div className="dato-row">
              <FiBookOpen />
              <span>Grado</span>
              <strong>{alumno?.grado ?? "Sin asignar"}</strong>
            </div>

            <div className="dato-row">
              <FiHome />
              <span>Escuela</span>
              <strong>{alumno?.escuela ?? "MathNova"}</strong>
            </div>

            <div className="dato-row">
              <FiCalendar />
              <span>Miembro desde</span>
              <strong>{formatearFecha(alumno?.miembro_desde)}</strong>
            </div>
          </article>

          <article className="perfil-panel mundos-panel">
            <h2>Mundos completados</h2>

            <div className="mundos-list">
              {mundosCompletados.map((mundo) => (
                <div className="mundo-item" key={mundo.id}>
                  <div className="mundo-img-box">
                    <img
                      src={obtenerImagenMundo(mundo.nombre)}
                      alt={mundo.nombre}
                    />

                    {mundo.completado && (
                      <span className="check-badge">
                        <FiCheck />
                      </span>
                    )}
                  </div>

                  <span>{mundo.nombre}</span>
                </div>
              ))}
            </div>

            <button
              className="ver-link"
              onClick={() => irARuta("/seleccion-mundos")}
            >
              Ver todos los mundos →
            </button>
          </article>

          <article className="perfil-panel insignias-panel">
            <div className="panel-header">
              <h2>Insignias destacadas</h2>

              <button
                className="ver-link"
                onClick={() => irARuta("/recompensas")}
              >
                Ver todas
              </button>
            </div>

            <div className="insignias-list">
              {insignias.map((insignia) => (
                <div className="insignia-item" key={insignia.id}>
                  <img
                    src={obtenerImagenInsignia(insignia.nombre)}
                    alt={insignia.nombre}
                  />

                  <strong>{insignia.nombre}</strong>
                  <span>{insignia.estado}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="perfil-bottom-grid">
          <article className="perfil-panel actividad-panel">
            <h2>Actividad reciente</h2>

            {actividadReciente.length > 0 ? (
              actividadReciente.map((actividad) => (
                <div className="actividad-row" key={actividad.id}>
                  {iconoActividad(actividad)}

                  <span>{textoActividad(actividad)}</span>

                  <small>{formatearFechaActividad(actividad.updated_at)}</small>

                  <strong>⭐ +{actividad.puntaje || 0}</strong>
                </div>
              ))
            ) : (
              <div className="recent-empty-box">
                <p>Aún no tienes actividad reciente.</p>
                <span>
                  Cuando inicies o completes actividades, aparecerán aquí
                  automáticamente.
                </span>
              </div>
            )}

            <button
              className="ver-link"
              onClick={() => irARuta("/seleccion-mundos")}
            >
              Ver toda tu actividad →
            </button>
          </article>

          <article className="perfil-panel metas-panel">
            <div className="panel-header">
              <h2>Metas de la semana</h2>
              <span>Semana actual</span>
            </div>

            <div className="meta-row">
              <FiBookOpen />
              <span>Completa 10 lecciones</span>

              <div className="meta-bar">
                <span
                  style={{
                    width: `${Math.min(
                      (leccionesCompletadas / 10) * 100,
                      100
                    )}%`,
                  }}
                ></span>
              </div>

              <strong>{leccionesCompletadas}/10</strong>
              <b>⭐ +100</b>
            </div>

            <div className="meta-row">
              <FiClock />
              <span>Estudia 5 horas esta semana</span>

              <div className="meta-bar">
                <span style={{ width: `${progresoMetaHoras}%` }}></span>
              </div>

              <strong>{alumno?.tiempo_estudio ?? "0m"} / 5h</strong>
              <b>⭐ +100</b>
            </div>

            <div className="meta-row">
              <FiEdit />
              <span>Resuelve 20 actividades</span>

              <div className="meta-bar">
                <span style={{ width: `${progresoMetaActividades}%` }}></span>
              </div>

              <strong>{Math.round((progresoGeneral / 100) * 20)}/20</strong>
              <b>⭐ +100</b>
            </div>

            <button
              className="ver-link"
              onClick={() => irARuta("/estadisticas")}
            >
              Ver todas mis metas →
            </button>
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

export default PerfilAlumno;