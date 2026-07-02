import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mnrxAssets } from "./mathNumbersAssets";
import { getMathNumbersActivity, type MathNumbersResultSlug } from "./mathNumbersData";

type MathNumbersResultScreenProps = {
  result: MathNumbersResultSlug;
};

type ResultVisual = {
  badge: string;
  hero: string;
  title: string;
  subtitle: string;
  messageTitle: string;
  message: string;
  variant: string;
  primaryLabel: string;
};

const visuals: Record<MathNumbersResultSlug, ResultVisual> = {
  completada: {
    badge: mnrxAssets.completedCheck,
    hero: mnrxAssets.completedHero,
    title: "¡Actividad completada!",
    subtitle: "Excelente trabajo, explorador. La misión quedó registrada correctamente.",
    messageTitle: "¡Misión superada!",
    message: "Completaste la actividad y desbloqueaste progreso en MathNumbers.",
    variant: "success",
    primaryLabel: "Siguiente actividad",
  },
  "casi-lo-logras": {
    badge: mnrxAssets.almostBulb,
    hero: mnrxAssets.almostHero,
    title: "¡Casi lo logras!",
    subtitle: "Aún no se completó la actividad, pero ya encontraste parte del camino.",
    messageTitle: "Sigue practicando",
    message: "Revisa la pista y vuelve a intentarlo con calma. La matemática no muerde, solo rasguña poquito.",
    variant: "almost",
    primaryLabel: "Intentar de nuevo",
  },
  "vuelve-a-intentarlo": {
    badge: mnrxAssets.retryMessage,
    hero: mnrxAssets.retryHero,
    title: "¡Vuelve a intentarlo!",
    subtitle: "Te faltó muy poco para completar la misión.",
    messageTitle: "Un ajuste más",
    message: "Solo revisa el detalle que falló y vuelve a probar. Estás a un paso de lograrlo.",
    variant: "retry",
    primaryLabel: "Repetir actividad",
  },
  pista: {
    badge: mnrxAssets.hintShield,
    hero: mnrxAssets.hintHero,
    title: "¡Aquí tienes una pista!",
    subtitle: "Observa esta ayuda para avanzar en la misión de MathNumbers.",
    messageTitle: "Consejo del Comandante Suma",
    message: "Antes de responder, revisa qué te pide el ejercicio y separa el problema en partes pequeñas.",
    variant: "hint",
    primaryLabel: "Regresar a la actividad",
  },
};

function MathNumbersResultScreen({ result }: MathNumbersResultScreenProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState("");
  const from = searchParams.get("from") || "cofre-bienvenida";
  const next = searchParams.get("next") || "";
  const activity = getMathNumbersActivity(from);
  const visual = visuals[result];
  const total = Math.max(1, Number(searchParams.get("total") || activity.total));
  const rawCorrect = Number(searchParams.get("correct") || (result === "completada" ? total : 0));
  const correct = Math.min(total, Math.max(0, rawCorrect));
  const attempts = Math.max(1, Number(searchParams.get("attempts") || 1));
  const percent = Math.round((correct / total) * 100);
  const progressPercent = Math.max(12, Math.min(100, activity.progress + Math.round(percent / 5)));

  const statCards = useMemo(
    () => [
      { label: "Intentos", value: String(attempts), helper: "Registro actual", icon: result === "pista" ? mnrxAssets.hintTarget : result === "casi-lo-logras" ? mnrxAssets.almostTarget : mnrxAssets.completedTarget },
      { label: "Aciertos", value: `${correct}/${total}`, helper: result === "completada" ? "Perfecto" : "Puedes mejorar", icon: result === "pista" ? mnrxAssets.hintTriangle : result === "vuelve-a-intentarlo" ? mnrxAssets.retryTarget : mnrxAssets.almostTargetCheck },
      { label: "Tiempo", value: activity.time, helper: "min", icon: result === "vuelve-a-intentarlo" ? mnrxAssets.retryClock : result === "pista" ? mnrxAssets.hintClock : mnrxAssets.completedClock },
      { label: "Precisión", value: `${percent}%`, helper: result === "completada" ? "Gran avance" : "Sigue practicando", icon: result === "pista" ? mnrxAssets.hintGauge : result === "casi-lo-logras" ? mnrxAssets.almostPrecision : mnrxAssets.completedPrecision },
      { label: result === "pista" ? "Ayuda usada" : "Recompensa", value: result === "pista" ? "1 pista" : correct > 0 ? "+10 pts" : "+0 pts", helper: result === "pista" ? "Buen uso" : "MathNumbers", icon: result === "pista" ? mnrxAssets.hintQuestion : result === "vuelve-a-intentarlo" ? mnrxAssets.retryCoin : mnrxAssets.completedCoin },
    ],
    [activity.time, attempts, correct, percent, result, total]
  );

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const retryActivity = () => {
    navigate(`/actividades/mathnumbers/${activity.slug}`);
  };

  const primaryAction = () => {
    if (result === "completada" && next) {
      navigate(`/actividades/mathnumbers/${next}`);
      return;
    }

    retryActivity();
  };

  const openHint = () => {
    if (result === "pista") {
      showToast(activity.hint);
      return;
    }

    navigate(`/actividades/mathnumbers/pista?from=${activity.slug}&correct=${correct}&total=${total}&attempts=${attempts}`);
  };

  return (
    <main className={`mnrx-page mnrx-result-page mnrx-result-${visual.variant}`}>
      <img className="mnrx-result-logo" src={mnrxAssets.logo} alt="MathNova" />

      <button type="button" className="mnrx-home-button" onClick={() => navigate("/")}>⌂ Inicio</button>

      <section className="mnrx-result-hero">
        <div className="mnrx-result-copy">
          <span className="mnrx-result-badge"><img src={visual.badge} alt="" /></span>
          <h1>{visual.title}</h1>
          <p>{visual.subtitle}</p>
        </div>
        <img className="mnrx-result-art" src={visual.hero} alt={visual.title} />
      </section>

      <section className="mnrx-message-card">
        <span>★</span>
        <div>
          <h2>{visual.messageTitle}</h2>
          <p>{result === "pista" ? activity.hint : visual.message}</p>
        </div>
      </section>

      <section className="mnrx-summary-card">
        <header>
          <h2>Resumen de la actividad</h2>
          <strong>{activity.shortTitle}</strong>
        </header>

        <div className="mnrx-stats-grid">
          {statCards.map((card) => (
            <article className="mnrx-stat" key={card.label}>
              <img src={card.icon} alt="" />
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.helper}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mnrx-progress-wide">
        <img src={result === "pista" ? mnrxAssets.hintPlanet : result === "casi-lo-logras" ? mnrxAssets.almostPlanet : result === "vuelve-a-intentarlo" ? mnrxAssets.retryPlanet : mnrxAssets.completedPlanet} alt="" />
        <div>
          <span>Tu progreso en el tema:</span>
          <strong>Números y Operaciones</strong>
        </div>
        <section>
          <div className="mnrx-wide-bar"><i style={{ width: `${progressPercent}%` }} /><b>{progressPercent}%</b></div>
          <p>{result === "completada" ? "¡Buen avance! Sigue con la siguiente misión." : "Vas avanzando. Sigue practicando para completar este tema."}</p>
        </section>
        <article>
          <img src={result === "pista" ? mnrxAssets.hintMilestone : result === "casi-lo-logras" ? mnrxAssets.almostMilestone : result === "vuelve-a-intentarlo" ? mnrxAssets.retryMilestone : mnrxAssets.completedMilestone} alt="" />
          <div><span>Siguiente hito</span><strong>80%</strong><small>Gran Explorador</small></div>
        </article>
      </section>

      {result === "pista" && (
        <section className="mnrx-tip-panel">
          <img src={mnrxAssets.hintTipClock} alt="" />
          <div>
            <h2>Tip rápido</h2>
            <p>Lee, piensa y responde. Descarta primero las opciones que claramente no coinciden.</p>
          </div>
        </section>
      )}

      {result === "vuelve-a-intentarlo" && (
        <section className="mnrx-tip-panel">
          <img src={mnrxAssets.retryShield} alt="" />
          <div>
            <h2>Estás muy cerca</h2>
            <p>{activity.hint}</p>
          </div>
        </section>
      )}

      <aside className="mnrx-result-actions">
        <button type="button" className="mnrx-primary" onClick={primaryAction}>{visual.primaryLabel}</button>
        <button type="button" className="mnrx-secondary" onClick={openHint}>{result === "pista" ? "Ver pista otra vez" : "Ver pista"}</button>
        <button type="button" className="mnrx-secondary" onClick={() => navigate("/actividades-math-numbers")}>Volver a actividades</button>
      </aside>

      {toast && <div className="mnrx-toast">{toast}</div>}
    </main>
  );
}

export default MathNumbersResultScreen;
