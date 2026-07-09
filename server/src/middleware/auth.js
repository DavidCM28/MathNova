const {
  verificarToken,
  permitirRoles,
  normalizarRol
} = require("../middlewares/authMiddleware");

verificarToken.verificarToken = verificarToken;
verificarToken.permitirRoles = permitirRoles;
verificarToken.normalizarRol = normalizarRol;

module.exports = verificarToken;