import { Navigate, useParams } from "react-router-dom";
import AscensorBunker from "./AscensorBunker";
import CofreBienvenida from "./CofreBienvenida";
import MathNumbersResultScreen from "./MathNumbersResultScreen";
import RadarSupervivencia from "./RadarSupervivencia";
import { isMathNumbersResultSlug } from "./mathNumbersData";
import "./MathNumbersActivities.css";

function MathNumbersActivityRouter() {
  const { activitySlug = "" } = useParams();

  if (activitySlug === "cofre-bienvenida") return <CofreBienvenida />;
  if (activitySlug === "radar-supervivencia") return <RadarSupervivencia />;
  if (activitySlug === "ascensor-bunker") return <AscensorBunker />;
  if (isMathNumbersResultSlug(activitySlug)) return <MathNumbersResultScreen result={activitySlug} />;

  return <Navigate to="/actividades-math-numbers" replace />;
}

export default MathNumbersActivityRouter;
