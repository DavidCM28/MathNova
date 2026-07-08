import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Actividad3MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad3/act_3_banner_MathGeometry.png";
import zorritoInstrucciones from "../../assets/mathGeometry/actividad3/zorrito_instrucciones_actividad_3.png";
import bytePista from "../../assets/mathGeometry/actividad3/byte_pista_actividad_3.png";
import profesorConsejo from "../../assets/mathGeometry/actividad3/profesor_dando_consejo_actividad_3.png";

import reto1 from "../../assets/mathGeometry/actividad3/reto_1_actividad_3_MathGeometry.jpeg";
import reto2 from "../../assets/mathGeometry/actividad3/reto_2_actividad_3_MathGeometry.jpeg";
import reto3 from "../../assets/mathGeometry/actividad3/reto_3_actividad_3_MathGeometry.jpeg";
import reto4 from "../../assets/mathGeometry/actividad3/reto_4_actividad_3_MathGeometry.jpeg";
import reto5 from "../../assets/mathGeometry/actividad3/reto_5_actividad_3_MathGeometry.jpeg";

import {
  FiBarChart2,
  FiCheck,
  FiClock,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiTarget,
  FiUser,
  FiX,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   TIPOS
   ========================================================= */

type AnguloId = "agudo" | "recto" | "obtuso";
type EstadoRespuesta = "pendiente" | "correcto" | "incorrecto" | "cambiando";

type Reto = {
  id: number;
  imagen: string;
  respuesta: AnguloId;
  pistaByte: string;
  consejo: string;
};

/* =========================================================
   DATA DE LA ACTIVIDAD
   ========================================================= */

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    respuesta: "agudo",
    pistaByte:
      "Observa si la apertura es menor que un ángulo recto. Si se ve más cerrada, puede ser aguda.",
    consejo: "Si la apertura es menor que 90°, es un ángulo agudo.",
  },
  {
    id: 2,
    imagen: reto2,
    respuesta: "recto",
    pistaByte:
      "Busca una esquina como de escuadra. Si forma una L perfecta, estás viendo un ángulo recto.",
    consejo:
      "Si forma 90°, es recto. Parece la esquina de una puerta o una hoja.",
  },
  {
    id: 3,
    imagen: reto3,
    respuesta: "agudo",
    pistaByte:
      "Compara la apertura con una esquina de 90°. Si queda más pequeña, el ángulo es agudo.",
    consejo:
      "Un ángulo agudo es menor que 90°. No necesitas medir, solo comparar visualmente.",
  },
  {
    id: 4,
    imagen: reto4,
    respuesta: "obtuso",
    pistaByte:
      "Observa si la puerta está muy abierta. Si supera una esquina recta, puede ser obtuso.",
    consejo: "Si es mayor que 90° y menor que 180°, es un ángulo obtuso.",
  },
  {
    id: 5,
    imagen: reto5,
    respuesta: "agudo",
    pistaByte:
      "Mira el espacio marcado por el arco. Si la abertura es pequeña, selecciona agudo.",
    consejo:
      "Primero imagina una L de 90°. Después decide si la apertura es menor, igual o mayor.",
  },
];

const OPCIONES: Array<{
  id: AnguloId;
  nombre: string;
  descripcion: string;
  simbolo: string;
}> = [
  {
    id: "agudo",
    nombre: "Ángulo agudo",
    descripcion: "Menor que 90°",
    simbolo: "∠",
  },
  {
    id: "recto",
    nombre: "Ángulo recto",
    descripcion: "Igual a 90°",
    simbolo: "⊥",
  },
  {
    id: "obtuso",
    nombre: "Ángulo obtuso",
    descripcion: "Mayor que 90°",
    simbolo: "⌟",
  },
];

const TEXTO_NOVA =
  "Explorador, observa la apertura de la puerta y elige el tipo de ángulo correcto para continuar.";

function formatearTiempo(segundos: number) {
  const minutos = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const seg = (segundos % 60).toString().padStart(2, "0");

  return `${minutos}:${seg}`;
}

function Actividad3MathGeometry() {
  const navigate = useNavigate();
  const timeoutCambioRef = useRef<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [retoActual, setRetoActual] = useState(0);
  const [seleccion, setSeleccion] = useState<AnguloId | "">("");
  const [estadoRespuesta, setEstadoRespuesta] =
    useState<EstadoRespuesta>("pendiente");
  const [intentosReto, setIntentosReto] = useState(1);
  const [erroresTotales, setErroresTotales] = useState(0);
  const [modalCompletado, setModalCompletado] = useState(false);
  const [segundos, setSegundos] = useState(0);

  const reto = RETOS[retoActual];

  const retosCompletados = modalCompletado
    ? RETOS.length
    : estadoRespuesta === "correcto" || estadoRespuesta === "cambiando"
      ? retoActual + 1
      : retoActual;

  const progreso = Math.round((retosCompletados / RETOS.length) * 100);
  const xpGanado = 40 + retosCompletados * 16;
  const novaXp = 120 + retosCompletados * 10;
  const cristales = retosCompletados * 3;

  const textoEstado = useMemo(() => {
    if (estadoRespuesta === "correcto" || estadoRespuesta === "cambiando") {
      return "Respuesta correcta";
    }

    if (estadoRespuesta === "incorrecto") {
      return "Inténtalo otra vez";
    }

    return "Elige una opción";
  }, [estadoRespuesta]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!modalCompletado) {
        setSegundos((prev) => prev + 1);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [modalCompletado]);

  useEffect(() => {
    const bloquearPantalla = menuOpen || modalCompletado;
    const anchoScrollbar =
      window.innerWidth - document.documentElement.clientWidth;

    if (bloquearPantalla) {
      document.body.classList.add("act3geo-body-locked");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${Math.max(anchoScrollbar, 0)}px`;
    } else {
      document.body.classList.remove("act3geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.classList.remove("act3geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    };
  }, [menuOpen, modalCompletado]);

  useEffect(() => {
    return () => {
      if (timeoutCambioRef.current) {
        window.clearTimeout(timeoutCambioRef.current);
      }
    };
  }, []);

  const irARuta = (ruta: string) => {
    if (timeoutCambioRef.current) {
      window.clearTimeout(timeoutCambioRef.current);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const pasarAlSiguienteReto = () => {
    if (retoActual + 1 >= RETOS.length) {
      setModalCompletado(true);
      return;
    }

    setRetoActual((prev) => prev + 1);
    setSeleccion("");
    setEstadoRespuesta("pendiente");
    setIntentosReto(1);
  };

  const comprobarRespuesta = () => {
    if (!seleccion || estadoRespuesta === "cambiando") {
      setEstadoRespuesta("incorrecto");
      return;
    }

    if (seleccion === reto.respuesta) {
      setEstadoRespuesta("correcto");

      timeoutCambioRef.current = window.setTimeout(() => {
        setEstadoRespuesta("cambiando");

        timeoutCambioRef.current = window.setTimeout(() => {
          pasarAlSiguienteReto();
        }, 380);
      }, 850);

      return;
    }

    setErroresTotales((prev) => prev + 1);
    setIntentosReto((prev) => Math.min(prev + 1, 3));
    setEstadoRespuesta("incorrecto");
  };

  const reiniciarActividad = () => {
    if (timeoutCambioRef.current) {
      window.clearTimeout(timeoutCambioRef.current);
    }

    setRetoActual(0);
    setSeleccion("");
    setEstadoRespuesta("pendiente");
    setIntentosReto(1);
    setErroresTotales(0);
    setModalCompletado(false);
    setSegundos(0);
  };

  const cerrarModalCompletado = () => {
    reiniciarActividad();
  };

  return (
    <main className="act3geo-page">
      <button
        type="button"
        className={`act3geo-hamburger-btn ${
          menuOpen ? "act3geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act3geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act3geo-sidebar ${menuOpen ? "act3geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act3geo-sidebar-logo" />

        <nav className="act3geo-sidebar-menu">
          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item act3geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="act3geo-sidebar-progress-area">
          <article className="act3geo-side-week-card">
            <div className="act3geo-side-week-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="act3geo-side-progress">
              <span>★</span>
              <div>
                <b></b>
              </div>
              <strong>60%</strong>
            </div>
          </article>
        </div>
      </aside>

      <section className="act3geo-content">
        <img src={heroBanner} alt="Banner Actividad 3" className="act3geo-bg" />

        <section className="act3geo-main">
          <div className="act3geo-breadcrumb">
            <button type="button" onClick={() => irARuta("/seleccion-mundos")}>
              Mundos
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              Actividades MathGeometry
            </button>
            <span>›</span>
            <button type="button" className="act3geo-breadcrumb-current">
              Act 3
            </button>
          </div>

          <header className="act3geo-topbar">
            <div className="act3geo-title-area">
              <div className="act3geo-pills">
                <span>▣ Introducción</span>
                <span>◉ 8–12 min</span>
                <span>★ 3 intentos</span>
              </div>

              <h1>Actividad 3 Detectores de Giro</h1>

              <p className="act3geo-subtitle">
                Observa la apertura de la puerta y selecciona si el ángulo es
                agudo, recto u obtuso.
              </p>
            </div>

            <div className="act3geo-actions-top">
              <button
                type="button"
                onClick={() => irARuta("/actividades/geometria")}
              >
                <FiLogOut />
                Salir
              </button>
            </div>
          </header>

          <section className="act3geo-nova-row">
            <div className="act3geo-nova-badge">
              <img src={zorritoInstrucciones} alt="Nova dando instrucciones" />
            </div>

            <p>{TEXTO_NOVA}</p>
          </section>

          <section className="act3geo-layout">
            <article
              className={`act3geo-board ${
                estadoRespuesta === "cambiando" ? "act3geo-board-changing" : ""
              }`}
            >
              <div className="act3geo-board-head">
                <h2>
                  <FiFlag /> Reto {retoActual + 1} de {RETOS.length}
                </h2>

                <span
                  className={`act3geo-status-pill act3geo-status-${estadoRespuesta}`}
                >
                  {textoEstado}
                </span>
              </div>

              <section
                className="act3geo-progress-card act3geo-progress-card-inside"
                aria-label="Progreso del reto"
              >
                <div className="act3geo-progress-copy">
                  <strong>Progreso</strong>
                  <span>{progreso}% completado</span>
                </div>

                <div className="act3geo-progress-track">
                  <b style={{ width: `${progreso}%` }}></b>
                </div>
              </section>

              <div className="act3geo-door-stage">
                <img
                  src={reto.imagen}
                  alt={`Puerta del reto ${reto.id}`}
                  className="act3geo-door-img"
                />
              </div>

              <div className="act3geo-question-row">
                <strong>Elige el tipo de ángulo:</strong>
              </div>

              <div className="act3geo-options">
                {OPCIONES.map((opcion) => {
                  const seleccionada = seleccion === opcion.id;
                  const esCorrecta =
                    estadoRespuesta !== "pendiente" &&
                    opcion.id === reto.respuesta;
                  const esIncorrecta =
                    estadoRespuesta === "incorrecto" &&
                    seleccionada &&
                    opcion.id !== reto.respuesta;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={`act3geo-option act3geo-option-${opcion.id} ${
                        seleccionada ? "act3geo-option-selected" : ""
                      } ${esCorrecta ? "act3geo-option-correct" : ""} ${
                        esIncorrecta ? "act3geo-option-wrong" : ""
                      }`}
                      onClick={() => {
                        if (estadoRespuesta === "cambiando") return;
                        setSeleccion(opcion.id);
                        setEstadoRespuesta("pendiente");
                      }}
                    >
                      <span className="act3geo-angle-icon">
                        {opcion.simbolo}
                      </span>

                      <span className="act3geo-option-text">
                        <strong>{opcion.nombre}</strong>
                        <small>{opcion.descripcion}</small>
                      </span>

                      {esCorrecta && (
                        <FiCheck className="act3geo-option-check" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="act3geo-actions-row">
                <button
                  type="button"
                  className="act3geo-check-btn"
                  onClick={comprobarRespuesta}
                >
                  <FiCheck /> Comprobar
                </button>

                <div
                  className={`act3geo-result-box act3geo-result-${estadoRespuesta}`}
                >
                  {estadoRespuesta === "correcto" ||
                  estadoRespuesta === "cambiando" ? (
                    <>
                      <FiCheck /> Respuesta correcta
                    </>
                  ) : estadoRespuesta === "incorrecto" ? (
                    <>
                      <FiX /> Revisa la apertura
                    </>
                  ) : (
                    <>
                      <FiTarget /> Selecciona una respuesta
                    </>
                  )}
                </div>
              </div>
            </article>

            <aside className="act3geo-right-panel">
              <article className="act3geo-tip-card act3geo-byte-card">
                <div className="act3geo-tip-img-box act3geo-byte-img-box">
                  <img src={bytePista} alt="Byte dando pista" />
                </div>

                <div>
                  <h3>Pista de Byte</h3>
                  <p>{reto.pistaByte}</p>
                </div>
              </article>

              <article className="act3geo-tip-card act3geo-profe-card">
                <div className="act3geo-tip-title-row">
                  <span>☀️</span>
                  <h3>Consejo del Profesor Astro</h3>
                </div>

                <div className="act3geo-profe-card-body">
                  <div>
                    <p>{reto.consejo}</p>

                    <ul>
                      <li>Si es menor que 90°, es agudo.</li>
                      <li>Si forma 90°, es recto.</li>
                      <li>Si es mayor que 90° y menor que 180°, es obtuso.</li>
                    </ul>
                  </div>

                  <img
                    src={profesorConsejo}
                    alt="Profesor Astro dando consejo"
                    className="act3geo-profe-img"
                  />
                </div>
              </article>

              <section
                className="act3geo-side-stats"
                aria-label="Resumen de actividad"
              >
                <article>
                  <FiFlag />
                  <div>
                    <span>Retos</span>
                    <strong>
                      {retosCompletados}/{RETOS.length}
                    </strong>
                  </div>
                </article>

                <article>
                  <FiTarget />
                  <div>
                    <span>Intentos</span>
                    <strong>{intentosReto}/3</strong>
                  </div>
                </article>

                <article>
                  <FiClock />
                  <div>
                    <span>Tiempo</span>
                    <strong>{formatearTiempo(segundos)}</strong>
                  </div>
                </article>

                <article>
                  <span className="act3geo-star">★</span>
                  <div>
                    <span>XP</span>
                    <strong>{xpGanado}</strong>
                  </div>
                </article>

                <article>
                  <span className="act3geo-coin">●</span>
                  <div>
                    <span>Nova XP</span>
                    <strong>{novaXp}</strong>
                  </div>
                </article>

                <article>
                  <span className="act3geo-gem">◆</span>
                  <div>
                    <span>Cristales</span>
                    <strong>{cristales}</strong>
                  </div>
                </article>

                <article>
                  <FiShield />
                  <div>
                    <span>Errores</span>
                    <strong>{erroresTotales}</strong>
                  </div>
                </article>
              </section>
            </aside>
          </section>
        </section>

        {modalCompletado && (
          <div
            className="act3geo-complete-overlay"
            onClick={cerrarModalCompletado}
          >
            <section
              className="act3geo-complete-modal"
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act3geo-complete-title"
            >
              <button
                type="button"
                className="act3geo-complete-close"
                onClick={cerrarModalCompletado}
                aria-label="Cerrar ventana"
              >
                <FiX />
              </button>

              <div className="act3geo-complete-hero">
                <span>🏆</span>
              </div>

              <div className="act3geo-complete-content">
                <span className="act3geo-complete-badge">
                  <GiTrophyCup /> Actividad completada
                </span>

                <h2 id="act3geo-complete-title">¡Misión completada!</h2>

                <p>
                  Identificaste la apertura de las puertas y clasificaste los
                  ángulos como agudos, rectos u obtusos. ¡Excelente trabajo,
                  explorador de MathNova!
                </p>

                <div className="act3geo-complete-summary">
                  <article>
                    <FiCheck />
                    <div>
                      <span>Retos</span>
                      <strong>5/5</strong>
                    </div>
                  </article>

                  <article>
                    <FiClock />
                    <div>
                      <span>Tiempo</span>
                      <strong>{formatearTiempo(segundos)}</strong>
                    </div>
                  </article>

                  <article>
                    <span className="act3geo-star">★</span>
                    <div>
                      <span>Recompensa</span>
                      <strong>+120 XP</strong>
                    </div>
                  </article>
                </div>

                <div className="act3geo-complete-actions">
                  <button type="button" onClick={reiniciarActividad}>
                    <FiRefreshCw /> Repetir actividad
                  </button>

                  <button
                    type="button"
                    className="act3geo-complete-main-btn"
                    onClick={() => irARuta("/actividades/geometria")}
                  >
                    <FiLogOut /> Volver a actividades
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        <footer className="act3geo-footer">
          <div className="act3geo-footer-icons">
            <button
              type="button"
              onClick={() => navigate("/login")}
              aria-label="Cerrar sesión"
            >
              <FiLogOut />
            </button>

            <button type="button" aria-label="Ayuda">
              <FiHelpCircle />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Actividad3MathGeometry;
