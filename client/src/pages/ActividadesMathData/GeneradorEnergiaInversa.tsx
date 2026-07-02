import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GeneradorEnergiaInversa.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/banner-gen1-MathData.png";
import villano from "../../assets/hola-MathData.png";
import personajeAyuda from "../../assets/hola-MathData.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiArrowLeft,
  FiRotateCcw,
  FiCheck,
  FiLock,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup, GiBookCover } from "react-icons/gi";
import { FaStar, FaShieldAlt, FaGem, FaLightbulb, FaHandPointUp } from "react-icons/fa";

// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================

const API_URL = "http://localhost:3001/api";
const ID_ESTUDIANTE = 2; // ⚠️ Reemplazar con el ID real del estudiante

// ============================================
// DATOS INICIALES (NO MODIFICAR)
// ============================================

const filasIniciales = [
  { x: 1, y: "12", editable: false, correcto: true },
  { x: 2, y: "6", editable: false, correcto: true },
  { x: 3, y: "4", editable: false, correcto: true },
  { x: 4, y: "", editable: true, correcto: null },
  { x: 6, y: "", editable: true, correcto: null },
  { x: 12, y: "", editable: true, correcto: null },
];

const puntosIniciales = [
  { x: 1, y: 12 },
  { x: 2, y: 6 },
  { x: 3, y: 4 },
];

const EJE_X_MAX = 12;
const EJE_Y_MAX = 14;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function GeneradorEnergiaInversa() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [filas, setFilas] = useState(filasIniciales);
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [respuesta, setRespuesta] = useState("");
  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);
  const [progresoPorcentaje, setProgresoPorcentaje] = useState(0);
  const [cargando, setCargando] = useState(false);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const response = await fetch(`${API_URL}/proporcionalidad/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;

          if (progreso.valores_tabla) {
            const nuevosValores = filasIniciales.map((fila) => {
              const valorGuardado = (progreso.valores_tabla as Record<string, number>)[String(fila.x)];
              if (valorGuardado !== undefined) {
                return { ...fila, y: String(valorGuardado), correcto: true };
              }
              return fila;
            });
            setFilas(nuevosValores);
          }

          if (progreso.completada) {
            setActividadCompletada(true);
            setXpGanado(progreso.xp_obtenido || 0);
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      }
    };

    cargarProgreso();
  }, []);

  // ==========================================
  // GUARDAR PROGRESO EN EL BACKEND
  // ==========================================

  const guardarProgreso = async (pantalla: number) => {
    try {
      await fetch(`${API_URL}/proporcionalidad/guardar-progreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          pantalla_actual: pantalla,
        }),
      });
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    }
  };

  // ==========================================
  // VALIDAR TABLA CON BACKEND
  // ==========================================

  const actualizarFila = async (index: number, valor: string) => {
    setFilas((prev) =>
      prev.map((fila, i) => (i === index ? { ...fila, y: valor, correcto: null } : fila))
    );

    if (valor === "") return;

    const fila = filas[index];
    if (!fila) return;

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/proporcionalidad/validar-tabla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          reactores: fila.x,
          tiempo: Number(valor),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const resultado = data.data;

        setFilas((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, correcto: resultado.correcto }
              : f
          )
        );

        setMensajeFeedback(resultado.mensaje);

        if (resultado.correcto) {
          await guardarProgreso(4);
          if (!puntos.some(p => p.x === fila.x)) {
            setPuntos((prev) => [...prev, { x: fila.x, y: Number(valor) }]);
          }
        }

        const celdasCompletadas = filas.filter(f => f.correcto === true).length;
        const totalCeldas = filas.length;
        setProgresoPorcentaje(Math.round((celdasCompletadas / totalCeldas) * 100));
      }
    } catch (error) {
      console.error("Error al validar:", error);
      setMensajeFeedback("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // VALIDAR PREDICCIÓN CON BACKEND
  // ==========================================

  const handleEnviarPrediccion = async () => {
    if (respuesta.trim() === "") {
      setMensajeFeedback("⚠️ Escribe una respuesta antes de enviar.");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/proporcionalidad/prediccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          prediccion: Number(respuesta),
        }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.success && data.data) {
        const resultado = data.data;
        setMensajeFeedback(resultado.mensaje);

        if (resultado.correcto) {
          setActividadCompletada(true);
          setXpGanado(100);
          setProgresoPorcentaje(100);
          await guardarProgreso(8);
          alert("🎉 ¡Misión completada! Has ganado 100 XP.");
        } else if (resultado.completada) {
          setActividadCompletada(true);
          setXpGanado(50);
          setProgresoPorcentaje(100);
          await guardarProgreso(8);
          alert("📚 Actividad completada con ayuda. Has ganado 50 XP.");
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      } else if (data.success === false) {
        alert(`❌ ${data.mensaje || "Error al procesar la respuesta."}`);
      } else {
        alert("❌ Error al procesar la respuesta.");
      }
    } catch (error) {
      console.error("Error al enviar predicción:", error);
      setMensajeFeedback("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
      setRespuesta("");
    }
  };

  // ==========================================
  // VERIFICAR PUNTOS EN LA GRÁFICA
  // ==========================================

  const handleVerificarPuntos = () => {
    const puntosEsperados = [
      { x: 1, y: 12 },
      { x: 2, y: 6 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
      { x: 6, y: 2 },
      { x: 12, y: 1 },
    ];

    const todosLosPuntos = puntosEsperados.every(pEsperado =>
      puntos.some(p => p.x === pEsperado.x && p.y === pEsperado.y)
    );

    if (todosLosPuntos) {
      setMensajeFeedback("✅ ¡Todos los puntos están correctos! Has completado la gráfica.");
      setProgresoPorcentaje(80);
      alert("🎉 ¡Gráfica completada correctamente!");
    } else {
      setMensajeFeedback("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
      alert("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
    }
  };

  // ==========================================
  // FUNCIONES EXISTENTES (NO MODIFICAR)
  // ==========================================

  const manejarClickGrafica = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = 1 - (e.clientY - rect.top) / rect.height;

    const x = Math.round(relX * EJE_X_MAX);
    const y = Math.round(relY * EJE_Y_MAX);

    if (x <= 0 || y <= 0) return;

    setPuntos((prev) => [...prev, { x, y }]);
  };

  const limpiarGrafica = () => setPuntos(puntosIniciales);

  // ==========================================
  // RENDER (NO MODIFICAR ESTRUCTURA)
  // ==========================================

  return (
    <main className="gen1-page">
      <button
        type="button"
        className={`gen1-hamburger-btn ${menuOpen ? "gen1-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="gen1-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`gen1-sidebar ${menuOpen ? "gen1-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="gen1-sidebar-logo" />

        <nav className="gen1-sidebar-menu">
          <button type="button" className="gen1-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos matemáticos</span>
          </button>

          <button type="button" className="gen1-menu-item" onClick={() => irARuta("/temas")}>
            <GiBookCover />
            <span>Temas</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item gen1-active"
            onClick={() => irARuta("/actividades-math-data")}
          >
            <FiBarChart2 />
            <span>Actividades</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="gen1-sidebar-bottom">
          <div className="gen1-character-box">
            <img src={personajeAyuda} alt="Explorador" />
            <div>
              <strong>¡Tú puedes!</strong>
              <p>La base cuenta contigo.</p>
            </div>
          </div>

          <div className="gen1-topic-progress">
            <strong>Progreso del tema</strong>
            <span>0/2 actividades</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
          </div>

          <div className="gen1-xp-box">
            <span>XP acumulados</span>
            <strong>
              {xpGanado || 120} XP <FaStar />
            </strong>
          </div>
        </div>

        <div className="gen1-sidebar-icons">
          <button type="button" onClick={() => irARuta("/ajustes")} aria-label="Ajustes">
            <FiSettings />
          </button>
          <button type="button" onClick={() => irARuta("/ayuda")} aria-label="Ayuda">
            <FiHelpCircle />
          </button>
          <button type="button" onClick={() => navigate("/login")} aria-label="Cerrar sesión">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* ===================== CONTENIDO ===================== */}
      <section className="gen1-content">
        <div className="gen1-topbar">
          <button
            type="button"
            className="gen1-back-btn"
            onClick={() => irARuta("/actividades-math-data")}
            aria-label="Volver al tema"
          >
            <FiArrowLeft />
            Volver al tema
          </button>

          <span className="gen1-step-pill">Actividad 1 de 2</span>

          <button type="button" className="gen1-help-circle" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </div>

        <div className="gen1-hero">
          <img src={heroBanner} alt="" className="gen1-hero-bg" />

          <div className="gen1-hero-text">
            <h1>
              Generador de Energía Inversa <span>⚡</span>
            </h1>
            <p>
              La base MathNova necesita recargar su escudo de protección
              antes del amanecer. Activa el panel de control de los
              reactores y completa la tabla y la gráfica para descubrir el
              patrón de proporcionalidad inversa.
            </p>
          </div>

          <div className="gen1-villain">
            <div className="gen1-villain-bubble">
              A mayor número de reactores, menor tiempo de recarga.
            </div>
            <img src={villano} alt="Villano" />
          </div>
        </div>

        {/* MENSAJE DE FEEDBACK */}
        {mensajeFeedback && (
          <div className={
            mensajeFeedback.includes("✅") || mensajeFeedback.includes("🎉")
              ? "gen1-feedback-success"
              : "gen1-feedback-error"
          }>
            {mensajeFeedback}
          </div>
        )}

        {/* MENSAJE DE ACTIVIDAD COMPLETADA */}
        {actividadCompletada && (
          <div className="gen1-completada-box">
            🎉 ¡Misión completada! Has ganado {xpGanado} XP.
          </div>
        )}

        <div className="gen1-board">
          {/* PASO 1: TABLA */}
          <section className="gen1-card gen1-card-table">
            <header className="gen1-card-header">
              <span className="gen1-step-number">1</span>
              <h2>Completa la tabla de valores.</h2>
            </header>
            <p className="gen1-card-subtext">
              Observa los datos iniciales y completa los espacios en blanco.
            </p>

            <table className="gen1-table">
              <thead>
                <tr>
                  <th className="gen1-th-blue">Reactores conectados (x)</th>
                  <th className="gen1-th-green">Tiempo de recarga (horas) (y)</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => (
                  <tr key={fila.x}>
                    <td>{fila.x}</td>
                    <td>
                      {fila.editable ? (
                        <input
                          className="gen1-table-input"
                          type="number"
                          value={fila.y}
                          placeholder=""
                          aria-label={`Tiempo para ${fila.x} reactores`}
                          onChange={(e) => actualizarFila(index, e.target.value)}
                          style={{
                            borderColor: fila.correcto === true ? "#28a745" : fila.correcto === false ? "#dc3545" : undefined,
                            backgroundColor: fila.correcto === true ? "#d4edda" : fila.correcto === false ? "#f8d7da" : undefined
                          }}
                          disabled={cargando || fila.correcto === true || actividadCompletada}
                        />
                      ) : (
                        fila.y
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <header className="gen1-card-header gen1-card-header-spaced">
              <span className="gen1-step-number">2</span>
              <h2>Traza la gráfica en el plano cartesiano.</h2>
            </header>
            <p className="gen1-card-subtext">
              Marca los puntos de la tabla en la gráfica y une con una curva
              suave.
            </p>

            <div className="gen1-tip-box">
              <FaLightbulb />
              <span>
                Recuerda: Proporcionalidad inversa &rarr; y = k/x
              </span>
            </div>

            <div className="gen1-table-actions">
              <button type="button" className="gen1-btn-outline" onClick={limpiarGrafica}>
                <FiRotateCcw />
                Limpiar gráfica
              </button>
              <button type="button" className="gen1-btn-primary" onClick={handleVerificarPuntos}>
                <FiCheck />
                Verificar puntos
              </button>
            </div>
          </section>

          {/* GRAFICA */}
          <section className="gen1-card gen1-card-graph">
            <h3 className="gen1-graph-title">Tiempo de recarga (horas)</h3>

            <div className="gen1-graph-area" onClick={manejarClickGrafica}>
              <div className="gen1-graph-grid">
                {Array.from({ length: EJE_X_MAX }).map((_, i) => (
                  <i key={`v-${i}`} className="gen1-grid-line-v" />
                ))}
                {Array.from({ length: EJE_Y_MAX / 2 }).map((_, i) => (
                  <i key={`h-${i}`} className="gen1-grid-line-h" />
                ))}
              </div>

              {puntos.map((p, i) => (
                <span
                  key={i}
                  className="gen1-graph-point"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              <div className="gen1-graph-y-labels">
                {[14, 12, 10, 8, 6, 4, 2, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="gen1-graph-x-labels">
              {Array.from({ length: EJE_X_MAX + 1 }).map((_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
            <span className="gen1-graph-x-title">Reactores conectados</span>

            <div className="gen1-hint-bar">
              <FaHandPointUp />
              <p>
                Haz clic en la cuadrícula para colocar un punto. Puedes
                arrastrarlo para ajustarlo.
              </p>
            </div>
          </section>

          {/* PASO 3: PREDICCION */}
          <section className="gen1-card gen1-card-predict">
            <header className="gen1-card-header">
              <span className="gen1-step-number">3</span>
              <h2>Predice y responde.</h2>
            </header>

            <p className="gen1-card-subtext">
              Si el escudo debe recargarse en solo 2 horas, ¿cuántos
              reactores se necesitan?
            </p>

            <div className="gen1-answer-row">
              <input
                className="gen1-answer-input"
                type="number"
                placeholder="Escribe tu respuesta"
                aria-label="Respuesta de predicción"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                disabled={actividadCompletada}
              />
              <span>reactores</span>
            </div>

            <div className="gen1-pista-box">
              <FaLightbulb />
              <div>
                <strong>Pista</strong>
                <p>Usa el patrón que encontraste en la tabla o en la gráfica.</p>
              </div>
            </div>

            <button
              type="button"
              className="gen1-btn-submit"
              disabled={respuesta.trim() === "" || actividadCompletada || cargando}
              onClick={handleEnviarPrediccion}
              aria-label="Enviar respuesta"
            >
              <FiLock />
              {cargando ? "Enviando..." : "Enviar respuesta"}
            </button>

            <div className="gen1-mission-box">
              <div>
                <strong>Tu misión</strong>
                <p>
                  Completa la tabla, traza la gráfica y predice cuántos
                  reactores se necesitan para recargar el escudo en 2 horas.
                </p>
              </div>
              <FaShieldAlt className="gen1-mission-icon" />
            </div>
          </section>
        </div>

        <footer className="gen1-bottom-bar">
          <div className="gen1-bottom-progress">
            <span>Progreso de la actividad</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
            <strong>{progresoPorcentaje}%</strong>
          </div>

          <div className="gen1-bottom-reward">
            <span>Recompensa por completar</span>
            <strong>
              <FaStar /> +60 XP
            </strong>
            <strong>
              <FaGem /> +1
            </strong>
            <strong>
              <FaShieldAlt /> +1
            </strong>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default GeneradorEnergiaInversa;