import { useState, useRef, useEffect } from "react";
import type { DragEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";

import logo from "../../assets/logo_MathNova.png";
import "./OraculoEstacion.css";

/* ---- Reutilizadas de las actividades anteriores (mismos recursos, sin cambios) ---- */
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
import baitHablandoVideo from "../../assets/bait-hablando.mp4";

/* ---- Nuevas para la Actividad 7 ---- */
import fondoOraculoImg from "../../assets/fondo-oraculo-estacion.png";
import villanoDivideOraculoImg from "../../assets/villano-divide-oraculo.png";

/* ---- Audios ---- */
import introBaitAudioOraculo from "../../assets/intro_act7.mp3";
import pistaBaitAudioOraculo from "../../assets/pista_act7.mp3";
import baitAudioActividadCompletada from "../../assets/actividad_completada_act7.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/volver_intentarlo_act7.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiZap,
  FiStar,
  FiEye,
  FiMove,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   CONFIGURACIÓN DEL BACKEND
========================================================= */

const API_URL = "http://localhost:3001/api";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type Color = "azul" | "verde" | "rojo" | "dorado";
type ColorSenuelo = "morado" | "plateado";

const COLORES_CAPSULA: Color[] = ["azul", "verde", "rojo", "dorado"];
const SENUELOS: ColorSenuelo[] = ["morado", "plateado"];

const CONTEO: Record<Color, number> = { azul: 4, verde: 3, rojo: 2, dorado: 1 };

const NOMBRE_COLOR: Record<Color | ColorSenuelo, string> = {
  azul: "Azul",
  verde: "Verde",
  rojo: "Rojo",
  dorado: "Dorado",
  morado: "Morado",
  plateado: "Plateado",
};

const HEX_COLOR: Record<Color | ColorSenuelo, string> = {
  azul: "#2563eb",
  verde: "#16a34a",
  rojo: "#dc2626",
  dorado: "#d97706",
  morado: "#7c3aed",
  plateado: "#94a3b8",
};

const TODOS_LOS_COLORES: (Color | ColorSenuelo)[] = [...COLORES_CAPSULA, ...SENUELOS];

const ORDEN_CORRECTO: Color[] = ["azul", "verde", "rojo", "dorado"]; // mayor a menor probabilidad
const ORDEN_INICIAL: Color[] = ["rojo", "dorado", "azul", "verde"];

const ENUNCIADO_1 = "Azul es más probable que dorado.";
const ENUNCIADO_2 = "Rojo es menos probable que verde.";
// Ambos enunciados son verdaderos según los datos de la cápsula (4 > 1 y 2 < 3).
const RESPUESTA_ENUNCIADO_1 = "verdadero";
const RESPUESTA_ENUNCIADO_2 = "verdadero";

type EstadoCampo = "correcto" | "pendiente" | "incorrecto";
type Pantalla = "espacio" | "orden" | "comparacion" | "prediccion";

function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de las actividades anteriores.
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
   COMPONENTE PRINCIPAL
========================================================= */

export default function OraculoEstacion() {
  const navigate = useNavigate();

  // El ID del estudiante se obtiene de la sesión activa en cada render
  const usuarioSesion = getSessionUser();
  const ID_ESTUDIANTE = usuarioSesion?.id_usuario;

  /* ---- Paso 1: espacio muestral ---- */
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Set<string>>(new Set());
  const [espacioVerificado, setEspacioVerificado] = useState(false);
  const [espacioEstado, setEspacioEstado] = useState<EstadoCampo>("pendiente");
  const [espacioAsistido, setEspacioAsistido] = useState(false);

  /* ---- Paso 2: posible o imposible ---- */
  const [posibleMorado, setPosibleMorado] = useState<"posible" | "imposible" | null>(null);
  const [numResultados, setNumResultados] = useState("");
  const [paso2Verificado, setPaso2Verificado] = useState(false);
  const [paso2Estado, setPaso2Estado] = useState<EstadoCampo>("pendiente");
  const [paso2Asistido, setPaso2Asistido] = useState(false);

  /* ---- Paso 3: orden de probabilidad (drag & drop) ---- */
  const [orden, setOrden] = useState<Color[]>(ORDEN_INICIAL);
  const [ordenVerificado, setOrdenVerificado] = useState(false);
  const [ordenEstado, setOrdenEstado] = useState<EstadoCampo>("pendiente");
  const [ordenAsistido, setOrdenAsistido] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ---- Paso 4: comparación de eventos ---- */
  const [comp1, setComp1] = useState<"verdadero" | "falso" | null>(null);
  const [comp2, setComp2] = useState<"verdadero" | "falso" | null>(null);
  const [comparacionVerificada, setComparacionVerificada] = useState(false);
  const [comparacionEstado, setComparacionEstado] = useState<EstadoCampo>("pendiente");
  const [comparacionAsistida, setComparacionAsistida] = useState(false);

  /* ---- Paso 5: predicción antes del canje ---- */
  const [prediccion, setPrediccion] = useState<Color | null>(null);
  const [prediccionVerificada, setPrediccionVerificada] = useState(false);
  const [prediccionEstado, setPrediccionEstado] = useState<EstadoCampo>("pendiente");
  const [prediccionAsistida, setPrediccionAsistida] = useState(false);

  const [monedaEstelar, setMonedaEstelar] = useState(1);
  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mensajePistaBait, setMensajePistaBait] = useState("");
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoEspacio, setCargandoEspacio] = useState(false);
  const [cargandoPaso2, setCargandoPaso2] = useState(false);
  const [cargandoOrden, setCargandoOrden] = useState(false);
  const [cargandoComparacion, setCargandoComparacion] = useState(false);
  const [cargandoPrediccion, setCargandoPrediccion] = useState(false);
  const [cargandoActivar, setCargandoActivar] = useState(false);

  /* ---- Temporizador ---- */
  const tiempoInicioRef = useRef<number>(Date.now());
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  useEffect(() => {
    if (cargandoInicial || resultado !== null) return;

    const intervalo = setInterval(() => {
      setSegundosTranscurridos(Math.floor((Date.now() - tiempoInicioRef.current) / 1000));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cargandoInicial, resultado]);

  /* ---- Derivados ---- */
  const espacioCorrecto = espacioEstado === "correcto" || espacioAsistido;
  const paso2Correcto = paso2Estado === "correcto" || paso2Asistido;
  const ordenEsCorrecto = ordenEstado === "correcto" || ordenAsistido;
  const comparacionCorrecta = comparacionEstado === "correcto" || comparacionAsistida;
  const prediccionCorrecta = prediccionEstado === "correcto" || prediccionAsistida;

  const todosLosPasosVerificados =
    espacioVerificado && paso2Verificado && ordenVerificado && comparacionVerificada && prediccionVerificada;

  const espacioOrdenadoTexto = COLORES_CAPSULA.filter((c) => espacioSeleccionado.has(c))
    .map((c) => NOMBRE_COLOR[c].toLowerCase())
    .join(", ");

  const pantallaActual = (): Pantalla => {
    if (!espacioCorrecto) return "espacio";
    if (!paso2Correcto) return "espacio";
    if (!ordenEsCorrecto) return "orden";
    if (!comparacionCorrecta) return "comparacion";
    return "prediccion";
  };

  const abrirPistaManual = () => {
    setMensajePistaBait("");
    setMostrarPistaBait(true);
    fetch(`${API_URL}/oraculo/pista-consultada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: pantallaActual() }),
    }).catch((error) => console.error("Error al registrar consulta de pista:", error));
  };

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const response = await fetch(`${API_URL}/oraculo/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;

          const espacioGuardado = (progreso.espacio_valores || []) as string[];
          if (espacioGuardado.length > 0) {
            setEspacioSeleccionado(new Set(espacioGuardado));
            setEspacioVerificado(true);
            const coincide =
              espacioGuardado.length === COLORES_CAPSULA.length &&
              COLORES_CAPSULA.every((c) => espacioGuardado.includes(c));
            setEspacioEstado(coincide ? "correcto" : "incorrecto");
            setEspacioAsistido(!!progreso.espacio_asistido);
          }

          if (progreso.posible_valor || progreso.num_resultados_valor) {
            setPosibleMorado((progreso.posible_valor as "posible" | "imposible") || null);
            setNumResultados(String(progreso.num_resultados_valor || ""));
            setPaso2Verificado(true);
            const coincide =
              progreso.posible_valor === "imposible" &&
              String(progreso.num_resultados_valor) === String(COLORES_CAPSULA.length);
            setPaso2Estado(coincide ? "correcto" : "incorrecto");
            setPaso2Asistido(!!progreso.paso2_asistido);
          }

          const ordenGuardado = (progreso.orden_valores || []) as Color[];
          if (ordenGuardado.length === 4) {
            setOrden(ordenGuardado);
            setOrdenVerificado(true);
            const coincide = ordenGuardado.every((c, i) => c === ORDEN_CORRECTO[i]);
            setOrdenEstado(coincide ? "correcto" : "incorrecto");
            setOrdenAsistido(!!progreso.orden_asistido);
          }

          if (progreso.comp1_valor || progreso.comp2_valor) {
            setComp1((progreso.comp1_valor as "verdadero" | "falso") || null);
            setComp2((progreso.comp2_valor as "verdadero" | "falso") || null);
            setComparacionVerificada(true);
            const coincide =
              progreso.comp1_valor === RESPUESTA_ENUNCIADO_1 && progreso.comp2_valor === RESPUESTA_ENUNCIADO_2;
            setComparacionEstado(coincide ? "correcto" : "incorrecto");
            setComparacionAsistida(!!progreso.comparacion_asistida);
          }

          if (progreso.prediccion_valor) {
            setPrediccion(progreso.prediccion_valor as Color);
            setPrediccionVerificada(true);
            setPrediccionEstado(progreso.prediccion_valor === "azul" ? "correcto" : "incorrecto");
            setPrediccionAsistida(!!progreso.prediccion_asistida);
          }

          if (progreso.completada) {
            setResultado(progreso.resultado_correcto ? "exito" : "fallo");
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarProgreso();
  }, []);

  const toggleColorEspacio = (color: string) => {
    setEspacioSeleccionado((prev) => {
      const copia = new Set(prev);
      if (copia.has(color)) copia.delete(color);
      else copia.add(color);
      return copia;
    });
    setEspacioVerificado(false);
  };

  // ==========================================
  // PASO 1: VERIFICAR ESPACIO MUESTRAL
  // ==========================================

  const verificarEspacio = async () => {
    setCargandoEspacio(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/validar-espacio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, colores: Array.from(espacioSeleccionado) }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;
        setEspacioVerificado(true);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);
          fetch(`${API_URL}/oraculo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "espacio" }),
          }).catch((error) => console.error("Error al registrar consulta de pista:", error));
        }

        if (r.asistido) {
          setEspacioSeleccionado(new Set(COLORES_CAPSULA));
          setEspacioAsistido(true);
          setEspacioEstado("incorrecto");
        } else {
          setEspacioEstado(r.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar el espacio muestral:", error);
    } finally {
      setCargandoEspacio(false);
    }
  };

  // ==========================================
  // PASO 2: VERIFICAR POSIBLE/IMPOSIBLE
  // ==========================================

  const verificarPaso2 = async () => {
    setCargandoPaso2(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/validar-paso2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          posible_imposible: posibleMorado,
          num_resultados: numResultados,
        }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;
        setPaso2Verificado(true);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);
          fetch(`${API_URL}/oraculo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "espacio" }),
          }).catch((error) => console.error("Error al registrar consulta de pista:", error));
        }

        if (r.asistido) {
          setPosibleMorado("imposible");
          setNumResultados(String(COLORES_CAPSULA.length));
          setPaso2Asistido(true);
          setPaso2Estado("incorrecto");
        } else {
          setPaso2Estado(r.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar el paso 2:", error);
    } finally {
      setCargandoPaso2(false);
    }
  };

  /* ---- Drag & drop del paso 3 ---- */
  const manejarDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const manejarDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const manejarDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const origen = dragIndexRef.current;
    setDragOverIndex(null);
    if (origen === null || origen === index) return;
    setOrden((prev) => {
      const copia = [...prev];
      const temporal = copia[origen];
      copia[origen] = copia[index];
      copia[index] = temporal;
      return copia;
    });
    dragIndexRef.current = null;
    setOrdenVerificado(false);
  };

  // ==========================================
  // PASO 3: VERIFICAR ORDEN
  // ==========================================

  const verificarOrden = async () => {
    setCargandoOrden(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/validar-orden`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, orden }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;
        setOrdenVerificado(true);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);
          fetch(`${API_URL}/oraculo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "orden" }),
          }).catch((error) => console.error("Error al registrar consulta de pista:", error));
        }

        if (r.asistido) {
          setOrden(ORDEN_CORRECTO);
          setOrdenAsistido(true);
          setOrdenEstado("incorrecto");
        } else {
          setOrdenEstado(r.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar el orden:", error);
    } finally {
      setCargandoOrden(false);
    }
  };

  // ==========================================
  // PASO 4: VERIFICAR COMPARACIÓN
  // ==========================================

  const verificarComparacion = async () => {
    setCargandoComparacion(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/validar-comparacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, comp1, comp2 }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;
        setComparacionVerificada(true);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);
          fetch(`${API_URL}/oraculo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "comparacion" }),
          }).catch((error) => console.error("Error al registrar consulta de pista:", error));
        }

        if (r.asistido) {
          setComp1("verdadero");
          setComp2("verdadero");
          setComparacionAsistida(true);
          setComparacionEstado("incorrecto");
        } else {
          setComparacionEstado(r.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar la comparación:", error);
    } finally {
      setCargandoComparacion(false);
    }
  };

  // ==========================================
  // PASO 5: VERIFICAR PREDICCIÓN
  // ==========================================

  const verificarPrediccion = async () => {
    setCargandoPrediccion(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/validar-prediccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, color: prediccion }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;
        setPrediccionVerificada(true);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);
          fetch(`${API_URL}/oraculo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "prediccion" }),
          }).catch((error) => console.error("Error al registrar consulta de pista:", error));
        }

        if (r.asistido) {
          setPrediccion("azul");
          setPrediccionAsistida(true);
          setPrediccionEstado("incorrecto");
        } else {
          setPrediccionEstado(r.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar la predicción:", error);
    } finally {
      setCargandoPrediccion(false);
    }
  };

  const justificacionPrediccion = (color: Color | null) => {
    if (!color) return "";
    if (color === "azul") {
      return "Porque hay cuatro cristales azules, más que de cualquier otro color.";
    }
    return `Porque hay ${CONTEO[color]} cristales de color ${NOMBRE_COLOR[
      color
    ].toLowerCase()}, pero azul tiene más (4) y es más probable.`;
  };

  /* ---- Envío final: activar el Oráculo ---- */
  const handleActivarOraculo = async () => {
    if (monedaEstelar <= 0) return;

    if (!todosLosPasosVerificados) {
      alert("⚠️ Completa y verifica los 5 pasos antes de activar el Oráculo.");
      return;
    }

    setCargandoActivar(true);
    try {
      const response = await fetch(`${API_URL}/oraculo/activar-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          tiempo_total: segundosTranscurridos,
        }),
      });
      const data = await response.json();

      setMonedaEstelar((m) => Math.max(0, m - 1));

      if (data.success && data.data) {
        setResultado(data.data.correcto ? "exito" : "fallo");
      }
    } catch (error) {
      console.error("Error al activar el Oráculo:", error);
      alert("❌ Error al conectar con el servidor.");
    } finally {
      setCargandoActivar(false);
    }
  };

  const handleReiniciarActividad = async () => {
    try {
      await fetch(`${API_URL}/oraculo/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setEspacioSeleccionado(new Set());
    setEspacioVerificado(false);
    setEspacioEstado("pendiente");
    setEspacioAsistido(false);
    setPosibleMorado(null);
    setNumResultados("");
    setPaso2Verificado(false);
    setPaso2Estado("pendiente");
    setPaso2Asistido(false);
    setOrden(ORDEN_INICIAL);
    setOrdenVerificado(false);
    setOrdenEstado("pendiente");
    setOrdenAsistido(false);
    setComp1(null);
    setComp2(null);
    setComparacionVerificada(false);
    setComparacionEstado("pendiente");
    setComparacionAsistida(false);
    setPrediccion(null);
    setPrediccionVerificada(false);
    setPrediccionEstado("pendiente");
    setPrediccionAsistida(false);
    setMonedaEstelar(1);
    setResultado(null);
    tiempoInicioRef.current = Date.now();
    setSegundosTranscurridos(0);
  };

  /* ---- Resumen para las pantallas de resultado ---- */
  const aciertos = [
    espacioCorrecto,
    paso2Correcto,
    ordenEsCorrecto,
    comparacionCorrecta,
    prediccionCorrecta,
  ].filter(Boolean).length;
  const totalPasos = 5;
  const precision = Math.round((aciertos / totalPasos) * 100);
  const puntosGanados = resultado === "exito" ? 50 : 10;

  // ==========================================
  // PANTALLA DE CARGA INICIAL (evita mostrar el
  // tablero antes de saber si ya estaba completada)
  // ==========================================

  if (cargandoInicial) {
    return (
      <div className="orc-loading-screen">
        <img src={logo} alt="MathNova" className="orc-loading-logo" />
        <p>Cargando actividad...</p>
      </div>
    );
  }

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
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
            <strong>¡Excelente trabajo, agente!</strong>
            <p>
              Identificaste el espacio muestral, comparaste correctamente las
              probabilidades y activaste el Oráculo de la Estación con una
              predicción bien fundamentada.
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
                  <strong className="res-stat-num-verde">{aciertos}/{totalPasos}</strong>
                  <small>Pasos correctos</small>
                  <em>¡Perfecto!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong className="res-stat-num-verde">{precision}%</strong>
                  <small>Precisión</small>
                  <em>¡Impecable!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-naranja">+{puntosGanados} pts</strong>
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
            <button className="res-btn res-btn-azul" onClick={() => navigate("/actividades-math-data")}>
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
          contenido="¡Lo lograste, agente! El Oráculo se activó con éxito gracias a tu análisis. Identificaste el espacio muestral, comparaste las probabilidades y tu predicción estuvo bien fundamentada."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioActividadCompletada}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitExito(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // VENTANA EMERGENTE: VUELVE A INTENTARLO
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
            <strong>¡No te rindas, agente!</strong>
            <p>
              Revisa el espacio muestral, el orden de probabilidad y tu
              predicción. Recuerda: el color con más cristales es el más
              probable.
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
                  <strong>{aciertos}/{totalPasos}</strong>
                  <small>Pasos correctos</small>
                  <em>¡Sigue así!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong>{precision}%</strong>
                  <small>Precisión</small>
                  <em>Puedes mejorar</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-azul">+{puntosGanados} pts</strong>
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
            <button className="res-btn res-btn-outline" onClick={abrirPistaManual}>
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

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="Buen avance, agente. El Oráculo guardó lo que ya resolviste. Todavía falta completar el registro, pero puedes continuar desde el primer paso pendiente cuando estés listo."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido={
            mensajePistaBait ||
            "Observa con atención la cápsula. El espacio muestral incluye todos los resultados diferentes que pueden ocurrir. El color que aparece más veces es el más probable y el que aparece menos veces es el menos probable. Recuerda que una predicción se apoya en los datos, pero nunca garantiza el resultado."
          }
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioOraculo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="orc-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="orc-sidebar">
        <img src={logo} alt="MathNova" className="orc-logo-img" />

        <nav className="orc-nav">
          <button className="orc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="orc-nav-item orc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="orc-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="orc-progreso-track">
            <div className="orc-progreso-fill" style={{ width: "86%" }} />
          </div>
          <small>6/7 actividad</small>
        </div>

        <div className="orc-tiempo-card">
          <small>Tiempo transcurrido</small>
          <strong>{formatearTiempo(segundosTranscurridos)}</strong>
        </div>

        <div className="orc-xp-card">
          <small>XP acumulados</small>
          <strong>180 XP ⭐</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main
        className="orc-main"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,11,31,0.5), rgba(5,11,31,0.8)), url(${fondoOraculoImg})`,
        }}
      >
        <header className="orc-header">
          <button className="orc-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver al tema
          </button>
          <button type="button" className="orc-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR: TÍTULO + VILLANO */}
        <div className="orc-top-row">
          <div className="orc-titulo-bloque">
            <h1>El Oráculo de la Estación</h1>
            <p>
              Observa la cápsula, identifica el espacio muestral y compara
              qué resultados son más o menos probables antes de activar el
              Oráculo.
            </p>
          </div>

          <img
            src={villanoDivideOraculoImg}
            alt="Interferencia: DIVIDE dice que no pierdas el tiempo contando, que todos los colores tienen la misma oportunidad de salir y que dejes que el azar decida."
            className="orc-villano-card-img"
          />
        </div>

        {/* FILA CÁPSULA: BIT EXPLICA + CÁPSULA + PISTA DE BIT */}
        <div className="orc-capsula-row">
          <div className="orc-capsula-col">
            <div className="orc-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="orc-bait-avatar-img" />

              <div className="orc-hola-agente">
                <div>
                  <strong>BIT te explica</strong>
                  <p>
                    ¡Agente! No te apresures. La cápsula es transparente y
                    podemos analizarla antes de jugar. Primero identifica
                    todos los colores que pueden salir; después
                    compararemos cuáles son más y menos probables. Así
                    podrás hacer una predicción con datos, aunque el
                    resultado final siga dependiendo del azar.
                  </p>
                </div>
                <button
                  className="orc-audio-btn"
                  type="button"
                  onClick={() => setMostrarIntroBait(true)}
                  aria-label="Escuchar explicación"
                >
                  <FiVolume2 />
                </button>
              </div>
            </div>

            <div className="orc-leyenda-wrap">
              <div className="orc-leyenda-row">
                {COLORES_CAPSULA.map((c) => (
                  <div className="orc-leyenda-pill" key={c} style={{ borderColor: HEX_COLOR[c] }}>
                    <span className="orc-leyenda-punto" style={{ background: HEX_COLOR[c] }} />
                    {NOMBRE_COLOR[c]}
                    <strong>{CONTEO[c]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="orc-pista-card">
            <div className="orc-pista-header">
              <FiEye />
              <strong>Pista de BIT</strong>
            </div>
            <ul className="orc-pista-lista">
              <li>Escribe una sola vez cada color diferente que aparezca dentro de la cápsula.</li>
              <li>Más cristales de un color no significa mayor posibilidad.</li>
              <li>Más probable no significa seguro.</li>
            </ul>
            <button type="button" className="orc-pista-btn" onClick={abrirPistaManual}>
              <img src={baitPistaImg} alt="" className="orc-pista-icono" />
              Ver pista
            </button>
          </div>
        </div>

        {/* FILA DE 5 PASOS */}
        <div className="orc-pasos-row">
          {/* PASO 1: ESPACIO MUESTRAL */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">1</span>
              <strong>Espacio muestral</strong>
              {espacioVerificado && (
                espacioEstado === "correcto"
                  ? <FiCheckCircle className="orc-check-verde" />
                  : espacioAsistido
                    ? <FiCheckCircle className="orc-check-asistido" />
                    : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">Selecciona los colores que pueden salir de la cápsula.</p>

            <div className="orc-chips-wrap">
              {TODOS_LOS_COLORES.map((c) => {
                const activo = espacioSeleccionado.has(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={`orc-chip ${activo ? "orc-chip-activo" : ""}`}
                    style={activo ? { background: HEX_COLOR[c], borderColor: HEX_COLOR[c] } : undefined}
                    onClick={() => toggleColorEspacio(c)}
                    aria-pressed={activo}
                    disabled={cargandoEspacio || espacioCorrecto}
                  >
                    {NOMBRE_COLOR[c]}
                  </button>
                );
              })}
            </div>

            <div className={`orc-omega-box ${espacioVerificado ? (espacioEstado === "correcto" ? "orc-omega-correcto" : espacioAsistido ? "orc-omega-asistido" : "orc-omega-incorrecto") : ""}`}>
              ω = {"{"}
              {espacioOrdenadoTexto || "…"}
              {"}"}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarEspacio}
              disabled={cargandoEspacio || espacioCorrecto}
            >
              <FiCheck /> {cargandoEspacio ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {/* PASO 2: POSIBLE O IMPOSIBLE */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">2</span>
              <strong>Posible o imposible</strong>
              {paso2Verificado && (
                paso2Estado === "correcto"
                  ? <FiCheckCircle className="orc-check-verde" />
                  : paso2Asistido
                    ? <FiCheckCircle className="orc-check-asistido" />
                    : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>

            <p className="orc-paso-texto">¿Puede salir un cristal morado?</p>
            <div className="orc-opciones-radio">
              {(["posible", "imposible"] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`orc-opcion-radio ${posibleMorado === op ? "orc-opcion-radio-activa" : ""}`}
                  onClick={() => { setPosibleMorado(op); setPaso2Verificado(false); }}
                  aria-pressed={posibleMorado === op}
                  disabled={cargandoPaso2 || paso2Correcto}
                >
                  <span className="orc-radio-circulo" />
                  {op === "posible" ? "Posible" : "Imposible"}
                  {paso2Verificado && posibleMorado === op && op === "imposible" && paso2Estado === "correcto" && (
                    <FiCheckCircle className="orc-check-verde orc-check-inline" />
                  )}
                </button>
              ))}
            </div>

            <p className="orc-paso-texto">¿Cuántos resultados diferentes hay?</p>
            <div className="orc-input-grupo">
              <input
                type="text"
                inputMode="numeric"
                className={`orc-input ${
                  paso2Verificado
                    ? paso2Estado === "correcto"
                      ? "orc-input-correcto"
                      : paso2Asistido
                        ? "orc-input-asistido"
                        : "orc-input-incorrecto"
                    : ""
                }`}
                value={numResultados}
                onChange={(e) => { setNumResultados(e.target.value); setPaso2Verificado(false); }}
                aria-label="Cantidad de resultados diferentes"
                disabled={cargandoPaso2 || paso2Correcto}
              />
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarPaso2}
              disabled={cargandoPaso2 || paso2Correcto}
            >
              <FiCheck /> {cargandoPaso2 ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {/* PASO 3: ORDEN DE PROBABILIDAD */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">3</span>
              <strong>Orden de probabilidad</strong>
              {ordenVerificado && (
                ordenEstado === "correcto"
                  ? <FiCheckCircle className="orc-check-verde" />
                  : ordenAsistido
                    ? <FiCheckCircle className="orc-check-asistido" />
                    : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">Ordena de mayor a menor probabilidad.</p>

            <div className="orc-orden-columna">
              {orden.map((c, index) => (
                <div key={c} className="orc-orden-item-col">
                  <div
                    className={`orc-orden-chip ${dragOverIndex === index ? "orc-orden-chip-sobre" : ""} ${
                      ordenVerificado
                        ? ordenEstado === "correcto"
                          ? "orc-orden-chip-correcto"
                          : ordenAsistido
                            ? "orc-orden-chip-asistido"
                            : "orc-orden-chip-incorrecto"
                        : ""
                    }`}
                    draggable={!ordenEsCorrecto}
                    onDragStart={manejarDragStart(index)}
                    onDragOver={manejarDragOver(index)}
                    onDrop={manejarDrop(index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    style={{ borderColor: HEX_COLOR[c] }}
                  >
                    <FiMove className="orc-orden-drag-icono" />
                    <span className="orc-orden-punto" style={{ background: HEX_COLOR[c] }} />
                    {NOMBRE_COLOR[c]}
                    <small>({CONTEO[c]})</small>
                  </div>
                  {index < orden.length - 1 && <span className="orc-orden-flecha-abajo">↓</span>}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarOrden}
              disabled={cargandoOrden || ordenEsCorrecto}
            >
              <FiCheck /> {cargandoOrden ? "Verificando..." : "Verificar orden"}
            </button>
          </div>

          {/* PASO 4: COMPARACIÓN DE EVENTOS */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">4</span>
              <strong>Comparación de eventos</strong>
              {comparacionVerificada && (
                comparacionEstado === "correcto"
                  ? <FiCheckCircle className="orc-check-verde" />
                  : comparacionAsistida
                    ? <FiCheckCircle className="orc-check-asistido" />
                    : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>

            <div className="orc-comparacion-bloque">
              <p className="orc-paso-texto">{ENUNCIADO_1}</p>
              <div className="orc-opciones-radio orc-opciones-radio-fila">
                {(["verdadero", "falso"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`orc-opcion-radio ${comp1 === op ? "orc-opcion-radio-activa" : ""}`}
                    onClick={() => { setComp1(op); setComparacionVerificada(false); }}
                    aria-pressed={comp1 === op}
                    disabled={cargandoComparacion || comparacionCorrecta}
                  >
                    <span className="orc-radio-circulo" />
                    {op === "verdadero" ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {comparacionVerificada && comparacionEstado === "correcto" && comp1 === RESPUESTA_ENUNCIADO_1 && (
                  <FiCheckCircle className="orc-check-verde" />
                )}
              </div>
            </div>

            <div className="orc-comparacion-bloque">
              <p className="orc-paso-texto">{ENUNCIADO_2}</p>
              <div className="orc-opciones-radio orc-opciones-radio-fila">
                {(["verdadero", "falso"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`orc-opcion-radio ${comp2 === op ? "orc-opcion-radio-activa" : ""}`}
                    onClick={() => { setComp2(op); setComparacionVerificada(false); }}
                    aria-pressed={comp2 === op}
                    disabled={cargandoComparacion || comparacionCorrecta}
                  >
                    <span className="orc-radio-circulo" />
                    {op === "verdadero" ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {comparacionVerificada && comparacionEstado === "correcto" && comp2 === RESPUESTA_ENUNCIADO_2 && (
                  <FiCheckCircle className="orc-check-verde" />
                )}
              </div>
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarComparacion}
              disabled={cargandoComparacion || comparacionCorrecta}
            >
              <FiCheck /> {cargandoComparacion ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {/* PASO 5: PREDICCIÓN ANTES DEL CANJE */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">5</span>
              <strong>Predicción antes del canje</strong>
              {prediccionVerificada && (
                prediccionEstado === "correcto"
                  ? <FiCheckCircle className="orc-check-verde" />
                  : prediccionAsistida
                    ? <FiCheckCircle className="orc-check-asistido" />
                    : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">¿Qué color crees que saldrá en el Oráculo?</p>

            <div className="orc-opciones-radio orc-opciones-radio-grid">
              {COLORES_CAPSULA.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`orc-opcion-radio ${prediccion === c ? "orc-opcion-radio-activa" : ""}`}
                  onClick={() => { setPrediccion(c); setPrediccionVerificada(false); }}
                  aria-pressed={prediccion === c}
                  disabled={cargandoPrediccion || prediccionCorrecta}
                >
                  <span className="orc-radio-circulo" />
                  {NOMBRE_COLOR[c]}
                  {prediccionVerificada && prediccionEstado === "correcto" && c === "azul" && prediccion === c && (
                    <FiCheckCircle className="orc-check-verde orc-check-inline" />
                  )}
                </button>
              ))}
            </div>

            <div className="orc-justificacion-box">
              <strong>Justificación</strong>
              <p>{justificacionPrediccion(prediccion) || "Selecciona un color para ver la justificación."}</p>
              {prediccionVerificada && prediccionCorrecta && (
                <FiCheckCircle className={prediccionEstado === "correcto" ? "orc-check-verde" : "orc-check-asistido"} />
              )}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarPrediccion}
              disabled={cargandoPrediccion || prediccionCorrecta}
            >
              <FiCheck /> {cargandoPrediccion ? "Verificando..." : "Verificar"}
            </button>
          </div>
        </div>

        {/* FILA INFERIOR: MONEDA + INFO + ACTIVAR ORÁCULO */}
        <div className="orc-bottom-row">
          <div className="orc-moneda-card">
            <FiStar className="orc-moneda-icono" />
            <div>
              <strong>Moneda estelar</strong>
              <span>x{monedaEstelar}</span>
            </div>
          </div>

          <div className="orc-info-box">
            <FiInfo /> Revisa tus análisis. Cuando estés listo, usa tu moneda para activar el Oráculo.
          </div>

          <button
            type="button"
            className="orc-activar-btn"
            onClick={handleActivarOraculo}
            disabled={monedaEstelar <= 0 || cargandoActivar || !todosLosPasosVerificados}
          >
            <FiZap />
            <span>
              {cargandoActivar ? "Activando..." : "Activar Oráculo"}
              <small>Usar 1 moneda estelar</small>
            </span>
          </button>
        </div>
      </main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Agente! No te apresures. La cápsula es transparente y podemos analizarla antes de jugar. Primero identifica todos los colores que pueden salir; después compararemos cuáles son más y menos probables. Así podrás hacer una predicción con datos, aunque el resultado final siga dependiendo del azar."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioOraculo}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido={
            mensajePistaBait ||
            "Observa con atención la cápsula. El espacio muestral incluye todos los resultados diferentes que pueden ocurrir. El color que aparece más veces es el más probable y el que aparece menos veces es el menos probable. Recuerda que una predicción se apoya en los datos, pero nunca garantiza el resultado."
          }
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioOraculo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}