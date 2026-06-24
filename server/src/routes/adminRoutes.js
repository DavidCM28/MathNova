const express = require("express");
const router = express.Router();

const {
  obtenerDashboardAdmin,
  obtenerUsuariosAdmin,
  crearUsuarioAdmin,
} = require("../controllers/adminController");

router.get("/dashboard", obtenerDashboardAdmin);
router.get("/usuarios", obtenerUsuariosAdmin);
router.post("/usuarios", crearUsuarioAdmin);

module.exports = router;

