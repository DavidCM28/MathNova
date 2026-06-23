import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import SeleccionMundos from "./pages/SeleccionMundos/SeleccionMundos";
import Recompensas from "./pages/Recompensas/Recompensas";
import Estadisticas from "./pages/Estadisticas/Estadisticas";
import ActividadesMathGeometry from "./pages/ActividadesMathGeometry/ActividadesMathGeometry";
import ActividadesMathData from "./pages/ActividadesMathData/ActividadesMathData";

import DashboardDocente from "./pages/DashboardDocente/DashboardDocente";
import MisGruposDocente from "./pages/MisGruposDocente/MisGruposDocente";
import CrearGrupoDocente from "./pages/CrearGrupoDocente/CrearGrupoDocente";
import AdministrarAlumnosDocente from "./pages/AdministrarAlumnosDocente/AdministrarAlumnosDocente";
import ListaAlumnosDocente from "./pages/ListaAlumnosDocente/ListaAlumnosDocente";
import CalificacionesDocente from "./pages/CalificacionesDocente/CalificacionesDocente";
import ActividadesDocente from "./pages/ActividadesDocente/ActividadesDocente";
import RetroalimentacionDocente from "./pages/RetroalimentacionDocente/RetroalimentacionDocente";
import EvaluacionesDocente from "./pages/EvaluacionesDocente/EvaluacionesDocente";
import EstadisticasDocente from "./pages/EstadisticasDocente/EstadisticasDocente";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Alumno */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seleccion-mundos" element={<SeleccionMundos />} />

        <Route
          path="/actividades/geometria"
          element={<ActividadesMathGeometry />}
        />

        <Route
          path="/actividades-math-data"
          element={<ActividadesMathData />}
        />

        <Route path="/retroalimentacion" element={<Feedback />} />
        <Route path="/recompensas" element={<Recompensas />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/perfil-alumno" element={<PerfilAlumno />} />

        {/* Docente */}
        <Route path="/docente" element={<DashboardDocente />} />
        <Route path="/dashboard-docente" element={<DashboardDocente />} />

        <Route path="/mis-grupos-docente" element={<MisGruposDocente />} />
        <Route path="/crear-grupo-docente" element={<CrearGrupoDocente />} />

        <Route
          path="/administrar-alumnos-docente"
          element={<AdministrarAlumnosDocente />}
        />

        <Route
          path="/lista-alumnos-docente"
          element={<ListaAlumnosDocente />}
        />

        <Route
          path="/calificaciones-docente"
          element={<CalificacionesDocente />}
        />

        <Route path="/actividades-docente" element={<ActividadesDocente />} />

        <Route
          path="/retroalimentacion-docente"
          element={<RetroalimentacionDocente />}
        />

        <Route path="/evaluaciones-docente" element={<EvaluacionesDocente />} />

        <Route path="/estadisticas-docente" element={<EstadisticasDocente />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
