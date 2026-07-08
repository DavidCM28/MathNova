import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

const rolesAlumno = ["estudiante", "docente_estudiante"];
const rolesDocente = ["docente", "docente_estudiante"];
const rolesAdmin = ["admin"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/seleccion-mundos"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <SeleccionMundos />
            </RequireAuth>
          }
        />

        <Route
          path="/perfil-alumno"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <PerfilAlumno />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <Estadisticas />
            </RequireAuth>
          }
        />

        <Route
          path="/retroalimentacion"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <Feedback />
            </RequireAuth>
          }
        />

        <Route
          path="/recompensas"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <Recompensas />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <ActividadesMathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-1"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <Actividad1MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-2"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <Actividad2MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <ActividadesMathData />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data/generador-energia"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <GeneradorEnergiaInversa />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-numbers"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <ActividadesMathNumbers />
            </RequireAuth>
          }
        />

        <Route
          path="/temas/numeros"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno} permitirInvitado>
              <ActividadesMathNumbers />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/mathnumbers/:activitySlug"
          element={
            <RequireAuth rolesPermitidos={rolesAlumno}>
              <MathNumbersActivityRouter />
            </RequireAuth>
          }
        />

        <Route
          path="/docente"
          element={<Navigate to="/dashboard-docente" replace />}
        />

        <Route
          path="/dashboard-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <DashboardDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/mis-grupos-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <MisGruposDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/crear-grupo-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <CrearGrupoDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/administrar-alumnos-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <AdministrarAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/lista-alumnos-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <ListaAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/calificaciones-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <CalificacionesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <ActividadesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/retroalimentacion-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <RetroalimentacionDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/evaluaciones-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <EvaluacionesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas-docente"
          element={
            <RequireAuth rolesPermitidos={rolesDocente}>
              <EstadisticasDocente />
            </RequireAuth>
          }
        />

        <Route path="/admin" element={<Navigate to="/dashboard-admin" replace />} />

        <Route
          path="/dashboard-admin"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <DashboardAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard-administrador"
          element={<Navigate to="/dashboard-admin" replace />}
        />

        <Route
          path="/admin/grupos"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <GroupsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/actividades"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <ActivitiesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/recursos"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <ResourcesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <ReportsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/solicitudes"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
              <RequestsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/configuracion"
          element={
            <RequireAuth rolesPermitidos={rolesAdmin}>
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