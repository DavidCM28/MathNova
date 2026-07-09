const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const normalizarRol = (rol) => {
  const valor = String(rol || "").toLowerCase().trim();

  if (
    [
      "docente_estudiante",
      "docente-alumno",
      "docente_alumno",
      "maestro_estudiante",
      "mixto",
    ].includes(valor)
  ) {
    return "docente_estudiante";
  }

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

router.post("/register", async (req, res) => {
  try {
    const {
      nombre_completo,
      nombreCompleto,
      correo,
      email,
      usuario,
      password,
      contrasena,
      confirmar_password,
      confirmarPassword,
      acepto_terminos,
    } = req.body;

    const nombreFinal = String(nombre_completo || nombreCompleto || "").trim();
    const correoLimpio = String(correo || email || "").trim().toLowerCase();
    const passwordFinal = String(password || contrasena || "");
    const confirmarFinal = String(confirmar_password || confirmarPassword || "");

    const usuarioLimpio =
      typeof usuario === "string" && usuario.trim() !== ""
        ? usuario.trim().toLowerCase()
        : null;

    if (!nombreFinal || !correoLimpio || !passwordFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, correo y contraseña son obligatorios.",
      });
    }

    if (!correoLimpio.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingresa un correo válido.",
      });
    }

    if (confirmarFinal && passwordFinal !== confirmarFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Las contraseñas no coinciden.",
      });
    }

    if (passwordFinal.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener mínimo 6 caracteres.",
      });
    }

    let usuarioExiste;

    if (usuarioLimpio) {
      usuarioExiste = await pool.query(
        `SELECT id_usuario, nombre_completo, correo, usuario, rol, estado
         FROM public.registro
         WHERE LOWER(TRIM(correo)) = $1
            OR LOWER(TRIM(COALESCE(usuario, ''))) = $2
         LIMIT 1`,
        [correoLimpio, usuarioLimpio]
      );
    } else {
      usuarioExiste = await pool.query(
        `SELECT id_usuario, nombre_completo, correo, usuario, rol, estado
         FROM public.registro
         WHERE LOWER(TRIM(correo)) = $1
         LIMIT 1`,
        [correoLimpio]
      );
    }

    if (usuarioExiste.rows.length > 0) {
      const duplicado = usuarioExiste.rows[0];

      const esCorreoDuplicado =
        String(duplicado.correo || "").trim().toLowerCase() === correoLimpio;

      return res.status(409).json({
        ok: false,
        mensaje: esCorreoDuplicado
          ? "El correo ya está registrado."
          : "El usuario ya está registrado.",
        duplicado,
      });
    }

    const passwordHash = await bcrypt.hash(passwordFinal, 10);

    const nuevoUsuario = await pool.query(
      `INSERT INTO public.registro
        (nombre_completo, correo, usuario, password_hash, rol, estado, acepto_terminos)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro`,
      [
        nombreFinal,
        correoLimpio,
        usuarioLimpio,
        passwordHash,
        "estudiante",
        true,
        acepto_terminos ?? true,
      ]
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Usuario registrado correctamente.",
      usuario: {
        ...nuevoUsuario.rows[0],
        rol: normalizarRol(nuevoUsuario.rows[0].rol),
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        mensaje: "El correo o usuario ya está registrado.",
        detalle: error.detail,
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "Error interno en el servidor.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { correo, email, usuario, correoUsuario, password, contrasena } =
      req.body;

    const identificador = String(
      correo || email || usuario || correoUsuario || ""
    )
      .trim()
      .toLowerCase();

    const passwordFinal = String(password || contrasena || "");

    if (!identificador || !passwordFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Correo/usuario y contraseña son obligatorios.",
      });
    }

    const usuarioEncontrado = await pool.query(
      `SELECT
          id_usuario,
          nombre_completo,
          correo,
          usuario,
          password_hash,
          rol,
          estado
       FROM public.registro
       WHERE LOWER(TRIM(correo)) = $1
          OR LOWER(TRIM(COALESCE(usuario, ''))) = $1
       LIMIT 1`,
      [identificador]
    );

    if (usuarioEncontrado.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales incorrectas.",
      });
    }

    const usuarioDB = usuarioEncontrado.rows[0];

    if (usuarioDB.estado === false) {
      return res.status(403).json({
        ok: false,
        mensaje: "La cuenta está desactivada.",
      });
    }

    const passwordCorrecto = await bcrypt.compare(
      passwordFinal,
      usuarioDB.password_hash
    );

    if (!passwordCorrecto) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales incorrectas.",
      });
    }

    try {
      await pool.query(
        `INSERT INTO public.login
          (id_usuario, correo, ip, user_agent, exito)
         VALUES
          ($1, $2, $3, $4, $5)`,
        [
          usuarioDB.id_usuario,
          usuarioDB.correo,
          req.ip,
          req.headers["user-agent"],
          true,
        ]
      );
    } catch (logError) {
      console.warn("No se pudo guardar historial de login:", logError.message);
    }

    const rol = normalizarRol(usuarioDB.rol);

    const token = jwt.sign(
      {
        id_usuario: usuarioDB.id_usuario,
        correo: usuarioDB.correo,
        rol,
      },
      obtenerJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    console.log("LOGIN OK:", {
      id_usuario: usuarioDB.id_usuario,
      correo: usuarioDB.correo,
      rol,
    });

    return res.json({
      ok: true,
      success: true,
      mensaje: "Inicio de sesión correcto.",
      token,
      usuario: {
        id_usuario: usuarioDB.id_usuario,
        nombre_completo: usuarioDB.nombre_completo,
        correo: usuarioDB.correo,
        usuario: usuarioDB.usuario,
        rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "Error interno en el servidor.",
    });
  }
});

module.exports = router;