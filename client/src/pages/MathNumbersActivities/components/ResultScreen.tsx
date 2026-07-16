import "./ResultScreen.css";

import { useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiZap } from "react-icons/fi";
import { activityListRoute } from "../constants";
import { resultData } from "../data/resultData";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";
import { MathNumbersShell } from "./MathNumbersShell";
import {
  hintShield,
  hintTipClock,
} from "../mathNumbersAssets";
import type { ResultKind } from "../types";

type ResultNavigationState = {
  activity?: string;
  nextRoute?: string;
  retryRoute?: string;
};

export function ResultScreen({
  kind,
}: {
  kind: ResultKind;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { toast, showToast } = useToast();
  const data = resultData[kind];

  const navigationState =
    location.state as ResultNavigationState | null;

  const nextRoute =
    navigationState?.nextRoute ??
    "/actividades/mathnumbers/radar-supervivencia";

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
    navigate(
      "/actividades/mathnumbers/aqui-tienes-una-pista",
      {
        state: {
          activity: navigationState?.activity,
          retryRoute,
          nextRoute,
        },
      },
    );
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
      messages[action] ?? "Acción seleccionada",
    );

    window.setTimeout(() => {
      if (action === "home") {
        goHome();
        return;
      }

      if (
        action === "retry" ||
        action === "repeat"
      ) {
        retry();
        return;
      }

      if (action === "hint") {
        hint();
        return;
      }

      if (action === "next") {
        next();
        return;
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
      <section className="result-screen">
        <div className="result-screen__content">
          <article className="result-message">
            <span
              className="result-message__badge"
              aria-hidden="true"
            >
              ★
            </span>

            <div className="result-message__copy">
              <h2>{data.messageTitle}</h2>
              <p>{data.message}</p>
            </div>
          </article>

          {kind === "hint" && (
            <article className="result-hint">
              <header className="result-hint__header">
                <span className="result-hint__header-icon">
                  <FiZap />
                </span>

                <h2>Pista para resolver</h2>
              </header>

              <div className="result-hint__body">
                <div className="result-hint__shield">
                  <img
                    src={hintShield}
                    alt="Escudo de pista"
                  />
                </div>

                <span
                  className="result-hint__arrow"
                  aria-hidden="true"
                >
                  →
                </span>

                <div className="result-hint__advice">
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

                <aside className="result-hint__quick-tip">
                  <img
                    src={hintTipClock}
                    alt="Tip rápido"
                  />

                  <div>
                    <strong>Tip rápido</strong>
                    <span>
                      Lee, piensa y responde.
                    </span>
                  </div>
                </aside>
              </div>
            </article>
          )}

          <article className="result-summary">
            <header className="result-card-title">
              <span className="result-card-title__icon">
                <FiBarChart2 />
              </span>

              <h2>Resumen de la actividad</h2>
            </header>

            <div className="result-stats">
              {data.stats.map((stat) => (
                <article
                  className="result-stat"
                  key={`${stat.label}-${stat.value}`}
                >
                  <div className="result-stat__icon">
                    <img
                      src={stat.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>

                  <div className="result-stat__content">
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

          <article className="result-progress">
            <div className="result-progress__planet">
              <img
                src={data.planet}
                alt="Planeta del progreso"
              />
            </div>

            <div className="result-progress__topic">
              <span>Tu progreso en el tema:</span>
              <strong>
                Números y Operaciones
              </strong>
            </div>

            <section className="result-progress__status">
              <div className="result-progress__bar">
                <div
                  className="result-progress__fill"
                  style={{ width: "60%" }}
                />

                <b>60%</b>
              </div>

              <p>{data.progressText}</p>
            </section>

            <aside className="result-progress__milestone">
              <img
                src={data.milestone}
                alt="Siguiente hito"
              />

              <div>
                <span>Siguiente hito</span>
                <strong>80%</strong>
                <small>Gran Explorador</small>
              </div>
            </aside>
          </article>
        </div>

        <aside className="result-actions">
          {data.actions.map((action) => (
            <button
              key={action.action}
              className={
                action.primary
                  ? "result-action result-action--primary"
                  : "result-action result-action--secondary"
              }
              type="button"
              onClick={() =>
                handleAction(action.action)
              }
            >
              <span className="result-action__icon">
                {action.icon}
              </span>

              <span>{action.label}</span>
            </button>
          ))}
        </aside>
      </section>

      <Toast toast={toast} />
    </MathNumbersShell>
  );
}