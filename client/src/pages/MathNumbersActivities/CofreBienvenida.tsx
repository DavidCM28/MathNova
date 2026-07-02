import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MathNumbersActivityShell from "./MathNumbersActivityShell";
import { mnrxAssets } from "./mathNumbersAssets";

type Question = {
  id: string;
  title: string;
  text: string;
  correct: string;
  options: { label: string; value: string }[];
};

const questions: Question[] = [
  {
    id: "1",
    title: "La batería está cargada a 1/2.",
    text: "¿Cuál es su equivalente decimal?",
    correct: "0.5",
    options: [
      { label: "a) 0.2", value: "0.2" },
      { label: "b) 0.5", value: "0.5" },
      { label: "c) 1.5", value: "1.5" },
      { label: "d) 2.0", value: "2.0" },
    ],
  },
  {
    id: "2",
    title: "El sistema muestra 0.25 de energía.",
    text: "¿Cuál es la fracción equivalente?",
    correct: "1/4",
    options: [
      { label: "a) 1/2", value: "1/2" },
      { label: "b) 1/4", value: "1/4" },
      { label: "c) 2/5", value: "2/5" },
      { label: "d) 4/1", value: "4/1" },
    ],
  },
];

function CofreBienvenida() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState(false);

  const answered = Object.keys(answers).length;
  const correctCount = useMemo(
    () => questions.filter((question) => answers[question.id] === question.correct).length,
    [answers]
  );

  const goToResult = (resultSlug: string, score = correctCount) => {
    navigate(
      `/actividades/mathnumbers/${resultSlug}?from=cofre-bienvenida&correct=${score}&total=2&attempts=1`
    );
  };

  const checkAnswers = () => {
    if (answered < questions.length) {
      setMessage("Responde ambas preguntas para abrir el cofre.");
      return;
    }

    setChecked(true);

    if (correctCount === questions.length) {
      setMessage("¡Excelente! Cofre desbloqueado.");
      window.setTimeout(() => {
        navigate("/actividades/mathnumbers/completada?from=cofre-bienvenida&next=radar-supervivencia&correct=2&total=2&attempts=1");
      }, 650);
      return;
    }

    const resultSlug = correctCount >= questions.length - 1 ? "vuelve-a-intentarlo" : "casi-lo-logras";
    setMessage(correctCount === 1 ? "¡Te faltó muy poco!" : "Aún no se completó la actividad.");
    window.setTimeout(() => goToResult(resultSlug, correctCount), 650);
  };

  const openHint = () => {
    navigate(`/actividades/mathnumbers/pista?from=cofre-bienvenida&correct=${answered}&total=2&attempts=1`);
  };

  return (
    <MathNumbersActivityShell
      avatar={mnrxAssets.cofreAvatar}
      title="1. El Cofre de Bienvenida"
      topic="Tema 1: Fracciones y decimales"
      subtitle="Convierte fracciones y decimales para desbloquear el cofre de suministros."
      progress={answered}
      total={2}
      heroImage={mnrxAssets.cofreHero}
      heroAlt="Robot matemático"
      rewardTitle="Recompensa"
      rewardText="Cofre desbloqueado"
      bottom={
        <>
          <article className="mnrx-hint-card" onClick={openHint} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openHint()}>
            <span>💡</span>
            <div>
              <h2>Pista</h2>
              <p>Piensa cómo se divide la unidad en partes iguales.</p>
            </div>
          </article>

          <div className="mnrx-actions">
            <button type="button" className="mnrx-secondary" onClick={() => navigate("/actividades-math-numbers")}>← Volver</button>
            <button type="button" className="mnrx-primary" onClick={checkAnswers}>✓ Comprobar respuestas</button>
            <p>{message || "Responde ambas preguntas para abrir el cofre."}</p>
          </div>
        </>
      }
    >
      <article className="mnrx-mission-panel mnrx-green-panel">
        <h2>✦ MISIÓN: ABRE EL COFRE ✦</h2>
        <img src={mnrxAssets.cofreChest} alt="Cofre de la misión" />
        <section>
          <h3>ⓘ Instrucciones de la misión</h3>
          <p>Responde correctamente las 2 preguntas para iluminar el panel holográfico y abrir el cofre.</p>
        </section>
      </article>

      <section className="mnrx-question-column">
        <article className="mnrx-guide-card">
          <img src={mnrxAssets.cofreGuide} alt="Robot guía" />
          <div>
            <h2>¡Vamos, explorador!</h2>
            <p>Cada respuesta correcta desbloquea una parte del cofre.</p>
          </div>
        </article>

        {questions.map((question) => (
          <article className="mnrx-question-card" key={question.id}>
            <span className="mnrx-number-badge">{question.id}</span>
            <div className="mnrx-question-copy">
              <p>{question.title}</p>
              <p>{question.text}</p>
            </div>
            <div className="mnrx-choice-grid">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.value;
                const correct = checked && selected && option.value === question.correct;
                const wrong = checked && selected && option.value !== question.correct;

                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`${selected ? "mnrx-selected" : ""} ${correct ? "mnrx-correct" : ""} ${wrong ? "mnrx-wrong" : ""}`}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </MathNumbersActivityShell>
  );
}

export default CofreBienvenida;
