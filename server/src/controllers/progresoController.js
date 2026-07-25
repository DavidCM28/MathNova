const pool = require("../db");

const calcularEstrellas = (aciertos, totalPreguntas) => {
  if (!totalPreguntas || totalPreguntas <= 0) return 0;

  const precision = (aciertos / totalPreguntas) * 100;

  if (precision >= 100) return 3;
  if (precision >= 70) return 2;
  if (precision >= 50) return 1;

  return 0;
};

const guardarProgresoActividad = async (req, res) => {
  try {
    const {
      id_usuario,
      mundo,
      tema,
      actividad_codigo,
      actividad_titulo,
      respuestas,
      aciertos,
      total_preguntas,
      tiempo_segundos,
      xp_base,
      completada: completadaRecibida
    } = req.body;

    const idUsuarioNum = Number(id_usuario);
    const aciertosNum = Math.max(0, Number(aciertos || 0));
    const totalPreguntasNum = Math.max(0, Number(total_preguntas || 0));
    const tiempoSegundosNum = Math.max(0, Number(tiempo_segundos || 0));
    const xpBaseNum = Math.max(0, Number(xp_base || 50));

    if (
      !Number.isInteger(idUsuarioNum) ||
      idUsuarioNum <= 0 ||
      !mundo ||
      !actividad_codigo ||
      !actividad_titulo
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos obligatorios para guardar el progreso."
      });
    }

    const precision =
      totalPreguntasNum > 0
        ? Math.min(
            100,
            Number(
              ((aciertosNum / totalPreguntasNum) * 100).toFixed(2)
            )
          )
        : 0;

    const estrellas = calcularEstrellas(
      aciertosNum,
      totalPreguntasNum
    );

    /*
     * El endpoint se ejecuta cuando el alumno termina la actividad.
     * Por eso, aunque tenga respuestas incorrectas, cuenta como realizada.
     *
     * Si el frontend manda explícitamente completada: false,
     * se respetará ese valor.
     */
    const completada =
      typeof completadaRecibida === "boolean"
        ? completadaRecibida
        : totalPreguntasNum > 0;

    const xpObtenido = Math.round(
      (xpBaseNum * precision) / 100
    );

    const result = await pool.query(
      `
      INSERT INTO public.actividad_progreso AS progreso_actual (
        id_usuario,
        mundo,
        tema,
        actividad_codigo,
        actividad_titulo,
        respuestas,
        aciertos,
        total_preguntas,
        precision,
        estrellas_obtenidas,
        xp_obtenido,
        completada,
        tiempo_segundos,
        intentos,
        fecha_ultimo_intento
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6::jsonb, $7, $8, $9, $10,
        $11, $12, $13, 1, NOW()
      )
      ON CONFLICT (id_usuario, actividad_codigo)
      DO UPDATE SET
        mundo = EXCLUDED.mundo,
        tema = EXCLUDED.tema,
        actividad_titulo = EXCLUDED.actividad_titulo,

        respuestas = CASE
          WHEN EXCLUDED.precision >= COALESCE(
            progreso_actual.precision,
            0
          )
          THEN EXCLUDED.respuestas
          ELSE progreso_actual.respuestas
        END,

        aciertos = GREATEST(
          COALESCE(progreso_actual.aciertos, 0),
          EXCLUDED.aciertos
        ),

        total_preguntas = GREATEST(
          COALESCE(progreso_actual.total_preguntas, 0),
          EXCLUDED.total_preguntas
        ),

        precision = GREATEST(
          COALESCE(progreso_actual.precision, 0),
          EXCLUDED.precision
        ),

        estrellas_obtenidas = GREATEST(
          COALESCE(progreso_actual.estrellas_obtenidas, 0),
          EXCLUDED.estrellas_obtenidas
        ),

        xp_obtenido = GREATEST(
          COALESCE(progreso_actual.xp_obtenido, 0),
          EXCLUDED.xp_obtenido
        ),

        completada =
          COALESCE(progreso_actual.completada, false)
          OR EXCLUDED.completada,

        intentos =
          COALESCE(progreso_actual.intentos, 0) + 1,

        tiempo_segundos =
          COALESCE(progreso_actual.tiempo_segundos, 0)
          + EXCLUDED.tiempo_segundos,

        fecha_ultimo_intento = NOW()

      RETURNING *;
      `,
      [
        idUsuarioNum,
        mundo,
        tema || null,
        actividad_codigo,
        actividad_titulo,
        JSON.stringify(respuestas || {}),
        aciertosNum,
        totalPreguntasNum,
        precision,
        estrellas,
        xpObtenido,
        completada,
        tiempoSegundosNum
      ]
    );

    console.log("PROGRESO GUARDADO:", {
      id_usuario: idUsuarioNum,
      actividad_codigo,
      precision,
      estrellas,
      completada
    });

    return res.status(200).json({
      ok: true,
      mensaje: "Progreso guardado correctamente.",
      progreso: result.rows[0]
    });
  } catch (error) {
    console.error("Error al guardar progreso:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al guardar progreso de la actividad.",
      detalle:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
};

const obtenerProgresoAlumno = async (req, res) => {
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario no es válido."
      });
    }

    const result = await pool.query(
      `
      SELECT
        id_progreso,
        id_usuario,
        mundo,
        tema,
        actividad_codigo,
        actividad_titulo,
        respuestas,
        aciertos,
        total_preguntas,
        precision,
        estrellas_obtenidas,
        xp_obtenido,
        completada,
        tiempo_segundos,
        intentos,
        fecha_ultimo_intento
      FROM public.actividad_progreso
      WHERE id_usuario = $1
      ORDER BY fecha_ultimo_intento DESC;
      `,
      [idUsuario]
    );

    return res.json({
      ok: true,
      total: result.rowCount,
      progreso: result.rows
    });
  } catch (error) {
    console.error("Error al obtener progreso:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener progreso del alumno."
    });
  }
};

const obtenerResumenAlumno = async (req, res) => {
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario no es válido."
      });
    }

    const resumenResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(estrellas_obtenidas),
          0
        )::int AS estrellas_totales,

        COALESCE(
          SUM(xp_obtenido),
          0
        )::int AS xp_total,

        COUNT(*) FILTER (
          WHERE completada = true
        )::int AS actividades_completadas,

        COUNT(*)::int AS actividades_intentadas,

        COALESCE(
          ROUND(AVG(precision), 2),
          0
        )::float AS precision_promedio,

        COALESCE(
          SUM(tiempo_segundos),
          0
        )::int AS tiempo_total_segundos

      FROM public.actividad_progreso
      WHERE id_usuario = $1;
      `,
      [idUsuario]
    );

    const mundosResult = await pool.query(
      `
      SELECT
        mundo,

        COUNT(*) FILTER (
          WHERE completada = true
        )::int AS completadas,

        COUNT(*)::int AS intentadas,

        COALESCE(
          SUM(estrellas_obtenidas),
          0
        )::int AS estrellas,

        COALESCE(
          SUM(xp_obtenido),
          0
        )::int AS xp,

        COALESCE(
          ROUND(AVG(precision), 2),
          0
        )::float AS precision

      FROM public.actividad_progreso
      WHERE id_usuario = $1
      GROUP BY mundo
      ORDER BY mundo;
      `,
      [idUsuario]
    );

    const rachaResult = await pool.query(
      `
      SELECT COALESCE(
        (
          WITH dias AS (
            SELECT DISTINCT
              fecha_ultimo_intento::date AS dia
            FROM public.actividad_progreso
            WHERE id_usuario = $1
              AND completada = true
          ),
          ordenados AS (
            SELECT
              dia,
              dia - (
                ROW_NUMBER() OVER (ORDER BY dia)
              )::int AS grupo
            FROM dias
          ),
          ultimo AS (
            SELECT dia, grupo
            FROM ordenados
            ORDER BY dia DESC
            LIMIT 1
          )
          SELECT
            CASE
              WHEN ultimo.dia >= CURRENT_DATE - 1
              THEN (
                SELECT COUNT(*)
                FROM ordenados
                WHERE grupo = ultimo.grupo
              )
              ELSE 0
            END
          FROM ultimo
        ),
        0
      )::int AS racha_actual;
      `,
      [idUsuario]
    );

    const resumenBase = resumenResult.rows[0];

    const resumen = {
      estrellas_totales: Number(
        resumenBase.estrellas_totales || 0
      ),

      estrellas_ganadas: Number(
        resumenBase.estrellas_totales || 0
      ),

      xp_total: Number(
        resumenBase.xp_total || 0
      ),

      actividades_completadas: Number(
        resumenBase.actividades_completadas || 0
      ),

      lecciones_completadas: Number(
        resumenBase.actividades_completadas || 0
      ),

      actividades_intentadas: Number(
        resumenBase.actividades_intentadas || 0
      ),

      precision_promedio: Number(
        resumenBase.precision_promedio || 0
      ),

      promedio_general: Number(
        resumenBase.precision_promedio || 0
      ),

      progreso_general: Number(
        resumenBase.precision_promedio || 0
      ),

      tiempo_total_segundos: Number(
        resumenBase.tiempo_total_segundos || 0
      ),

      tiempo_estudio_segundos: Number(
        resumenBase.tiempo_total_segundos || 0
      ),

      tiempo_estudio_minutos: Math.floor(
        Number(resumenBase.tiempo_total_segundos || 0) / 60
      ),

      racha_actual: Number(
        rachaResult.rows[0]?.racha_actual || 0
      )
    };

    return res.json({
      ok: true,
      resumen,
      mundos: mundosResult.rows
    });
  } catch (error) {
    console.error(
      "Error al obtener resumen del alumno:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener resumen del alumno."
    });
  }
};

const obtenerProgresoActividad = async (req, res) => {
  try {
    const idUsuario = Number(req.params.id_usuario);
    const { actividad_codigo } = req.params;

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0 ||
      !actividad_codigo
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Los datos de la actividad no son válidos."
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM public.actividad_progreso
      WHERE id_usuario = $1
        AND actividad_codigo = $2
      LIMIT 1;
      `,
      [idUsuario, actividad_codigo]
    );

    return res.json({
      ok: true,
      progreso: result.rows[0] || null
    });
  } catch (error) {
    console.error(
      "Error al obtener progreso de actividad:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener progreso de la actividad."
    });
  }
};

module.exports = {
  guardarProgresoActividad,
  obtenerProgresoAlumno,
  obtenerResumenAlumno,
  obtenerProgresoActividad
};