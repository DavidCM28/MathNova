const express = require("express");

const {
  guardarProgresoActividad,
  obtenerProgresoAlumno,
  obtenerResumenAlumno,
  obtenerProgresoActividad
} = require("../controllers/progresoController");

const router = express.Router();

router.post("/actividad", guardarProgresoActividad);

router.get("/alumno/:id_usuario", obtenerProgresoAlumno);

router.get("/resumen/:id_usuario", obtenerResumenAlumno);

router.get(
  "/actividad/:id_usuario/:actividad_codigo",
  obtenerProgresoActividad
);

module.exports = router;