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
  obtenerProgresoAlumno as obtenerProgresoAlumnoAnterior,
} from "../../services/alumnoService";

import type { ActividadProgreso } from "../../services/alumnoService";

import {
  obtenerResumenAlumno,
  obtenerProgresoAlumno as obtenerProgresoAlumnoReal,
  type ProgresoActividad as ProgresoActividadReal,
} from "../../services/progresoService";

import {
  clearAuthSession,
  getSessionUser,
} from "../../utils/authSession";

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

import {
  FaChartLine,
  FaChartPie,
  FaLightbulb,
  FaStar,
} from "react-icons/fa";

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

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

type Actividad = Partial<ActividadProgreso> &
  Partial<ProgresoActividadReal> & {
    id?: number | string;
    id_progreso?: number | string;

    titulo?: string;
    estado?: string;

    porcentaje?: number;
    puntaje?: number;

    tema?: string | null;
    modulo?: string;
    mundo?: string;

    actividad_titulo?: string;
    actividad_codigo?: string;

    completada?: boolean;
    estrellas_obtenidas?: number;

    tiempo_segundos?: number;

    fecha_ultimo_intento?:
      | string
      | number
      | Date
      | null;
  };

type MundoResumen = {
  mundo: string;
  completadas: number;
  intentadas: number;
  estrellas: number;
  xp: number;
  precision: number;
};

type EstadisticasAlumno = {
  /*
   * Datos anteriores del servicio del alumno.
   */
  completadas?: number;
  promedio?: number;
  progreso_general?: number;
  tiempo_formateado?: string;

  leccionesCompletadas?: number;
  estrellasGanadas?: number;
  rachaActual?: number;
  promedioGeneral?: number;

  /*
   * Datos actuales enviados por el backend.
   */
  estrellas_totales?: number;
  estrellas_ganadas?: number;
  xp_total?: number;

  actividades_completadas?: number;
  lecciones_completadas?: number;
  actividades_intentadas?: number;

  precision_promedio?: number;
  promedio_general?: number;

  tiempo_total_segundos?: number;
  tiempo_estudio_segundos?: number;
  tiempo_estudio_minutos?: number;

  racha_actual?: number;

  progresoSemanal?: {
    dia: string;
    lecciones: number;
  }[];

  rendimientoPorTema?: {
    tema: string;
    promedio: number;
  }[];

  dominioPorMundo?: {
    mundo: string;
    promedio: number;
  }[];

  tiempoEstudio?: {
    minutos: number;
    actividadesCompletas: number;

    semanal: {
      dia: string;
      minutos: number;
    }[];
  };
};

type RespuestaResumenAlumno = {
  ok?: boolean;
  resumen?: EstadisticasAlumno;
  mundos?: MundoResumen[];
};

type RespuestaProgresoAlumno = {
  ok?: boolean;
  progreso?: ProgresoActividadReal[];
};

const convertirNumero = (
  valor: unknown,
  valorPredeterminado = 0,
): number => {
  const numeroConvertido = Number(valor);

  return Number.isFinite(numeroConvertido)
    ? numeroConvertido
    : valorPredeterminado;
};

const limitarPorcentaje = (valor: unknown): number => {
  return Math.max(
    0,
    Math.min(100, Math.round(convertirNumero(valor))),
  );
};

const formatearMinutos = (minutos?: number): string => {
  const total = Math.max(
    0,
    Math.floor(convertirNumero(minutos)),
  );

  if (total < 60) {
    return `${total}m`;
  }

  const horas = Math.floor(total / 60);
  const resto = total % 60;

  return resto > 0
    ? `${horas}h ${resto}m`
    : `${horas}h`;
};

const obtenerInicioSemanaActual = (): Date => {
  const fecha = new Date();

  fecha.setHours(0, 0, 0, 0);

  const diaSemana = fecha.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  fecha.setDate(fecha.getDate() - diasDesdeLunes);

  return fecha;
};

function Estadisticas() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [alumno, setAlumno] = useState<Alumno | null>(
    null,
  );

  const [estadisticas, setEstadisticas] =
    useState<EstadisticasAlumno | null>(null);

  const [actividades, setActividades] = useState<
    Actividad[]
  >([]);

  const [cargando, setCargando] = useState(true);

  const [errorEstadisticas, setErrorEstadisticas] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const obtenerUsuarioLocal = () => {
    const claves = [
      "usuario",
      "mathnova_user",
      "user",
      "authUser",
      "auth_session",
      "session",
    ];

    for (const clave of claves) {
      try {
        const valorLocal = localStorage.getItem(clave);

        const valorSesion = sessionStorage.getItem(clave);

        const valor = valorLocal || valorSesion;

        if (!valor) {
          continue;
        }

        const datos = JSON.parse(valor);

        return datos?.usuario ?? datos?.user ?? datos;
      } catch {
        continue;
      }
    }

    return getSessionUser();
  };

  const obtenerIdUsuario = (
    perfil?: Alumno | null,
  ): number | string | null => {
    const usuarioLocal = obtenerUsuarioLocal();

    return (
      perfil?.id_usuario ??
      perfil?.id ??
      usuarioLocal?.id_usuario ??
      usuarioLocal?.id ??
      usuarioLocal?.usuario_id ??
      usuarioLocal?.id_alumno ??
      null
    );
  };

  useEffect(() => {
    const cargarEstadisticas = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("mathnova_token") ||
        sessionStorage.getItem("mathnova_token");

      const usuarioGuardado = obtenerUsuarioLocal();

      if (!token && !usuarioGuardado) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        setCargando(true);
        setErrorEstadisticas("");

        /*
         * Cargamos los datos anteriores como respaldo.
         */
        const [perfilData, estadisticasData] =
          await Promise.all([
            obtenerPerfilAlumno(),

            obtenerEstadisticasAlumno().catch(() => null),
          ]);

        const perfilRespuesta =
          perfilData as unknown as {
            perfil?: Alumno;
            usuario?: Alumno;
          } & Alumno;

        const perfil: Alumno =
          perfilRespuesta?.perfil ??
          perfilRespuesta?.usuario ??
          perfilRespuesta ??
          {};

        const idUsuario = obtenerIdUsuario(perfil);

        let resumenNuevo: EstadisticasAlumno = {};
        let mundosNuevos: MundoResumen[] = [];
        let actividadesNuevas: Actividad[] = [];

        /*
         * Cargamos el progreso nuevo desde
         * public.actividad_progreso.
         */
        if (idUsuario) {
          try {
            const [
              resumenResponse,
              progresoResponse,
            ] = await Promise.all([
              obtenerResumenAlumno(idUsuario),
              obtenerProgresoAlumnoReal(idUsuario),
            ]);

            const posibleResumen =
              resumenResponse as unknown as
                | RespuestaResumenAlumno
                | EstadisticasAlumno;

            if (
              posibleResumen &&
              typeof posibleResumen === "object" &&
              "resumen" in posibleResumen
            ) {
              const respuesta =
                posibleResumen as RespuestaResumenAlumno;

              resumenNuevo = respuesta.resumen ?? {};

              mundosNuevos = Array.isArray(
                respuesta.mundos,
              )
                ? respuesta.mundos
                : [];
            } else {
              resumenNuevo =
                posibleResumen as EstadisticasAlumno;
            }

            const posibleProgreso =
              progresoResponse as unknown as
                | RespuestaProgresoAlumno
                | ProgresoActividadReal[];

            const listaProgreso = Array.isArray(
              posibleProgreso,
            )
              ? posibleProgreso
              : Array.isArray(posibleProgreso?.progreso)
                ? posibleProgreso.progreso
                : [];

            actividadesNuevas = listaProgreso.map(
              (actividad) => ({
                ...actividad,

                id:
                  actividad.id_progreso ??
                  actividad.actividad_codigo,

                titulo:
                  actividad.actividad_titulo ??
                  actividad.actividad_codigo ??
                  "Actividad",

                estado: actividad.completada
                  ? "completada"
                  : "en_curso",

                porcentaje: limitarPorcentaje(
                  actividad.precision,
                ),

                modulo:
                  actividad.mundo ?? "General",

                tema:
                  actividad.tema ||
                  actividad.mundo ||
                  "General",

                puntaje: limitarPorcentaje(
                  actividad.precision,
                ),

                tiempo_segundos: convertirNumero(
                  actividad.tiempo_segundos,
                ),
              }),
            );
          } catch (errorProgreso) {
            console.warn(
              "No se pudo cargar el progreso real del alumno:",
              errorProgreso,
            );
          }
        } else {
          console.warn(
            "No se encontró el id_usuario del alumno.",
          );
        }

        /*
         * Si el servicio nuevo no devuelve actividades,
         * usamos el servicio anterior como respaldo.
         */
        let actividadesAnteriores: Actividad[] = [];

        if (actividadesNuevas.length === 0) {
          try {
            const actividadesData =
              await obtenerProgresoAlumnoAnterior();

            actividadesAnteriores = Array.isArray(
              actividadesData,
            )
              ? actividadesData
              : [];
          } catch {
            actividadesAnteriores = [];
          }
        }

        const respuestaEstadisticasAnterior =
          estadisticasData as unknown as {
            estadisticas?: EstadisticasAlumno;
          } & EstadisticasAlumno;

        const estadisticasAnteriores: EstadisticasAlumno =
          respuestaEstadisticasAnterior?.estadisticas ??
          respuestaEstadisticasAnterior ??
          {};

        const tiempoTotalSegundos = convertirNumero(
          resumenNuevo.tiempo_total_segundos ??
            resumenNuevo.tiempo_estudio_segundos ??
            estadisticasAnteriores.tiempo_total_segundos ??
            0,
        );

        const minutosTotales = convertirNumero(
          resumenNuevo.tiempo_estudio_minutos ??
            Math.floor(tiempoTotalSegundos / 60),
        );

        const leccionesCompletadasNuevas =
          convertirNumero(
            resumenNuevo.actividades_completadas ??
              resumenNuevo.lecciones_completadas ??
              resumenNuevo.leccionesCompletadas ??
              estadisticasAnteriores.actividades_completadas ??
              estadisticasAnteriores.leccionesCompletadas ??
              estadisticasAnteriores.completadas ??
              0,
          );

        const estrellasGanadasNuevas =
          convertirNumero(
            resumenNuevo.estrellas_totales ??
              resumenNuevo.estrellas_ganadas ??
              resumenNuevo.estrellasGanadas ??
              estadisticasAnteriores.estrellas_totales ??
              estadisticasAnteriores.estrellasGanadas ??
              perfil.estrellas_totales ??
              0,
          );

        const rachaNueva = convertirNumero(
          resumenNuevo.racha_actual ??
            resumenNuevo.rachaActual ??
            estadisticasAnteriores.racha_actual ??
            estadisticasAnteriores.rachaActual ??
            perfil.racha_actual ??
            0,
        );

        const promedioNuevo = limitarPorcentaje(
          resumenNuevo.promedio_general ??
            resumenNuevo.precision_promedio ??
            resumenNuevo.promedioGeneral ??
            estadisticasAnteriores.promedioGeneral ??
            estadisticasAnteriores.promedio ??
            0,
        );

        const progresoNuevo = limitarPorcentaje(
          resumenNuevo.progreso_general ??
            resumenNuevo.precision_promedio ??
            estadisticasAnteriores.progreso_general ??
            promedioNuevo,
        );

        const dominioMundosNuevo =
          mundosNuevos.length > 0
            ? mundosNuevos.map((mundo) => ({
                mundo: mundo.mundo,
                promedio: limitarPorcentaje(
                  mundo.precision,
                ),
              }))
            : estadisticasAnteriores.dominioPorMundo ??
              [];

        const estadisticasNormalizadas: EstadisticasAlumno =
          {
            ...estadisticasAnteriores,
            ...resumenNuevo,

            actividades_completadas:
              leccionesCompletadasNuevas,

            lecciones_completadas:
              leccionesCompletadasNuevas,

            leccionesCompletadas:
              leccionesCompletadasNuevas,

            completadas: leccionesCompletadasNuevas,

            estrellas_totales:
              estrellasGanadasNuevas,

            estrellas_ganadas:
              estrellasGanadasNuevas,

            estrellasGanadas: estrellasGanadasNuevas,

            racha_actual: rachaNueva,
            rachaActual: rachaNueva,

            precision_promedio: promedioNuevo,
            promedio_general: promedioNuevo,
            promedioGeneral: promedioNuevo,
            promedio: promedioNuevo,

            progreso_general: progresoNuevo,

            tiempo_total_segundos:
              tiempoTotalSegundos,

            tiempo_estudio_segundos:
              tiempoTotalSegundos,

            tiempo_estudio_minutos: minutosTotales,

            /*
             * El tiempo real tiene prioridad.
             * Así evitamos que un "0m" anterior
             * tape el valor nuevo.
             */
            tiempo_formateado:
              formatearMinutos(minutosTotales),

            dominioPorMundo: dominioMundosNuevo,

            tiempoEstudio: {
              minutos: minutosTotales,

              actividadesCompletas:
                leccionesCompletadasNuevas,

              semanal:
                estadisticasAnteriores.tiempoEstudio
                  ?.semanal ?? [],
            },
          };

        const alumnoNormalizado: Alumno = {
          ...perfil,

          id:
            perfil.id ??
            perfil.id_usuario ??
            usuarioGuardado?.id,

          id_usuario:
            perfil.id_usuario ??
            perfil.id ??
            usuarioGuardado?.id_usuario,

          estrellas_totales:
            estrellasGanadasNuevas,

          racha_actual: rachaNueva,
        };

        const actividadesFinales =
          actividadesNuevas.length > 0
            ? actividadesNuevas
            : actividadesAnteriores;

        console.log(
          "Estadísticas normalizadas:",
          estadisticasNormalizadas,
        );

        console.log(
          "Actividades para estadísticas:",
          actividadesFinales,
        );

        console.log(
          "Mundos del resumen:",
          mundosNuevos,
        );

        setAlumno(alumnoNormalizado);
        setEstadisticas(estadisticasNormalizadas);
        setActividades(actividadesFinales);
      } catch (error) {
        const mensaje =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las estadísticas";

        console.error(
          "Error al cargar estadísticas:",
          error,
        );

        setErrorEstadisticas(mensaje);
        setActividades([]);
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
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const actividadesSeguras = Array.isArray(
    actividades,
  )
    ? actividades
    : [];

  const leccionesCompletadas = convertirNumero(
    estadisticas?.actividades_completadas ??
      estadisticas?.lecciones_completadas ??
      estadisticas?.leccionesCompletadas ??
      estadisticas?.completadas,
  );

  const estrellasGanadas = convertirNumero(
    estadisticas?.estrellas_totales ??
      estadisticas?.estrellas_ganadas ??
      estadisticas?.estrellasGanadas ??
      alumno?.estrellas_totales,
  );

  const rachaActual = convertirNumero(
    estadisticas?.racha_actual ??
      estadisticas?.rachaActual ??
      alumno?.racha_actual,
  );

  const promedioGeneral = limitarPorcentaje(
    estadisticas?.promedio_general ??
      estadisticas?.precision_promedio ??
      estadisticas?.promedioGeneral ??
      estadisticas?.promedio,
  );

  const progresoGeneral = limitarPorcentaje(
    estadisticas?.progreso_general ??
      estadisticas?.precision_promedio ??
      estadisticas?.promedioGeneral,
  );

  const minutosEstudio = convertirNumero(
    estadisticas?.tiempo_estudio_minutos ??
      estadisticas?.tiempoEstudio?.minutos ??
      Math.floor(
        convertirNumero(
          estadisticas?.tiempo_total_segundos,
        ) / 60,
      ),
  );

  const tiempoEstudio = formatearMinutos(
    minutosEstudio,
  );

  /*
   * Construye el progreso semanal usando las fechas
   * reales de las actividades.
   */
  const progresoSemanal = useMemo(() => {
    const dias = [
      "Lun",
      "Mar",
      "Mié",
      "Jue",
      "Vie",
      "Sáb",
      "Dom",
    ];

    const datosBackend = Array.isArray(
      estadisticas?.progresoSemanal,
    )
      ? estadisticas.progresoSemanal
      : [];

    const totalBackend = datosBackend.reduce(
      (total, item) =>
        total + convertirNumero(item.lecciones),
      0,
    );

    let valores: {
      dia: string;
      valor: number;
    }[];

    if (totalBackend > 0) {
      valores = dias.map((dia) => {
        const encontrado = datosBackend.find(
          (item) => item.dia === dia,
        );

        return {
          dia,
          valor: convertirNumero(
            encontrado?.lecciones,
          ),
        };
      });
    } else {
      const inicioSemana =
        obtenerInicioSemanaActual();

      const finSemana = new Date(inicioSemana);

      finSemana.setDate(finSemana.getDate() + 7);

      const conteos = Array(7).fill(0) as number[];

      actividadesSeguras.forEach((actividad) => {
        if (!actividad.completada) {
          return;
        }

        if (!actividad.fecha_ultimo_intento) {
          return;
        }

        const fechaActividad = new Date(
          actividad.fecha_ultimo_intento,
        );

        if (
          Number.isNaN(fechaActividad.getTime()) ||
          fechaActividad < inicioSemana ||
          fechaActividad >= finSemana
        ) {
          return;
        }

        const diferencia =
          fechaActividad.getTime() -
          inicioSemana.getTime();

        const indiceDia = Math.floor(
          diferencia / 86400000,
        );

        if (indiceDia >= 0 && indiceDia < 7) {
          conteos[indiceDia] += 1;
        }
      });

      valores = dias.map((dia, index) => ({
        dia,
        valor: conteos[index],
      }));
    }

    const maximo = Math.max(
      ...valores.map((item) => item.valor),
      1,
    );

    return valores.map((item, index) => ({
      ...item,

      altura: `${Math.max(
        (item.valor / maximo) * 88,
        item.valor > 0 ? 18 : 4,
      )}%`,

      index,
    }));
  }, [
    actividadesSeguras,
    estadisticas?.progresoSemanal,
  ]);

  const rendimientoPorTema = useMemo(() => {
    const datosBackend = Array.isArray(
      estadisticas?.rendimientoPorTema,
    )
      ? estadisticas.rendimientoPorTema
      : [];

    const colores = [
      "blue",
      "green",
      "purple",
      "orange",
      "cyan",
    ];

    if (datosBackend.length > 0) {
      return datosBackend
        .slice(0, 5)
        .map((item, index) => ({
          tema: item.tema,

          porcentaje: limitarPorcentaje(
            item.promedio,
          ),

          color:
            colores[index % colores.length],
        }));
    }

    const grupos = actividadesSeguras.reduce<
      Record<
        string,
        {
          total: number;
          suma: number;
        }
      >
    >((acumulador, actividad) => {
      const tema =
        actividad.tema ||
        actividad.modulo ||
        actividad.mundo ||
        "General";

      if (!acumulador[tema]) {
        acumulador[tema] = {
          total: 0,
          suma: 0,
        };
      }

      acumulador[tema].total += 1;

      acumulador[tema].suma += limitarPorcentaje(
        actividad.porcentaje ??
          actividad.precision ??
          actividad.puntaje,
      );

      return acumulador;
    }, {});

    const temas = Object.entries(grupos).map(
      ([tema, datos], index) => ({
        tema,

        porcentaje:
          datos.total > 0
            ? Math.round(datos.suma / datos.total)
            : 0,

        color:
          colores[index % colores.length],
      }),
    );

    if (temas.length === 0) {
      return [
        {
          tema: "MathNumbers",
          porcentaje: 0,
          color: "blue",
        },
        {
          tema: "MathGeometry",
          porcentaje: 0,
          color: "green",
        },
        {
          tema: "MathData",
          porcentaje: 0,
          color: "purple",
        },
      ];
    }

    return temas.slice(0, 5);
  }, [
    actividadesSeguras,
    estadisticas?.rendimientoPorTema,
  ]);

  const dominioPorMundo = useMemo(() => {
    const datosBackend = Array.isArray(
      estadisticas?.dominioPorMundo,
    )
      ? estadisticas.dominioPorMundo
      : [];

    const nombres: Record<string, string> = {
      MathNumbers: "Planeta Números",
      MathGeometry: "Mundo Geometría",
      MathData: "Galaxia Datos",

      "Planeta Números": "Planeta Números",
      "Mundo Geometría": "Mundo Geometría",
      "Galaxia Datos": "Galaxia Datos",
    };

    if (datosBackend.length > 0) {
      return datosBackend.map((item) => ({
        nombre:
          nombres[item.mundo] || item.mundo,

        porcentaje: limitarPorcentaje(
          item.promedio,
        ),
      }));
    }

    const grupos = actividadesSeguras.reduce<
      Record<
        string,
        {
          total: number;
          suma: number;
        }
      >
    >((acumulador, actividad) => {
      const modulo =
        actividad.modulo ||
        actividad.mundo ||
        "General";

      if (!acumulador[modulo]) {
        acumulador[modulo] = {
          total: 0,
          suma: 0,
        };
      }

      acumulador[modulo].total += 1;

      acumulador[modulo].suma += limitarPorcentaje(
        actividad.porcentaje ??
          actividad.precision ??
          actividad.puntaje,
      );

      return acumulador;
    }, {});

    const mundos = Object.entries(grupos).map(
      ([modulo, datos]) => ({
        nombre: nombres[modulo] || modulo,

        porcentaje:
          datos.total > 0
            ? Math.round(datos.suma / datos.total)
            : 0,
      }),
    );

    if (mundos.length === 0) {
      return [
        {
          nombre: "Planeta Números",
          porcentaje: 0,
        },
        {
          nombre: "Mundo Geometría",
          porcentaje: 0,
        },
        {
          nombre: "Galaxia Datos",
          porcentaje: 0,
        },
      ];
    }

    return mundos;
  }, [
    actividadesSeguras,
    estadisticas?.dominioPorMundo,
  ]);

  /*
   * Calcula el tiempo semanal con las actividades
   * de la semana actual.
   */
  const tiempoSemanal = useMemo(() => {
    const dias = [
      "Lun",
      "Mar",
      "Mié",
      "Jue",
      "Vie",
      "Sáb",
      "Dom",
    ];

    const datosBackend = Array.isArray(
      estadisticas?.tiempoEstudio?.semanal,
    )
      ? estadisticas.tiempoEstudio.semanal
      : [];

    const totalBackend = datosBackend.reduce(
      (total, item) =>
        total + convertirNumero(item.minutos),
      0,
    );

    if (totalBackend > 0) {
      return dias.map((dia) => {
        const encontrado = datosBackend.find(
          (item) => item.dia === dia,
        );

        return {
          dia,

          minutos: convertirNumero(
            encontrado?.minutos,
          ),
        };
      });
    }

    const inicioSemana = obtenerInicioSemanaActual();

    const finSemana = new Date(inicioSemana);

    finSemana.setDate(finSemana.getDate() + 7);

    const minutosPorDia = Array(7).fill(
      0,
    ) as number[];

    actividadesSeguras.forEach((actividad) => {
      if (!actividad.fecha_ultimo_intento) {
        return;
      }

      const fechaActividad = new Date(
        actividad.fecha_ultimo_intento,
      );

      if (
        Number.isNaN(fechaActividad.getTime()) ||
        fechaActividad < inicioSemana ||
        fechaActividad >= finSemana
      ) {
        return;
      }

      const diferencia =
        fechaActividad.getTime() -
        inicioSemana.getTime();

      const indiceDia = Math.floor(
        diferencia / 86400000,
      );

      if (indiceDia < 0 || indiceDia >= 7) {
        return;
      }

      minutosPorDia[indiceDia] += Math.max(
        0,
        Math.round(
          convertirNumero(
            actividad.tiempo_segundos,
          ) / 60,
        ),
      );
    });

    return dias.map((dia, index) => ({
      dia,
      minutos: minutosPorDia[index],
    }));
  }, [
    actividadesSeguras,
    estadisticas?.tiempoEstudio?.semanal,
  ]);

  const puntosTiempo = useMemo(() => {
    const maximo = Math.max(
      ...tiempoSemanal.map(
        (item) => item.minutos,
      ),
      1,
    );

    return tiempoSemanal.map((item, index) => {
      const x =
        index === 0
          ? 10
          : 10 + index * 81.5;

      const y =
        130 -
        (item.minutos / maximo) * 108;

      return {
        x,
        y,
      };
    });
  }, [tiempoSemanal]);

  const polylineTiempo = puntosTiempo
    .map((punto) => `${punto.x},${punto.y}`)
    .join(" ");

  const textoPromedio =
    promedioGeneral >= 80
      ? "Buen trabajo"
      : promedioGeneral >= 60
        ? "Vas mejorando"
        : "Sigue practicando";

  return (
    <main className="estadisticas-page">
      <button
        type="button"
        className={`hamburger-btn ${
          menuOpen ? "hamburger-open" : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (estadoActual) => !estadoActual,
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
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
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
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/seleccion-mundos")
            }
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/retroalimentacion")
            }
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
            onClick={() =>
              irARuta("/perfil-alumno")
            }
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="menu-item active"
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="estadisticas-explorer-box">
          <img
            src={zorroHola}
            alt="Zorrito explorador"
          />

          <span>¡Hola, explorador!</span>
        </div>
      </aside>

      <section className="dashboard-content estadisticas-content">
        <img
          src={heroEstadisticas}
          alt=""
          className="stats-hero-bg"
        />

        <header className="stats-header">
          <h1>Estadísticas</h1>

          <p>
            {errorEstadisticas
              ? errorEstadisticas
              : "Visualiza tu progreso y rendimiento."}
          </p>
        </header>

        <section className="stats-summary">
          <article className="summary-card estadisticas-green-card">
            <div>
              <h3>Lecciones completadas</h3>

              <strong>
                {cargando
                  ? "..."
                  : leccionesCompletadas}
              </strong>

              <p>
                {leccionesCompletadas > 0
                  ? "Actividades completadas"
                  : "Sin actividades todavía"}
              </p>
            </div>

            <img
              src={leccionesIcon}
              alt="Lecciones"
            />
          </article>

          <article className="summary-card estadisticas-yellow-card">
            <div>
              <h3>Estrellas ganadas</h3>

              <strong>
                {cargando
                  ? "..."
                  : estrellasGanadas}
              </strong>

              <p>Se calculan con tu progreso</p>
            </div>

            <img
              src={estrellasIcon}
              alt="Estrellas"
            />
          </article>

          <article className="summary-card estadisticas-red-card">
            <div>
              <h3>Racha actual</h3>

              <strong>
                {cargando ? "..." : rachaActual}
              </strong>

              <p>
                {rachaActual > 0
                  ? "¡Sigue así!"
                  : "Inicia una actividad"}
              </p>
            </div>

            <img
              src={rachaIcon}
              alt="Racha"
            />
          </article>

          <article className="summary-card estadisticas-blue-card">
            <div>
              <h3>Promedio general</h3>

              <strong>
                {cargando
                  ? "..."
                  : `${promedioGeneral}%`}
              </strong>

              <p>{textoPromedio}</p>
            </div>

            <img
              src={promedioIcon}
              alt="Promedio"
            />
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
              <span className="weekly-axis-title">
                Lecciones
              </span>

              <div className="weekly-y-axis">
                <span>16</span>
                <span>12</span>
                <span>8</span>
                <span>4</span>
                <span>0</span>
              </div>

              <div className="weekly-chart">
                {progresoSemanal.map((item) => (
                  <div
                    className="weekly-column"
                    key={item.dia}
                  >
                    <strong>{item.valor}</strong>

                    <span
                      className={`weekly-bar weekly-bar-${item.index}`}
                      style={{
                        height: item.altura,
                      }}
                    />

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
                  <b>
                    {leccionesCompletadas} lecciones
                  </b>

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
              <div
                className="topic-row"
                key={item.tema}
              >
                <div>
                  <span>{item.tema}</span>
                  <b>{item.porcentaje}%</b>
                </div>

                <div className="topic-line">
                  <span
                    className={`topic-fill ${item.color}`}
                    style={{
                      width: `${item.porcentaje}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="legend">
              <span className="legend-green" />
              90-100%

              <span className="legend-blue" />
              70-89%

              <span className="legend-yellow" />
              50-69%

              <span className="legend-red" />
              &lt;50%
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
                  <strong>
                    {progresoGeneral}%
                  </strong>

                  <span>Promedio</span>
                </div>
              </div>

              <div className="world-list">
                {dominioPorMundo.map((mundo) => (
                  <p key={mundo.nombre}>
                    <b>{mundo.nombre}</b>

                    <strong>
                      {mundo.porcentaje}%
                    </strong>
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
                <strong>
                  {cargando
                    ? "..."
                    : tiempoEstudio}
                </strong>

                <p>tiempo acumulado</p>

                <span>
                  {leccionesCompletadas}
                  <br />
                  actividades completas
                </span>
              </div>

              <div className="clean-line-chart">
                <svg
                  viewBox="0 0 520 150"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    y1="20"
                    x2="520"
                    y2="20"
                  />

                  <line
                    x1="0"
                    y1="55"
                    x2="520"
                    y2="55"
                  />

                  <line
                    x1="0"
                    y1="90"
                    x2="520"
                    y2="90"
                  />

                  <line
                    x1="0"
                    y1="125"
                    x2="520"
                    y2="125"
                  />

                  <polyline
                    points={polylineTiempo}
                  />

                  {puntosTiempo.map(
                    (punto, index) => (
                      <circle
                        key={`${punto.x}-${index}`}
                        cx={punto.x}
                        cy={punto.y}
                        r="6"
                      />
                    ),
                  )}
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
            <img
              src={zorroIdeas}
              alt="Zorrito ideas"
              className="ideas-fox"
            />

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

                <p>
                  Tu progreso se actualiza al
                  completar actividades.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  irARuta("/actividades/geometria")
                }
              >
                Practicar ahora
              </button>
            </div>

            <div className="idea green">
              <span className="idea-icon">
                <FiBarChart2 />
              </span>

              <div>
                <b>
                  Mantén tu racha activa cada día.
                </b>

                <p>
                  {rachaActual > 0
                    ? `¡${rachaActual} días de racha!`
                    : "Completa tu primera actividad para iniciar tu racha."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  irARuta("/recompensas")
                }
              >
                Ver racha
              </button>
            </div>

            <div className="idea orange">
              <span className="idea-icon">
                <FaStar />
              </span>

              <div>
                <b>
                  ¡Estás en el camino correcto!
                </b>

                <p>
                  Sigue así y alcanza nuevas metas.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  irARuta("/recompensas")
                }
              >
                Ver metas
              </button>
            </div>
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>
            © MathNova. Todos los derechos
            reservados.
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

            <FiHelpCircle className="help-icon" />
            <FiSettings className="settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Estadisticas;