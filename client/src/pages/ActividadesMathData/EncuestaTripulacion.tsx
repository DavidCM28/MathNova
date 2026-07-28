import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";
import {
  guardarProgresoUsuarioActual,
} from "../../services/progresoService";

import logo from "../../assets/logo_MathNova.png";
import "./EncuestaTripulacion.css";

/* ---- Reutilizadas tal cual de Rampas de Lanzamiento ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";

/* ---- Nuevas para la Actividad 3 ---- */
import interferenciaDivideEncuestaImg from "../../assets/interferencia-divide-encuesta.png";
import astronautasImg from "../../assets/astronautas-tripulacion.png";
import interferenciaActivaImg from "../../assets/interferencia-activa.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";
import introBaitAudioEncuesta from "../../assets/encuesta-intro-audio.mp3";
import pistaBaitAudioEncuesta from "../../assets/encuesta-pista-audio.mp3";
import baitAudioActividadCompletada from "../../assets/encuesta-actividad-completada.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/encuesta-vuelve-a-intentarlo.mp3";

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
  FiClock,
  FiUsers,
  FiGrid as FiTabla,
  FiFileText,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
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
   DATOS DE LA MISIÓN
========================================================= */

type UsuarioSesionEncuesta = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionEncuesta;
  user?: UsuarioSesionEncuesta;
  data?: UsuarioSesionEncuesta;
  session?: UsuarioSesionEncuesta;
};

const extraerIdUsuarioEncuesta = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionEncuesta;

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
      extraerIdUsuarioEncuesta(
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
      extraerIdUsuarioEncuesta(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

type Modulo = "bosque" | "desierto" | "cueva";

const VOTOS: Record<Modulo, number> = {
  bosque: 4,
  desierto: 3,
  cueva: 3,
};

const NOMBRE_MODULO: Record<Modulo, string> = {
  bosque: "Bosque",
  desierto: "Desierto",
  cueva: "Cueva de Cristal",
};

const MODULO_MAS_VOTADO: Modulo = "bosque";
const TOTAL_VOTOS = VOTOS.bosque + VOTOS.desierto + VOTOS.cueva;

function palitos(n: number) {
  return "|".repeat(n);
}

type EstadoFila = "correcto" | "pendiente" | "incorrecto";

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de Generador de Energía y Rampas de
   Lanzamiento, para que todas las actividades concuerden.
========================================================= */

type PistaBaitModalProps = {
  tema?: "azul" | "rojo";
  titulo?: string;
  contenido: string;
  videoSrc: string;
  audioSrc: string;
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
        <button
          type="button"
          className="pb-cerrar"
          onClick={onClose}
          aria-label="Cerrar"
        >
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

        <audio
          ref={audioRef}
          src={audioSrc}
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
          onEnded={() => setReproduciendo(false)}
          onTimeUpdate={actualizarProgreso}
        />

        <button type="button" className={`pb-cerrar-btn pb-cerrar-btn-${tema}`} onClick={onClose}>
          {botonTexto}
        </button>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function EncuestaTripulacion() {
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const [frecDesierto, setFrecDesierto] = useState("");
  const [frecCueva, setFrecCueva] = useState("");

  const [estadoDesierto, setEstadoDesierto] = useState<EstadoFila>("pendiente");
  const [estadoCueva, setEstadoCueva] = useState<EstadoFila>("pendiente");
  const [mensajeCeldaDesierto, setMensajeCeldaDesierto] = useState("");
  const [mensajeCeldaCueva, setMensajeCeldaCueva] = useState("");

  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!ID_ESTUDIANTE) {
        console.warn(
          "No se encontró el estudiante autenticado para cargar Encuesta de Tripulación.",
        );
        return;
      }

      try {
        const response = await fetch(`${API_URL}/tripulacion/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;
          const valores = (progreso.valores_tabla || {}) as Record<string, number>;
          const historial = (progreso.historial_intentos || []) as any[];

          // Busca el último intento registrado para una celda, aunque
          // todavía no haya acertado (para no perderlo al recargar).
          const ultimoIntento = (celda: string) =>
            [...historial].reverse().find((h) => h.celda === celda);

          if (valores.desierto !== undefined) {
            setFrecDesierto(String(valores.desierto));
            setEstadoDesierto("correcto");
          } else {
            const ultimo = ultimoIntento("desierto");
            if (ultimo) {
              setFrecDesierto(String(ultimo.valor));
              setEstadoDesierto("incorrecto");
            }
          }

          if (valores.cueva !== undefined) {
            setFrecCueva(String(valores.cueva));
            setEstadoCueva("correcto");
          } else {
            const ultimo = ultimoIntento("cueva");
            if (ultimo) {
              setFrecCueva(String(ultimo.valor));
              setEstadoCueva("incorrecto");
            }
          }

          if (progreso.modulo_seleccionado) {
            setModuloSeleccionado(progreso.modulo_seleccionado as Modulo);
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
  // VALIDAR TABLA CON EL BACKEND (celda por celda)
  // ==========================================

  const verificarTabla = async () => {
    if (!ID_ESTUDIANTE) {
      alert(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoTabla(true);
    try {
      if (estadoDesierto !== "correcto" && frecDesierto.trim() !== "") {
        const response = await fetch(`${API_URL}/tripulacion/validar-celda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            celda: "desierto",
            valor: Number(frecDesierto),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const resultadoCelda = data.data;
          setMensajeCeldaDesierto(resultadoCelda.mensaje);
          setEstadoDesierto(resultadoCelda.correcto ? "correcto" : "incorrecto");
        }
      }

      if (estadoCueva !== "correcto" && frecCueva.trim() !== "") {
        const response = await fetch(`${API_URL}/tripulacion/validar-celda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            celda: "cueva",
            valor: Number(frecCueva),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const resultadoCelda = data.data;
          setMensajeCeldaCueva(resultadoCelda.mensaje);
          setEstadoCueva(resultadoCelda.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar la tabla:", error);
    } finally {
      setCargandoTabla(false);
    }
  };

  const tablaCompleta = estadoDesierto === "correcto" && estadoCueva === "correcto";

  // ==========================================
  // ENVIAR AL CENTRO DE MANDO (módulo ganador)
  // ==========================================

  const enviarCentroDeMando = async () => {
    if (
      !moduloSeleccionado ||
      cargandoEnvio
    ) {
      return;
    }

    if (!ID_ESTUDIANTE) {
      alert(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoEnvio(true);

    try {
      const response = await fetch(
        `${API_URL}/tripulacion/validar-modulo`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id_estudiante:
              ID_ESTUDIANTE,
            modulo:
              moduloSeleccionado,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `HTTP ${response.status}`,
        );
      }

      if (data.success && data.data) {
        const correcto =
          Boolean(
            data.data.correcto,
          );

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

        /*
         * Se conserva el backend original de Tripulación
         * y además se registra la actividad en el sistema
         * unificado de progreso, estrellas y estadísticas.
         */
        try {
          const resultadoProgreso =
            await guardarProgresoUsuarioActual({
              mundo: "MathData",
              tema:
                "Tablas de frecuencias",
              actividad_codigo:
                "mathdata-encuesta-tripulacion",
              actividad_titulo:
                "La Encuesta de la Tripulación",
              respuestas: {
                frecuencia_bosque:
                  VOTOS.bosque,
                frecuencia_desierto:
                  Number(
                    frecDesierto,
                  ),
                frecuencia_cueva:
                  Number(
                    frecCueva,
                  ),
                modulo_seleccionado:
                  moduloSeleccionado,
              },
              aciertos:
                correcto ? 3 : 2,
              total_preguntas: 3,
              tiempo_segundos:
                tiempoSegundos,
              xp_base: 50,
              completada:
                correcto,
            });

          console.log(
            "Progreso de Encuesta de Tripulación guardado:",
            resultadoProgreso.progreso,
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
        "Error al enviar al Centro de Mando:",
        error,
      );

      const mensaje =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor.";

      alert(`❌ ${mensaje}`);
    } finally {
      setCargandoEnvio(false);
    }
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
    try {
      await fetch(`${API_URL}/tripulacion/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setFrecDesierto("");
    setFrecCueva("");
    setEstadoDesierto("pendiente");
    setEstadoCueva("pendiente");
    setMensajeCeldaDesierto("");
    setMensajeCeldaCueva("");
    setModuloSeleccionado(null);
    setResultado(null);

    inicioActividadRef.current =
      Date.now();
  };

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  if (resultado === "exito") return (
    <div className="res-modal-overlay">
      <div className="res-modal-card res-modal-exito res-modal-wide">
        <div className="res-confetti" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={`res-confetti-dot res-confetti-dot-${i % 6}`} />
          ))}
        </div>

        <div className="res-titulo-row">
          <div className="res-icono-check">✔</div>
          <div>
            <h1 className="res-titulo">¡Actividad completada!</h1>
            <p className="res-subtitulo">
              Has terminado con éxito la misión de{" "}
              <span className="res-mathnova-color">MathData</span>.
            </p>
          </div>
        </div>

        <div className="res-mensaje-box res-mensaje-verde">
          <div className="res-icono-estrella-circle">
            <img src={estrellaMision} alt="estrella" />
          </div>
          <div>
            <strong>¡Excelente trabajo, piloto!</strong>
            <p>
              Contaste los votos correctamente y descubriste qué módulo
              ganó la encuesta. Sigue así y conquista la siguiente misión.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rmp-bait-mensaje-trigger res-modal-villano-trigger"
          onClick={() => setMostrarBaitExito(true)}
          aria-label="Abrir mensaje de Bait"
        >
          <span className="rmp-bait-mensaje-dot" />
          <FiMessageSquare />
          Bait tiene un mensaje para ti
        </button>

        <div className="res-villano-exito-group">
          <img
            src={villanoTrofeoCompleto}
            alt="Villano celebrando con trofeo"
            className="res-villano-trofeo-img"
          />
        </div>

        <div className="res-modal-body">
          <div className="res-modal-left">
            <div className="res-resumen-card">
              <div className="res-resumen-header">
                <FiBarChart2 />
                <span>Resumen de la actividad</span>
              </div>
              <div className="res-resumen-stats">
                <div className="res-stat">
                  <img src={iconoAciertos} alt="" className="res-stat-img" />
                  <strong className="res-stat-num-verde">3/3</strong>
                  <small>Respuestas correctas</small>
                  <em>¡Perfecto!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>—</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong className="res-stat-num-verde">100%</strong>
                  <small>Precisión</small>
                  <em>¡Impecable!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-naranja">+50 pts</strong>
                  <small>Recompensa</small>
                  <em>Puntos ganados</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoInsignia} alt="" className="res-stat-img" />
                  <strong>Misión<br />cumplida</strong>
                  <small>Insignia obtenida</small>
                  <em>¡Felicidades!</em>
                </div>
              </div>
            </div>
          </div>

          <div className="res-modal-right">
            <button
              className="res-btn res-btn-azul"
              onClick={() =>
                navigate(
                  "/actividades-math-data/holograma-reportes",
                )
              }
            >
              Siguiente actividad
            </button>
            <button className="res-btn res-btn-outline" onClick={handleReiniciarActividad}>
              Repetir actividad
            </button>
            <button
              className="res-btn res-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              Volver a actividades
            </button>
          </div>
        </div>
      </div>

      {mostrarBaitExito && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡Excelente trabajo, piloto! Contaste los votos correctamente y descubriste qué módulo ganó la encuesta. Sigue así y conquista la siguiente misión."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioActividadCompletada}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitExito(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div className="res-modal-overlay">
      <div className="res-modal-card res-modal-fallo res-modal-wide">
        <div className="res-titulo-row">
          <div className="res-icono-retry">&#x1F504;</div>
          <div>
            <h1 className="res-titulo">¡Vuelve a intentarlo!</h1>
            <p className="res-subtitulo">
              Aún no completas con éxito la misión de{" "}
              <span className="res-mathnova-color">MathData</span>.
            </p>
          </div>
        </div>

        <div className="res-mensaje-box res-mensaje-azul">
          <div className="res-icono-datos">📊</div>
          <div>
            <strong>¡No te rindas, piloto!</strong>
            <p>
              Cuenta de nuevo los palitos de cada módulo con cuidado, y
              revisa cuál de los tres obtuvo más votos antes de enviar tu
              reporte al Centro de Mando.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rmp-bait-mensaje-trigger res-modal-villano-trigger"
          onClick={() => setMostrarBaitFallo(true)}
          aria-label="Abrir mensaje de Bait"
        >
          <span className="rmp-bait-mensaje-dot" />
          <FiMessageSquare />
          Bait tiene un mensaje para ti
        </button>

        <div className="res-villano-fallo-group">
          <img src={villanoIntentar} alt="Villano retando" className="res-villano-img" />
        </div>

        <div className="res-modal-body">
          <div className="res-modal-left">
            <div className="res-resumen-card">
              <div className="res-resumen-header">
                <FiBarChart2 />
                <span>Resumen de la actividad</span>
              </div>
              <div className="res-resumen-stats">
                <div className="res-stat">
                  <img src={iconoAciertos} alt="" className="res-stat-img" />
                  <strong>0/3</strong>
                  <small>Respuestas correctas</small>
                  <em>¡Sigue así!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>—</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong>0%</strong>
                  <small>Precisión</small>
                  <em>Puedes mejorar</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-azul">+10 pts</strong>
                  <small>Recompensa</small>
                  <em>Puntos ganados</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoInsignia} alt="" className="res-stat-img" />
                  <strong>Sigue intentando</strong>
                  <small>Insignia obtenida</small>
                  <em>¡No te rindas!</em>
                </div>
              </div>
            </div>
          </div>

          <div className="res-modal-right">
            <button className="res-btn res-btn-azul" onClick={handleReiniciarActividad}>
              Intentar de nuevo
            </button>
            <button className="res-btn res-btn-outline" onClick={() => setMostrarPistaBait(true)}>
              Ver pista
            </button>
            <button
              className="res-btn res-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              {"<-"} Volver a actividades
            </button>
          </div>
        </div>
      </div>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Cuenta con cuidado la columna de palitos: cada palito vale 1 voto. La frecuencia absoluta es el número total de votos de cada módulo. El módulo con más palitos es el que ganó la encuesta. Ejemplo: 5 palitos seguidos son 5 votos."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioEncuesta}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡No te rindas, piloto! Cuenta de nuevo los palitos de cada módulo con cuidado, y revisa cuál de los tres obtuvo más votos antes de enviar tu reporte al Centro de Mando."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="enc-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="enc-sidebar">
        <img src={logo} alt="MathNova" className="enc-logo-img" />

        <nav className="enc-nav">
          <button className="enc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="enc-nav-item enc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="enc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="enc-interferencia-activa-wrap">
          <img
            src={interferenciaActivaImg}
            alt="Interferencia activa: Divide puede confundir los palitos y hacerte perder la cuenta. ¡No dejes que eso pase!"
            className="enc-interferencia-activa-img"
          />
          <button
            type="button"
            className="enc-ver-amenaza-btn"
            onClick={() => setMostrarPistaBait(true)}
          >
            <FiTarget /> Ver amenaza
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="enc-main">
        <header className="enc-header">
          <div className="enc-header-izquierda">
            <button
              className="enc-volver"
              type="button"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiArrowLeft /> Volver al tema
            </button>
          </div>
          <button type="button" className="enc-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="enc-top-row">
          <div className="enc-centro-control">
            <div className="enc-centro-control-header">
              <FiTarget /> CENTRO DE CONTROL
            </div>
            <ul>
              <li>
                <span className="enc-bullet-azul" />
                Revisa la encuesta.
              </li>
              <li>
                <span className="enc-bullet-verde" />
                Cuenta los votos con palitos.
              </li>
              <li>
                <span className="enc-bullet-rojo" />
                Completa la frecuencia absoluta.
              </li>
            </ul>
          </div>

          <img src={baitSaludoImg} alt="Bait saludando" className="enc-robot-avatar-img" />

          <div className="enc-titulo-bloque">
            <div className="enc-titulo-row">
              <div className="enc-titulo-icono">
                <FiUsers />
              </div>
              <div>
                <h1>La Encuesta de la Tripulación</h1>
                <p>
                  Aplica una encuesta, cuenta los votos y completa la tabla
                  de frecuencias.
                </p>
              </div>
            </div>

            <div className="enc-hola-piloto">
              <div>
                <strong>¡Hola, piloto!</strong>
                <p>
                  En esta misión debes aplicar una encuesta a la tripulación
                  para decidir qué módulo explorar primero. Observa cómo
                  votan los 10 integrantes del escuadrón, cuenta los votos
                  con palitos y completa la tabla de frecuencias. Después
                  revela cuál módulo obtuvo más votos.
                </p>
              </div>
              <button
                className="enc-audio-btn"
                type="button"
                onClick={() => setMostrarIntroBait(true)}
                aria-label="Escuchar instrucciones"
              >
                <FiVolume2 />
              </button>
            </div>
          </div>

          <img
            src={interferenciaDivideEncuestaImg}
            alt="Interferencia de Divide: si cuentas mal los votos, la ruta se aprobará mal. A ver si puedes descubrir qué módulo ganó de verdad."
            className="enc-villano-box"
          />
        </div>

        {/* ENCUESTA Y TABLA */}
        <div className="enc-medio-row">
          {/* ENCUESTA Y VOTOS */}
          <div className="enc-encuesta-card">
            <div className="enc-card-header">
              <FiUsers /> Encuesta y votos de la tripulación
            </div>

            <div className="enc-encuesta-contenido">
              <div className="enc-expedicion-box">
                <span className="enc-subtitulo-caja">Encuesta de Expedición</span>
                <p className="enc-pregunta-caja">
                  ¿Qué módulo prefieres explorar primero?
                </p>
                <div className="enc-modulos-opciones">
                  {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                    <div key={m} className={`enc-modulo-opcion enc-modulo-${m}`}>
                      <span className="enc-modulo-icono" aria-hidden="true" />
                      <span>{NOMBRE_MODULO[m]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enc-conteo-box">
                <span className="enc-subtitulo-caja">
                  Conteo en tiempo real (Panel de palitos)
                </span>
                {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                  <div key={m} className="enc-conteo-fila">
                    <span className={`enc-modulo-icono enc-modulo-${m}`} aria-hidden="true" />
                    <span className="enc-conteo-nombre">{NOMBRE_MODULO[m]}</span>
                    <span className="enc-conteo-palitos">{palitos(VOTOS[m])}</span>
                    <FiCheckCircle className="enc-conteo-check" />
                  </div>
                ))}
              </div>
            </div>

            <div className="enc-tripulacion-box">
              <span className="enc-subtitulo-caja">Tripulación (10 integrantes)</span>
              <img
                src={astronautasImg}
                alt="Los 10 integrantes de la tripulación que votaron en la encuesta"
                className="enc-astronautas-img"
              />
            </div>

            <div className="enc-nota-bait">
              <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
              <span>Cada palito representa un voto.</span>
            </div>
          </div>

          {/* TABLA DE FRECUENCIAS */}
          <div className="enc-tabla-card">
            <div className="enc-card-header">
              <FiTabla /> Tabla de frecuencias
            </div>

            <table className="enc-tabla">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Conteo (palitos)</th>
                  <th>Frecuencia absoluta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-bosque" aria-hidden="true" />
                    Bosque
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.bosque)}</td>
                  <td className="enc-td-frecuencia">
                    <strong>{VOTOS.bosque}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-correcto">
                      <FiCheckCircle /> Correcto
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-desierto" aria-hidden="true" />
                    Desierto
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.desierto)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoDesierto}`}
                      value={frecDesierto}
                      onChange={(e) => setFrecDesierto(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Desierto"
                      disabled={cargandoTabla || estadoDesierto === "correcto"}
                    />
                    {mensajeCeldaDesierto && (
                      <p className="enc-mensaje-celda">{mensajeCeldaDesierto}</p>
                    )}
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoDesierto}`}>
                      {estadoDesierto === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoDesierto === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoDesierto === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-cueva" aria-hidden="true" />
                    Cueva de Cristal
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.cueva)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoCueva}`}
                      value={frecCueva}
                      onChange={(e) => setFrecCueva(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Cueva de Cristal"
                      disabled={cargandoTabla || estadoCueva === "correcto"}
                    />
                    {mensajeCeldaCueva && (
                      <p className="enc-mensaje-celda">{mensajeCeldaCueva}</p>
                    )}
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoCueva}`}>
                      {estadoCueva === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoCueva === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoCueva === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr className="enc-fila-total">
                  <td className="enc-td-modulo">TOTAL</td>
                  <td className="enc-td-palitos">—</td>
                  <td className="enc-td-frecuencia">
                    <strong>{TOTAL_VOTOS}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-automatico">
                      Automático
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <button
              type="button"
              className="enc-verificar-tabla-btn"
              onClick={verificarTabla}
              disabled={cargandoTabla}
            >
              <FiCheck /> {cargandoTabla ? "Verificando..." : "Verificar tabla"}
            </button>

            <div className="enc-pista-card">
              <button
                type="button"
                className="enc-pista-trigger"
                onClick={() => setMostrarPistaBait(true)}
              >
                <img src={baitPistaImg} alt="" className="enc-pista-icono" />
                <strong>Pista de Bait</strong>
              </button>
              <p>
                Cuenta con cuidado la columna de palitos. Cada palito vale{" "}
                <strong className="enc-texto-azul">1 voto</strong>. La
                frecuencia absoluta es el número total de votos de cada
                módulo.
              </p>

              <div className="enc-pista-ejemplo">
                <span>Ejemplo:</span>
                <strong>{palitos(5)}</strong>
                <span>5 votos</span>
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN E INTERPRETACIÓN */}
        <div className="enc-bottom-row">
          <div className="enc-resumen-card">
            <div className="enc-card-header">
              <FiFileText /> Resumen e interpretación
            </div>

            <p className="enc-pregunta-resumen">¿Qué módulo obtuvo más votos?</p>

            <div className="enc-resumen-opciones">
              {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`enc-resumen-opcion enc-modulo-${m} ${
                    moduloSeleccionado === m ? "enc-resumen-opcion-activa" : ""
                  }`}
                  onClick={() => setModuloSeleccionado(m)}
                  aria-pressed={moduloSeleccionado === m}
                  disabled={!tablaCompleta}
                >
                  <span className="enc-modulo-icono" aria-hidden="true" />
                  {NOMBRE_MODULO[m]}
                  {moduloSeleccionado === m && <FiCheckCircle className="enc-check-opcion" />}
                </button>
              ))}
            </div>

            {moduloSeleccionado && (
              <div className="enc-nota-bait">
                <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
                {moduloSeleccionado === MODULO_MAS_VOTADO ? (
                  <span>
                    ¡Exacto! El {NOMBRE_MODULO[MODULO_MAS_VOTADO]} fue el más
                    votado con {VOTOS[MODULO_MAS_VOTADO]} votos. ⭐
                  </span>
                ) : (
                  <span>Revisa otra vez la tabla de frecuencias antes de confirmar.</span>
                )}
              </div>
            )}

            <button
              type="button"
              className="enc-enviar-btn"
              onClick={enviarCentroDeMando}
              disabled={!moduloSeleccionado || cargandoEnvio}
            >
              <FiSend /> {cargandoEnvio ? "Enviando..." : "Enviar al Centro de Mando"}
            </button>
          </div>
        </div>
      </main>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Cuenta con cuidado la columna de palitos: cada palito vale 1 voto. La frecuencia absoluta es el número total de votos de cada módulo. El módulo con más palitos es el que ganó la encuesta. Ejemplo: 5 palitos seguidos son 5 votos."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioEncuesta}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="¡Hola, piloto!"
          contenido="En esta misión debes aplicar una encuesta a la tripulación para decidir qué módulo explorar primero. Observa cómo votan los 10 integrantes del escuadrón, cuenta los votos con palitos y completa la tabla de frecuencias. Después revela cuál módulo obtuvo más votos."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioEncuesta}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {!tablaCompleta && (
        <p className="enc-visually-hidden" role="status">
          Todavía hay filas de la tabla que no coinciden, revísalas antes de
          enviar tu reporte.
        </p>
      )}
    </div>
  );
}