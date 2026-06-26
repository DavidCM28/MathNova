const express = require("express");
const router = express.Router();

const {
  obtenerDashboardAdmin,
  obtenerUsuariosAdmin,
  crearUsuarioAdmin,
} = require("../controllers/adminController");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/dashboard",
  verificarToken,
  permitirRoles("admin"),
  obtenerDashboardAdmin
);

router.get(
  "/usuarios",
  verificarToken,
  permitirRoles("admin"),
  obtenerUsuariosAdmin
);

router.post(
  "/usuarios",
  verificarToken,
  permitirRoles("admin"),
  crearUsuarioAdmin
);

module.exports = router;