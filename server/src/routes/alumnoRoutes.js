const express = require("express");
const router = express.Router();

const {
  obtenerPerfilAlumno,
  obtenerProgresoAlumno,
  obtenerEstadisticasAlumno,
  guardarProgresoActividad,
} = require("../controllers/alumnoController");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/perfil",
  verificarToken,
  permitirRoles("estudiante"),
  obtenerPerfilAlumno
);

router.get(
  "/progreso",
  verificarToken,
  permitirRoles("estudiante"),
  obtenerProgresoAlumno
);

router.get(
  "/estadisticas",
  verificarToken,
  permitirRoles("estudiante"),
  obtenerEstadisticasAlumno
);

router.post(
  "/progreso",
  verificarToken,
  permitirRoles("estudiante"),
  guardarProgresoActividad
);

module.exports = router;