import { Navigate, useParams } from "react-router-dom";
import "./MathNumbersActivityRouter.css";

import { CofreBienvenida } from "./activities/CofreBienvenida";
import { RadarSupervivencia } from "./activities/RadarSupervivencia";
import { AscensorBunker } from "./activities/AscensorBunker";
import { EscuadronTactico } from "./activities/EscuadronTactico";
import { EspejosBoveda } from "./activities/EspejosBoveda";
import { PuentePrioridades } from "./activities/PuentePrioridades";
import { EnigmaVariables } from "./activities/EnigmaVariables";
import { SimuladorCodigos } from "./activities/SimuladorCodigos";

import { ResultScreen } from "./components/ResultScreen";

function MathNumbersActivityRouter() {
  const { activitySlug } = useParams();

  if (activitySlug === "cofre-bienvenida") {
    return <CofreBienvenida />;
  }

  if (activitySlug === "radar-supervivencia") {
    return <RadarSupervivencia />;
  }

  if (activitySlug === "ascensor-bunker") {
    return <AscensorBunker />;
  }

  if (activitySlug === "escuadron-tactico") {
    return <EscuadronTactico />;
  }

  if (activitySlug === "espejos-boveda") {
    return <EspejosBoveda />;
  }

  if (activitySlug === "puente-prioridades") {
    return <PuentePrioridades />;
  }

  if (activitySlug === "enigma-variables") {
    return <EnigmaVariables />;
  }

  if (activitySlug === "simulador-codigos") {
    return <SimuladorCodigos />;
  }

  if (activitySlug === "actividad-completada") {
    return <ResultScreen kind="completed" />;
  }

  if (activitySlug === "casi-lo-logras") {
    return <ResultScreen kind="almost" />;
  }

  if (activitySlug === "vuelve-a-intentarlo") {
    return <ResultScreen kind="retry" />;
  }

  if (activitySlug === "aqui-tienes-una-pista") {
    return <ResultScreen kind="hint" />;
  }

  return (
    <Navigate
      to="/actividades/mathnumbers/cofre-bienvenida"
      replace
    />
  );
}

export default MathNumbersActivityRouter;
