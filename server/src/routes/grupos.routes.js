const express = require("express");
const pool = require("../db");
const verificarToken = require("../middleware/auth");

const router = express.Router();

router.post("/", verificarToken, async (req, res) => {
  try {
    const nombreGrupo = req.body.nombre_grupo?.trim();
    const idProfesor = req.usuario.id_usuario;

    if (!nombreGrupo) {
      return res.status(400).json({
        ok: false,
        mensaje: "Escribe el nombre del grupo.",
      });
    }

    if (nombreGrupo.length > 100) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre no puede superar los 100 caracteres.",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO grupos (nombre_grupo, id_profesor)
       VALUES ($1, $2)
       RETURNING id_grupo, nombre_grupo, id_profesor`,
      [nombreGrupo, idProfesor]
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Grupo creado correctamente.",
      grupo: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al crear grupo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo crear el grupo.",
    });
  }
});

module.exports = router;