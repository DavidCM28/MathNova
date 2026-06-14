import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import SeleccionMundos from "./pages/SeleccionMundos/SeleccionMundos";
import Recompensas from "./pages/Recompensas/Recompensas";
import Estadisticas from "./pages/Estadisticas/Estadisticas";

import {
  NumbersWorld,
  GeometryWorld,
  DataWorld,
} from "./pages/LearningWorlds/LearningWorlds";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard principal */}
        <Route path="/" element={<Dashboard />} />

        {/* Selección de mundos */}
        <Route path="/seleccion-mundos" element={<SeleccionMundos />} />

        {/* Temas */}
        <Route
          path="/temas"
          element={<Navigate to="/temas/numeros" replace />}
        />

        <Route path="/temas/numeros" element={<NumbersWorld />} />
        <Route path="/temas/geometria" element={<GeometryWorld />} />
        <Route path="/temas/estadistica" element={<DataWorld />} />

        {/* Retroalimentación */}
        <Route path="/retroalimentacion" element={<Feedback />} />

        {/* Recompensas */}
        <Route path="/recompensas" element={<Recompensas />} />

        {/* Estadísticas */}
        <Route path="/estadisticas" element={<Estadisticas />} />

        {/* Perfil Alumno */}
        <Route path="/perfil-alumno" element={<PerfilAlumno />} />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
