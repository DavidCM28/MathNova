const express = require("express");
const pool = require("../db");
const verificarToken = require("../middleware/auth");

const router = express.Router();

/*
  GET /api/lista-alumnos/grupos

  Devuelve únicamente los grupos creados por el docente
  que inició sesión.
*/
router.get("/grupos", verificarToken, async (req, res) => {
  try {
    const idProfesor = req.usuario.id_usuario;

    const resultado = await pool.query(
      `
        SELECT
          g.id_grupo,
          g.nombre_grupo,
          COUNT(ga.id_alumno)::int AS total_alumnos
        FROM grupos g
        LEFT JOIN grupo_alumnos ga
          ON ga.id_grupo = g.id_grupo
          AND ga.estado = true
        WHERE g.id_profesor = $1
        GROUP BY g.id_grupo, g.nombre_grupo
        ORDER BY g.nombre_grupo ASC
      `,
      [idProfesor]
    );

    return res.json({
      ok: true,
      grupos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al consultar grupos:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron consultar los grupos.",
    });
  }
});

/*
  GET /api/lista-alumnos

  Opciones:
  /api/lista-alumnos
  /api/lista-alumnos?buscar=Mariana
  /api/lista-alumnos?id_grupo=1
  /api/lista-alumnos?id_grupo=1&buscar=Mariana
*/
router.get("/", verificarToken, async (req, res) => {
  try {
    const idProfesor = req.usuario.id_usuario;
    const buscar = String(req.query.buscar || "").trim();
    const idGrupoTexto = req.query.id_grupo;

    let idGrupo = null;

    if (idGrupoTexto !== undefined && idGrupoTexto !== "") {
      idGrupo = Number(idGrupoTexto);

      if (!Number.isSafeInteger(idGrupo) || idGrupo <= 0) {
        return res.status(400).json({
          ok: false,
          mensaje: "El grupo seleccionado no es válido.",
        });
      }

      // Confirma que el grupo pertenezca al docente.
      const grupoExiste = await pool.query(
        `
          SELECT id_grupo
          FROM grupos
          WHERE id_grupo = $1
            AND id_profesor = $2
        `,
        [idGrupo, idProfesor]
      );

      if (grupoExiste.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          mensaje: "El grupo no existe o no pertenece a este docente.",
        });
      }
    }

    const valores = [];
    const condiciones = [
      "r.rol = 'estudiante'",
      "r.estado = true",
    ];

    if (buscar) {
      valores.push(`%${buscar}%`);
      condiciones.push(
        `r.nombre_completo ILIKE $${valores.length}`
      );
    }

    let consulta;

    if (idGrupo !== null) {
      valores.push(idGrupo);
      const posicionGrupo = valores.length;

      valores.push(idProfesor);
      const posicionProfesor = valores.length;

      condiciones.push(`g.id_grupo = $${posicionGrupo}`);
      condiciones.push(`g.id_profesor = $${posicionProfesor}`);
      condiciones.push("ga.estado = true");

      consulta = `
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          r.rol,
          p.grado,
          g.id_grupo,
          g.nombre_grupo
        FROM registro r
        INNER JOIN grupo_alumnos ga
          ON ga.id_alumno = r.id_usuario
        INNER JOIN grupos g
          ON g.id_grupo = ga.id_grupo
        LEFT JOIN progreso_alumno p
          ON p.id_usuario = r.id_usuario
        WHERE ${condiciones.join(" AND ")}
        ORDER BY r.nombre_completo ASC
      `;
    } else {
      consulta = `
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          r.rol,
          p.grado,
          NULL::bigint AS id_grupo,
          NULL::varchar AS nombre_grupo
        FROM registro r
        LEFT JOIN progreso_alumno p
          ON p.id_usuario = r.id_usuario
        WHERE ${condiciones.join(" AND ")}
        ORDER BY r.nombre_completo ASC
      `;
    }

    const resultado = await pool.query(consulta, valores);

    return res.json({
      ok: true,
      total: resultado.rows.length,
      filtro: {
        id_grupo: idGrupo,
        buscar,
      },
      alumnos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al consultar alumnos:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron consultar los alumnos.",
    });
  }
});

module.exports = router;