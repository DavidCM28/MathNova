const jwt = require("jsonwebtoken");
const pool = require("../db");

const normalizarRol = (rol) => {
  const valor = String(rol || "").toLowerCase().trim();

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  return "estudiante";
};

const obtenerJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en el .env");
  }

  return String(secret).trim();
};

const obtenerToken = (req) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.replace("Bearer ", "").trim();
};

const verificarToken = async (req, res, next) => {
  try {
    const token = obtenerToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token no enviado",
      });
    }

    const decoded = jwt.verify(token, obtenerJwtSecret());

    const usuarioId =
      decoded.id_usuario ||
      decoded.usuario_id ||
      decoded.userId ||
      decoded.id ||
      decoded.idUsuario;

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token inválido: no contiene ID de usuario",
      });
    }

    const result = await pool.query(
      `SELECT 
          id_usuario, 
          nombre_completo, 
          correo, 
          usuario, 
          rol, 
          estado
       FROM public.registro
       WHERE id_usuario = $1
       LIMIT 1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    const usuario = result.rows[0];

    if (usuario.estado === false) {
      return res.status(403).json({
        ok: false,
        mensaje: "Usuario inactivo",
      });
    }

    const usuarioAutenticado = {
      id_usuario: usuario.id_usuario,
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      usuario: usuario.usuario,
      rol: normalizarRol(usuario.rol),
      estado: usuario.estado,
    };

    req.usuario = usuarioAutenticado;
    req.user = usuarioAutenticado;

    return next();
  } catch (error) {
    console.error("Error verificando JWT:", error.name, error.message);

    return res.status(401).json({
      ok: false,
      mensaje: "Sesión inválida o expirada",
    });
  }
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = normalizarRol(req.usuario?.rol || req.user?.rol);
    const roles = rolesPermitidos.map(normalizarRol);

    if (!roles.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para esta acción",
      });
    }

    return next();
  };
};

module.exports = {
  verificarToken,
  permitirRoles,
  normalizarRol,
};