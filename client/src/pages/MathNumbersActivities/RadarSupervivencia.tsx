import { useMemo, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import MathNumbersActivityShell from "./MathNumbersActivityShell";
import { mnrxAssets } from "./mathNumbersAssets";

const signals = [
  { id: "a", label: "Aliada A", value: "3", color: "green", symbol: "★" },
  { id: "b", label: "Aliada B", value: "5", color: "blue", symbol: "★" },
  { id: "c", label: "Enemiga C", value: "-2", color: "red", symbol: "☠" },
  { id: "d", label: "Enemiga D", value: "-4", color: "red", symbol: "☠" },
];

const dropTargets = ["-4", "-2", "3", "5"];
const ticks = ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"];

function RadarSupervivencia() {
  const navigate = useNavigate();
  const [selectedSignal, setSelectedSignal] = useState("");
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const placedCount = Object.keys(placements).length;
  const correctCount = useMemo(
    () => dropTargets.filter((target) => placements[target] === target).length,
    [placements]
  );

  const placeSignal = (target: string, value: string) => {
    if (!value) return;

    setPlacements((current) => {
      const cleaned = Object.fromEntries(Object.entries(current).filter(([, placed]) => placed !== value));
      return { ...cleaned, [target]: value };
    });
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>, target: string) => {
    event.preventDefault();
    placeSignal(target, event.dataTransfer.getData("text/plain"));
  };

  const checkPositions = () => {
    if (placedCount < dropTargets.length) {
      setMessage("Ubica las cuatro señales para activar el radar.");
      return;
    }

    if (correctCount === dropTargets.length) {
      setMessage("¡Excelente! Radar calibrado.");
      window.setTimeout(() => {
        navigate("/actividades/mathnumbers/completada?from=radar-supervivencia&next=ascensor-bunker&correct=4&total=4&attempts=1");
      }, 650);
      return;
    }

    const resultSlug = correctCount >= dropTargets.length - 1 ? "vuelve-a-intentarlo" : "casi-lo-logras";
    setMessage(correctCount >= 3 ? "¡Te faltó muy poco!" : "Aún no se completó la actividad.");
    window.setTimeout(() => {
      navigate(`/actividades/mathnumbers/${resultSlug}?from=radar-supervivencia&correct=${correctCount}&total=4&attempts=1`);
    }, 650);
  };

  const openHint = () => {
    navigate(`/actividades/mathnumbers/pista?from=radar-supervivencia&correct=${placedCount}&total=4&attempts=1`);
  };

  return (
    <MathNumbersActivityShell
      avatar={mnrxAssets.radarAvatar}
      title="2. El Radar de Supervivencia"
      topic="Tema 2: Positivos y negativos"
      subtitle="Ubica números con signo en la recta numérica para calibrar el radar de la base."
      progress={placedCount}
      total={4}
      heroImage={mnrxAssets.radarHero}
      heroAlt="Robot matemático y recompensa Radar calibrado"
      rewardTitle="Recompensa"
      rewardText="Radar calibrado"
      bottom={
        <>
          <article className="mnrx-hint-card" onClick={openHint} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openHint()}>
            <span>💡</span>
            <div>
              <h2>Pista</h2>
              <p>Los negativos van a la izquierda del 0 y los positivos a la derecha.</p>
            </div>
          </article>

          <article className="mnrx-extra-card">
            <h2>🏆 Reto extra</h2>
            <p>Explica por qué −4 queda más lejos a la izquierda que −2.</p>
          </article>

          <div className="mnrx-actions">
            <button type="button" className="mnrx-secondary" onClick={() => navigate("/actividades-math-numbers")}>← Volver</button>
            <button type="button" className="mnrx-primary" onClick={checkPositions}>✓ Comprobar posiciones</button>
            <p>{message || "Ubica correctamente las 4 señales para activar el radar."}</p>
          </div>
        </>
      }
    >
      <article className="mnrx-mission-panel mnrx-radar-panel">
        <img src={mnrxAssets.radarPanel} alt="Radar numérico de -5 a 5" />
        <section>
          <h3>ⓘ Instrucciones de la misión</h3>
          <p>Arrastra o selecciona las señales aliadas y enemigas a la posición correcta sobre la recta numérica.</p>
        </section>
      </article>

      <section className="mnrx-question-column">
        <article className="mnrx-guide-card">
          <img src={mnrxAssets.radarGuide} alt="Guía del radar" />
          <div>
            <h2>¡Atento, explorador!</h2>
            <p>El 0 es tu base central. Los positivos van a la derecha y los negativos a la izquierda.</p>
          </div>
        </article>

        <div className="mnrx-signal-grid">
          {signals.map((signal) => (
            <button
              type="button"
              key={signal.id}
              draggable
              className={`mnrx-signal-card mnrx-signal-${signal.color} ${selectedSignal === signal.value ? "mnrx-selected" : ""}`}
              onClick={() => setSelectedSignal(signal.value)}
              onDragStart={(event) => event.dataTransfer.setData("text/plain", signal.value)}
            >
              <span>{signal.symbol}</span>
              <div>
                <b>{signal.label}</b>
                <small>Destino: <strong>{Number(signal.value) > 0 ? `+${signal.value}` : signal.value}</strong></small>
              </div>
            </button>
          ))}
        </div>

        <article className="mnrx-number-card">
          <p>☝ Arrastra cada señal o toca una señal y luego su casilla.</p>
          <div className="mnrx-drop-row">
            {dropTargets.map((target) => (
              <button
                type="button"
                key={target}
                className={`mnrx-drop-zone ${placements[target] ? "mnrx-filled" : ""} ${Number(target) < 0 ? "mnrx-red-zone" : target === "5" ? "mnrx-blue-zone" : "mnrx-green-zone"}`}
                onClick={() => placeSignal(target, selectedSignal)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, target)}
              >
                {placements[target] ? (Number(placements[target]) > 0 ? `+${placements[target]}` : placements[target]) : ""}
              </button>
            ))}
          </div>

          <div className="mnrx-number-line">
            {ticks.map((tick) => (
              <span key={tick} className={tick === "0" ? "mnrx-zero-tick" : ""}>
                <i />
                <b>{tick}</b>
              </span>
            ))}
          </div>
        </article>
      </section>
    </MathNumbersActivityShell>
  );
}

export default RadarSupervivencia;
