const express = require("express");

const {
  obtenerPerfilAlumno,
  obtenerEstadisticasAlumno,
  guardarProgresoAlumno
} = require("../controllers/alumnoController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/perfil",
  verificarToken,
  obtenerPerfilAlumno
);

router.get(
  "/estadisticas",
  verificarToken,
  obtenerEstadisticasAlumno
);

router.post(
  "/progreso",
  verificarToken,
  guardarProgresoAlumno
);

module.exports = router;