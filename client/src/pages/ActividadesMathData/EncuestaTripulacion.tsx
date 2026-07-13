import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo_MathNova.png";
import "./EncuestaTripulacion.css";

/* ---- Reutilizadas tal cual de Rampas de Lanzamiento ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";

/* ---- Nuevas para la Actividad 3 ---- */
import interferenciaDivideEncuestaImg from "../../assets/interferencia-divide-encuesta.png";
import astronautasImg from "../../assets/astronautas-tripulacion.png";
import interferenciaActivaImg from "../../assets/interferencia-activa.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiSend,
  FiTarget,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiGrid as FiTabla,
  FiFileText,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type Modulo = "bosque" | "desierto" | "cueva";

const VOTOS: Record<Modulo, number> = {
  bosque: 4,
  desierto: 3,
  cueva: 3,
};

const NOMBRE_MODULO: Record<Modulo, string> = {
  bosque: "Bosque",
  desierto: "Desierto",
  cueva: "Cueva de Cristal",
};

const MODULO_MAS_VOTADO: Modulo = "bosque";
const TOTAL_VOTOS = VOTOS.bosque + VOTOS.desierto + VOTOS.cueva;

function palitos(n: number) {
  return "|".repeat(n);
}

type EstadoFila = "correcto" | "pendiente" | "incorrecto";

function calcularEstado(valor: string, correcto: number, verificado: boolean): EstadoFila {
  if (!verificado) return "pendiente";
  return valor.trim() === String(correcto) ? "correcto" : "incorrecto";
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function EncuestaTripulacion() {
  const navigate = useNavigate();

  const [frecDesierto, setFrecDesierto] = useState("");
  const [frecCueva, setFrecCueva] = useState("");
  const [tablaVerificada, setTablaVerificada] = useState(false);

  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [audioReproduciendo, setAudioReproduciendo] = useState(false);

  const estadoDesierto = calcularEstado(frecDesierto, VOTOS.desierto, tablaVerificada);
  const estadoCueva = calcularEstado(frecCueva, VOTOS.cueva, tablaVerificada);

  const verificarTabla = () => {
    setTablaVerificada(true);
  };

  const tablaCompleta =
    tablaVerificada && estadoDesierto === "correcto" && estadoCueva === "correcto";

  const enviarCentroDeMando = () => {
    const todoCorrecto =
      estadoDesierto === "correcto" &&
      estadoCueva === "correcto" &&
      moduloSeleccionado === MODULO_MAS_VOTADO;

    setResultado(todoCorrecto ? "exito" : "fallo");
  };

  const handleReiniciarActividad = () => {
    setFrecDesierto("");
    setFrecCueva("");
    setTablaVerificada(false);
    setModuloSeleccionado(null);
    setResultado(null);
  };

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  if (resultado === "exito") return (
    <div className="res-page res-exito-page">
      <div className="res-confetti" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className={`res-confetti-dot res-confetti-dot-${i % 6}`} />
        ))}
      </div>

      <header className="res-header">
        <img src={logo} alt="MathNova" className="res-logo" />
        <button className="res-inicio-btn" onClick={() => navigate("/actividades-math-data")}>
          Inicio
        </button>
      </header>

      <div className="res-hero">
        <div className="res-hero-left">
          <div className="res-titulo-row">
            <div className="res-icono-check">✔</div>
            <div>
              <h1 className="res-titulo">¡Actividad completada!</h1>
              <p className="res-subtitulo">
                Has terminado con éxito la misión de{" "}
                <span className="res-mathnova-color">MathData</span>.
              </p>
            </div>
          </div>

          <div className="res-mensaje-box res-mensaje-verde">
            <div className="res-icono-estrella-circle">
              <img src={estrellaMision} alt="estrella" />
            </div>
            <div>
              <strong>¡Excelente trabajo, piloto!</strong>
              <p>
                Contaste los votos correctamente y descubriste qué módulo
                ganó la encuesta. Sigue así y conquista la siguiente misión.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="res-bottom">
        <div className="res-villano-exito-group">
          <img
            src={villanoTrofeoCompleto}
            alt="Villano celebrando con trofeo"
            className="res-villano-trofeo-img"
          />
        </div>

        <div className="res-bottom-left">
          <div className="res-resumen-card">
            <div className="res-resumen-header">
              <FiBarChart2 />
              <span>Resumen de la actividad</span>
            </div>
            <div className="res-resumen-stats">
              <div className="res-stat">
                <img src={iconoAciertos} alt="" className="res-stat-img" />
                <strong className="res-stat-num-verde">3/3</strong>
                <small>Respuestas correctas</small>
                <em>¡Perfecto!</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoTiempo} alt="" className="res-stat-img" />
                <strong>—</strong>
                <small>Tiempo</small>
                <em>min</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoPrecision} alt="" className="res-stat-img" />
                <strong className="res-stat-num-verde">100%</strong>
                <small>Precisión</small>
                <em>¡Impecable!</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoRecompensa} alt="" className="res-stat-img" />
                <strong className="res-pts-naranja">+50 pts</strong>
                <small>Recompensa</small>
                <em>Puntos ganados</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoInsignia} alt="" className="res-stat-img" />
                <strong>Misión<br />cumplida</strong>
                <small>Insignia obtenida</small>
                <em>¡Felicidades!</em>
              </div>
            </div>
          </div>

          <div className="res-progreso-card">
            <img src={iconoProgreso} alt="" className="res-progreso-img" />
            <div className="res-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Encuestas y Frecuencias</strong>
              <div className="res-barra-wrap">
                <div className="res-barra-fill res-barra-verde" style={{ width: "85%" }}>
                  <span className="res-barra-pct">85%</span>
                </div>
                <small>¡Vas muy bien! 15% para completar este tema.</small>
              </div>
            </div>
            <div className="res-hito-box">
              <img src={estrellaMision} alt="" className="res-hito-estrella" />
              <div>
                <small>Siguiente hito</small>
                <strong className="res-hito-pct">90%</strong>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>
        </div>

        <div className="res-bottom-right">
          <button
            className="res-btn res-btn-azul"
            onClick={() => navigate("/actividades-math-data")}
          >
            Siguiente actividad
          </button>
          <button className="res-btn res-btn-outline" onClick={handleReiniciarActividad}>
            Repetir actividad
          </button>
          <button
            className="res-btn res-btn-outline"
            onClick={() => navigate("/actividades-math-data")}
          >
            Volver a actividades
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // PANTALLA: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div className="res-page res-fallo-page">
      <header className="res-header">
        <img src={logo} alt="MathNova" className="res-logo" />
        <button className="res-inicio-btn" onClick={() => navigate("/actividades-math-data")}>
          Inicio
        </button>
      </header>

      <div className="res-body">
        <div className="res-hero-personajes">
          <img src={villanoIntentar} alt="Villano retando" className="res-villano-img" />
        </div>

        <div className="res-left">
          <div className="res-titulo-row">
            <div className="res-icono-retry">&#x1F504;</div>
            <div>
              <h1 className="res-titulo">¡Vuelve a intentarlo!</h1>
              <p className="res-subtitulo">
                Aún no completas con éxito la misión de{" "}
                <span className="res-mathnova-color">MathData</span>.
              </p>
            </div>
          </div>

          <div className="res-mensaje-box res-mensaje-azul">
            <div className="res-icono-datos">📊</div>
            <div>
              <strong>¡No te rindas, piloto!</strong>
              <p>
                Cuenta de nuevo los palitos de cada módulo con cuidado, y
                revisa cuál de los tres obtuvo más votos antes de enviar tu
                reporte al Centro de Mando.
              </p>
            </div>
          </div>

          <div className="res-resumen-card">
            <div className="res-resumen-header">
              <FiBarChart2 />
              <span>Resumen de la actividad</span>
            </div>
            <div className="res-resumen-stats">
              <div className="res-stat">
                <img src={iconoAciertos} alt="" className="res-stat-img" />
                <strong>0/3</strong>
                <small>Respuestas correctas</small>
                <em>¡Sigue así!</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoTiempo} alt="" className="res-stat-img" />
                <strong>—</strong>
                <small>Tiempo</small>
                <em>min</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoPrecision} alt="" className="res-stat-img" />
                <strong>0%</strong>
                <small>Precisión</small>
                <em>Puedes mejorar</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoRecompensa} alt="" className="res-stat-img" />
                <strong className="res-pts-azul">+10 pts</strong>
                <small>Recompensa</small>
                <em>Puntos ganados</em>
              </div>
              <div className="res-stat-sep" />
              <div className="res-stat">
                <img src={iconoInsignia} alt="" className="res-stat-img" />
                <strong>Sigue intentando</strong>
                <small>Insignia obtenida</small>
                <em>¡No te rindas!</em>
              </div>
            </div>
          </div>

          <div className="res-progreso-card">
            <img src={iconoProgreso} alt="" className="res-progreso-img" />
            <div className="res-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Encuestas y Frecuencias</strong>
              <div className="res-barra-wrap">
                <div className="res-barra-fill res-barra-azul" style={{ width: "70%" }}>
                  <span className="res-barra-pct">70%</span>
                </div>
                <small>¡Vas avanzando! Sigue practicando para completar este tema.</small>
              </div>
            </div>
            <div className="res-hito-box">
              <img src={estrellaMision} alt="" className="res-hito-estrella" />
              <div>
                <strong>Siguiente hito</strong>
                <em>80%</em>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>
        </div>

        <div className="res-acciones">
          <button className="res-btn res-btn-azul" onClick={handleReiniciarActividad}>
            Intentar de nuevo
          </button>
          <button className="res-btn res-btn-outline" onClick={() => setMostrarPistaBait(true)}>
            Ver pista
          </button>
          <button
            className="res-btn res-btn-outline"
            onClick={() => navigate("/actividades-math-data")}
          >
            {"<-"} Volver a actividades
          </button>
        </div>
      </div>

      {mostrarPistaBait && (
        <div className="enc-pista-overlay" role="dialog" aria-modal="true" aria-label="Pista de Bait">
          <div className="enc-pista-modal">
            <button
              type="button"
              className="enc-pista-cerrar"
              onClick={() => setMostrarPistaBait(false)}
              aria-label="Cerrar pista"
            >
              <FiX />
            </button>

            <img src={baitPistaImg} alt="Bait" className="enc-pista-modal-img" />

            <h3>Pista de Bait</h3>

            <button
              type="button"
              className="enc-pista-audio-btn"
              onClick={() => setAudioReproduciendo((v) => !v)}
              aria-pressed={audioReproduciendo}
              aria-label="Reproducir audio de la pista"
            >
              <FiVolume2 />
              {audioReproduciendo ? "Reproduciendo..." : "Escuchar pista"}
            </button>

            <p>
              Cuenta con cuidado la columna de palitos: cada palito vale{" "}
              <strong className="enc-texto-azul">1 voto</strong>. La
              frecuencia absoluta es el número total de votos de cada
              módulo. El módulo con más palitos es el que{" "}
              <strong className="enc-texto-verde">ganó la encuesta</strong>.
            </p>

            <div className="enc-pista-ejemplo">
              <span>Ejemplo:</span>
              <strong>{palitos(5)}</strong>
              <span>5 votos</span>
            </div>

            <button
              type="button"
              className="enc-pista-cerrar-btn"
              onClick={() => setMostrarPistaBait(false)}
            >
              Cerrar y volver a la actividad
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="enc-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="enc-sidebar">
        <img src={logo} alt="MathNova" className="enc-logo-img" />

        <nav className="enc-nav">
          <button className="enc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="enc-nav-item enc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="enc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="enc-interferencia-activa-wrap">
          <img
            src={interferenciaActivaImg}
            alt="Interferencia activa: Divide puede confundir los palitos y hacerte perder la cuenta. ¡No dejes que eso pase!"
            className="enc-interferencia-activa-img"
          />
          <button
            type="button"
            className="enc-ver-amenaza-btn"
            onClick={() => setMostrarPistaBait(true)}
          >
            <FiTarget /> Ver amenaza
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="enc-main">
        <header className="enc-header">
          <div className="enc-header-izquierda">
            <button
              className="enc-volver"
              type="button"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiArrowLeft /> Volver al tema
            </button>
          </div>
          <button type="button" className="enc-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="enc-top-row">
          <div className="enc-centro-control">
            <div className="enc-centro-control-header">
              <FiTarget /> CENTRO DE CONTROL
            </div>
            <ul>
              <li>
                <span className="enc-bullet-azul" />
                Revisa la encuesta.
              </li>
              <li>
                <span className="enc-bullet-verde" />
                Cuenta los votos con palitos.
              </li>
              <li>
                <span className="enc-bullet-rojo" />
                Completa la frecuencia absoluta.
              </li>
            </ul>
          </div>

          <img src={baitSaludoImg} alt="Bait saludando" className="enc-robot-avatar-img" />

          <div className="enc-titulo-bloque">
            <div className="enc-titulo-row">
              <div className="enc-titulo-icono">
                <FiUsers />
              </div>
              <div>
                <h1>La Encuesta de la Tripulación</h1>
                <p>
                  Aplica una encuesta, cuenta los votos y completa la tabla
                  de frecuencias.
                </p>
              </div>
            </div>

            <div className="enc-hola-piloto">
              <div>
                <strong>¡Hola, piloto!</strong>
                <p>
                  En esta misión debes aplicar una encuesta a la tripulación
                  para decidir qué módulo explorar primero. Observa cómo
                  votan los 10 integrantes del escuadrón, cuenta los votos
                  con palitos y completa la tabla de frecuencias. Después
                  revela cuál módulo obtuvo más votos.
                </p>
              </div>
              <button className="enc-audio-btn" type="button" aria-label="Escuchar instrucciones">
                <FiVolume2 />
              </button>
            </div>
          </div>

          <img
            src={interferenciaDivideEncuestaImg}
            alt="Interferencia de Divide: si cuentas mal los votos, la ruta se aprobará mal. A ver si puedes descubrir qué módulo ganó de verdad."
            className="enc-villano-box"
          />
        </div>

        {/* ENCUESTA Y TABLA */}
        <div className="enc-medio-row">
          {/* ENCUESTA Y VOTOS */}
          <div className="enc-encuesta-card">
            <div className="enc-card-header">
              <FiUsers /> Encuesta y votos de la tripulación
            </div>

            <div className="enc-encuesta-contenido">
              <div className="enc-expedicion-box">
                <span className="enc-subtitulo-caja">Encuesta de Expedición</span>
                <p className="enc-pregunta-caja">
                  ¿Qué módulo prefieres explorar primero?
                </p>
                <div className="enc-modulos-opciones">
                  {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                    <div key={m} className={`enc-modulo-opcion enc-modulo-${m}`}>
                      <span className="enc-modulo-icono" aria-hidden="true" />
                      <span>{NOMBRE_MODULO[m]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enc-conteo-box">
                <span className="enc-subtitulo-caja">
                  Conteo en tiempo real (Panel de palitos)
                </span>
                {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                  <div key={m} className="enc-conteo-fila">
                    <span className={`enc-modulo-icono enc-modulo-${m}`} aria-hidden="true" />
                    <span className="enc-conteo-nombre">{NOMBRE_MODULO[m]}</span>
                    <span className="enc-conteo-palitos">{palitos(VOTOS[m])}</span>
                    <FiCheckCircle className="enc-conteo-check" />
                  </div>
                ))}
              </div>
            </div>

            <div className="enc-tripulacion-box">
              <span className="enc-subtitulo-caja">Tripulación (10 integrantes)</span>
              <img
                src={astronautasImg}
                alt="Los 10 integrantes de la tripulación que votaron en la encuesta"
                className="enc-astronautas-img"
              />
            </div>

            <div className="enc-nota-bait">
              <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
              <span>Cada palito representa un voto.</span>
            </div>
          </div>

          {/* TABLA DE FRECUENCIAS */}
          <div className="enc-tabla-card">
            <div className="enc-card-header">
              <FiTabla /> Tabla de frecuencias
            </div>

            <table className="enc-tabla">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Conteo (palitos)</th>
                  <th>Frecuencia absoluta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-bosque" aria-hidden="true" />
                    Bosque
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.bosque)}</td>
                  <td className="enc-td-frecuencia">
                    <strong>{VOTOS.bosque}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-correcto">
                      <FiCheckCircle /> Correcto
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-desierto" aria-hidden="true" />
                    Desierto
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.desierto)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoDesierto}`}
                      value={frecDesierto}
                      onChange={(e) => setFrecDesierto(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Desierto"
                    />
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoDesierto}`}>
                      {estadoDesierto === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoDesierto === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoDesierto === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-cueva" aria-hidden="true" />
                    Cueva de Cristal
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.cueva)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoCueva}`}
                      value={frecCueva}
                      onChange={(e) => setFrecCueva(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Cueva de Cristal"
                    />
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoCueva}`}>
                      {estadoCueva === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoCueva === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoCueva === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr className="enc-fila-total">
                  <td className="enc-td-modulo">TOTAL</td>
                  <td className="enc-td-palitos">—</td>
                  <td className="enc-td-frecuencia">
                    <strong>{TOTAL_VOTOS}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-automatico">
                      Automático
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <button type="button" className="enc-verificar-tabla-btn" onClick={verificarTabla}>
              <FiCheck /> Verificar tabla
            </button>
          </div>
        </div>

        {/* RESUMEN E INTERPRETACIÓN + PISTA */}
        <div className="enc-bottom-row">
          <div className="enc-resumen-card">
            <div className="enc-card-header">
              <FiFileText /> Resumen e interpretación
            </div>

            <p className="enc-pregunta-resumen">¿Qué módulo obtuvo más votos?</p>

            <div className="enc-resumen-opciones">
              {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`enc-resumen-opcion enc-modulo-${m} ${
                    moduloSeleccionado === m ? "enc-resumen-opcion-activa" : ""
                  }`}
                  onClick={() => setModuloSeleccionado(m)}
                  aria-pressed={moduloSeleccionado === m}
                >
                  <span className="enc-modulo-icono" aria-hidden="true" />
                  {NOMBRE_MODULO[m]}
                  {moduloSeleccionado === m && <FiCheckCircle className="enc-check-opcion" />}
                </button>
              ))}
            </div>

            {moduloSeleccionado && (
              <div className="enc-nota-bait">
                <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
                {moduloSeleccionado === MODULO_MAS_VOTADO ? (
                  <span>
                    ¡Exacto! El {NOMBRE_MODULO[MODULO_MAS_VOTADO]} fue el más
                    votado con {VOTOS[MODULO_MAS_VOTADO]} votos. ⭐
                  </span>
                ) : (
                  <span>Revisa otra vez la tabla de frecuencias antes de confirmar.</span>
                )}
              </div>
            )}

            <button type="button" className="enc-enviar-btn" onClick={enviarCentroDeMando}>
              <FiSend /> Enviar al Centro de Mando
            </button>
          </div>

          <div className="enc-pista-card">
            <button
              type="button"
              className="enc-pista-trigger"
              onClick={() => setMostrarPistaBait(true)}
            >
              <img src={baitPistaImg} alt="" className="enc-pista-icono" />
              <strong>Pista de Bait</strong>
            </button>
            <p>
              Cuenta con cuidado la columna de palitos. Cada palito vale{" "}
              <strong className="enc-texto-azul">1 voto</strong>. La
              frecuencia absoluta es el número total de votos de cada
              módulo.
            </p>

            <div className="enc-pista-ejemplo">
              <span>Ejemplo:</span>
              <strong>{palitos(5)}</strong>
              <span>5 votos</span>
            </div>
          </div>
        </div>
      </main>

      {mostrarPistaBait && (
        <div className="enc-pista-overlay" role="dialog" aria-modal="true" aria-label="Pista de Bait">
          <div className="enc-pista-modal">
            <button
              type="button"
              className="enc-pista-cerrar"
              onClick={() => setMostrarPistaBait(false)}
              aria-label="Cerrar pista"
            >
              <FiX />
            </button>

            <img src={baitPistaImg} alt="Bait" className="enc-pista-modal-img" />

            <h3>Pista de Bait</h3>

            <button
              type="button"
              className="enc-pista-audio-btn"
              onClick={() => setAudioReproduciendo((v) => !v)}
              aria-pressed={audioReproduciendo}
              aria-label="Reproducir audio de la pista"
            >
              <FiVolume2 />
              {audioReproduciendo ? "Reproduciendo..." : "Escuchar pista"}
            </button>

            <p>
              Cuenta con cuidado la columna de palitos: cada palito vale{" "}
              <strong className="enc-texto-azul">1 voto</strong>. La
              frecuencia absoluta es el número total de votos de cada
              módulo. El módulo con más palitos es el que{" "}
              <strong className="enc-texto-verde">ganó la encuesta</strong>.
            </p>

            <div className="enc-pista-ejemplo">
              <span>Ejemplo:</span>
              <strong>{palitos(5)}</strong>
              <span>5 votos</span>
            </div>

            <button
              type="button"
              className="enc-pista-cerrar-btn"
              onClick={() => setMostrarPistaBait(false)}
            >
              Cerrar y volver a la actividad
            </button>
          </div>
        </div>
      )}

      {!tablaCompleta && tablaVerificada && (
        <p className="enc-visually-hidden" role="status">
          Todavía hay filas de la tabla que no coinciden, revísalas antes de
          enviar tu reporte.
        </p>
      )}
    </div>
  );
}