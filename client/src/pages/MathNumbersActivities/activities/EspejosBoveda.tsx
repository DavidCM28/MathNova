import "./EspejosBoveda.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSave,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import espejosAnimado from "../../../assets/mathnumbers/09-espejos/espejos.webp";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";
import audioConsejoSumaEspejos from "../../../assets/mathnumbers/09-espejos/consejo_suma_espejos.mp3";
import audioPistaByteEspejos from "../../../assets/mathnumbers/09-espejos/pista_byte_espejos.mp3";
import videoByteHablandoEspejos from "../../../assets/mathnumbers/09-espejos/byte_hablando_espejos.mp4";
import audioIntroEspejos from "../../../assets/mathnumbers/09-espejos/intro_espejos.mp3";
import comandanteSumaHablando from "../../../assets/mathnumbers/09-espejos/comandante_suma_hablando.webp";
import comandanteSumaIdle from "../../../assets/mathnumbers/09-espejos/comandante_suma_idle.png";

import { clearAuthSession } from "../../../utils/authSession";
import { guardarProgresoActividad } from "../../../services/progresoService";

import { activityListRoute } from "../constants";
import { ResultModal } from "../components/ResultModal";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import type { ResultKind } from "../types";

import {
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

type AudioStatus = "idle" | "playing" | "paused" | "ended";
type QuestionKey = "q1" | "q2";
type AnswerValue = "a" | "b";

const correctAnswers: Record<QuestionKey, AnswerValue> = {
  q1: "a",
  q2: "b",
};

const espejosRoute =
  "/actividades/mathnumbers/espejos-boveda";

const puentePrioridadesRoute =
  "/actividades/mathnumbers/puente-prioridades";

const INTRO_AUDIO_SRC = audioIntroEspejos;
const GUIDE_AUDIO_SRC = audioConsejoSumaEspejos;

const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la introducción del Comandante Suma.";

const INTRO_FULL_TEXT =
  "La luz de la bóveda se refleja en múltiples direcciones creando expresiones idénticas pero disfrazadas.";

const GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo del Comandante Suma.";

const GUIDE_FULL_TEXT =
  "Simplifica primero cada lado del espejo por separado antes de asegurar que son exactamente iguales.";

const HINT_AUDIO_SRC = audioPistaByteEspejos;

const BYTE_HINT_FULL_TEXT =
  "Las propiedades de las operaciones, como cambiar el orden de los factores o agruparlos distinto, no alteran el resultado final.";

function limpiarFondoByteEspejos(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const visitado = new Uint8Array(total);
  const pila: number[] = [];

  const esFondoRemovible = (index: number) => {
    const pixel = index * 4;
    const r = data[pixel];
    const g = data[pixel + 1];
    const b = data[pixel + 2];

    const esClaro = r > 224 && g > 224 && b > 224;
    const casiSinColor =
      Math.abs(r - g) < 34 &&
      Math.abs(r - b) < 34 &&
      Math.abs(g - b) < 34;

    const esMagenta =
      r > 175 &&
      b > 175 &&
      g < 135 &&
      Math.abs(r - b) < 90;

    return (esClaro && casiSinColor) || esMagenta;
  };

  const agregar = (index: number) => {
    if (index < 0 || index >= total) return;
    if (visitado[index]) return;
    if (!esFondoRemovible(index)) return;

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

    const pixel = index * 4;
    data[pixel + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) agregar(index - 1);
    if (x < width - 1) agregar(index + 1);
    if (y > 0) agregar(index - width);
    if (y < height - 1) agregar(index + width);
  }

  ctx.putImageData(imageData, 0, 0);
}

function dibujarVideoByteEspejos(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  const videoWidth = video.videoWidth || width;
  const videoHeight = video.videoHeight || height;
  const escala = Math.min(
    width / videoWidth,
    height / videoHeight,
  );

  const drawWidth = videoWidth * escala;
  const drawHeight = videoHeight * escala;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  ctx.drawImage(
    video,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight,
  );
}

function ByteEspejosMedia({
  active,
}: {
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) {
      return;
    }

    const canvasWidth = 960;
    const canvasHeight = 540;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let lastDraw = 0;

    const drawFrame = () => {
      if (video.readyState < 2) {
        return;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      dibujarVideoByteEspejos(
        ctx,
        video,
        canvasWidth,
        canvasHeight,
      );

      limpiarFondoByteEspejos(
        ctx,
        canvasWidth,
        canvasHeight,
      );
    };

    const drawAnimation = (time: number) => {
      if (
        time - lastDraw >= 45 &&
        video.readyState >= 2
      ) {
        drawFrame();
        lastDraw = time;
      }

      animationFrame =
        window.requestAnimationFrame(drawAnimation);
    };

    const prepare = () => {
      drawFrame();
      setVideoReady(true);
    };

    video.addEventListener("loadeddata", prepare);

    if (video.readyState >= 2) {
      prepare();
    }

    animationFrame =
      window.requestAnimationFrame(drawAnimation);

    return () => {
      video.removeEventListener("loadeddata", prepare);
      window.cancelAnimationFrame(animationFrame);
      video.pause();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (active) {
      video.play().catch((error) => {
        console.error(
          "No se pudo reproducir la animación de Byte:",
          error,
        );
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <>
      <video
        ref={videoRef}
        src={videoByteHablandoEspejos}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {!videoReady && (
        <img
          className="mnx-espejos-byte-panel-character"
          src={bytePista}
          alt="Byte ofreciendo una pista"
          draggable={false}
        />
      )}

      <canvas
        ref={canvasRef}
        className="mnx-espejos-byte-panel-character"
        role="img"
        aria-label="Byte mostrando la pista de propiedades de las operaciones"
        style={{
          display: videoReady ? "block" : "none",
        }}
      />
    </>
  );
}

function FloatingByteHint({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] =
    useState<AudioStatus>("idle");

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!open) {
      audio.pause();
      audio.currentTime = 0;
      setStatus("idle");
      return;
    }

    audio.currentTime = 0;

    audio
      .play()
      .then(() => setStatus("playing"))
      .catch((error) => {
        setStatus("paused");
        console.error(
          "No se pudo reproducir automáticamente la pista de Byte:",
          error,
        );
      });
  }, [open]);

  const abrirPista = () => {
    if (open) {
      void repetirPista();
      return;
    }

    onOpen();
  };

  const cerrarPista = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setStatus("idle");
    onClose();
  };

  const reproducirPista = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error(
        "No se pudo reproducir la pista de Byte:",
        error,
      );
    }
  };

  const pausarPista = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  };

  const repetirPista = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error(
        "No se pudo repetir la pista de Byte:",
        error,
      );
    }
  };

  const statusText =
    status === "playing"
      ? "Byte está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Pista completada"
          : "Pista preparada";

  return (
    <div
      className={`mnx-espejos-byte-float ${
        open ? "is-open" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={HINT_AUDIO_SRC}
        preload="metadata"
        onPlay={() => setStatus("playing")}
        onPause={() => {
          if (!audioRef.current?.ended) {
            setStatus("paused");
          }
        }}
        onEnded={() => setStatus("ended")}
      />

      {open && (
        <article className="mnx-espejos-byte-panel">
          <button
            type="button"
            className="mnx-espejos-byte-close"
            onClick={cerrarPista}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-espejos-byte-panel-media">
            <ByteEspejosMedia
              active={status === "playing"}
            />
          </div>

          <div className="mnx-espejos-byte-panel-copy">
            <span className="mnx-espejos-byte-panel-label">
              Pista de Byte
            </span>

            <h3>El resultado se conserva</h3>
            <p>{BYTE_HINT_FULL_TEXT}</p>

            <div className="mnx-espejos-byte-controls">
              <button
                type="button"
                onClick={reproducirPista}
                disabled={status === "playing"}
                aria-label="Reproducir pista de Byte"
              >
                <FiPlay />
              </button>

              <button
                type="button"
                onClick={pausarPista}
                disabled={status !== "playing"}
                aria-label="Pausar pista de Byte"
              >
                <FiPause />
              </button>

              <button
                type="button"
                onClick={repetirPista}
                aria-label="Repetir pista de Byte"
              >
                <FiRotateCcw />
              </button>

              <span
                className={`mnx-espejos-byte-status ${
                  status === "playing"
                    ? "is-playing"
                    : ""
                }`}
              >
                <FiVolume2 />
                {statusText}
              </span>
            </div>
          </div>
        </article>
      )}

      <button
        type="button"
        className="mnx-espejos-byte-launcher"
        onClick={abrirPista}
        aria-label="Abrir pista de Byte"
        aria-expanded={open}
      >
        <span>PISTA</span>

        <img
          src={bytePista}
          alt="Byte"
          draggable={false}
        />

        <i aria-hidden="true">?</i>
      </button>
    </div>
  );
}

export function EspejosBoveda() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");

  const [guideAudioStatus, setGuideAudioStatus] =
    useState<AudioStatus>("idle");

  const [answers, setAnswers] = useState<
    Partial<Record<QuestionKey, AnswerValue>>
  >({});

  const [explanation, setExplanation] =
    useState("");

  const [activityResolved, setActivityResolved] =
    useState(false);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const introAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const guideAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const progress =
    Object.keys(answers).length;

  const energy = progress * 50;

  useEffect(() => {
    if (helpOpen || resultModalOpen) {
      return;
    }

    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [
    menuOpen,
    helpOpen,
    resultModalOpen,
  ]);

  useEffect(() => {
    return () => {
      const introAudio =
        introAudioRef.current;

      const guideAudio =
        guideAudioRef.current;

      if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
      }

      if (guideAudio) {
        guideAudio.pause();
        guideAudio.currentTime = 0;
      }
    };
  }, []);

  const reproducirIntroduccion = async () => {
    const audio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    if (guideAudio && !guideAudio.paused) {
      guideAudio.pause();
      setGuideAudioStatus("paused");
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");

      console.error(
        "No se pudo reproducir la introducción de Los Espejos de la Bóveda:",
        error,
      );
    }
  };

  const pausarIntroduccion = () => {
    const audio = introAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setIntroAudioStatus("paused");
  };

  const repetirIntroduccion = async () => {
    const audio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    if (guideAudio && !guideAudio.paused) {
      guideAudio.pause();
      setGuideAudioStatus("paused");
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");

      console.error(
        "No se pudo repetir la introducción de Los Espejos de la Bóveda:",
        error,
      );
    }
  };

  const reproducirConsejo = async () => {
    const audio = guideAudioRef.current;
    const introAudio = introAudioRef.current;

    if (!audio) {
      return;
    }

    if (introAudio && !introAudio.paused) {
      introAudio.pause();
      setIntroAudioStatus("paused");
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setGuideAudioStatus("playing");
    } catch (error) {
      setGuideAudioStatus("paused");

      console.error(
        "No se pudo reproducir el Consejo de Suma de Los Espejos de la Bóveda:",
        error,
      );
    }
  };

  const pausarConsejo = () => {
    const audio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setGuideAudioStatus("paused");
  };

  const repetirConsejo = async () => {
    const audio = guideAudioRef.current;
    const introAudio = introAudioRef.current;

    if (!audio) {
      return;
    }

    if (introAudio && !introAudio.paused) {
      introAudio.pause();
      setIntroAudioStatus("paused");
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setGuideAudioStatus("playing");
    } catch (error) {
      setGuideAudioStatus("paused");

      console.error(
        "No se pudo repetir el Consejo de Suma de Los Espejos de la Bóveda:",
        error,
      );
    }
  };

  const detenerAudios = () => {
    const introAudio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (introAudio) {
      introAudio.pause();
      introAudio.currentTime = 0;
    }

    if (guideAudio) {
      guideAudio.pause();
      guideAudio.currentTime = 0;
    }

    setIntroAudioStatus("idle");
    setGuideAudioStatus("idle");
  };

  const introStatusText =
    introAudioStatus === "playing"
      ? "Suma está hablando"
      : introAudioStatus === "paused"
        ? "Audio en pausa"
        : introAudioStatus === "ended"
          ? "Introducción completada"
          : "Listo para escuchar";

  const guideStatusText =
    guideAudioStatus === "playing"
      ? "Suma está hablando"
      : guideAudioStatus === "paused"
        ? "Audio en pausa"
        : guideAudioStatus === "ended"
          ? "Consejo completado"
          : "Listo para escuchar";

  const irARuta = (route: string) => {
    detenerAudios();
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
    detenerAudios();
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const selectAnswer = (
    question: QuestionKey,
    value: AnswerValue,
  ) => {
    setAnswers((current) => ({
      ...current,
      [question]: value,
    }));
  };

  const answerClass = (
    question: QuestionKey,
    value: AnswerValue,
  ) =>
    answers[question] === value
      ? "mnx-espejos-option-selected"
      : "";

  const guardarExplicacion = () => {
    if (!explanation.trim()) {
      showToast(
        "Escribe una explicación antes de guardarla.",
        true,
      );
      return;
    }

    showToast(
      "Explicación guardada correctamente.",
    );
  };

  const limpiarActividad = () => {
    setAnswers({});
    setExplanation("");
    setActivityResolved(false);
  };

  const repetirActividad = () => {
    detenerAudios();
    limpiarActividad();
    setResultModalOpen(false);
    setResultModalKind("completed");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Bóveda reiniciada. ¡Relaciona los espejos nuevamente!",
    );
  };

  const cerrarResultado = () => {
    setResultModalOpen(false);

    if (resultModalKind !== "completed") {
      limpiarActividad();
      setResultModalKind("completed");
    }
  };

  const comprobar = async () => {
    if (progress !== 2) {
      showToast(
        "Selecciona una respuesta en cada reto para abrir la bóveda.",
        true,
      );
      return;
    }

    const total = (
      Object.keys(
        correctAnswers,
      ) as QuestionKey[]
    ).filter(
      (question) =>
        answers[question] ===
        correctAnswers[question],
    ).length;

    let idUsuario = 17;

    try {
      const sessionString =
        localStorage.getItem(
          "auth_session",
        );

      if (sessionString) {
        const session = JSON.parse(
          sessionString,
        );

        if (session?.id_usuario) {
          idUsuario = Number(
            session.id_usuario,
          );
        }
      }
    } catch (error) {
      console.error(
        "No se pudo leer la sesión:",
        error,
      );
    }

    const nuevasEstrellas =
      total === 2
        ? 3
        : total === 1
          ? 1
          : 0;

    const esCorrecto = total === 2;

    const payload = {
      id_usuario: idUsuario,
      mundo: "mathnumbers",
      tema:
        "Tema 3: Jerarquía y propiedades",
      actividad_codigo:
        "espejos-boveda",
      actividad_titulo:
        "Los Espejos de la Bóveda",
      respuestas: {
        respuestas_seleccionadas:
          answers,
        explicacion_texto:
          explanation,
      },
      aciertos: total,
      total_preguntas: 2,
      precision:
        (total / 2) * 100,
      estrellas_obtenidas:
        nuevasEstrellas,
      xp_obtenido: total * 25,
      completada: esCorrecto,
      tiempo_segundos: 0,
      xp_base: 50,
    };

    try {
      const progresoKey =
        `progreso_${idUsuario}_espejos-boveda`;

      const progresoPrevioRaw =
        localStorage.getItem(
          progresoKey,
        );

      let estrellasAnteriores = 0;

      if (progresoPrevioRaw) {
        const progresoPrevio =
          JSON.parse(
            progresoPrevioRaw,
          );

        estrellasAnteriores =
          Number(
            progresoPrevio
              ?.estrellas_obtenidas,
          ) || 0;
      }

      await guardarProgresoActividad(
        payload,
      );

      localStorage.setItem(
        progresoKey,
        JSON.stringify({
          estrellas_obtenidas:
            Math.max(
              estrellasAnteriores,
              nuevasEstrellas,
            ),
        }),
      );

      if (esCorrecto) {
        setActivityResolved(true);

        showToast(
          estrellasAnteriores > 0
            ? `¡Bóveda abierta otra vez! Conservas tus ${Math.max(
                estrellasAnteriores,
                nuevasEstrellas,
              )} estrellas.`
            : "¡Bóveda abierta! Ganaste 3 estrellas.",
        );

        window.setTimeout(() => {
          setResultModalKind(
            "completed",
          );
          setResultModalOpen(true);
        }, 900);

        return;
      }

      setActivityResolved(false);

      showToast(
        total === 1
          ? "¡Casi lo logras! Revisa qué cambió y qué se mantuvo."
          : "Los espejos no coinciden. Usa la pista de Byte.",
        true,
      );

      window.setTimeout(() => {
        setResultModalKind(
          total === 1
            ? "almost"
            : "retry",
        );
        setResultModalOpen(true);
      }, 900);
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso:",
        error,
      );

      showToast(
        "No se pudo guardar el progreso. Revisa la conexión con el servidor.",
        true,
      );
    }
  };

  return (
    <main className="mnx-espejos-page mnx-espejos-cofre-layout">
      <button
        type="button"
        className={`mnx-espejos-hamburger ${
          menuOpen
            ? "mnx-espejos-hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (current) => !current,
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
          className="mnx-espejos-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-espejos-sidebar ${
          menuOpen
            ? "mnx-espejos-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-espejos-sidebar-logo"
        />

        <nav className="mnx-espejos-sidebar-menu">
          <button
            type="button"
            className="mnx-espejos-menu-item"
            onClick={() =>
              irARuta("/dashboard")
            }
          >
            <FiGrid />
            <span>
              Panel de control principal
            </span>
          </button>

          <button
            type="button"
            className="mnx-espejos-menu-item mnx-espejos-menu-active"
            onClick={() =>
              irARuta(
                "/seleccion-mundos",
              )
            }
          >
            <GiRingedPlanet />
            <span>
              Selección de mundos
            </span>
          </button>

          <button
            type="button"
            className="mnx-espejos-menu-item"
            onClick={() =>
              irARuta(
                "/retroalimentacion",
              )
            }
          >
            <FiMessageSquare />
            <span>
              Retroalimentación
            </span>
          </button>

          <button
            type="button"
            className="mnx-espejos-menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnx-espejos-menu-item"
            onClick={() =>
              irARuta("/perfil-alumno")
            }
          >
            <FiUser />
            <span>
              Perfil del alumno
            </span>
          </button>

          <button
            type="button"
            className="mnx-espejos-menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <article className="mnx-espejos-week-card">
          <div className="mnx-espejos-week-copy">
            <div className="mnx-espejos-week-head">
              <strong>
                Progreso semanal
              </strong>
              <span>Nivel 4</span>
            </div>

            <div className="mnx-espejos-week-progress">
              <span>★</span>

              <div>
                <b />
              </div>

              <strong>60%</strong>
            </div>
          </div>

          <img
            src={zorritoConsejo}
            alt="Nova acompañando el progreso"
            className="mnx-espejos-sidebar-character"
          />
        </article>
      </aside>

      <section className="mnx-espejos-content">
        <div className="mnx-espejos-decoration mnx-espejos-decoration-one" />

        <div className="mnx-espejos-decoration mnx-espejos-decoration-two" />

        <div
          className="mnx-espejos-stars"
          aria-hidden="true"
        >
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
          <span>✧</span>
        </div>

        <section className="mnx-espejos-main">
          <div className="mnx-espejos-top-actions">
            <button
              type="button"
              onClick={() =>
                setHelpOpen(true)
              }
            >
              <FiHelpCircle />
              Ayuda
            </button>

            <button
              type="button"
              onClick={() =>
                irARuta(
                  activityListRoute,
                )
              }
            >
              <FiLogOut />
              Salir de la actividad
            </button>
          </div>

          <header className="mnx-espejos-header">
            <div className="mnx-espejos-header-copy">
              <div className="mnx-espejos-breadcrumb">
                <strong>
                  MathNumbers
                </strong>
                <span>/</span>
                <span>
                  Tema 3: Jerarquía y propiedades
                </span>
              </div>

              <div className="mnx-espejos-title-row">
                <span className="mnx-espejos-title-icon">
                  <FiBookOpen />
                </span>

                <h1>
                  Los Espejos de la Bóveda
                </h1>
              </div>

              <p>
                Relaciona expresiones equivalentes usando
                las propiedades conmutativa y asociativa
                de la suma para abrir la bóveda.
              </p>

              <div className="mnx-espejos-pills">
                <span>Propiedades</span>
                <span>8–12 min</span>
                <span>2 retos</span>
                <span>+50 XP</span>
              </div>
            </div>

            <div className="mnx-espejos-welcome">
              <article className="mnx-espejos-speech">
                <span className="mnx-espejos-speaker-label">
                  Comandante Suma explica
                </span>

                <p aria-live="polite">
                  {introAudioStatus === "idle"
                    ? INTRO_INITIAL_TEXT
                    : INTRO_FULL_TEXT}
                </p>

                <div className="mnx-espejos-audio-controls">
                  <audio
                    ref={introAudioRef}
                    src={INTRO_AUDIO_SRC}
                    preload="metadata"
                    onPlay={() =>
                      setIntroAudioStatus("playing")
                    }
                    onPause={() => {
                      if (!introAudioRef.current?.ended) {
                        setIntroAudioStatus("paused");
                      }
                    }}
                    onEnded={() =>
                      setIntroAudioStatus("ended")
                    }
                  />

                  <button
                    type="button"
                    onClick={reproducirIntroduccion}
                    disabled={
                      introAudioStatus === "playing"
                    }
                    aria-label="Reproducir introducción del Comandante Suma"
                  >
                    <FiPlay />
                  </button>

                  <button
                    type="button"
                    onClick={pausarIntroduccion}
                    disabled={
                      introAudioStatus !== "playing"
                    }
                    aria-label="Pausar introducción del Comandante Suma"
                  >
                    <FiPause />
                  </button>

                  <button
                    type="button"
                    onClick={repetirIntroduccion}
                    aria-label="Repetir introducción del Comandante Suma"
                  >
                    <FiRotateCcw />
                  </button>

                  <span
                    className={`mnx-espejos-audio-status ${
                      introAudioStatus === "playing"
                        ? "is-playing"
                        : ""
                    }`}
                  >
                    <FiVolume2 />
                    {introStatusText}
                  </span>
                </div>
              </article>

              <div className="mnx-espejos-hero-stage">
                <img
                  key={
                    introAudioStatus === "playing"
                      ? "espejos-suma-hablando"
                      : "espejos-suma-idle"
                  }
                  src={
                    introAudioStatus === "playing"
                      ? comandanteSumaHablando
                      : comandanteSumaIdle
                  }
                  alt={
                    introAudioStatus === "playing"
                      ? "Comandante Suma explicando la misión"
                      : "Comandante Suma listo para explicar"
                  }
                  className="mnx-espejos-intro-character"
                  draggable={false}
                />
              </div>
            </div>
          </header>

          <section className="mnx-espejos-activity-grid">
            <div className="mnx-espejos-left-column">
              <article className="mnx-espejos-art">
                            <div className="mnx-espejos-scene-visual">
                              <img
                                src={espejosAnimado}
                                alt="Los Espejos de la Bóveda"
                                draggable={false}
                              />
                            </div>

                            <div className="mnx-espejos-mission">
                              <FiZap />

                              <div>
                                <strong>
                                  Energía de la bóveda
                                </strong>

                                <div className="mnx-espejos-energy-track">
                                  <b
                                    style={{
                                      width: `${energy}%`,
                                    }}
                                  />
                                </div>

                                <p>
                                  {energy}% cargado · cada reflejo agrega 50%.
                                </p>
                              </div>
                            </div>
                          </article>

              <section className="mnx-espejos-reminder-card">
                            <img
                              key={
                                guideAudioStatus === "playing"
                                  ? "espejos-consejo-hablando"
                                  : "espejos-consejo-idle"
                              }
                              src={
                                guideAudioStatus === "playing"
                                  ? comandanteSumaHablando
                                  : comandanteSumaIdle
                              }
                              alt={
                                guideAudioStatus === "playing"
                                  ? "Comandante Suma dando el consejo"
                                  : "Comandante Suma listo para dar el consejo"
                              }
                              className="mnx-espejos-reminder-character"
                              draggable={false}
                            />

                            <div className="mnx-espejos-reminder-copy">
                              <span className="mnx-espejos-help-label">
                                Consejo de Suma
                              </span>

                              <h3>
                                Comprueba cada reflejo
                              </h3>

                              <p aria-live="polite">
                                {guideAudioStatus === "idle"
                                  ? GUIDE_INITIAL_TEXT
                                  : GUIDE_FULL_TEXT}
                              </p>

                              <div className="mnx-espejos-reminder-audio-controls">
                                <audio
                                  ref={guideAudioRef}
                                  src={GUIDE_AUDIO_SRC}
                                  preload="metadata"
                                  onPlay={() =>
                                    setGuideAudioStatus("playing")
                                  }
                                  onPause={() => {
                                    if (!guideAudioRef.current?.ended) {
                                      setGuideAudioStatus("paused");
                                    }
                                  }}
                                  onEnded={() =>
                                    setGuideAudioStatus("ended")
                                  }
                                />

                                <button
                                  type="button"
                                  onClick={reproducirConsejo}
                                  disabled={
                                    guideAudioStatus === "playing"
                                  }
                                  aria-label="Reproducir Consejo de Suma"
                                >
                                  <FiPlay />
                                </button>

                                <button
                                  type="button"
                                  onClick={pausarConsejo}
                                  disabled={
                                    guideAudioStatus !== "playing"
                                  }
                                  aria-label="Pausar Consejo de Suma"
                                >
                                  <FiPause />
                                </button>

                                <button
                                  type="button"
                                  onClick={repetirConsejo}
                                  aria-label="Repetir Consejo de Suma"
                                >
                                  <FiRotateCcw />
                                </button>

                                <span
                                  className={`mnx-espejos-reminder-audio-status ${
                                    guideAudioStatus === "playing"
                                      ? "is-playing"
                                      : ""
                                  }`}
                                >
                                  <FiVolume2 />
                                  {guideStatusText}
                                </span>
                              </div>

                
                            </div>
                          </section>
            </div>

            <div className="mnx-espejos-right-column">
              <section className="mnx-espejos-guide-card">
                            <div className="mnx-espejos-section-heading">
                              <span>↔</span>

                              <div>
                                <strong>
                                  Guía visual rápida
                                </strong>

                                <p>
                                  La expresión cambia, pero el valor se mantiene.
                                </p>
                              </div>
                            </div>

                            <div className="mnx-espejos-guide-grid">
                              <article>
                                <p>
                                  <strong>
                                    Conmutativa
                                  </strong>
                                  : cambia el orden.
                                </p>

                                <div className="mnx-espejos-demo-row">
                                  <b>4 + 7</b>
                                  <em>↔</em>
                                  <b>7 + 4</b>
                                </div>
                              </article>

                              <article>
                                <p>
                                  <strong>
                                    Asociativa
                                  </strong>
                                  : cambia la agrupación.
                                </p>

                                <div className="mnx-espejos-demo-row">
                                  <b>
                                    (2 + 3) + 1
                                  </b>
                                  <em>↔</em>
                                  <b>
                                    2 + (3 + 1)
                                  </b>
                                </div>
                              </article>
                            </div>
                          </section>

              <section className="mnx-espejos-questions">
                            <article className="mnx-espejos-question-card">
                              <div className="mnx-espejos-question-title">
                                <span>1</span>

                                <h2>
                                  ¿Cuál es el reflejo equivalente de 4 + 7?
                                </h2>
                              </div>

                              <div className="mnx-espejos-options">
                                <button
                                  type="button"
                                  className={answerClass(
                                    "q1",
                                    "a",
                                  )}
                                  onClick={() =>
                                    selectAnswer(
                                      "q1",
                                      "a",
                                    )
                                  }
                                >
                                  <span>A</span>
                                  <strong>7 + 4</strong>
                                  <i>
                                    <FiCheck />
                                  </i>
                                </button>

                                <button
                                  type="button"
                                  className={answerClass(
                                    "q1",
                                    "b",
                                  )}
                                  onClick={() =>
                                    selectAnswer(
                                      "q1",
                                      "b",
                                    )
                                  }
                                >
                                  <span>B</span>
                                  <strong>7 − 4</strong>
                                  <i>
                                    <FiCheck />
                                  </i>
                                </button>
                              </div>
                            </article>

                            <article className="mnx-espejos-question-card">
                              <div className="mnx-espejos-question-title">
                                <span>2</span>

                                <h2>
                                  ¿Cuál es el reflejo equivalente de (2 + 3) + 1?
                                </h2>
                              </div>

                              <div className="mnx-espejos-options">
                                <button
                                  type="button"
                                  className={answerClass(
                                    "q2",
                                    "a",
                                  )}
                                  onClick={() =>
                                    selectAnswer(
                                      "q2",
                                      "a",
                                    )
                                  }
                                >
                                  <span>A</span>
                                  <strong>
                                    2 + (3 − 1)
                                  </strong>
                                  <i>
                                    <FiCheck />
                                  </i>
                                </button>

                                <button
                                  type="button"
                                  className={answerClass(
                                    "q2",
                                    "b",
                                  )}
                                  onClick={() =>
                                    selectAnswer(
                                      "q2",
                                      "b",
                                    )
                                  }
                                >
                                  <span>B</span>
                                  <strong>
                                    2 + (3 + 1)
                                  </strong>
                                  <i>
                                    <FiCheck />
                                  </i>
                                </button>
                              </div>
                            </article>

                            <article className="mnx-espejos-explanation-card">
                              <div className="mnx-espejos-question-title">
                                <span>3</span>

                                <h2>
                                  ¿Qué cambió y qué se mantuvo igual?
                                </h2>
                              </div>

                              <label
                                className="mnx-espejos-answer-box"
                                htmlFor="espejos-explanation"
                              >
                                <textarea
                                  id="espejos-explanation"
                                  maxLength={300}
                                  value={explanation}
                                  onChange={(event) =>
                                    setExplanation(
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Escribe tu explicación aquí..."
                                />

                                <span>
                                  {explanation.length} / 300
                                </span>
                              </label>

                              <button
                                type="button"
                                className="mnx-espejos-save-btn"
                                onClick={
                                  guardarExplicacion
                                }
                              >
                                <FiSave />
                                Guardar explicación
                              </button>
                            </article>
                          </section>

              <aside className="mnx-espejos-actions">
                            {activityResolved && (
                              <article className="mnx-espejos-evidence-card">
                                <FiInfo />

                                <div>
                                  <strong>
                                    Evidencia guardada
                                  </strong>

                                  <p>
                                    La actividad fue resuelta correctamente y tus respuestas quedarán disponibles en Retroalimentación.
                                  </p>
                                </div>
                              </article>
                            )}

                            <button
                              type="button"
                              className="mnx-espejos-check-button"
                              onClick={comprobar}
                            >
                              <FiCheckCircle />
                              Comprobar equivalencias
                              <span>
                                {progress}/2 listas
                              </span>
                            </button>
                          </aside>
            </div>
          </section>

          <section className="mnx-espejos-stats">
            <article>
              <FiFlag />

              <div>
                <span>Respuestas</span>
                <strong>
                  {progress}/2
                </strong>
              </div>
            </article>

            <article>
              <FiTarget />

              <div>
                <span>
                  Propiedades
                </span>
                <strong>2</strong>
              </div>
            </article>

            <article>
              <FiZap />

              <div>
                <span>
                  Energía de la bóveda
                </span>
                <strong>
                  {energy}%
                </strong>
              </div>
            </article>

            <article>
              <span className="mnx-espejos-xp-star">
                ★
              </span>

              <div>
                <span>
                  Recompensa
                </span>
                <strong>50 XP</strong>
              </div>
            </article>
          </section>
        </section>
      </section>

      <button
        className="mnx-espejos-logout"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      <FloatingByteHint
        open={helpOpen}
        onOpen={() => setHelpOpen(true)}
        onClose={() => setHelpOpen(false)}
      />

      {resultModalOpen && (
        <ResultModal
          kind={resultModalKind}
          nextRoute={puentePrioridadesRoute}
          retryRoute={espejosRoute}
          onClose={cerrarResultado}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}