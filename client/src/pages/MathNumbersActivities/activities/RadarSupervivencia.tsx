import { useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap } from "react-icons/fi";
import { activityListRoute } from "../constants";
import { MathNumbersShell } from "../components/MathNumbersShell";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { radarGuide, radarHero, radarVideo } from "../mathNumbersAssets";
import { formatSigned } from "../utils/formatSigned";

const signals = [
  { value: "3", label: "Aliada A", target: "+3", symbol: "★", type: "green" },
  { value: "5", label: "Aliada B", target: "+5", symbol: "★", type: "blue" },
  { value: "-2", label: "Enemiga C", target: "−2", symbol: "☠", type: "red" },
  { value: "-4", label: "Enemiga D", target: "−4", symbol: "☠", type: "red" },
];

const targets = ["-4", "-2", "3", "5"];

export function RadarSupervivencia() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});

  const progress = Object.keys(placements).length;

  const placeSignal = (target: string, value: string) => {
    setPlacements((current) => {
      const next: Record<string, string> = {};

      Object.entries(current).forEach(([currentTarget, currentValue]) => {
        if (currentValue !== value && currentTarget !== target) {
          next[currentTarget] = currentValue;
        }
      });

      next[target] = value;
      return next;
    });
  };

  const dragSignal = (event: DragEvent<HTMLButtonElement>, value: string) => {
    event.dataTransfer.setData("text/plain", value);
  };

  const dropSignal = (event: DragEvent<HTMLButtonElement>, target: string) => {
    event.preventDefault();

    const value = event.dataTransfer.getData("text/plain");

    if (value) {
      placeSignal(target, value);
    }
  };

  const comprobar = () => {
    if (progress < 4) {
      showToast("Ubica las cuatro señales para activar el radar.", true);
      return;
    }

    const total = targets.filter((target) => placements[target] === target).length;

    if (total === 4) {
      showToast("¡Excelente! Radar calibrado.");
      window.setTimeout(() => navigate("/actividades/mathnumbers/actividad-completada"), 700);
      return;
    }

    showToast("Hay señales en posiciones incorrectas. Inténtalo de nuevo.", true);

    window.setTimeout(
      () =>
        navigate(
          total >= 2
            ? "/actividades/mathnumbers/casi-lo-logras"
            : "/actividades/mathnumbers/vuelve-a-intentarlo",
        ),
      900,
    );
  };

  return (
    <MathNumbersShell
      crumb="MathNumbers / Tema 2: Positivos y negativos"
      title="2. El Radar de Supervivencia"
      subtitle="Ubica números con signo en la recta numérica para calibrar el radar de la base."
      progress={`${progress}/4`}
      progressValue={progress * 25}
      heroImage={radarHero}
      heroAlt="Robot matemático y recompensa Radar calibrado"
      rewardTitle="Recompensa"
      rewardText="Radar calibrado"
    >
      <div className="mnx-two-column mnx-radar-grid">
        <article className="mnx-mission-card">
  <h2>ⓘ Instrucciones de la misión</h2>

  <video
    className="mnx-mission-video"
    src={radarVideo}
    autoPlay
    muted
    loop
    playsInline
    preload="auto"
    onCanPlay={(event) => {
      event.currentTarget.play().catch(() => {});
    }}
  />

  <p>
    Arrastra las señales aliadas y enemigas a la posición correcta sobre la recta numérica.
  </p>
</article>

        <section className="mnx-question-stack">
          <article className="mnx-guide-card">
            <img src={radarGuide} alt="Guía de radar" />

            <div>
              <h2>¡Atento, explorador!</h2>
              <p>
                El 0 es tu base central. Los positivos van a la derecha y los negativos a la izquierda.
              </p>
            </div>
          </article>

          <div className="mnx-signal-grid">
            {signals.map((signal) => (
              <button
                key={signal.value}
                type="button"
                draggable
                className={`mnx-signal-card mnx-signal-${signal.type} ${
                  selectedSignal === signal.value ? "mnx-selected" : ""
                }`}
                onDragStart={(event) => dragSignal(event, signal.value)}
                onClick={() => setSelectedSignal(signal.value)}
              >
                <span>{signal.symbol}</span>

                <div>
                  <b>{signal.label}</b>
                  <small>
                    Destino: <strong>{signal.target}</strong>
                  </small>
                </div>
              </button>
            ))}
          </div>

          <article className="mnx-number-card">
            <p>☝ Arrastra cada señal desde A hasta su posición correcta</p>

            <div className="mnx-drop-row">
              {targets.map((target) => {
                const placedValue = placements[target];

                return (
                  <button
                    key={target}
                    type="button"
                    className={`mnx-drop-zone ${placedValue ? "mnx-filled" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropSignal(event, target)}
                    onClick={() => selectedSignal && placeSignal(target, selectedSignal)}
                  >
                    {placedValue ? formatSigned(placedValue) : ""}
                  </button>
                );
              })}
            </div>

            <div className="mnx-number-line">
              {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((number) => (
                <span key={number}>{number}</span>
              ))}
            </div>
          </article>
        </section>
      </div>

      <section className="mnx-bottom-panel">
        <article className="mnx-hint-card">
          <FiZap />

          <div>
            <h2>Pista</h2>
            <p>Recuerda: entre más a la izquierda esté un número negativo, menor es su valor.</p>
            <small>−4 está más a la izquierda que −2</small>
          </div>
        </article>

        <article className="mnx-extra-card">
          <h2>🏆 Reto extra</h2>
          <p>
            <b>Explica:</b> ¿Por qué −4 queda más lejos a la izquierda que −2?
          </p>
        </article>

        <div className="mnx-actions-card">
          <button
            className="mnx-secondary-action"
            type="button"
            onClick={() => navigate(activityListRoute)}
          >
            ← Volver
          </button>

          <button className="mnx-primary-action" type="button" onClick={comprobar}>
            ✓ Comprobar posiciones
          </button>

          <p>♙ Ubica correctamente las 4 señales para activar el radar.</p>
        </div>
      </section>

      <Toast toast={toast} />
    </MathNumbersShell>
  );
}