import "./CofreBienvenida.css";
import "./RadarSupervivencia.css";
import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowDown,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiSave,
  FiShield,
  FiTarget,
  FiUser,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import {
  cofreGuide,
  cofreHero,
  logo,
  menuHamburguesa,
  radarImage,
  zorritoConsejo,
} from "../mathNumbersAssets";
import { formatSigned } from "../utils/formatSigned";

const radarRoute =
  "/actividades/mathnumbers/radar-supervivencia";

const ascensorRoute =
  "/actividades/mathnumbers/ascensor-bunker";

const signals = [
  {
    value: "3",
    label: "Señal aliada A",
    type: "ally",
  },
  {
    value: "5",
    label: "Señal aliada B",
    type: "ally",
  },
  {
    value: "-2",
    label: "Señal enemiga C",
    type: "enemy",
  },
  {
    value: "-4",
    label: "Señal enemiga D",
    type: "enemy",
  },
] as const;

const targets = ["-4", "-2", "3", "5"] as const;

const numberLine = [
  -5,
  -4,
  -3,
  -2,
  -1,
  0,
  1,
  2,
  3,
  4,
  5,
];

type SignalValue =
  (typeof signals)[number]["value"];

const getSignal = (value?: string) =>
  signals.find(
    (signal) => signal.value === value,
  );

const numberToColumn = (
  value: string | number,
) => Number(value) + 6;

export function RadarSupervivencia() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    selectedSignal,
    setSelectedSignal,
  ] = useState<SignalValue | null>(null);

  const [placements, setPlacements] =
    useState<Record<string, string>>({});

  const [explanation, setExplanation] =
    useState("");

  const progress =
    Object.keys(placements).length;

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

  const setPlacementWithoutDuplicate = (
    target: string,
    value: string,
  ) => {
    setPlacements((current) => {
      const next: Record<string, string> = {};

      Object.entries(current).forEach(
        ([currentTarget, currentValue]) => {
          if (
            currentValue !== value &&
            currentTarget !== target
          ) {
            next[currentTarget] =
              currentValue;
          }
        },
      );

      next[target] = value;

      return next;
    });
  };

  const placeSignal = (
    target: string,
    value: string,
  ) => {
    setPlacementWithoutDuplicate(
      target,
      value,
    );

    setSelectedSignal(
      value as SignalValue,
    );
  };

  const dragSignal = (
    event: DragEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      value,
    );
  };

  const dropSignal = (
    event: DragEvent<HTMLButtonElement>,
    target: string,
  ) => {
    event.preventDefault();

    const value =
      event.dataTransfer.getData(
        "text/plain",
      );

    if (value) {
      placeSignal(target, value);
    }
  };

  const guardarExplicacion = () => {
    if (!explanation.trim()) {
      showToast(
        "Escribe una explicación corta antes de guardarla.",
        true,
      );

      return;
    }

    showToast(
      "Explicación guardada como evidencia.",
    );
  };

  const comprobar = () => {
    if (progress < 4) {
      showToast(
        "Ubica las cuatro señales para activar el radar.",
        true,
      );

      return;
    }

    const total = targets.filter(
      (target) =>
        placements[target] === target,
    ).length;

    if (total === 4) {
      showToast(
        "¡Excelente! Radar calibrado.",
      );

      window.setTimeout(() => {
        navigate(
          "/actividades/mathnumbers/actividad-completada",
          {
            state: {
              activity:
                "radar-supervivencia",
              retryRoute: radarRoute,
              nextRoute: ascensorRoute,
            },
          },
        );
      }, 700);

      return;
    }

    showToast(
      "Hay señales en posiciones incorrectas. Inténtalo de nuevo.",
      true,
    );

    window.setTimeout(() => {
      navigate(
        total >= 2
          ? "/actividades/mathnumbers/casi-lo-logras"
          : "/actividades/mathnumbers/vuelve-a-intentarlo",
        {
          state: {
            activity:
              "radar-supervivencia",
            retryRoute: radarRoute,
          },
        },
      );
    }, 900);
  };

  return (
    <main className="mnx-cofre-page mnx-radar-page">
      <button
        type="button"
        className={`mnx-hamburger-btn ${
          menuOpen
            ? "mnx-hamburger-open"
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
          className="mnx-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-sidebar ${
          menuOpen
            ? "mnx-sidebar-open"
            : ""
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
            className="mnx-menu-item"
            type="button"
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
              irARuta(
                "/perfil-alumno",
              )
            }
          >
            <FiUser />

            <span>
              Perfil del alumno
            </span>
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
              showToast(
                "Ayuda: selecciona o arrastra cada señal hasta su número.",
              )
            }
          >
            <FiHelpCircle />
            Ayuda
          </button>

          <button
            type="button"
            className="mnx-cofre-ghost-btn mnx-cofre-wide"
            onClick={() =>
              irARuta(
                activityListRoute,
              )
            }
          >
            <span>←</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-cofre-header">
          <div className="mnx-cofre-header-copy">
            <div className="mnx-cofre-crumb">
              <strong>
                MathNumbers
              </strong>

              <span>/</span>

              <span>
                Tema 2: Positivos y
                negativos
              </span>
            </div>

            <div className="mnx-cofre-title-row">
              <span
                className="mnx-radar-title-icon"
                aria-hidden="true"
              >
                <FiTarget />
              </span>

              <h1>
                El Radar de
                Supervivencia
              </h1>
            </div>

            <p>
              Ubica números positivos y
              negativos en la recta
              numérica.
              <br />
              Cada señal correcta ayudará
              a calibrar el radar de la
              base.
            </p>
          </div>

          <div className="mnx-cofre-welcome-wrap">
            <article className="mnx-cofre-speech">
              <strong>
                ¡Atención, explorador!
              </strong>

              <span>
                Usa el 0 como punto de
                referencia: los negativos
                van a la izquierda y los
                positivos a la derecha.
              </span>
            </article>

            <img
              className="mnx-cofre-hero-robot"
              src={cofreHero}
              alt="Comandante Suma"
            />
          </div>
        </header>

        <section className="mnx-radar-activity-grid">
          <article className="mnx-radar-art">
            <img
              src={radarImage}
              alt="Radar de supervivencia"
            />

            <div className="mnx-radar-mission">
              <FiTarget />

              <div>
                <strong>
                  Tu misión
                </strong>

                <p>
                  Coloca las cuatro
                  señales en la posición
                  correcta de la recta
                  numérica.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-cofre-guide-card mnx-radar-guide-card">
            <div className="mnx-cofre-card-title">
              <span>↔</span>

              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-radar-guide-copy">
              <strong className="negative">
                Negativos a la izquierda
                del 0
              </strong>

              <strong className="positive">
                Positivos a la derecha
                del 0
              </strong>
            </div>

            <NumberAxis variant="guide" />
          </section>

          <section className="mnx-radar-placement-card">
            <div className="mnx-cofre-question-head">
              <span>1</span>

              <h2>
                Arrastra o selecciona
                cada señal y colócala en
                su número.
              </h2>
            </div>

            <div className="mnx-radar-signals">
              {signals.map((signal) => (
                <button
                  key={signal.value}
                  type="button"
                  draggable
                  className={`mnx-radar-signal ${signal.type} ${
                    selectedSignal ===
                    signal.value
                      ? "selected"
                      : ""
                  }`}
                  onDragStart={(event) =>
                    dragSignal(
                      event,
                      signal.value,
                    )
                  }
                  onClick={() =>
                    setSelectedSignal(
                      signal.value,
                    )
                  }
                >
                  {signal.type ===
                  "ally" ? (
                    <FiShield />
                  ) : (
                    <FiTarget />
                  )}

                  <span>
                    <small>
                      {signal.label}
                    </small>

                    <strong>
                      {formatSigned(
                        signal.value,
                      )}
                    </strong>
                  </span>
                </button>
              ))}
            </div>

            <div className="mnx-radar-drop-zone">
              <div className="mnx-radar-targets">
                {targets.map(
                  (target) => {
                    const placedValue =
                      placements[target];

                    const signal =
                      getSignal(
                        placedValue,
                      );

                    return (
                      <button
                        key={target}
                        type="button"
                        style={{
                          gridColumn:
                            numberToColumn(
                              target,
                            ),
                        }}
                        className={`mnx-radar-target ${
                          placedValue
                            ? "filled"
                            : ""
                        } ${
                          signal?.type ||
                          ""
                        }`}
                        onDragOver={(
                          event,
                        ) =>
                          event.preventDefault()
                        }
                        onDrop={(
                          event,
                        ) =>
                          dropSignal(
                            event,
                            target,
                          )
                        }
                        onClick={() =>
                          selectedSignal &&
                          placeSignal(
                            target,
                            selectedSignal,
                          )
                        }
                        aria-label={`Colocar señal en ${target}`}
                      >
                        {placedValue ? (
                          formatSigned(
                            placedValue,
                          )
                        ) : (
                          <FiArrowDown />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              <NumberAxis variant="work" />
            </div>
          </section>

          <section className="mnx-cofre-reminder-card mnx-radar-reminder">
            <img
              src={cofreGuide}
              alt="Comandante Suma"
            />

            <p>
              <strong>
                Recuerda:
              </strong>{" "}
              cuanto más negativo es un
              número, más lejos queda a
              la izquierda del cero.
            </p>

            <span>↔</span>
          </section>

          <section className="mnx-cofre-question-card mnx-radar-question">
            <div className="mnx-cofre-question-head">
              <span>2</span>

              <h2>
                ¿Por qué -4 queda más
                lejos a la izquierda que
                -2?
              </h2>
            </div>

            <label className="mnx-radar-answer-box">
              <textarea
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
                {explanation.length} /
                300
              </span>
            </label>

            <button
              type="button"
              className="mnx-radar-save-btn"
              onClick={
                guardarExplicacion
              }
            >
              <FiSave />
              Guardar explicación
            </button>
          </section>

          <section className="mnx-radar-actions">
            <button
              type="button"
              className="mnx-cofre-check-btn"
              onClick={comprobar}
            >
              <FiCheckCircle />
              Comprobar posiciones
            </button>

            <p className="mnx-radar-progress">
              Progreso: {progress}/4
              señales colocadas
            </p>

            <article className="mnx-cofre-evidence-card">
              <div className="mnx-cofre-evidence-title">
                <FiClipboard />

                <strong>
                  Evidencia guardada
                </strong>
              </div>

              <p>
                Tus posiciones y
                explicación se registran
                automáticamente.
              </p>

              <div className="mnx-cofre-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus
                  aciertos y errores en
                  Retroalimentación.
                </p>
              </div>
            </article>
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

function NumberAxis({
  variant,
}: {
  variant: "guide" | "work";
}) {
  return (
    <div
      className={`mnx-radar-axis mnx-radar-axis-${variant}`}
    >
      <span className="mnx-radar-axis-arrow left" />
      <span className="mnx-radar-axis-line" />
      <span className="mnx-radar-axis-arrow right" />

      <div className="mnx-radar-ticks">
        {numberLine.map((number) => (
          <span
            key={number}
            className={
              number === 0
                ? "zero"
                : ""
            }
            data-value={number}
          />
        ))}
      </div>
    </div>
  );
}