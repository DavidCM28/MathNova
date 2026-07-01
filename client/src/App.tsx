import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import SeleccionMundos from "./pages/SeleccionMundos/SeleccionMundos";
import Recompensas from "./pages/Recompensas/Recompensas";
import Estadisticas from "./pages/Estadisticas/Estadisticas";

import ActividadesMathGeometry from "./pages/ActividadesMathGeometry/ActividadesMathGeometry";
import Actividad1MathGeometry from "./pages/ActividadesMathGeometry/Actividad1MathGeometry";

import ActividadesMathData from "./pages/ActividadesMathData/ActividadesMathData";
import GeneradorEnergiaInversa from "./pages/ActividadesMathData/GeneradorEnergiaInversa";
import ActividadesMathNumbers from "./pages/ActividadesMathNumbers/ActividadesMathNumbers";

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

import DashboardAdmin from "./pages/Admin/Dashboard/DashboardAdmin";
import GroupsAdmin from "./pages/Admin/Groups/GroupsAdmin";
import ActivitiesAdmin from "./pages/Admin/Activities/ActivitiesAdmin";
import ResourcesAdmin from "./pages/Admin/Resources/ResourcesAdmin";
import ReportsAdmin from "./pages/Admin/Reports/ReportsAdmin";
import RequestsAdmin from "./pages/Admin/Requests/RequestsAdmin";
import SettingsAdmin from "./pages/Admin/Settings/SettingsAdmin";

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
          path="/actividades/geometria/actividad-1"
          element={<Actividad1MathGeometry />}
        />

        <Route
          path="/actividades-math-data"
          element={<ActividadesMathData />}
        />

        <Route
          path="/actividades-math-data/generador-energia"
          element={<GeneradorEnergiaInversa />}
        />

        <Route
          path="/actividades-math-numbers"
          element={<ActividadesMathNumbers />}
        />

        <Route path="/temas/numeros" element={<ActividadesMathNumbers />} />

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

        {/* Admin */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-administrador" element={<DashboardAdmin />} />

        <Route path="/admin/grupos" element={<GroupsAdmin />} />
        <Route path="/admin/actividades" element={<ActivitiesAdmin />} />
        <Route path="/admin/recursos" element={<ResourcesAdmin />} />
        <Route path="/admin/reportes" element={<ReportsAdmin />} />
        <Route path="/admin/solicitudes" element={<RequestsAdmin />} />
        <Route path="/admin/configuracion" element={<SettingsAdmin />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
