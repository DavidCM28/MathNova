import { useMemo, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { mnrxAssets } from "./mathNumbersAssets";

const floorCards = [3, -5, 0, 6, -2];
const correctOrder = [-5, -2, 0, 3, 6];

function AscensorBunker() {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [placed, setPlaced] = useState<(number | null)[]>([null, null, null, null, null]);
  const [message, setMessage] = useState("");

  const placedCount = placed.filter((item) => item !== null).length;
  const correctCount = useMemo(
    () => correctOrder.filter((value, index) => placed[index] === value).length,
    [placed]
  );

  const placeFloor = (index: number, value: number | null) => {
    if (value === null) return;

    setPlaced((current) => {
      const cleaned = current.map((item) => (item === value ? null : item));
      cleaned[index] = value;
      return cleaned;
    });
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    const value = Number(event.dataTransfer.getData("text/plain"));
    placeFloor(index, value);
  };

  const verifyRoute = () => {
    if (placedCount < correctOrder.length) {
      setMessage("Coloca las cinco tarjetas en el ascensor.");
      return;
    }

    if (correctCount === correctOrder.length) {
      setMessage("¡Ruta correcta! Ascensor restablecido.");
      window.setTimeout(() => {
        navigate("/actividades/mathnumbers/completada?from=ascensor-bunker&correct=5&total=5&attempts=1");
      }, 650);
      return;
    }

    const resultSlug = correctCount >= correctOrder.length - 1 ? "vuelve-a-intentarlo" : "casi-lo-logras";
    setMessage(correctCount >= 4 ? "¡Te faltó muy poco!" : "Aún no se completó la actividad.");
    window.setTimeout(() => {
      navigate(`/actividades/mathnumbers/${resultSlug}?from=ascensor-bunker&correct=${correctCount}&total=5&attempts=1`);
    }, 650);
  };

  const reset = () => {
    setSelectedFloor(null);
    setPlaced([null, null, null, null, null]);
    setMessage("");
  };

  const openHint = () => {
    navigate(`/actividades/mathnumbers/pista?from=ascensor-bunker&correct=${placedCount}&total=5&attempts=1`);
  };

  return (
    <main className="mnrx-page mnrx-elevator-page">
      <section className="mnrx-elevator-content">
        <header className="mnrx-elevator-hero">
          <button type="button" onClick={() => navigate("/actividades-math-numbers")}>← Volver a actividades</button>
          <div>
            <span>↕</span>
            <h1>El Ascensor del Búnker</h1>
          </div>
          <p>Ordena los pisos desde el más profundo hasta el más alto para restablecer el ascensor.</p>
          <div className="mnrx-tags"><b>◉ Ordenamiento</b><b>Nivel 1 • Positivos y negativos</b></div>
          <img src={mnrxAssets.ascensorCommander} alt="Comandante Suma" />
          <article>
            <strong>Comandante Suma</strong>
            <p>El nivel del suelo es 0. Los sótanos son negativos y las torres son positivas.</p>
          </article>
        </header>

        <section className="mnrx-elevator-game">
          <aside className="mnrx-elevator-mission">
            <article className="mnrx-card">
              <h2>◎ Tu misión</h2>
              <p>Ordena los pisos desde el más profundo hasta el más alto.</p>
              <h3>Tarjetas de pisos</h3>
              <div className="mnrx-floor-cards">
                {floorCards.map((floor) => (
                  <button
                    type="button"
                    draggable
                    key={floor}
                    className={selectedFloor === floor ? "mnrx-selected" : ""}
                    onClick={() => setSelectedFloor(floor)}
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", String(floor))}
                  >
                    {floor > 0 ? `+${floor}` : floor}
                  </button>
                ))}
              </div>
            </article>

            <article className="mnrx-card mnrx-hint-card" onClick={openHint} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openHint()}>
              <span>💡</span>
              <div>
                <h2>Pista</h2>
                <p>Los negativos más pequeños van más abajo. Ejemplo: -5 está más abajo que -2.</p>
              </div>
            </article>
          </aside>

          <section className="mnrx-elevator-zone">
            <img src={mnrxAssets.ascensorElevator} alt="Ascensor del Búnker con pisos ordenados" />
            <div className="mnrx-elevator-slots">
              {placed.map((floor, index) => (
                <button
                  type="button"
                  key={index}
                  className={floor !== null ? "mnrx-filled" : ""}
                  onClick={() => placeFloor(index, selectedFloor)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                >
                  {floor !== null ? (floor > 0 ? `+${floor}` : floor) : ""}
                </button>
              ))}
            </div>
          </section>

          <aside className="mnrx-elevator-instructions">
            <article className="mnrx-card">
              <h2>¿Cómo jugar?</h2>
              <p><b>1</b> Arrastra o selecciona una tarjeta.</p>
              <p><b>2</b> Suéltala en una posición del ascensor.</p>
              <p><b>3</b> Ordena todos los pisos de menor a mayor.</p>
            </article>

            <article className="mnrx-elevator-state">
              <span>↕</span>
              <div>
                <b>Estado del ascensor</b>
                <strong>{placedCount === 5 ? "◉ Listo para verificar" : "◉ Incompleto"}</strong>
              </div>
            </article>

            <button type="button" className="mnrx-primary" onClick={verifyRoute}>✓ Verificar ruta</button>
            <button type="button" className="mnrx-secondary" onClick={reset}>⟳ Reiniciar</button>
            <p className="mnrx-inline-message">{message || "Coloca las cinco tarjetas en el orden correcto."}</p>
          </aside>
        </section>

        <footer className="mnrx-elevator-footer">
          <article className="mnrx-card">
            <h2>★ ¿Sabías que...?</h2>
            <p>En la recta numérica, los números negativos están a la izquierda del 0 y los positivos a la derecha.</p>
          </article>
          <article className="mnrx-card mnrx-reward-small">
            <h2>🏆 Recompensa</h2>
            <b>+50 <small>pts</small></b>
          </article>
        </footer>
      </section>
    </main>
  );
}

export default AscensorBunker;
