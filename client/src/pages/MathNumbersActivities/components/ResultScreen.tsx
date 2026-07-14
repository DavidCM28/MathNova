import { useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiZap } from "react-icons/fi";
import { activityListRoute } from "../constants";
import { resultData } from "../data/resultData";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";
import { MathNumbersShell } from "./MathNumbersShell";
import { hintShield, hintTipClock } from "../mathNumbersAssets";
import type { ResultKind } from "../types";

type ResultNavigationState = {
  nextRoute?: string;
  retryRoute?: string;
};

export function ResultScreen({ kind }: { kind: ResultKind }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { toast, showToast } = useToast();
  const data = resultData[kind];

  /*
   * Recibe las rutas enviadas desde cada actividad:
   *
   * nextRoute:
   * Indica a qué actividad debe ir el botón
   * "Siguiente actividad".
   *
   * retryRoute:
   * Indica qué actividad debe abrir el botón
   * "Repetir actividad" o "Intentar de nuevo".
   */
  const navigationState =
    location.state as ResultNavigationState | null;

  /*
   * Si la actividad no envía nextRoute,
   * conserva Radar de Supervivencia como destino.
   */
  const nextRoute =
    navigationState?.nextRoute ??
    "/actividades/mathnumbers/radar-supervivencia";

  /*
   * Si la actividad no envía retryRoute,
   * conserva Cofre de Bienvenida como destino.
   */
  const retryRoute =
    navigationState?.retryRoute ??
    "/actividades/mathnumbers/cofre-bienvenida";

  const goHome = () => {
    navigate("/dashboard");
  };

  const retry = () => {
    navigate(retryRoute);
  };

  const hint = () => {
    navigate("/actividades/mathnumbers/aqui-tienes-una-pista");
  };

  const next = () => {
    navigate(nextRoute);
  };

  const back = () => {
    navigate(activityListRoute);
  };

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      home: "Ir al inicio",
      retry: "Listo para intentar de nuevo",
      hint:
        kind === "hint"
          ? "Aquí va otra pista para ayudarte"
          : "Pista: revisa cada paso antes de responder",
      back: "Volver a actividades",
      next: "Siguiente actividad lista",
      repeat: "Actividad reiniciada",
    };

    showToast(
      messages[action] || "Acción seleccionada",
    );

    window.setTimeout(() => {
      if (action === "home") {
        goHome();
      }

      if (
        action === "retry" ||
        action === "repeat"
      ) {
        retry();
      }

      if (action === "hint") {
        hint();
      }

      if (action === "next") {
        next();
      }

      if (action === "back") {
        back();
      }
    }, 450);
  };

  return (
    <MathNumbersShell
      crumb="MathNumbers / Resultados"
      title={data.title}
      subtitle={data.subtitle}
      progress="60%"
      progressValue={60}
      heroImage={data.hero}
      heroAlt={data.heroAlt}
      rewardTitle="Tema"
      rewardText="Números y Operaciones"
    >
      <section className="mnx-result-layout">
        <article className="mnx-result-message-card">
          <span className="mnx-big-badge">
            ★
          </span>

          <div>
            <h2>{data.messageTitle}</h2>
            <p>{data.message}</p>
          </div>
        </article>

        {kind === "hint" && (
          <article className="mnx-hint-detail-card">
            <header>
              <FiZap />
              <h2>Pista para resolver</h2>
            </header>

            <div className="mnx-hint-detail-body">
              <img
                src={hintShield}
                alt="Escudo de pista"
              />

              <span>→</span>

              <div>
                <h3>
                  Consejo del Comandante Suma
                </h3>

                <p>
                  Antes de responder, revisa qué te
                  pide el ejercicio y separa el
                  problema en partes pequeñas. Si
                  hay varias opciones, descarta
                  primero las que claramente no
                  coinciden.
                </p>
              </div>

              <aside>
                <img
                  src={hintTipClock}
                  alt="Tip rápido"
                />

                <strong>Tip rápido:</strong>
                <span>
                  Lee, piensa y responde.
                </span>
              </aside>
            </div>
          </article>
        )}

        <article className="mnx-summary-card">
          <header className="mnx-card-title">
            <FiBarChart2 />
            <h2>Resumen de la actividad</h2>
          </header>

          <div className="mnx-stats-grid">
            {data.stats.map((stat) => (
              <article
                className="mnx-result-stat"
                key={`${stat.label}-${stat.value}`}
              >
                <img
                  src={stat.icon}
                  alt=""
                />

                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>

                  {stat.note && (
                    <small>{stat.note}</small>
                  )}
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="mnx-topic-progress-card">
          <img
            src={data.planet}
            alt="Planeta del progreso"
          />

          <div>
            <span>
              Tu progreso en el tema:
            </span>

            <strong>
              Números y Operaciones
            </strong>
          </div>

          <section>
            <div className="mnx-topic-bar">
              <i
                style={{
                  width: "60%",
                }}
              />

              <b>60%</b>
            </div>

            <p>{data.progressText}</p>
          </section>

          <aside>
            <img
              src={data.milestone}
              alt="Siguiente hito"
            />

            <div>
              <span>Siguiente hito</span>
              <strong>80%</strong>
              <small>
                Gran Explorador
              </small>
            </div>
          </aside>
        </article>

        <aside className="mnx-result-actions">
          {data.actions.map((action) => (
            <button
              key={action.action}
              className={
                action.primary
                  ? "mnx-primary-action"
                  : "mnx-secondary-action"
              }
              type="button"
              onClick={() =>
                handleAction(action.action)
              }
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </aside>
      </section>

      <Toast toast={toast} />
    </MathNumbersShell>
  );
}