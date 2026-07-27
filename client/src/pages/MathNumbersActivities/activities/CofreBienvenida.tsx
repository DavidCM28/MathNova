import "./CofreBienvenida.css";
import audioIntroSuma from "../../../assets/mathnumbers/01-cofre-bienvenida/intro_suma.mp3";
import audioPistaByte from "../../../assets/mathnumbers/01-cofre-bienvenida/pista_byte.mp3";
import audioConsejoSuma from "../../../assets/mathnumbers/01-cofre-bienvenida/consejo_suma.mp3";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";
import videoByteHablando from "../../../assets/mathnumbers/01-cofre-bienvenida/byte_hablando.mp4";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiCheck,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { ResultModal } from "../components/ResultModal";
import type { ResultKind } from "../types";
import { useToast } from "../hooks/useToast";
import {
  guardarProgresoUsuarioActual,
} from "../../../services/progresoService";
import {
  chestFall,
  chestVib,
  cofreGuide,
  cofreHeroTalking,
  cofreHeroTalkingIdle,
  cofreTitleChest,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

type QuestionKey = "q1" | "q2";
type AnswerValue = "a" | "b" | "c" | "d";
type ChestPhase = "fall" | "vib";
type MediaKind = "image" | "video";
type AudioStatus = "idle" | "playing" | "paused" | "ended";

type CharacterMediaConfig = {
  src: string;
  kind: MediaKind;
  alt: string;
  className: string;
  loop?: boolean;
};


const correctAnswers: Record<QuestionKey, AnswerValue> = {
  q1: "c",
  q2: "d",
};

const cofreRoute = "/actividades/mathnumbers/cofre-bienvenida";
const radarRoute = "/actividades/mathnumbers/radar-supervivencia";
const hintRoute =
  "/actividades/mathnumbers/aqui-tienes-una-pista";

/* =========================================================
   1. ANIMACIONES DEL COFRE
   =========================================================
   chestFall y chestVib se importan desde mathNumbersAssets.ts.
   Si multimedia cambia la duración de chest_fall.webp,
   actualiza únicamente este valor.
*/
const CHEST_FALL_DURATION_MS = 3100;

/* =========================================================
   2. AUDIOS DE LOS PERSONAJES
   =========================================================
   Cuando tengas los audios:

   A) Impórtalos arriba, por ejemplo:
      import audioIntroSuma from "../../../assets/.../suma-intro.mp3";

   B) Reemplaza null por el recurso importado:
      const INTRO_AUDIO_SRC: string | null = audioIntroSuma;

   Mientras estén en null, los controles aparecen desactivados,
   pero el archivo compila y el diseño puede probarse normalmente.
*/
const INTRO_AUDIO_SRC: string | null = audioIntroSuma;
const GUIDE_AUDIO_SRC: string | null = audioConsejoSuma;
const HINT_AUDIO_SRC: string | null = audioPistaByte;

/* =========================================================
   2.1 TEXTOS COMPLETOS DE LOS AUDIOS
   =========================================================
   Los textos ya no aparecen letra por letra. Se muestran como
   bloques completos mientras el personaje cambia a su animación
   de hablar durante la reproducción.
*/
const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la instrucción del Comandante Suma.";

const INTRO_SCRIPT = [
  "¡Hola, explorador de MathNova!",
  "Observa la guía visual y compara las cantidades antes de responder.",
  "Elige una respuesta en cada pregunta para llenar la energía del cofre.",
  "¡Vamos a comenzar la misión!",
];

const INTRO_FULL_TEXT = INTRO_SCRIPT.join(" ");

const SUMA_GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo de Suma.";

const SUMA_GUIDE_SCRIPT = [
  "¡Atención, explorador!",
  "No te fijes solo en cómo están escritos los números.",
  "Piensa en la cantidad que representa cada uno.",
  "Una fracción divide un entero en partes iguales y un decimal puede mostrar esa misma cantidad de otra forma.",
  "Compara las partes y busca dos opciones que representen la misma porción.",
  "¡Observa con calma y confía en tu respuesta!",
];

const SUMA_GUIDE_FULL_TEXT = SUMA_GUIDE_SCRIPT.join(" ");

const BYTE_HINT_SCRIPT = [
  "¡Hola, explorador!",
  "Si ves 0.25, imagina una barra completa dividida en cuatro partes iguales.",
  "Ahora piensa cuántas de esas partes representa el decimal.",
  "Observa las fracciones y busca la que muestre la misma cantidad.",
  "¡Tú puedes encontrarla!",
];

const BYTE_HINT_FULL_TEXT = BYTE_HINT_SCRIPT.join(" ");

/* =========================================================
   3. PERSONAJES Y ANIMACIONES QUE HABLAN
   =========================================================
   Para cambiar un personaje:
   - Cambia src por la imagen/WebP/video nuevo.
   - Usa kind: "image" para PNG, GIF o WebP animado.
   - Usa kind: "video" para MP4 o WebM.
   - El tamaño visual se cambia en las clases CSS indicadas.
*/
/* Personaje cuando todavía no reproduce el audio */
const INTRO_CHARACTER_IDLE: CharacterMediaConfig = {
  src: cofreHeroTalkingIdle,
  kind: "image",
  alt: "Comandante Suma listo para explicar",
  className: "mnx-cofre-intro-character",
};

/* Animación que aparece mientras Suma está hablando */
const INTRO_CHARACTER_TALKING: CharacterMediaConfig = {
  src: cofreHeroTalking,
  kind: "image",
  alt: "Comandante Suma explicando la misión",
  className: "mnx-cofre-intro-character",
};

const GUIDE_CHARACTER: CharacterMediaConfig = {
  src: cofreGuide,
  kind: "image",
  alt: "Comandante Suma dando un consejo",
  className: "mnx-cofre-help-character",
};

/*
  Este personaje es temporal. Cuando multimedia entregue a Byte,
  importa su recurso y reemplaza src: cofreGuide por src: bytePista.
*/
const HINT_CHARACTER: CharacterMediaConfig = {
  src: bytePista,
  kind: "image",
  alt: "Byte ofreciendo una pista",
  className: "mnx-cofre-help-character",
};

const SIDEBAR_CHARACTER: CharacterMediaConfig = {
  src: zorritoConsejo,
  kind: "image",
  alt: "Nova acompañando el progreso semanal",
  className: "mnx-cofre-sidebar-character",
};


/*
  BYTE ANIMADO DEL CONTENEDOR "PISTA DE BYTE"

  Se usa el mismo video de MathGeometry. El video permanece oculto
  y sus fotogramas se dibujan sobre un canvas para:
  - conservar correctamente sus proporciones;
  - eliminar el fondo blanco conectado a los bordes;
  - mantener intacto el tamaño y diseño del contenedor de MathNumbers.
*/
function limpiarFondoBlancoByte(
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
    if (!esFondoClaro(index)) return;

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

function dibujarVideoByteSinEstirar(
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

function ByteBlinkMedia({
  active,
  className = "mnx-cofre-byte-panel-character",
}: {
  active: boolean;
  className?: string;
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

    const canvasWidth = 480;
    const canvasHeight = 520;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let lastDraw = 0;

    const drawFrame = () => {
      if (video.readyState < 2) {
        return;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      dibujarVideoByteSinEstirar(
        ctx,
        video,
        canvasWidth,
        canvasHeight,
      );
      limpiarFondoBlancoByte(
        ctx,
        canvasWidth,
        canvasHeight,
      );
    };

    const drawAnimation = (time: number) => {
      if (time - lastDraw >= 45 && video.readyState >= 2) {
        drawFrame();
        lastDraw = time;
      }

      animationFrame = window.requestAnimationFrame(drawAnimation);
    };

    const prepare = () => {
      drawFrame();
      setVideoReady(true);
    };

    video.addEventListener("loadeddata", prepare);

    if (video.readyState >= 2) {
      prepare();
    }

    animationFrame = window.requestAnimationFrame(drawAnimation);

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
        src={videoByteHablando}
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
          className={className}
          src={HINT_CHARACTER.src}
          alt={HINT_CHARACTER.alt}
          draggable={false}
        />
      )}

      <canvas
        ref={canvasRef}
        className={className}
        role="img"
        aria-label="Byte hablando y ofreciendo una pista"
        style={{ display: videoReady ? "block" : "none" }}
      />
    </>
  );
}

function CharacterMedia({ media }: { media: CharacterMediaConfig }) {
  if (media.kind === "video") {
    return (
      <video
        className={media.className}
        src={media.src}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={media.loop ?? true}
        aria-label={media.alt}
      />
    );
  }

  return (
    <img
      className={media.className}
      src={media.src}
      alt={media.alt}
      draggable={false}
    />
  );
}

function SumaGuideAudio({
  onStatusChange,
}: {
  onStatusChange?: (status: AudioStatus) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const changeStatus = (nextStatus: AudioStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  const playAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !GUIDE_AUDIO_SRC) {
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      changeStatus("playing");
    } catch (error) {
      changeStatus("paused");
      console.error(
        "No se pudo reproducir el consejo de Suma:",
        error,
      );
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    changeStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !GUIDE_AUDIO_SRC) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      changeStatus("playing");
    } catch (error) {
      changeStatus("paused");
      console.error(
        "No se pudo reiniciar el consejo de Suma:",
        error,
      );
    }
  };

  const statusText =
    status === "playing"
      ? "Suma está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Consejo completado"
          : "Listo para escuchar";

  return (
    <>
      <p aria-live="polite">
        {status === "idle"
          ? SUMA_GUIDE_INITIAL_TEXT
          : SUMA_GUIDE_FULL_TEXT}
      </p>

      <div className="mnx-cofre-audio-controls mnx-cofre-audio-compact">
        <audio
          ref={audioRef}
          src={GUIDE_AUDIO_SRC ?? undefined}
          preload="metadata"
          onPlay={() => changeStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              changeStatus("paused");
            }
          }}
          onEnded={() => changeStatus("ended")}
        />

        <button
          type="button"
          onClick={playAudio}
          disabled={!GUIDE_AUDIO_SRC || status === "playing"}
          aria-label="Reproducir consejo de Suma"
        >
          <FiPlay />
        </button>

        <button
          type="button"
          onClick={pauseAudio}
          disabled={status !== "playing"}
          aria-label="Pausar consejo de Suma"
        >
          <FiPause />
        </button>

        <button
          type="button"
          onClick={restartAudio}
          disabled={!GUIDE_AUDIO_SRC}
          aria-label="Repetir consejo de Suma"
        >
          <FiRotateCcw />
        </button>

        <span
          className={`mnx-cofre-audio-status ${
            status === "playing"
              ? "mnx-cofre-audio-playing"
              : ""
          }`}
        >
          <FiVolume2 />
          {statusText}
        </span>
      </div>
    </>
  );
}

function FloatingByteHint() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const openHint = async () => {
    setOpen(true);

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
        "No se pudo reproducir automáticamente la pista de Byte:",
        error,
      );
    }
  };

  const closeHint = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setStatus("idle");
    setOpen(false);
  };

  const pauseAudio = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  };

  const playAudio = async () => {
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

  const restartAudio = async () => {
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
      className={`mnx-cofre-byte-float ${
        open ? "mnx-cofre-byte-float-open" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={HINT_AUDIO_SRC ?? undefined}
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
        <article className="mnx-cofre-byte-panel">
          <button
            type="button"
            className="mnx-cofre-byte-close"
            onClick={closeHint}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-cofre-byte-panel-media">
            <ByteBlinkMedia
              active={status === "playing"}
              className="mnx-cofre-byte-panel-character"
            />
          </div>

          <div className="mnx-cofre-byte-panel-copy">
            <span className="mnx-cofre-byte-panel-label">
              Pista de Byte
            </span>
            <h3>Piensa en partes iguales</h3>
            <p>{BYTE_HINT_FULL_TEXT}</p>

            <div className="mnx-cofre-audio-controls mnx-cofre-audio-compact">
              <button
                type="button"
                onClick={playAudio}
                disabled={!HINT_AUDIO_SRC || status === "playing"}
                aria-label="Reproducir pista de Byte"
              >
                <FiPlay />
              </button>

              <button
                type="button"
                onClick={pauseAudio}
                disabled={status !== "playing"}
                aria-label="Pausar pista de Byte"
              >
                <FiPause />
              </button>

              <button
                type="button"
                onClick={restartAudio}
                disabled={!HINT_AUDIO_SRC}
                aria-label="Repetir pista de Byte"
              >
                <FiRotateCcw />
              </button>

              <span
                className={`mnx-cofre-audio-status ${
                  status === "playing"
                    ? "mnx-cofre-audio-playing"
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
        className="mnx-cofre-byte-launcher"
        onClick={openHint}
        aria-label="Abrir pista de Byte"
        aria-expanded={open}
      >
        <span>PISTA</span>
        <img
          src={HINT_CHARACTER.src}
          alt="Byte"
          draggable={false}
        />
        <i aria-hidden="true">?</i>
      </button>
    </div>
  );
}

function Fraction({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span
      className="mnx-cofre-fraction"
      aria-label={`${top} sobre ${bottom}`}
    >
      <span>{top}</span>
      <span>{bottom}</span>
    </span>
  );
}

export function CofreBienvenida() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [answers, setAnswers] = useState<
    Partial<Record<QuestionKey, AnswerValue>>
  >({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chestPhase, setChestPhase] =
    useState<ChestPhase>("fall");
  const [attempts, setAttempts] = useState(0);
  const [guardandoProgreso, setGuardandoProgreso] =
    useState(false);
  const [guideAudioStatus, setGuideAudioStatus] =
    useState<AudioStatus>("idle");

  const [resultModalOpen, setResultModalOpen] =
    useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const inicioActividadRef = useRef<number>(Date.now());
  const resultTimerRef = useRef<number | null>(null);
  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");

  const currentIntroCharacter =
    introAudioStatus === "playing"
      ? INTRO_CHARACTER_TALKING
      : INTRO_CHARACTER_IDLE;

  const currentGuideCharacter =
    guideAudioStatus === "playing"
      ? INTRO_CHARACTER_TALKING
      : GUIDE_CHARACTER;

  const currentChestAnimation =
    chestPhase === "fall" ? chestFall : chestVib;

  const progress = Object.keys(answers).length;
  const energy = progress * 50;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (resultTimerRef.current !== null) {
        window.clearTimeout(resultTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animation = new Image();
    animation.src = chestVib;
  }, []);

  useEffect(() => {
    if (chestPhase !== "fall") {
      return;
    }

    const timer = window.setTimeout(() => {
      setChestPhase("vib");
    }, CHEST_FALL_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [chestPhase]);

  const playIntroAudio = async () => {
    const audio = introAudioRef.current;

    if (!audio || !INTRO_AUDIO_SRC) {
      return;
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
        "No se pudo reproducir el audio de introducción:",
        error,
      );
    }
  };

  const pauseIntroAudio = () => {
    const audio = introAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setIntroAudioStatus("paused");
  };

  const restartIntroAudio = async () => {
    const audio = introAudioRef.current;

    if (!audio || !INTRO_AUDIO_SRC) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");
      console.error(
        "No se pudo reiniciar el audio de introducción:",
        error,
      );
    }
  };

  const introStatusText =
    introAudioStatus === "playing"
      ? "Suma está hablando"
      : introAudioStatus === "paused"
        ? "Audio en pausa"
        : introAudioStatus === "ended"
          ? "Instrucción completada"
          : "Listo para escuchar";

  const irARuta = (route: string) => {
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const selectAnswer = (
    question: QuestionKey,
    value: AnswerValue,
  ) => {
    if (guardandoProgreso) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [question]: value,
    }));

    setChecked(false);
    setSolved(false);
  };

  const answerClass = (
    question: QuestionKey,
    value: AnswerValue,
  ) => {
    const selected = answers[question] === value;
    const correct = correctAnswers[question] === value;

    if (checked && correct) {
      return "mnx-cofre-option-correct";
    }

    if (checked && selected && !correct) {
      return "mnx-cofre-option-wrong";
    }

    if (selected) {
      return "mnx-cofre-option-selected";
    }

    return "";
  };

  const limpiarActividad = () => {
    if (resultTimerRef.current !== null) {
      window.clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }

    setAnswers({});
    setChecked(false);
    setSolved(false);
    setChestPhase("fall");
    setGuardandoProgreso(false);

    inicioActividadRef.current = Date.now();
  };

  const repetirActividad = () => {
    limpiarActividad();
    setAttempts(0);
    setResultModalOpen(false);
    setResultModalKind("completed");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Cofre reiniciado. ¡Responde nuevamente!",
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
    if (guardandoProgreso) {
      return;
    }

    if (progress !== 2) {
      showToast(
        "Selecciona una respuesta en cada pregunta para abrir el cofre.",
        true,
      );
      return;
    }

    const total = (
      Object.keys(correctAnswers) as QuestionKey[]
    ).filter(
      (question) =>
        answers[question] === correctAnswers[question],
    ).length;

    const esCorrecto = total === 2;

    const tiempoSegundos = Math.max(
      1,
      Math.floor(
        (Date.now() - inicioActividadRef.current) / 1000,
      ),
    );

    /*
     * Solo mostramos las respuestas correctas cuando el alumno
     * resolvió toda la actividad. Así no revelamos la respuesta
     * al abrir el modal de "casi" o "vuelve a intentarlo".
     */
    setChecked(esCorrecto);
    setSolved(esCorrecto);

    setAttempts((intentosActuales) =>
      Math.min(intentosActuales + 1, 3),
    );

    setGuardandoProgreso(true);

    try {
      const resultado =
        await guardarProgresoUsuarioActual({
          mundo: "MathNumbers",
          tema: "Fracciones y decimales",
          actividad_codigo:
            "mathnumbers-cofre-bienvenida",
          actividad_titulo:
            "El Cofre de Bienvenida",
          respuestas:
            answers as Record<string, unknown>,
          aciertos: total,
          total_preguntas: 2,
          tiempo_segundos: tiempoSegundos,
          xp_base: 40,
          completada: esCorrecto,
        });

      const estrellasGuardadas = Number(
        resultado.progreso.estrellas_obtenidas ?? 0,
      );

      const numeroIntentos = Number(
        resultado.progreso.intentos ?? 1,
      );

      console.log(
        "Progreso del Cofre guardado:",
        resultado.progreso,
      );

      inicioActividadRef.current = Date.now();

      if (esCorrecto) {
        showToast(
          numeroIntentos > 1
            ? `¡Increíble! Volviste a abrir el cofre. Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Perfecto! El cofre se iluminó. ¡Has ganado ${estrellasGuardadas} estrellas! ⭐`,
        );

        if (resultTimerRef.current !== null) {
          window.clearTimeout(resultTimerRef.current);
        }

        resultTimerRef.current = window.setTimeout(() => {
          setResultModalKind("completed");
          setResultModalOpen(true);
          resultTimerRef.current = null;
        }, 1300);

        return;
      }

      showToast(
        total === 1
          ? "Vas cerca: una respuesta está correcta."
          : "Revisa las respuestas e inténtalo otra vez.",
        true,
      );

      if (resultTimerRef.current !== null) {
        window.clearTimeout(resultTimerRef.current);
      }

      resultTimerRef.current = window.setTimeout(() => {
        setResultModalKind(
          total === 1 ? "almost" : "retry",
        );
        setResultModalOpen(true);
        resultTimerRef.current = null;
      }, 1100);
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso del Cofre:",
        error,
      );

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el progreso.";

      showToast(
        `Error de conexión: ${mensaje}`,
        true,
      );
    } finally {
      setGuardandoProgreso(false);
    }
  };

  return (
    <main
      className={`mnx-cofre-page mnx-cofre-radar-layout ${
        solved ? "mnx-cofre-solved" : ""
      }`}
    >
      <button
        type="button"
        className={`mnx-cofre-hamburger ${
          menuOpen ? "mnx-cofre-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((current) => !current)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="mnx-cofre-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`mnx-cofre-sidebar ${
          menuOpen ? "mnx-cofre-sidebar-open" : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-cofre-sidebar-logo"
        />

        <nav className="mnx-cofre-sidebar-menu">
          <button
            className="mnx-cofre-menu-item"
            type="button"
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Panel de control principal</span>
          </button>

          <button
            className="mnx-cofre-menu-item mnx-cofre-menu-active"
            type="button"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="mnx-cofre-menu-item"
            type="button"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="mnx-cofre-menu-item"
            type="button"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="mnx-cofre-menu-item"
            type="button"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="mnx-cofre-menu-item"
            type="button"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <article className="mnx-cofre-week-card">
          <div className="mnx-cofre-week-copy">
            <div className="mnx-cofre-week-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="mnx-cofre-week-progress">
              <span>★</span>
              <div>
                <b />
              </div>
              <strong>60%</strong>
            </div>
          </div>

          <CharacterMedia media={SIDEBAR_CHARACTER} />
        </article>
      </aside>

      <section className="mnx-cofre-content">
        <div className="mnx-cofre-decoration mnx-cofre-decoration-one" />
        <div className="mnx-cofre-decoration mnx-cofre-decoration-two" />
        <div className="mnx-cofre-stars" aria-hidden="true">
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
          <span>✧</span>
        </div>

        <section className="mnx-cofre-main">
          <div className="mnx-cofre-top-actions">
            <button
              type="button"
              onClick={() => irARuta(hintRoute)}
            >
              <FiHelpCircle />
              Ayuda
            </button>

            <button
              type="button"
              onClick={() => irARuta(activityListRoute)}
            >
              <FiLogOut />
              Salir de la actividad
            </button>
          </div>

          <header className="mnx-cofre-header">
            <div className="mnx-cofre-header-copy">
              <div className="mnx-cofre-breadcrumb">
                <strong>MathNumbers</strong>
                <span>/</span>
                <span>Fracciones y decimales</span>
              </div>

              <div className="mnx-cofre-title-row">
                <span className="mnx-cofre-title-icon">
                  <img
                    src={cofreTitleChest}
                    alt=""
                    aria-hidden="true"
                  />
                </span>
                <h1>El Cofre de Bienvenida</h1>
              </div>

              <p>
                Descubre cómo una fracción y un decimal pueden
                representar exactamente la misma cantidad.
                <br />
                Completa las dos preguntas para llenar la energía
                del cofre.
              </p>

              <div className="mnx-cofre-pills">
                <span>Introducción</span>
                <span>5–8 min</span>
                <span>2 preguntas</span>
                <span>+40 XP</span>
              </div>
            </div>

            <div className="mnx-cofre-welcome">
              <article className="mnx-cofre-speech">
                <span className="mnx-cofre-speaker-label">
                  Comandante Suma explica
                </span>

                <p aria-live="polite">
                  {introAudioStatus === "idle"
                    ? INTRO_INITIAL_TEXT
                    : INTRO_FULL_TEXT}
                </p>

                <div className="mnx-cofre-audio-controls">
                  <audio
                    ref={introAudioRef}
                    src={INTRO_AUDIO_SRC ?? undefined}
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
                    onClick={playIntroAudio}
                    disabled={
                      !INTRO_AUDIO_SRC ||
                      introAudioStatus === "playing"
                    }
                    aria-label="Reproducir instrucción de Suma"
                  >
                    <FiPlay />
                  </button>

                  <button
                    type="button"
                    onClick={pauseIntroAudio}
                    disabled={introAudioStatus !== "playing"}
                    aria-label="Pausar instrucción de Suma"
                  >
                    <FiPause />
                  </button>

                  <button
                    type="button"
                    onClick={restartIntroAudio}
                    disabled={!INTRO_AUDIO_SRC}
                    aria-label="Repetir instrucción de Suma"
                  >
                    <FiRotateCcw />
                  </button>

                  <span
                    className={`mnx-cofre-audio-status ${
                      introAudioStatus === "playing"
                        ? "mnx-cofre-audio-playing"
                        : ""
                    }`}
                  >
                    <FiVolume2 />
                    {introStatusText}
                  </span>
                </div>
              </article>

              <div className="mnx-cofre-hero-stage">
                <CharacterMedia
                  key={
                    introAudioStatus === "playing"
                      ? "suma-talking"
                      : "suma-idle"
                  }
                  media={currentIntroCharacter}
                />
              </div>
            </div>
          </header>

          <section className="mnx-cofre-activity-grid">
            <article className="mnx-cofre-art">
              <div className="mnx-cofre-chest-visual">
                <img
                  key={chestPhase}
                  className="mnx-cofre-chest-animation"
                  src={currentChestAnimation}
                  alt="Animación del Cofre de Bienvenida"
                  draggable={false}
                />
              </div>

              <div className="mnx-cofre-mission">
                <FiZap />
                <div>
                  <strong>Energía del cofre</strong>
                  <div className="mnx-cofre-energy-track">
                    <b style={{ width: `${energy}%` }} />
                  </div>
                  <p>
                    {energy}% cargado · cada respuesta agrega 50%.
                  </p>
                </div>
              </div>
            </article>

            <section className="mnx-cofre-guide-card">
              <div className="mnx-cofre-section-heading">
                <span>↔</span>
                <div>
                  <strong>Guía visual rápida</strong>
                  <p>
                    La escritura cambia, pero la cantidad se mantiene.
                  </p>
                </div>
              </div>

              <div className="mnx-cofre-guide-grid">
                <article>
                  <p>
                    <strong>1/2</strong> es la mitad de la barra.
                  </p>
                  <div className="mnx-cofre-demo-row">
                    <span className="mnx-cofre-demo-bar mnx-cofre-demo-half">
                      <i />
                      <b />
                    </span>
                    <em>=</em>
                    <strong>0.5</strong>
                  </div>
                </article>

                <article>
                  <p>
                    <strong>0.25</strong> es una de cuatro partes.
                  </p>
                  <div className="mnx-cofre-demo-row">
                    <span className="mnx-cofre-demo-bar mnx-cofre-demo-quarter">
                      <i />
                      <b />
                      <b />
                      <b />
                    </span>
                    <em>=</em>
                    <Fraction top="1" bottom="4" />
                  </div>
                </article>
              </div>
            </section>

            <section className="mnx-cofre-questions">
              <article className="mnx-cofre-question-card">
                <div className="mnx-cofre-question-title">
                  <span>1</span>
                  <h2>
                    La batería está cargada a 1/2. ¿Cuál es su
                    equivalente decimal?
                  </h2>
                </div>

                <div className="mnx-cofre-options">
                  <button
                    type="button"
                    className={answerClass("q1", "a")}
                    onClick={() => selectAnswer("q1", "a")}
                    disabled={guardandoProgreso}
                  >
                    <span>A</span>
                    <strong>0.2</strong>
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q1", "b")}
                    onClick={() => selectAnswer("q1", "b")}
                    disabled={guardandoProgreso}
                  >
                    <span>B</span>
                    <strong>1.5</strong>
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q1", "c")}
                    onClick={() => selectAnswer("q1", "c")}
                    disabled={guardandoProgreso}
                  >
                    <span>C</span>
                    <strong>0.5</strong>
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q1", "d")}
                    onClick={() => selectAnswer("q1", "d")}
                    disabled={guardandoProgreso}
                  >
                    <span>D</span>
                    <strong>2.0</strong>
                    <i><FiCheck /></i>
                  </button>
                </div>
              </article>

              <article className="mnx-cofre-question-card">
                <div className="mnx-cofre-question-title">
                  <span>2</span>
                  <h2>
                    El sistema muestra 0.25 de energía. ¿Cuál es la
                    fracción equivalente?
                  </h2>
                </div>

                <div className="mnx-cofre-options">
                  <button
                    type="button"
                    className={answerClass("q2", "a")}
                    onClick={() => selectAnswer("q2", "a")}
                    disabled={guardandoProgreso}
                  >
                    <span>A</span>
                    <Fraction top="1" bottom="2" />
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q2", "b")}
                    onClick={() => selectAnswer("q2", "b")}
                    disabled={guardandoProgreso}
                  >
                    <span>B</span>
                    <Fraction top="4" bottom="1" />
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q2", "c")}
                    onClick={() => selectAnswer("q2", "c")}
                    disabled={guardandoProgreso}
                  >
                    <span>C</span>
                    <Fraction top="2" bottom="5" />
                    <i><FiCheck /></i>
                  </button>

                  <button
                    type="button"
                    className={answerClass("q2", "d")}
                    onClick={() => selectAnswer("q2", "d")}
                    disabled={guardandoProgreso}
                  >
                    <span>D</span>
                    <Fraction top="1" bottom="4" />
                    <i><FiCheck /></i>
                  </button>
                </div>
              </article>
            </section>

            <section className="mnx-cofre-reminder-card">
              <CharacterMedia media={currentGuideCharacter} />
              <div>
                <span className="mnx-cofre-help-label">
                  Consejo de Suma
                </span>
                <h3>Busca la misma cantidad</h3>
                <SumaGuideAudio
                  onStatusChange={setGuideAudioStatus}
                />
              </div>
            </section>

            <aside className="mnx-cofre-actions">
              <article className="mnx-cofre-evidence-card">
                <FiInfo />
                <div>
                  <strong>Evidencia guardada</strong>
                  <p>
                    Tus respuestas quedarán disponibles en
                    Retroalimentación.
                  </p>
                </div>
              </article>

              <button
                type="button"
                className="mnx-cofre-check-button"
                onClick={comprobar}
                disabled={guardandoProgreso}
                aria-busy={guardandoProgreso}
              >
                <FiCheck />
                {guardandoProgreso
                  ? "Guardando progreso..."
                  : "Comprobar respuestas"}
                <span>{progress}/2 listas</span>
              </button>
            </aside>
          </section>

          <section className="mnx-cofre-stats">
            <article>
              <FiFlag />
              <div>
                <span>Respuestas</span>
                <strong>{progress}/2</strong>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <span>Intentos</span>
                <strong>{attempts}/3</strong>
              </div>
            </article>

            <article>
              <FiZap />
              <div>
                <span>Energía del cofre</span>
                <strong>{energy}%</strong>
              </div>
            </article>

            <article>
              <span className="mnx-cofre-xp-star">★</span>
              <div>
                <span>Recompensa</span>
                <strong>40 XP</strong>
              </div>
            </article>
          </section>
        </section>
      </section>

      <FloatingByteHint />

      <button
        className="mnx-cofre-logout"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {resultModalOpen && (
        <ResultModal
          kind={resultModalKind}
          nextRoute={radarRoute}
          retryRoute={cofreRoute}
          onClose={cerrarResultado}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}