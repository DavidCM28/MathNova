import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";
import {
  guardarProgresoUsuarioActual,
} from "../../services/progresoService";

import logo from "../../assets/logo_MathNova.png";
import fondoHologramaImg from "../../assets/fondo-holograma.png";
import "./HologramaReportes.css";

/* ---- Reutilizadas de las actividades anteriores ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";

/* ---- Nuevas para la Actividad 4 ---- */
import interferenciaHologramaImg from "../../assets/interferencia-holograma.png";
import iconoGraficaBarrasImg from "../../assets/icono-grafica-barras.png";
import iconoGraficaCircularImg from "../../assets/icono-grafica-circular.png";

/* ---- Audios ---- */
import introBaitAudioHolograma from "../../assets/intro_bit.mp3";
import pistaBaitAudioHolograma from "../../assets/pista_bit.mp3";

/* ---- Audios de resultado ---- */
import audioActividadCompletadaHolograma from "../../assets/actividad_completada_bit.mp3";
import audioVuelveAIntentarloHolograma from "../../assets/vuelve_a_intentarlo_bit.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiSend,
  FiTarget,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiPieChart,
  FiPercent,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiZap,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   CONFIGURACIÓN DEL BACKEND
========================================================= */

const API_URL_BASE =
  (
    import.meta.env.VITE_API_URL as
      | string
      | undefined
  )?.replace(/\/+$/, "") ||
  "http://localhost:3001";

const API_URL =
  API_URL_BASE.endsWith("/api")
    ? API_URL_BASE
    : `${API_URL_BASE}/api`;

/* =========================================================
   DATOS DE LA MISIÓN (valores de referencia para mostrar en
   pantalla; la validación real vive en el backend, que
   hereda los votos reales de la Actividad 3 si existen)
========================================================= */

type UsuarioSesionHolograma = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionHolograma;
  user?: UsuarioSesionHolograma;
  data?: UsuarioSesionHolograma;
  session?: UsuarioSesionHolograma;
};

const extraerIdUsuarioHolograma = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionHolograma;

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
      extraerIdUsuarioHolograma(
        anidado,
      );

    if (idAnidado > 0) {
      return idAnidado;
    }
  }

  return 0;
};

const obtenerIdEstudianteActual = (): number => {
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
      extraerIdUsuarioHolograma(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

type Modulo = "bosque" | "desierto" | "cueva";
type EstadoCelda = "correcto" | "pendiente" | "incorrecto";

const FRECUENCIAS: Record<Modulo, number> = {
  bosque: 4,
  desierto: 3,
  cueva: 3,
};

const PORCENTAJES_CORRECTOS: Record<Modulo, number> = {
  bosque: 40,
  desierto: 30,
  cueva: 30,
};

const NOMBRE_MODULO: Record<Modulo, string> = {
  bosque: "Bosque",
  desierto: "Desierto",
  cueva: "Cueva de Cristal",
};

const COLOR_MODULO: Record<Modulo, string> = {
  bosque: "#16a34a",
  desierto: "#d97706",
  cueva: "#7c3aed",
};

const TOTAL_VOTOS = 10;

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
========================================================= */

type PistaBaitModalProps = {
  tema?: "azul" | "rojo";
  titulo?: string;
  contenido: string;
  videoSrc: string;
  audioSrc?: string;
  botonTexto?: string;
  onClose: () => void;
};

const SALTO_SEGUNDOS = 10;

function PistaBaitModal({
  tema = "azul",
  titulo = "Pista de Bait",
  contenido,
  videoSrc,
  audioSrc,
  botonTexto = "Cerrar y volver a la actividad",
  onClose,
}: PistaBaitModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const sincronizarVideoConAudio = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;
    if (Math.abs(video.currentTime - audio.currentTime) > 0.35) {
      video.currentTime = audio.currentTime;
    }
  };

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    if (audio.paused || audio.ended) {
      audio.play();
      video?.play();
    } else {
      audio.pause();
      video?.pause();
    }
  };

  const saltar = (segundos: number) => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !audio.duration) return;
    const nuevoTiempo = Math.min(Math.max(audio.currentTime + segundos, 0), audio.duration);
    audio.currentTime = nuevoTiempo;
    if (video) video.currentTime = nuevoTiempo;
  };

  const actualizarProgreso = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgreso((audio.currentTime / audio.duration) * 100);
  };

  return createPortal(
    <div className="pb-overlay" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className={`pb-modal pb-modal-${tema}`}>
        <button type="button" className="pb-cerrar" onClick={onClose} aria-label="Cerrar">
          <FiX />
        </button>

        <div className="pb-video-wrap">
          <video
            ref={videoRef}
            src={videoSrc}
            className="pb-video"
            muted
            playsInline
            preload="auto"
            onTimeUpdate={sincronizarVideoConAudio}
            aria-hidden="true"
          />
        </div>

        <h3>{titulo}</h3>

        <p>{contenido}</p>

        <div className="pb-controles">
          <button
            type="button"
            className={`pb-btn-salto pb-btn-salto-${tema}`}
            onClick={() => saltar(-SALTO_SEGUNDOS)}
            aria-label={`Retroceder ${SALTO_SEGUNDOS} segundos`}
          >
            <FiRotateCcw /> {SALTO_SEGUNDOS}s
          </button>

          <button
            type="button"
            className={`pb-btn-play pb-btn-play-${tema}`}
            onClick={alternarReproduccion}
            aria-label={reproduciendo ? "Pausar" : "Reproducir"}
          >
            {reproduciendo ? <FiPause /> : <FiPlay />}
          </button>

          <button
            type="button"
            className={`pb-btn-salto pb-btn-salto-${tema}`}
            onClick={() => saltar(SALTO_SEGUNDOS)}
            aria-label={`Adelantar ${SALTO_SEGUNDOS} segundos`}
          >
            {SALTO_SEGUNDOS}s <FiRotateCw />
          </button>
        </div>

        <div className="pb-progress-track">
          <div className={`pb-progress-fill pb-progress-fill-${tema}`} style={{ width: `${progreso}%` }} />
        </div>

        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onEnded={() => setReproduciendo(false)}
            onTimeUpdate={actualizarProgreso}
          />
        )}

        <button type="button" className={`pb-cerrar-btn pb-cerrar-btn-${tema}`} onClick={onClose}>
          {botonTexto}
        </button>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   COMPONENTE: REPRODUCTOR DE AUDIO DEL RESULTADO
   Se reproduce solo apenas se monta, y muestra los
   controles normales de un reproductor de audio: retroceder
   10s, pausar/reproducir y adelantar 10s. Mismo patrón que
   las demás actividades. Si no se le pasa src (audio aún
   pendiente), no muestra nada.
========================================================= */

const RESULT_AUDIO_SALTO_SEGUNDOS = 10;

function ResultAudioPlayer({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !src) {
      return;
    }

    audio.currentTime = 0;
    audio.volume = 1;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(
          "El audio del resultado no pudo iniciarse automáticamente:",
          error,
        );
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused || audio.ended) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const saltar = (segundos: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + segundos, 0),
      audio.duration,
    );
  };

  const actualizarProgreso = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgreso((audio.currentTime / audio.duration) * 100);
  };

  if (!src) return null;

  return (
    <div className="hol-modal-audio">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        autoPlay
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onEnded={() => setReproduciendo(false)}
        onTimeUpdate={actualizarProgreso}
      />

      <button
        type="button"
        className="hol-modal-audio-btn"
        onClick={() => saltar(-RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Retroceder 10 segundos"
      >
        <FiRotateCcw />
      </button>

      <button
        type="button"
        className="hol-modal-audio-btn hol-modal-audio-btn--play"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? "Pausar" : "Reproducir"}
      >
        {reproduciendo ? <FiPause /> : <FiPlay />}
      </button>

      <button
        type="button"
        className="hol-modal-audio-btn"
        onClick={() => saltar(RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Adelantar 10 segundos"
      >
        <FiRotateCw />
      </button>

      <div className="hol-modal-audio-progress">
        <div style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function HologramaReportes() {
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const guardandoProgresoRef =
    useRef(false);

  const [tipoGrafica, setTipoGrafica] = useState<"barras" | "circular" | null>("barras");

  const [alturaBarras, setAlturaBarras] = useState<Record<Modulo, string>>({
    bosque: "",
    desierto: "",
    cueva: "",
  });
  const [barraEstados, setBarraEstados] = useState<Record<Modulo, EstadoCelda>>({
    bosque: "pendiente",
    desierto: "pendiente",
    cueva: "pendiente",
  });
  const [barraBloqueada, setBarraBloqueada] = useState<Record<Modulo, boolean>>({
    bosque: false,
    desierto: false,
    cueva: false,
  });

  const [porcentajes, setPorcentajes] = useState<Record<Modulo, string>>({
    bosque: "",
    desierto: "",
    cueva: "",
  });
  const [porcentajeEstados, setPorcentajeEstados] = useState<Record<Modulo, EstadoCelda>>({
    bosque: "pendiente",
    desierto: "pendiente",
    cueva: "pendiente",
  });
  const [porcentajeBloqueado, setPorcentajeBloqueado] = useState<Record<Modulo, boolean>>({
    bosque: false,
    desierto: false,
    cueva: false,
  });

  const [preguntaBarraAlta, setPreguntaBarraAlta] = useState<Modulo | null>(null);
  const [preguntaSectorMayor, setPreguntaSectorMayor] = useState<Modulo | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);

  const [cargandoBarras, setCargandoBarras] = useState(false);
  const [cargandoCirculo, setCargandoCirculo] = useState(false);
  const [cargandoActivar, setCargandoActivar] = useState(false);

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
  const cargarProgreso = async () => {
    if (!ID_ESTUDIANTE) {
      console.warn(
        "No se encontró el estudiante autenticado para cargar Holograma de Reportes.",
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/holograma/progreso/${ID_ESTUDIANTE}`);
      const data = await response.json();

      if (data.success && data.data) {
        const progreso = data.data;
        const valoresBarras = (progreso.valores_barras || {}) as Record<string, number>;
        const intentosBarras = (progreso.intentos_barras || {}) as Record<string, number>;
        const valoresPorcentajes = (progreso.valores_porcentajes || {}) as Record<string, number>;
        const intentosPorcentajes = (progreso.intentos_porcentajes || {}) as Record<string, number>;
        const historial = (progreso.historial_intentos || []) as any[];

        const ultimoIntento = (tipo: "barra" | "sector", modulo: string) =>
          [...historial].reverse().find((h) => h.tipo === tipo && h.modulo === modulo);

        (["bosque", "desierto", "cueva"] as Modulo[]).forEach((m) => {
          if (valoresBarras[m] !== undefined) {
            setAlturaBarras((prev) => ({ ...prev, [m]: String(valoresBarras[m]) }));
            setBarraEstados((prev) => ({ ...prev, [m]: "correcto" }));
            setBarraBloqueada((prev) => ({ ...prev, [m]: (intentosBarras[m] || 0) >= 5 }));
          } else {
            const ultimo = ultimoIntento("barra", m);
            if (ultimo) {
              setAlturaBarras((prev) => ({ ...prev, [m]: String(ultimo.valor) }));
              setBarraEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
            }
          }

          if (valoresPorcentajes[m] !== undefined) {
            setPorcentajes((prev) => ({ ...prev, [m]: String(valoresPorcentajes[m]) }));
            setPorcentajeEstados((prev) => ({ ...prev, [m]: "correcto" }));
            setPorcentajeBloqueado((prev) => ({ ...prev, [m]: (intentosPorcentajes[m] || 0) >= 5 }));
          } else {
            const ultimo = ultimoIntento("sector", m);
            if (ultimo) {
              setPorcentajes((prev) => ({ ...prev, [m]: String(ultimo.valor) }));
              setPorcentajeEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
            }
          }
        });

        if (progreso.tipo_grafica_seleccionado) {
          setTipoGrafica(progreso.tipo_grafica_seleccionado as "barras" | "circular");
        }
        if (progreso.pregunta_barra_alta) {
          setPreguntaBarraAlta(progreso.pregunta_barra_alta as Modulo);
        }
        if (progreso.pregunta_sector_mayor) {
          setPreguntaSectorMayor(progreso.pregunta_sector_mayor as Modulo);
        }

        if (progreso.completada) {
          setResultado(progreso.resultado_correcto ? "exito" : "fallo");
        }
      }
    } catch (error) {
      console.error("Error al cargar progreso:", error);
    }
  };

  void cargarProgreso();
}, [ID_ESTUDIANTE]);

  // ==========================================
  // VERIFICAR GRÁFICA DE BARRAS (celda por celda)
  // ==========================================

  const verificarBarras = async () => {
    if (!ID_ESTUDIANTE) {
      alert(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoBarras(true);
    try {
      for (const m of ["bosque", "desierto", "cueva"] as Modulo[]) {
        if (barraBloqueada[m] || alturaBarras[m].trim() === "") continue;

        const response = await fetch(`${API_URL}/holograma/validar-barra`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            modulo: m,
            valor: Number(alturaBarras[m]),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const r = data.data;

          if (r.celda_completada && !r.correcto) {
            setAlturaBarras((prev) => ({ ...prev, [m]: String(r.respuesta_correcta) }));
            setBarraEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
            setBarraBloqueada((prev) => ({ ...prev, [m]: true }));
          } else if (r.correcto) {
            setBarraEstados((prev) => ({ ...prev, [m]: "correcto" }));
          } else {
            setBarraEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar barras:", error);
    } finally {
      setCargandoBarras(false);
    }
  };

  // ==========================================
  // VERIFICAR GRÁFICA CIRCULAR (sector por sector)
  // ==========================================

  const verificarCirculo = async () => {
    if (!ID_ESTUDIANTE) {
      alert(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoCirculo(true);
    try {
      for (const m of ["bosque", "desierto", "cueva"] as Modulo[]) {
        if (porcentajeBloqueado[m] || porcentajes[m].trim() === "") continue;

        const response = await fetch(`${API_URL}/holograma/validar-sector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            modulo: m,
            valor: Number(porcentajes[m]),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const r = data.data;

          if (r.celda_completada && !r.correcto) {
            setPorcentajes((prev) => ({ ...prev, [m]: String(r.respuesta_correcta) }));
            setPorcentajeEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
            setPorcentajeBloqueado((prev) => ({ ...prev, [m]: true }));
          } else if (r.correcto) {
            setPorcentajeEstados((prev) => ({ ...prev, [m]: "correcto" }));
          } else {
            setPorcentajeEstados((prev) => ({ ...prev, [m]: "incorrecto" }));
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar porcentajes:", error);
    } finally {
      setCargandoCirculo(false);
    }
  };

  const barraEstado = (modulo: Modulo): EstadoCelda => barraEstados[modulo];
  const porcentajeEstado = (modulo: Modulo): EstadoCelda => porcentajeEstados[modulo];
  const porcentajesVerificados = (["bosque", "desierto", "cueva"] as Modulo[]).some(
    (m) => porcentajeEstados[m] !== "pendiente"
  );

  // ==========================================
  // ACTIVAR HOLOGRAMA
  // ==========================================

  const activarHolograma = async () => {
    if (
      !tipoGrafica ||
      !preguntaBarraAlta ||
      !preguntaSectorMayor ||
      cargandoActivar ||
      guardandoProgresoRef.current
    ) {
      return;
    }

    if (!ID_ESTUDIANTE) {
      alert(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoActivar(true);
    guardandoProgresoRef.current =
      true;

    try {
      const response = await fetch(
        `${API_URL}/holograma/activar`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id_estudiante:
              ID_ESTUDIANTE,
            tipo_grafica:
              tipoGrafica,
            pregunta_barra_alta:
              preguntaBarraAlta,
            pregunta_sector_mayor:
              preguntaSectorMayor,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.mensaje ||
            data?.message ||
            `HTTP ${response.status}`,
        );
      }

      if (data.success && data.data) {
        const correcto =
          Boolean(
            data.data.correcto,
          );

        const modulos =
          [
            "bosque",
            "desierto",
            "cueva",
          ] as Modulo[];

        const barrasCorrectas =
          modulos.every(
            (modulo) =>
              barraEstados[
                modulo
              ] === "correcto",
          );

        const porcentajesCorrectos =
          modulos.every(
            (modulo) =>
              porcentajeEstados[
                modulo
              ] === "correcto",
          );

        const interpretacionCorrecta =
          preguntaBarraAlta ===
            "bosque" &&
          preguntaSectorMayor ===
            "bosque";

        /*
         * La actividad se resume en cuatro pasos:
         * 1) tipo de gráfica,
         * 2) barras,
         * 3) porcentajes,
         * 4) interpretación.
         */
        const aciertosCalculados =
          Number(
            tipoGrafica ===
              "barras",
          ) +
          Number(
            barrasCorrectas,
          ) +
          Number(
            porcentajesCorrectos,
          ) +
          Number(
            interpretacionCorrecta,
          );

        const aciertosUnificados =
          correcto
            ? 4
            : aciertosCalculados;

        const tiempoSegundos =
          Math.max(
            1,
            Math.floor(
              (
                Date.now() -
                inicioActividadRef.current
              ) / 1000,
            ),
          );

        try {
          const progresoUnificado =
            await guardarProgresoUsuarioActual({
              mundo: "MathData",
              tema:
                "Representación e interpretación de datos",
              actividad_codigo:
                "mathdata-holograma-reportes",
              actividad_titulo:
                "El Holograma de Reportes",
              respuestas: {
                tipo_grafica:
                  tipoGrafica,
                alturas_barras:
                  Object.fromEntries(
                    modulos.map(
                      (modulo) => [
                        modulo,
                        Number(
                          alturaBarras[
                            modulo
                          ],
                        ),
                      ],
                    ),
                  ),
                porcentajes:
                  Object.fromEntries(
                    modulos.map(
                      (modulo) => [
                        modulo,
                        Number(
                          porcentajes[
                            modulo
                          ],
                        ),
                      ],
                    ),
                  ),
                pregunta_barra_alta:
                  preguntaBarraAlta,
                pregunta_sector_mayor:
                  preguntaSectorMayor,
              },
              aciertos:
                aciertosUnificados,
              total_preguntas: 4,
              tiempo_segundos:
                tiempoSegundos,
              xp_base: 50,
              completada:
                correcto,
            });

          console.log(
            "Progreso del Holograma de Reportes guardado:",
            progresoUnificado.progreso,
          );
        } catch (
          progresoError
        ) {
          console.error(
            "La actividad se validó, pero no se pudo registrar en el progreso unificado:",
            progresoError,
          );
        }

        inicioActividadRef.current =
          Date.now();

        setResultado(
          correcto
            ? "exito"
            : "fallo",
        );
      }
    } catch (error) {
      console.error(
        "Error al activar el holograma:",
        error,
      );

      const mensaje =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor.";

      alert(`❌ ${mensaje}`);
    } finally {
      setCargandoActivar(false);
      guardandoProgresoRef.current =
        false;
    }
  };

  // ==========================================
  // ABRIR PISTA (registra la consulta en el backend)
  // ==========================================

  const abrirPistaBait = () => {
    setMostrarPistaBait(true);

    if (!ID_ESTUDIANTE) {
      return;
    }

    fetch(`${API_URL}/holograma/pista-consultada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
    }).catch((error) => console.error("Error al registrar consulta de pista:", error));
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
    try {
      await fetch(`${API_URL}/holograma/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setTipoGrafica("barras");
    setAlturaBarras({ bosque: "", desierto: "", cueva: "" });
    setBarraEstados({ bosque: "pendiente", desierto: "pendiente", cueva: "pendiente" });
    setBarraBloqueada({ bosque: false, desierto: false, cueva: false });
    setPorcentajes({ bosque: "", desierto: "", cueva: "" });
    setPorcentajeEstados({ bosque: "pendiente", desierto: "pendiente", cueva: "pendiente" });
    setPorcentajeBloqueado({ bosque: false, desierto: false, cueva: false });
    setPreguntaBarraAlta(null);
    setPreguntaSectorMayor(null);
    setResultado(null);

    guardandoProgresoRef.current =
      false;

    inicioActividadRef.current =
      Date.now();
  };

  const graficaMaxima = 5;

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
  // ==========================================

  if (resultado === "exito") return (
    <div className="hol-modal-overlay hol-modal-overlay--completed" role="presentation">
      <section
        className="hol-modal hol-modal--completed"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hol-result-title"
      >
        <div className="hol-modal-decoration hol-modal-decoration--one" />
        <div className="hol-modal-decoration hol-modal-decoration--two" />

        <div className="hol-modal-main">
          <header className="hol-modal-header">
            <div className="hol-modal-status-icon">
              <FiCheckCircle />
            </div>

            <div className="hol-modal-header-copy">
              <span className="hol-modal-badge">
                <FiCheckCircle />
                Actividad completada
              </span>

              <h1 id="hol-result-title">¡Actividad completada!</h1>

              <p>
                Has terminado con éxito la misión de{" "}
                <span className="hol-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="hol-modal-content">
            <div className="hol-modal-character">
              <img
                src={villanoTrofeoCompleto}
                alt="Villano celebrando con trofeo"
                draggable={false}
              />
            </div>

            <article className="hol-modal-message">
              <span className="hol-modal-message-label">Resultado de la misión</span>
              <h2>¡Lo lograste, agente!</h2>
              <p>
                El holograma está proyectado sobre la mesa de mando. El
                centro tiene su reporte visual completo. El mago no pudo
                detenernos.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={audioActividadCompletadaHolograma} />

          <article className="hol-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div className="hol-modal-stats">
              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>4/4</strong>
                  <small>¡Perfecto!</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>—</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>100%</strong>
                  <small>¡Impecable!</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>+50 pts</strong>
                  <small>Puntos ganados</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoInsignia} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Insignia obtenida</span>
                  <strong>Misión cumplida</strong>
                  <small>¡Felicidades!</small>
                </div>
              </article>
            </div>
          </article>
        </div>

        <aside className="hol-modal-side">
          <article className="hol-modal-side-message">
            <span>¡Misión completada!</span>
            <strong>Sigue avanzando por MathData</strong>
            <p>Cada actividad superada fortalece tus habilidades matemáticas.</p>
          </article>

          <div className="hol-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>40%</strong>
            </div>
            <div className="hol-modal-progress-bar">
              <span style={{ width: "40%" }} />
            </div>
          </div>

          <div className="hol-modal-actions">
            <button
              type="button"
              className="hol-modal-action hol-modal-action--primary"
              onClick={() => navigate("/actividades-math-data/sensor-frecuencias")}
            >
              <FiArrowRight />
              <span>Siguiente actividad</span>
            </button>

            <button
              type="button"
              className="hol-modal-action hol-modal-action--secondary"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw />
              <span>Repetir actividad</span>
            </button>

            <button
              type="button"
              className="hol-modal-action hol-modal-action--secondary"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );

  // ==========================================
  // VENTANA EMERGENTE: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div className="hol-modal-overlay hol-modal-overlay--retry" role="presentation">
      <section
        className="hol-modal hol-modal--retry"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hol-result-title-fallo"
      >
        <div className="hol-modal-decoration hol-modal-decoration--one" />
        <div className="hol-modal-decoration hol-modal-decoration--two" />

        <div className="hol-modal-main">
          <header className="hol-modal-header">
            <div className="hol-modal-status-icon">
              <FiRefreshCw />
            </div>

            <div className="hol-modal-header-copy">
              <span className="hol-modal-badge">
                <FiRefreshCw />
                Vuelve a intentarlo
              </span>

              <h1 id="hol-result-title-fallo">¡Vuelve a intentarlo!</h1>

              <p>
                Aún no completas con éxito la misión de{" "}
                <span className="hol-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="hol-modal-content">
            <div className="hol-modal-character">
              <img src={villanoIntentar} alt="Villano retando" draggable={false} />
            </div>

            <article className="hol-modal-message">
              <span className="hol-modal-message-label">Resultado de la misión</span>
              <h2>¡No te rindas, piloto!</h2>
              <p>
                Revisa la altura de cada barra y el porcentaje de cada
                sector. Recuerda: porcentaje = votos ÷ total × 100.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={audioVuelveAIntentarloHolograma} />

          <article className="hol-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div className="hol-modal-stats">
              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>1/4</strong>
                  <small>¡Sigue así!</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>—</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>25%</strong>
                  <small>Puedes mejorar</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>+10 pts</strong>
                  <small>Puntos ganados</small>
                </div>
              </article>

              <article className="hol-modal-stat">
                <div className="hol-modal-stat-icon">
                  <img src={iconoInsignia} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Insignia obtenida</span>
                  <strong>Sigue intentando</strong>
                  <small>¡No te rindas!</small>
                </div>
              </article>
            </div>
          </article>
        </div>

        <aside className="hol-modal-side">
          <article className="hol-modal-side-message">
            <span>¡No te rindas!</span>
            <strong>Cada intento te ayuda a mejorar</strong>
            <p>Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.</p>
          </article>

          <div className="hol-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>40%</strong>
            </div>
            <div className="hol-modal-progress-bar">
              <span style={{ width: "40%" }} />
            </div>
          </div>

          <div className="hol-modal-actions">
            <button
              type="button"
              className="hol-modal-action hol-modal-action--primary"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw />
              <span>Intentar de nuevo</span>
            </button>

            <button
              type="button"
              className="hol-modal-action hol-modal-action--secondary"
              onClick={abrirPistaBait}
            >
              <FiTarget />
              <span>Ver pista</span>
            </button>

            <button
              type="button"
              className="hol-modal-action hol-modal-action--secondary"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="¡No te rindas! Mira la tabla: Bosque 4, Desierto 3, Cueva de Cristal 3. Para la gráfica de barras, esas son las alturas exactas. Para la gráfica circular, divide cada número entre 10 y multiplica por 100. ¡Tú puedes!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioHolograma}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="hol-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="hol-sidebar">
        <img src={logo} alt="MathNova" className="hol-logo-img" />

        <nav className="hol-nav">
          <button className="hol-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="hol-nav-item hol-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="hol-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="hol-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="hol-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="hol-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="hol-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="hol-progreso-track">
            <div className="hol-progreso-fill" style={{ width: "75%" }} />
          </div>
          <small>3/4 actividad</small>
        </div>

        <div className="hol-xp-card">
          <small>XP acumulados</small>
          <strong>180 XP ⭐</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="hol-main" style={{ backgroundImage: `url(${fondoHologramaImg})` }}>
        <header className="hol-header">
          <button className="hol-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver al tema
          </button>
          <button type="button" className="hol-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="hol-top-row">
          <div className="hol-titulo-bloque">
            <h1>El Holograma de Reportes</h1>
            <p>
              Transforma los datos de la encuesta en una gráfica de barras y
              una gráfica circular, y luego interprétalas para activar el
              holograma.
            </p>

            <div className="hol-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="hol-bait-avatar-img" />

              <div className="hol-explica-burbuja">
                <div className="hol-explica-titulo-row">
                  <strong>BIT te explica</strong>
                  <button
                    className="hol-audio-btn"
                    type="button"
                    onClick={() => setMostrarIntroBait(true)}
                    aria-label="Escuchar explicación"
                  >
                    <FiVolume2 />
                  </button>
                </div>
                <p>
                  ¡Agente! El Centro de Mando recibió los datos de la
                  encuesta. Ahora necesitan un reporte visual: una gráfica
                  de barras y una gráfica circular. Constrúyelas
                  correctamente y el holograma se proyectará sobre la mesa
                  de mando. ¡El mago no va a ganar esta vez!
                </p>
              </div>
            </div>
          </div>

          <img
            src={interferenciaHologramaImg}
            alt="Interferencia de Divide: Ja, ja. El Centro de Mando quiere un reporte visual, pero los datos crudos no significan nada sin una gráfica bien construida. A ver si eres capaz de transformarlos... o el holograma nunca se activará."
            className="hol-villano-box"
          />

          <div className="hol-datos-card">
            <div className="hol-datos-titulo">Datos de la encuesta</div>
            <table className="hol-datos-tabla">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Frecuencia</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(FRECUENCIAS) as Modulo[]).map((m) => (
                  <tr key={m}>
                    <td>{NOMBRE_MODULO[m]}</td>
                    <td>{FRECUENCIAS[m]}</td>
                    <td>{PORCENTAJES_CORRECTOS[m]} %</td>
                  </tr>
                ))}
                <tr className="hol-fila-total">
                  <td>TOTAL</td>
                  <td>{TOTAL_VOTOS}</td>
                  <td>100 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FILA DE 4 PASOS */}
        <div className="hol-pasos-row">
          {/* PASO 1: ELIGE EL TIPO DE GRÁFICA */}
          <div className="hol-paso-card">
            <div className="hol-paso-header">
              <span className="hol-paso-num">1</span>
              <strong>Elige el tipo de gráfica</strong>
            </div>
            <p className="hol-paso-pregunta">
              ¿Cuál usarías para ver cuántos votos tuvo cada módulo
              exactamente?
            </p>

            <div className="hol-tipo-opciones">
              <button
                type="button"
                className={`hol-tipo-opcion ${tipoGrafica === "barras" ? "hol-tipo-opcion-activa" : ""}`}
                onClick={() => setTipoGrafica("barras")}
                aria-pressed={tipoGrafica === "barras"}
                disabled={cargandoActivar}
              >
                <img src={iconoGraficaBarrasImg} alt="" className="hol-tipo-icono" />
                <div className="hol-tipo-texto">
                  <strong>Gráfica de Barras</strong>
                  <small>Comparar cantidades exactas</small>
                </div>
                {tipoGrafica === "barras" && <FiCheckCircle className="hol-tipo-check" />}
              </button>

              <button
                type="button"
                className={`hol-tipo-opcion ${tipoGrafica === "circular" ? "hol-tipo-opcion-activa" : ""}`}
                onClick={() => setTipoGrafica("circular")}
                aria-pressed={tipoGrafica === "circular"}
                disabled={cargandoActivar}
              >
                <img src={iconoGraficaCircularImg} alt="" className="hol-tipo-icono" />
                <div className="hol-tipo-texto">
                  <strong>Gráfica Circular</strong>
                  <small>Ver proporciones del total</small>
                </div>
                {tipoGrafica === "circular" && <FiCheckCircle className="hol-tipo-check" />}
              </button>
            </div>
          </div>

          {/* PASO 2: CONSTRUYE LA GRÁFICA DE BARRAS */}
          <div className="hol-paso-card">
            <div className="hol-paso-header">
              <span className="hol-paso-num">2</span>
              <strong>Construye la gráfica de barras</strong>
            </div>
            <p className="hol-paso-pregunta">
              Escribe la altura correcta de cada barra. La altura debe ser
              igual al número de votos.
            </p>

            <div className="hol-grafica-barras">
              <div className="hol-barras-eje-y">
                {Array.from({ length: graficaMaxima + 1 }, (_, i) => graficaMaxima - i).map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div className="hol-barras-area">
                {(Object.keys(FRECUENCIAS) as Modulo[]).map((m) => {
                  const valorMostrado = Number(alturaBarras[m]) || 0;
                  const alturaPct = Math.min(valorMostrado, graficaMaxima) / graficaMaxima * 100;
                  return (
                    <div className="hol-barra-col" key={m}>
                      {valorMostrado > 0 && <span className="hol-barra-valor">{valorMostrado}</span>}
                      <div className="hol-barra-track">
                        <div
                          className="hol-barra-fill"
                          style={{ height: `${alturaPct}%`, background: COLOR_MODULO[m] }}
                        />
                      </div>
                      <small>{NOMBRE_MODULO[m]}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hol-barras-inputs">
              {(Object.keys(FRECUENCIAS) as Modulo[]).map((m) => (
                <div className="hol-barra-input-grupo" key={m}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`hol-barra-input hol-barra-input-${barraEstado(m)}`}
                    value={alturaBarras[m]}
                    onChange={(e) =>
                      setAlturaBarras((prev) => ({ ...prev, [m]: e.target.value }))
                    }
                    aria-label={`Altura de la barra de ${NOMBRE_MODULO[m]}`}
                    disabled={
                      cargandoBarras ||
                      cargandoActivar ||
                      barraBloqueada[m]
                    }
                  />
                  {barraEstado(m) === "correcto" && <FiCheckCircle className="hol-check-verde" />}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="hol-verificar-btn"
              onClick={verificarBarras}
              disabled={cargandoBarras}
            >
              <FiBarChart2 /> {cargandoBarras ? "Verificando..." : "Verificar gráfica"}
            </button>
          </div>

          {/* PASO 3: CONSTRUYE LA GRÁFICA CIRCULAR */}
          <div className="hol-paso-card">
            <div className="hol-paso-header">
              <span className="hol-paso-num">3</span>
              <strong>Construye la gráfica circular</strong>
            </div>
            <p className="hol-paso-pregunta">
              Calcula el porcentaje: votos ÷ total × 100. El total es{" "}
              {TOTAL_VOTOS}.
            </p>

            <div className="hol-circulo-wrap">
              <div
                className="hol-circulo-svg"
                style={{
                  background: `conic-gradient(${COLOR_MODULO.bosque} 0% 40%, ${COLOR_MODULO.desierto} 40% 70%, ${COLOR_MODULO.cueva} 70% 100%)`,
                }}
              >
                <div className="hol-circulo-centro">
                  {porcentajesVerificados
                    ? `${PORCENTAJES_CORRECTOS.bosque}%`
                    : <FiPieChart />}
                </div>
              </div>

              <div className="hol-circulo-leyenda">
                {(Object.keys(PORCENTAJES_CORRECTOS) as Modulo[]).map((m) => (
                  <div className="hol-leyenda-fila" key={m}>
                    <span
                      className="hol-leyenda-punto"
                      style={{ background: COLOR_MODULO[m] }}
                    />
                    <span className="hol-leyenda-nombre">{NOMBRE_MODULO[m]}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`hol-porcentaje-input hol-porcentaje-input-${porcentajeEstado(m)}`}
                      value={porcentajes[m]}
                      onChange={(e) =>
                        setPorcentajes((prev) => ({ ...prev, [m]: e.target.value }))
                      }
                      aria-label={`Porcentaje de ${NOMBRE_MODULO[m]}`}
                      disabled={
                        cargandoCirculo ||
                        cargandoActivar ||
                        porcentajeBloqueado[m]
                      }
                    />
                    <span>%</span>
                    {porcentajeEstado(m) === "correcto" && (
                      <FiCheckCircle className="hol-check-verde" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="hol-verificar-btn"
              onClick={verificarCirculo}
              disabled={cargandoCirculo}
            >
              <FiPercent /> {cargandoCirculo ? "Verificando..." : "Verificar porcentajes"}
            </button>
          </div>

          {/* PASO 4: PREGUNTAS DE INTERPRETACIÓN */}
          <div className="hol-paso-card">
            <div className="hol-paso-header">
              <span className="hol-paso-num">4</span>
              <strong>Preguntas de interpretación</strong>
            </div>

            <div className="hol-pregunta-bloque">
              <p className="hol-paso-pregunta">
                Mirando la gráfica de barras, ¿qué módulo tiene la barra más
                alta?
              </p>
              <div className="hol-opciones-radio">
                {(Object.keys(FRECUENCIAS) as Modulo[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`hol-opcion-radio ${
                      preguntaBarraAlta === m ? "hol-opcion-radio-activa" : ""
                    }`}
                    onClick={() => setPreguntaBarraAlta(m)}
                    aria-pressed={preguntaBarraAlta === m}
                    disabled={cargandoActivar}
                  >
                    <span className="hol-radio-circulo" />
                    {NOMBRE_MODULO[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="hol-pregunta-bloque">
              <p className="hol-paso-pregunta">
                Mirando la gráfica circular, ¿qué sector ocupa la mayor
                porción del círculo?
              </p>
              <div className="hol-opciones-radio">
                {(Object.keys(FRECUENCIAS) as Modulo[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`hol-opcion-radio ${
                      preguntaSectorMayor === m ? "hol-opcion-radio-activa" : ""
                    }`}
                    onClick={() => setPreguntaSectorMayor(m)}
                    aria-pressed={preguntaSectorMayor === m}
                    disabled={cargandoActivar}
                  >
                    <span className="hol-radio-circulo" />
                    {NOMBRE_MODULO[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: PISTA + ACTIVAR HOLOGRAMA */}
        <div className="hol-bottom-row">
          <div className="hol-pista-card">
            <button
              type="button"
              className="hol-pista-trigger"
              onClick={abrirPistaBait}
            >
              <img src={baitPistaImg} alt="" className="hol-pista-icono" />
              <strong>Pista de BIT</strong>
            </button>

            <div className="hol-pista-items">
              <div className="hol-pista-item">
                <FiBarChart2 />
                <span>La altura de cada barra es igual al número de votos.</span>
              </div>
              <div className="hol-pista-item">
                <FiPercent />
                <span>porcentaje = votos ÷ total × 100</span>
              </div>
              <div className="hol-pista-item">
                <FiPieChart />
                <span>Bosque: 4/10=40% · Desierto: 3/10=30% · Cueva: 3/10=30%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="hol-activar-btn"
            onClick={activarHolograma}
            disabled={!tipoGrafica || !preguntaBarraAlta || !preguntaSectorMayor || cargandoActivar}
          >
            <FiZap /> {cargandoActivar ? "Activando..." : "Activar Holograma"}
          </button>
        </div>
      </main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Agente! El Centro de Mando recibió los datos de la encuesta. Ahora necesitan un reporte visual: una gráfica de barras y una gráfica circular. Constrúyelas correctamente y el holograma se proyectará sobre la mesa de mando. ¡El mago no va a ganar esta vez!"
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioHolograma}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="¡No te rindas! Mira la tabla: Bosque 4, Desierto 3, Cueva de Cristal 3. Para la gráfica de barras, esas son las alturas exactas. Para la gráfica circular, divide cada número entre 10 y multiplica por 100. ¡Tú puedes!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioHolograma}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}