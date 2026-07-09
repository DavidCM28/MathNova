import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap } from "react-icons/fi";
import { activityListRoute } from "../constants";
import { MathNumbersShell } from "../components/MathNumbersShell";
import { QuestionCard } from "../components/QuestionCard";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { cofreChest, cofreGuide, cofreHero } from "../mathNumbersAssets";
import { getSessionUser } from "../../../utils/authSession";
import {
  guardarProgresoActividad,
  obtenerProgresoActividad
} from "../../../services/progresoService";

type SessionUser = {
  id_usuario?: number | string;
  id?: number | string;
  usuario_id?: number | string;
  id_alumno?: number | string;
};

const ACTIVIDAD_CODIGO = "mathnumbers-cofre-bienvenida";

export function CofreBienvenida() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [estrellasGanadas, setEstrellasGanadas] = useState(0);

  const correctAnswers: Record<string, string> = {
    "1": "0.5",
    "2": "1/4"
  };

  const progress = Object.keys(answers).length;

  const obtenerIdUsuario = () => {
    const usuario = getSessionUser() as SessionUser | null;

    return (
      usuario?.id_usuario ||
      usuario?.id ||
      usuario?.usuario_id ||
      usuario?.id_alumno ||
      null
    );
  };

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const idUsuario = obtenerIdUsuario();

        if (!idUsuario) return;

        const data = await obtenerProgresoActividad(
          idUsuario,
          ACTIVIDAD_CODIGO
        );

        if (!data.progreso) return;

        setEstrellasGanadas(data.progreso.estrellas_obtenidas || 0);

        const respuestas =
          typeof data.progreso.respuestas === "string"
            ? JSON.parse(data.progreso.respuestas)
            : data.progreso.respuestas;

        const respuestasGuardadas: Record<string, string> = {
          "1":
            respuestas?.pregunta_1?.respuesta_usuario ||
            respuestas?.["1"] ||
            "",
          "2":
            respuestas?.pregunta_2?.respuesta_usuario ||
            respuestas?.["2"] ||
            ""
        };

        setAnswers({
          "1": respuestasGuardadas["1"] || correctAnswers["1"],
          "2": respuestasGuardadas["2"] || correctAnswers["2"]
        });

        if (data.progreso.completada) {
          setChecked(true);
          setActividadCompletada(true);
        }
      } catch (error) {
        console.error("Error al cargar progreso del cofre:", error);
      }
    };

    cargarProgreso();
  }, []);

  const selectAnswer = (question: string, value: string) => {
    setAnswers((current) => ({ ...current, [question]: value }));
    setChecked(false);
    setActividadCompletada(false);
  };

  const answerClass = (question: string, value: string) => {
    const selected = answers[question] === value;
    const correct = correctAnswers[question] === value;

    if (!selected) return "";
    if (!checked) return "mnx-selected";

    return correct ? "mnx-correct" : "mnx-wrong";
  };

  const guardarIntento = async (total: number) => {
    const idUsuario = obtenerIdUsuario();

    if (!idUsuario) {
      return null;
    }

    const data = await guardarProgresoActividad({
      id_usuario: idUsuario,
      mundo: "MathNumbers",
      tema: "Fracciones y decimales",
      actividad_codigo: ACTIVIDAD_CODIGO,
      actividad_titulo: "El Cofre de Bienvenida",
      respuestas: {
        pregunta_1: {
          respuesta_usuario: answers["1"],
          respuesta_correcta: correctAnswers["1"],
          correcta: answers["1"] === correctAnswers["1"]
        },
        pregunta_2: {
          respuesta_usuario: answers["2"],
          respuesta_correcta: correctAnswers["2"],
          correcta: answers["2"] === correctAnswers["2"]
        }
      },
      aciertos: total,
      total_preguntas: 2,
      tiempo_segundos: 0,
      xp_base: 50
    });

    return data.progreso;
  };

  const comprobar = async () => {
    if (progress !== 2) {
      showToast("Responde ambas preguntas para abrir el cofre.", true);
      return;
    }

    const total = Object.entries(correctAnswers).filter(
      ([question, value]) => answers[question] === value
    ).length;

    setChecked(true);
    setGuardando(true);

    try {
      const progresoGuardado = await guardarIntento(total);

      if (progresoGuardado) {
        setEstrellasGanadas(progresoGuardado.estrellas_obtenidas || 0);
        setActividadCompletada(Boolean(progresoGuardado.completada));
      }
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      showToast("La respuesta se revisó, pero no se pudo guardar el progreso.", true);
    } finally {
      setGuardando(false);
    }

    if (total === 2) {
      showToast("¡Excelente! Cofre desbloqueado.");
      window.setTimeout(
        () => navigate("/actividades/mathnumbers/actividad-completada"),
        700
      );
      return;
    }

    showToast("Revisa las respuestas e inténtalo de nuevo.", true);

    window.setTimeout(
      () =>
        navigate(
          total === 1
            ? "/actividades/mathnumbers/casi-lo-logras"
            : "/actividades/mathnumbers/vuelve-a-intentarlo"
        ),
      900
    );
  };

  return (
    <MathNumbersShell
      crumb="MathNumbers / Tema 1: Fracciones y decimales"
      title="1. El Cofre de Bienvenida"
      subtitle="Convierte fracciones y decimales para desbloquear el cofre de suministros."
      progress={`${progress}/2`}
      progressValue={progress * 50}
      heroImage={cofreHero}
      heroAlt="Robot matemático de MathNumbers"
      rewardTitle="Recompensa"
      rewardText={
        actividadCompletada
          ? `Cofre desbloqueado · ${estrellasGanadas} estrellas`
          : "Cofre desbloqueado"
      }
    >
      <div className="mnx-two-column mnx-cofre-grid">
        <article className="mnx-mission-card">
          <h2>✦ MISIÓN: ABRE EL COFRE ✦</h2>
          <img src={cofreChest} alt="Cofre de la misión" />

          <section className="mnx-info-card">
            <h3>ⓘ Instrucciones de la misión</h3>
            <p>
              Responde correctamente las 2 preguntas para iluminar el panel
              holográfico y abrir el cofre.
            </p>

            {actividadCompletada && (
              <p>
                ✅ Actividad completada. Estrellas ganadas:{" "}
                <strong>{estrellasGanadas}/3</strong>
              </p>
            )}
          </section>
        </article>

        <section className="mnx-question-stack">
          <article className="mnx-guide-card">
            <img src={cofreGuide} alt="Robot guía" />
            <div>
              <h2>¡Vamos, explorador!</h2>
              <p>Cada respuesta correcta desbloquea una parte del cofre.</p>
            </div>
          </article>

          <QuestionCard
            number="1"
            text={
              <>
                <p>
                  La batería está cargada a{" "}
                  <span className="mnx-fraction">
                    <sup>1</sup>
                    <i />
                    <sub>2</sub>
                  </span>
                  .
                </p>
                <p>¿Cuál es su equivalente decimal?</p>
              </>
            }
            options={[
              ["0.2", "a) 0.2"],
              ["0.5", "b) 0.5"],
              ["1.5", "c) 1.5"],
              ["2.0", "d) 2.0"]
            ]}
            answerClass={(value) => answerClass("1", value)}
            onSelect={(value) => selectAnswer("1", value)}
          />

          <QuestionCard
            number="2"
            text={
              <>
                <p>El sistema muestra 0.25 de energía.</p>
                <p>¿Cuál es la fracción equivalente?</p>
              </>
            }
            options={[
              ["1/2", "a) 1/2"],
              ["1/4", "b) 1/4"],
              ["2/5", "c) 2/5"],
              ["4/1", "d) 4/1"]
            ]}
            answerClass={(value) => answerClass("2", value)}
            onSelect={(value) => selectAnswer("2", value)}
          />
        </section>
      </div>

      <section className="mnx-bottom-panel">
        <article className="mnx-hint-card">
          <FiZap />
          <div>
            <h2>Pista</h2>
            <p>
              Si te atoras, piensa en cómo se divide la unidad en partes
              iguales.
            </p>
            <div className="mnx-mini-line">
              <span>0</span>
              <i />
              <span>½</span>
              <i />
              <span>1</span>
            </div>
          </div>
        </article>

        <div className="mnx-actions-card">
          <button
            className="mnx-secondary-action"
            type="button"
            onClick={() => navigate(activityListRoute)}
          >
            ← Volver
          </button>

          <button
            className="mnx-primary-action"
            type="button"
            onClick={comprobar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "✓ Comprobar respuestas"}
          </button>

          <p>
            {actividadCompletada
              ? `Actividad completada con ${estrellasGanadas}/3 estrellas.`
              : "♙ Responde ambas preguntas para abrir el cofre."}
          </p>
        </div>
      </section>

      <Toast toast={toast} />
    </MathNumbersShell>
  );
}