import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_MathNova.png";
import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
  FiVolume2,
  FiSend,
  FiTarget,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import "./RampasDeLanzamiento.css";

/* =========================================================
   DATOS DE LA MISIÓN
   (fijos por ahora; se pueden mover a props/backend después)
========================================================= */

interface Punto {
  x: number;
  y: number;
}

const DATOS_ASCENSO: Punto[] = [
  { x: 1, y: 3 },
  { x: 2, y: 6 },
  { x: 3, y: 9 },
  { x: 4, y: 12 },
  { x: 5, y: 15 },
];

const DATOS_DESCENSO: Punto[] = [
  { x: 1, y: -2 },
  { x: 2, y: -4 },
  { x: 3, y: -6 },
  { x: 4, y: -8 },
  { x: 5, y: -10 },
];

const PENDIENTE_ASCENSO_CORRECTA = "3";
const PENDIENTE_DESCENSO_CORRECTA = "2"; // se escribe como y = -2x

type Pendiente = "positiva" | "negativa" | null;

/* =========================================================
   SUBCOMPONENTE: gráfica de línea (SVG a mano, sin librerías)
========================================================= */

interface GraficaRampaProps {
  color: "verde" | "rojo";
  puntos: Punto[];
  esAscenso: boolean;
}

function GraficaRampa({ color, puntos, esAscenso }: GraficaRampaProps) {
  // Solo graficamos los primeros 3 puntos para no saturar la mini-gráfica
  const visibles = puntos.slice(0, 3);

  const escalaX = 28; // px por unidad en X
  const escalaY = 14; // px por unidad en Y
  const origenX = 70;
  const origenY = esAscenso ? 180 : 40;

  const aPx = (p: Punto) => ({
    px: origenX + p.x * escalaX,
    py: origenY - p.y * escalaY,
  });

  const pathD = visibles
    .map((p, i) => {
      const { px, py } = aPx(p);
      return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 260 210"
      className="rmp-grafica-svg"
      role="img"
      aria-label={`Gráfica de la rampa de ${esAscenso ? "ascenso" : "descenso"}`}
    >
      {/* Ejes */}
      <line x1="14" y1={origenY} x2="248" y2={origenY} className="rmp-eje" />
      <line x1={origenX} y1="8" x2={origenX} y2="202" className="rmp-eje" />
      <polygon
        points={`248,${origenY} 239,${origenY - 5} 239,${origenY + 5}`}
        className="rmp-eje-flecha"
      />
      <polygon
        points={`${origenX},8 ${origenX - 5},17 ${origenX + 5},17`}
        className="rmp-eje-flecha"
      />

      {/* Guías punteadas + puntos */}
      {visibles.map((p) => {
        const { px, py } = aPx(p);
        return (
          <g key={`${p.x}-${p.y}`}>
            <line x1={origenX} y1={py} x2={px} y2={py} className="rmp-guia" />
            <line x1={px} y1={origenY} x2={px} y2={py} className="rmp-guia" />
            <circle cx={px} cy={py} r="4.5" className={`rmp-punto rmp-punto-${color}`} />
            <text x={px + 7} y={py - 7} className="rmp-punto-label">
              ({p.x},{p.y})
            </text>
          </g>
        );
      })}

      {/* Recta */}
      <path d={pathD} className={`rmp-linea rmp-linea-${color}`} fill="none" />

      {/* Etiquetas de ejes */}
      <text x="90" y={origenY + 22} className="rmp-eje-label">
        X: Distancia recorrida (m)
      </text>
      <text x="8" y="18" className="rmp-eje-label-y">
        Y: {esAscenso ? "Altura alcanzada" : "Altura"} (m)
      </text>
    </svg>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function RampasDeLanzamiento() {
  const navigate = useNavigate();

  const [pendienteAscenso, setPendienteAscenso] = useState<Pendiente>(null);
  const [pendienteDescenso, setPendienteDescenso] = useState<Pendiente>(null);
  const [ecAscenso, setEcAscenso] = useState("");
  const [ecDescenso, setEcDescenso] = useState("");

  const [bitPendienteAscenso, setBitPendienteAscenso] = useState("");
  const [bitEcAscenso, setBitEcAscenso] = useState("");
  const [bitPendienteDescenso, setBitPendienteDescenso] = useState("");
  const [bitEcDescenso, setBitEcDescenso] = useState("");

  const [resultado, setResultado] = useState<"correcto" | "incorrecto" | null>(null);

  const verificarRespuestas = () => {
    const todoCorrecto =
      pendienteAscenso === "positiva" &&
      pendienteDescenso === "negativa" &&
      ecAscenso.trim() === PENDIENTE_ASCENSO_CORRECTA &&
      ecDescenso.trim() === PENDIENTE_DESCENSO_CORRECTA &&
      bitPendienteAscenso.trim() === PENDIENTE_ASCENSO_CORRECTA &&
      bitEcAscenso.trim() === PENDIENTE_ASCENSO_CORRECTA &&
      (bitPendienteDescenso.trim() === `-${PENDIENTE_DESCENSO_CORRECTA}` ||
        bitPendienteDescenso.trim() === `−${PENDIENTE_DESCENSO_CORRECTA}`) &&
      bitEcDescenso.trim() === PENDIENTE_DESCENSO_CORRECTA;

    setResultado(todoCorrecto ? "correcto" : "incorrecto");
  };

  return (
    <div className="rmp-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="rmp-sidebar">
        <img src={logo} alt="MathNova" className="rmp-logo-img" />

        <nav className="rmp-nav">
          <button className="rmp-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="rmp-nav-item rmp-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/recompensas")}
          >
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button
            className="rmp-nav-item"
            type="button"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="rmp-sidebar-villano">
          <div className="rmp-sidebar-villano-avatar">
            <FiTarget />
          </div>
          <p>¡Tú puedes, acaba con esa rampa!</p>
        </div>

        <div className="rmp-sidebar-progreso">
          <span className="rmp-sidebar-label">Progreso de la actividad</span>
          <div className="rmp-progreso-track">
            <div className="rmp-progreso-fill" style={{ width: "0%" }} />
          </div>
          <span className="rmp-sidebar-sub">0/1 actividad</span>
        </div>

        <div className="rmp-sidebar-xp">
          <span className="rmp-sidebar-label">XP acumulados</span>
          <strong>⭐ 120 XP</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="rmp-main">
        <header className="rmp-header">
          <div className="rmp-header-izquierda">
        <button className="rmp-volver" type="button" onClick={() => navigate("/actividades-math-data")}>
        <FiArrowLeft /> Volver al tema
        </button>
            <span className="rmp-actividad-pill">Actividad 1 de 1</span>
          </div>
          <button className="rmp-ayuda-btn" type="button" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>

        {/* FILA SUPERIOR */}
        <div className="rmp-top-row">
          <div className="rmp-centro-control">
            <div className="rmp-centro-control-header">
              <FiTarget /> CENTRO DE CONTROL
            </div>
            <ul>
              <li>
                <span className="rmp-bullet-azul" />
                Observa si la recta sube o baja.
              </li>
              <li>
                <FiArrowUp className="rmp-icono-verde" />
                Rampa de ascenso: por cada 1 m que avanza,{" "}
                <strong>sube 3 m.</strong>
              </li>
              <li>
                <FiArrowDown className="rmp-icono-rojo" />
                Rampa de descenso: por cada 1 m que avanza,{" "}
                <strong>baja 2 m.</strong>
              </li>
            </ul>
          </div>

          <div className="rmp-robot-avatar" aria-hidden="true">
            <div className="rmp-robot-cara">
              <span className="rmp-robot-ojo" />
              <span className="rmp-robot-ojo" />
              <span className="rmp-robot-sonrisa" />
            </div>
            <div className="rmp-robot-panel">+-</div>
          </div>

          <div className="rmp-titulo-bloque">
            <div className="rmp-titulo-row">
              <div className="rmp-titulo-icono">
                <FiTarget />
              </div>
              <div>
                <h1>Rampas de Lanzamiento</h1>
                <p>
                  Identifica la pendiente de cada rampa y completa la
                  ecuación correcta.
                </p>
              </div>
            </div>

            <div className="rmp-hola-piloto">
              <div>
                <strong>¡Hola, piloto!</strong>
                <p>
                  En esta misión vas a calibrar dos rampas de lanzamiento.
                  Primero observa cómo cada recta sube o baja. Luego usa la
                  tabla para descubrir la pendiente y escribe su ecuación en
                  la forma y = mx.
                </p>
              </div>
              <button
                className="rmp-audio-btn"
                type="button"
                aria-label="Escuchar instrucciones"
              >
                <FiVolume2 />
              </button>
            </div>
          </div>

          <div className="rmp-villano-box">
            <div className="rmp-villano-titulo">INTERFERENCIA DE DIVIDE</div>
            <div className="rmp-villano-ecuacion">
              X ÷ 3 = <FiPlus />
            </div>
            <p>Si te confundes con el signo, el despegue fallará.</p>
            <p className="rmp-villano-reto">
              A ver si puedes descubrir la pendiente correcta.
            </p>
          </div>
        </div>

        {/* GRÁFICAS */}
        <div className="rmp-graficas-row">
          {/* RAMPA DE ASCENSO */}
          <div className="rmp-grafica-card rmp-grafica-card-verde">
            <div className="rmp-grafica-header">
              <span className="rmp-numero-badge rmp-numero-badge-verde">1</span>
              <h2>Rampa de ascenso</h2>
            </div>

            <div className="rmp-grafica-contenido">
              <GraficaRampa color="verde" puntos={DATOS_ASCENSO} esAscenso={true} />

              <table className="rmp-tabla">
                <thead>
                  <tr>
                    <th>x (m)</th>
                    <th>y (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {DATOS_ASCENSO.map((p) => (
                    <tr key={p.x}>
                      <td>{p.x}</td>
                      <td>{p.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rmp-pendiente-row">
              <span>La pendiente es:</span>
              <div className="rmp-pendiente-btns">
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteAscenso === "positiva" ? "rmp-pendiente-btn-activo-verde" : ""
                  }`}
                  onClick={() => setPendienteAscenso("positiva")}
                  aria-pressed={pendienteAscenso === "positiva"}
                >
                  Positiva
                </button>
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteAscenso === "negativa" ? "rmp-pendiente-btn-activo-rojo" : ""
                  }`}
                  onClick={() => setPendienteAscenso("negativa")}
                  aria-pressed={pendienteAscenso === "negativa"}
                >
                  Negativa
                </button>
              </div>
            </div>

            <div className="rmp-ecuacion-row">
              <span>Ecuación:</span>
              <span className="rmp-ecuacion-y">y =</span>
              <input
                type="text"
                inputMode="numeric"
                className="rmp-ecuacion-input"
                value={ecAscenso}
                onChange={(e) => setEcAscenso(e.target.value)}
                aria-label="Pendiente de la rampa de ascenso"
              />
              <span className="rmp-ecuacion-x">x</span>
            </div>
          </div>

          {/* RAMPA DE DESCENSO */}
          <div className="rmp-grafica-card rmp-grafica-card-rojo">
            <div className="rmp-grafica-header">
              <span className="rmp-numero-badge rmp-numero-badge-rojo">2</span>
              <h2>Rampa de descenso</h2>
            </div>

            <div className="rmp-grafica-contenido">
              <GraficaRampa color="rojo" puntos={DATOS_DESCENSO} esAscenso={false} />

              <table className="rmp-tabla">
                <thead>
                  <tr>
                    <th>x (m)</th>
                    <th>y (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {DATOS_DESCENSO.map((p) => (
                    <tr key={p.x}>
                      <td>{p.x}</td>
                      <td>{p.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rmp-pendiente-row">
              <span>La pendiente es:</span>
              <div className="rmp-pendiente-btns">
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteDescenso === "positiva" ? "rmp-pendiente-btn-activo-verde" : ""
                  }`}
                  onClick={() => setPendienteDescenso("positiva")}
                  aria-pressed={pendienteDescenso === "positiva"}
                >
                  Positiva
                </button>
                <button
                  type="button"
                  className={`rmp-pendiente-btn ${
                    pendienteDescenso === "negativa" ? "rmp-pendiente-btn-activo-rojo" : ""
                  }`}
                  onClick={() => setPendienteDescenso("negativa")}
                  aria-pressed={pendienteDescenso === "negativa"}
                >
                  Negativa
                </button>
              </div>
            </div>

            <div className="rmp-ecuacion-row">
              <span>Ecuación:</span>
              <span className="rmp-ecuacion-y">y =</span>
              <span className="rmp-ecuacion-signo">−</span>
              <input
                type="text"
                inputMode="numeric"
                className="rmp-ecuacion-input"
                value={ecDescenso}
                onChange={(e) => setEcDescenso(e.target.value)}
                aria-label="Pendiente de la rampa de descenso"
              />
              <span className="rmp-ecuacion-x">x</span>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR */}
        <div className="rmp-bottom-row">
          <div className="rmp-bitacora-card">
            <div className="rmp-bitacora-header">
              <FiSend /> BITÁCORA DE VUELO{" "}
              <span className="rmp-bitacora-sub">(Respuesta final)</span>
            </div>

            <div className="rmp-bitacora-fila">
              <span className="rmp-bitacora-tipo rmp-bitacora-tipo-verde">
                <FiArrowUp /> Ascenso:
              </span>
              <span>pendiente</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitPendienteAscenso}
                onChange={(e) => setBitPendienteAscenso(e.target.value)}
                aria-label="Pendiente final de ascenso"
              />
              <span>ecuación</span>
              <span>y =</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitEcAscenso}
                onChange={(e) => setBitEcAscenso(e.target.value)}
                aria-label="Ecuación final de ascenso"
              />
            </div>

            <div className="rmp-bitacora-fila">
              <span className="rmp-bitacora-tipo rmp-bitacora-tipo-rojo">
                <FiArrowDown /> Descenso:
              </span>
              <span>pendiente</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitPendienteDescenso}
                onChange={(e) => setBitPendienteDescenso(e.target.value)}
                aria-label="Pendiente final de descenso"
              />
              <span>ecuación</span>
              <span>y =</span>
              <input
                type="text"
                className="rmp-bitacora-input"
                value={bitEcDescenso}
                onChange={(e) => setBitEcDescenso(e.target.value)}
                aria-label="Ecuación final de descenso"
              />
            </div>

            <p className="rmp-bitacora-nota">
              <FiInfo /> Completa las respuestas arriba y luego verifica tu
              misión.
            </p>

            {resultado === "correcto" && (
              <p className="rmp-resultado rmp-resultado-correcto">
                <FiCheckCircle /> ¡Misión cumplida! Calibraste las dos rampas
                correctamente.
              </p>
            )}
            {resultado === "incorrecto" && (
              <p className="rmp-resultado rmp-resultado-incorrecto">
                <FiXCircle /> Algo no cuadra todavía. Revisa la tabla de cada
                rampa y vuelve a intentarlo.
              </p>
            )}
          </div>

          <div className="rmp-pista-card">
            <div className="rmp-pista-header">
              <div className="rmp-robot-avatar rmp-robot-avatar-sm" aria-hidden="true">
                <div className="rmp-robot-cara">
                  <span className="rmp-robot-ojo" />
                  <span className="rmp-robot-ojo" />
                </div>
              </div>
              <strong>PISTA DE BIT</strong>
            </div>
            <p>
              Si la recta sube de izquierda a derecha, la pendiente es{" "}
              <strong className="rmp-texto-verde">positiva</strong>. Si baja,
              es <strong className="rmp-texto-rojo">negativa</strong>.
            </p>
            <div className="rmp-pista-formula">
              pendiente ={" "}
              <span className="rmp-formula-frac">
                <span>cambio vertical</span>
                <span>cambio horizontal</span>
              </span>
            </div>

            <button
              className="rmp-verificar-btn"
              type="button"
              onClick={verificarRespuestas}
            >
              <FiSend /> Verificar respuestas
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
