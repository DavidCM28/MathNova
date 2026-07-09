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
      xp_base
    } = req.body;

    if (!id_usuario || !actividad_codigo || !actividad_titulo || !mundo) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos obligatorios para guardar el progreso."
      });
    }

    const aciertosNum = Number(aciertos || 0);
    const totalPreguntasNum = Number(total_preguntas || 0);

    const precision =
      totalPreguntasNum > 0
        ? Number(((aciertosNum / totalPreguntasNum) * 100).toFixed(2))
        : 0;

    const estrellas = calcularEstrellas(aciertosNum, totalPreguntasNum);
    const completada =
      totalPreguntasNum > 0 && aciertosNum === totalPreguntasNum;

    const xpObtenido = Math.round(
      (Number(xp_base || 50) * precision) / 100
    );

    const result = await pool.query(
      `
      INSERT INTO public.actividad_progreso (
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
        tiempo_segundos
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (id_usuario, actividad_codigo)
      DO UPDATE SET
        mundo = EXCLUDED.mundo,
        tema = EXCLUDED.tema,
        actividad_titulo = EXCLUDED.actividad_titulo,

        respuestas = CASE
          WHEN EXCLUDED.precision >= public.actividad_progreso.precision
          THEN EXCLUDED.respuestas
          ELSE public.actividad_progreso.respuestas
        END,

        aciertos = GREATEST(
          public.actividad_progreso.aciertos,
          EXCLUDED.aciertos
        ),

        total_preguntas = EXCLUDED.total_preguntas,

        precision = GREATEST(
          public.actividad_progreso.precision,
          EXCLUDED.precision
        ),

        estrellas_obtenidas = GREATEST(
          public.actividad_progreso.estrellas_obtenidas,
          EXCLUDED.estrellas_obtenidas
        ),

        xp_obtenido = GREATEST(
          public.actividad_progreso.xp_obtenido,
          EXCLUDED.xp_obtenido
        ),

        completada = public.actividad_progreso.completada OR EXCLUDED.completada,
        intentos = public.actividad_progreso.intentos + 1,
        tiempo_segundos = EXCLUDED.tiempo_segundos,
        fecha_ultimo_intento = NOW()
      RETURNING *;
      `,
      [
        id_usuario,
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
        Number(tiempo_segundos || 0)
      ]
    );

    return res.json({
      ok: true,
      mensaje: "Progreso guardado correctamente.",
      progreso: result.rows[0]
    });
  } catch (error) {
    console.error("Error al guardar progreso:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al guardar progreso de la actividad."
    });
  }
};

const obtenerProgresoAlumno = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM public.actividad_progreso
      WHERE id_usuario = $1
      ORDER BY fecha_ultimo_intento DESC;
      `,
      [id_usuario]
    );

    return res.json({
      ok: true,
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
    const { id_usuario } = req.params;

    const resumenResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(estrellas_obtenidas), 0)::int AS estrellas_totales,
        COALESCE(SUM(xp_obtenido), 0)::int AS xp_total,
        COUNT(*) FILTER (WHERE completada = true)::int AS actividades_completadas,
        COUNT(*)::int AS actividades_intentadas,
        COALESCE(ROUND(AVG(precision), 2), 0)::float AS precision_promedio,
        COALESCE(SUM(tiempo_segundos), 0)::int AS tiempo_total_segundos
      FROM public.actividad_progreso
      WHERE id_usuario = $1;
      `,
      [id_usuario]
    );

    const mundosResult = await pool.query(
      `
      SELECT
        mundo,
        COUNT(*) FILTER (WHERE completada = true)::int AS completadas,
        COUNT(*)::int AS intentadas,
        COALESCE(SUM(estrellas_obtenidas), 0)::int AS estrellas,
        COALESCE(SUM(xp_obtenido), 0)::int AS xp,
        COALESCE(ROUND(AVG(precision), 2), 0)::float AS precision
      FROM public.actividad_progreso
      WHERE id_usuario = $1
      GROUP BY mundo
      ORDER BY mundo;
      `,
      [id_usuario]
    );

    return res.json({
      ok: true,
      resumen: resumenResult.rows[0],
      mundos: mundosResult.rows
    });
  } catch (error) {
    console.error("Error al obtener resumen del alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener resumen del alumno."
    });
  }
};

const obtenerProgresoActividad = async (req, res) => {
  try {
    const { id_usuario, actividad_codigo } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM public.actividad_progreso
      WHERE id_usuario = $1
      AND actividad_codigo = $2
      LIMIT 1;
      `,
      [id_usuario, actividad_codigo]
    );

    return res.json({
      ok: true,
      progreso: result.rows[0] || null
    });
  } catch (error) {
    console.error("Error al obtener progreso de actividad:", error);

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