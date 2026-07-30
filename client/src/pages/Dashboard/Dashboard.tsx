import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Dashboard.css";

import Introduccion from "../Introduccion/Introduccion";

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
  FiArrowRight,
  FiBarChart2,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPlayCircle,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

import { obtenerPerfilAlumno } from "../../services/alumnoService";

import {
  obtenerIdUsuarioAutenticado,
  obtenerProgresoAlumno as obtenerProgresoReal,
  obtenerResumenAlumno,
} from "../../services/progresoService";

import type {
  ProgresoActividad,
  ResumenAlumno,
} from "../../services/progresoService";

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
  correo_electronico?: string;
  usuario?: string | null;
  rol?: string;
  estado?: boolean;
  estrellas_totales?: number;
  racha_actual?: number;
};

type PerfilResponse = {
  perfil?: Alumno;
  alumno?: Alumno;
  usuario?: Alumno;
};

type ModuloRecomendado = {
  nombre: string;
  icono: string;
  ruta: string;
};

type EstadoDashboard = {
  mostrarIntroduccion?: boolean;
};

const RUTAS_ACTIVIDAD: Record<string, string> = {
  "mathnumbers-cofre-bienvenida":
    "/actividades/mathnumbers/cofre-bienvenida",

  "cofre-bienvenida":
    "/actividades/mathnumbers/cofre-bienvenida",

  cofre_bienvenida:
    "/actividades/mathnumbers/cofre-bienvenida",

  "mathnumbers-radar-supervivencia":
    "/actividades/mathnumbers/radar-supervivencia",

  "radar-supervivencia":
    "/actividades/mathnumbers/radar-supervivencia",

  radar_supervivencia:
    "/actividades/mathnumbers/radar-supervivencia",

  "mathnumbers-ascensor-bunker":
    "/actividades/mathnumbers/ascensor-bunker",

  "ascensor-bunker":
    "/actividades/mathnumbers/ascensor-bunker",

  ascensor_bunker:
    "/actividades/mathnumbers/ascensor-bunker",

  "mathnumbers-escuadron-tactico":
    "/actividades/mathnumbers/escuadron-tactico",

  "escuadron-tactico":
    "/actividades/mathnumbers/escuadron-tactico",

  escuadron_tactico:
    "/actividades/mathnumbers/escuadron-tactico",
};

const numeroSeguro = (
  valor: number | string | null | undefined,
): number => {
  const convertido = Number(valor ?? 0);

  return Number.isFinite(convertido)
    ? convertido
    : 0;
};

const limitarPorcentaje = (
  valor: number,
): number => {
  return Math.min(
    100,
    Math.max(0, Math.round(valor)),
  );
};

const obtenerFechaActividad = (
  actividad: ProgresoActividad,
): number => {
  const fecha =
    actividad.fecha_ultimo_intento ||
    actividad.fecha_inicio ||
    "";

  const tiempo = Date.parse(fecha);

  return Number.isNaN(tiempo)
    ? 0
    : tiempo;
};

const obtenerRutaActividad = (
  actividad?: ProgresoActividad,
): string => {
  if (!actividad) {
    return "/seleccion-mundos";
  }

  return (
    RUTAS_ACTIVIDAD[actividad.actividad_codigo] ||
    "/seleccion-mundos"
  );
};

const obtenerIconoActividad = (
  actividad?: ProgresoActividad,
): string => {
  const mundo =
    actividad?.mundo?.toLowerCase() ?? "";

  if (
    mundo.includes("geometry") ||
    mundo.includes("geometr")
  ) {
    return geometriaIcon;
  }

  if (mundo.includes("estad")) {
    return estadisticaIcon;
  }

  if (
    mundo.includes("number") ||
    mundo.includes("número")
  ) {
    return numerosIcon;
  }

  return algebraIcon;
};

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const estadoDashboard =
    location.state as EstadoDashboard | null;

  const modoInvitado = isGuestSession();

  const [mostrarIntroduccion, setMostrarIntroduccion] =
    useState(
      estadoDashboard?.mostrarIntroduccion === true &&
        !modoInvitado,
    );

  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] =
    useState<Alumno | null>(null);

  const [resumen, setResumen] =
    useState<ResumenAlumno | null>(null);

  const [actividades, setActividades] = useState<
    ProgresoActividad[]
  >([]);

  const [cargando, setCargando] = useState(true);

  const [
    errorDashboard,
    setErrorDashboard,
  ] = useState("");

  /*
   * Cierra el video emergente y limpia el estado
   * enviado desde el inicio de sesión.
   */
  const cerrarIntroduccion = useCallback(() => {
    setMostrarIntroduccion(false);

    navigate(
      `${location.pathname}${location.search}`,
      {
        replace: true,
        state: null,
      },
    );
  }, [
    location.pathname,
    location.search,
    navigate,
  ]);

  /*
   * Detecta cuando el login solicita mostrar
   * nuevamente la introducción.
   */
  useEffect(() => {
    if (
      estadoDashboard?.mostrarIntroduccion === true &&
      !modoInvitado
    ) {
      setMostrarIntroduccion(true);
    }
  }, [
    estadoDashboard?.mostrarIntroduccion,
    modoInvitado,
  ]);

  const nombreAlumno =
    alumno?.nombre_completo ||
    alumno?.nombreCompleto ||
    alumno?.usuario ||
    alumno?.correo_electronico ||
    alumno?.correo;

  const nombreUsuario = nombreAlumno
    ? String(nombreAlumno)
        .trim()
        .split(/\s+/)[0]
    : getDisplayName();

  const cargarDashboard = useCallback(
    async () => {
      const invitado = isGuestSession();

      if (invitado) {
        setAlumno(null);
        setResumen(null);
        setActividades([]);
        setErrorDashboard("");
        setCargando(false);
        return;
      }

      const idUsuario =
        obtenerIdUsuarioAutenticado();

      if (!idUsuario) {
        clearAuthSession();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCargando(true);
      setErrorDashboard("");

      const [
        perfilResult,
        resumenResult,
        progresoResult,
      ] = await Promise.allSettled([
        obtenerPerfilAlumno(),
        obtenerResumenAlumno(idUsuario),
        obtenerProgresoReal(idUsuario),
      ]);

      let huboErrorProgreso = false;

      if (
        perfilResult.status === "fulfilled"
      ) {
        const perfilData =
          perfilResult.value as
            | PerfilResponse
            | Alumno;

        const perfilNormalizado =
          (perfilData as PerfilResponse)
            ?.perfil ||
          (perfilData as PerfilResponse)
            ?.alumno ||
          (perfilData as PerfilResponse)
            ?.usuario ||
          (perfilData as Alumno);

        setAlumno(
          perfilNormalizado ?? null,
        );
      } else {
        console.error(
          "No se pudo cargar el perfil del alumno:",
          perfilResult.reason,
        );
      }

      if (
        resumenResult.status === "fulfilled"
      ) {
        setResumen(
          resumenResult.value.resumen ??
            null,
        );
      } else {
        huboErrorProgreso = true;

        console.error(
          "No se pudo cargar el resumen del alumno:",
          resumenResult.reason,
        );
      }

      if (
        progresoResult.status ===
        "fulfilled"
      ) {
        setActividades(
          Array.isArray(
            progresoResult.value.progreso,
          )
            ? progresoResult.value
                .progreso
            : [],
        );
      } else {
        huboErrorProgreso = true;

        setActividades([]);

        console.error(
          "No se pudo cargar el progreso del alumno:",
          progresoResult.reason,
        );
      }

      if (huboErrorProgreso) {
        setErrorDashboard(
          "No se pudo actualizar todo tu progreso. Revisa que el servidor esté encendido.",
        );
      }

      setCargando(false);
    },
    [navigate],
  );

  /*
   * Impide que el contenido de atrás se mueva mientras
   * el menú o el video emergente están abiertos.
   */
  useEffect(() => {
    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      menuOpen || mostrarIntroduccion
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };
  }, [
    menuOpen,
    mostrarIntroduccion,
  ]);

  useEffect(() => {
    void cargarDashboard();
  }, [cargarDashboard]);

  useEffect(() => {
    const actualizarAlVolver = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void cargarDashboard();
      }
    };

    window.addEventListener(
      "focus",
      actualizarAlVolver,
    );

    document.addEventListener(
      "visibilitychange",
      actualizarAlVolver,
    );

    return () => {
      window.removeEventListener(
        "focus",
        actualizarAlVolver,
      );

      document.removeEventListener(
        "visibilitychange",
        actualizarAlVolver,
      );
    };
  }, [cargarDashboard]);

  const actividadesOrdenadas = useMemo(
    () =>
      [...actividades].sort(
        (primera, segunda) =>
          obtenerFechaActividad(segunda) -
          obtenerFechaActividad(primera),
      ),
    [actividades],
  );

  const actividadActual = useMemo(() => {
    const actividadNoCompletada =
      actividadesOrdenadas.find(
        (actividad) =>
          !actividad.completada,
      );

    return (
      actividadNoCompletada ??
      actividadesOrdenadas[0]
    );
  }, [actividadesOrdenadas]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const volverAVerIntroduccion = () => {
    setMenuOpen(false);
    setMostrarIntroduccion(true);
  };

  const leccionesCompletadas =
    numeroSeguro(
      resumen?.lecciones_completadas ??
        resumen?.actividades_completadas,
    );

  const estrellasTotales =
    numeroSeguro(
      resumen?.estrellas_totales ??
        resumen?.estrellas_ganadas ??
        alumno?.estrellas_totales,
    );

  const rachaActual = numeroSeguro(
    resumen?.racha_actual ??
      alumno?.racha_actual,
  );

  const promedioGeneral =
    limitarPorcentaje(
      numeroSeguro(
        resumen?.promedio_general ??
          resumen?.precision_promedio,
      ),
    );

  const progresoGeneral =
    limitarPorcentaje(
      numeroSeguro(
        resumen?.progreso_general ??
          promedioGeneral,
      ),
    );

  const progresoActividad =
    actividadActual
      ? actividadActual.completada
        ? 100
        : limitarPorcentaje(
            actividadActual.precision ||
              (numeroSeguro(
                actividadActual.aciertos,
              ) /
                Math.max(
                  1,
                  numeroSeguro(
                    actividadActual.total_preguntas,
                  ),
                )) *
                100,
          )
      : progresoGeneral;

  const progresoVisual = modoInvitado
    ? 0
    : limitarPorcentaje(
        progresoActividad,
      );

  const tituloActividad = modoInvitado
    ? "Explora MathNova"
    : actividadActual?.actividad_titulo ||
      "Comienza tu primera actividad";

  const rutaActividadActual =
    obtenerRutaActividad(
      actividadActual,
    );

  const iconoActividadActual =
    obtenerIconoActividad(
      actividadActual,
    );

  const tieneProgreso =
    actividadesOrdenadas.length > 0;

  const modulosRecomendados:
    ModuloRecomendado[] =
    tieneProgreso
      ? [
          {
            nombre: "MathGeometry",
            icono: geometriaIcon,
            ruta: "/actividades/geometria",
          },
          {
            nombre: "MathNumbers",
            icono: numerosIcon,
            ruta: "/seleccion-mundos",
          },
          {
            nombre:
              "Revisar estadísticas",
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
        : leccionesCompletadas > 0
          ? `Llevas ${leccionesCompletadas} actividad${
              leccionesCompletadas === 1
                ? ""
                : "es"
            } completada${
              leccionesCompletadas === 1
                ? ""
                : "s"
            }. ¡Sigue avanzando!`
          : "Aprende, practica y mejora tus habilidades paso a paso.";

  return (
    <main className="dashboard-page">
      {mostrarIntroduccion && (
        <Introduccion
          onCerrar={
            cerrarIntroduccion
          }
        />
      )}

      <button
        type="button"
        className={`hamburger-btn ${
          menuOpen
            ? "hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (actual) => !actual,
          )
        }
        aria-label="Abrir menú"
      >
        <img
          src={menuHamburguesa}
          alt="Menú"
        />
      </button>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${
          menuOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="sidebar-logo"
        />

        <nav className="sidebar-menu">
          <button
            type="button"
            className="menu-item active"
          >
            <FiGrid />
            <span>
              Dashboard principal
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta(
                "/seleccion-mundos",
              )
            }
          >
            <GiRingedPlanet />
            <span>
              Selección de mundos
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta(
                "/retroalimentacion",
              )
            }
          >
            <FiMessageSquare />
            <span>
              Retroalimentación
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta(
                "/perfil-alumno",
              )
            }
          >
            <FiUser />
            <span>
              Perfil del alumno
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
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
            <h1>
              Bienvenido, {nombreUsuario}
            </h1>

            <p>{textoHero}</p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  irARuta(
                    "/seleccion-mundos",
                  )
                }
              >
                Comenzar ahora
                <FiArrowRight />
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  irARuta(
                    "/estadisticas",
                  )
                }
              >
                Ver mi progreso
                <FiBarChart2 />
              </button>
            </div>

            {modoInvitado && (
              <div className="guest-hero-alert">
                Estás viendo MathNova
                como espectador. Para
                iniciar actividades y
                guardar progreso
                necesitas iniciar sesión
                o crear una cuenta.
              </div>
            )}
          </div>

          <img
            src={heroBanner}
            alt="Hero MathNova"
            className="hero-img"
          />
        </section>

        <section className="stats-row">
          <article className="stat-card green-card">
            <div>
              <h3>
                Lecciones completadas
              </h3>

              <strong>
                {cargando
                  ? "..."
                  : leccionesCompletadas}
              </strong>

              <p>
                {leccionesCompletadas >
                0
                  ? "¡Buen avance!"
                  : "Empieza tu primera actividad"}
              </p>
            </div>

            <img
              src={leccionesIcon}
              alt="Lecciones"
            />
          </article>

          <article className="stat-card yellow-card">
            <div>
              <h3>
                Estrellas totales
              </h3>

              <strong>
                {cargando
                  ? "..."
                  : estrellasTotales}
              </strong>

              <p>
                {estrellasTotales > 0
                  ? "¡Sigue sumando estrellas!"
                  : "Aún no tienes estrellas"}
              </p>
            </div>

            <img
              src={estrellasIcon}
              alt="Estrellas"
            />
          </article>

          <article className="stat-card red-card">
            <div>
              <h3>Racha actual</h3>

              <strong>
                {cargando
                  ? "..."
                  : rachaActual}
              </strong>

              <p>
                {rachaActual > 0
                  ? "¡Sigue así!"
                  : "Inicia tu racha"}
              </p>
            </div>

            <img
              src={rachaIcon}
              alt="Racha"
            />
          </article>

          <article className="stat-card blue-card">
            <div>
              <h3>
                Promedio general
              </h3>

              <strong>
                {cargando
                  ? "..."
                  : `${promedioGeneral}%`}
              </strong>

              <p>
                {promedioGeneral >= 80
                  ? "Excelente trabajo"
                  : promedioGeneral > 0
                    ? "Puedes mejorar"
                    : "Sin calificaciones todavía"}
              </p>
            </div>

            <img
              src={promedioIcon}
              alt="Promedio"
            />
          </article>
        </section>

        <section className="bottom-section">
          <article className="continue-card">
            <h2>
              Continúa donde lo dejaste
            </h2>

            <div
              className="course-progress"
              role="button"
              tabIndex={
                cargando ? -1 : 0
              }
              onClick={() => {
                if (!cargando) {
                  irARuta(
                    rutaActividadActual,
                  );
                }
              }}
              onKeyDown={(event) => {
                if (
                  !cargando &&
                  (event.key ===
                    "Enter" ||
                    event.key === " ")
                ) {
                  event.preventDefault();

                  irARuta(
                    rutaActividadActual,
                  );
                }
              }}
            >
              <img
                src={
                  iconoActividadActual
                }
                alt={tituloActividad}
              />

              <div className="course-info">
                <div className="course-header">
                  <h3>
                    {tituloActividad}
                  </h3>

                  <FiMoreHorizontal />
                </div>

                <div className="progress-line">
                  <span
                    className="progress-blue"
                    style={{
                      width: `${progresoVisual}%`,
                    }}
                  />

                  <span
                    className="progress-green"
                    style={{
                      width: "0%",
                    }}
                  />
                </div>
              </div>

              <strong>
                {cargando
                  ? "..."
                  : `${progresoVisual}%`}
              </strong>
            </div>
          </article>

          <article className="modules-card">
            <h2>
              Módulos recomendados
            </h2>

            {cargando ? (
              <p className="modules-empty-text">
                Cargando
                recomendaciones...
              </p>
            ) : modulosRecomendados.length >
              0 ? (
              <div className="modules-list">
                {modulosRecomendados.map(
                  (modulo) => (
                    <button
                      className="module-item"
                      type="button"
                      key={modulo.nombre}
                      onClick={() =>
                        irARuta(
                          modulo.ruta,
                        )
                      }
                    >
                      <img
                        src={modulo.icono}
                        alt={modulo.nombre}
                      />

                      <span>
                        {modulo.nombre}
                      </span>
                    </button>
                  ),
                )}
              </div>
            ) : (
              <div className="modules-empty-box">
                <p>
                  Aún no hay módulos
                  recomendados.
                </p>

                <span>
                  Inicia una actividad
                  para que Nova pueda
                  sugerirte qué practicar
                  según tu progreso.
                </span>

                <button
                  type="button"
                  onClick={() =>
                    irARuta(
                      "/seleccion-mundos",
                    )
                  }
                >
                  Explorar mundos
                </button>
              </div>
            )}
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>
            © MathNova. Todos los
            derechos reservados.
          </p>

          <div className="footer-icons">
            <button
              type="button"
              className="footer-icon-btn"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <button
              type="button"
              className="footer-intro-btn"
              onClick={volverAVerIntroduccion}
              aria-label="Volver a ver la introducción"
              title="Volver a ver la introducción"
            >
              <FiPlayCircle />
            </button>

            <FiHelpCircle className="help-icon" />

            <button
              type="button"
              className="footer-icon-btn"
              onClick={() => irARuta("/perfil-alumno")}
              aria-label="Ir al perfil del alumno"
              title="Perfil del alumno"
            >
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Dashboard;