import { useState } from "react";
import type { DragEvent } from "react";
import { MathNumbersShell } from "../components/MathNumbersShell";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { ascensorCommander, ascensorElevator } from "../mathNumbersAssets";
import { formatSigned } from "../utils/formatSigned";
import { useNavigate } from "react-router-dom";

const correctOrder = [-5, -2, 0, 3, 6];
const floorCards = [3, -5, 0, 6, -2];

export function AscensorBunker() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null, null, null]);

  const progress = slots.filter((slot) => slot !== null).length;

  const placeFloor = (index: number, value: number) => {
    setSlots((current) => {
      const next = current.map((slot) => (slot === value ? null : slot));
      next[index] = value;
      return next;
    });
  };

  const dragFloor = (event: DragEvent<HTMLButtonElement>, value: number) => {
    event.dataTransfer.setData("text/plain", String(value));
  };

  const dropFloor = (event: DragEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    const value = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(value)) placeFloor(index, value);
  };

  const verificar = () => {
    if (progress < 5) {
      showToast("Coloca las cinco tarjetas en el ascensor.", true);
      return;
    }

    const total = correctOrder.filter((value, index) => slots[index] === value).length;

    if (total === 5) {
      showToast("¡Ruta correcta! Ascensor restablecido.");
      window.setTimeout(() => navigate("/actividades/mathnumbers/actividad-completada"), 700);
      return;
    }

    showToast("El orden no es correcto. Inténtalo de nuevo.", true);
    window.setTimeout(
      () => navigate(total >= 3 ? "/actividades/mathnumbers/casi-lo-logras" : "/actividades/mathnumbers/vuelve-a-intentarlo"),
      900,
    );
  };

  const reiniciar = () => setSlots([null, null, null, null, null]);

  return (
    <MathNumbersShell
      crumb="MathNumbers / Nivel 1 • Positivos y negativos"
      title="El Ascensor del Búnker"
      subtitle="Ordena los pisos desde el más profundo (negativos) hasta el más alto (positivos) para restablecer el ascensor y salir del búnker."
      progress={`${progress}/5`}
      progressValue={progress * 20}
      heroImage={ascensorCommander}
      heroAlt="Comandante Suma"
      rewardTitle="Recompensa"
      rewardText="+50 pts"
    >
      <section className="mnx-ascensor-layout">
        <aside className="mnx-mission-card">
          <h2>◎ Tu misión</h2>
          <p>Ordena los pisos desde el más profundo hasta el más alto.</p>
          <h3>Tarjetas de pisos</h3>
          <p>Arrastra cada tarjeta al ascensor en el orden correcto.</p>

          <div className="mnx-floor-cards">
            {floorCards.map((floor) => (
              <button
                key={floor}
                type="button"
                draggable
                className={selectedFloor === floor ? "mnx-selected" : ""}
                onDragStart={(event) => dragFloor(event, floor)}
                onClick={() => setSelectedFloor(floor)}
              >
                {formatSigned(floor)}
              </button>
            ))}
          </div>

          <article className="mnx-info-card">
            <h2>💡 Pista</h2>
            <p>Los negativos más grandes en valor van más abajo. Ejemplo: -5 está más abajo que -2.</p>
          </article>
        </aside>

        <section className="mnx-elevator-zone">
          <img src={ascensorElevator} alt="Ascensor del Búnker con pisos ordenados" />
          <div className="mnx-elevator-slots">
            {slots.map((slot, index) => (
              <button
                key={`slot-${index}`}
                type="button"
                className={slot !== null ? "mnx-filled" : ""}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropFloor(event, index)}
                onClick={() => selectedFloor !== null && placeFloor(index, selectedFloor)}
              >
                {slot !== null ? formatSigned(slot) : index + 1}
              </button>
            ))}
          </div>
        </section>

        <aside className="mnx-how-card">
          <article className="mnx-guide-card mnx-commander-card">
            <img src={ascensorCommander} alt="Comandante Suma" />
            <div>
              <h2>Comandante Suma</h2>
              <p>El nivel del suelo es 0. Los sótanos son negativos y las torres son positivas. ¡Ordena bien la ruta!</p>
            </div>
          </article>

          <div className="mnx-info-card">
            <h2>¿Cómo jugar?</h2>
            <p><b>1</b> Arrastra una tarjeta de piso.</p>
            <p><b>2</b> Suéltala en la posición que creas correcta.</p>
            <p><b>3</b> Ordena todos los pisos desde el más bajo hasta el más alto.</p>
          </div>

          <article className="mnx-status-card">
            <span>↕</span>
            <div>
              <b>Estado del ascensor</b>
              <strong>{progress === 5 ? "◉ Listo para verificar" : "◉ Incompleto"}</strong>
            </div>
          </article>

          <button className="mnx-primary-action" type="button" onClick={verificar}>✓ Verificar ruta</button>
          <button className="mnx-secondary-action" type="button" onClick={reiniciar}>⟳ Reiniciar</button>
        </aside>
      </section>

      <section className="mnx-bottom-panel">
        <article className="mnx-hint-card">
          <span>★</span>
          <div>
            <h2>¿Sabías que...?</h2>
            <p>En la recta numérica, los números negativos están a la izquierda del 0 y los positivos a la derecha. Entre más a la izquierda, más pequeño es el número.</p>
          </div>
        </article>

        <article className="mnx-extra-card">
          <h2>🏆 Recompensa</h2>
          <p><b>+50 pts</b> al completar correctamente la ruta.</p>
        </article>
      </section>

      <Toast toast={toast} />
    </MathNumbersShell>
  );
}
