import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import {
  DataWorld,
  GeometryWorld,
  NumbersWorld,
} from "./pages/LearningWorlds/LearningWorlds";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Pantallas MathNova recreadas */}
        <Route path="/retroalimentacion" element={<Feedback />} />
        <Route path="/temas" element={<Navigate to="/temas/numeros" replace />} />
        <Route path="/temas/numeros" element={<NumbersWorld />} />
        <Route path="/temas/geometria" element={<GeometryWorld />} />
        <Route path="/estadisticas" element={<DataWorld />} />

        {/* Perfil Alumno */}
        <Route path="/perfil-alumno" element={<PerfilAlumno />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
