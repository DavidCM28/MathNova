import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessionUser,
  isGuestSession,
} from "../../utils/authSession";
import {
  obtenerProgresoAlumno,
} from "../../services/progresoService";
import "./ActividadesMathData.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-MathData.png";
import holaMathData from "../../assets/hola-MathData.png";

import actividad1 from "../../assets/Actividad-1-MathData.png";
import actividad2 from "../../assets/Actividad-2-MathData.png";
import actividad3 from "../../assets/Actividad-3-3MathData.png";
import actividad4 from "../../assets/Actividad-4-MathData.png";
import actividad5 from "../../assets/Actividad-5-MathData.png";
import actividad6 from "../../assets/Activity-6-MathData.png";
import actividad7 from "../../assets/Actividad-7-MathData.png";
import actividad8 from "../../assets/Actividad-8-MathData.png";
import actividad9 from "../../assets/Actividad-9-MathData.png";
import actividad10 from "../../assets/Actividad-10-MathData.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiCircle,
  FiLock,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

type EstadoActividadMathData =
  | "Pendiente"
  | "En curso"
  | "Completada";

type FiltroEstadoMathData =
  | "Todas"
  | EstadoActividadMathData;

type RegistroProgresoMathData = {
  actividad_codigo?: string;
  completada?: boolean;
  estrellas_obtenidas?: number | string;
  precision?: number | string;
  intentos?: number | string;
};

type RespuestaProgresoMathData = {
  progreso?: RegistroProgresoMathData[];
};

type ProgresoGeneralMathData = {
  proporcionalidad?: boolean;
  rampas?: boolean;
  tripulacion?: boolean;
  holograma?: boolean;
};

type UsuarioSesionMathData = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionMathData;
  user?: UsuarioSesionMathData;
  data?: UsuarioSesionMathData;
  session?: UsuarioSesionMathData;
};

type ActividadMathData = {
  img: string;
  titulo: string;
  texto: string;
  nivel: "Fácil" | "Medio";
  tiempo: string;
  ruta: string;
  codigosProgreso: string[];
  legacyKey?: keyof ProgresoGeneralMathData;
};

const API_URL_BASE =
  (
    import.meta.env.VITE_API_URL as
      | string
      | undefined
  )?.replace(/\/+$/, "") ||
  "http://localhost:3001";

const PROGRESO_GENERAL_URL =
  API_URL_BASE.endsWith("/api")
    ? `${API_URL_BASE}/progreso-general`
    : `${API_URL_BASE}/api/progreso-general`;

const numeroSeguro = (
  valor:
    | number
    | string
    | null
    | undefined,
): number => {
  const numero = Number(valor ?? 0);

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const extraerIdUsuario = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionMathData;

  const idDirecto = Number(
    usuario.id_usuario ??
      usuario.idUsuario ??
      usuario.usuario_id ??
      usuario.user_id ??
      usuario.userId ??
      usuario.id ??
      0,
  );

  if (
    Number.isInteger(idDirecto) &&
    idDirecto > 0
  ) {
    return idDirecto;
  }

  for (const anidado of [
    usuario.usuario,
    usuario.user,
    usuario.data,
    usuario.session,
  ]) {
    const idAnidado =
      extraerIdUsuario(anidado);

    if (idAnidado > 0) {
      return idAnidado;
    }
  }

  return 0;
};

const obtenerIdUsuarioActual = (): number => {
  const candidatos: unknown[] = [
    getSessionUser(),
  ];

  for (const clave of [
    "auth_session",
    "usuario",
    "user",
    "session_user",
    "sessionUser",
    "mathnova_user",
    "authUser",
  ]) {
    try {
      const valor =
        localStorage.getItem(clave) ||
        sessionStorage.getItem(clave);

      if (valor) {
        candidatos.push(
          JSON.parse(valor),
        );
      }
    } catch (error) {
      console.warn(
        `No se pudo leer la sesión "${clave}":`,
        error,
      );
    }
  }

  for (const candidato of candidatos) {
    const idUsuario =
      extraerIdUsuario(candidato);

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

const extraerRegistrosProgreso = (
  respuesta: unknown,
): RegistroProgresoMathData[] => {
  if (Array.isArray(respuesta)) {
    return respuesta as RegistroProgresoMathData[];
  }

  if (
    respuesta &&
    typeof respuesta === "object" &&
    Array.isArray(
      (
        respuesta as
          RespuestaProgresoMathData
      ).progreso,
    )
  ) {
    return (
      respuesta as
        RespuestaProgresoMathData
    ).progreso ?? [];
  }

  return [];
};

const normalizarTexto = (
  texto: string,
) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim();

function ActividadesMathData() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<FiltroEstadoMathData>(
      "Todas",
    );

  const [
    progresos,
    setProgresos,
  ] = useState<
    RegistroProgresoMathData[]
  >([]);

  const [
    progresoGeneral,
    setProgresoGeneral,
  ] =
    useState<ProgresoGeneralMathData>(
      {},
    );

  const [
    cargandoProgreso,
    setCargandoProgreso,
  ] = useState(true);

  const [
    errorProgreso,
    setErrorProgreso,
  ] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    let componenteActivo = true;

    const cargarEstado = async () => {
      if (isGuestSession()) {
        if (componenteActivo) {
          setProgresos([]);
          setProgresoGeneral({});
          setErrorProgreso("");
          setCargandoProgreso(false);
        }

        return;
      }

      const idUsuario =
        obtenerIdUsuarioActual();

      if (!idUsuario) {
        if (componenteActivo) {
          setErrorProgreso(
            "No se encontró el usuario autenticado.",
          );
          setCargandoProgreso(false);
        }

        return;
      }

      setCargandoProgreso(true);
      setErrorProgreso("");

      const [
        resultadoUnificado,
        resultadoAnterior,
      ] = await Promise.allSettled([
        obtenerProgresoAlumno(
          idUsuario,
        ),
        fetch(
          `${PROGRESO_GENERAL_URL}/${idUsuario}`,
        ).then(async (response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`,
            );
          }

          return response.json();
        }),
      ]);

      if (!componenteActivo) {
        return;
      }

      if (
        resultadoUnificado.status ===
        "fulfilled"
      ) {
        setProgresos(
          extraerRegistrosProgreso(
            resultadoUnificado.value,
          ),
        );
      } else {
        console.error(
          "No se pudo cargar el progreso unificado de MathData:",
          resultadoUnificado.reason,
        );
      }

      if (
        resultadoAnterior.status ===
        "fulfilled"
      ) {
        const respuesta =
          resultadoAnterior.value as {
            success?: boolean;
            data?: ProgresoGeneralMathData;
          };

        setProgresoGeneral(
          respuesta.success &&
            respuesta.data
            ? respuesta.data
            : {},
        );
      } else {
        console.warn(
          "No se pudo cargar el progreso anterior de MathData:",
          resultadoAnterior.reason,
        );
      }

      if (
        resultadoUnificado.status ===
          "rejected" &&
        resultadoAnterior.status ===
          "rejected"
      ) {
        setErrorProgreso(
          "No se pudo cargar el progreso de MathData.",
        );
      }

      setCargandoProgreso(false);
    };

    void cargarEstado();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const irARuta = (
    ruta: string,
  ) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const actividades =
    useMemo<ActividadMathData[]>(
      () => [
        {
          img: actividad1,
          titulo:
            "1. Generador de Energía",
          texto:
            "Completa la tabla de reactores y traza la gráfica.",
          nivel: "Fácil",
          tiempo: "12 min",
          ruta:
            "/actividades-math-data/generador-energia",
          codigosProgreso: [
            "mathdata-generador-energia",
            "generador-energia",
            "proporcionalidad",
          ],
          legacyKey:
            "proporcionalidad",
        },
        {
          img: actividad2,
          titulo:
            "2. Rampas de Lanzamiento",
          texto:
            "Calibra rampas identificando pendientes (+/-) y ecuaciones.",
          nivel: "Fácil",
          tiempo: "10 min",
          ruta:
            "/actividades-math-data/rampas-lanzamiento",
          codigosProgreso: [
            "mathdata-rampas-lanzamiento",
            "rampas-lanzamiento",
            "rampas",
          ],
          legacyKey: "rampas",
        },
        {
          img: actividad3,
          titulo:
            "3. Encuesta de Tripulación",
          texto:
            "Diseña la encuesta y construye una tabla de frecuencias.",
          nivel: "Fácil",
          tiempo: "12 min",
          ruta:
            "/actividades-math-data/encuesta-tripulacion",
          codigosProgreso: [
            "mathdata-encuesta-tripulacion",
            "encuesta-tripulacion",
            "tripulacion",
          ],
          legacyKey: "tripulacion",
        },
        {
          img: actividad4,
          titulo:
            "4. Holograma de Reportes",
          texto:
            "Transforma datos en gráficas de barras y circulares.",
          nivel: "Medio",
          tiempo: "15 min",
          ruta:
            "/actividades-math-data/holograma-reportes",
          codigosProgreso: [
            "mathdata-holograma-reportes",
            "holograma-reportes",
            "holograma",
          ],
          legacyKey: "holograma",
        },
        {
          img: actividad5,
          titulo:
            "5. Sensor de Frecuencias",
          texto:
            "Determina frecuencia absoluta y relativa (%) de señales.",
          nivel: "Fácil",
          tiempo: "8 min",
          ruta:
            "/actividades-math-data/sensor-frecuencias",
          codigosProgreso: [
            "mathdata-sensor-frecuencias",
            "sensor-frecuencias",
            "sensor",
          ],
        },
        {
          img: actividad6,
          titulo:
            "6. Núcleo de Decisiones",
          texto:
            "Calcula media, mediana y moda para estimar tiempos.",
          nivel: "Medio",
          tiempo: "14 min",
          ruta:
            "/actividades-math-data/nucleo-decisiones",
          codigosProgreso: [
            "mathdata-nucleo-decisiones",
            "nucleo-decisiones",
            "nucleo",
          ],
        },
        {
          img: actividad7,
          titulo:
            "7. Oráculo de la Estación",
          texto:
            "Determina espacio muestral y compara cualitativamente eventos.",
          nivel: "Fácil",
          tiempo: "15 min",
          ruta:
            "/actividades-math-data/oraculo-estacion",
          codigosProgreso: [
            "mathdata-oraculo-estacion",
            "oraculo-estacion",
            "oraculo",
          ],
        },
        {
          img: actividad8,
          titulo:
            "8. Sala de Tres Caminos",
          texto:
            "Clasifica eventos como independientes, dependientes o excluyentes.",
          nivel: "Fácil",
          tiempo: "8 min",
          ruta: "",
          codigosProgreso: [
            "mathdata-sala-tres-caminos",
            "sala-tres-caminos",
          ],
        },
        {
          img: actividad9,
          titulo:
            "9. Código de Combinaciones",
          texto:
            "Aplica procedimientos de conteo con multiplicación, aditivo, etc.",
          nivel: "Medio",
          tiempo: "11 min",
          ruta: "",
          codigosProgreso: [
            "mathdata-codigo-combinaciones",
            "codigo-combinaciones",
          ],
        },
        {
          img: actividad10,
          titulo:
            "10. Probabilidad Flash",
          texto:
            "Calcula probabilidades y toma decisiones basadas en azar.",
          nivel: "Medio",
          tiempo: "10 min",
          ruta: "",
          codigosProgreso: [
            "mathdata-probabilidad-flash",
            "probabilidad-flash",
          ],
        },
      ],
      [],
    );

  const progresoPorCodigo =
    useMemo(() => {
      const mapa = new Map<
        string,
        RegistroProgresoMathData
      >();

      progresos.forEach(
        (registro) => {
          const codigo = String(
            registro.actividad_codigo ??
              "",
          ).trim();

          if (codigo) {
            mapa.set(
              codigo,
              registro,
            );
          }
        },
      );

      return mapa;
    }, [progresos]);

  const actividadesConEstado =
    useMemo(
      () =>
        actividades.map(
          (actividad) => {
            const registro =
              actividad.codigosProgreso
                .map((codigo) =>
                  progresoPorCodigo.get(
                    codigo,
                  ),
                )
                .find(Boolean);

            const completadaAnterior =
              actividad.legacyKey
                ? Boolean(
                    progresoGeneral[
                      actividad.legacyKey
                    ],
                  )
                : false;

            const completada =
              registro?.completada ===
                true ||
              completadaAnterior;

            const estado: EstadoActividadMathData =
              completada
                ? "Completada"
                : registro
                  ? "En curso"
                  : "Pendiente";

            return {
              ...actividad,
              estado,
              estrellas:
                numeroSeguro(
                  registro
                    ?.estrellas_obtenidas,
                ),
              precision:
                numeroSeguro(
                  registro?.precision,
                ),
            };
          },
        ),
      [
        actividades,
        progresoPorCodigo,
        progresoGeneral,
      ],
    );

  /*
   * Las primeras cuatro actividades conservan
   * el desbloqueo secuencial del proyecto.
   *
   * Desde la actividad 5 se mantienen abiertas
   * porque en el código original todavía no
   * dependían de progreso-general.
   */
  const estaDesbloqueada = (
    index: number,
  ) => {
    if (index === 0) {
      return true;
    }

    if (index >= 4) {
      return true;
    }

    return (
      actividadesConEstado[
        index - 1
      ]?.estado === "Completada"
    );
  };

  const totalCompletadas =
    actividadesConEstado.filter(
      (actividad) =>
        actividad.estado ===
        "Completada",
    ).length;

  const totalEnCurso =
    actividadesConEstado.filter(
      (actividad) =>
        actividad.estado ===
        "En curso",
    ).length;

  const totalPendientes =
    actividadesConEstado.length -
    totalCompletadas -
    totalEnCurso;

  const totalEstrellas =
    actividadesConEstado.reduce(
      (total, actividad) =>
        total +
        actividad.estrellas,
      0,
    );

  const actividadesFiltradas =
    useMemo(() => {
      const textoBuscado =
        normalizarTexto(busqueda);

      return actividadesConEstado
        .map(
          (
            actividad,
            indexOriginal,
          ) => ({
            ...actividad,
            indexOriginal,
          }),
        )
        .filter((actividad) => {
          const coincideEstado =
            filtroEstado ===
              "Todas" ||
            actividad.estado ===
              filtroEstado;

          if (!coincideEstado) {
            return false;
          }

          if (!textoBuscado) {
            return true;
          }

          const contenido =
            normalizarTexto(
              `${actividad.titulo} ${actividad.texto} ${actividad.nivel} ${actividad.tiempo} ${actividad.estado}`,
            );

          return contenido.includes(
            textoBuscado,
          );
        });
    }, [
      actividadesConEstado,
      busqueda,
      filtroEstado,
    ]);

  const cambiarFiltroEstado = (
    estado: EstadoActividadMathData,
  ) => {
    setFiltroEstado(
      (actual) =>
        actual === estado
          ? "Todas"
          : estado,
    );
  };

  return (
    <main className="mathdatax-page">
      <button
        type="button"
        className={`mathdatax-hamburger-btn ${
          menuOpen
            ? "mathdatax-hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (actual) => !actual,
          )
        }
        aria-label={
          menuOpen
            ? "Cerrar menú"
            : "Abrir menú"
        }
      >
        <img
          src={menuHamburguesa}
          alt="Menú"
        />
      </button>

      {menuOpen && (
        <div
          className="mathdatax-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mathdatax-sidebar ${
          menuOpen
            ? "mathdatax-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mathdatax-sidebar-logo"
        />

        <nav className="mathdatax-sidebar-menu">
          <button
            type="button"
            className="mathdatax-menu-item"
            onClick={() =>
              irARuta("/")
            }
          >
            <FiGrid />
            <span>
              Dashboard principal
            </span>
          </button>

          <button
            type="button"
            className="mathdatax-menu-item mathdatax-active"
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
            className="mathdatax-menu-item"
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
            className="mathdatax-menu-item"
            onClick={() =>
              irARuta(
                "/recompensas",
              )
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mathdatax-menu-item"
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
            className="mathdatax-menu-item"
            onClick={() =>
              irARuta(
                "/estadisticas",
              )
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mathdatax-sidebar-bottom">
          <div className="mathdatax-hello-box">
            <img
              src={holaMathData}
              alt="Explorador Math Data"
            />
            <span>
              ¡Hola, explorador!
            </span>
          </div>

          <div className="mathdatax-weekly-progress">
            <div className="mathdatax-weekly-head">
              <strong>
                Progreso del mundo
              </strong>
              <span>
                {cargandoProgreso
                  ? "…"
                  : `${totalCompletadas}/${actividadesConEstado.length}`}
              </span>
            </div>

            <div className="mathdatax-star-progress">
              <span>☆</span>

              <div>
                <b
                  style={{
                    width: `${
                      actividadesConEstado.length
                        ? Math.round(
                            (totalCompletadas /
                              actividadesConEstado.length) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p>
                {cargandoProgreso
                  ? "…"
                  : `${totalEstrellas} ★`}
              </p>
            </div>

            <div className="mathdatax-chart-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </aside>

      <section className="mathdatax-content">
        <img
          src={heroBanner}
          alt="Banner Math Data"
          className="mathdatax-bg"
        />

        <section className="mathdatax-main">
          <div className="mathdatax-header">
            <div className="mathdatax-title-box">
              <h1>
                Actividades de Math Data
              </h1>

              <p>
                Explora datos, tablas y
                gráficas con retos
                interactivos.
              </p>

              <div className="mathdatax-status-tabs">
                <button
                  type="button"
                  aria-pressed={
                    filtroEstado ===
                    "Pendiente"
                  }
                  onClick={() =>
                    cambiarFiltroEstado(
                      "Pendiente",
                    )
                  }
                >
                  <FiCircle />
                  Pendientes (
                  {cargandoProgreso
                    ? "…"
                    : totalPendientes}
                  )
                </button>

                <button
                  type="button"
                  aria-pressed={
                    filtroEstado ===
                    "En curso"
                  }
                  onClick={() =>
                    cambiarFiltroEstado(
                      "En curso",
                    )
                  }
                >
                  <FiCircle />
                  En curso (
                  {cargandoProgreso
                    ? "…"
                    : totalEnCurso}
                  )
                </button>

                <button
                  type="button"
                  aria-pressed={
                    filtroEstado ===
                    "Completada"
                  }
                  onClick={() =>
                    cambiarFiltroEstado(
                      "Completada",
                    )
                  }
                >
                  <FiCheckCircle />
                  Completadas (
                  {cargandoProgreso
                    ? "…"
                    : totalCompletadas}
                  )
                </button>
              </div>
            </div>

            <div className="mathdatax-search-area">
              <div className="mathdatax-search-box">
                <FiSearch />

                <input
                  type="search"
                  value={busqueda}
                  placeholder="Buscar actividades o temas..."
                  onChange={(event) =>
                    setBusqueda(
                      event.target.value,
                    )
                  }
                />
              </div>

              <button
                type="button"
                className="mathdatax-filter-btn"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado(
                    "Todas",
                  );
                }}
              >
                <FiFilter />
                Limpiar
              </button>
            </div>
          </div>

          {errorProgreso && (
            <p>
              No se pudo actualizar el
              progreso de MathData. Las
              actividades siguen disponibles.
            </p>
          )}

          <div className="mathdatax-activities-grid">
            {actividadesFiltradas.map(
              (item) => {
                const bloqueada =
                  !estaDesbloqueada(
                    item.indexOriginal,
                  );

                const sinRuta =
                  !item.ruta;

                return (
                  <article
                    className={`mathdatax-activity-card ${
                      bloqueada
                        ? "mathdatax-activity-bloqueada"
                        : ""
                    }`}
                    key={item.titulo}
                  >
                    <div className="mathdatax-activity-img-wrap">
                      <img
                        src={item.img}
                        alt={item.titulo}
                      />

                      {bloqueada && (
                        <div className="mathdatax-lock-overlay">
                          <FiLock />
                        </div>
                      )}
                    </div>

                    <div className="mathdatax-activity-info">
                      <h3>
                        {item.titulo}
                      </h3>

                      <p>
                        {item.texto}
                      </p>

                      <span
                        className={
                          item.nivel ===
                          "Fácil"
                            ? "mathdatax-easy"
                            : "mathdatax-medium"
                        }
                      >
                        {item.nivel} ·{" "}
                        {item.estado}
                        {item.estrellas > 0
                          ? ` · ${item.estrellas} ★`
                          : ""}
                      </span>

                      <div className="mathdatax-activity-bottom">
                        <small>
                          <FiClock />
                          {item.tiempo}
                        </small>

                        <button
                          type="button"
                          disabled={
                            bloqueada ||
                            sinRuta
                          }
                          onClick={() => {
                            if (
                              bloqueada ||
                              sinRuta
                            ) {
                              return;
                            }

                            navigate(
                              item.ruta,
                            );
                          }}
                        >
                          {bloqueada
                            ? "Bloqueada"
                            : sinRuta
                              ? "Próximamente"
                              : item.estado ===
                                  "Completada"
                                ? "Repetir"
                                : item.estado ===
                                    "En curso"
                                  ? "Continuar"
                                  : "Iniciar"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>

          {actividadesFiltradas.length ===
            0 && (
            <div>
              <FiSearch />
              <h2>
                No se encontraron actividades
              </h2>
              <p>
                Cambia la búsqueda o limpia
                el filtro seleccionado.
              </p>
            </div>
          )}
        </section>

        <footer className="mathdatax-footer">
          <div className="mathdatax-footer-icons">
            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="mathdatax-logout-icon" />
            </button>

            <FiHelpCircle className="mathdatax-help-icon" />
            <FiSettings className="mathdatax-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathData;
