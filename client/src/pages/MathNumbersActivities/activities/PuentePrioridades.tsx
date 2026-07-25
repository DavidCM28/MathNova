import "./PuentePrioridades.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiBookOpen,
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

import puenteScene from "../../../assets/mathnumbers/10-prioridades/puente.webp";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";
import audioConsejoSumaPuente from "../../../assets/mathnumbers/10-prioridades/consejo_suma_puente.mp3";
import audioIntroPuente from "../../../assets/mathnumbers/10-prioridades/intro_puente.mp3";
import comandanteSumaHablando from "../../../assets/mathnumbers/10-prioridades/comandante_suma_hablando.webp";
import comandanteSumaIdle from "../../../assets/mathnumbers/10-prioridades/comandante_suma_idle.png";

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

const puenteRoute =
  "/actividades/mathnumbers/puente-prioridades";

const enigmaVariablesRoute =
  "/actividades/mathnumbers/enigma-variables";

const INTRO_AUDIO_SRC = audioIntroPuente;
const GUIDE_AUDIO_SRC = audioConsejoSumaPuente;

const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la introducción del Comandante Suma.";

const INTRO_FULL_TEXT =
  "El puente láser necesita estabilidad absoluta para soportar tu peso. Demuestra que dominas la jerarquía matemática.";

const GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo del Comandante Suma.";

const GUIDE_FULL_TEXT =
  "Revisa dos veces tus signos y operaciones intermedias antes de dar la respuesta definitiva.";

function HelpModal({
  onClose,
}: {
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const closeWithEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      closeWithEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        closeWithEscape,
      );
    };
  }, [onClose]);

  return (
    <div
      className="mnx-puente-help-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className="mnx-puente-help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mnx-puente-help-title"
      >
        <button
          type="button"
          className="mnx-puente-help-close"
          onClick={onClose}
          aria-label="Cerrar pista"
        >
          <FiX />
        </button>

        <div className="mnx-puente-help-media">
          <img
            src={bytePista}
            alt="Byte ofreciendo una pista"
          />
        </div>

        <div className="mnx-puente-help-copy">
          <span>Pista de Byte</span>

          <h2 id="mnx-puente-help-title">
            Sigue el orden de prioridad
          </h2>

          <p>
            Resuelve primero los paréntesis. Después
            realiza multiplicaciones o divisiones y,
            al final, sumas o restas. No avances de
            izquierda a derecha sin revisar qué
            operación tiene mayor prioridad.
          </p>

          <div className="mnx-puente-help-examples">
            <article>
              <strong>8 + 2 × 5</strong>
              <span>
                Primero 2 × 5 = 10; después 8 + 10 = 18.
              </span>
            </article>

            <article>
              <strong>(6 + 4) ÷ 2</strong>
              <span>
                Primero 6 + 4 = 10; después 10 ÷ 2 = 5.
              </span>
            </article>
          </div>

          <button
            type="button"
            className="mnx-puente-help-understood"
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

export function PuentePrioridades() {
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

  const [answerOne, setAnswerOne] =
    useState("");

  const [answerTwo, setAnswerTwo] =
    useState("");

  const [explanation, setExplanation] =
    useState("");

  const [
    activityResolved,
    setActivityResolved,
  ] = useState(false);

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
    Number(answerOne.trim() !== "") +
    Number(answerTwo.trim() !== "");

  const energy = progress * 50;

  useEffect(() => {
    if (helpOpen || resultModalOpen) {
      return;
    }

    document.body.style.overflow =
      menuOpen ? "hidden" : "auto";

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
        "No se pudo reproducir la introducción de El Puente de Prioridades:",
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
        "No se pudo repetir la introducción de El Puente de Prioridades:",
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
        "No se pudo reproducir el Consejo de Suma de El Puente de Prioridades:",
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
        "No se pudo repetir el Consejo de Suma de El Puente de Prioridades:",
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
    setAnswerOne("");
    setAnswerTwo("");
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
      "Puente reiniciado. ¡Resuelve las operaciones nuevamente!",
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
        "Escribe el resultado de los dos retos antes de comprobar.",
        true,
      );
      return;
    }

    const firstCorrect =
      Number(answerOne.trim()) === 18;

    const secondCorrect =
      Number(answerTwo.trim()) === 5;

    const total =
      Number(firstCorrect) +
      Number(secondCorrect);

    const completed = total === 2;

    const nuevasEstrellas =
      completed
        ? 3
        : total === 1
          ? 1
          : 0;

    let idUsuario = 17;

    try {
      const sessionString =
        localStorage.getItem(
          "auth_session",
        );

      if (sessionString) {
        const session =
          JSON.parse(sessionString);

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

    const payload = {
      id_usuario: idUsuario,
      mundo: "mathnumbers",
      tema:
        "Tema 3: Jerarquía y propiedades",
      actividad_codigo:
        "puente-prioridades",
      actividad_titulo:
        "El Puente de Prioridades",
      respuestas: {
        reto_1: answerOne,
        reto_2: answerTwo,
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
      completada: completed,
      tiempo_segundos: 0,
      xp_base: 50,
    };

    try {
      const progresoKey =
        `progreso_${idUsuario}_puente-prioridades`;

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

      if (completed) {
        setActivityResolved(true);

        showToast(
          estrellasAnteriores > 0
            ? `¡Puente activado otra vez! Conservas tus ${Math.max(
                estrellasAnteriores,
                nuevasEstrellas,
              )} estrellas.`
            : "¡Puente activado! Ganaste 3 estrellas.",
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
          ? "¡Casi lo logras! Revisa cuál operación debe resolverse primero."
          : "Los resultados no activaron el puente. Usa la pista de Byte.",
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
    <main className="mnx-puente-page mnx-puente-cofre-layout">
      <button
        type="button"
        className={`mnx-puente-hamburger ${
          menuOpen
            ? "mnx-puente-hamburger-open"
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
          className="mnx-puente-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-puente-sidebar ${
          menuOpen
            ? "mnx-puente-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-puente-sidebar-logo"
        />

        <nav className="mnx-puente-sidebar-menu">
          <button
            type="button"
            className="mnx-puente-menu-item"
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
            className="mnx-puente-menu-item mnx-puente-menu-active"
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
            className="mnx-puente-menu-item"
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
            className="mnx-puente-menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnx-puente-menu-item"
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
            className="mnx-puente-menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <article className="mnx-puente-week-card">
          <div className="mnx-puente-week-copy">
            <div className="mnx-puente-week-head">
              <strong>
                Progreso semanal
              </strong>
              <span>Nivel 4</span>
            </div>

            <div className="mnx-puente-week-progress">
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
            className="mnx-puente-sidebar-character"
          />
        </article>
      </aside>

      <section className="mnx-puente-content">
        <div className="mnx-puente-decoration mnx-puente-decoration-one" />
        <div className="mnx-puente-decoration mnx-puente-decoration-two" />

        <div
          className="mnx-puente-stars"
          aria-hidden="true"
        >
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
          <span>✧</span>
        </div>

        <section className="mnx-puente-main">
          <div className="mnx-puente-top-actions">
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

          <header className="mnx-puente-header">
            <div className="mnx-puente-header-copy">
              <div className="mnx-puente-breadcrumb">
                <strong>
                  MathNumbers
                </strong>
                <span>/</span>
                <span>
                  Tema 3: Jerarquía y propiedades
                </span>
              </div>

              <div className="mnx-puente-title-row">
                <span className="mnx-puente-title-icon">
                  <FiBookOpen />
                </span>

                <h1>
                  El Puente de Prioridades
                </h1>
              </div>

              <p>
                Resuelve operaciones mixtas y explica
                el orden utilizado para activar el
                puente digital.
              </p>

              <div className="mnx-puente-pills">
                <span>Jerarquía</span>
                <span>10–12 min</span>
                <span>2 retos</span>
                <span>+50 XP</span>
              </div>
            </div>

            <div className="mnx-puente-welcome">
              <article className="mnx-puente-speech">
                <span className="mnx-puente-speaker-label">
                  Comandante Suma explica
                </span>

                <p aria-live="polite">
                  {introAudioStatus === "idle"
                    ? INTRO_INITIAL_TEXT
                    : INTRO_FULL_TEXT}
                </p>

                <div className="mnx-puente-audio-controls">
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
                    className={`mnx-puente-audio-status ${
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

              <div className="mnx-puente-hero-stage">
                <img
                  key={
                    introAudioStatus === "playing"
                      ? "puente-suma-hablando"
                      : "puente-suma-idle"
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
                  className="mnx-puente-intro-character"
                  draggable={false}
                />
              </div>
            </div>
          </header>

          <section className="mnx-puente-activity-grid">
            <div className="mnx-puente-left-column">
              <article className="mnx-puente-art">
                <div className="mnx-puente-scene-visual">
                  <img
                    src={puenteScene}
                    alt="El Puente de Prioridades"
                    draggable={false}
                  />
                </div>

                <div className="mnx-puente-mission">
                  <FiZap />

                  <div>
                    <strong>
                      Energía del puente
                    </strong>

                    <div className="mnx-puente-energy-track">
                      <b
                        style={{
                          width: `${energy}%`,
                        }}
                      />
                    </div>

                    <p>
                      {energy}% cargado · cada resultado agrega 50%.
                    </p>
                  </div>
                </div>
              </article>

              <section className="mnx-puente-reminder-card">
                <img
                  key={
                    guideAudioStatus === "playing"
                      ? "puente-consejo-hablando"
                      : "puente-consejo-idle"
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
                  className="mnx-puente-reminder-character"
                  draggable={false}
                />

                <div className="mnx-puente-reminder-copy">
                  <span className="mnx-puente-help-label">
                    Consejo de Suma
                  </span>

                  <h3>
                    Verifica antes de responder
                  </h3>

                  <p aria-live="polite">
                    {guideAudioStatus === "idle"
                      ? GUIDE_INITIAL_TEXT
                      : GUIDE_FULL_TEXT}
                  </p>

                  <div className="mnx-puente-reminder-audio-controls">
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
                      className={`mnx-puente-reminder-audio-status ${
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

            <div className="mnx-puente-right-column">
              <section className="mnx-puente-guide-card">
                <div className="mnx-puente-section-heading">
                  <span>
                    <FiZap />
                  </span>

                  <div>
                    <strong>
                      Guía visual rápida
                    </strong>

                    <p>
                      Resuelve las operaciones según su prioridad.
                    </p>
                  </div>
                </div>

                <div className="mnx-puente-guide-grid mnx-puente-priority-grid">
                  <article>
                    <p>
                      <strong>1. Paréntesis</strong>
                    </p>

                    <div className="mnx-puente-demo-row">
                      <b>(3 + 2) × 4</b>
                    </div>
                  </article>

                  <article>
                    <p>
                      <strong>
                        2. Multiplicación o división
                      </strong>
                    </p>

                    <div className="mnx-puente-demo-row">
                      <b>8 + 2 × 5</b>
                    </div>
                  </article>

                  <article>
                    <p>
                      <strong>3. Suma o resta</strong>
                    </p>

                    <div className="mnx-puente-demo-row">
                      <b>8 + 10</b>
                    </div>
                  </article>
                </div>
              </section>

              <section className="mnx-puente-questions">
                <article className="mnx-puente-question-card">
                  <div className="mnx-puente-question-title">
                    <span>1</span>

                    <h2>
                      Escribe el resultado correcto de 8 + 2 × 5.
                    </h2>
                  </div>

                  <div className="mnx-puente-operation">
                    8 + 2 × 5
                  </div>

                  <label className="mnx-puente-result-field">
                    <span>
                      Resultado numérico
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9-]*"
                      value={answerOne}
                      onChange={(event) =>
                        setAnswerOne(
                          event.target.value,
                        )
                      }
                      placeholder="Escribe el resultado"
                    />
                  </label>
                </article>

                <article className="mnx-puente-question-card">
                  <div className="mnx-puente-question-title">
                    <span>2</span>

                    <h2>
                      Escribe el resultado correcto de (6 + 4) ÷ 2.
                    </h2>
                  </div>

                  <div className="mnx-puente-operation">
                    (6 + 4) ÷ 2
                  </div>

                  <label className="mnx-puente-result-field">
                    <span>
                      Resultado numérico
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9-]*"
                      value={answerTwo}
                      onChange={(event) =>
                        setAnswerTwo(
                          event.target.value,
                        )
                      }
                      placeholder="Escribe el resultado"
                    />
                  </label>
                </article>

                <article className="mnx-puente-explanation-card">
                  <div className="mnx-puente-question-title">
                    <span>3</span>

                    <h2>
                      Explica por qué no se suma primero en 8 + 2 × 5.
                    </h2>
                  </div>

                  <label
                    className="mnx-puente-answer-box"
                    htmlFor="puente-explanation"
                  >
                    <textarea
                      id="puente-explanation"
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
                    className="mnx-puente-save-btn"
                    onClick={
                      guardarExplicacion
                    }
                  >
                    <FiSave />
                    Guardar explicación
                  </button>
                </article>
              </section>

              <aside className="mnx-puente-actions">
                {activityResolved && (
                  <article className="mnx-puente-evidence-card">
                    <FiInfo />

                    <div>
                      <strong>
                        Evidencia guardada
                      </strong>

                      <p>
                        La actividad fue resuelta correctamente
                        y tus respuestas quedarán disponibles
                        en Retroalimentación.
                      </p>
                    </div>
                  </article>
                )}

                <button
                  type="button"
                  className="mnx-puente-check-button"
                  onClick={comprobar}
                >
                  <FiCheckCircle />
                  Comprobar respuestas
                  <span>
                    {progress}/2 listas
                  </span>
                </button>
              </aside>
            </div>
          </section>
          <section className="mnx-puente-stats">
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
                  Operaciones
                </span>
                <strong>2</strong>
              </div>
            </article>

            <article>
              <FiZap />

              <div>
                <span>
                  Energía del puente
                </span>
                <strong>
                  {energy}%
                </strong>
              </div>
            </article>

            <article>
              <span className="mnx-puente-xp-star">
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
        className="mnx-puente-logout"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {helpOpen && (
        <HelpModal
          onClose={() =>
            setHelpOpen(false)
          }
        />
      )}

      {resultModalOpen && (
        <ResultModal
          kind={resultModalKind}
          nextRoute={enigmaVariablesRoute}
          retryRoute={puenteRoute}
          onClose={cerrarResultado}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}