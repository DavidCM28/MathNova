import { useState, useRef } from "react";
import type { DragEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo_MathNova.png";
import "./NucleoDecisiones.css";

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

/* ---- Nueva para la Actividad 6 ---- */
import fondoNucleoImg from "../../assets/fondo-nucleo-decisiones.png";
import villanoDivideImg from "../../assets/villano-divide.png";

/* ---- Audios ---- */
import introBaitAudioNucleo from "../../assets/intro_act6.mp3";
import pistaBaitAudioNucleo from "../../assets/pista_act6.mp3";
import baitAudioActividadCompletada from "../../assets/actividad_completada_act6.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/volver_intentarlo_act6.mp3";

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
  FiSend,
  FiShield,
  FiClipboard,
  FiRefreshCw,
  FiAlertTriangle,
  FiMove,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

interface Expedicion {
  id: number;
  minutos: number;
}

const EXPEDICIONES: Expedicion[] = [
  { id: 1, minutos: 44 },
  { id: 2, minutos: 60 },
  { id: 3, minutos: 48 },
  { id: 4, minutos: 44 },
  { id: 5, minutos: 58 },
  { id: 6, minutos: 52 },
];

const ORDEN_INICIAL: number[] = EXPEDICIONES.map((e) => e.id);
const VALOR_POR_ID: Record<number, number> = Object.fromEntries(
  EXPEDICIONES.map((e) => [e.id, e.minutos])
);

const SECUENCIA_CORRECTA = [44, 44, 48, 52, 58, 60];
const SUMA_TOTAL = EXPEDICIONES.reduce((acc, e) => acc + e.minutos, 0); // 306

const MEDIA_CORRECTA = "51";
const MEDIANA_CORRECTA = "50";
const MODA_CORRECTA = "44";
const RANGO_CORRECTA = "16";
const CAPACIDAD_CORRECTA = Number(MEDIA_CORRECTA) + Number(RANGO_CORRECTA); // 67

type EstadoCampo = "correcto" | "pendiente" | "incorrecto";

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

export default function NucleoDecisiones() {
  const navigate = useNavigate();

  /* ---- Paso 2: ordenamiento (drag & drop) ---- */
  const [orden, setOrden] = useState<number[]>(ORDEN_INICIAL);
  const [ordenVerificado, setOrdenVerificado] = useState(false);
  const [pasosDesbloqueados, setPasosDesbloqueados] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ---- Pasos 3 a 6: medidas estadísticas ---- */
  const [media, setMedia] = useState("");
  const [mediaVerificada, setMediaVerificada] = useState(false);
  const [mediana, setMediana] = useState("");
  const [medianaVerificada, setMedianaVerificada] = useState(false);
  const [moda, setModa] = useState("");
  const [modaVerificada, setModaVerificada] = useState(false);
  const [rango, setRango] = useState("");
  const [rangoVerificada, setRangoVerificada] = useState(false);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  /* ---- Derivados ---- */
  const secuenciaActual = orden.map((id) => VALOR_POR_ID[id]);
  const ordenEsCorrecto = secuenciaActual.every((v, i) => v === SECUENCIA_CORRECTA[i]);

  const estadoCampo = (verificado: boolean, valor: string, correcto: string): EstadoCampo => {
    if (!verificado) return "pendiente";
    return valor.trim() === correcto ? "correcto" : "incorrecto";
  };

  const mediaEstado = estadoCampo(mediaVerificada, media, MEDIA_CORRECTA);
  const medianaEstado = estadoCampo(medianaVerificada, mediana, MEDIANA_CORRECTA);
  const modaEstado = estadoCampo(modaVerificada, moda, MODA_CORRECTA);
  const rangoEstado = estadoCampo(rangoVerificada, rango, RANGO_CORRECTA);

  const mediaValida = media.trim() === MEDIA_CORRECTA;
  const rangoValido = rango.trim() === RANGO_CORRECTA;
  const capacidadTotal = mediaValida && rangoValido ? Number(media) + Number(rango) : null;
  const capacidadCorrecta = capacidadTotal === CAPACIDAD_CORRECTA;

  /* ---- Drag & drop del paso 2 ---- */
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
      const [movido] = copia.splice(origen, 1);
      copia.splice(index, 0, movido);
      return copia;
    });
    dragIndexRef.current = null;
    setOrdenVerificado(false);
    setPasosDesbloqueados(false);
  };

  const verificarOrden = () => {
    setOrdenVerificado(true);
    if (ordenEsCorrecto) setPasosDesbloqueados(true);
  };

  const verificarMedia = () => setMediaVerificada(true);
  const verificarMediana = () => setMedianaVerificada(true);
  const verificarModa = () => setModaVerificada(true);
  const verificarRango = () => setRangoVerificada(true);

  /* ---- Envío final de la decisión ---- */
  const handleEnviarDecision = () => {
    setOrdenVerificado(true);
    setMediaVerificada(true);
    setMedianaVerificada(true);
    setModaVerificada(true);
    setRangoVerificada(true);

    const todoCorrecto =
      ordenEsCorrecto &&
      mediaValida &&
      mediana.trim() === MEDIANA_CORRECTA &&
      moda.trim() === MODA_CORRECTA &&
      rangoValido;

    if (ordenEsCorrecto) setPasosDesbloqueados(true);
    setResultado(todoCorrecto ? "exito" : "fallo");
  };

  const handleReiniciarActividad = () => {
    setOrden(ORDEN_INICIAL);
    setOrdenVerificado(false);
    setPasosDesbloqueados(false);
    setMedia("");
    setMediaVerificada(false);
    setMediana("");
    setMedianaVerificada(false);
    setModa("");
    setModaVerificada(false);
    setRango("");
    setRangoVerificada(false);
    setResultado(null);
  };

  /* ---- Resumen para las pantallas de resultado ---- */
  const aciertos = [
    ordenEsCorrecto,
    mediaValida,
    mediana.trim() === MEDIANA_CORRECTA,
    moda.trim() === MODA_CORRECTA,
    rangoValido,
  ].filter(Boolean).length;
  const totalPasos = 5;
  const precision = Math.round((aciertos / totalPasos) * 100);
  const puntosGanados = resultado === "exito" ? 50 : 10;

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
              Ordenaste los tiempos y calculaste correctamente la media, la
              mediana, la moda y el rango. El Núcleo de Decisiones aprobó tu
              análisis y liberó la energía segura para la nave.
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
                  <strong>—</strong>
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
          contenido="¡Decisión autorizada, agente! Estimamos una misión de 51 minutos y cargamos 16 minutos adicionales de reserva. La nave está preparada para operar durante 67 minutos. El Núcleo de Decisiones queda restaurado."
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
              Revisa el orden de los tiempos y vuelve a calcular la media, la
              mediana, la moda y el rango. Recuerda: la capacidad total es la
              media más el rango.
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
                  <strong>—</strong>
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

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="Buen intento, agente. El Núcleo guardó tu avance, pero todavía falta completar la bitácora y enviar la decisión. Puedes volver a intentarlo desde el primer paso pendiente. Cada cálculo que ya resolviste permanecerá guardado."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Revisa cada parte del análisis. Primero, ordena los tiempos de menor a mayor. Para obtener la media, suma los seis valores y divídelos entre seis. La mediana se obtiene con los dos valores centrales del conjunto ordenado. La moda es el tiempo que más se repite. El rango se calcula restando el valor menor al mayor. Finalmente, utiliza la media como estimación general y el rango como reserva adicional. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioNucleo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="nuc-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="nuc-sidebar">
        <img src={logo} alt="MathNova" className="nuc-logo-img" />

        <nav className="nuc-nav">
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="nuc-nav-item nuc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="nuc-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="nuc-progreso-track">
            <div className="nuc-progreso-fill" style={{ width: "83%" }} />
          </div>
          <small>5/6 actividad</small>
        </div>

        <div className="nuc-xp-card">
          <small>XP acumulados</small>
          <strong>180 XP ⭐</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="nuc-main" style={{ backgroundImage: `url(${fondoNucleoImg})` }}>
        <header className="nuc-header">
          <button className="nuc-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver al tema
          </button>
          <button type="button" className="nuc-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR: TÍTULO + OBJETIVO + VILLANO */}
        <div className="nuc-layout">
          <div className="nuc-col-izquierda">
            <div className="nuc-top-row">
              <div className="nuc-titulo-bloque">
                <h1>El Núcleo de Decisiones</h1>
                <p>
                  Ordena los tiempos de seis expediciones y calcula la media,
                  la mediana, la moda y el rango. Después usa estas medidas
                  para decidir cuánta energía segura necesita la nave.
                </p>
              </div>

              <div className="nuc-objetivo-card">
                <div className="nuc-objetivo-icono">
                  <FiRefreshCw />
                </div>
                <div>
                  <strong>Objetivo de la misión</strong>
                  <p>
                    Usa las medidas de tendencia central y de dispersión para
                    tomar una decisión segura y eficiente.
                  </p>
                </div>
              </div>
            </div>

            {/* PASO 1: REGISTRO DE EXPEDICIONES */}
            <div className="nuc-paso-card">
              <div className="nuc-paso-header">
                <span className="nuc-paso-num">1</span>
                <strong>Registro de expediciones</strong>
              </div>

              <div className="nuc-expediciones-row">
                {EXPEDICIONES.map((exp, i) => (
                  <div className="nuc-expedicion-card" key={exp.id}>
                    <small>Expedición {i + 1}</small>
                    <strong>{exp.minutos}</strong>
                    <span>minutos</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PASO 2: ORDENAMIENTO DE TIEMPOS */}
            <div className="nuc-paso-card">
              <div className="nuc-paso-header">
                <span className="nuc-paso-num">2</span>
                <strong>Ordenamiento de tiempos</strong>
                {ordenVerificado && (
                  ordenEsCorrecto
                    ? <FiCheckCircle className="nuc-check-verde" />
                    : <FiAlertTriangle className="nuc-check-alerta" />
                )}
              </div>

              <div className="nuc-orden-row">
                {orden.map((id, index) => (
                  <div key={id} className="nuc-orden-item">
                    <div
                      className={`nuc-orden-chip ${
                        dragOverIndex === index ? "nuc-orden-chip-sobre" : ""
                      } ${
                        ordenVerificado
                          ? ordenEsCorrecto
                            ? "nuc-orden-chip-correcto"
                            : "nuc-orden-chip-incorrecto"
                          : ""
                      }`}
                      draggable
                      onDragStart={manejarDragStart(index)}
                      onDragOver={manejarDragOver(index)}
                      onDrop={manejarDrop(index)}
                      onDragLeave={() => setDragOverIndex(null)}
                    >
                      <FiMove className="nuc-orden-drag-icono" />
                      {VALOR_POR_ID[id]}
                    </div>
                    {index < orden.length - 1 && <span className="nuc-orden-flecha">→</span>}
                  </div>
                ))}
                <span className="nuc-orden-unidad">minutos</span>
              </div>

              <small className="nuc-orden-ayuda">Arrastra para reordenar</small>

              <button type="button" className="nuc-verificar-btn" onClick={verificarOrden}>
                <FiCheck /> Verificar orden
              </button>
            </div>

            {/* PASOS 3 A 6: MEDIA, MEDIANA, MODA, RANGO */}
            <div className={`nuc-stats-row ${!pasosDesbloqueados ? "nuc-stats-row-bloqueada" : ""}`}>
              {/* PASO 3: MEDIA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">3</span>
                  <strong>Media (promedio)</strong>
                  {mediaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                </div>
                <p className="nuc-formula">
                  {SECUENCIA_CORRECTA.join("+")}={SUMA_TOTAL}
                </p>
                <p className="nuc-formula">{SUMA_TOTAL} ÷ 6 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${mediaEstado}`}
                    value={media}
                    disabled={!pasosDesbloqueados}
                    onChange={(e) => setMedia(e.target.value)}
                    aria-label="Resultado de la media"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados}
                  onClick={verificarMedia}
                >
                  Verificar
                </button>
              </div>

              {/* PASO 4: MEDIANA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">4</span>
                  <strong>Mediana</strong>
                  {medianaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                </div>
                <p className="nuc-formula">
                  44, 44, <span className="nuc-formula-resaltado">48, 52</span>, 58, 60
                </p>
                <p className="nuc-formula">(48 + 52) ÷ 2 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${medianaEstado}`}
                    value={mediana}
                    disabled={!pasosDesbloqueados}
                    onChange={(e) => setMediana(e.target.value)}
                    aria-label="Resultado de la mediana"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados}
                  onClick={verificarMediana}
                >
                  Verificar
                </button>
              </div>

              {/* PASO 5: MODA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">5</span>
                  <strong>Moda</strong>
                  {modaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                </div>
                <p className="nuc-formula">
                  <span className="nuc-formula-resaltado">44, 44</span>, 48, 52, 58, 60
                </p>
                <p className="nuc-formula">El valor que más se repite es:</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${modaEstado}`}
                    value={moda}
                    disabled={!pasosDesbloqueados}
                    onChange={(e) => setModa(e.target.value)}
                    aria-label="Resultado de la moda"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados}
                  onClick={verificarModa}
                >
                  Verificar
                </button>
              </div>

              {/* PASO 6: RANGO */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">6</span>
                  <strong>Rango</strong>
                  {rangoEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                </div>
                <p className="nuc-formula">Máximo − Mínimo</p>
                <p className="nuc-formula">60 − 44 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${rangoEstado}`}
                    value={rango}
                    disabled={!pasosDesbloqueados}
                    onChange={(e) => setRango(e.target.value)}
                    aria-label="Resultado del rango"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados}
                  onClick={verificarRango}
                >
                  Verificar
                </button>
              </div>
            </div>

            {!pasosDesbloqueados && (
              <div className="nuc-info-box">
                <FiInfo /> Ordena los tiempos y verifica el paso 2 para desbloquear la media, la mediana, la moda y el rango.
              </div>
            )}

            {/* FILA INFERIOR: BIT EXPLICA + VER PISTA */}
            <div className="nuc-bottom-row">
              <div className="nuc-explica-fila">
                <img src={baitSaludoImg} alt="Bait explicando" className="nuc-bait-avatar-img" />

                <div className="nuc-explica-burbuja">
                  <div className="nuc-explica-titulo-row">
                    <strong>BIT te explica</strong>
                    <button
                      className="nuc-audio-btn"
                      type="button"
                      onClick={() => setMostrarIntroBait(true)}
                      aria-label="Escuchar explicación"
                    >
                      <FiVolume2 />
                    </button>
                  </div>
                  <p>
                    ¡Agente! Tenemos los tiempos de seis expediciones
                    similares. Ordenaremos los datos y calcularemos la
                    media, la mediana, la moda y el rango. Con estas medidas
                    estimaremos la duración de la nueva misión y decidiremos
                    cuánta energía adicional activará el Núcleo de
                    Decisiones.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="nuc-pista-btn"
                onClick={() => setMostrarPistaBait(true)}
              >
                <img src={baitPistaImg} alt="" className="nuc-pista-icono" />
                Ver pista
              </button>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA ================= */}
          <div className="nuc-col-derecha">
            <img
              src={villanoDivideImg}
              alt="Interferencia: DIVIDE ha mezclado los tiempos de las expediciones. Sin un análisis correcto, el Núcleo jamás autorizará la energía."
              className="nuc-villano-card-img"
            />

            <div className="nuc-bitacora-card">
              <div className="nuc-bitacora-header">
                <FiClipboard />
                <strong>Bitácora de decisión</strong>
              </div>

              <div className="nuc-bitacora-fila">
                <span>Estimación general (media)</span>
                <div className="nuc-bitacora-valor">
                  {mediaValida ? `${media} min` : "— min"}
                </div>
              </div>

              <div className="nuc-bitacora-fila">
                <span>Reserva adicional (protocolo)</span>
                <div className="nuc-bitacora-valor">
                  {rangoValido ? `${rango} min` : "— min"}
                </div>
              </div>

              <div className="nuc-capacidad-box">
                <small>Capacidad total recomendada</small>
                <div className="nuc-capacidad-fila">
                  <div className="nuc-capacidad-icono">
                    <FiShield />
                  </div>
                  <strong className={capacidadTotal !== null ? (capacidadCorrecta ? "nuc-capacidad-verde" : "nuc-capacidad-alerta") : ""}>
                    {capacidadTotal !== null ? `${capacidadTotal} min` : "— min"}
                  </strong>
                  {capacidadCorrecta && <FiCheckCircle className="nuc-check-verde" />}
                </div>
              </div>

              <div className="nuc-justificacion-box">
                <FiShield />
                <div>
                  <strong>Justificación</strong>
                  <p>
                    La media estima la duración general de la misión y el
                    rango funciona como reserva adicional para una operación
                    segura.
                  </p>
                </div>
              </div>

              <button type="button" className="nuc-enviar-btn" onClick={handleEnviarDecision}>
                <FiSend /> Enviar decisión
              </button>
            </div>
          </div>
        </div>
      </main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Agente! Tenemos los tiempos de seis expediciones similares. Ordenaremos los datos y calcularemos la media, la mediana, la moda y el rango. Con estas medidas estimaremos la duración de la nueva misión y decidiremos cuánta energía adicional activará el Núcleo de Decisiones."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioNucleo}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Revisa cada parte del análisis. Primero, ordena los tiempos de menor a mayor. Para obtener la media, suma los seis valores y divídelos entre seis. La mediana se obtiene con los dos valores centrales del conjunto ordenado. La moda es el tiempo que más se repite. El rango se calcula restando el valor menor al mayor. Finalmente, utiliza la media como estimación general y el rango como reserva adicional. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioNucleo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}