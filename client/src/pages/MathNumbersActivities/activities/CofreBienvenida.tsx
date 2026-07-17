import "./CofreBienvenida.css";
import audioIntroSuma from "../../../assets/mathnumbers/01-cofre-bienvenida/intro_suma.mp3";
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
import {
  chestFall,
  chestVib,
  cofreGuide,
  cofreHero,
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
const GUIDE_AUDIO_SRC: string | null = null;
const HINT_AUDIO_SRC: string | null = null;

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
   3. PERSONAJES Y ANIMACIONES QUE HABLAN
   =========================================================
   Para cambiar un personaje:
   - Cambia src por la imagen/WebP/video nuevo.
   - Usa kind: "image" para PNG, GIF o WebP animado.
   - Usa kind: "video" para MP4 o WebM.
   - El tamaño visual se cambia en las clases CSS indicadas.
*/
const INTRO_CHARACTER: CharacterMediaConfig = {
  src: cofreHero,
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
  src: cofreGuide,
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

  /* =======================================================
     AUDIO DE INTRODUCCIÓN + TEXTO ESCRITO POCO A POCO
     ======================================================= */
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");
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

  const comprobar = () => {
    if (progress !== 2) {
      showToast(
        "Selecciona una respuesta en cada pregunta para activar el cofre.",
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

    setAttempts((current) => Math.min(3, current + 1));
    setChecked(true);
    setSolved(total === 2);

    if (total === 2) {
      showToast(
        "¡Excelente! La energía matemática abrió el cofre.",
      );

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
      }, 1100);

      return;
    }

    showToast(
      total === 1
        ? "¡Vas muy bien! Una respuesta ya está correcta."
        : "La señal se confundió. Observa la guía y prueba otra vez.",
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
          },
        },
      );
    }, 1300);
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
              <CharacterMedia media={INTRO_CHARACTER} />
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
                  <p>
                    Una fracción y un decimal pueden verse
                    diferentes y aun así representar lo mismo.
                  </p>

                  <AudioControls
                    src={GUIDE_AUDIO_SRC}
                    characterName="Comandante Suma"
                    compact
                  />
                </div>
              </article>

              <article className="mnx-cofre-help-card mnx-cofre-byte-help">
                <CharacterMedia media={HINT_CHARACTER} />

                <div>
                  <span className="mnx-cofre-help-label">
                    Pista de Byte
                  </span>
                  <h3>Piensa en partes iguales</h3>
                  <p>
                    Si ves 0.25, imagina una barra dividida en
                    cuatro partes iguales.
                  </p>

                  <AudioControls
                    src={HINT_AUDIO_SRC}
                    characterName="Byte"
                    compact
                  />

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