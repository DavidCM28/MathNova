import "./CofreBienvenida.css";
import audioIntroSuma from "../../../assets/mathnumbers/01-cofre-bienvenida/intro_suma.mp3";
import audioPistaByte from "../../../assets/mathnumbers/01-cofre-bienvenida/pista_byte.mp3";
import audioConsejoSuma from "../../../assets/mathnumbers/01-cofre-bienvenida/consejo_suma.mp3";
import bytePista from "../../../assets/mathGeometry/actividad1/byte-pista.png";
import videoBytePistas from "../../../assets/mathGeometry/actividad1/byte_aciertos_y_pistas_MathGeometry.mp4";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiBookOpen,
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
  FiZap,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { guardarProgresoActividad } from "../../../services/progresoService";
import {
  chestFall,
  chestVib,
  cofreGuide,
  cofreHero,
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

type AudioControlsProps = {
  src: string | null;
  characterName: string;
  compact?: boolean;
};

const correctAnswers: Record<QuestionKey, AnswerValue> = {
  q1: "b",
  q2: "b",
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
   2.1 TEXTO SINCRONIZADO CON EL AUDIO DE INTRODUCCIÓN
   =========================================================
   IMPORTANTE:
   - Cambia las frases de INTRO_SCRIPT para que coincidan con
     lo que dice exactamente el audio intro_suma.mp3.
   - No necesitas escribir tiempos manuales: cada frase recibe
     una parte de la duración total del audio según su longitud.
*/
const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la instrucción del Comandante Suma.";

const INTRO_SCRIPT = [
  "¡Hola, explorador de MathNova!",
  "Observa la guía visual y compara las cantidades antes de responder.",
  "Elige una respuesta en cada pregunta para llenar la energía del cofre.",
  "¡Vamos a comenzar la misión!",
];

const INTRO_FINAL_TEXT =
  INTRO_SCRIPT[INTRO_SCRIPT.length - 1];

/*
  Controla la rapidez con la que aparecen las letras dentro de
  cada frase. Sube el valor para escribir más rápido.
*/
const INTRO_TEXT_SPEED = 1.45;

function getIntroTypedState(
  currentTime: number,
  duration: number,
) {
  const safeDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : 14;

  const weights = INTRO_SCRIPT.map((text) =>
    Math.max(1, text.length),
  );
  const totalWeight = weights.reduce(
    (total, weight) => total + weight,
    0,
  );

  let accumulatedStart = 0;

  for (let index = 0; index < INTRO_SCRIPT.length; index += 1) {
    const text = INTRO_SCRIPT[index];
    const lineDuration =
      (weights[index] / totalWeight) * safeDuration;
    const accumulatedEnd = accumulatedStart + lineDuration;

    if (
      currentTime >= accumulatedStart &&
      currentTime < accumulatedEnd
    ) {
      const naturalProgress = Math.min(
        1,
        Math.max(
          0,
          (currentTime - accumulatedStart) / lineDuration,
        ),
      );

      const textProgress = Math.min(
        1,
        naturalProgress * INTRO_TEXT_SPEED,
      );

      const visibleCharacters = Math.max(
        1,
        Math.ceil(text.length * textProgress),
      );

      return {
        text: text.slice(0, visibleCharacters),
        index,
      };
    }

    accumulatedStart = accumulatedEnd;
  }

  return {
    text: INTRO_FINAL_TEXT,
    index: INTRO_SCRIPT.length - 1,
  };
}



/* =========================================================
   2.2 TEXTO SINCRONIZADO CON EL CONSEJO DE SUMA
   =========================================================
   El audio debe estar en:
   client/src/assets/mathnumbers/01-cofre-bienvenida/consejo_suma.mp3
*/
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

const SUMA_GUIDE_FINAL_TEXT =
  SUMA_GUIDE_SCRIPT[SUMA_GUIDE_SCRIPT.length - 1];

const SUMA_GUIDE_TEXT_SPEED = 1.45;

function getSumaGuideTypedState(
  currentTime: number,
  duration: number,
) {
  const safeDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : 19;

  const weights = SUMA_GUIDE_SCRIPT.map((line) =>
    Math.max(1, line.length),
  );

  const totalWeight = weights.reduce(
    (total, weight) => total + weight,
    0,
  );

  let accumulatedStart = 0;

  for (
    let index = 0;
    index < SUMA_GUIDE_SCRIPT.length;
    index += 1
  ) {
    const line = SUMA_GUIDE_SCRIPT[index];

    const lineDuration =
      (weights[index] / totalWeight) * safeDuration;

    const accumulatedEnd =
      accumulatedStart + lineDuration;

    if (
      currentTime >= accumulatedStart &&
      currentTime < accumulatedEnd
    ) {
      const naturalProgress = Math.min(
        1,
        Math.max(
          0,
          (currentTime - accumulatedStart) /
            lineDuration,
        ),
      );

      const textProgress = Math.min(
        1,
        naturalProgress * SUMA_GUIDE_TEXT_SPEED,
      );

      const visibleCharacters = Math.max(
        1,
        Math.ceil(line.length * textProgress),
      );

      return {
        text: line.slice(0, visibleCharacters),
        index,
      };
    }

    accumulatedStart = accumulatedEnd;
  }

  return {
    text: SUMA_GUIDE_FINAL_TEXT,
    index: SUMA_GUIDE_SCRIPT.length - 1,
  };
}

/* =========================================================
   2.2 TEXTO SINCRONIZADO CON LA PISTA DE BYTE
   =========================================================
   El audio debe estar en:
   client/src/assets/mathnumbers/01-cofre-bienvenida/pista_byte.mp3

   La voz puede pronunciar "cero punto veinticinco", mientras
   que el texto visual muestra "0.25".
*/
const BYTE_HINT_INITIAL_TEXT =
  "Presiona reproducir para escuchar la pista de Byte.";

const BYTE_HINT_SCRIPT = [
  "¡Hola, explorador!",
  "Si ves 0.25, imagina una barra completa dividida en cuatro partes iguales.",
  "Ahora piensa cuántas de esas partes representa el decimal.",
  "Observa las fracciones y busca la que muestre la misma cantidad.",
  "¡Tú puedes encontrarla!",
];

const BYTE_HINT_FINAL_TEXT =
  BYTE_HINT_SCRIPT[BYTE_HINT_SCRIPT.length - 1];

const BYTE_HINT_TEXT_SPEED = 1.45;

function getByteHintTypedState(
  currentTime: number,
  duration: number,
) {
  const safeDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : 17;

  const weights = BYTE_HINT_SCRIPT.map((line) =>
    Math.max(1, line.length),
  );

  const totalWeight = weights.reduce(
    (total, weight) => total + weight,
    0,
  );

  let accumulatedStart = 0;

  for (
    let index = 0;
    index < BYTE_HINT_SCRIPT.length;
    index += 1
  ) {
    const line = BYTE_HINT_SCRIPT[index];

    const lineDuration =
      (weights[index] / totalWeight) * safeDuration;

    const accumulatedEnd =
      accumulatedStart + lineDuration;

    if (
      currentTime >= accumulatedStart &&
      currentTime < accumulatedEnd
    ) {
      const naturalProgress = Math.min(
        1,
        Math.max(
          0,
          (currentTime - accumulatedStart) /
            lineDuration,
        ),
      );

      const textProgress = Math.min(
        1,
        naturalProgress * BYTE_HINT_TEXT_SPEED,
      );

      const visibleCharacters = Math.max(
        1,
        Math.ceil(line.length * textProgress),
      );

      return {
        text: line.slice(0, visibleCharacters),
        index,
      };
    }

    accumulatedStart = accumulatedEnd;
  }

  return {
    text: BYTE_HINT_FINAL_TEXT,
    index: BYTE_HINT_SCRIPT.length - 1,
  };
}

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

    return esClaro && casiSinColor;
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

function ByteBlinkMedia() {
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

    /*
     * La proporción del canvas coincide con el espacio actual
     * de .mnx-cofre-help-character: 76 x 98.
     */
    const canvasWidth = 304;
    const canvasHeight = 392;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarFrame = () => {
      if (video.readyState < 2) {
        return;
      }

      ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight,
      );

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

    const dibujarAnimacion = (tiempo: number) => {
      if (
        tiempo - ultimoDibujo >= 50 &&
        video.readyState >= 2
      ) {
        dibujarFrame();
        ultimoDibujo = tiempo;
      }

      animationFrame =
        window.requestAnimationFrame(dibujarAnimacion);
    };

    const prepararByte = () => {
      dibujarFrame();
      setVideoReady(true);

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      video.play().catch((error) => {
        console.error(
          "No se pudo reproducir la animación de Byte:",
          error,
        );
      });
    };

    video.addEventListener("loadeddata", prepararByte);

    if (video.readyState >= 2) {
      prepararByte();
    }

    animationFrame =
      window.requestAnimationFrame(dibujarAnimacion);

    return () => {
      video.removeEventListener(
        "loadeddata",
        prepararByte,
      );

      window.cancelAnimationFrame(animationFrame);
      video.pause();
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={videoBytePistas}
        muted
        loop
        playsInline
        preload="auto"
        autoPlay
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
          className={HINT_CHARACTER.className}
          src={HINT_CHARACTER.src}
          alt={HINT_CHARACTER.alt}
          draggable={false}
        />
      )}

      <canvas
        ref={canvasRef}
        className="mnx-cofre-help-character"
        role="img"
        aria-label="Byte parpadeando y ofreciendo una pista"
        style={{
          display: videoReady ? "block" : "none",
        }}
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

function AudioControls({
  src,
  characterName,
  compact = false,
}: AudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const hasAudio = Boolean(src);

  const playAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !hasAudio) {
      return;
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      console.error(`No se pudo reproducir el audio de ${characterName}:`, error);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !hasAudio) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      console.error(`No se pudo reiniciar el audio de ${characterName}:`, error);
    }
  };

  const statusText = !hasAudio
    ? "Audio pendiente"
    : status === "playing"
      ? "Reproduciendo"
      : status === "paused"
        ? "Pausado"
        : status === "ended"
          ? "Finalizado"
          : "Listo para escuchar";

  return (
    <div
      className={`mnx-cofre-audio-controls ${
        compact ? "mnx-cofre-audio-compact" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={src ?? undefined}
        preload="metadata"
        onPlay={() => setStatus("playing")}
        onPause={() => {
          if (audioRef.current?.ended) {
            return;
          }

          setStatus("paused");
        }}
        onEnded={() => setStatus("ended")}
      />

      <button
        type="button"
        onClick={playAudio}
        disabled={!hasAudio || status === "playing"}
        aria-label={`Reproducir audio de ${characterName}`}
      >
        <FiPlay />
      </button>

      <button
        type="button"
        onClick={pauseAudio}
        disabled={!hasAudio || status !== "playing"}
        aria-label={`Pausar audio de ${characterName}`}
      >
        <FiPause />
      </button>

      <button
        type="button"
        onClick={restartAudio}
        disabled={!hasAudio}
        aria-label={`Repetir audio de ${characterName}`}
      >
        <FiRotateCcw />
      </button>

      <span
        className={`mnx-cofre-audio-status ${
          status === "playing" ? "mnx-cofre-audio-playing" : ""
        }`}
      >
        <FiVolume2 />
        {statusText}
      </span>
    </div>
  );
}



function SumaGuideAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] =
    useState<AudioStatus>("idle");

  const [text, setText] = useState(
    SUMA_GUIDE_INITIAL_TEXT,
  );

  const playAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !GUIDE_AUDIO_SRC) {
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
      setText("");
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");

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
    setStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !GUIDE_AUDIO_SRC) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setText("");

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");

      console.error(
        "No se pudo reiniciar el consejo de Suma:",
        error,
      );
    }
  };

  const updateTypedText = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const typedState = getSumaGuideTypedState(
      audio.currentTime,
      audio.duration,
    );

    setText(typedState.text);
  };

  const finishAudio = () => {
    setStatus("ended");
    setText(SUMA_GUIDE_FINAL_TEXT);
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
        {text}

        {status === "playing" && (
          <span
            className="mnx-cofre-typing-cursor"
            aria-hidden="true"
          />
        )}
      </p>

      <div className="mnx-cofre-audio-controls mnx-cofre-audio-compact">
        <audio
          ref={audioRef}
          src={GUIDE_AUDIO_SRC ?? undefined}
          preload="metadata"
          onPlay={() => setStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              setStatus("paused");
            }
          }}
          onTimeUpdate={updateTypedText}
          onEnded={finishAudio}
        />

        <button
          type="button"
          onClick={playAudio}
          disabled={
            !GUIDE_AUDIO_SRC || status === "playing"
          }
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

function ByteHintAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] =
    useState<AudioStatus>("idle");

  const [text, setText] = useState(
    BYTE_HINT_INITIAL_TEXT,
  );

  const playAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
      setText("");
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

  const pauseAudio = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setText("");

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");

      console.error(
        "No se pudo reiniciar la pista de Byte:",
        error,
      );
    }
  };

  const updateTypedText = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const typedState = getByteHintTypedState(
      audio.currentTime,
      audio.duration,
    );

    setText(typedState.text);
  };

  const finishAudio = () => {
    setStatus("ended");
    setText(BYTE_HINT_FINAL_TEXT);
  };

  const statusText =
    status === "playing"
      ? "Byte está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Pista completada"
          : "Listo para escuchar";

  return (
    <>
      <p aria-live="polite">
        {text}

        {status === "playing" && (
          <span
            className="mnx-cofre-typing-cursor"
            aria-hidden="true"
          />
        )}
      </p>

      <div className="mnx-cofre-audio-controls mnx-cofre-audio-compact">
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
          onTimeUpdate={updateTypedText}
          onEnded={finishAudio}
        />

        <button
          type="button"
          onClick={playAudio}
          disabled={
            !HINT_AUDIO_SRC || status === "playing"
          }
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
    </>
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
 const [resultModalOpen, setResultModalOpen] = useState(false); 
  /* =======================================================
     AUDIO DE INTRODUCCIÓN + TEXTO ESCRITO POCO A POCO
     ======================================================= */
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");
  const currentIntroCharacter =
  introAudioStatus === "playing"
    ? INTRO_CHARACTER_TALKING
    : INTRO_CHARACTER_IDLE;
  const [introText, setIntroText] = useState(
    INTRO_INITIAL_TEXT,
  );

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
      setIntroText("");
    }

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
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
    setIntroText("");

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      console.error(
        "No se pudo reiniciar el audio de introducción:",
        error,
      );
    }
  };

  const updateIntroTypedText = () => {
    const audio = introAudioRef.current;

    if (!audio) {
      return;
    }

    const typedState = getIntroTypedState(
      audio.currentTime,
      audio.duration,
    );

    setIntroText(typedState.text);
  };

  const finishIntroAudio = () => {
    setIntroAudioStatus("ended");
    setIntroText(INTRO_FINAL_TEXT);
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

  const comprobar = async () => {
    if (progress !== 2) {
      showToast(
        "Selecciona una respuesta en cada pregunta para abrir el cofre.",
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

    setChecked(true);
    setSolved(total === 2);

    // 1. Obtener el ID de usuario desde la sesión
    let idUsuario = 17; // ID por defecto
    try {
      const sessionString = localStorage.getItem("auth_session");
      if (sessionString) {
        const session = JSON.parse(sessionString);
        if (session && session.id_usuario) idUsuario = Number(session.id_usuario);
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Determinar las estrellas de la partida actual
    const nuevasEstrellas = total === 2 ? 3 : total === 1 ? 1 : 0;
    const esCorrecto = total === 2;

    // 3. Estructurar el Payload para enviar al backend
    const payload = {
      id_usuario: idUsuario,
      mundo: "MathNumbers",
      tema: "Fracciones y decimales",
      actividad_codigo: "mathnumbers-cofre-bienvenida",
      actividad_titulo: "El Cofre de Bienvenida",
      respuestas: answers as Record<string, unknown>,
      aciertos: total,
      total_preguntas: 2,
      estrellas_obtenidas: nuevasEstrellas,
      xp_obtenido: total * 25,
      completada: esCorrecto,
      tiempo_segundos: 0,
      xp_base: 50
    };

    try {
      // 4. Verificar si ya tenía estrellas ganadas localmente
      const progresoKey = `progreso_${idUsuario}_cofre-bienvenida`;
      const progresoPrevioRaw = localStorage.getItem(progresoKey);
      let yaTeniaEstrellas = false;
      let estrellasAnteriores = 0;

      if (progresoPrevioRaw) {
        const progresoPrevio = JSON.parse(progresoPrevioRaw);
        estrellasAnteriores = progresoPrevio.estrellas_obtenidas || 0;
        yaTeniaEstrellas = estrellasAnteriores > 0;
      }

      // Guardamos en PostgreSQL
      await guardarProgresoActividad(payload);

      // Guardamos localmente el máximo de estrellas obtenidas
      localStorage.setItem(
        progresoKey,
        JSON.stringify({ estrellas_obtenidas: Math.max(estrellasAnteriores, nuevasEstrellas) })
      );

      /*
       * Si las dos respuestas son correctas, redirige directamente
       * a la pantalla de actividad completada.
       */
      if (total === 2) {
        if (yaTeniaEstrellas) {
          showToast(
            `¡Increíble! Has vuelto a abrir el cofre. Ya cuentas con las ${estrellasAnteriores} ⭐ de esta bienvenida en tu perfil.`,
            false
          );
        } else {
          showToast(`¡Perfecto! El cofre se iluminó. ¡Has ganado ${nuevasEstrellas} estrellas! ⭐`);
        }

        window.setTimeout(() => {
          navigate(
            "/actividades/mathnumbers/actividad-completada",
            {
              state: {
                activity: "cofre-bienvenida",
                retryRoute: cofreRoute,
                nextRoute: radarRoute,
              },
            },
          );
        }, 1300); // 1.3 segundos para que lea la tostada perfectamente

        return;
      }

      // Flujo original si no están todas correctas
      showToast(
        total === 1
          ? "Vas cerca: una respuesta está correcta."
          : "Revisa las respuestas e inténtalo otra vez.",
        true,
      );

      window.setTimeout(() => {
        navigate(
          total === 1
            ? "/actividades/mathnumbers/casi-lo-logras"
            : "/actividades/mathnumbers/vuelve-a-intentarlo",
          {
            state: {
              activity: "cofre-bienvenida",
              retryRoute: cofreRoute,
              nextRoute: radarRoute,
            },
          },
        );
      }, 1100);

    } catch (error) {
      console.error(error);
      showToast("Error de conexión: No se pudo verificar tu progreso.", true);
    }
  };

  return (
    <main
      className={`mnx-cofre-page ${
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
          <div className="mnx-cofre-breadcrumb">
            <button
              type="button"
              onClick={() => irARuta("/seleccion-mundos")}
            >
              Mundos
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => irARuta(activityListRoute)}
            >
              MathNumbers
            </button>
            <span>›</span>
            <button
              type="button"
              className="mnx-cofre-breadcrumb-current"
            >
              Actividad 1
            </button>
          </div>

          <header className="mnx-cofre-topbar">
            <div className="mnx-cofre-title-area">
              <div className="mnx-cofre-title-row">
                <img
                  src={cofreTitleChest}
                  alt=""
                  aria-hidden="true"
                />
                <h1>El Cofre de Bienvenida</h1>
              </div>

              <p>
                Descubre cómo una fracción y un decimal pueden
                representar exactamente la misma cantidad.
              </p>

              <div className="mnx-cofre-pills">
                <span>Introducción</span>
                <span>5–8 min</span>
                <span>2 preguntas</span>
                <span>+40 XP</span>
              </div>
            </div>

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
                Salir
              </button>
            </div>
          </header>

          <section className="mnx-cofre-intro">
            <div className="mnx-cofre-intro-stage">
              {/*
                CAMBIAR PERSONAJE PRINCIPAL:
                Edita INTRO_CHARACTER al inicio del archivo.
                Cambia su tamaño en .mnx-cofre-intro-character.
              */}
              <CharacterMedia
                key={
                  introAudioStatus === "playing"
                    ? "suma-talking"
                    : "suma-idle"
                }
                media={currentIntroCharacter}
              />
              <div className="mnx-cofre-character-shadow" />
            </div>

            <article className="mnx-cofre-speech-cloud">
              <div className="mnx-cofre-speech-copy">
                <span className="mnx-cofre-speaker-label">
                  Comandante Suma explica
                </span>

                {/*
                  TEXTO DE LA INTRODUCCIÓN:
                  - Al entrar muestra INTRO_INITIAL_TEXT.
                  - Al reproducir el audio se escribe poco a poco.
                  - Cambia el guion en INTRO_SCRIPT al inicio.
                */}
                <p
                  className="mnx-cofre-intro-instruction"
                  aria-live="polite"
                >
                  {introText}
                  {introAudioStatus === "playing" && (
                    <span
                      className="mnx-cofre-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
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
                    onTimeUpdate={updateIntroTypedText}
                    onEnded={finishIntroAudio}
                  />

                  <button
                    type="button"
                    onClick={playIntroAudio}
                    disabled={
                      !INTRO_AUDIO_SRC ||
                      introAudioStatus === "playing"
                    }
                    aria-label="Reproducir instrucción del Comandante Suma"
                  >
                    <FiPlay />
                  </button>

                  <button
                    type="button"
                    onClick={pauseIntroAudio}
                    disabled={introAudioStatus !== "playing"}
                    aria-label="Pausar instrucción del Comandante Suma"
                  >
                    <FiPause />
                  </button>

                  <button
                    type="button"
                    onClick={restartIntroAudio}
                    disabled={!INTRO_AUDIO_SRC}
                    aria-label="Repetir instrucción del Comandante Suma"
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
              </div>

              <div className="mnx-cofre-speech-decoration">
                <span>1/2</span>
                <b>=</b>
                <span>0.5</span>
                <small>¡Dos formas, la misma cantidad!</small>
              </div>
            </article>
          </section>

          <section className="mnx-cofre-layout">
            <section className="mnx-cofre-board">
              <div className="mnx-cofre-board-heading">
                <div>
                  <span className="mnx-cofre-board-icon">
                    <FiBookOpen />
                  </span>

                  <div>
                    <strong>Misión del cofre</strong>
                    <p>
                      Completa las dos preguntas para llenar su
                      energía al 100%.
                    </p>
                  </div>
                </div>

                <span className="mnx-cofre-mission-state">
                  <i /> Misión activa
                </span>
              </div>

              <div className="mnx-cofre-activity-grid">
                <article className="mnx-cofre-chest-card">
                  <div className="mnx-cofre-chest-head">
                    <span>Cofre de bienvenida</span>
                    <b>{energy}% energía</b>
                  </div>

                  <div className="mnx-cofre-chest-stage">
                    {/*
                      CAMBIAR ANIMACIONES DEL COFRE:
                      Modifica chestFall/chestVib en mathNumbersAssets.ts.
                      El tamaño se controla en
                      .mnx-cofre-chest-animation.
                    */}
                    <img
                      key={chestPhase}
                      className="mnx-cofre-chest-animation"
                      src={currentChestAnimation}
                      alt="Animación del Cofre de Bienvenida"
                      draggable={false}
                    />
                  </div>

                  <div className="mnx-cofre-energy-panel">
                    <div className="mnx-cofre-energy-title">
                      <FiZap />
                      <strong>Energía del cofre</strong>
                      <span>{energy}%</span>
                    </div>

                    <div className="mnx-cofre-energy-track">
                      <b style={{ width: `${energy}%` }} />
                    </div>

                    <small>
                      Cada respuesta seleccionada agrega 50% de
                      energía.
                    </small>
                  </div>
                </article>

                <div className="mnx-cofre-learning-area">
                  <section className="mnx-cofre-guide-card">
                    <div className="mnx-cofre-section-heading">
                      <span>✦</span>
                      <div>
                        <strong>Guía visual rápida</strong>
                        <p>
                          Mira cómo cambia la escritura, pero no la
                          cantidad.
                        </p>
                      </div>
                    </div>

                    <div className="mnx-cofre-guide-grid">
                      <article>
                        <p>
                          <strong>1/2</strong> es la mitad de la
                          barra.
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
                          <strong>0.25</strong> es una de cuatro
                          partes.
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
                          La batería está cargada a 1/2. ¿Cuál es
                          su equivalente decimal?
                        </h2>
                      </div>

                      <div className="mnx-cofre-options">
                        <button
                          type="button"
                          className={answerClass("q1", "a")}
                          onClick={() => selectAnswer("q1", "a")}
                        >
                          <span>A</span>
                          <strong>0.2</strong>
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q1", "b")}
                          onClick={() => selectAnswer("q1", "b")}
                        >
                          <span>B</span>
                          <strong>0.5</strong>
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q1", "c")}
                          onClick={() => selectAnswer("q1", "c")}
                        >
                          <span>C</span>
                          <strong>1.5</strong>
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q1", "d")}
                          onClick={() => selectAnswer("q1", "d")}
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
                          El sistema muestra 0.25 de energía. ¿Cuál
                          es la fracción equivalente?
                        </h2>
                      </div>

                      <div className="mnx-cofre-options">
                        <button
                          type="button"
                          className={answerClass("q2", "a")}
                          onClick={() => selectAnswer("q2", "a")}
                        >
                          <span>A</span>
                          <Fraction top="1" bottom="2" />
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q2", "b")}
                          onClick={() => selectAnswer("q2", "b")}
                        >
                          <span>B</span>
                          <Fraction top="1" bottom="4" />
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q2", "c")}
                          onClick={() => selectAnswer("q2", "c")}
                        >
                          <span>C</span>
                          <Fraction top="2" bottom="5" />
                          <i><FiCheck /></i>
                        </button>

                        <button
                          type="button"
                          className={answerClass("q2", "d")}
                          onClick={() => selectAnswer("q2", "d")}
                        >
                          <span>D</span>
                          <Fraction top="4" bottom="1" />
                          <i><FiCheck /></i>
                        </button>
                      </div>
                    </article>
                  </section>
                </div>
              </div>
            </section>

            <aside className="mnx-cofre-help-panel">
              <article className="mnx-cofre-help-card mnx-cofre-guide-help">
                <CharacterMedia media={GUIDE_CHARACTER} />

                <div>
                  <span className="mnx-cofre-help-label">
                    Consejo de Suma
                  </span>
                  <h3>Busca la misma cantidad</h3>

                  <SumaGuideAudio />
                </div>
              </article>

              <article className="mnx-cofre-help-card mnx-cofre-byte-help">
                <ByteBlinkMedia />

                <div>
                  <span className="mnx-cofre-help-label">
                    Pista de Byte
                  </span>
                  <h3>Piensa en partes iguales</h3>

                  <ByteHintAudio />

                  <button
                    type="button"
                    className="mnx-cofre-hint-button"
                    onClick={() => irARuta(hintRoute)}
                  >
                    <FiHelpCircle />
                    Ver pista completa
                  </button>
                </div>
              </article>

              <article className="mnx-cofre-evidence-card">
                <FiInfo />
                <div>
                  <strong>Evidencia guardada</strong>
                  <p>
                    Tus respuestas quedan listas para revisarlas en
                    Retroalimentación.
                  </p>
                </div>
              </article>
            </aside>
          </section>

          <section className="mnx-cofre-check-zone">
            <button
              type="button"
              className="mnx-cofre-check-button"
              onClick={comprobar}
            >
              <FiCheck />
              Comprobar respuestas
              <span>{progress}/2 listas</span>
            </button>
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

      <button
        className="mnx-cofre-logout"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      <Toast toast={toast} />
    </main>
  );
}