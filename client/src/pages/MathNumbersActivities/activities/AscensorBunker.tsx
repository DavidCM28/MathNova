import "./AscensorBunker.css";
import "./CofreBienvenida.css";

import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiSave,
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
  ascensorCommander,
  ascensorElevator,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

import { formatSigned } from "../utils/formatSigned";

/*
 * Ruta de esta actividad.
 *
 * Se utiliza para que el botón "Repetir actividad"
 * vuelva correctamente al Ascensor del Búnker.
 */
const ascensorRoute =
  "/actividades/mathnumbers/ascensor-bunker";

/*
 * Orden correcto que valida la actividad.
 *
 * No lo cambies si solamente quieres modificar
 * los números de la guía visual.
 */
const correctOrder = [-5, -2, 0, 3, 6];

/*
 * Tarjetas que el estudiante debe ordenar.
 */
const floorCards = [3, -5, 0, 6, -2];

/*
 * Números independientes de la Guía visual rápida.
 *
 * Puedes cambiar solamente estos números y no se
 * modificará la respuesta correcta ni el funcionamiento
 * de la actividad.
 *
 * Ejemplo:
 *
 * const guideNumbers = [-8, -3, 0, 4, 9];
 */
const guideNumbers = [-8, -3, 0, 4, 9];

const emptySlots: (number | null)[] = [
  null,
  null,
  null,
  null,
  null,
];

export function AscensorBunker() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    selectedFloor,
    setSelectedFloor,
  ] = useState<number | null>(null);

  const [slots, setSlots] =
    useState<(number | null)[]>(emptySlots);

  const [explanation, setExplanation] =
    useState("");

  /*
   * Controla la ventana modal de actividad completada.
   */
  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const progress = slots.filter(
    (slot) => slot !== null,
  ).length;

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

  const placeFloor = (
    index: number,
    value: number,
  ) => {
    setSlots((current) => {
      const next = current.map((slot) =>
        slot === value ? null : slot,
      );

      next[index] = value;

      return next;
    });

    setSelectedFloor(value);
  };

  const dragFloor = (
    event: DragEvent<HTMLButtonElement>,
    value: number,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      String(value),
    );
  };

  const dropFloor = (
    event: DragEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();

    const value = Number(
      event.dataTransfer.getData("text/plain"),
    );

    if (!Number.isNaN(value)) {
      placeFloor(index, value);
    }
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

  /*
   * Cierra el modal y reinicia completamente
   * el Ascensor del Búnker.
   */
  const repetirActividad = () => {
    setResultModalOpen(false);
    setSelectedFloor(null);
    setSlots([...emptySlots]);
    setExplanation("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Ascensor reiniciado. ¡Ordena los pisos nuevamente!",
    );
  };

  const verificar = async () => {
    if (progress < 5) {
      showToast(
        "Coloca las cinco tarjetas en el ascensor.",
        true,
      );
      return;
    }

    const total = correctOrder.filter(
      (value, index) => slots[index] === value,
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
    const nuevasEstrellas = total === 5 ? 3 : total >= 3 ? 1 : 0;
    const esCorrecto = total === 5;

    // 3. Estructurar el Payload para enviar
    const payload = {
      id_usuario: idUsuario,
      mundo: "mathnumbers",
      tema: "Tema 2: Positivos y negativos",
      actividad_codigo: "ascensor-bunker",
      actividad_titulo: "El Ascensor del Búnker",
      aciertos: total,
      total_preguntas: 5,
      precision: (total / 5) * 100,
      estrellas_obtenidas: nuevasEstrellas,
      xp_obtenido: total * 10,
      completada: esCorrecto,
      tiempo_segundos: 0,
      respuestas: {
        slots_usuario: slots,
        explicacion_texto: explanation,
      },
    };

    try {
      // --- MEJORA: Comprobar si ya había jugado y ganado estrellas antes ---
      // Consultamos el progreso guardado en el localStorage como caché rápida del estado del usuario
      const progresoKey = `progreso_${idUsuario}_ascensor-bunker`;
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
      localStorage.setItem(progresoKey, JSON.stringify({ estrellas_obtenidas: Math.max(estrellasAnteriores, nuevasEstrellas) }));

      if (esCorrecto) {
        if (yaTeniaEstrellas) {
          // Mensaje elegante para cuando ya tenía estrellas en este nivel
          showToast(
            `¡Increíble! Has vuelto a superar el nivel. Ya cuentas con las ${estrellasAnteriores} ⭐ de este búnker en tu perfil.`,
            false
          );
        } else {
          // Mensaje para la primera vez que lo completa exitosamente
          showToast(`¡Ruta correcta! Ascensor restablecido. ¡Has ganado ${nuevasEstrellas} estrellas! ⭐`);
        }

        window.setTimeout(() => {
          setResultModalOpen(true);
        }, 1200); // Damos un poco más de tiempo para leer el mensaje elegante

        return;
      }

      // Si falla en ordenar
      showToast(
        "El orden no es correcto. Inténtalo de nuevo.",
        true,
      );

      window.setTimeout(() => {
        navigate(
          total >= 3
            ? "/actividades/mathnumbers/casi-lo-logras"
            : "/actividades/mathnumbers/vuelve-a-intentarlo",
          {
            state: {
              activity: "ascensor-bunker",
              retryRoute: ascensorRoute,
              nextRoute: activityListRoute,
            },
          },
        );
      }, 900);

    } catch (error) {
      console.error(error);
      showToast("Error de conexión: No se pudo verificar tu progreso.", true);
    }
  };
  

  return (
    <main className="mnx-cofre-page mnx-ascensor-page">
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

            <span>
              Recompensas
            </span>
          </button>

          <button
            className="mnx-menu-item"
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
            className="mnx-menu-item"
            type="button"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />

            <span>
              Estadísticas
            </span>
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
                "Ayuda: arrastra o selecciona cada tarjeta y colócala en el piso correcto, de menor a mayor.",
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
              irARuta(activityListRoute)
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
                Tema 2: Positivos y negativos
              </span>
            </div>

            <div className="mnx-cofre-title-row">
              <span
                className="mnx-ascensor-title-icon"
                aria-hidden="true"
              >
                <FiTarget />
              </span>

              <h1>
                El Ascensor del Búnker
              </h1>
            </div>

            <p>
              Ordena números positivos y negativos
              de menor a mayor para restablecer la
              ruta del ascensor.
              <br />
              Cada piso bien ubicado acerca al
              ascensor a la superficie.
            </p>
          </div>

          <div className="mnx-cofre-welcome-wrap">
            <article className="mnx-cofre-speech">
              <strong>
                ¡Sistema en espera!
              </strong>

              <span>
                Los sótanos son negativos, la
                superficie es el 0 y las torres son
                positivas: ordénalos de menor a mayor.
              </span>
            </article>

            <img
              className="mnx-cofre-hero-robot"
              src={ascensorCommander}
              alt="Comandante Suma"
            />
          </div>
        </header>

        <section className="mnx-ascensor-activity-grid">
          <article className="mnx-ascensor-art">
            <img
              src={ascensorElevator}
              alt="Ascensor del Búnker"
            />

            <div className="mnx-ascensor-mission">
              <FiTarget />

              <div>
                <strong>
                  Tu misión
                </strong>

                <p>
                  Ordena las tarjetas de números
                  de menor a mayor para restablecer
                  la ruta del ascensor.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-cofre-guide-card mnx-ascensor-guide-card">
            <div className="mnx-cofre-card-title">
              <span>
                <FiHelpCircle />
              </span>

              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-ascensor-guide-labels">
              <span className="negative">
                Los sótanos son negativos
              </span>

              <span className="zero">
                El nivel del suelo es 0
              </span>

              <span className="positive">
                Las torres son positivas
              </span>
            </div>

            <div className="mnx-ascensor-guide-chips">
              {guideNumbers.map(
                (value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="mnx-ascensor-chip-wrap"
                  >
                    <span
                      className={`mnx-ascensor-chip ${
                        value < 0
                          ? "negative"
                          : value > 0
                            ? "positive"
                            : "zero"
                      }`}
                    >
                      {formatSigned(value)}
                    </span>

                    {index <
                      guideNumbers.length - 1 && (
                      <span className="mnx-ascensor-chip-arrow">
                        →
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mnx-ascensor-placement-card">
            <div className="mnx-cofre-question-head">
              <span>1</span>

              <h2>
                Arrastra o selecciona cada tarjeta
                y colócala en su piso.
              </h2>
            </div>

            <div className="mnx-ascensor-floor-cards">
              {floorCards.map((floor) => (
                <button
                  key={floor}
                  type="button"
                  draggable
                  className={`mnx-ascensor-floor-card ${
                    floor < 0
                      ? "negative"
                      : floor > 0
                        ? "positive"
                        : "zero"
                  } ${
                    selectedFloor === floor
                      ? "selected"
                      : ""
                  }`}
                  onDragStart={(event) =>
                    dragFloor(event, floor)
                  }
                  onClick={() =>
                    setSelectedFloor(floor)
                  }
                >
                  {formatSigned(floor)}
                </button>
              ))}
            </div>

            <div className="mnx-ascensor-drop-zone">
              <span className="mnx-ascensor-order-label from">
                Menor
              </span>

              <div className="mnx-ascensor-slots">
                {slots.map((slot, index) => (
                  <div
                    key={`slot-${index}`}
                    className="mnx-ascensor-slot-wrap"
                  >
                    <button
                      type="button"
                      className={`mnx-ascensor-slot ${
                        slot !== null
                          ? "filled"
                          : ""
                      } ${
                        slot !== null &&
                        slot < 0
                          ? "negative"
                          : ""
                      }`}
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        dropFloor(
                          event,
                          index,
                        )
                      }
                      onClick={() =>
                        selectedFloor !== null &&
                        placeFloor(
                          index,
                          selectedFloor,
                        )
                      }
                    >
                      {slot !== null ? (
                        formatSigned(slot)
                      ) : (
                        <FiArrowRight />
                      )}
                    </button>

                    <span className="mnx-ascensor-slot-label">
                      Piso {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <span className="mnx-ascensor-order-label to">
                Mayor
              </span>
            </div>
          </section>

          <section className="mnx-cofre-reminder-card mnx-ascensor-reminder">
            <img
              src={ascensorCommander}
              alt="Comandante Suma"
            />

            <p>
              <strong>
                Recuerda:
              </strong>{" "}
              los negativos más grandes en valor
              van más abajo. Observa qué número
              está más a la izquierda en la recta
              numérica.
            </p>

            <span>↕</span>
          </section>

          <section className="mnx-cofre-question-card mnx-ascensor-question">
            <div className="mnx-cofre-question-head">
              <span>2</span>

              <h2>
                ¿Por qué este es el orden correcto?
              </h2>
            </div>

            <label className="mnx-ascensor-answer-box">
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
              className="mnx-ascensor-save-btn"
              onClick={guardarExplicacion}
            >
              <FiSave />
              Guardar explicación
            </button>
          </section>

          <section className="mnx-ascensor-actions">
            <button
              type="button"
              className="mnx-cofre-check-btn"
              onClick={verificar}
            >
              <FiCheckCircle />
              Comprobar orden
            </button>

            <p className="mnx-ascensor-progress">
              Progreso: {progress}/5 pisos
              colocados
            </p>

            <article className="mnx-cofre-evidence-card">
              <div className="mnx-cofre-evidence-title">
                <FiClipboard />

                <strong>
                  Evidencia guardada
                </strong>
              </div>

              <p>
                Tu orden, intentos y progreso se
                guardan automáticamente.
              </p>

              <div className="mnx-cofre-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus resultados
                  en Retroalimentación.
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

      {resultModalOpen && (
        <ResultModal
          kind="completed"
          nextRoute={activityListRoute}
          retryRoute={ascensorRoute}
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