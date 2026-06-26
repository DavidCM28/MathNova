const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Debes iniciar sesión.",
    });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      mensaje: "La sesión expiró o no es válida.",
    });
  }
}

module.exports = verificarToken;