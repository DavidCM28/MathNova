import { Navigate, useParams } from "react-router-dom";
import "./MathNumbersActivityRouter.css";
import { CofreBienvenida } from "./activities/CofreBienvenida";
import { RadarSupervivencia } from "./activities/RadarSupervivencia";
import { AscensorBunker } from "./activities/AscensorBunker";
import { ResultScreen } from "./components/ResultScreen";

function MathNumbersActivityRouter() {
  const { activitySlug } = useParams();

  if (activitySlug === "cofre-bienvenida") return <CofreBienvenida />;
  if (activitySlug === "radar-supervivencia") return <RadarSupervivencia />;
  if (activitySlug === "ascensor-bunker") return <AscensorBunker />;
  if (activitySlug === "actividad-completada") return <ResultScreen kind="completed" />;
  if (activitySlug === "casi-lo-logras") return <ResultScreen kind="almost" />;
  if (activitySlug === "vuelve-a-intentarlo") return <ResultScreen kind="retry" />;
  if (activitySlug === "aqui-tienes-una-pista") return <ResultScreen kind="hint" />;

  return <Navigate to="/actividades/mathnumbers/cofre-bienvenida" replace />;
}

export default MathNumbersActivityRouter;
