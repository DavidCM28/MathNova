import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Perfil Alumno */}
        <Route path="/perfil-alumno" element={<PerfilAlumno />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
