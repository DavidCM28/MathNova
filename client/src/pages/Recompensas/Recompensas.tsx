import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  FiArrowRight,
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
  GiTrophyCup,
} from "react-icons/gi";

import {
  obtenerPerfilAlumno,
} from "../../services/alumnoService";

import type {
  Alumno,
} from "../../services/alumnoService";

import {
  obtenerIdUsuarioAutenticado,
  obtenerResumenAlumno,
} from "../../services/progresoService";

import type {
  ResumenAlumno,
} from "../../services/progresoService";

import {
  clearAuthSession,
  isGuestSession,
} from "../../utils/authSession";

type PerfilRespuesta = {
  perfil?: Alumno;
};

type Insignia = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  desbloqueada: boolean;
};

type RecompensaDesbloqueable = {
  nombre: string;
  obtenidas: number;
  total: number;
  imagen: string;
};

const META_ESTRELLAS = 1000;
const XP_POR_NIVEL = 250;

const numeroSeguro = (
  valor:
    | number
    | string
    | null
    | undefined,
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
    Math.max(
      Math.round(valor),
      0,
    ),
    100,
  );
};

const extraerPerfil = (
  respuesta: unknown,
): Alumno | null => {
  if (
    typeof respuesta !== "object" ||
    respuesta === null
  ) {
    return null;
  }

  const datos =
    respuesta as PerfilRespuesta &
      Record<string, unknown>;

  if (
    datos.perfil &&
    typeof datos.perfil === "object"
  ) {
    return datos.perfil;
  }

  return datos as Alumno;
};

const obtenerTituloNivel = (
  nivel: number,
): string => {
  if (nivel >= 12) {
    return "Maestro de MathNova";
  }

  if (nivel >= 8) {
    return "Comandante Matemático";
  }

  if (nivel >= 5) {
    return "Explorador Avanzado";
  }

  if (nivel >= 3) {
    return "Explorador Nova";
  }

  return "Aprendiz Nova";
};

function Recompensas() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [alumno, setAlumno] =
    useState<Alumno | null>(null);

  const [resumen, setResumen] =
    useState<ResumenAlumno | null>(
      null,
    );

  const [cargando, setCargando] =
    useState(true);

  const [
    errorCarga,
    setErrorCarga,
  ] = useState("");

  const navigate = useNavigate();

  const modoInvitado =
    isGuestSession();

  const cargarRecompensas =
    useCallback(async () => {
      const invitado =
        isGuestSession();

      if (invitado) {
        setAlumno(null);
        setResumen(null);
        setErrorCarga("");
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
      setErrorCarga("");

      const resultados =
        await Promise.allSettled([
          obtenerPerfilAlumno(),
          obtenerResumenAlumno(
            idUsuario,
          ),
        ]);

      const [
        resultadoPerfil,
        resultadoResumen,
      ] = resultados;

      let huboError = false;

      if (
        resultadoPerfil.status ===
        "fulfilled"
      ) {
        setAlumno(
          extraerPerfil(
            resultadoPerfil.value,
          ),
        );
      } else {
        huboError = true;

        console.error(
          "No se pudo cargar el perfil del alumno:",
          resultadoPerfil.reason,
        );
      }

      if (
        resultadoResumen.status ===
        "fulfilled"
      ) {
        setResumen(
          resultadoResumen.value
            .resumen ?? null,
        );
      } else {
        huboError = true;

        console.error(
          "No se pudo cargar el resumen de recompensas:",
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
    document.body.style.overflow =
      menuOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    void cargarRecompensas();

    const actualizarAlVolver =
      () => {
        void cargarRecompensas();
      };

    const actualizarAlMostrar =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void cargarRecompensas();
        }
      };

    window.addEventListener(
      "focus",
      actualizarAlVolver,
    );

    document.addEventListener(
      "visibilitychange",
      actualizarAlMostrar,
    );

    return () => {
      window.removeEventListener(
        "focus",
        actualizarAlVolver,
      );

      document.removeEventListener(
        "visibilitychange",
        actualizarAlMostrar,
      );
    };
  }, [cargarRecompensas]);

  const irARuta = (
    ruta: string,
  ) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const estrellasTotales =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.estrellas_totales ??
            resumen
              ?.estrellas_ganadas ??
            alumno
              ?.estrellas_totales,
        );

  const xpTotal = modoInvitado
    ? 0
    : numeroSeguro(
        resumen?.xp_total,
      );

  const completadas =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.actividades_completadas ??
            resumen
              ?.lecciones_completadas,
        );

  const intentadas =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.actividades_intentadas,
        );

  const promedio = modoInvitado
    ? 0
    : numeroSeguro(
        resumen
          ?.promedio_general ??
          resumen
            ?.precision_promedio,
      );

  const progresoGeneral =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.progreso_general ??
            resumen
              ?.promedio_general ??
            resumen
              ?.precision_promedio,
        );

  const rachaActual =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen?.racha_actual ??
            alumno?.racha_actual,
        );

  /*
   * El nivel se calcula con el XP real.
   * No usamos alumno.nivel porque esa
   * propiedad no existe en el tipo Alumno.
   */
  const nivelCalculado =
    Math.max(
      1,
      Math.floor(
        xpTotal /
          XP_POR_NIVEL,
      ) + 1,
    );

  const nivelActual =
    modoInvitado
      ? 1
      : nivelCalculado;

  /*
   * El título también se calcula.
   * No usamos alumno.titulo porque esa
   * propiedad tampoco existe.
   */
  const tituloNivel =
    obtenerTituloNivel(
      nivelActual,
    );

  const insignias =
    useMemo<Insignia[]>(
      () => [
        {
          id: 1,
          nombre:
            "Primeros Pasos",
          descripcion:
            "Completa tu primera actividad",
          imagen:
            primerosPasos,
          desbloqueada:
            completadas >= 1,
        },
        {
          id: 2,
          nombre:
            "Diez Logros",
          descripcion:
            "Completa 10 actividades",
          imagen:
            diezLogros,
          desbloqueada:
            completadas >= 10,
        },
        {
          id: 3,
          nombre:
            "Aprendiz Dedicado",
          descripcion:
            "Completa 5 actividades",
          imagen:
            aprendizDedicado,
          desbloqueada:
            completadas >= 5,
        },
        {
          id: 4,
          nombre:
            "Mente Matemática",
          descripcion:
            "Obtén promedio mayor o igual a 80%",
          imagen:
            menteMatematica,
          desbloqueada:
            promedio >= 80,
        },
        {
          id: 5,
          nombre:
            "Estrella Constante",
          descripcion:
            "Logra una racha de 7 días",
          imagen:
            estrellaConstante,
          desbloqueada:
            rachaActual >= 7,
        },
      ],
      [
        completadas,
        promedio,
        rachaActual,
      ],
    );

  const insigniasGanadas =
    insignias.filter(
      (insignia) =>
        insignia.desbloqueada,
    ).length;

  const recompensasDesbloqueables =
    useMemo<
      RecompensaDesbloqueable[]
    >(
      () => [
        {
          nombre: "Avatares",
          obtenidas: Math.min(
            Math.floor(
              estrellasTotales /
                50,
            ),
            12,
          ),
          total: 12,
          imagen: avatares,
        },
        {
          nombre: "Marcos",
          obtenidas: Math.min(
            Math.floor(
              completadas / 2,
            ),
            10,
          ),
          total: 10,
          imagen: marcos,
        },
        {
          nombre: "Stickers",
          obtenidas: Math.min(
            Math.floor(
              estrellasTotales /
                25,
            ),
            20,
          ),
          total: 20,
          imagen: stickers,
        },
        {
          nombre: "Trofeos",
          obtenidas: Math.min(
            Math.floor(
              nivelActual / 2,
            ),
            8,
          ),
          total: 8,
          imagen: trofeos,
        },
      ],
      [
        completadas,
        estrellasTotales,
        nivelActual,
      ],
    );

  const estrellasFaltantes =
    Math.max(
      META_ESTRELLAS -
        estrellasTotales,
      0,
    );

  const progresoRecompensa =
    limitarPorcentaje(
      META_ESTRELLAS > 0
        ? (
            estrellasTotales /
            META_ESTRELLAS
          ) * 100
        : 0,
    );

  const textoMotivacion =
    modoInvitado
      ? "Inicia sesión para ganar recompensas."
      : estrellasTotales > 0
        ? "¡Estás avanzando hacia tu próxima recompensa!"
        : intentadas > 0
          ? "Mejora tus resultados para comenzar a ganar estrellas."
          : "Completa actividades para empezar a ganar recompensas.";

  return (
    <main className="recompensas-page">
      <button
        type="button"
        className={`hamburger-btn ${
          menuOpen
            ? "hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (estadoActual) =>
              !estadoActual,
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
            className="menu-item"
            onClick={() =>
              irARuta(
                "/dashboard",
              )
            }
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
            className="menu-item active"
            onClick={() =>
              irARuta(
                "/recompensas",
              )
            }
          >
            <GiTrophyCup />

            <span>
              Recompensas
            </span>
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
              irARuta(
                "/estadisticas",
              )
            }
          >
            <FiBarChart2 />

            <span>
              Estadísticas
            </span>
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

            <p>
              Celebra tus logros y
              desbloquea nuevos premios.
            </p>

            {errorCarga && (
              <p
                role="alert"
                style={{
                  marginTop: "8px",
                  color: "#b42318",
                  fontWeight: 700,
                }}
              >
                {errorCarga}
              </p>
            )}
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
              <h3>
                Estrellas totales
              </h3>

              <strong>
                {cargando
                  ? "..."
                  : estrellasTotales}
              </strong>

              <p>
                {estrellasTotales >
                0
                  ? "¡Sigue sumando estrellas!"
                  : "Aún no tienes estrellas"}
              </p>
            </div>

            <div className="icon-circle">
              <img
                src={
                  estrellasTotalesIcon
                }
                alt="Estrellas"
              />
            </div>
          </article>

          <article className="reward-stat blue-stat">
            <div>
              <h3>
                Insignias ganadas
              </h3>

              <strong>
                {cargando
                  ? "..."
                  : insigniasGanadas}
              </strong>

              <p>
                {insigniasGanadas >
                0
                  ? "¡Vas por un gran camino!"
                  : "Completa actividades para ganar insignias"}
              </p>
            </div>

            <div className="icon-circle">
              <img
                src={
                  insigniasGanadasIcon
                }
                alt="Insignias"
              />
            </div>
          </article>

          <article className="reward-stat purple-stat">
            <div>
              <h3>Nivel actual</h3>

              <strong>
                {cargando
                  ? "..."
                  : `Nivel ${nivelActual}`}
              </strong>

              <p>{tituloNivel}</p>
            </div>

            <div className="icon-circle">
              <img
                src={nivelActualIcon}
                alt="Nivel"
              />
            </div>
          </article>

          <article className="reward-stat green-stat">
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

            <div className="icon-circle">
              <img
                src={rachaActualIcon}
                alt="Racha"
              />
            </div>
          </article>
        </section>

        <section className="main-rewards-grid">
          <article className="panel badges-panel">
            <div className="panel-head">
              <h2>
                Insignias ganadas
              </h2>

              <button
                type="button"
                onClick={() =>
                  irARuta(
                    "/estadisticas",
                  )
                }
              >
                Ver todas
                <FiArrowRight />
              </button>
            </div>

            <div className="badges-grid">
              {insignias.map(
                (insignia) => (
                  <div
                    className="badge-card"
                    key={
                      insignia.id
                    }
                    style={{
                      opacity:
                        insignia
                          .desbloqueada
                          ? 1
                          : 0.45,
                      filter:
                        insignia
                          .desbloqueada
                          ? "none"
                          : "grayscale(0.9)",
                    }}
                  >
                    <img
                      src={
                        insignia.imagen
                      }
                      alt={
                        insignia.nombre
                      }
                    />

                    <h4>
                      {insignia.nombre}
                    </h4>

                    <p>
                      {insignia
                        .desbloqueada
                        ? "Insignia desbloqueada"
                        : insignia
                            .descripcion}
                    </p>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="panel unlock-panel">
            <div className="panel-head">
              <h2>
                Recompensas desbloqueables
              </h2>

              <button
                type="button"
                onClick={() =>
                  irARuta(
                    "/estadisticas",
                  )
                }
              >
                Ver todas
                <FiArrowRight />
              </button>
            </div>

            <div className="unlock-grid">
              {recompensasDesbloqueables.map(
                (recompensa) => (
                  <div
                    className="unlock-card"
                    key={
                      recompensa.nombre
                    }
                  >
                    <h4>
                      {
                        recompensa.nombre
                      }
                    </h4>

                    <strong>
                      {cargando
                        ? "..."
                        : recompensa
                            .obtenidas}{" "}
                      <span>
                        /{" "}
                        {
                          recompensa.total
                        }
                      </span>
                    </strong>

                    <img
                      src={
                        recompensa.imagen
                      }
                      alt={
                        recompensa.nombre
                      }
                    />
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="panel next-panel">
            <h2>
              Próxima recompensa
            </h2>

            <p>
              {textoMotivacion}
            </p>

            <div className="reward-progress-wrap">
              <div className="reward-progress-line">
                <span className="reward-check reward-check-1">
                  {progresoRecompensa >=
                  20
                    ? "✓"
                    : ""}
                </span>

                <span className="reward-check reward-check-2">
                  {progresoRecompensa >=
                  40
                    ? "✓"
                    : ""}
                </span>

                <span className="reward-check reward-check-3">
                  {progresoRecompensa >=
                  60
                    ? "✓"
                    : ""}
                </span>

                <span className="reward-dot" />

                <span
                  className="reward-green-line"
                  style={{
                    width: `${progresoRecompensa}%`,
                  }}
                />
              </div>

              <div className="reward-gift-circle">
                <img
                  src={
                    proximaRecompensa
                  }
                  alt="Próxima recompensa"
                />
              </div>

              <div className="reward-empty-circle" />

              <div className="reward-missing">
                <span>Faltan</span>

                <b>
                  {cargando
                    ? "..."
                    : estrellasFaltantes}
                </b>

                <img
                  src={estrellaRe}
                  alt="Estrella"
                />

                <span>
                  estrellas
                </span>
              </div>
            </div>

            <h3>
              <span>
                {cargando
                  ? "..."
                  : estrellasTotales}
              </span>{" "}
              / {META_ESTRELLAS}{" "}
              estrellas
            </h3>
          </article>

          <article className="featured-reward">
            <div>
              <h3>
                Recompensa destacada
                <span>Épica</span>
              </h3>

              <h2>
                Avatar Astro Nova
              </h2>

              <p>
                {progresoRecompensa >=
                100
                  ? "¡Ya puedes desbloquear este avatar exclusivo!"
                  : `Llevas ${progresoGeneral}% de progreso general y ${xpTotal} XP acumulados.`}
              </p>

              <button
                type="button"
                onClick={() =>
                  irARuta(
                    "/estadisticas",
                  )
                }
              >
                Ver cómo obtenerla
              </button>
            </div>

            <img
              src={avatarAstroNova}
              alt="Avatar Astro Nova"
            />
          </article>
        </section>

        <footer className="recompensas-footer">
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
            >
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