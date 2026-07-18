import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessionUser,
  hasAuthSession,
  isGuestSession,
} from "../../utils/authSession";

import "./Actividad4MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad4/banner_act4_MathGeometry.png";
import reto1 from "../../assets/mathGeometry/actividad4/reto1_act4_MathGeometry.png";
import reto2 from "../../assets/mathGeometry/actividad4/reto2_act4_MathGeometry.png";
import reto3 from "../../assets/mathGeometry/actividad4/reto3_act4_MathGeometry.png";
import reto4 from "../../assets/mathGeometry/actividad4/reto4_act4_MathGeometry.png";
import reto5 from "../../assets/mathGeometry/actividad4/reto5_act4_MathGeometry.png";
import reto6 from "../../assets/mathGeometry/actividad4/reto6_act4_MathGeometry.png";

import byteImagen from "../../assets/mathGeometry/actividad4/byte-act4-mathgeometry.png";
import profesorConsejoImagen from "../../assets/mathGeometry/actividad4/profesor_dando_consejo_actividad_4.png";
import sombraErrorImagen from "../../assets/mathGeometry/actividad4/sombra-error_act4.png";
import bannerCompletado from "../../assets/mathGeometry/actividad4/actividad_completada_4_banner_MathGeometry.png";

import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClock,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSettings,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type OpcionId = "A" | "B" | "C" | "D";
type EstadoRevision = "pendiente" | "correcto" | "incorrecto";
type ModalId = "profesor" | "byte" | "sombra" | "completado" | null;

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

type Reto = {
  id: number;
  imagen: string;
  pregunta: string;
  opciones: Array<{ id: OpcionId; texto: string }>;
  correcta: OpcionId;
};

import videoNova from "../../assets/mathGeometry/actividad4/nova_explicando_act_4_MathGeometry.mp4";
import videoProfesor from "../../assets/mathGeometry/actividad4/instrucciones_profe_astro_act_4_MathGeometry.mp4";
import videoByte from "../../assets/mathGeometry/actividad4/byte_aciertos_y_pistas_act_4_MathGeometry.mp4";
import videoSombra from "../../assets/mathGeometry/actividad4/act_4_sombra_error_MathGeometry_.mp4";

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    pregunta: "Selecciona los ángulos que están frente a frente.",
    opciones: [
      { id: "A", texto: "A y C" },
      { id: "B", texto: "A y B" },
      { id: "C", texto: "B y C" },
      { id: "D", texto: "A y D" },
    ],
    correcta: "A",
  },
  {
    id: 2,
    imagen: reto2,
    pregunta: "Selecciona los ángulos que forman una línea recta.",
    opciones: [
      { id: "A", texto: "A y C" },
      { id: "B", texto: "A y B" },
      { id: "C", texto: "B y D" },
      { id: "D", texto: "C y D" },
    ],
    correcta: "B",
  },
  {
    id: 3,
    imagen: reto3,
    pregunta: "¿Cuál es el ángulo opuesto al ángulo A?",
    opciones: [
      { id: "A", texto: "Ángulo B" },
      { id: "B", texto: "Ángulo C" },
      { id: "C", texto: "Ángulo D" },
      { id: "D", texto: "Ángulo A" },
    ],
    correcta: "B",
  },
  {
    id: 4,
    imagen: reto4,
    pregunta: "¿Qué par de ángulos forma una línea recta?",
    opciones: [
      { id: "A", texto: "A y C" },
      { id: "B", texto: "A y B" },
      { id: "C", texto: "B y D" },
      { id: "D", texto: "C y D" },
    ],
    correcta: "B",
  },
  {
    id: 5,
    imagen: reto5,
    pregunta:
      "Nueva posición de las líneas. Selecciona los ángulos que están frente a frente.",
    opciones: [
      { id: "A", texto: "A y C" },
      { id: "B", texto: "A y B" },
      { id: "C", texto: "B y C" },
      { id: "D", texto: "A y D" },
    ],
    correcta: "A",
  },
  {
    id: 6,
    imagen: reto6,
    pregunta:
      "Nueva posición de las líneas. Selecciona el par de ángulos que forma una línea recta.",
    opciones: [
      { id: "A", texto: "A y C" },
      { id: "B", texto: "A y B" },
      { id: "C", texto: "B y D" },
      { id: "D", texto: "C y D" },
    ],
    correcta: "B",
  },
];

const TEXTO_PENDIENTE = "";

function limpiarFondoBlancoDeBordes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const visitado = new Uint8Array(total);
  const pila: number[] = [];

  const esFondoClaro = (index: number) => {
    const pixel = index * 4;
    const r = data[pixel];
    const g = data[pixel + 1];
    const b = data[pixel + 2];

    const esClaro = r > 218 && g > 218 && b > 218;
    const casiSinColor =
      Math.abs(r - g) < 38 && Math.abs(r - b) < 38 && Math.abs(g - b) < 38;

    return esClaro && casiSinColor;
  };

  const agregar = (index: number) => {
    if (
      index < 0 ||
      index >= total ||
      visitado[index] ||
      !esFondoClaro(index)
    ) {
      return;
    }

    visitado[index] = 1;
    pila.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    agregar(x);
    agregar((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    agregar(y * width);
    agregar(y * width + width - 1);
  }

  while (pila.length > 0) {
    const index = pila.pop();
    if (index === undefined) continue;

    data[index * 4 + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) agregar(index - 1);
    if (x < width - 1) agregar(index + 1);
    if (y > 0) agregar(index - width);
    if (y < height - 1) agregar(index + width);
  }

  ctx.putImageData(imageData, 0, 0);
}

function dibujarVideoSinEstirar(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  const videoWidth = video.videoWidth || width;
  const videoHeight = video.videoHeight || height;
  const escala = Math.min(width / videoWidth, height / videoHeight);
  const drawWidth = videoWidth * escala;
  const drawHeight = videoHeight * escala;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
}

type VideoCanvasProps = {
  src: string;
  className?: string;
  canvasClassName?: string;
  width?: number;
  height?: number;
  playing?: boolean;
  restartSignal?: number;
  onEnded?: () => void;
  label: string;
};

function VideoCanvasTransparente({
  src,
  className = "",
  canvasClassName = "",
  width = 360,
  height = 640,
  playing = true,
  restartSignal = 0,
  onEnded,
  label,
}: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoListo, setVideoListo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let frame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, width, height);
        dibujarVideoSinEstirar(ctx, video, width, height);
        limpiarFondoBlancoDeBordes(ctx, width, height);
        ultimoDibujo = tiempo;
      }

      frame = window.requestAnimationFrame(dibujar);
    };

    const primerFrame = () => {
      if (video.readyState < 2) return;
      setVideoListo(true);
      setVideoError(false);
      ctx.clearRect(0, 0, width, height);
      dibujarVideoSinEstirar(ctx, video, width, height);
      limpiarFondoBlancoDeBordes(ctx, width, height);

      if (playing) {
        void video.play().catch(() => undefined);
      }
    };

    const manejarError = () => {
      setVideoError(true);
      setVideoListo(false);
    };

    video.addEventListener("loadeddata", primerFrame);
    video.addEventListener("canplay", primerFrame);
    video.addEventListener("error", manejarError);
    frame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", primerFrame);
      video.removeEventListener("canplay", primerFrame);
      video.removeEventListener("error", manejarError);
      window.cancelAnimationFrame(frame);
    };
  }, [height, src, width]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = false;
    video.playsInline = true;

    if (playing) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [playing, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    if (playing) {
      void video.play().catch(() => undefined);
    }
  }, [restartSignal]);

  return (
    <div className={`act4geo-transparent-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="act4geo-source-video"
        muted
        playsInline
        aria-label={label}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className={`${canvasClassName} ${videoListo ? "act4geo-canvas-visible" : ""}`}
        aria-label={label}
      />

      {!videoListo && !videoError && (
        <div className="act4geo-video-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {videoError && (
        <div className="act4geo-video-error">
          No se pudo cargar la animación.
        </div>
      )}
    </div>
  );
}

function Actividad4MathGeometry() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [retoActual, setRetoActual] = useState(0);
  const [seleccion, setSeleccion] = useState<OpcionId | null>(null);
  const [revision, setRevision] = useState<EstadoRevision>("pendiente");
  const [intentos, setIntentos] = useState(0);
  const [completados, setCompletados] = useState(0);
  const [modal, setModal] = useState<ModalId>(null);
  const [pausado, setPausado] = useState(false);
  const [segundos, setSegundos] = useState(0);

  /* La animación de Nova solo se reproduce al presionar Play. */
  const [novaReproduciendo, setNovaReproduciendo] = useState(false);
  const [reinicioNova, setReinicioNova] = useState(0);

  /* Animaciones de los modales: detenidas hasta presionar Play. */
  const [modalReproduciendo, setModalReproduciendo] = useState(false);
  const [reinicioModal, setReinicioModal] = useState(0);

  /* Animación de Nova en misión completada. */
  const [completadoReproduciendo, setCompletadoReproduciendo] = useState(false);
  const [reinicioCompletado, setReinicioCompletado] = useState(0);

  const reto = RETOS[retoActual];
  const progreso = Math.round((completados / RETOS.length) * 100);

  const tiempo = useMemo(() => {
    const minutos = Math.floor(segundos / 60)
      .toString()
      .padStart(2, "0");
    const segundosRestantes = (segundos % 60).toString().padStart(2, "0");
    return `${minutos}:${segundosRestantes}`;
  }, [segundos]);

  useEffect(() => {
    if (pausado || modal !== null) return;

    const timer = window.setInterval(() => {
      setSegundos((valor) => valor + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [pausado, modal]);

  useEffect(() => {
    if (pausado || modal !== null) {
      setNovaReproduciendo(false);
    }
  }, [pausado, modal]);

  useEffect(() => {
    setModalReproduciendo(false);

    if (modal !== "completado") {
      setCompletadoReproduciendo(false);
    }
  }, [modal]);

  useEffect(() => {
    const bloquear = menuOpen || modal !== null;
    document.body.style.overflow = bloquear ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, modal]);

  const obtenerDashboardPrincipal = () => {
    if (isGuestSession() && !hasAuthSession()) return "/dashboard";

    const usuario = getSessionUser() as SessionUser | null;
    const rol = String(
      usuario?.rol || usuario?.role || usuario?.tipo_usuario || "",
    )
      .toLowerCase()
      .trim();

    const roleId = Number(
      usuario?.role_id || usuario?.roleId || usuario?.id_rol || 0,
    );

    if (rol === "admin" || rol === "administrador" || roleId === 3) {
      return "/dashboard-admin";
    }

    if (
      [
        "docente",
        "profesor",
        "maestro",
        "docente_estudiante",
        "docente-estudiante",
        "docente_alumno",
        "docente-alumno",
        "maestro_estudiante",
        "maestro-estudiante",
        "mixto",
      ].includes(rol) ||
      roleId === 1 ||
      roleId === 4
    ) {
      return "/dashboard-docente";
    }

    return "/dashboard";
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    setModal(null);
    navigate(ruta);
  };

  const seleccionarOpcion = (opcion: OpcionId) => {
    if (revision === "correcto" || pausado) return;
    setSeleccion(opcion);
    setRevision("pendiente");
  };

  const comprobar = () => {
    if (!seleccion || pausado) return;

    setIntentos((valor) => valor + 1);

    if (seleccion === reto.correcta) {
      setRevision("correcto");
      return;
    }

    setRevision("incorrecto");
    setModal("sombra");
  };

  const siguiente = () => {
    if (revision !== "correcto") return;

    const nuevosCompletados = Math.max(completados, retoActual + 1);
    setCompletados(nuevosCompletados);

    if (retoActual === RETOS.length - 1) {
      setCompletados(RETOS.length);
      setModal("completado");
      return;
    }

    setRetoActual((valor) => valor + 1);
    setSeleccion(null);
    setRevision("pendiente");
  };

  const reiniciar = () => {
    setRetoActual(0);
    setSeleccion(null);
    setRevision("pendiente");
    setIntentos(0);
    setCompletados(0);
    setSegundos(0);
    setModal(null);
    setPausado(false);
    setNovaReproduciendo(false);
    setReinicioNova((valor) => valor + 1);
    setModalReproduciendo(false);
    setReinicioModal((valor) => valor + 1);
    setCompletadoReproduciendo(false);
    setReinicioCompletado((valor) => valor + 1);
  };

  const videoModal =
    modal === "profesor"
      ? videoProfesor
      : modal === "byte"
        ? videoByte
        : videoSombra;

  const tituloModal =
    modal === "profesor"
      ? "Consejo del Profesor Astro"
      : modal === "byte"
        ? "Pista de Byte"
        : "Mensaje de Sombra";

  return (
    <main className="act4geo-page">
      <button
        type="button"
        className={`act4geo-hamburger-btn ${
          menuOpen ? "act4geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((valor) => !valor)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="act4geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`act4geo-sidebar ${menuOpen ? "act4geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act4geo-sidebar-logo" />

        <nav className="act4geo-sidebar-menu">
          <button
            type="button"
            className="act4geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act4geo-menu-item act4geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act4geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act4geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act4geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act4geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="act4geo-sidebar-progress-area">
          <article className="act4geo-side-week-card">
            <div className="act4geo-side-week-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="act4geo-side-progress">
              <span>★</span>
              <div>
                <b style={{ width: "60%" }} />
              </div>
              <strong>60%</strong>
            </div>
          </article>
        </div>
      </aside>

      <section className="act4geo-content">
        <img src={heroBanner} alt="Banner Actividad 4" className="act4geo-bg" />

        <section className="act4geo-main">
          <div className="act4geo-breadcrumb">
            <button type="button" onClick={() => irARuta("/seleccion-mundos")}>
              Mundos
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              Actividades MathGeometry
            </button>

            <span>›</span>

            <button type="button" className="act4geo-breadcrumb-current">
              Act 4
            </button>
          </div>

          <header className="act4geo-topbar">
            <div className="act4geo-title-area">
              <h1>Actividad 4: Cruce de Láseres</h1>
              <p className="act4geo-subtitle">
                Observa el cruce de los láseres y selecciona la respuesta
                correcta.
              </p>

              <div className="act4geo-pills">
                <span>▣ Introducción</span>
                <span>
                  <FiClock /> 8–12 min
                </span>
                <span>
                  <FiRotateCcw /> 3 intentos
                </span>
              </div>
            </div>

            <div className="act4geo-actions-top">
              <button
                type="button"
                onClick={() => setPausado((valor) => !valor)}
              >
                {pausado ? <FiPlay /> : <FiPause />}
                {pausado ? "Continuar" : "Pausar"}
              </button>

              <button
                type="button"
                onClick={() => irARuta("/actividades/geometria")}
              >
                <FiLogOut />
                Salir
              </button>
            </div>
          </header>

          <section
            className={`act4geo-intro-row ${
              novaReproduciendo && !pausado ? "act4geo-intro-playing" : ""
            }`}
          >
            <div className="act4geo-nova-stage">
              <VideoCanvasTransparente
                src={videoNova}
                className="act4geo-nova-transparent-wrap"
                canvasClassName="act4geo-nova-canvas"
                width={360}
                height={640}
                playing={novaReproduciendo && !pausado && modal === null}
                restartSignal={reinicioNova}
                onEnded={() => setNovaReproduciendo(false)}
                label="Nova explicando la actividad"
              />
            </div>

            <div className="act4geo-speech-cloud">
              <div className="act4geo-speech-main">
                <span className="act4geo-cloud-label">
                  Introducción de Nova
                </span>
                <p>{TEXTO_PENDIENTE}</p>
              </div>

              <div className="act4geo-nova-mini-controls">
                <button
                  type="button"
                  className="act4geo-nova-control-btn act4geo-nova-control-play"
                  onClick={() => setNovaReproduciendo(true)}
                  disabled={pausado || modal !== null}
                  title="Reproducir animación de Nova"
                  aria-label="Reproducir animación de Nova"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act4geo-nova-control-btn"
                  onClick={() => setNovaReproduciendo(false)}
                  disabled={!novaReproduciendo}
                  title="Pausar animación de Nova"
                  aria-label="Pausar animación de Nova"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act4geo-nova-control-btn act4geo-nova-control-repeat"
                  onClick={() => {
                    setReinicioNova((valor) => valor + 1);
                    setNovaReproduciendo(true);
                  }}
                  disabled={pausado || modal !== null}
                  title="Reiniciar animación de Nova"
                  aria-label="Reiniciar animación de Nova"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </div>
          </section>

          <div className="act4geo-layout">
            <section className="act4geo-game-card">
              <div className="act4geo-challenge-head">
                <span>
                  <FiFlag /> Reto {retoActual + 1} de {RETOS.length}
                </span>
              </div>

              <div className="act4geo-laser-frame">
                <img
                  src={reto.imagen}
                  alt={`Reto ${reto.id}: cruce de láseres`}
                />

                {pausado && (
                  <div className="act4geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                  </div>
                )}
              </div>

              <h2>{reto.pregunta}</h2>

              <div className="act4geo-options">
                {reto.opciones.map((opcion, index) => {
                  const seleccionada = seleccion === opcion.id;
                  const correcta =
                    revision === "correcto" && opcion.id === reto.correcta;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={[
                        "act4geo-option",
                        `act4geo-option-color-${index + 1}`,
                        seleccionada ? "act4geo-option-selected" : "",
                        correcta ? "act4geo-option-correct" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => seleccionarOpcion(opcion.id)}
                    >
                      <span>{opcion.id}</span>
                      <strong>{opcion.texto}</strong>
                      {correcta && <FiCheck />}
                    </button>
                  );
                })}
              </div>

              <div className="act4geo-game-actions">
                <button
                  type="button"
                  className="act4geo-instructions-btn"
                  onClick={() => setModal("profesor")}
                >
                  <FiVolume2 />
                  Instrucciones
                </button>

                <button
                  type="button"
                  className="act4geo-check-btn"
                  onClick={comprobar}
                  disabled={!seleccion || revision === "correcto" || pausado}
                >
                  <FiCheck />
                  Comprobar
                </button>

                <button
                  type="button"
                  className="act4geo-next-btn"
                  onClick={siguiente}
                  disabled={revision !== "correcto"}
                >
                  Siguiente
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <aside className="act4geo-right-panel">
              <button
                type="button"
                className="act4geo-guide-card act4geo-profe-card"
                onClick={() => setModal("profesor")}
              >
                <img
                  src={profesorConsejoImagen}
                  alt="Profesor Astro dando un consejo"
                  className="act4geo-guide-static-image"
                />
                <div>
                  <h3>💡 Consejo del Profesor Astro</h3>
                  <p>
                    Los ángulos que están frente a frente se llaman opuestos por
                    el vértice.
                  </p>
                </div>
              </button>

              <article className="act4geo-guide-card act4geo-sombra-card act4geo-sombra-static-card">
                <img
                  src={sombraErrorImagen}
                  alt="Sombra dando un aviso"
                  className="act4geo-guide-static-image"
                />
                <div>
                  <h3>✦ ¡Aviso de Sombra!</h3>
                  <p>
                    No te confundas: los ángulos juntos no siempre están frente
                    a frente.
                  </p>
                </div>
              </article>

              <button
                type="button"
                className="act4geo-guide-card act4geo-byte-card"
                onClick={() => setModal("byte")}
              >
                <img
                  src={byteImagen}
                  alt="Byte"
                  className="act4geo-guide-static-image"
                />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>Abre una pista visual para el reto actual.</p>
                </div>
              </button>

              <article className="act4geo-mission-card">
                <h3>◎ Tu misión</h3>
                <p>
                  Observa bien la figura y elige la respuesta correcta para
                  avanzar.
                </p>
              </article>

              <article className="act4geo-progress-card">
                <strong>Progreso de la actividad</strong>
                <div>
                  <b style={{ width: `${progreso}%` }} />
                </div>
                <span>
                  {progreso}% ({completados}/{RETOS.length})
                </span>
              </article>
            </aside>
          </div>

          <section className="act4geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Retos completados</span>
                <strong>
                  {completados}/{RETOS.length}
                </strong>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <span>Intentos</span>
                <strong>{intentos}/3</strong>
              </div>
            </article>

            <article>
              <FiClock />
              <div>
                <span>Tiempo</span>
                <strong>{tiempo}</strong>
              </div>
            </article>

            <article className="act4geo-xp-card">
              <span className="act4geo-star">★</span>
              <div>
                <span>XP</span>
                <strong>{completados * 40}</strong>
              </div>
            </article>
          </section>
        </section>

        <footer className="act4geo-footer">
          <div className="act4geo-footer-icons">
            <button type="button" onClick={() => navigate("/login")}>
              <FiLogOut />
            </button>
            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>

      {modal && modal !== "completado" && (
        <div
          className="act4geo-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="act4geo-character-modal"
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
          >
            <button
              type="button"
              className="act4geo-modal-close"
              onClick={() => setModal(null)}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act4geo-modal-character">
              <VideoCanvasTransparente
                src={videoModal}
                className="act4geo-modal-video-wrap"
                canvasClassName="act4geo-modal-canvas"
                width={360}
                height={640}
                playing={modalReproduciendo}
                restartSignal={reinicioModal}
                onEnded={() => setModalReproduciendo(false)}
                label={tituloModal}
              />
            </div>

            <div className="act4geo-modal-content">
              <span className="act4geo-modal-badge">
                <FiVolume2 />
                {modal === "profesor"
                  ? "Profesor Astro"
                  : modal === "byte"
                    ? "Byte"
                    : "Sombra"}
              </span>

              <h2>{tituloModal}</h2>

              <div className="act4geo-modal-cloud">
                <p>{TEXTO_PENDIENTE}</p>
              </div>

              <div className="act4geo-modal-controls">
                <button
                  type="button"
                  className="act4geo-modal-play"
                  onClick={() => setModalReproduciendo(true)}
                >
                  <FiPlay /> Reproducir
                </button>

                <button
                  type="button"
                  onClick={() => setModalReproduciendo(false)}
                  disabled={!modalReproduciendo}
                >
                  <FiPause /> Pausar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReinicioModal((valor) => valor + 1);
                    setModalReproduciendo(true);
                  }}
                >
                  <FiRotateCcw /> Reiniciar
                </button>
              </div>
            </div>

            <aside className="act4geo-modal-script-panel">
              <h3>
                {modal === "byte"
                  ? "Texto de la pista"
                  : modal === "profesor"
                    ? "Texto del profesor"
                    : "Texto de Sombra"}
              </h3>
              <div className="act4geo-modal-script-empty" />
            </aside>
          </section>
        </div>
      )}

      {modal === "completado" && (
        <div className="act4geo-modal-overlay">
          <section
            className="act4geo-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Actividad completada"
          >
            <button
              type="button"
              className="act4geo-modal-close"
              onClick={() => setModal(null)}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act4geo-complete-hero">
              <img
                src={bannerCompletado}
                alt=""
                className="act4geo-complete-decoration"
                aria-hidden="true"
              />

              <VideoCanvasTransparente
                src={videoNova}
                className="act4geo-complete-video-wrap"
                canvasClassName="act4geo-complete-nova-canvas"
                width={360}
                height={640}
                playing={completadoReproduciendo}
                restartSignal={reinicioCompletado}
                onEnded={() => setCompletadoReproduciendo(false)}
                label="Nova celebrando la actividad completada"
              />
            </div>

            <div className="act4geo-complete-content">
              <span>🏆 Actividad completada</span>
              <h2>¡Misión completada!</h2>

              <div className="act4geo-complete-cloud">
                <p>{TEXTO_PENDIENTE}</p>
              </div>

              <div className="act4geo-complete-controls">
                <button
                  type="button"
                  className="act4geo-complete-play"
                  onClick={() => setCompletadoReproduciendo(true)}
                >
                  <FiPlay /> Reproducir
                </button>

                <button
                  type="button"
                  onClick={() => setCompletadoReproduciendo(false)}
                  disabled={!completadoReproduciendo}
                >
                  <FiPause /> Pausar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReinicioCompletado((valor) => valor + 1);
                    setCompletadoReproduciendo(true);
                  }}
                >
                  <FiRotateCcw /> Reiniciar
                </button>
              </div>

              <div className="act4geo-complete-summary">
                <article>
                  <FiCheck />
                  <span>Aciertos</span>
                  <strong>6/6</strong>
                </article>
                <article>
                  <FiTarget />
                  <span>Precisión</span>
                  <strong>100%</strong>
                </article>
                <article>
                  <span className="act4geo-summary-star">★</span>
                  <span>Recompensa</span>
                  <strong>+240 XP</strong>
                </article>
              </div>

              <div className="act4geo-complete-actions">
                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria")}
                >
                  <FiArrowRight />
                  Siguiente actividad
                </button>

                <button type="button" onClick={reiniciar}>
                  <FiRotateCcw />
                  Repetir actividad
                </button>

                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria")}
                >
                  <FiLogOut />
                  Volver a actividades
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Actividad4MathGeometry;
