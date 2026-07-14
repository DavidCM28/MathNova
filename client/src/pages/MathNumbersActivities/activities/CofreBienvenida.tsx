import "./CofreBienvenida.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import {
  cofreChest,
  cofreGuide,
  cofreHero,
  cofreTitleChest,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

type QuestionKey = "q1" | "q2";
type AnswerValue = "a" | "b" | "c" | "d";

const correctAnswers: Record<QuestionKey, AnswerValue> = {
  q1: "b",
  q2: "b",
};

const cofreRoute =
  "/actividades/mathnumbers/cofre-bienvenida";

const radarRoute =
  "/actividades/mathnumbers/radar-supervivencia";

export function CofreBienvenida() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [answers, setAnswers] = useState<
    Partial<Record<QuestionKey, AnswerValue>>
  >({});

  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const progress = Object.keys(answers).length;

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
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

    setChecked(false);
    setSolved(false);
  };

  const answerClass = (
    question: QuestionKey,
    value: AnswerValue,
  ) => {
    const selected = answers[question] === value;
    const correct =
      correctAnswers[question] === value;

    if (checked && correct) {
      return "mnx-cofre-correct";
    }

    if (checked && selected && !correct) {
      return "mnx-cofre-wrong";
    }

    if (selected) {
      return "mnx-cofre-selected";
    }

    return "";
  };

  const comprobar = () => {
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
        answers[question] ===
        correctAnswers[question],
    ).length;

    setChecked(true);
    setSolved(total === 2);

    if (total === 2) {
      showToast(
        "¡Perfecto! El cofre se iluminó con tus respuestas.",
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
      }, 850);

      return;
    }

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
          },
        },
      );
    }, 1100);
  };

  return (
    <main
      className={`mnx-cofre-page ${
        solved ? "mnx-cofre-solved" : ""
      }`}
    >
      <button
        type="button"
        className={`mnx-hamburger-btn ${
          menuOpen ? "mnx-hamburger-open" : ""
        }`}
        onClick={() =>
          setMenuOpen((current) => !current)
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
          className="mnx-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`mnx-sidebar ${
          menuOpen ? "mnx-sidebar-open" : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-sidebar-logo"
        />

        <nav className="mnx-sidebar-menu">
          <button
            className="mnx-menu-item"
            type="button"
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
            className="mnx-menu-item mnx-active"
            type="button"
            onClick={() =>
              irARuta("/seleccion-mundos")
            }
          >
            <GiRingedPlanet />
            <span>
              Selección de mundos
            </span>
          </button>

          <button
            className="mnx-menu-item"
            type="button"
            onClick={() =>
              irARuta("/retroalimentacion")
            }
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="mnx-menu-item"
            type="button"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="mnx-menu-item"
            type="button"
            onClick={() =>
              irARuta("/perfil-alumno")
            }
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="mnx-menu-item"
            type="button"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mnx-sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="mnx-sidebar-fox"
          />
        </div>
      </aside>

      <section className="mnx-cofre-main">
        <div className="mnx-cofre-top-actions">
          <button
            type="button"
            className="mnx-cofre-ghost-btn"
            onClick={() =>
              irARuta(
                "/actividades/mathnumbers/aqui-tienes-una-pista",
              )
            }
          >
            <span>?</span>
            Ayuda
          </button>

          <button
            type="button"
            className="mnx-cofre-ghost-btn mnx-cofre-wide"
            onClick={() =>
              irARuta(activityListRoute)
            }
          >
            <span>↩</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-cofre-header">
          <div className="mnx-cofre-header-copy">
            <div className="mnx-cofre-crumb">
              <strong>MathNumbers</strong>
              <span>/</span>
              <span>
                Tema 1: Fracciones y decimales
              </span>
            </div>

            <div className="mnx-cofre-title-row">
              <img
                src={cofreTitleChest}
                alt=""
                aria-hidden="true"
              />

              <h1>
                El Cofre de Bienvenida a
                MathNova
              </h1>
            </div>

            <p>
              Resuelve las preguntas sobre
              equivalencias entre fracciones y
              decimales.
              <br />
              Cada respuesta correcta ilumina el
              cofre y nos acerca a abrirlo.
            </p>
          </div>

          <div className="mnx-cofre-welcome-wrap">
            <article className="mnx-cofre-speech">
              <strong>
                ¡Bienvenido, explorador!
              </strong>

              <span>
                Usa tu poder matemático para
                responder correctamente y abrir el
                Cofre de Bienvenida.
              </span>
            </article>

            <img
              className="mnx-cofre-hero-robot"
              src={cofreHero}
              alt="Comandante Suma"
            />
          </div>
        </header>

        <section className="mnx-cofre-activity-grid">
          <article className="mnx-cofre-chest-art">
            <img
              src={cofreChest}
              alt="Cofre de bienvenida"
            />
          </article>

          <section className="mnx-cofre-guide-card">
            <div className="mnx-cofre-card-title">
              <span>♧</span>
              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-cofre-guide-body">
              <div className="mnx-cofre-guide-block">
                <p>
                  <strong>1/2</strong> es la mitad
                  de la barra.
                </p>

                <div className="mnx-cofre-fraction-demo mnx-cofre-half">
                  <span className="mnx-cofre-bar">
                    <i />
                    <b />
                  </span>

                  <em>=</em>
                  <strong>0.5</strong>
                </div>
              </div>

              <div className="mnx-cofre-divider" />

              <div className="mnx-cofre-guide-block">
                <p>
                  <strong>0.25</strong> es una de
                  cuatro partes iguales.
                </p>

                <div className="mnx-cofre-fraction-demo mnx-cofre-quarter">
                  <span className="mnx-cofre-bar">
                    <i />
                    <b />
                    <b />
                    <b />
                  </span>

                  <em>=</em>

                  <span className="mnx-cofre-frac">
                    <span>1</span>
                    <span>4</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mnx-cofre-question-card mnx-cofre-q-one">
            <div className="mnx-cofre-question-head">
              <span>1</span>

              <h2>
                La batería está cargada a 1/2.
                <br />
                ¿Cuál es su equivalente decimal?
              </h2>
            </div>

            <div className="mnx-cofre-options">
              <button
                className={answerClass("q1", "a")}
                type="button"
                onClick={() =>
                  selectAnswer("q1", "a")
                }
              >
                <span>A</span>
                0.2
              </button>

              <button
                className={answerClass("q1", "b")}
                type="button"
                onClick={() =>
                  selectAnswer("q1", "b")
                }
              >
                <span>B</span>
                0.5
              </button>

              <button
                className={answerClass("q1", "c")}
                type="button"
                onClick={() =>
                  selectAnswer("q1", "c")
                }
              >
                <span>C</span>
                1.5
              </button>

              <button
                className={answerClass("q1", "d")}
                type="button"
                onClick={() =>
                  selectAnswer("q1", "d")
                }
              >
                <span>D</span>
                2.0
              </button>
            </div>
          </section>

          <section className="mnx-cofre-question-card mnx-cofre-q-two">
            <div className="mnx-cofre-question-head">
              <span>2</span>

              <h2>
                El sistema muestra 0.25 de energía.
                <br />
                ¿Cuál es la fracción equivalente?
              </h2>
            </div>

            <div className="mnx-cofre-options">
              <button
                className={answerClass("q2", "a")}
                type="button"
                onClick={() =>
                  selectAnswer("q2", "a")
                }
              >
                <span>A</span>

                <span className="mnx-cofre-frac mnx-cofre-frac-small">
                  <span>1</span>
                  <span>2</span>
                </span>
              </button>

              <button
                className={answerClass("q2", "b")}
                type="button"
                onClick={() =>
                  selectAnswer("q2", "b")
                }
              >
                <span>B</span>

                <span className="mnx-cofre-frac mnx-cofre-frac-small">
                  <span>1</span>
                  <span>4</span>
                </span>
              </button>

              <button
                className={answerClass("q2", "c")}
                type="button"
                onClick={() =>
                  selectAnswer("q2", "c")
                }
              >
                <span>C</span>

                <span className="mnx-cofre-frac mnx-cofre-frac-small">
                  <span>2</span>
                  <span>5</span>
                </span>
              </button>

              <button
                className={answerClass("q2", "d")}
                type="button"
                onClick={() =>
                  selectAnswer("q2", "d")
                }
              >
                <span>D</span>

                <span className="mnx-cofre-frac mnx-cofre-frac-small">
                  <span>4</span>
                  <span>1</span>
                </span>
              </button>
            </div>
          </section>

          <section className="mnx-cofre-reminder-card">
            <img
              src={cofreGuide}
              alt="Comandante Suma"
            />

            <p>
              Recuerda: las fracciones y los
              decimales son dos formas de expresar
              la misma cantidad. ¡Observa, piensa y
              elige la mejor opción!
            </p>

            <span>☆</span>
          </section>

          <section className="mnx-cofre-check-area">
            <button
              className="mnx-cofre-check-btn"
              type="button"
              onClick={comprobar}
            >
              <span>✓</span>
              Comprobar respuestas
            </button>

            <p>
              ✦ Cada respuesta correcta hace
              brillar el cofre.
            </p>

            <small>
              Progreso: {progress}/2 respuestas
              seleccionadas
            </small>
          </section>

          <section className="mnx-cofre-evidence-card">
            <div className="mnx-cofre-evidence-title">
              <span>▣</span>
              <strong>
                Evidencia guardada
              </strong>
            </div>

            <p>
              Tus respuestas seleccionadas se
              registran automáticamente.
            </p>

            <div className="mnx-cofre-info-row">
              <span>i</span>

              <p>
                Podrás revisar tus aciertos y
                errores en la sección
                Retroalimentación.
              </p>
            </div>
          </section>
        </section>
      </section>

      <button
        className="mnx-cofre-logout-float"
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