const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token no enviado",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido",
    });
  }
};

const permitirRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para esta acción",
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  permitirRoles,
};