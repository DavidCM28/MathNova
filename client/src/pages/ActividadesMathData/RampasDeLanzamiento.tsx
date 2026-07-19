import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";
import logo from "../../assets/logo_MathNova.png";
import interferenciaDivideImg from "../../assets/interferencia-divide.png";
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import holaMathDataImg from "../../assets/hola-MathData.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";
import introBaitAudio from "../../assets/rampas-intro-audio.mp3";
import pistaBaitAudio from "../../assets/rampas-pista-audio.mp3";
import baitAudioActividadCompletada from "../../assets/bait-actividad-completada.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/bait-vuelve-a-intentarlo.mp3";
import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
  FiVolume2,
  FiSend,
  FiTarget,
  FiX,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import "./RampasDeLanzamiento.css";

/* =========================================================
   CONFIGURACIÓN DEL BACKEND
========================================================= */

const API_URL = "http://localhost:3001/api";

/* =========================================================
   DATOS DE LA MISIÓN
   (fijos por ahora; se pueden mover a props/backend después)
========================================================= */

interface Punto {
  x: number;
  y: number;
}

const DATOS_ASCENSO: Punto[] = [
  { x: 1, y: 3 },
  { x: 2, y: 6 },
  { x: 3, y: 9 },
  { x: 4, y: 12 },
  { x: 5, y: 15 },
];

const DATOS_DESCENSO: Punto[] = [
  { x: 1, y: -2 },
  { x: 2, y: -4 },
  { x: 3, y: -6 },
  { x: 4, y: -8 },
  { x: 5, y: -10 },
];

type Pendiente = "positiva" | "negativa" | null;

/* =========================================================
   SUBCOMPONENTE: gráfica de línea (SVG a mano, sin librerías)
========================================================= */

interface GraficaRampaProps {
  color: "verde" | "rojo";
  puntos: Punto[];
  esAscenso: boolean;
}

function GraficaRampa({ color, puntos, esAscenso }: GraficaRampaProps) {
  // Solo graficamos los primeros 3 puntos para no saturar la mini-gráfica
  const visibles = puntos.slice(0, 3);

  const escalaX = 28; // px por unidad en X
  const escalaY = 14; // px por unidad en Y
  const origenX = 70;
  const origenY = esAscenso ? 180 : 40;

  const aPx = (p: Punto) => ({
    px: origenX + p.x * escalaX,
    py: origenY - p.y * escalaY,
  });

  const pathD = visibles
    .map((p, i) => {
      const { px, py } = aPx(p);
      return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 260 210"
      className="rmp-grafica-svg"
      role="img"
      aria-label={`Gráfica de la rampa de ${esAscenso ? "ascenso" : "descenso"}`}
    >
      {/* Ejes */}
      <line x1="14" y1={origenY} x2="248" y2={origenY} className="rmp-eje" />
      <line x1={origenX} y1="8" x2={origenX} y2="202" className="rmp-eje" />
      <polygon
        points={`248,${origenY} 239,${origenY - 5} 239,${origenY + 5}`}
        className="rmp-eje-flecha"
      />
      <polygon
        points={`${origenX},8 ${origenX - 5},17 ${origenX + 5},17`}
        className="rmp-eje-flecha"
      />

      {/* Guías punteadas + puntos */}
      {visibles.map((p) => {
        const { px, py } = aPx(p);
        return (
          <g key={`${p.x}-${p.y}`}>
            <line x1={origenX} y1={py} x2={px} y2={py} className="rmp-guia" />
            <line x1={px} y1={origenY} x2={px} y2={py} className="rmp-guia" />
            <circle cx={px} cy={py} r="4.5" className={`rmp-punto rmp-punto-${color}`} />
            <text x={px + 7} y={py - 7} className="rmp-punto-label">
              ({p.x},{p.y})
            </text>
          </g>
        );
      })}

      {/* Recta */}
      <path d={pathD} className={`rmp-linea rmp-linea-${color}`} fill="none" />

      {/* Etiquetas de ejes */}
      <text x="90" y={origenY + 22} className="rmp-eje-label">
        X: Distancia recorrida (m)
      </text>
      <text x="8" y="18" className="rmp-eje-label-y">
        Y: {esAscenso ? "Altura alcanzada" : "Altura"} (m)
      </text>
    </svg>
  );
}

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de Generador de Energía, para que las
   introducciones/pistas con audio se sientan iguales
   en todas las actividades.
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

export default function RampasDeLanzamiento() {
  const navigate = useNavigate();

  // El ID del estudiante se obtiene de la sesión activa en cada render
  const usuarioSesion = getSessionUser();
  const ID_ESTUDIANTE = usuarioSesion?.id_usuario;

  const [pendienteAscenso, setPendienteAscenso] = useState<Pendiente>(null);
  const [pendienteDescenso, setPendienteDescenso] = useState<Pendiente>(null);
  const [ecAscenso, setEcAscenso] = useState("");
  const [ecDescenso, setEcDescenso] = useState("");

  const [bitPendienteAscenso, setBitPendienteAscenso] = useState("");
  const [bitEcAscenso, setBitEcAscenso] = useState("");
  const [bitPendienteDescenso, setBitPendienteDescenso] = useState("");
  const [bitEcDescenso, setBitEcDescenso] = useState("");

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);
  const [cargando, setCargando] = useState(false);

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const response = await fetch(`${API_URL}/rampas/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;

          if (progreso.pendiente_ascenso) setPendienteAscenso(progreso.pendiente_ascenso);
          if (progreso.pendiente_descenso) setPendienteDescenso(progreso.pendiente_descenso);
          if (progreso.ecuacion_ascenso) setEcAscenso(progreso.ecuacion_ascenso);
          if (progreso.ecuacion_descenso) setEcDescenso(progreso.ecuacion_descenso);
          if (progreso.bitacora_pendiente_ascenso) setBitPendienteAscenso(progreso.bitacora_pendiente_ascenso);
          if (progreso.bitacora_ecuacion_ascenso) setBitEcAscenso(progreso.bitacora_ecuacion_ascenso);
          if (progreso.bitacora_pendiente_descenso) setBitPendienteDescenso(progreso.bitacora_pendiente_descenso);
          if (progreso.bitacora_ecuacion_descenso) setBitEcDescenso(progreso.bitacora_ecuacion_descenso);

          if (progreso.completada) {
            setResultado(progreso.resultado_correcto ? "exito" : "fallo");
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      }
    };

    cargarProgreso();
  }, []);

  // ==========================================
  // VERIFICAR RESPUESTAS CON EL BACKEND
  // ==========================================

  const verificarRespuestas = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/rampas/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          pendiente_ascenso: pendienteAscenso,
          pendiente_descenso: pendienteDescenso,
          ecuacion_ascenso: ecAscenso,
          ecuacion_descenso: ecDescenso,
          bitacora_pendiente_ascenso: bitPendienteAscenso,
          bitacora_ecuacion_ascenso: bitEcAscenso,
          bitacora_pendiente_descenso: bitPendienteDescenso,
          bitacora_ecuacion_descenso: bitEcDescenso,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setResultado(data.data.correcto ? "exito" : "fallo");
      } else {
        alert("❌ Error al procesar la respuesta.");
      }
    } catch (error) {
      console.error("Error al verificar respuestas:", error);
      alert("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
    try {
      await fetch(`${API_URL}/rampas/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setPendienteAscenso(null);
    setPendienteDescenso(null);
    setEcAscenso("");
    setEcDescenso("");
    setBitPendienteAscenso("");
    setBitEcAscenso("");
    setBitPendienteDescenso("");
    setBitEcDescenso("");
    setResultado(null);
  };

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  // ==========================================
  // PANTALLA: VUELVE A INTENTARLO
  // ==========================================

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="rmp-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="rmp-sidebar">
        <img src={logo} alt="MathNova" className="rmp-logo-img" />

        <nav className="rmp-nav">
          <button className="rmp-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="rmp-nav-item rmp-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/recompensas")}
          >
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="rmp-sidebar-villano">
          <img
            src={holaMathDataImg}
            alt="Bait animando"
            className="rmp-sidebar-villano-avatar"
          />
          <p>¡Tú puedes, acaba con esa rampa!</p>
        </div>

        <div className="rmp-sidebar-progreso">
          <span className="rmp-sidebar-label">Progreso de la actividad</span>
          <div className="rmp-progreso-track">
            <div className="rmp-progreso-fill" style={{ width: "0%" }} />
          </div>
          <span className="rmp-sidebar-sub">0/1 actividad</span>
        </div>

        <div className="rmp-sidebar-xp">
          <span className="rmp-sidebar-label">XP acumulados</span>
          <strong>⭐ 120 XP</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="rmp-main">
        <header className="rmp-header">
          <div className="rmp-header-izquierda">
        <button className="rmp-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
        <FiArrowLeft /> Volver al tema
        </button>
            <span className="rmp-actividad-pill">Actividad 1 de 1</span>
          </div>
          <button className="rmp-ayuda-btn" type="button" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="rmp-top-row">
          <div className="rmp-centro-control">
            <div className="rmp-centro-control-header">
              <FiTarget /> CENTRO DE CONTROL
            </div>
            <ul>
              <li>
                <span className="rmp-bullet-azul" />
                Observa si la recta sube o baja.
              </li>
              <li>
                <FiArrowUp className="rmp-icono-verde" />
                Rampa de ascenso: por cada 1 m que avanza,{" "}
                <strong>sube 3 m.</strong>
              </li>
              <li>
                <FiArrowDown className="rmp-icono-rojo" />
                Rampa de descenso: por cada 1 m que avanza,{" "}
                <strong>baja 2 m.</strong>
              </li>
            </ul>
          </div>

          <img
            src={baitSaludoImg}
            alt="Bait saludando"
            className="rmp-robot-avatar-img"
          />

          <div className="rmp-titulo-bloque">
            <div className="rmp-titulo-row">
              <div className="rmp-titulo-icono">
                <FiTarget />
              </div>
              <div>
                <h1>Rampas de Lanzamiento</h1>
                <p>
                  Identifica la pendiente de cada rampa y completa la
                  ecuación correcta.
                </p>
              </div>
            </div>

            <div className="rmp-hola-piloto">
              <div>
                <strong>¡Hola, piloto!</strong>
                <p>
                  Agente, la nave está lista para despegar, pero el sistema
                  de vuelo necesita que calibres las dos rampas de
                  lanzamiento. Cada rampa describe una relación entre la
                  distancia recorrida y la altura de la nave. Deberás
                  descubrir si la recta sube o baja y escribir su ecuación.
                  Sin eso, el despegue queda bloqueado. ¡Empieza ya!
                </p>
              </div>
              <button
                className="rmp-audio-btn"
                type="button"
                onClick={() => setMostrarIntroBait(true)}
                aria-label="Escuchar instrucciones"
              >
                <FiVolume2 />
              </button>
            </div>
          </div>

          <img
            src={interferenciaDivideImg}
            alt="Interferencia de Divide: X ÷ 3 = . Si te confundes con el signo, el despegue fallará. A ver si puedes descubrir la pendiente correcta."
            className="rmp-villano-box"
          />
        </div>

        {/* GRÁFICAS */}
        <div className="rmp-graficas-row">
          {/* RAMPA DE ASCENSO */}
          <div className="rmp-grafica-card rmp-grafica-card-verde">
            <div className="rmp-grafica-header">
              <span className="rmp-numero-badge rmp-numero-badge-verde">1</span>
              <h2>Rampa de ascenso</h2>
            </div>

            <div className="rmp-grafica-contenido">
              <GraficaRampa color="verde" puntos={DATOS_ASCENSO} esAscenso={true} />

              <table className="rmp-tabla">
                <thead>
                  <tr>
                    <th>x (m)</th>
                    <th>y (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {DATOS_ASCENSO.map((p) => (
                    <tr key={p.x}>
                      <td>{p.x}</td>
                      <td>{p.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rmp-pendiente-row">
              <span>La pendiente es:</span>
              <div className="rmp-pendiente-btns">
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteAscenso === "positiva" ? "rmp-pendiente-btn-activo-verde" : ""
                  }`}
                  onClick={() => setPendienteAscenso("positiva")}
                  aria-pressed={pendienteAscenso === "positiva"}
                >
                  Positiva
                </button>
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteAscenso === "negativa" ? "rmp-pendiente-btn-activo-rojo" : ""
                  }`}
                  onClick={() => setPendienteAscenso("negativa")}
                  aria-pressed={pendienteAscenso === "negativa"}
                >
                  Negativa
                </button>
              </div>
            </div>

            <div className="rmp-ecuacion-row">
              <span>Ecuación:</span>
              <span className="rmp-ecuacion-y">y =</span>
              <input
                type="text"
                inputMode="numeric"
                className="rmp-ecuacion-input"
                value={ecAscenso}
                onChange={(e) => setEcAscenso(e.target.value)}
                aria-label="Pendiente de la rampa de ascenso"
              />
              <span className="rmp-ecuacion-x">x</span>
            </div>
          </div>

          {/* RAMPA DE DESCENSO */}
          <div className="rmp-grafica-card rmp-grafica-card-rojo">
            <div className="rmp-grafica-header">
              <span className="rmp-numero-badge rmp-numero-badge-rojo">2</span>
              <h2>Rampa de descenso</h2>
            </div>

            <div className="rmp-grafica-contenido">
              <GraficaRampa color="rojo" puntos={DATOS_DESCENSO} esAscenso={false} />

              <table className="rmp-tabla">
                <thead>
                  <tr>
                    <th>x (m)</th>
                    <th>y (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {DATOS_DESCENSO.map((p) => (
                    <tr key={p.x}>
                      <td>{p.x}</td>
                      <td>{p.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rmp-pendiente-row">
              <span>La pendiente es:</span>
              <div className="rmp-pendiente-btns">
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteDescenso === "positiva" ? "rmp-pendiente-btn-activo-verde" : ""
                  }`}
                  onClick={() => setPendienteDescenso("positiva")}
                  aria-pressed={pendienteDescenso === "positiva"}
                >
                  Positiva
                </button>
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteDescenso === "negativa" ? "rmp-pendiente-btn-activo-rojo" : ""
                  }`}
                  onClick={() => setPendienteDescenso("negativa")}
                  aria-pressed={pendienteDescenso === "negativa"}
                >
                  Negativa
                </button>
              </div>
            </div>

            <div className="rmp-ecuacion-row">
              <span>Ecuación:</span>
              <span className="rmp-ecuacion-y">y =</span>
              <span className="rmp-ecuacion-signo">−</span>
              <input
                type="text"
                inputMode="numeric"
                className="rmp-ecuacion-input"
                value={ecDescenso}
                onChange={(e) => setEcDescenso(e.target.value)}
                aria-label="Pendiente de la rampa de descenso"
              />
              <span className="rmp-ecuacion-x">x</span>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR */}
        <div className="rmp-bottom-row">
          <div className="rmp-bitacora-card">
            <div className="rmp-bitacora-header">
              <FiSend /> BITÁCORA DE VUELO{" "}
              <span className="rmp-bitacora-sub">(Respuesta final)</span>
            </div>

            <div className="rmp-bitacora-fila">
              <span className="rmp-bitacora-tipo rmp-bitacora-tipo-verde">
                <FiArrowUp /> Ascenso:
              </span>
              <span>pendiente</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitPendienteAscenso}
                onChange={(e) => setBitPendienteAscenso(e.target.value)}
                aria-label="Pendiente final de ascenso"
              />
              <span>ecuación</span>
              <span>y =</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitEcAscenso}
                onChange={(e) => setBitEcAscenso(e.target.value)}
                aria-label="Ecuación final de ascenso"
              />
            </div>

            <div className="rmp-bitacora-fila">
              <span className="rmp-bitacora-tipo rmp-bitacora-tipo-rojo">
                <FiArrowDown /> Descenso:
              </span>
              <span>pendiente</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitPendienteDescenso}
                onChange={(e) => setBitPendienteDescenso(e.target.value)}
                aria-label="Pendiente final de descenso"
              />
              <span>ecuación</span>
              <span>y =</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitEcDescenso}
                onChange={(e) => setBitEcDescenso(e.target.value)}
                aria-label="Ecuación final de descenso"
              />
            </div>

            <p className="rmp-bitacora-nota">
              <FiInfo /> Completa las respuestas arriba y luego verifica tu
              misión.
            </p>
          </div>

          <div className="rmp-pista-card">
            <button
              type="button"
              className="rmp-pista-trigger"
              onClick={() => setMostrarPistaBait(true)}
            >
              <img
                src={baitPistaImg}
                alt=""
                className="rmp-pista-trigger-img"
                aria-hidden="true"
              />
              <strong>Pista de Bait</strong>
            </button>

            <p className="rmp-pista-preview">
              ¿Ya sabes si la rampa sube o baja? Presiona el botón de arriba
              para que Bait te dé una pista.
            </p>

            <button
              className="rmp-verificar-btn"
              type="button"
              onClick={verificarRespuestas}
              disabled={cargando}
            >
              <FiSend /> {cargando ? "Verificando..." : "Verificar respuestas"}
            </button>
          </div>
        </div>
      </main>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Si la recta sube de izquierda a derecha, la pendiente es positiva. Si baja, es negativa. Recuerda: pendiente = cambio vertical ÷ cambio horizontal."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudio}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="¡Hola, piloto!"
          contenido="Agente, la nave está lista para despegar, pero el sistema de vuelo necesita que calibres las dos rampas de lanzamiento. Cada rampa describe una relación entre la distancia recorrida y la altura de la nave. Deberás descubrir si la recta sube o baja y escribir su ecuación. Sin eso, el despegue queda bloqueado. ¡Empieza ya!"
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudio}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarBaitExito && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡Excelente trabajo, piloto! Calibraste las dos rampas de lanzamiento correctamente. Sigue así y conquista la siguiente misión."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioActividadCompletada}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitExito(false)}
        />
      )}

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡No te rindas, piloto! Revisa la tabla de cada rampa: observa cómo sube o baja la recta, y usa esos valores para calcular la pendiente correcta."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {/* VENTANA EMERGENTE: ACTIVIDAD COMPLETADA */}
      {resultado === "exito" && (
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
                  Calibraste las dos rampas de lanzamiento correctamente.
                  Sigue así y conquista la siguiente misión.
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
                      <strong className="res-stat-num-verde">2/2</strong>
                      <small>Rampas correctas</small>
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
                  onClick={() => navigate("/actividades-math-data")}
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
        </div>
      )}

      {/* VENTANA EMERGENTE: VUELVE A INTENTARLO */}
      {resultado === "fallo" && (
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
                  Revisa la tabla de cada rampa: observa cómo sube o baja la
                  recta, y usa esos valores para calcular la pendiente
                  correcta.
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
                      <strong>0/2</strong>
                      <small>Rampas correctas</small>
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
                <button
                  className="res-btn res-btn-outline"
                  onClick={() => setMostrarPistaBait(true)}
                >
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
        </div>
      )}
    </div>
  );
}