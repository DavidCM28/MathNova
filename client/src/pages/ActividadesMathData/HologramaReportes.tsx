import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo_MathNova.png";
import fondoHologramaImg from "../../assets/fondo-holograma.png";
import "./HologramaReportes.css";

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

/* ---- Nuevas para la Actividad 4 ---- */
import interferenciaHologramaImg from "../../assets/interferencia-holograma.png";
import iconoGraficaBarrasImg from "../../assets/icono-grafica-barras.png";
import iconoGraficaCircularImg from "../../assets/icono-grafica-circular.png";

/* ---- Audios: pendientes por agregar más adelante.
   Los botones de "Bait tiene un mensaje" y "Pista" ya están
   listos — cuando tengas los archivos .mp3, agrega el import
   correspondiente arriba y pásalo como prop audioSrc en cada
   <PistaBaitModal> de este archivo. Mientras tanto el modal
   funciona sin audio (solo con el video). ---- */

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
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type Modulo = "bosque" | "desierto" | "cueva";

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
const MODULO_BARRA_MAS_ALTA: Modulo = "bosque";
const MODULO_SECTOR_MAYOR: Modulo = "bosque";

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de las actividades anteriores, para que todas
   concuerden.
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

export default function HologramaReportes() {
  const navigate = useNavigate();

  const [tipoGrafica, setTipoGrafica] = useState<"barras" | "circular" | null>("barras");

  const [alturaBarras, setAlturaBarras] = useState<Record<Modulo, string>>({
    bosque: "",
    desierto: "",
    cueva: "",
  });
  const [barrasVerificadas, setBarrasVerificadas] = useState(false);

  const [porcentajes, setPorcentajes] = useState<Record<Modulo, string>>({
    bosque: "",
    desierto: "",
    cueva: "",
  });
  const [porcentajesVerificados, setPorcentajesVerificados] = useState(false);

  const [preguntaBarraAlta, setPreguntaBarraAlta] = useState<Modulo | null>(null);
  const [preguntaSectorMayor, setPreguntaSectorMayor] = useState<Modulo | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  const barraEstado = (modulo: Modulo): "correcto" | "pendiente" | "incorrecto" => {
    if (!barrasVerificadas) return "pendiente";
    return alturaBarras[modulo].trim() === String(FRECUENCIAS[modulo]) ? "correcto" : "incorrecto";
  };

  const porcentajeEstado = (modulo: Modulo): "correcto" | "pendiente" | "incorrecto" => {
    if (!porcentajesVerificados) return "pendiente";
    return porcentajes[modulo].trim() === String(PORCENTAJES_CORRECTOS[modulo])
      ? "correcto"
      : "incorrecto";
  };

  const verificarBarras = () => setBarrasVerificadas(true);
  const verificarCirculo = () => setPorcentajesVerificados(true);

  const activarHolograma = () => {
    const barrasOk = (Object.keys(FRECUENCIAS) as Modulo[]).every(
      (m) => alturaBarras[m].trim() === String(FRECUENCIAS[m])
    );
    const porcentajesOk = (Object.keys(PORCENTAJES_CORRECTOS) as Modulo[]).every(
      (m) => porcentajes[m].trim() === String(PORCENTAJES_CORRECTOS[m])
    );
    const preguntasOk =
      preguntaBarraAlta === MODULO_BARRA_MAS_ALTA && preguntaSectorMayor === MODULO_SECTOR_MAYOR;
    const tipoOk = tipoGrafica === "barras";

    setBarrasVerificadas(true);
    setPorcentajesVerificados(true);
    setResultado(tipoOk && barrasOk && porcentajesOk && preguntasOk ? "exito" : "fallo");
  };

  const handleReiniciarActividad = () => {
    setTipoGrafica("barras");
    setAlturaBarras({ bosque: "", desierto: "", cueva: "" });
    setBarrasVerificadas(false);
    setPorcentajes({ bosque: "", desierto: "", cueva: "" });
    setPorcentajesVerificados(false);
    setPreguntaBarraAlta(null);
    setPreguntaSectorMayor(null);
    setResultado(null);
  };

  const graficaMaxima = 5;

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
            <strong>¡Excelente trabajo, piloto!</strong>
            <p>
              Construiste las gráficas correctamente e interpretaste los
              datos para activar el holograma. Sigue así y conquista la
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
          contenido="¡Excelente trabajo, piloto! Construiste las gráficas correctamente e interpretaste los datos para activar el holograma. Sigue así y conquista la siguiente misión."
          videoSrc={baitHablandoVideo}
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
            <strong>¡No te rindas, piloto!</strong>
            <p>
              Revisa la altura de cada barra y el porcentaje de cada sector.
              Recuerda: porcentaje = votos ÷ total × 100.
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
          contenido="¡No te rindas, piloto! Revisa la altura de cada barra y el porcentaje de cada sector. Recuerda: porcentaje = votos ÷ total × 100."
          videoSrc={baitHablandoVideo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="La altura de cada barra es igual al número de votos. El porcentaje se calcula como votos entre total por cien. Bosque: 4 de 10 es 40%. Desierto: 3 de 10 es 30%. Cueva de Cristal: 3 de 10 es 30%."
          videoSrc={baitHablandoVideo}
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
                  ¡Hola, piloto! El Centro de Mando recibió los datos de la
                  encuesta. Primero elige qué gráfica quieres usar para
                  comparar cantidades exactas, después construye la gráfica
                  de barras, después la gráfica circular y al final responde
                  las preguntas para activar el holograma.
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
                  />
                  {barraEstado(m) === "correcto" && <FiCheckCircle className="hol-check-verde" />}
                </div>
              ))}
            </div>

            <button type="button" className="hol-verificar-btn" onClick={verificarBarras}>
              <FiBarChart2 /> Verificar gráfica
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
                    />
                    <span>%</span>
                    {porcentajeEstado(m) === "correcto" && (
                      <FiCheckCircle className="hol-check-verde" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="hol-verificar-btn" onClick={verificarCirculo}>
              <FiPercent /> Verificar porcentajes
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
              onClick={() => setMostrarPistaBait(true)}
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

          <button type="button" className="hol-activar-btn" onClick={activarHolograma}>
            <FiZap /> Activar Holograma
          </button>
        </div>
      </main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Hola, piloto! El Centro de Mando recibió los datos de la encuesta. Primero elige qué gráfica quieres usar para comparar cantidades exactas, después construye la gráfica de barras, después la gráfica circular y al final responde las preguntas para activar el holograma."
          videoSrc={baitHablandoVideo}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="La altura de cada barra es igual al número de votos. El porcentaje se calcula como votos entre total por cien. Bosque: 4 de 10 es 40%. Desierto: 3 de 10 es 30%. Cueva de Cristal: 3 de 10 es 30%."
          videoSrc={baitHablandoVideo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}