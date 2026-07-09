import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import StartupRedirect from "./routes/StartupRedirect";
import RequireAuth from "./routes/RequireAuth";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import SeleccionMundos from "./pages/SeleccionMundos/SeleccionMundos";
import Recompensas from "./pages/Recompensas/Recompensas";
import Estadisticas from "./pages/Estadisticas/Estadisticas";

import ActividadesMathGeometry from "./pages/ActividadesMathGeometry/ActividadesMathGeometry";
import Actividad1MathGeometry from "./pages/ActividadesMathGeometry/Actividad1MathGeometry";
import Actividad2MathGeometry from "./pages/ActividadesMathGeometry/Actividad2MathGeometry";

import ActividadesMathData from "./pages/ActividadesMathData/ActividadesMathData";
import GeneradorEnergiaInversa from "./pages/ActividadesMathData/GeneradorEnergiaInversa";
import RampasDeLanzamiento from "./pages/ActividadesMathData/RampasDeLanzamiento";
import ActividadesMathNumbers from "./pages/ActividadesMathNumbers/ActividadesMathNumbers";
import MathNumbersActivityRouter from "./pages/MathNumbersActivities/MathNumbersActivityRouter";

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
      <StartupRedirect />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

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

        <Route
          path="/actividades-math-numbers"
          element={<ActividadesMathNumbers />}
        />

        <Route path="/temas/numeros" element={<ActividadesMathNumbers />}
        
        />

        <Route
          path="/actividades/mathnumbers/:activitySlug"
          element={<MathNumbersActivityRouter />}
        />

        <Route
          path="/actividades/geometria/actividad-1"
          element={
            <RequireAuth>
              <Actividad1MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-2"
          element={
            <RequireAuth>
              <Actividad2MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data/generador-energia"
          element={
            <RequireAuth>
              <GeneradorEnergiaInversa />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data/rampas-lanzamiento"
          element={
            <RequireAuth>
              <RampasDeLanzamiento />
            </RequireAuth>
          }
        />
        <Route
          path="/retroalimentacion"
          element={
            <RequireAuth>
              <Feedback />
            </RequireAuth>
          }
        />

        <Route
          path="/recompensas"
          element={
            <RequireAuth>
              <Recompensas />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas"
          element={
            <RequireAuth>
              <Estadisticas />
            </RequireAuth>
          }
        />

        <Route
          path="/perfil-alumno"
          element={
            <RequireAuth>
              <PerfilAlumno />
            </RequireAuth>
          }
        />

        <Route
          path="/docente"
          element={
            <RequireAuth>
              <DashboardDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard-docente"
          element={
            <RequireAuth>
              <DashboardDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/mis-grupos-docente"
          element={
            <RequireAuth>
              <MisGruposDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/crear-grupo-docente"
          element={
            <RequireAuth>
              <CrearGrupoDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/administrar-alumnos-docente"
          element={
            <RequireAuth>
              <AdministrarAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/lista-alumnos-docente"
          element={
            <RequireAuth>
              <ListaAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/calificaciones-docente"
          element={
            <RequireAuth>
              <CalificacionesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-docente"
          element={
            <RequireAuth>
              <ActividadesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/retroalimentacion-docente"
          element={
            <RequireAuth>
              <RetroalimentacionDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/evaluaciones-docente"
          element={
            <RequireAuth>
              <EvaluacionesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas-docente"
          element={
            <RequireAuth>
              <EstadisticasDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <DashboardAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard-admin"
          element={
            <RequireAuth>
              <DashboardAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard-administrador"
          element={
            <RequireAuth>
              <DashboardAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/grupos"
          element={
            <RequireAuth>
              <GroupsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/actividades"
          element={
            <RequireAuth>
              <ActivitiesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/recursos"
          element={
            <RequireAuth>
              <ResourcesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <RequireAuth>
              <ReportsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/solicitudes"
          element={
            <RequireAuth>
              <RequestsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/configuracion"
          element={
            <RequireAuth>
              <SettingsAdmin />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;