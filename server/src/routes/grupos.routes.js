const express = require("express");
const pool = require("../db");
const verificarToken = require("../middleware/auth");

const router = express.Router();

function validarId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function obtenerGrupoDelDocente(idGrupo) {
  const resultado = await pool.query(
    `
    SELECT id_grupo, nombre_grupo, id_profesor
    FROM public.grupos
    WHERE id_grupo = $1
    `,
    [idGrupo]
  );

  return resultado.rows[0] || null;
}

router.get("/", verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `
      SELECT
        g.id_grupo,
        g.nombre_grupo,
        g.id_profesor,
        COUNT(DISTINCT ga.id_alumno)::int AS total_alumnos
      FROM public.grupos g
      LEFT JOIN public.grupo_alumnos ga
        ON ga.id_grupo = g.id_grupo
        AND ga.estado = true
      GROUP BY g.id_grupo, g.nombre_grupo, g.id_profesor
      ORDER BY g.id_grupo DESC
      `
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
      `
      INSERT INTO public.grupos (nombre_grupo, id_profesor)
      VALUES ($1, $2)
      RETURNING id_grupo, nombre_grupo, id_profesor
      `,
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
    const idGrupo = validarId(req.params.idGrupo);
    const nombreGrupo = req.body.nombre_grupo?.trim();

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
      `
      UPDATE public.grupos
      SET nombre_grupo = $1
      WHERE id_grupo = $2
      RETURNING id_grupo, nombre_grupo, id_profesor
      `,
      [nombreGrupo, idGrupo]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el grupo.",
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

router.get("/:idGrupo/alumnos", verificarToken, async (req, res) => {
  try {
    const idGrupo = validarId(req.params.idGrupo);

    if (!idGrupo) {
      return res.status(400).json({
        ok: false,
        mensaje: "El grupo no es válido.",
      });
    }

    const grupo = await obtenerGrupoDelDocente(idGrupo);

    if (!grupo) {
      return res.status(404).json({
        ok: false,
        mensaje: "El grupo no existe.",
      });
    }

    const resultado = await pool.query(
      `
      SELECT
        ga.id_grupo,
        r.id_usuario AS id_alumno,
        r.nombre_completo AS nombre,
        r.correo,
        r.usuario
      FROM public.grupo_alumnos ga
      INNER JOIN public.registro r
        ON r.id_usuario = ga.id_alumno
      WHERE ga.id_grupo = $1
        AND ga.estado = true
        AND r.estado = true
        AND LOWER(COALESCE(r.rol, '')) = 'estudiante'
      ORDER BY r.nombre_completo ASC
      `,
      [idGrupo]
    );

    return res.json({
      ok: true,
      alumnos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al obtener alumnos del grupo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los alumnos del grupo.",
    });
  }
});

router.get("/:idGrupo/alumnos-disponibles", verificarToken, async (req, res) => {
  try {
    const idGrupo = validarId(req.params.idGrupo);
    const buscar = String(req.query.buscar || "").trim();

    if (!idGrupo) {
      return res.status(400).json({
        ok: false,
        mensaje: "El grupo no es válido.",
      });
    }

    const grupo = await obtenerGrupoDelDocente(idGrupo);

    if (!grupo) {
      return res.status(404).json({
        ok: false,
        mensaje: "El grupo no existe.",
      });
    }

    const resultado = await pool.query(
      `
      SELECT
        0::bigint AS id_grupo,
        r.id_usuario AS id_alumno,
        r.nombre_completo AS nombre,
        r.correo,
        r.usuario
      FROM public.registro r
      WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
        AND r.estado = true
        AND NOT EXISTS (
          SELECT 1
          FROM public.grupo_alumnos ga
          WHERE ga.id_grupo = $1
            AND ga.id_alumno = r.id_usuario
            AND ga.estado = true
        )
        AND (
          $2 = ''
          OR LOWER(r.nombre_completo) LIKE LOWER('%' || $2 || '%')
          OR LOWER(r.correo) LIKE LOWER('%' || $2 || '%')
          OR LOWER(COALESCE(r.usuario, '')) LIKE LOWER('%' || $2 || '%')
        )
      ORDER BY r.nombre_completo ASC
      LIMIT 50
      `,
      [idGrupo, buscar]
    );

    return res.json({
      ok: true,
      alumnos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al obtener alumnos disponibles:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los alumnos disponibles.",
    });
  }
});

router.post("/:idGrupo/alumnos", verificarToken, async (req, res) => {
  try {
    const idGrupo = validarId(req.params.idGrupo);
    const idAlumno = validarId(req.body.id_alumno);

    if (!idGrupo || !idAlumno) {
      return res.status(400).json({
        ok: false,
        mensaje: "El grupo o alumno no es válido.",
      });
    }

    const grupo = await obtenerGrupoDelDocente(idGrupo);

    if (!grupo) {
      return res.status(404).json({
        ok: false,
        mensaje: "El grupo no existe.",
      });
    }

    const alumnoExiste = await pool.query(
      `
      SELECT id_usuario
      FROM public.registro
      WHERE id_usuario = $1
        AND estado = true
        AND LOWER(COALESCE(rol, '')) = 'estudiante'
      `,
      [idAlumno]
    );

    if (alumnoExiste.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "El alumno no existe o no está activo.",
      });
    }

    const asignacion = await pool.query(
      `
      SELECT id_grupo, id_alumno, estado
      FROM public.grupo_alumnos
      WHERE id_grupo = $1
        AND id_alumno = $2
      LIMIT 1
      `,
      [idGrupo, idAlumno]
    );

    if (asignacion.rows.length > 0 && asignacion.rows[0].estado === true) {
      return res.status(409).json({
        ok: false,
        mensaje: "Este alumno ya pertenece al grupo.",
      });
    }

    if (asignacion.rows.length > 0) {
      await pool.query(
        `
        UPDATE public.grupo_alumnos
        SET estado = true
        WHERE id_grupo = $1
          AND id_alumno = $2
        `,
        [idGrupo, idAlumno]
      );
    } else {
      await pool.query(
        `
        INSERT INTO public.grupo_alumnos (id_grupo, id_alumno, estado)
        VALUES ($1, $2, true)
        `,
        [idGrupo, idAlumno]
      );
    }

    const alumnoResultado = await pool.query(
      `
      SELECT
        $1::bigint AS id_grupo,
        r.id_usuario AS id_alumno,
        r.nombre_completo AS nombre,
        r.correo,
        r.usuario
      FROM public.registro r
      WHERE r.id_usuario = $2
      `,
      [idGrupo, idAlumno]
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Alumno agregado al grupo correctamente.",
      alumno: alumnoResultado.rows[0],
    });
  } catch (error) {
    console.error("Error al agregar alumno al grupo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo agregar el alumno al grupo.",
    });
  }
});

router.delete("/:idGrupo/alumnos/:idAlumno", verificarToken, async (req, res) => {
  try {
    const idGrupo = validarId(req.params.idGrupo);
    const idAlumno = validarId(req.params.idAlumno);

    if (!idGrupo || !idAlumno) {
      return res.status(400).json({
        ok: false,
        mensaje: "El grupo o alumno no es válido.",
      });
    }

    const grupo = await obtenerGrupoDelDocente(idGrupo);

    if (!grupo) {
      return res.status(404).json({
        ok: false,
        mensaje: "El grupo no existe.",
      });
    }

    const resultado = await pool.query(
      `
      UPDATE public.grupo_alumnos
      SET estado = false
      WHERE id_grupo = $1
        AND id_alumno = $2
        AND estado = true
      RETURNING id_grupo, id_alumno
      `,
      [idGrupo, idAlumno]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "El alumno no está asignado a este grupo.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Alumno eliminado del grupo correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar alumno del grupo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo eliminar el alumno del grupo.",
    });
  }
});

module.exports = router;
