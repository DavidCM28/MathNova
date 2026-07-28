import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./GeneradorEnergiaInversa.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/banner-gen2-MathData.png";
import personajeAyuda from "../../assets/hola-MathData.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";
import villanoMundo from "../../assets/villano_mundo_actividad.png";

import iconoHexagonoPiensa from "../../assets/icono-hexagono-piensa.png";
import iconoHexagonoConsejo from "../../assets/icono-hexagono-consejo.png";
import iconoTipRapido from "../../assets/icono-tip-rapido.png";
import iconoIntentos from "../../assets/icono-intentos.png";
import iconoAyudaUsada from "../../assets/icono-ayuda-usada.png";
import villanoPista from "../../assets/villano-pista.png";

// ============================================
// TRANSMISIÓN DEL VILLANO (video + audio)
// Por ahora solo tenemos lista la animación/audio de INICIO.
// Cuando tengas listos los de éxito/fallo, agrega sus imports aquí
// siguiendo el mismo patrón.
// AJUSTA ESTOS 2 NOMBRES DE ARCHIVO A LOS TUYOS
// ============================================
import villanoHablandoVideo from "../../assets/villano-hablando.mp4";
import audioVillanoDesafio from "../../assets/villano-audio-desafio.mp3";
import villanoDerrotadoVideo from "../../assets/villano-derrotado.mp4";
import audioVillanoDerrotado from "../../assets/villano-audio-derrotado.mp3";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";
import pistaAudio from "../../assets/pista-audio.mp3";
import baitPistaImg from "../../assets/bait-pista.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiArrowLeft,
  FiRotateCcw,
  FiRotateCw,
  FiCheck,
  FiLock,
  FiHome,
  FiPieChart,
  FiPlay,
  FiPause,
  FiX,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { FaStar, FaShieldAlt, FaGem, FaLightbulb, FaHandPointUp, FaBroadcastTower } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { getSessionUser } from "../../utils/authSession";

// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================

const API_URL = "http://localhost:3001/api";

// ============================================
// DATOS INICIALES (NO MODIFICAR)
// ============================================

const filasIniciales = [
  { x: 1, y: "12", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 2, y: "6", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 3, y: "4", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 4, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
  { x: 6, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
  { x: 12, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
];

const puntosIniciales = [
  { x: 1, y: 12 },
  { x: 2, y: 6 },
  { x: 3, y: 4 },
];

const EJE_X_MAX = 12;
const EJE_Y_MAX = 14;

// ============================================
// COMPONENTE: PISTA DE BAIT (modal con video real)
// Mismo estilo visual y de comportamiento que las
// actividades 2 y 3 (Rampas de Lanzamiento / Encuesta).
// ============================================

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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function GeneradorEnergiaInversa() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // El ID del estudiante se obtiene de la sesión activa en cada render
  const usuarioSesion = getSessionUser();
  const ID_ESTUDIANTE = usuarioSesion?.id_usuario;

  const [filas, setFilas] = useState(filasIniciales);
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [puntosIncorrectos, setPuntosIncorrectos] = useState<{ x: number; y: number }[]>([]);
  const [puntosAsistidos, setPuntosAsistidos] = useState<{ x: number; y: number }[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);
  const [progresoPorcentaje, setProgresoPorcentaje] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<"exito" | "fallo" | "incompleto" | "pista" | null>(null);
  const [mostrarIntroVillano, setMostrarIntroVillano] = useState(false);
  const [mostrarVillanoDerrotado, setMostrarVillanoDerrotado] = useState(false);
  const [mostrarPistaModal, setMostrarPistaModal] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  // ---- Temporizador ----
  const tiempoInicioRef = useRef<number>(Date.now());
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  useEffect(() => {
    if (cargandoInicial || resultado !== null) return;

    const intervalo = setInterval(() => {
      setSegundosTranscurridos(Math.floor((Date.now() - tiempoInicioRef.current) / 1000));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cargandoInicial, resultado]);

  const formatearTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const response = await fetch(`${API_URL}/proporcionalidad/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;
          const celdasAsistidas = (progreso.celdas_asistidas || {}) as Record<string, boolean>;

          if (progreso.valores_tabla) {
            const nuevosValores = filasIniciales.map((fila) => {
              const valorGuardado = (progreso.valores_tabla as Record<string, number>)[String(fila.x)];
              if (valorGuardado !== undefined) {
                const esAsistida = !!celdasAsistidas[String(fila.x)];
                return {
                  ...fila,
                  y: String(valorGuardado),
                  correcto: esAsistida ? null : true,
                  bloqueada: true,
                  asistida: esAsistida,
                };
              }
              return fila;
            });
            setFilas(nuevosValores);

            const puntosAsistidosRestaurados = nuevosValores
              .filter((f) => f.asistida)
              .map((f) => ({ x: f.x, y: Number(f.y) }));
            if (puntosAsistidosRestaurados.length > 0) {
              setPuntosAsistidos(puntosAsistidosRestaurados);
            }
          }

          // ✅ CORREGIDO: "completada" ahora manda a éxito siempre (con o
          // sin ayuda); el color naranja ya indica que hubo asistencia,
          // no hace falta mandar a la pantalla de fallo por eso.
          if (progreso.completada) {
            setActividadCompletada(true);
            setXpGanado(progreso.xp_obtenido || 0);
            setResultado("exito");
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

  // ==========================================
  // GUARDAR PROGRESO EN EL BACKEND
  // ==========================================

  const guardarProgreso = async (pantalla: number) => {
    try {
      await fetch(`${API_URL}/proporcionalidad/guardar-progreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          pantalla_actual: pantalla,
        }),
      });
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    }
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
    try {
      await fetch(`${API_URL}/proporcionalidad/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
        }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setResultado(null);
    setActividadCompletada(false);
    setFilas(filasIniciales);
    setPuntos(puntosIniciales);
    setPuntosIncorrectos([]);
    setPuntosAsistidos([]);
    setMensajeFeedback("");
    setProgresoPorcentaje(0);
    setRespuesta("");
    setXpGanado(0);
    tiempoInicioRef.current = Date.now();
    setSegundosTranscurridos(0);
  };

  // ==========================================
  // VALIDAR TABLA CON BACKEND
  // ==========================================

  const actualizarFila = async (index: number, valor: string) => {
    setFilas((prev) =>
      prev.map((fila, i) => (i === index ? { ...fila, y: valor, correcto: null } : fila))
    );

    if (valor === "") return;

    const fila = filas[index];
    if (!fila) return;

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/proporcionalidad/validar-tabla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          reactores: fila.x,
          tiempo: Number(valor),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const resultado = data.data;

        setFilas((prev) =>
          prev.map((f, i) => {
            if (i !== index) return f;

            if (resultado.celda_completada && !resultado.correcto) {
              // Se agotaron los intentos: se revela la respuesta. Ya NO se
              // marca como "incorrecta" (rojo) — se marca "asistida"
              // (naranja fijo), porque quedó resuelta con ayuda.
              return {
                ...f,
                y: String(resultado.respuesta_correcta),
                correcto: null,
                bloqueada: true,
                asistida: true,
              };
            }

            return { ...f, correcto: resultado.correcto, asistida: false };
          })
        );

        if (resultado.correcto) {
          setMensajeFeedback(resultado.mensaje);
          await guardarProgreso(4);
          if (!puntos.some(p => p.x === fila.x)) {
            setPuntos((prev) => [...prev, { x: fila.x, y: Number(valor) }]);
          }
          // Ya no está mal: si tenía un punto rojo marcado, se quita
          setPuntosIncorrectos((prev) => prev.filter((p) => p.x !== fila.x));
        } else if (resultado.celda_completada && resultado.asistido) {
          // Revelada: punto naranja fijo (sin parpadeo), se quita el rojo
          setMensajeFeedback("");
          setPuntosIncorrectos((prev) => prev.filter((p) => p.x !== fila.x));
          setPuntosAsistidos((prev) => [
            ...prev.filter((p) => p.x !== fila.x),
            { x: fila.x, y: Number(resultado.respuesta_correcta) },
          ]);
          await guardarProgreso(4);
        } else {
          // Incorrecto (aún con intentos disponibles): sin mensaje de
          // texto, solo el punto rojo parpadeante en la gráfica
          setMensajeFeedback("");
          setPuntosIncorrectos((prev) => [
            ...prev.filter((p) => p.x !== fila.x),
            { x: fila.x, y: Number(valor) },
          ]);
        }

        const celdasCompletadas = filas.filter(f => f.correcto === true || f.bloqueada).length;
        const totalCeldas = filas.length;
        setProgresoPorcentaje(Math.round((celdasCompletadas / totalCeldas) * 100));
      }
    } catch (error) {
      console.error("Error al validar:", error);
      setMensajeFeedback("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // VALIDAR PREDICCIÓN CON BACKEND
  // ==========================================

  const tablaCompleta = filas.every((f) => !f.editable || f.correcto === true || f.bloqueada);

  const handleEnviarPrediccion = async () => {
    if (!tablaCompleta) {
      setMensajeFeedback("⚠️ Completa primero todas las casillas de la tabla antes de enviar tu predicción.");
      return;
    }

    if (respuesta.trim() === "") {
      setMensajeFeedback("⚠️ Escribe una respuesta antes de enviar.");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/proporcionalidad/prediccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          prediccion: Number(respuesta),
          tiempo_total: segundosTranscurridos,
        }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.success && data.data) {
        const resultado = data.data;
        setMensajeFeedback(resultado.mensaje);

        // ✅ CORREGIDO: "completada" (con o sin ayuda) siempre manda a
        // éxito. El color naranja en la tabla/gráfica ya deja claro que
        // hubo asistencia — no hace falta una pantalla de "fallo" para eso.
        if (resultado.correcto || resultado.completada) {
          setActividadCompletada(true);
          setXpGanado(resultado.correcto ? 100 : 100);
          setProgresoPorcentaje(100);
          await guardarProgreso(8);
          setResultado("exito");
        } else {
          // El mensaje ya se muestra con setMensajeFeedback arriba
        }
      } else if (data.success === false) {
        alert(`❌ ${data.mensaje || "Error al procesar la respuesta."}`);
      } else {
        alert("❌ Error al procesar la respuesta.");
      }
    } catch (error) {
      console.error("Error al enviar predicción:", error);
      setMensajeFeedback("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
      setRespuesta("");
    }
  };

  // ==========================================
  // VERIFICAR PUNTOS EN LA GRÁFICA
  // ==========================================

  const handleVerificarPuntos = () => {
    const puntosEsperados = [
      { x: 1, y: 12 },
      { x: 2, y: 6 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
      { x: 6, y: 2 },
      { x: 12, y: 1 },
    ];

    const todosLosPuntos = puntosEsperados.every(pEsperado =>
      puntos.some(p => p.x === pEsperado.x && p.y === pEsperado.y) ||
      puntosAsistidos.some(p => p.x === pEsperado.x && p.y === pEsperado.y)
    );

    if (todosLosPuntos) {
      setMensajeFeedback("✅ ¡Todos los puntos están correctos! Has completado la gráfica.");
      setProgresoPorcentaje(80);
      alert("🎉 ¡Gráfica completada correctamente!");
    } else {
      setMensajeFeedback("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
      alert("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
    }
  };

  // ==========================================
  // FUNCIONES EXISTENTES (NO MODIFICAR)
  // ==========================================

  const manejarClickGrafica = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = 1 - (e.clientY - rect.top) / rect.height;

    const x = Math.round(relX * EJE_X_MAX);
    const y = Math.round(relY * EJE_Y_MAX);

    if (x <= 0 || y <= 0) return;

    setPuntos((prev) => [...prev, { x, y }]);
  };

  const limpiarGrafica = () => setPuntos(puntosIniciales);

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  // ==========================================

  // ==========================================
  // PANTALLA: PISTA (AYUDA)
  // ==========================================

  if (resultado === "pista") return (
    <div className="pista-page">

      {/* DECORACIÓN DE FONDO */}
      <span className="pista-decor pista-decor-1"><FaGem /></span>
      <span className="pista-decor pista-decor-2"><FiPieChart /></span>
      <span className="pista-decor pista-decor-3"><FiBarChart2 /></span>
      <span className="pista-decor pista-decor-4"><GiRingedPlanet /></span>

      {/* HEADER */}
      <header className="pista-header">
        <img src={logo} alt="MathNova" className="pista-logo" />
        <button className="pista-inicio-btn" onClick={() => navigate("/")}>
          <FiHome />
          Inicio
        </button>
      </header>

      <div className="pista-body">

        {/* COLUMNA IZQUIERDA */}
        <div className="pista-left">

          {/* TÍTULO */}
          <div className="pista-titulo-row">
            <div className="pista-icono-titulo">
              <FaLightbulb />
            </div>
            <div>
              <h1 className="pista-titulo">¡Aquí tienes una pista!</h1>
              <p className="pista-subtitulo">
                Observa con atención esta ayuda para avanzar en la misión de{" "}
                <span className="pista-brand">MathData</span>.
              </p>
            </div>
          </div>

          {/* CARD PRINCIPAL */}
          <div className="pista-card-principal">
            <div className="pista-hexagono">
              <img src={iconoHexagonoPiensa} alt="" />
            </div>
            <div>
              <strong>¡Piensa paso a paso, explorador!</strong>
              <p>
                Recuerda identificar primero el patrón entre reactores y
                tiempo. En esta misión, si aumentan los reactores, el tiempo
                disminuye. Si te atoras, vuelve a intentarlo: cada pista te
                acerca cada vez más a la meta.
              </p>
            </div>
          </div>

          {/* SECCIÓN: PISTA PARA RESOLVER */}
          <div className="pista-seccion-header">
            <FaLightbulb />
            <span>Pista para resolver</span>
          </div>

          <div className="pista-consejo-row">
            <div className="pista-consejo-card">
              <div className="pista-hexagono pista-hexagono-sm">
                <img src={iconoHexagonoConsejo} alt="" />
              </div>
              <div>
                <strong>Consejo de Divide</strong>
                <p>
                  En esta misión, reactores x tiempo siempre debe dar el
                  mismo número. Observa los ejemplos: 1 × 12, 2 × 6 y 3 × 4.
                  Si buscas otro valor, piensa qué otro número multiplicado
                  por el tiempo te da 12.
                </p>
              </div>
            </div>

            <div className="pista-tip-card">
              <div className="pista-tip-icono">
                <img src={iconoTipRapido} alt="" />
              </div>
              <div>
                <strong>Tip rápido:</strong>
                <p>
                  Si el tiempo es 2 horas, busca qué número multiplicado por
                  2 da 12.
                </p>
              </div>
            </div>
          </div>

          {/* RESUMEN DE LA ACTIVIDAD */}
          <div className="pista-resumen-card">
            <div className="pista-resumen-header">
              <FiBarChart2 />
              <span>Resumen de la actividad</span>
            </div>
            <hr className="pista-divider" />
            <div className="pista-stats">

              <div className="pista-stat">
                <img src={iconoIntentos} alt="" className="pista-stat-img" />
                <strong>3</strong>
                <small>Intentos</small>
                <em>Sigue así</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoAciertos} alt="" className="pista-stat-img" />
                <strong className="pista-azul">1/3</strong>
                <small>Aciertos</small>
                <em>Puedes mejorar</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoTiempo} alt="" className="pista-stat-img" />
                <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                <small>Tiempo</small>
                <em>Sigue practicando</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoPrecision} alt="" className="pista-stat-img" />
                <strong className="pista-verde">33%</strong>
                <small>Precisión</small>
                <em>¡Buen uso!</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoAyudaUsada} alt="" className="pista-stat-img" />
                <strong>1 pista</strong>
                <small>Ayuda usada</small>
                <em>¡Buen uso!</em>
              </div>

            </div>
          </div>

          {/* PROGRESO EN EL TEMA */}
          <div className="pista-progreso-card">
            <img src={iconoProgreso} alt="" className="pista-progreso-img" />
            <div className="pista-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Relaciones y Proporciones</strong>
              <div className="pista-barra-track">
                <div className="pista-barra-fill" style={{ width: "60%" }}>
                  <span>60%</span>
                </div>
              </div>
              <small>
                ¡Vas avanzando! Esta pista te ayudará a acercarte a la
                respuesta correcta.
              </small>
            </div>
            <div className="pista-hito-box">
              <img src={estrellaMision} alt="" className="pista-hito-estrella" />
              <div>
                <small>Siguiente hito</small>
                <strong className="pista-hito-pct">80%</strong>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: VILLANO + ACCIONES */}
        <div className="pista-right">
          <img
            src={villanoPista}
            alt="Villano retador"
            className="pista-villano-img"
          />

          <div className="pista-acciones">
            <button
              type="button"
              className="pista-btn pista-btn-azul"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw /> Repetir actividad
            </button>
            <button
              type="button"
              className="pista-btn pista-btn-outline"
              onClick={() => setMostrarPistaModal(true)}
            >
              <FaLightbulb /> Ver Pista
            </button>
            <button
              type="button"
              className="pista-btn pista-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiArrowLeft /> Volver a actividades
            </button>
          </div>
        </div>

      </div>

      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA: ACTIVIDAD INCOMPLETA
  // ==========================================

  if (resultado === "incompleto") return (
    <div className="inc-page">

      {/* CONFETI */}
      <div className="inc-confetti" aria-hidden="true">
        {["#3b82f6","#f97316","#22c55e","#a855f7","#eab308","#ef4444","#06b6d4","#f43f5e"].map((c,i)=>(
          <span key={i} className="inc-dot" style={{
            background: c,
            width: `${10+i%4*3}px`,
            height: `${10+i%4*3}px`,
            top: `${5+i*7}%`,
            left: i < 4 ? `${4+i*8}%` : undefined,
            right: i >= 4 ? `${4+(i-4)*9}%` : undefined,
          }} />
        ))}
      </div>

      {/* HEADER */}
      <header className="inc-header">
        <img src={logo} alt="MathNova" className="inc-logo" />
        <button className="inc-inicio-btn" onClick={() => navigate("/")}>
          Inicio
        </button>
      </header>

      {/* CONTENEDOR COMPARTIDO PARA EL EFECTO DE CAPAS (villano detrás de la tarjeta) */}
      <div className="inc-content-wrap">

        {/* VILLANO + MUNDO (una sola ilustración, va detrás de la tarjeta resumen) */}
        <img src={villanoMundo} alt="Villano con el mundo" className="inc-villano-mundo" />

        {/* HERO */}
        <div className="inc-hero">

          {/* IZQUIERDA */}
          <div className="inc-hero-left">

            {/* TÍTULO */}
            <div className="inc-titulo-row">
              <div className="inc-icono-titulo">
                <FiBarChart2 />
              </div>
              <div>
                <h1 className="inc-titulo">Actividad incompleta</h1>
                <p className="inc-subtitulo">
                  Aún no has terminado con éxito la misión de{" "}
                  <span className="inc-brand">MathData</span>.
                </p>
              </div>
            </div>

            {/* MENSAJE NARANJA */}
            <div className="inc-mensaje">
              <div className="inc-icono-mensaje">
                <FiBarChart2 />
              </div>
              <div>
                <strong>¡Puedes retomarla cuando quieras!</strong>
                <p>
                  Te quedaste a mitad del reto. Regresa para continuar
                  practicando tablas, gráficas y análisis de datos.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="inc-bottom">

          {/* COLUMNA IZQUIERDA */}
          <div className="inc-bottom-left">

            {/* CARD RESUMEN */}
            <div className="inc-resumen-card">
            <div className="inc-resumen-header">
              <FiBarChart2 className="inc-resumen-icono" />
              <span>Resumen de la actividad</span>
            </div>
            <hr className="inc-divider" />
            <div className="inc-stats">

              <div className="inc-stat">
                <img src={iconoAciertos} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Aciertos</span>
                  <strong className="inc-stat-val inc-azul">2/3</strong>
                  <em>¡Buen trabajo!</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoTiempo} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Tiempo</span>
                  <strong className="inc-stat-val">02:11</strong>
                  <em>min</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoPrecision} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Precisión</span>
                  <strong className="inc-stat-val inc-azul">67%</strong>
                  <em>¡Buen avance!</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoRecompensa} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Recompensa</span>
                  <strong className="inc-stat-val inc-naranja">+20 pts</strong>
                  <em>Puntos ganados</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoInsignia} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Estado</span>
                  <strong className="inc-stat-val inc-morado">En progreso</strong>
                  <em>¡Sigue así!</em>
                </div>
              </div>

            </div>
          </div>

          {/* CARD PROGRESO */}
          <div className="inc-progreso-card">
            <img src={iconoProgreso} alt="" className="inc-progreso-img" />
            <div className="inc-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Encuestas y Frecuencias</strong>
              <div className="inc-barra-track">
                <div className="inc-barra-fill" style={{ width: "67%" }}>
                  <span>67%</span>
                </div>
              </div>
              <small>¡Buen avance! Retoma la actividad para seguir creciendo.</small>
            </div>
            <div className="inc-hito-box">
              <img src={estrellaMision} alt="" className="inc-hito-estrella" />
              <div>
                <small>Siguiente hito</small>
                <strong className="inc-hito-pct">60%</strong>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: botones */}
        <div className="inc-bottom-right">
          <button className="inc-btn inc-btn-azul" onClick={() => setResultado(null)}>
            <FiRefreshCw /> Continuar actividad
          </button>
          <button className="inc-btn inc-btn-outline" onClick={() => setMostrarPistaModal(true)}>
            <FaLightbulb /> Ver Pista
          </button>
          <button className="inc-btn inc-btn-outline" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver a actividades
          </button>
        </div>

      </div>

      </div>

      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA DE CARGA INICIAL (evita mostrar el
  // tablero antes de saber si ya estaba completada)
  // ==========================================

  if (cargandoInicial) {
    return (
      <div className="gen1-loading-screen">
        <img src={logo} alt="MathNova" className="gen1-loading-logo" />
        <p>Cargando actividad...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER (NO MODIFICAR ESTRUCTURA)
  // ==========================================

  return (
    <main className="gen1-page">
      {/* TRANSMISIÓN DEL VILLANO: aparece antes de comenzar el desafío */}
      {mostrarIntroVillano && (
        <PistaBaitModal
          tema="rojo"
          titulo="Transmisión interceptada"
          contenido="¡Ja! He bloqueado los reactores de tu base. Sin embargo, sin energía el escudo caerá antes del amanecer y la base quedará expuesta. Pero te haré un trato: si logras descubrir cuántos reactores necesitas para recargar el escudo a tiempo, quizás te deje intentarlo. ¿Crees que puedes con eso?"
          videoSrc={villanoHablandoVideo}
          audioSrc={audioVillanoDesafio}
          botonTexto="Aceptar el desafío ⚡"
          onClose={() => setMostrarIntroVillano(false)}
        />
      )}

      {mostrarVillanoDerrotado && (
        <PistaBaitModal
          tema="rojo"
          titulo="Transmisión interceptada"
          contenido="¡Imposible! Calculaste la constante... activaste el escudo... ¡Esto no ha terminado, agente!"
          videoSrc={villanoDerrotadoVideo}
          audioSrc={audioVillanoDerrotado}
          botonTexto="Cerrar transmisión"
          onClose={() => setMostrarVillanoDerrotado(false)}
        />
      )}

      {/* PISTA DE BAIT: aparece al presionar el botón de pista en "Predice y responde" */}
      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
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
                <strong>¡Excelente trabajo, explorador!</strong>
                <p>
                  Cada reto superado fortalece tus habilidades para analizar
                  datos. Sigue así y conquista la siguiente misión.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="gen1-villano-trigger res-modal-villano-trigger"
              onClick={() => setMostrarVillanoDerrotado(true)}
              aria-label="Abrir mensaje interceptado del villano derrotado"
            >
              <span className="gen1-villano-trigger-dot" />
              <FaBroadcastTower />
              Mensaje interceptado
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
                      <small>Aciertos</small>
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
                <strong>¡No te rindas, explorador!</strong>
                <p>
                  Los errores también enseñan. Revisa tus respuestas,
                  inténtalo de nuevo y sigue fortaleciendo tus habilidades
                  para analizar datos, tablas y frecuencias.
                </p>
              </div>
            </div>

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
                      <strong>1/3</strong>
                      <small>Aciertos</small>
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
                      <strong>33%</strong>
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
                  onClick={() => setMostrarPistaModal(true)}
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

      <button
        type="button"
        className={`gen1-hamburger-btn ${menuOpen ? "gen1-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="gen1-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`gen1-sidebar ${menuOpen ? "gen1-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="gen1-sidebar-logo" />

        <nav className="gen1-sidebar-menu">
          <button type="button" className="gen1-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item gen1-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="gen1-sidebar-bottom">
          <div className="gen1-character-box">
            <img src={personajeAyuda} alt="Explorador" />
            <div>
              <strong>¡Tú puedes!</strong>
              <p>La base cuenta contigo.</p>
            </div>
          </div>

          <div className="gen1-topic-progress">
            <strong>Progreso del tema</strong>
            <span>0/2 actividades</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
          </div>

          <div className="gen1-tiempo-box">
            <span>Tiempo transcurrido</span>
            <strong>{formatearTiempo(segundosTranscurridos)}</strong>
          </div>

          <div className="gen1-xp-box">
            <span>XP acumulados</span>
            <strong>
              {xpGanado || 120} XP <FaStar />
            </strong>
          </div>
        </div>

        <div className="gen1-sidebar-icons">
          <button type="button" onClick={() => irARuta("/ajustes")} aria-label="Ajustes">
            <FiSettings />
          </button>
          <button type="button" onClick={() => irARuta("/ayuda")} aria-label="Ayuda">
            <FiHelpCircle />
          </button>
          <button type="button" onClick={() => navigate("/login")} aria-label="Cerrar sesión">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* ===================== CONTENIDO ===================== */}
      <section className="gen1-content">
        <div className="gen1-topbar">
          <button
            type="button"
            className="gen1-back-btn"
            onClick={() => irARuta("/actividades-math-data")}
            aria-label="Volver al tema"
          >
            <FiArrowLeft />
            Volver al tema
          </button>

          <span className="gen1-step-pill">Actividad 1 de 2</span>

          <button type="button" className="gen1-help-circle" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </div>

        <div className="gen1-hero">
          <div className="gen1-hero-text">
            <h1>
              Generador de Energía Inversa⚡ <span></span>
            </h1>
            <p>
              La base MathNova necesita recargar su escudo de protección
              antes del amanecer. Activa el panel de control de los
              reactores y completa la tabla y la gráfica para descubrir el
              patrón de proporcionalidad inversa.
            </p>

            <button
              type="button"
              className="gen1-villano-trigger"
              onClick={() => setMostrarIntroVillano(true)}
              aria-label="Abrir mensaje interceptado del villano"
            >
              <span className="gen1-villano-trigger-dot" />
              <FaBroadcastTower />
              Mensaje interceptado
            </button>
          </div>

          <div className="gen1-hero-imagen-wrap">
            <img src={heroBanner} alt="" className="gen1-hero-bg" />
          </div>
        </div>

        {/* MENSAJE DE FEEDBACK */}
        {mensajeFeedback && (
          <div className={
            mensajeFeedback.includes("✅") || mensajeFeedback.includes("🎉")
              ? "gen1-feedback-success"
              : "gen1-feedback-error"
          }>
            {mensajeFeedback}
          </div>
        )}

        {/* MENSAJE DE ACTIVIDAD COMPLETADA */}
        {actividadCompletada && (
          <div className="gen1-completada-box">
            🎉 ¡Misión completada! Has ganado {xpGanado} XP.
          </div>
        )}

        <div className="gen1-board">
          {/* PASO 1: TABLA */}
          <section className="gen1-card gen1-card-table">
            <header className="gen1-card-header">
              <span className="gen1-step-number">1</span>
              <h2>Completa la tabla de valores.</h2>
            </header>
            <p className="gen1-card-subtext">
              Observa los datos iniciales y completa los espacios en blanco.
            </p>

            <table className="gen1-table">
              <thead>
                <tr>
                  <th className="gen1-th-blue">Reactores conectados (x)</th>
                  <th className="gen1-th-green">Tiempo de recarga (horas) (y)</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => (
                  <tr key={fila.x}>
                    <td>{fila.x}</td>
                    <td>
                      {fila.editable ? (
                        <input
                          className="gen1-table-input"
                          type="number"
                          value={fila.y}
                          placeholder=""
                          aria-label={`Tiempo para ${fila.x} reactores`}
                          onChange={(e) => actualizarFila(index, e.target.value)}
                          style={{
                            borderColor: fila.asistida ? "#fd7e14" : fila.correcto === true ? "#28a745" : fila.correcto === false ? "#dc3545" : undefined,
                            backgroundColor: fila.asistida ? "#fff3e0" : fila.correcto === true ? "#d4edda" : fila.correcto === false ? "#f8d7da" : undefined
                          }}
                          disabled={cargando || fila.correcto === true || fila.bloqueada || actividadCompletada}
                        />
                      ) : (
                        fila.y
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <header className="gen1-card-header gen1-card-header-spaced">
              <span className="gen1-step-number">2</span>
              <h2>Traza la gráfica en el plano cartesiano.</h2>
            </header>
            <p className="gen1-card-subtext">
              Marca los puntos de la tabla en la gráfica y une con una curva
              suave.
            </p>

            <div className="gen1-tip-box">
              <FaLightbulb />
              <span>
                Recuerda: Proporcionalidad inversa &rarr; y = k/x
              </span>
            </div>

            <div className="gen1-table-actions">
              <button type="button" className="gen1-btn-outline" onClick={limpiarGrafica}>
                <FiRotateCcw />
                Limpiar gráfica
              </button>
              <button type="button" className="gen1-btn-primary" onClick={handleVerificarPuntos}>
                <FiCheck />
                Verificar puntos
              </button>
            </div>
          </section>

          {/* GRAFICA */}
          <section className="gen1-card gen1-card-graph">
            <h3 className="gen1-graph-title">Tiempo de recarga (horas)</h3>

            <div className="gen1-graph-area" onClick={manejarClickGrafica}>
              <div className="gen1-graph-grid">
                {Array.from({ length: EJE_X_MAX }).map((_, i) => (
                  <i key={`v-${i}`} className="gen1-grid-line-v" />
                ))}
                {Array.from({ length: EJE_Y_MAX / 2 }).map((_, i) => (
                  <i key={`h-${i}`} className="gen1-grid-line-h" />
                ))}
              </div>

              {puntos.map((p, i) => (
                <span
                  key={i}
                  className="gen1-graph-point"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              {puntosIncorrectos.map((p, i) => (
                <span
                  key={`err-${i}`}
                  className="gen1-graph-point gen1-graph-point-error"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              {puntosAsistidos.map((p, i) => (
                <span
                  key={`asist-${i}`}
                  className="gen1-graph-point gen1-graph-point-asistido"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              <div className="gen1-graph-y-labels">
                {[14, 12, 10, 8, 6, 4, 2, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="gen1-graph-x-labels">
              {Array.from({ length: EJE_X_MAX + 1 }).map((_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
            <span className="gen1-graph-x-title">Reactores conectados</span>

            <div className="gen1-hint-bar">
              <FaHandPointUp />
              <p>
                Haz clic en la cuadrícula para colocar un punto. Puedes
                arrastrarlo para ajustarlo.
              </p>
            </div>
          </section>

          {/* PASO 3: PREDICCION */}
          <section className="gen1-card gen1-card-predict">
            <header className="gen1-card-header">
              <span className="gen1-step-number">3</span>
              <h2>Predice y responde.</h2>
            </header>

            <p className="gen1-card-subtext">
              Si el escudo debe recargarse en solo 2 horas, ¿cuántos
              reactores se necesitan?
            </p>

            <div className="gen1-answer-row">
              <input
                className="gen1-answer-input"
                type="number"
                placeholder="Escribe tu respuesta"
                aria-label="Respuesta de predicción"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                disabled={actividadCompletada}
              />
              <span>reactores</span>
            </div>

            <button
              type="button"
              className="gen1-pista-box"
              onClick={() => setMostrarPistaModal(true)}
            >
              <img src={baitPistaImg} alt="" className="gen1-pista-icono" />
              <div>
                <strong>Pista de Bait</strong>
                <p>Usa el patrón que encontraste en la tabla o en la gráfica.</p>
              </div>
            </button>

            <button
              type="button"
              className="gen1-btn-submit"
              disabled={respuesta.trim() === "" || actividadCompletada || cargando}
              onClick={handleEnviarPrediccion}
              aria-label="Enviar respuesta"
            >
              <FiLock />
              {cargando ? "Enviando..." : "Enviar respuesta"}
            </button>

            <div className="gen1-mission-box">
              <div>
                <strong>Tu misión</strong>
                <p>
                  Completa la tabla, traza la gráfica y predice cuántos
                  reactores se necesitan para recargar el escudo en 2 horas.
                </p>
              </div>
              <FaShieldAlt className="gen1-mission-icon" />
            </div>
          </section>
        </div>

        <footer className="gen1-bottom-bar">
          <div className="gen1-bottom-progress">
            <span>Progreso de la actividad</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
            <strong>{progresoPorcentaje}%</strong>
          </div>

          <div className="gen1-bottom-reward">
            <span>Recompensa por completar</span>
            <strong>
              <FaStar /> +60 XP
            </strong>
            <strong>
              <FaGem /> +1
            </strong>
            <strong>
              <FaShieldAlt /> +1
            </strong>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default GeneradorEnergiaInversa;