import "./EscuadronTactico.css";

import { useEffect, useMemo, useState } from "react";
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
  FiRotateCcw,
  FiSave,
  FiShield,
  FiTarget,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import escuadronScene from "../../../assets/escuadron-tactico.png";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";

import { clearAuthSession } from "../../../utils/authSession";
import { guardarProgresoActividad } from "../../../services/progresoService";

import { activityListRoute } from "../constants";
import { ResultModal } from "../components/ResultModal";
import type { ResultKind } from "../types";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";

import {
  cofreGuide,
  cofreHeroTalkingIdle,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

const escuadronRoute =
  "/actividades/mathnumbers/escuadron-tactico";

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

  const selectedOperations = useMemo(
    () =>
      challengeOne.length +
      challengeTwo.length +
      challengeThree.length,
    [challengeOne, challengeTwo, challengeThree],
  );

  const irARuta = (route: string) => {
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
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

  const repetirActividad = () => {
    setResultModalOpen(false);
    setChallengeOne([]);
    setChallengeTwo([]);
    setChallengeThree([]);
    setExplanation("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Sistema táctico reiniciado. ¡Desactiva la trampa nuevamente!",
    );
  };

  const verificar = async () => {
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
    const stars = completed
      ? 3
      : totalCorrect === 2
        ? 2
        : totalCorrect === 1
          ? 1
          : 0;

    let userId = 17;

    try {
      const sessionString =
        localStorage.getItem("auth_session");

      if (sessionString) {
        const session = JSON.parse(sessionString);

        if (session?.id_usuario) {
          userId = Number(session.id_usuario);
        }
      }
    } catch (error) {
      console.error(
        "No se pudo leer la sesión del alumno:",
        error,
      );
    }

    const payload = {
      id_usuario: userId,
      mundo: "mathnumbers",
      tema: "Tema 3: Jerarquía y propiedades",
      actividad_codigo: "escuadron-tactico",
      actividad_titulo:
        "Escuadrón Táctico: Desactivación",
      aciertos: totalCorrect,
      total_preguntas: 3,
      precision: (totalCorrect / 3) * 100,
      estrellas_obtenidas: stars,
      xp_obtenido: totalCorrect * 15,
      completada: completed,
      tiempo_segundos: 0,
      respuestas: {
        reto_1: challengeOne,
        reto_2: challengeTwo,
        reto_3: challengeThree,
        explicacion_texto: explanation,
      },
    };

    try {
      await guardarProgresoActividad(payload);

      const progressKey =
        `progreso_${userId}_escuadron-tactico`;

      const previousProgressRaw =
        localStorage.getItem(progressKey);

      let previousStars = 0;

      if (previousProgressRaw) {
        const previousProgress =
          JSON.parse(previousProgressRaw);

        previousStars =
          Number(
            previousProgress?.estrellas_obtenidas,
          ) || 0;
      }

      localStorage.setItem(
        progressKey,
        JSON.stringify({
          estrellas_obtenidas: Math.max(
            previousStars,
            stars,
          ),
        }),
      );

      if (completed) {
        showToast(
          previousStars > 0
            ? `¡Trampa desactivada otra vez! Conservas tus ${Math.max(
                previousStars,
                stars,
              )} estrellas.`
            : "¡Trampa desactivada! Ganaste 3 estrellas.",
        );

        window.setTimeout(() => {
          setResultModalKind("completed");
          setResultModalOpen(true);
        }, 900);

        return;
      }

      showToast(
        totalCorrect === 2
          ? "¡Casi lo logras! Revisa cuál operación tiene prioridad."
          : "La secuencia aún no es correcta. Usa la ayuda de Byte.",
        true,
      );

      window.setTimeout(() => {
        setResultModalKind(
          totalCorrect >= 2 ? "almost" : "retry",
        );
        setResultModalOpen(true);
      }, 900);
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso de Escuadrón Táctico:",
        error,
      );

      showToast(
        "No se pudo guardar el progreso. Revisa la conexión con el servidor.",
        true,
      );
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
              <strong>¡Alerta táctica!</strong>
              <span>
                Corta los cables en el orden correcto.
                Primero resuelve la operación con mayor
                prioridad.
              </span>
            </article>

            <img
              className="mnx-escuadron-hero-robot"
              src={cofreHeroTalkingIdle}
              alt="Comandante Suma"
            />
          </div>
        </header>

        <section className="mnx-escuadron-activity-grid">
          <article className="mnx-escuadron-art">
            <img
              src={escuadronScene}
              alt="Trampa láser del Escuadrón Táctico"
            />

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
              src={cofreGuide}
              alt="Comandante Suma dando una pista"
            />

            <div>
              <span>Pista general</span>
              <p>
                Primero resuelve lo que está dentro de
                paréntesis; después multiplicaciones o
                divisiones; al final sumas o restas.
              </p>

              <button
                type="button"
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
            >
              <FiCheckCircle />
              Comprobar secuencia
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
          nextRoute={activityListRoute}
          retryRoute={escuadronRoute}
          onClose={() => setResultModalOpen(false)}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}