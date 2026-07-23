import "./EspejosBoveda.css";

import { useEffect, useState } from "react";
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
  FiRotateCcw,
  FiSave,
  FiTarget,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import espejoScene from "../../../assets/espejo.png";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";

import { clearAuthSession } from "../../../utils/authSession";
import { guardarProgresoActividad } from "../../../services/progresoService";

import { activityListRoute } from "../constants";
import { ResultModal } from "../components/ResultModal";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import type { ResultKind } from "../types";

import {
  cofreGuide,
  cofreHeroTalkingIdle,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

type QuestionKey = "q1" | "q2";
type AnswerValue = "a" | "b";

const correctAnswers: Record<QuestionKey, AnswerValue> = {
  q1: "b",
  q2: "b",
};

const espejosRoute =
  "/actividades/mathnumbers/espejos-boveda";

const puentePrioridadesRoute =
  "/actividades/mathnumbers/puente-prioridades";

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
      className="mnx-espejos-help-overlay"
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
        className="mnx-espejos-help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mnx-espejos-help-title"
      >
        <button
          type="button"
          className="mnx-espejos-help-close"
          onClick={onClose}
          aria-label="Cerrar pista"
        >
          <FiX />
        </button>

        <div className="mnx-espejos-help-media">
          <img
            src={bytePista}
            alt="Byte ofreciendo una pista"
          />
        </div>

        <div className="mnx-espejos-help-copy">
          <span>Pista de Byte</span>

          <h2 id="mnx-espejos-help-title">
            Busca el mismo resultado
          </h2>

          <p>
            En la propiedad conmutativa cambia el orden
            de los números. En la asociativa cambia la
            agrupación. Aunque se vean diferentes, ambas
            expresiones deben conservar el mismo valor.
          </p>

          <div className="mnx-espejos-help-examples">
            <article>
              <strong>Conmutativa</strong>
              <span>4 + 7 = 7 + 4</span>
            </article>

            <article>
              <strong>Asociativa</strong>
              <span>
                (2 + 3) + 1 = 2 + (3 + 1)
              </span>
            </article>
          </div>

          <button
            type="button"
            className="mnx-espejos-help-understood"
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

export function EspejosBoveda() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

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

  const irARuta = (route: string) => {
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
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

                <h2>
                  ¡Observa los reflejos!
                </h2>

                <p>
                  Une las expresiones que representan el
                  mismo valor. Puede cambiar el orden o
                  la agrupación, pero no el resultado.
                </p>
              </article>

              <div className="mnx-espejos-hero-stage">
                <img
                  src={cofreHeroTalkingIdle}
                  alt="Comandante Suma"
                  className="mnx-espejos-intro-character"
                />
              </div>
            </div>
          </header>

          <section className="mnx-espejos-activity-grid">
            <article className="mnx-espejos-art">
              <div className="mnx-espejos-scene-visual">
                <img
                  src={espejoScene}
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
                    <strong>7 − 4</strong>
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
                    <strong>7 + 4</strong>
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

            <section className="mnx-espejos-reminder-card">
              <img
                src={cofreGuide}
                alt="Comandante Suma dando una pista"
                className="mnx-espejos-reminder-character"
              />

              <div>
                <span className="mnx-espejos-help-label">
                  Consejo de Suma
                </span>

                <h3>
                  Busca el mismo valor
                </h3>

                <p>
                  Cambiar el orden o la agrupación no
                  debe modificar el resultado. Compara
                  ambas expresiones antes de elegir.
                </p>

                <button
                  type="button"
                  className="mnx-espejos-hint-button"
                  onClick={() =>
                    setHelpOpen(true)
                  }
                >
                  <FiHelpCircle />
                  Ver pista completa
                </button>
              </div>
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