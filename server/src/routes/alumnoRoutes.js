const express = require("express");
const router = express.Router();

const {
  obtenerPerfilAlumno,
  actualizarProgresoAlumno,
} = require("../controllers/alumnoController");

router.get("/perfil/:id_usuario", obtenerPerfilAlumno);
router.patch("/progreso/:id_usuario", actualizarProgresoAlumno);

module.exports = router;