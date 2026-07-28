import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SeleccionMundos.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-seleccion-mundo.png";
import estrellaIcon from "../../assets/estrella-sigue-explorando.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import mundoGeometry from "../../assets/mundo-2-MathGeometry.png";
import mundoData from "../../assets/mundo-3-MathData.png";
import zorritoFooter from "../../assets/zorrito-footer.png";
import zorritoHola from "../../assets/zorrito-hola-explorador.png";
import zorritoSeleccion from "../../assets/zorrito_seleccion_mundo.png";

import {
  FiBarChart2,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiRocket,
  GiTrophyCup,
} from "react-icons/gi";

import { obtenerPerfilAlumno } from "../../services/alumnoService";
import type { Alumno } from "../../services/alumnoService";

import {
  obtenerIdUsuarioAutenticado,
  obtenerResumenAlumno,
} from "../../services/progresoService";

import type {
  MundoResumen,
  ResumenAlumno,
} from "../../services/progresoService";

import {
  clearAuthSession,
  getDisplayName,
  isGuestSession,
} from "../../utils/authSession";

type PerfilRespuesta = {
  perfil?: Alumno;
};

type MundoVisual = {
  progreso: number;
  completadas: number;
  intentadas: number;
  estrellas: number;
  xp: number;
};

const numeroSeguro = (
  valor: number | string | null | undefined,
): number => {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
};

const limitarPorcentaje = (
  valor: number | string | null | undefined,
): number => {
  return Math.min(Math.max(Math.round(numeroSeguro(valor)), 0), 100);
};

const normalizarTexto = (valor: string): string => {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");
};

const extraerPerfil = (respuesta: unknown): Alumno | null => {
  if (typeof respuesta !== "object" || respuesta === null) {
    return null;
  }

  const datos = respuesta as PerfilRespuesta & Record<string, unknown>;

  if (datos.perfil && typeof datos.perfil === "object") {
    return datos.perfil;
  }

  return datos as Alumno;
};

function SeleccionMundos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [resumen, setResumen] = useState<ResumenAlumno | null>(null);
  const [mundos, setMundos] = useState<MundoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const navigate = useNavigate();
  const modoInvitado = isGuestSession();

  const cargarDatos = useCallback(async () => {
    const invitado = isGuestSession();

    if (invitado) {
      setAlumno(null);
      setResumen(null);
      setMundos([]);
      setErrorCarga("");
      setCargando(false);
      return;
    }

    const idUsuario = obtenerIdUsuarioAutenticado();

    if (!idUsuario) {
      clearAuthSession();
      navigate("/login", { replace: true });
      return;
    }

    setCargando(true);
    setErrorCarga("");

    const [resultadoPerfil, resultadoResumen] = await Promise.allSettled([
      obtenerPerfilAlumno(),
      obtenerResumenAlumno(idUsuario),
    ]);

    let huboError = false;

    if (resultadoPerfil.status === "fulfilled") {
      setAlumno(extraerPerfil(resultadoPerfil.value));
    } else {
      huboError = true;
      console.error(
        "No se pudo cargar el perfil del alumno:",
        resultadoPerfil.reason,
      );
    }

    if (resultadoResumen.status === "fulfilled") {
      setResumen(resultadoResumen.value.resumen ?? null);
      setMundos(
        Array.isArray(resultadoResumen.value.mundos)
          ? resultadoResumen.value.mundos
          : [],
      );
    } else {
      huboError = true;
      console.error(
        "No se pudo cargar el resumen de progreso:",
        resultadoResumen.reason,
      );
    }

    setErrorCarga(
      huboError
        ? "Algunos datos no pudieron actualizarse. Revisa que el servidor esté encendido."
        : "",
    );

    setCargando(false);
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    void cargarDatos();

    const actualizarAlVolver = () => {
      void cargarDatos();
    };

    const actualizarAlMostrar = () => {
      if (document.visibilityState === "visible") {
        void cargarDatos();
      }
    };

    window.addEventListener("focus", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlMostrar);

    return () => {
      window.removeEventListener("focus", actualizarAlVolver);
      document.removeEventListener("visibilitychange", actualizarAlMostrar);
    };
  }, [cargarDatos]);

  const buscarResumenMundo = useCallback(
    (nombresAceptados: string[]): MundoResumen | null => {
      const nombresNormalizados = nombresAceptados.map(normalizarTexto);

      return (
        mundos.find((mundo) => {
          const nombreMundo = normalizarTexto(mundo.mundo ?? "");

          return nombresNormalizados.some(
            (nombre) =>
              nombreMundo.includes(nombre) || nombre.includes(nombreMundo),
          );
        }) ?? null
      );
    },
    [mundos],
  );

  const construirMundoVisual = useCallback(
    (nombresAceptados: string[]): MundoVisual => {
      const mundo = buscarResumenMundo(nombresAceptados);

      return {
        progreso: limitarPorcentaje(mundo?.precision),
        completadas: numeroSeguro(mundo?.completadas),
        intentadas: numeroSeguro(mundo?.intentadas),
        estrellas: numeroSeguro(mundo?.estrellas),
        xp: numeroSeguro(mundo?.xp),
      };
    },
    [buscarResumenMundo],
  );

  const mundoNumbersResumen = useMemo(
    () => construirMundoVisual(["mathnumbers", "numbers", "numeros"]),
    [construirMundoVisual],
  );

  const mundoGeometryResumen = useMemo(
    () => construirMundoVisual(["mathgeometry", "geometry", "geometria"]),
    [construirMundoVisual],
  );

  const mundoDataResumen = useMemo(
    () => construirMundoVisual(["mathdata", "data", "estadistica"]),
    [construirMundoVisual],
  );

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const estrellasTotales = modoInvitado
    ? 0
    : numeroSeguro(
        resumen?.estrellas_totales ??
          resumen?.estrellas_ganadas ??
          alumno?.estrellas_totales,
      );

  const nombreAlumno = modoInvitado
    ? getDisplayName()
    : alumno?.nombre_completo?.trim().split(/\s+/)[0] ||
      alumno?.usuario ||
      getDisplayName() ||
      "Explorador";

  const descripcionMundo = (mundo: MundoVisual): string => {
    if (cargando) {
      return "Cargando";
    }

    if (mundo.completadas > 0) {
      return `${mundo.completadas} completada${
        mundo.completadas === 1 ? "" : "s"
      }`;
    }

    if (mundo.intentadas > 0) {
      return `${mundo.intentadas} intentada${
        mundo.intentadas === 1 ? "" : "s"
      }`;
    }

    return "Sin avance";
  };

  return (
    <main className="mundos-page">
      <button
        type="button"
        className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen((estadoActual) => !estadoActual)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="sidebar-logo" />

        <nav className="sidebar-menu">
          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button type="button" className="menu-item active">
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mundos-sidebar-bottom">
          <div className="hello-box">
            <img src={zorritoHola} alt="Zorrito explorador" />
            <span>¡Hola, {nombreAlumno}!</span>
          </div>

          <div className="mundos-sidebar-fox-box">
            <img
              src={zorritoSeleccion}
              alt="Zorrito selección de mundo"
              className="mundos-sidebar-fox"
            />
          </div>
        </div>
      </aside>

      <section className="mundos-content">
        <section className="mundos-hero">
          <div className="mundos-title">
            <h1>Selección de mundos matemáticos</h1>

            <p>
              {modoInvitado
                ? "Explora los mundos disponibles. Para contestar actividades necesitarás iniciar sesión."
                : "Explora, aprende y conquista nuevos mundos."}
            </p>

            {modoInvitado && (
              <div className="guest-world-alert">
                Estás en modo espectador. Puedes ver los mundos y sus
                actividades, pero para iniciar retos y guardar progreso necesitas
                iniciar sesión o crear una cuenta.
              </div>
            )}

            {errorCarga && !modoInvitado && (
              <div className="guest-world-alert">{errorCarga}</div>
            )}
          </div>

          <img
            src={heroBanner}
            alt="Banner mundos matemáticos"
            className="mundos-hero-img"
          />

          <article className="mundos-stars-card">
            <h3>Estrellas totales</h3>

            <div className="mundos-stars-row">
              <strong>{cargando ? "..." : estrellasTotales}</strong>
              <span>⭐</span>
            </div>

            <p>
              {modoInvitado
                ? "Inicia sesión para ganar estrellas"
                : estrellasTotales > 0
                  ? "Sigue explorando y gana más estrellas"
                  : "Completa actividades para ganar estrellas"}
            </p>
          </article>
        </section>

        <section className="worlds-grid">
          <article className="world-card">
            <div className="world-image green-world">
              <h2>math Numbers</h2>
              <img src={mundoNumbers} alt="Math Numbers" />
            </div>

            <div className="world-progress">
              <div className="level-pill green-pill">
                <strong>{descripcionMundo(mundoNumbersResumen)}</strong>
                <span>{cargando ? "..." : `${mundoNumbersResumen.progreso}%`}</span>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progreso de Math Numbers"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={mundoNumbersResumen.progreso}
              >
                <span
                  className="progress-fill green-fill"
                  style={{ width: `${mundoNumbersResumen.progreso}%` }}
                />
              </div>
            </div>

            <button type="button" onClick={() => irARuta("/temas/numeros")}>
              <GiRocket />
              {mundoNumbersResumen.intentadas > 0
                ? "Continuar math Numbers"
                : "Explorar math Numbers"}
            </button>
          </article>

          <article className="world-card">
            <div className="world-image orange-world">
              <h2>math Geometry</h2>
              <img src={mundoGeometry} alt="Math Geometry" />
            </div>

            <div className="world-progress">
              <div className="level-pill orange-pill">
                <strong>{descripcionMundo(mundoGeometryResumen)}</strong>
                <span>{cargando ? "..." : `${mundoGeometryResumen.progreso}%`}</span>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progreso de Math Geometry"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={mundoGeometryResumen.progreso}
              >
                <span
                  className="progress-fill orange-fill"
                  style={{ width: `${mundoGeometryResumen.progreso}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              <GiRocket />
              {mundoGeometryResumen.intentadas > 0
                ? "Continuar math Geometry"
                : "Explorar math Geometry"}
            </button>
          </article>

          <article className="world-card">
            <div className="world-image blue-world">
              <h2>math Data</h2>
              <img src={mundoData} alt="Math Data" />
            </div>

            <div className="world-progress">
              <div className="level-pill blue-pill">
                <strong>{descripcionMundo(mundoDataResumen)}</strong>
                <span>{cargando ? "..." : `${mundoDataResumen.progreso}%`}</span>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progreso de Math Data"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={mundoDataResumen.progreso}
              >
                <span
                  className="progress-fill blue-fill"
                  style={{ width: `${mundoDataResumen.progreso}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => irARuta("/actividades-math-data")}
            >
              <GiRocket />
              {mundoDataResumen.intentadas > 0
                ? "Continuar math Data"
                : "Explorar math Data"}
            </button>
          </article>
        </section>

        <section className="reward-banner">
          <img src={estrellaIcon} alt="Estrella" />

          <div>
            <h2>¡Cada mundo tiene nuevos retos y recompensas!</h2>
            <p>
              Explora todos los mundos y conviértete en un Maestro de las
              Matemáticas.
            </p>
          </div>

          <img
            src={zorritoFooter}
            alt="Zorrito saludando"
            className="footer-fox"
          />
        </section>

        <footer className="mundos-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button
              type="button"
              className="footer-icon-btn"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
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

export default SeleccionMundos;