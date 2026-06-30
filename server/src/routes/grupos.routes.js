const express = require("express");
const pool = require("../db");
const verificarToken = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarToken, async (req, res) => {
  try {
    const idProfesor = req.usuario.id_usuario;

    const resultado = await pool.query(
      `SELECT 
        g.id_grupo,
        g.nombre_grupo,
        g.id_profesor,
        COUNT(ga.id_alumno)::int AS total_alumnos
       FROM grupos g
       LEFT JOIN grupo_alumnos ga 
        ON ga.id_grupo = g.id_grupo AND ga.estado = true
       WHERE g.id_profesor = $1
       GROUP BY g.id_grupo
       ORDER BY g.id_grupo DESC`,
      [idProfesor]
    );

    return res.json({
      ok: true,
      grupos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al obtener grupos:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los grupos.",
    });
  }
});

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

router.put("/:idGrupo", verificarToken, async (req, res) => {
  try {
    const idGrupo = Number(req.params.idGrupo);
    const nombreGrupo = req.body.nombre_grupo?.trim();
    const idProfesor = req.usuario.id_usuario;

    if (!idGrupo) {
      return res.status(400).json({
        ok: false,
        mensaje: "El grupo no es válido.",
      });
    }

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
      `UPDATE grupos
       SET nombre_grupo = $1
       WHERE id_grupo = $2 AND id_profesor = $3
       RETURNING id_grupo, nombre_grupo, id_profesor`,
      [nombreGrupo, idGrupo, idProfesor]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el grupo o no tienes permiso para editarlo.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Grupo actualizado correctamente.",
      grupo: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al editar grupo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo editar el grupo.",
    });
  }
});

module.exports = router;