import "./EscuadronTactico.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSave,
  FiShield,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import audioConsejoSumaEscuadron from "../../../assets/mathnumbers/08-escuadron-tactico/consejo_suma_escuadron.mp3";
import audioIntroEscuadron from "../../../assets/mathnumbers/08-escuadron-tactico/intro_escuadron.mp3";
import comandanteSumaHablando from "../../../assets/mathnumbers/08-escuadron-tactico/comandante_suma_hablando.webp";
import comandanteSumaIdle from "../../../assets/mathnumbers/08-escuadron-tactico/comandante_suma_idle.png";
import escuadronAnimado from "../../../assets/mathnumbers/08-escuadron-tactico/escuadron.webp";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";

import { clearAuthSession } from "../../../utils/authSession";
import { guardarProgresoUsuarioActual } from "../../../services/progresoService";

import { activityListRoute } from "../constants";
import { ResultModal } from "../components/ResultModal";
import type { ResultKind } from "../types";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";

import {
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

const escuadronRoute =
  "/actividades/mathnumbers/escuadron-tactico";

const espejosBovedaRoute =
  "/actividades/mathnumbers/espejos-boveda";

const INTRO_AUDIO_SRC = audioIntroEscuadron;

const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la instrucción del Comandante Suma.";

const INTRO_CAPTIONS = [
  {
    start: 0,
    text: "Misión crítica, explorador:",
  },
  {
    start: 2.6,
    text:
      "Hay cables cruzados en el panel, y un error en la secuencia hará detonar la alarma.",
  },
] as const;

const INTRO_FULL_TEXT =
  "Misión crítica, explorador: Hay cables cruzados en el panel, y un error en la secuencia hará detonar la alarma.";

const GUIDE_AUDIO_SRC = audioConsejoSumaEscuadron;

const GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo del Comandante Suma.";

const GUIDE_FULL_TEXT =
  "Anota paso a paso cada operación resuelta en un papel para mantener el control táctico del circuito.";

type AudioStatus = "idle" | "playing" | "paused" | "ended";

type OperationKey =
  | "parentheses"
  | "multiplication"
  | "division"
  | "addition"
  | "subtraction";

type OperationOption = {
  key: OperationKey;
  symbol: string;
  name: string;
};

type SequenceChallengeProps = {
  number: number;
  title: string;
  expression: string;
  options: OperationOption[];
  selected: OperationKey[];
  onSelect: (operation: OperationKey) => void;
  onRemove: (index: number) => void;
  onReset: () => void;
  className?: string;
};

const operationNames: Record<OperationKey, string> = {
  parentheses: "Paréntesis",
  multiplication: "Multiplicación",
  division: "División",
  addition: "Suma",
  subtraction: "Resta",
};

const operationSymbols: Record<OperationKey, string> = {
  parentheses: "( )",
  multiplication: "×",
  division: "÷",
  addition: "+",
  subtraction: "−",
};

const challengeOneOptions: OperationOption[] = [
  {
    key: "parentheses",
    symbol: "( )",
    name: "Paréntesis",
  },
  {
    key: "multiplication",
    symbol: "×",
    name: "Multiplicación",
  },
  {
    key: "addition",
    symbol: "+",
    name: "Suma",
  },
];

const challengeTwoOptions: OperationOption[] = [
  {
    key: "division",
    symbol: "÷",
    name: "División",
  },
  {
    key: "subtraction",
    symbol: "−",
    name: "Resta",
  },
];

const challengeThreeOptions: OperationOption[] = [
  {
    key: "addition",
    symbol: "+",
    name: "Suma",
  },
  {
    key: "multiplication",
    symbol: "×",
    name: "Multiplicación",
  },
];

const correctChallengeOne: OperationKey[] = [
  "parentheses",
  "multiplication",
  "addition",
];

const correctChallengeTwo: OperationKey[] = [
  "division",
  "subtraction",
];

const correctChallengeThree: OperationKey[] = [
  "multiplication",
  "addition",
];

const arraysAreEqual = (
  first: OperationKey[],
  second: OperationKey[],
) =>
  first.length === second.length &&
  first.every((value, index) => value === second[index]);


function SequenceChallenge({
  number,
  title,
  expression,
  options,
  selected,
  onSelect,
  onRemove,
  onReset,
  className = "",
}: SequenceChallengeProps) {
  return (
    <section
      className={`mnx-escuadron-challenge-card ${className}`.trim()}
    >
      <div className="mnx-escuadron-challenge-head">
        <span>{number}</span>

        <div>
          <h2>{title}</h2>
          <p>Toca los cables en el orden correcto.</p>
        </div>

        <button
          type="button"
          className="mnx-escuadron-reset-mini"
          onClick={onReset}
          aria-label={`Reiniciar ${title}`}
          title="Reiniciar reto"
        >
          <FiRotateCcw />
        </button>
      </div>

      <div className="mnx-escuadron-expression">
        {expression}
      </div>

      <div className="mnx-escuadron-cable-options">
        {options.map((option) => {
          const alreadySelected = selected.includes(option.key);

          return (
            <button
              key={option.key}
              type="button"
              className={`mnx-escuadron-operation ${
                alreadySelected ? "is-selected" : ""
              }`}
              onClick={() => onSelect(option.key)}
              disabled={alreadySelected}
            >
              <span>{option.symbol}</span>
              <small>{option.name}</small>
            </button>
          );
        })}
      </div>

      <div className="mnx-escuadron-sequence">
        {options.map((_, index) => {
          const operation = selected[index];

          return (
            <button
              key={`slot-${number}-${index}`}
              type="button"
              className={`mnx-escuadron-sequence-slot ${
                operation ? "is-filled" : ""
              }`}
              onClick={() => operation && onRemove(index)}
              aria-label={
                operation
                  ? `Quitar ${operationNames[operation]}`
                  : `Posición ${index + 1} vacía`
              }
            >
              {operation ? (
                <>
                  <strong>
                    {operationSymbols[operation]}
                  </strong>
                  <small>{operationNames[operation]}</small>
                </>
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HelpModal({
  onClose,
}: {
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [onClose]);

  return (
    <div
      className="mnx-escuadron-help-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="mnx-escuadron-help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mnx-escuadron-help-title"
      >
        <button
          type="button"
          className="mnx-escuadron-help-close"
          onClick={onClose}
          aria-label="Cerrar ayuda"
        >
          <FiX />
        </button>

        <div className="mnx-escuadron-help-character">
          <img src={bytePista} alt="Byte ofreciendo una pista" />
        </div>

        <div className="mnx-escuadron-help-copy">
          <span>Pista de Byte</span>

          <h2 id="mnx-escuadron-help-title">
            Sigue la jerarquía de operaciones
          </h2>

          <p>
            Resuelve primero lo que está dentro de paréntesis.
            Después continúa con multiplicaciones o divisiones y,
            al final, realiza sumas o restas.
          </p>

          <div className="mnx-escuadron-help-order">
            <strong>1</strong>
            <span>Paréntesis</span>
            <b>→</b>
            <strong>2</strong>
            <span>Multiplicación o división</span>
            <b>→</b>
            <strong>3</strong>
            <span>Suma o resta</span>
          </div>

          <button
            type="button"
            className="mnx-escuadron-help-understood"
            onClick={onClose}
          >
            <FiCheckCircle />
            Entendido, continuar
          </button>
        </div>
      </section>
    </div>
  );
}

export function EscuadronTactico() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");
  const [introCaption, setIntroCaption] = useState(
    INTRO_INITIAL_TEXT,
  );
  const [guideAudioStatus, setGuideAudioStatus] =
    useState<AudioStatus>("idle");
  const [resultModalOpen, setResultModalOpen] =
    useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const [challengeOne, setChallengeOne] = useState<
    OperationKey[]
  >([]);

  const [challengeTwo, setChallengeTwo] = useState<
    OperationKey[]
  >([]);

  const [challengeThree, setChallengeThree] = useState<
    OperationKey[]
  >([]);

  const [explanation, setExplanation] = useState("");
  const [guardandoProgreso, setGuardandoProgreso] =
    useState(false);

  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const guideAudioRef = useRef<HTMLAudioElement | null>(null);
  const inicioActividadRef = useRef<number>(Date.now());
  const guardandoRef = useRef(false);
  const resultTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (helpOpen) {
      return;
    }

    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, helpOpen]);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current !== null) {
        window.clearTimeout(resultTimeoutRef.current);
      }

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
    };
  }, []);

  const selectedOperations = useMemo(
    () =>
      challengeOne.length +
      challengeTwo.length +
      challengeThree.length,
    [challengeOne, challengeTwo, challengeThree],
  );

  const actualizarTextoIntroduccion = () => {
    const audio = introAudioRef.current;

    if (!audio) {
      return;
    }

    const currentTime = audio.currentTime;

    const currentCaption = [...INTRO_CAPTIONS]
      .reverse()
      .find((caption) => currentTime >= caption.start);

    setIntroCaption(
      currentCaption?.text ?? INTRO_CAPTIONS[0].text,
    );
  };

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

    actualizarTextoIntroduccion();

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");
      console.error(
        "No se pudo reproducir la introducción de Escuadrón Táctico:",
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

    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    setIntroCaption(INTRO_CAPTIONS[0].text);

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");
      console.error(
        "No se pudo repetir la introducción de Escuadrón Táctico:",
        error,
      );
    }
  };

  const detenerIntroduccion = () => {
    const audio = introAudioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIntroAudioStatus("idle");
    setIntroCaption(INTRO_INITIAL_TEXT);
  };

  const introStatusText =
    introAudioStatus === "playing"
      ? "Suma está hablando"
      : introAudioStatus === "paused"
        ? "Audio en pausa"
        : introAudioStatus === "ended"
          ? "Instrucción completada"
          : "Listo para escuchar";

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
        "No se pudo reproducir el Consejo de Suma:",
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
        "No se pudo repetir el Consejo de Suma:",
        error,
      );
    }
  };

  const detenerConsejo = () => {
    const audio = guideAudioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setGuideAudioStatus("idle");
  };

  const guideStatusText =
    guideAudioStatus === "playing"
      ? "Suma está hablando"
      : guideAudioStatus === "paused"
        ? "Audio en pausa"
        : guideAudioStatus === "ended"
          ? "Consejo completado"
          : "Listo para escuchar";

  const irARuta = (route: string) => {
    detenerIntroduccion();
    detenerConsejo();
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
    detenerIntroduccion();
    detenerConsejo();
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const addOperation = (
    operation: OperationKey,
    current: OperationKey[],
    update: Dispatch<SetStateAction<OperationKey[]>>,
    limit: number,
  ) => {
    if (
      current.includes(operation) ||
      current.length >= limit
    ) {
      return;
    }

    update((previous) => [...previous, operation]);
  };

  const removeOperation = (
    index: number,
    update: Dispatch<SetStateAction<OperationKey[]>>,
  ) => {
    update((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const guardarExplicacion = () => {
    if (!explanation.trim()) {
      showToast(
        "Escribe una explicación antes de guardarla.",
        true,
      );
      return;
    }

    showToast("Explicación guardada correctamente.");
  };

  const limpiarTemporizadorResultado = () => {
    if (resultTimeoutRef.current !== null) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
  };

  const abrirModalResultado = (
    kind: ResultKind,
    delay = 900,
  ) => {
    limpiarTemporizadorResultado();

    resultTimeoutRef.current = window.setTimeout(() => {
      setResultModalKind(kind);
      setResultModalOpen(true);
      resultTimeoutRef.current = null;
    }, delay);
  };

  const repetirActividad = () => {
    limpiarTemporizadorResultado();

    guardandoRef.current = false;
    setGuardandoProgreso(false);
    setResultModalOpen(false);
    setResultModalKind("completed");
    setChallengeOne([]);
    setChallengeTwo([]);
    setChallengeThree([]);
    setExplanation("");

    inicioActividadRef.current = Date.now();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Sistema táctico reiniciado. ¡Desactiva la trampa nuevamente!",
    );
  };

  const verificar = async () => {
    if (guardandoRef.current) {
      return;
    }

    if (
      challengeOne.length < correctChallengeOne.length ||
      challengeTwo.length < correctChallengeTwo.length ||
      challengeThree.length < correctChallengeThree.length
    ) {
      showToast(
        "Completa la secuencia de los tres retos antes de comprobar.",
        true,
      );
      return;
    }

    const challengeOneCorrect = arraysAreEqual(
      challengeOne,
      correctChallengeOne,
    );

    const challengeTwoCorrect = arraysAreEqual(
      challengeTwo,
      correctChallengeTwo,
    );

    const challengeThreeCorrect = arraysAreEqual(
      challengeThree,
      correctChallengeThree,
    );

    const totalCorrect =
      Number(challengeOneCorrect) +
      Number(challengeTwoCorrect) +
      Number(challengeThreeCorrect);

    const completed = totalCorrect === 3;

    const tiempoSegundos = Math.max(
      1,
      Math.floor(
        (Date.now() - inicioActividadRef.current) / 1000,
      ),
    );

    guardandoRef.current = true;
    setGuardandoProgreso(true);

    try {
      const resultado =
        await guardarProgresoUsuarioActual({
          mundo: "MathNumbers",
          tema: "Tema 3: Jerarquía y propiedades",
          actividad_codigo:
            "mathnumbers-escuadron-tactico",
          actividad_titulo:
            "Escuadrón Táctico: Desactivación",
          aciertos: totalCorrect,
          total_preguntas: 3,
          tiempo_segundos: tiempoSegundos,
          xp_base: 45,
          completada: completed,
          respuestas: {
            reto_1: challengeOne,
            reto_2: challengeTwo,
            reto_3: challengeThree,
            explicacion_texto: explanation.trim(),
          },
        });

      inicioActividadRef.current = Date.now();

      const progresoGuardado = resultado.progreso;
      const estrellasGuardadas = Number(
        progresoGuardado.estrellas_obtenidas ?? 0,
      );
      const intentosGuardados = Number(
        progresoGuardado.intentos ?? 1,
      );

      console.log(
        "Progreso de Escuadrón Táctico guardado:",
        progresoGuardado,
      );

      if (completed) {
        showToast(
          intentosGuardados > 1
            ? `¡Trampa desactivada otra vez! Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Trampa desactivada! Ganaste ${estrellasGuardadas} estrellas. ⭐`,
        );

        abrirModalResultado("completed", 1000);
        return;
      }

      showToast(
        totalCorrect === 2
          ? "¡Casi lo logras! Revisa cuál operación tiene prioridad."
          : totalCorrect === 1
            ? "Una secuencia es correcta. Revisa las otras con la ayuda de Byte."
            : "La secuencia aún no es correcta. Usa la ayuda de Byte.",
        true,
      );

      abrirModalResultado(
        totalCorrect >= 2 ? "almost" : "retry",
        900,
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso de Escuadrón Táctico:",
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
      guardandoRef.current = false;
      setGuardandoProgreso(false);
    }
  };

  return (
    <main className="mnx-escuadron-page">
      <button
        type="button"
        className={`mnx-escuadron-hamburger ${
          menuOpen
            ? "mnx-escuadron-hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen((current) => !current)
        }
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="mnx-escuadron-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`mnx-escuadron-sidebar ${
          menuOpen
            ? "mnx-escuadron-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-escuadron-sidebar-logo"
        />

        <nav className="mnx-escuadron-sidebar-menu">
          <button
            type="button"
            className="mnx-escuadron-menu-item"
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Panel de control principal</span>
          </button>

          <button
            type="button"
            className="mnx-escuadron-menu-item mnx-escuadron-menu-active"
            onClick={() =>
              irARuta("/seleccion-mundos")
            }
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="mnx-escuadron-menu-item"
            onClick={() =>
              irARuta("/retroalimentacion")
            }
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="mnx-escuadron-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnx-escuadron-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="mnx-escuadron-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mnx-escuadron-sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="mnx-escuadron-sidebar-fox"
          />
        </div>
      </aside>

      <section className="mnx-escuadron-main">
        <div className="mnx-escuadron-top-actions">
          <button
            type="button"
            className="mnx-escuadron-ghost-btn"
            onClick={() => setHelpOpen(true)}
          >
            <FiHelpCircle />
            Ayuda
          </button>

          <button
            type="button"
            className="mnx-escuadron-ghost-btn mnx-escuadron-wide"
            onClick={() => irARuta(activityListRoute)}
          >
            <span>←</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-escuadron-header">
          <div className="mnx-escuadron-header-copy">
            <div className="mnx-escuadron-crumb">
              <strong>MathNumbers</strong>
              <span>/</span>
              <span>
                Tema 3: Jerarquía y propiedades
              </span>
            </div>

            <div className="mnx-escuadron-title-row">
              <span
                className="mnx-escuadron-title-icon"
                aria-hidden="true"
              >
                <FiShield />
              </span>

              <h1>
                Escuadrón Táctico: Desactivación
              </h1>
            </div>

            <p>
              Aplica la jerarquía de operaciones para
              desactivar la trampa láser en el orden
              correcto.
            </p>

            <div className="mnx-escuadron-stats">
              <article>
                <FiTarget />
                <div>
                  <small>Progreso</small>
                  <strong>
                    {selectedOperations}/7 cables
                  </strong>
                </div>
              </article>

              <article>
                <FiZap />
                <div>
                  <small>Duración estimada</small>
                  <strong>10–14 min</strong>
                </div>
              </article>
            </div>
          </div>

          <div className="mnx-escuadron-welcome-wrap">
            <article className="mnx-escuadron-speech">
              <strong>Comandante Suma explica</strong>

              <p aria-live="polite">
                {introAudioStatus === "ended"
                  ? INTRO_FULL_TEXT
                  : introCaption}
              </p>

              <div className="mnx-escuadron-audio-controls">
                <audio
                  ref={introAudioRef}
                  src={INTRO_AUDIO_SRC}
                  preload="metadata"
                  onPlay={() => {
                    setIntroAudioStatus("playing");
                    actualizarTextoIntroduccion();
                  }}
                  onTimeUpdate={actualizarTextoIntroduccion}
                  onSeeking={actualizarTextoIntroduccion}
                  onPause={() => {
                    if (!introAudioRef.current?.ended) {
                      setIntroAudioStatus("paused");
                    }
                  }}
                  onEnded={() => {
                    setIntroAudioStatus("ended");
                    setIntroCaption(INTRO_FULL_TEXT);
                  }}
                />

                <button
                  type="button"
                  onClick={reproducirIntroduccion}
                  disabled={introAudioStatus === "playing"}
                  aria-label="Reproducir introducción del Comandante Suma"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  onClick={pausarIntroduccion}
                  disabled={introAudioStatus !== "playing"}
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
                  className={`mnx-escuadron-audio-status ${
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

            <img
              key={
                introAudioStatus === "playing"
                  ? "suma-hablando"
                  : "suma-idle"
              }
              className="mnx-escuadron-hero-robot"
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
              draggable={false}
            />
          </div>
        </header>

        <section className="mnx-escuadron-activity-grid">
          <article className="mnx-escuadron-art">
            <div className="mnx-escuadron-visual">
              <img
                className="mnx-escuadron-visual-image"
                src={escuadronAnimado}
                alt="Trampa láser del Escuadrón Táctico"
                draggable={false}
              />
            </div>

            <div className="mnx-escuadron-system-status">
              <span />
              SISTEMA LÁSER ACTIVO
            </div>

            <div className="mnx-escuadron-mission">
              <FiTarget />

              <div>
                <strong>Tu misión</strong>
                <p>
                  Desactiva la trampa tocando primero
                  las operaciones con mayor prioridad.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-escuadron-guide-card">
            <div className="mnx-escuadron-card-title">
              <span>
                <FiHelpCircle />
              </span>

              <strong>Guía visual rápida</strong>
            </div>

            <div className="mnx-escuadron-guide-steps">
              <article>
                <b>1</b>
                <div>
                  <strong>Paréntesis</strong>
                  <span>( )</span>
                  <small>Ej.: (3 + 2) × 4</small>
                </div>
              </article>

              <i>→</i>

              <article>
                <b>2</b>
                <div>
                  <strong>
                    Multiplicación o división
                  </strong>
                  <span>× &nbsp; ÷</span>
                  <small>Ej.: 3 × 2 o 8 ÷ 2</small>
                </div>
              </article>

              <i>→</i>

              <article>
                <b>3</b>
                <div>
                  <strong>Suma o resta</strong>
                  <span>+ &nbsp; −</span>
                  <small>Ej.: 5 + 3 o 7 − 2</small>
                </div>
              </article>
            </div>
          </section>

          <SequenceChallenge
            number={1}
            title="Reto 1"
            expression="5 + (3 × 2)"
            options={challengeOneOptions}
            selected={challengeOne}
            onSelect={(operation) =>
              addOperation(
                operation,
                challengeOne,
                setChallengeOne,
                correctChallengeOne.length,
              )
            }
            onRemove={(index) =>
              removeOperation(index, setChallengeOne)
            }
            onReset={() => setChallengeOne([])}
            className="mnx-escuadron-reto-one"
          />

          <SequenceChallenge
            number={2}
            title="Reto 2"
            expression="12 − 4 ÷ 2"
            options={challengeTwoOptions}
            selected={challengeTwo}
            onSelect={(operation) =>
              addOperation(
                operation,
                challengeTwo,
                setChallengeTwo,
                correctChallengeTwo.length,
              )
            }
            onRemove={(index) =>
              removeOperation(index, setChallengeTwo)
            }
            onReset={() => setChallengeTwo([])}
            className="mnx-escuadron-reto-two"
          />

          <section className="mnx-escuadron-hint-card">
            <img
              key={
                guideAudioStatus === "playing"
                  ? "consejo-suma-hablando"
                  : "consejo-suma-idle"
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
              draggable={false}
            />

            <div>
              <span>Consejo de Suma</span>

              <p aria-live="polite">
                {guideAudioStatus === "idle"
                  ? GUIDE_INITIAL_TEXT
                  : GUIDE_FULL_TEXT}
              </p>

              <div className="mnx-escuadron-guide-audio-controls">
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
                  disabled={guideAudioStatus === "playing"}
                  aria-label="Reproducir Consejo de Suma"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  onClick={pausarConsejo}
                  disabled={guideAudioStatus !== "playing"}
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
                  className={`mnx-escuadron-guide-audio-status ${
                    guideAudioStatus === "playing"
                      ? "is-playing"
                      : ""
                  }`}
                >
                  <FiVolume2 />
                  {guideStatusText}
                </span>
              </div>

              <button
                type="button"
                className="mnx-escuadron-help-full-button"
                onClick={() => setHelpOpen(true)}
              >
                <FiHelpCircle />
                Ver ayuda completa
              </button>
            </div>
          </section>

          <section className="mnx-escuadron-reto-three">
            <SequenceChallenge
              number={3}
              title="Reto 3"
              expression="6 + 4 × 2"
              options={challengeThreeOptions}
              selected={challengeThree}
              onSelect={(operation) =>
                addOperation(
                  operation,
                  challengeThree,
                  setChallengeThree,
                  correctChallengeThree.length,
                )
              }
              onRemove={(index) =>
                removeOperation(
                  index,
                  setChallengeThree,
                )
              }
              onReset={() => setChallengeThree([])}
            />

            <div className="mnx-escuadron-explanation">
              <label htmlFor="escuadron-explanation">
                ¿Por qué primero va la multiplicación?
              </label>

              <div className="mnx-escuadron-answer-box">
                <textarea
                  id="escuadron-explanation"
                  maxLength={300}
                  value={explanation}
                  onChange={(event) =>
                    setExplanation(event.target.value)
                  }
                  placeholder="Escribe tu explicación aquí..."
                />

                <span>
                  {explanation.length} / 300
                </span>
              </div>

              <button
                type="button"
                className="mnx-escuadron-save-btn"
                onClick={guardarExplicacion}
              >
                <FiSave />
                Guardar explicación
              </button>
            </div>
          </section>

          <section className="mnx-escuadron-actions">
            <button
              type="button"
              className="mnx-escuadron-check-btn"
              onClick={verificar}
              disabled={guardandoProgreso}
              aria-busy={guardandoProgreso}
            >
              <FiCheckCircle />
              {guardandoProgreso
                ? "Guardando progreso..."
                : "Comprobar secuencia"}
            </button>

            <p className="mnx-escuadron-progress">
              Progreso: {selectedOperations}/7 cables
              seleccionados
            </p>

            <article className="mnx-escuadron-evidence-card">
              <div className="mnx-escuadron-evidence-title">
                <FiClipboard />

                <strong>Evidencia guardada</strong>
              </div>

              <p>
                Tus selecciones e intentos se registran
                automáticamente.
              </p>

              <div className="mnx-escuadron-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus aciertos y errores
                  en Retroalimentación.
                </p>
              </div>
            </article>
          </section>
        </section>
      </section>

      <button
        className="mnx-escuadron-logout-float"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {helpOpen && (
        <HelpModal onClose={() => setHelpOpen(false)} />
      )}

      {resultModalOpen && (
        <ResultModal
          kind={resultModalKind}
          nextRoute={espejosBovedaRoute}
          retryRoute={escuadronRoute}
          onClose={() => setResultModalOpen(false)}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}