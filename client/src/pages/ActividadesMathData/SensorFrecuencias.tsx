import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo_MathNova.png";
import "./SensorFrecuencias.css";

/* ---- Reutilizadas de las actividades anteriores ---- */
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

/* ---- Nueva para la Actividad 5 ---- */
import fondoSensorImg from "../../assets/fondo-sensor-frecuencias.png";

/* ---- Audios ---- */
import introBaitAudioSensor from "../../assets/sensor-intro-audio.mp3";
import pistaBaitAudioSensor from "../../assets/sensor-pista-audio.mp3";
import baitAudioActividadCompletada from "../../assets/sensor-actividad-completada.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/sensor-vuelve-a-intentarlo.mp3";

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
  FiPercent,
  FiInfo,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiRadio,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type Senal = "alfa" | "beta" | "gamma" | "delta";

const FRECUENCIAS: Record<Senal, number> = {
  alfa: 5,
  beta: 8,
  gamma: 4,
  delta: 3,
};

const TOTAL_SENALES = 20;

const PORCENTAJES_CORRECTOS: Record<Senal, string> = {
  alfa: "25",
  beta: "40",
  gamma: "20",
  delta: "15",
};

const NOMBRE_SENAL: Record<Senal, string> = {
  alfa: "Señal Alfa",
  beta: "Señal Beta",
  gamma: "Señal Gamma",
  delta: "Señal Delta",
};

const ZONA_SENAL: Record<Senal, string> = {
  alfa: "Zona Norte",
  beta: "Zona Sur",
  gamma: "Zona Este",
  delta: "Zona Oeste",
};

const COLOR_SENAL: Record<Senal, string> = {
  alfa: "#16a34a",
  beta: "#dc2626",
  gamma: "#2563eb",
  delta: "#f97316",
};

type Zona = "norte" | "sur" | "este" | "oeste";
const NOMBRE_ZONA: Record<Zona, string> = {
  norte: "Zona Norte",
  sur: "Zona Sur",
  este: "Zona Este",
  oeste: "Zona Oeste",
};

const SENAL_MAYOR_FRECUENCIA: Senal = "beta";
const ZONA_MAS_PROBABLE: Zona = "sur";

function palitos(n: number) {
  // grupos de 4 líneas + una diagonal representando 5
  const grupos = Math.floor(n / 5);
  const resto = n % 5;
  return "IIII\u0338 ".repeat(grupos) + "I".repeat(resto);
}

/* Posiciones fijas (no aleatorias) de los puntos del radar,
   repartidos por cuadrante según la señal/zona que representan. */
const PUNTOS_RADAR: { x: number; y: number; senal: Senal }[] = [
  // Alfa (Norte) — 5 puntos, cuadrante superior
  { x: 46, y: 16, senal: "alfa" }, { x: 58, y: 20, senal: "alfa" },
  { x: 40, y: 24, senal: "alfa" }, { x: 52, y: 12, senal: "alfa" },
  { x: 62, y: 28, senal: "alfa" },
  // Beta (Sur) — 8 puntos, cuadrante inferior (el más denso)
  { x: 44, y: 70, senal: "beta" }, { x: 52, y: 76, senal: "beta" },
  { x: 38, y: 66, senal: "beta" }, { x: 60, y: 72, senal: "beta" },
  { x: 34, y: 74, senal: "beta" }, { x: 48, y: 82, senal: "beta" },
  { x: 56, y: 66, senal: "beta" }, { x: 42, y: 78, senal: "beta" },
  // Gamma (Este) — 4 puntos, cuadrante derecho
  { x: 78, y: 44, senal: "gamma" }, { x: 84, y: 52, senal: "gamma" },
  { x: 74, y: 38, senal: "gamma" }, { x: 88, y: 46, senal: "gamma" },
  // Delta (Oeste) — 3 puntos, cuadrante izquierdo
  { x: 20, y: 44, senal: "delta" }, { x: 14, y: 52, senal: "delta" },
  { x: 24, y: 38, senal: "delta" },
];

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

export default function SensorFrecuencias() {
  const navigate = useNavigate();

  const [frecAbsoluta, setFrecAbsoluta] = useState<Record<Senal, string>>({
    alfa: "",
    beta: "",
    gamma: "",
    delta: "",
  });
  const [frecAbsolutaVerificada, setFrecAbsolutaVerificada] = useState(false);

  const [frecRelativa, setFrecRelativa] = useState<Record<Senal, string>>({
    alfa: "",
    beta: "",
    gamma: "",
    delta: "",
  });
  const [frecRelativaVerificada, setFrecRelativaVerificada] = useState(false);

  const [preguntaMayorFrecuencia, setPreguntaMayorFrecuencia] = useState<Senal | null>(null);
  const [preguntaZona, setPreguntaZona] = useState<Zona | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  const absolutaEstado = (s: Senal): "correcto" | "pendiente" | "incorrecto" => {
    if (!frecAbsolutaVerificada) return "pendiente";
    return frecAbsoluta[s].trim() === String(FRECUENCIAS[s]) ? "correcto" : "incorrecto";
  };

  const relativaEstado = (s: Senal): "correcto" | "pendiente" | "incorrecto" => {
    if (!frecRelativaVerificada) return "pendiente";
    return frecRelativa[s].trim() === PORCENTAJES_CORRECTOS[s] ? "correcto" : "incorrecto";
  };

  const verificarAbsoluta = () => setFrecAbsolutaVerificada(true);
  const verificarRelativa = () => setFrecRelativaVerificada(true);

  const calcularZonaOrigen = () => {
    const absolutaOk = (Object.keys(FRECUENCIAS) as Senal[]).every(
      (s) => frecAbsoluta[s].trim() === String(FRECUENCIAS[s])
    );
    const relativaOk = (Object.keys(PORCENTAJES_CORRECTOS) as Senal[]).every(
      (s) => frecRelativa[s].trim() === PORCENTAJES_CORRECTOS[s]
    );
    const preguntasOk =
      preguntaMayorFrecuencia === SENAL_MAYOR_FRECUENCIA && preguntaZona === ZONA_MAS_PROBABLE;

    setFrecAbsolutaVerificada(true);
    setFrecRelativaVerificada(true);
    setResultado(absolutaOk && relativaOk && preguntasOk ? "exito" : "fallo");
  };

  const handleReiniciarActividad = () => {
    setFrecAbsoluta({ alfa: "", beta: "", gamma: "", delta: "" });
    setFrecAbsolutaVerificada(false);
    setFrecRelativa({ alfa: "", beta: "", gamma: "", delta: "" });
    setFrecRelativaVerificada(false);
    setPreguntaMayorFrecuencia(null);
    setPreguntaZona(null);
    setResultado(null);
  };

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
              Calculaste las frecuencias correctamente y localizaste la
              zona de origen de las señales. Sigue así y conquista la
              siguiente misión.
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
                  <strong className="res-stat-num-verde">4/4</strong>
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
          contenido="¡Lo lograste, agente! Con la frecuencia absoluta y la frecuencia relativa pudimos calcular dónde es más probable encontrar el origen de las señales. El reporte del sensor está listo para el Centro de Mando."
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
              Revisa el conteo de cada señal en el radar y recalcula sus
              porcentajes. Recuerda: frecuencia relativa = frecuencia
              absoluta ÷ total × 100.
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
                  <strong>1/4</strong>
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
                  <strong>25%</strong>
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

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡Agente, aún hay esperanza! El radar sigue esperando tu análisis y la Base MathNova confía en ti. No importa cuántos intentos necesites; lo importante es seguir adelante hasta completar la misión. Analiza los datos con atención y demuestra de lo que eres capaz."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="¡No te rindas! Cuenta con calma las marcas de conteo: Alfa 5, Beta 8, Gamma 4 y Delta 3. Cada grupo de 4 líneas con una diagonal es un grupo de 5 señales."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioSensor}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="sen-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="sen-sidebar">
        <img src={logo} alt="MathNova" className="sen-logo-img" />

        <nav className="sen-nav">
          <button className="sen-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="sen-nav-item sen-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="sen-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="sen-progreso-track">
            <div className="sen-progreso-fill" style={{ width: "80%" }} />
          </div>
          <small>4/5 actividad</small>
        </div>

        <div className="sen-xp-card">
          <small>XP acumulados</small>
          <strong>180 XP ⭐</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="sen-main" style={{ backgroundImage: `url(${fondoSensorImg})` }}>
        <header className="sen-header">
          <button className="sen-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver al tema
          </button>
          <button type="button" className="sen-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="sen-top-row">
          <div className="sen-titulo-bloque">
            <h1>Sensor de Frecuencias</h1>
            <p>
              Cuenta señales, calcula frecuencias y localiza la zona de
              origen más probable.
            </p>

            <div className="sen-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="sen-bait-avatar-img" />

              <div className="sen-explica-burbuja">
                <div className="sen-explica-titulo-row">
                  <strong>BIT te explica</strong>
                  <button
                    className="sen-audio-btn"
                    type="button"
                    onClick={() => setMostrarIntroBait(true)}
                    aria-label="Escuchar explicación"
                  >
                    <FiVolume2 />
                  </button>
                </div>
                <p>
                  Agente, despierta. El sensor nocturno registró actividad
                  extraña: veinte señales aparecieron en distintas zonas del
                  mapa mientras dormías. Necesito que cuentes cuántas veces
                  apareció cada tipo de señal y calcules qué porcentaje del
                  total representa cada una. Con esos datos, el sistema
                  podrá calcular la zona donde es más probable encontrar su
                  origen. ¡Vamos a revisar el radar!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FILA DE 4 PASOS */}
        <div className="sen-pasos-row">
          {/* PASO 1: RADAR */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">1</span>
              <strong>Registro nocturno del radar</strong>
            </div>

            <div className="sen-radar-wrap">
              <svg viewBox="0 0 100 100" className="sen-radar-svg">
                <circle cx="50" cy="50" r="48" className="sen-radar-anillo" />
                <circle cx="50" cy="50" r="32" className="sen-radar-anillo" />
                <circle cx="50" cy="50" r="16" className="sen-radar-anillo" />
                <line x1="50" y1="2" x2="50" y2="98" className="sen-radar-eje" />
                <line x1="2" y1="50" x2="98" y2="50" className="sen-radar-eje" />
                {PUNTOS_RADAR.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2.1"
                    fill={COLOR_SENAL[p.senal]}
                  />
                ))}
                <text x="50" y="9" className="sen-radar-etiqueta">Norte</text>
                <text x="50" y="96" className="sen-radar-etiqueta">Sur</text>
                <text x="6" y="53" className="sen-radar-etiqueta">Oeste</text>
                <text x="86" y="53" className="sen-radar-etiqueta">Este</text>
              </svg>
            </div>

            <div className="sen-radar-leyenda">
              {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                <div className="sen-leyenda-fila" key={s}>
                  <span className="sen-leyenda-punto" style={{ background: COLOR_SENAL[s] }} />
                  <span className="sen-leyenda-nombre">{NOMBRE_SENAL[s]}</span>
                  <small>{ZONA_SENAL[s]}</small>
                </div>
              ))}
            </div>

            <div className="sen-info-box">
              <FiInfo /> Cada punto representa una señal detectada.
            </div>
          </div>

          {/* PASO 2: FRECUENCIA ABSOLUTA */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">2</span>
              <strong>Frecuencia absoluta</strong>
            </div>

            <table className="sen-tabla">
              <thead>
                <tr>
                  <th>Tipo de señal</th>
                  <th>Conteo (marcas)</th>
                  <th>Frec. absoluta</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                  <tr key={s}>
                    <td className="sen-td-nombre">
                      <span className="sen-td-punto" style={{ background: COLOR_SENAL[s] }} />
                      {NOMBRE_SENAL[s]}
                    </td>
                    <td className="sen-td-marcas">{palitos(FRECUENCIAS[s])}</td>
                    <td>
                      <div className="sen-input-grupo">
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`sen-input sen-input-${absolutaEstado(s)}`}
                          value={frecAbsoluta[s]}
                          onChange={(e) =>
                            setFrecAbsoluta((prev) => ({ ...prev, [s]: e.target.value }))
                          }
                          aria-label={`Frecuencia absoluta de ${NOMBRE_SENAL[s]}`}
                        />
                        {absolutaEstado(s) === "correcto" && <FiCheckCircle className="sen-check-verde" />}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="sen-fila-total">
                  <td>TOTAL</td>
                  <td>—</td>
                  <td>{TOTAL_SENALES}</td>
                </tr>
              </tbody>
            </table>

            <div className="sen-info-box">
              <FiInfo /> Cada grupo de 4 líneas con una diagonal representa 5 señales.
            </div>

            <button type="button" className="sen-verificar-btn" onClick={verificarAbsoluta}>
              <FiCheck /> Verificar frecuencias
            </button>
          </div>

          {/* PASO 3: FRECUENCIA RELATIVA */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">3</span>
              <strong>Frecuencia relativa (%)</strong>
            </div>
            <p className="sen-paso-pregunta">
              (Frecuencia absoluta ÷ total) × 100
            </p>

            <table className="sen-tabla">
              <thead>
                <tr>
                  <th>Tipo de señal</th>
                  <th>Frec. relativa (%)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(PORCENTAJES_CORRECTOS) as Senal[]).map((s) => (
                  <tr key={s}>
                    <td className="sen-td-nombre">
                      <span className="sen-td-punto" style={{ background: COLOR_SENAL[s] }} />
                      {NOMBRE_SENAL[s]}
                    </td>
                    <td>
                      <div className="sen-input-grupo">
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`sen-input sen-input-${relativaEstado(s)}`}
                          value={frecRelativa[s]}
                          onChange={(e) =>
                            setFrecRelativa((prev) => ({ ...prev, [s]: e.target.value }))
                          }
                          aria-label={`Frecuencia relativa de ${NOMBRE_SENAL[s]}`}
                        />
                        <span>%</span>
                        {relativaEstado(s) === "correcto" && <FiCheckCircle className="sen-check-verde" />}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="sen-fila-total">
                  <td>TOTAL</td>
                  <td>100 %</td>
                </tr>
              </tbody>
            </table>

            <div className="sen-info-box">
              <FiInfo /> Escribe solo el número del porcentaje, sin el símbolo %.
            </div>

            <button type="button" className="sen-verificar-btn" onClick={verificarRelativa}>
              <FiPercent /> Verificar porcentajes
            </button>
          </div>

          {/* PASO 4: PREGUNTAS DE INTERPRETACIÓN */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">4</span>
              <strong>Preguntas de interpretación</strong>
            </div>

            <div className="sen-pregunta-bloque">
              <p className="sen-paso-pregunta">¿Qué tipo de señal tuvo la mayor frecuencia?</p>
              <div className="sen-opciones-radio">
                {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`sen-opcion-radio ${
                      preguntaMayorFrecuencia === s ? "sen-opcion-radio-activa" : ""
                    }`}
                    onClick={() => setPreguntaMayorFrecuencia(s)}
                    aria-pressed={preguntaMayorFrecuencia === s}
                  >
                    <span className="sen-radio-circulo" />
                    {NOMBRE_SENAL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sen-pregunta-bloque">
              <p className="sen-paso-pregunta">
                Según tus datos, ¿en qué zona del mapa es más probable
                encontrar el origen de las señales?
              </p>
              <div className="sen-opciones-radio">
                {(Object.keys(NOMBRE_ZONA) as Zona[]).map((z) => (
                  <button
                    key={z}
                    type="button"
                    className={`sen-opcion-radio ${
                      preguntaZona === z ? "sen-opcion-radio-activa" : ""
                    }`}
                    onClick={() => setPreguntaZona(z)}
                    aria-pressed={preguntaZona === z}
                  >
                    <span className="sen-radio-circulo" />
                    {NOMBRE_ZONA[z]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: PISTA + CALCULAR ZONA DE ORIGEN */}
        <div className="sen-bottom-row">
          <div className="sen-pista-card">
            <button
              type="button"
              className="sen-pista-trigger"
              onClick={() => setMostrarPistaBait(true)}
            >
              <img src={baitPistaImg} alt="" className="sen-pista-icono" />
              <strong>Pista de BIT</strong>
            </button>

            <div className="sen-pista-items">
              <div className="sen-pista-item">
                <FiRadio />
                <span>Frecuencia absoluta: cuenta cuántas veces aparece cada señal.</span>
              </div>
              <div className="sen-pista-item">
                <FiPercent />
                <span>Frecuencia relativa: frecuencia absoluta ÷ 20 × 100.</span>
              </div>
            </div>
          </div>

          <button type="button" className="sen-calcular-btn" onClick={calcularZonaOrigen}>
            <FiTarget /> Calcular Zona de Origen
          </button>
        </div>
      </main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="Agente, despierta. El sensor nocturno registró actividad extraña: veinte señales aparecieron en distintas zonas del mapa mientras dormías. Necesito que cuentes cuántas veces apareció cada tipo de señal y calcules qué porcentaje del total representa cada una. Con esos datos, el sistema podrá calcular la zona donde es más probable encontrar su origen. ¡Vamos a revisar el radar!"
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioSensor}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="¡No te rindas! Cuenta con calma las marcas de conteo: Alfa 5, Beta 8, Gamma 4 y Delta 3. Cada grupo de 4 líneas con una diagonal es un grupo de 5 señales."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioSensor}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}