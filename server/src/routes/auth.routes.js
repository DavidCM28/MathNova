const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

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

    const nombreFinal = nombre_completo || nombreCompleto;
    const correoFinal = correo || email;
    const passwordFinal = password || contrasena;
    const confirmarFinal = confirmar_password || confirmarPassword;

    if (!nombreFinal || !correoFinal || !passwordFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, correo y contraseña son obligatorios.",
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

    const correoLimpio = correoFinal.trim().toLowerCase();
    const usuarioLimpio = usuario && usuario.trim() !== "" ? usuario.trim() : null;

    const usuarioExiste = await pool.query(
      "SELECT id_usuario FROM registro WHERE correo = $1 OR usuario = $2",
      [correoLimpio, usuarioLimpio]
    );

    if (usuarioExiste.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: "El correo o usuario ya está registrado.",
      });
    }

    const passwordHash = await bcrypt.hash(passwordFinal, 10);

    const nuevoUsuario = await pool.query(
      `INSERT INTO registro 
        (nombre_completo, correo, usuario, password_hash, rol, estado, acepto_terminos)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro`,
      [
        nombreFinal.trim(),
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
      usuario: nuevoUsuario.rows[0],
    });
  } catch (error) {
    console.error("Error en registro:", error.message);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {
      correo,
      email,
      usuario,
      correoUsuario,
      password,
      contrasena,
    } = req.body;

    const identificador = correo || email || usuario || correoUsuario;
    const passwordFinal = password || contrasena;

    if (!identificador || !passwordFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Correo/usuario y contraseña son obligatorios.",
      });
    }

    const identificadorLimpio = identificador.trim().toLowerCase();

    const usuarioEncontrado = await pool.query(
      `SELECT 
          id_usuario, 
          nombre_completo, 
          correo, 
          usuario, 
          password_hash, 
          rol, 
          estado
       FROM registro
       WHERE correo = $1 OR usuario = $1
       LIMIT 1`,
      [identificadorLimpio]
    );

    if (usuarioEncontrado.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales incorrectas.",
      });
    }

    const usuarioDB = usuarioEncontrado.rows[0];

    if (!usuarioDB.estado) {
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

    await pool.query(
      `INSERT INTO login 
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

    const token = jwt.sign(
      {
        id_usuario: usuarioDB.id_usuario,
        correo: usuarioDB.correo,
        rol: usuarioDB.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.json({
      ok: true,
      mensaje: "Inicio de sesión correcto.",
      token,
      usuario: {
        id_usuario: usuarioDB.id_usuario,
        nombre_completo: usuarioDB.nombre_completo,
        correo: usuarioDB.correo,
        usuario: usuarioDB.usuario,
        rol: usuarioDB.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error.message);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor.",
    });
  }
});

module.exports = router;