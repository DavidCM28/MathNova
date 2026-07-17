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

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { ResultModal } from "../components/ResultModal";
import { useToast } from "../hooks/useToast";
import { guardarProgresoActividad } from "../../../services/progresoService";
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

  /*
   * Controla la ventana de resultado.
   */
  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

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

  /*
   * Cierra el modal y deja Radar desde cero.
   */
  const repetirActividad = () => {
    setResultModalOpen(false);
    setSelectedSignal(null);
    setPlacements({});
    setExplanation("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Radar reiniciado. ¡Vuelve a colocar las señales!",
    );
  };

  const comprobar = async () => {
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

    // 1. Obtener el ID de usuario de la sesión
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
    const nuevasEstrellas = total === 4 ? 3 : total >= 2 ? 1 : 0;
    const esCorrecto = total === 4;

    // 3. Estructurar el Payload para enviar
    const payload = {
      id_usuario: idUsuario,
      mundo: "mathnumbers",
      tema: "Tema 2: Positivos y negativos",
      actividad_codigo: "radar-supervivencia",
      actividad_titulo: "El Radar de Supervivencia",
      aciertos: total,
      total_preguntas: 4,
      precision: (total / 4) * 100,
      estrellas_obtenidas: nuevasEstrellas,
      xp_obtenido: total * 10,
      completada: esCorrecto,
      tiempo_segundos: 0,
      respuestas: {
        posiciones_usuario: placements,
        explicacion_texto: explanation,
      },
    };

    try {
      // --- MEJORA: Comprobar si ya había jugado y ganado estrellas antes ---
      const progresoKey = `progreso_${idUsuario}_radar-supervivencia`;
      const progresoPrevioRaw = localStorage.getItem(progresoKey);
      let yaTeniaEstrellas = false;
      let estrellasAnteriores = 0;

      if (progresoPrevioRaw) {
        const progresoPrevio = JSON.parse(progresoPrevioRaw);
        estrellasAnteriores = progresoPrevio.estrellas_obtenidas || 0;
        yaTeniaEstrellas = estrellasAnteriores > 0;
      }

      // Guardamos el progreso en el backend
      await guardarProgresoActividad(payload);

      // Guardamos localmente el progreso actual para futuras consultas rápidas
      localStorage.setItem(
        progresoKey, 
        JSON.stringify({ estrellas_obtenidas: Math.max(estrellasAnteriores, nuevasEstrellas) })
      );

      if (esCorrecto) {
        if (yaTeniaEstrellas) {
          // Mensaje elegante para cuando ya tenía estrellas en este nivel
          showToast(
            `¡Increíble! Has vuelto a calibrar el radar. Ya cuentas con las ${estrellasAnteriores} ⭐ de este nivel en tu perfil.`,
            false
          );
        } else {
          // Mensaje para la primera vez que lo completa exitosamente
          showToast(`¡Excelente! Radar calibrado. ¡Has ganado ${nuevasEstrellas} estrellas! ⭐`);
        }

        window.setTimeout(() => {
          navigate(
            "/actividades/mathnumbers/actividad-completada",
            {
              state: {
                activity: "radar-supervivencia",
                retryRoute: radarRoute,
                nextRoute: ascensorRoute,
              },
            },
          );
        }, 1200); // Damos un poco más de tiempo para leer el mensaje elegante

        return;
      }

      // Si falla en ordenar
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
              activity: "radar-supervivencia",
              retryRoute: radarRoute,
            },
          },
        );
      }, 900);

    } catch (error) {
      console.error(error);
      showToast("Error de conexión: No se pudo guardar el progreso.", true);
    }
  };
  


  return (
    <main className="mnx-radar-page">
      <button
        type="button"
        className={`mnx-radar-hamburger ${
          menuOpen
            ? "mnx-radar-hamburger-open"
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
          className="mnx-radar-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-radar-sidebar ${
          menuOpen
            ? "mnx-radar-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-radar-sidebar-logo"
        />

        <nav className="mnx-radar-sidebar-menu">
          <button
            className="mnx-radar-menu-item"
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
            className="mnx-radar-menu-item mnx-radar-menu-active"
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
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/retroalimentacion")
            }
          >
            <FiMessageSquare />

            <span>
              Retroalimentación
            </span>
          </button>

          <button
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />

            <span>Recompensas</span>
          </button>

          <button
            className="mnx-radar-menu-item"
            type="button"
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
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />

            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mnx-radar-sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="mnx-radar-sidebar-fox"
          />
        </div>
      </aside>

      <section className="mnx-radar-main">
        <div className="mnx-radar-top-actions">
          <button
            type="button"
            className="mnx-radar-ghost-btn"
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
            className="mnx-radar-ghost-btn mnx-radar-exit-btn"
            onClick={() =>
              irARuta(activityListRoute)
            }
          >
            <span>←</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-radar-header">
          <div className="mnx-radar-header-copy">
            <div className="mnx-radar-breadcrumb">
              <strong>
                MathNumbers
              </strong>

              <span>/</span>

              <span>
                Tema 2: Positivos y negativos
              </span>
            </div>

            <div className="mnx-radar-title-row">
              <span
                className="mnx-radar-title-icon"
                aria-hidden="true"
              >
                <FiTarget />
              </span>

              <h1>
                El Radar de Supervivencia
              </h1>
            </div>

            <p>
              Ubica números positivos y negativos
              en la recta numérica.
              <br />
              Cada señal correcta ayudará a
              calibrar el radar de la base.
            </p>
          </div>

          <div className="mnx-radar-welcome">
            <article className="mnx-radar-speech">
              <strong>
                ¡Atención, explorador!
              </strong>

              <span>
                Usa el 0 como punto de referencia:
                los negativos van a la izquierda y
                los positivos a la derecha.
              </span>
            </article>

            <img
              className="mnx-radar-hero"
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
                  Coloca las cuatro señales en la
                  posición correcta de la recta
                  numérica.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-radar-guide-card">
            <div className="mnx-radar-card-title">
              <span>↔</span>

              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-radar-guide-copy">
              <strong className="negative">
                Negativos a la izquierda del 0
              </strong>

              <strong className="positive">
                Positivos a la derecha del 0
              </strong>
            </div>

            <NumberAxis variant="guide" />
          </section>

          <section className="mnx-radar-placement-card">
            <div className="mnx-radar-question-head">
              <span>1</span>

              <h2>
                Arrastra o selecciona cada señal y
                colócala en su número.
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
                {targets.map((target) => {
                  const placedValue =
                    placements[target];

                  const signal =
                    getSignal(placedValue);

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
                        signal?.type || ""
                      }`}
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
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
                })}
              </div>

              <NumberAxis variant="work" />
            </div>
          </section>

          <section className="mnx-radar-reminder-card mnx-radar-reminder">
            <img
              src={cofreGuide}
              alt="Comandante Suma"
            />

            <p>
              <strong>
                Recuerda:
              </strong>{" "}
              cuanto más negativo es un número,
              más lejos queda a la izquierda del
              cero.
            </p>

            <span>↔</span>
          </section>

          <section className="mnx-radar-question-card mnx-radar-question">
            <div className="mnx-radar-question-head">
              <span>2</span>

              <h2>
                ¿Por qué -4 queda más lejos a la
                izquierda que -2?
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
                {explanation.length} / 300
              </span>
            </label>

            <button
              type="button"
              className="mnx-radar-save-btn"
              onClick={guardarExplicacion}
            >
              <FiSave />
              Guardar explicación
            </button>
          </section>

          <section className="mnx-radar-actions">
            <button
              type="button"
              className="mnx-radar-check-btn"
              onClick={comprobar}
            >
              <FiCheckCircle />
              Comprobar posiciones
            </button>

            <p className="mnx-radar-progress">
              Progreso: {progress}/4 señales
              colocadas
            </p>

            <article className="mnx-radar-evidence-card">
              <div className="mnx-radar-evidence-title">
                <FiClipboard />

                <strong>
                  Evidencia guardada
                </strong>
              </div>

              <p>
                Tus posiciones y explicación se
                registran automáticamente.
              </p>

              <div className="mnx-radar-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus aciertos y
                  errores en Retroalimentación.
                </p>
              </div>
            </article>
          </section>
        </section>
      </section>

      <button
        className="mnx-radar-logout-float"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {resultModalOpen && (
        <ResultModal
          kind="completed"
          nextRoute={ascensorRoute}
          retryRoute={radarRoute}
          onClose={() =>
            setResultModalOpen(false)
          }
          onRetry={repetirActividad}
        />
      )}

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