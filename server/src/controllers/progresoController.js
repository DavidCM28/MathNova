const pool = require("../db");

/*
 * Convierte un valor a número y evita resultados
 * negativos o valores NaN.
 */
const numeroNoNegativo = (valor, valorPredeterminado = 0) => {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return valorPredeterminado;
  }

  return Math.max(0, numero);
};

/*
 * Normaliza los nombres de los mundos para evitar
 * registros como:
 *
 * mathnumbers
 * MathNumbers
 * Math Numbers
 *
 * Todos se guardarán con el mismo nombre.
 */
const normalizarMundo = (mundo) => {
  const valor = String(mundo || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]/g, "");

  if (
    [
      "mathnumbers",
      "numbers",
      "numeros",
      "numero",
    ].includes(valor)
  ) {
    return "MathNumbers";
  }

  if (
    [
      "mathgeometry",
      "geometry",
      "geometria",
    ].includes(valor)
  ) {
    return "MathGeometry";
  }

  if (
    [
      "mathdata",
      "data",
      "estadistica",
      "estadisticas",
    ].includes(valor)
  ) {
    return "MathData";
  }

  return String(mundo || "").trim();
};

/*
 * Obtiene el usuario autenticado desde cualquiera
 * de las propiedades utilizadas por los middlewares.
 */
const obtenerIdUsuarioSesion = (req) => {
  const posiblesIds = [
    req.usuario?.id_usuario,
    req.usuario?.id,
    req.user?.id_usuario,
    req.user?.id,
    req.auth?.id_usuario,
    req.auth?.id,
  ];

  for (const posibleId of posiblesIds) {
    const id = Number(posibleId);

    if (Number.isInteger(id) && id > 0) {
      return id;
    }
  }

  return null;
};

/*
 * Calcula las estrellas de acuerdo con la precisión.
 */
const calcularEstrellas = (
  aciertos,
  totalPreguntas,
) => {
  if (
    !totalPreguntas ||
    totalPreguntas <= 0
  ) {
    return 0;
  }

  const precision =
    (aciertos / totalPreguntas) * 100;

  if (precision >= 100) {
    return 3;
  }

  if (precision >= 70) {
    return 2;
  }

  if (precision >= 50) {
    return 1;
  }

  return 0;
};

/*
 * POST /api/progreso/actividad
 *
 * Guarda un nuevo progreso o actualiza el registro
 * existente de la misma actividad.
 */
const guardarProgresoActividad = async (
  req,
  res,
) => {
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
      completada: completadaRecibida,
    } = req.body;

    const idUsuarioSesion =
      obtenerIdUsuarioSesion(req);

    const idUsuarioBody =
      Number(id_usuario);

    /*
     * Cuando existe una sesión autenticada, se utiliza
     * ese ID y no se confía solamente en el enviado por
     * el frontend.
     */
    const idUsuarioNum =
      idUsuarioSesion ||
      idUsuarioBody;

    if (
      !Number.isInteger(idUsuarioNum) ||
      idUsuarioNum <= 0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "No se encontró un usuario válido para guardar el progreso.",
      });
    }

    /*
     * Evita que un usuario autenticado intente guardar
     * progreso utilizando el ID de otra cuenta.
     */
    if (
      idUsuarioSesion &&
      Number.isInteger(idUsuarioBody) &&
      idUsuarioBody > 0 &&
      idUsuarioSesion !== idUsuarioBody
    ) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes guardar progreso para otro usuario.",
      });
    }

    const mundoNormalizado =
      normalizarMundo(mundo);

    const codigoActividad =
      String(
        actividad_codigo || "",
      ).trim();

    const tituloActividad =
      String(
        actividad_titulo || "",
      ).trim();

    const temaActividad =
      String(tema || "").trim() ||
      null;

    const aciertosNum =
      numeroNoNegativo(aciertos);

    const totalPreguntasNum =
      numeroNoNegativo(
        total_preguntas,
      );

    const tiempoSegundosNum =
      numeroNoNegativo(
        tiempo_segundos,
      );

    const xpBaseNum =
      numeroNoNegativo(
        xp_base,
        50,
      );

    if (!mundoNormalizado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El mundo de la actividad es obligatorio.",
      });
    }

    if (!codigoActividad) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El código de la actividad es obligatorio.",
      });
    }

    if (!tituloActividad) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El título de la actividad es obligatorio.",
      });
    }

    if (totalPreguntasNum <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El total de preguntas debe ser mayor que cero.",
      });
    }

    if (
      aciertosNum >
      totalPreguntasNum
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los aciertos no pueden superar el total de preguntas.",
      });
    }

    const precision = Math.min(
      100,
      Number(
        (
          (aciertosNum /
            totalPreguntasNum) *
          100
        ).toFixed(2),
      ),
    );

    const estrellas =
      calcularEstrellas(
        aciertosNum,
        totalPreguntasNum,
      );

    /*
     * El frontend normalmente envía completada.
     *
     * Cuando no la envía, solamente se considera
     * completada si obtuvo 100% de precisión.
     */
    const completada =
      typeof completadaRecibida ===
      "boolean"
        ? completadaRecibida
        : precision >= 100;

    const xpObtenido =
      Math.round(
        (xpBaseNum * precision) /
          100,
      );

    const respuestasSeguras =
      respuestas &&
      typeof respuestas === "object"
        ? respuestas
        : {};

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
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        1,
        NOW()
      )

      ON CONFLICT (
        id_usuario,
        actividad_codigo
      )

      DO UPDATE SET
        mundo =
          EXCLUDED.mundo,

        tema =
          EXCLUDED.tema,

        actividad_titulo =
          EXCLUDED.actividad_titulo,

        /*
         * Conserva las respuestas del intento
         * que tenga la mejor precisión.
         */
        respuestas =
          CASE
            WHEN
              EXCLUDED.precision >=
              COALESCE(
                progreso_actual.precision,
                0
              )
            THEN EXCLUDED.respuestas
            ELSE progreso_actual.respuestas
          END,

        /*
         * Conserva el mejor resultado conseguido.
         */
        aciertos =
          GREATEST(
            COALESCE(
              progreso_actual.aciertos,
              0
            ),
            EXCLUDED.aciertos
          ),

        total_preguntas =
          GREATEST(
            COALESCE(
              progreso_actual.total_preguntas,
              0
            ),
            EXCLUDED.total_preguntas
          ),

        precision =
          GREATEST(
            COALESCE(
              progreso_actual.precision,
              0
            ),
            EXCLUDED.precision
          ),

        estrellas_obtenidas =
          GREATEST(
            COALESCE(
              progreso_actual.estrellas_obtenidas,
              0
            ),
            EXCLUDED.estrellas_obtenidas
          ),

        xp_obtenido =
          GREATEST(
            COALESCE(
              progreso_actual.xp_obtenido,
              0
            ),
            EXCLUDED.xp_obtenido
          ),

        /*
         * Una actividad que ya fue completada
         * seguirá completada aunque posteriormente
         * el alumno tenga un intento incorrecto.
         */
        completada =
          COALESCE(
            progreso_actual.completada,
            false
          )
          OR
          EXCLUDED.completada,

        intentos =
          COALESCE(
            progreso_actual.intentos,
            0
          ) + 1,

        /*
         * Acumula el tiempo de todos los intentos.
         */
        tiempo_segundos =
          COALESCE(
            progreso_actual.tiempo_segundos,
            0
          )
          +
          EXCLUDED.tiempo_segundos,

        fecha_ultimo_intento =
          NOW()

      RETURNING *;
      `,
      [
        idUsuarioNum,
        mundoNormalizado,
        temaActividad,
        codigoActividad,
        tituloActividad,
        JSON.stringify(
          respuestasSeguras,
        ),
        aciertosNum,
        totalPreguntasNum,
        precision,
        estrellas,
        xpObtenido,
        completada,
        tiempoSegundosNum,
      ],
    );

    const progresoGuardado =
      result.rows[0];

    console.log(
      "PROGRESO GUARDADO:",
      {
        id_usuario:
          progresoGuardado.id_usuario,

        actividad_codigo:
          progresoGuardado.actividad_codigo,

        precision:
          progresoGuardado.precision,

        estrellas:
          progresoGuardado.estrellas_obtenidas,

        xp:
          progresoGuardado.xp_obtenido,

        intentos:
          progresoGuardado.intentos,

        completada:
          progresoGuardado.completada,

        tiempo_segundos:
          progresoGuardado.tiempo_segundos,
      },
    );

    return res.status(200).json({
      ok: true,
      mensaje:
        "Progreso guardado correctamente.",
      progreso:
        progresoGuardado,
    });
  } catch (error) {
    console.error(
      "Error al guardar progreso:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "Error al guardar progreso de la actividad.",
      detalle:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/*
 * GET /api/progreso/alumno/:id_usuario
 */
const obtenerProgresoAlumno = async (
  req,
  res,
) => {
  try {
    const idUsuario =
      Number(
        req.params.id_usuario,
      );

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El id del usuario no es válido.",
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
      ORDER BY
        fecha_ultimo_intento DESC,
        id_progreso DESC;
      `,
      [idUsuario],
    );

    return res.status(200).json({
      ok: true,
      total:
        Number(
          result.rowCount || 0,
        ),
      progreso:
        result.rows,
    });
  } catch (error) {
    console.error(
      "Error al obtener progreso:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "Error al obtener progreso del alumno.",
    });
  }
};

/*
 * GET /api/progreso/resumen/:id_usuario
 */
const obtenerResumenAlumno = async (
  req,
  res,
) => {
  try {
    const idUsuario =
      Number(
        req.params.id_usuario,
      );

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El id del usuario no es válido.",
      });
    }

    const resumenResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(estrellas_obtenidas),
            0
          )::int
            AS estrellas_totales,

          COALESCE(
            SUM(xp_obtenido),
            0
          )::int
            AS xp_total,

          COUNT(*) FILTER (
            WHERE completada = true
          )::int
            AS actividades_completadas,

          COUNT(*)::int
            AS actividades_intentadas,

          COALESCE(
            SUM(intentos),
            0
          )::int
            AS intentos_totales,

          COALESCE(
            ROUND(
              AVG(precision),
              2
            ),
            0
          )::float
            AS precision_promedio,

          COALESCE(
            SUM(tiempo_segundos),
            0
          )::int
            AS tiempo_total_segundos

        FROM public.actividad_progreso
        WHERE id_usuario = $1;
        `,
        [idUsuario],
      );

    const mundosResult =
      await pool.query(
        `
        SELECT
          mundo,

          COUNT(*) FILTER (
            WHERE completada = true
          )::int
            AS completadas,

          COUNT(*)::int
            AS intentadas,

          COALESCE(
            SUM(intentos),
            0
          )::int
            AS intentos_totales,

          COALESCE(
            SUM(estrellas_obtenidas),
            0
          )::int
            AS estrellas,

          COALESCE(
            SUM(xp_obtenido),
            0
          )::int
            AS xp,

          COALESCE(
            ROUND(
              AVG(precision),
              2
            ),
            0
          )::float
            AS precision

        FROM public.actividad_progreso
        WHERE id_usuario = $1
        GROUP BY mundo
        ORDER BY mundo;
        `,
        [idUsuario],
      );

    const rachaResult =
      await pool.query(
        `
        SELECT COALESCE(
          (
            WITH dias AS (
              SELECT DISTINCT
                fecha_ultimo_intento::date
                  AS dia
              FROM public.actividad_progreso
              WHERE id_usuario = $1
                AND completada = true
            ),

            ordenados AS (
              SELECT
                dia,

                dia - (
                  ROW_NUMBER()
                  OVER (
                    ORDER BY dia
                  )
                )::int
                  AS grupo
              FROM dias
            ),

            ultimo AS (
              SELECT
                dia,
                grupo
              FROM ordenados
              ORDER BY dia DESC
              LIMIT 1
            )

            SELECT
              CASE
                WHEN
                  ultimo.dia >=
                  CURRENT_DATE - 1
                THEN (
                  SELECT COUNT(*)
                  FROM ordenados
                  WHERE
                    grupo =
                    ultimo.grupo
                )
                ELSE 0
              END
            FROM ultimo
          ),
          0
        )::int
          AS racha_actual;
        `,
        [idUsuario],
      );

    const resumenBase =
      resumenResult.rows[0] || {};

    const tiempoTotalSegundos =
      Number(
        resumenBase
          .tiempo_total_segundos ||
          0,
      );

    const precisionPromedio =
      Number(
        resumenBase
          .precision_promedio ||
          0,
      );

    const actividadesCompletadas =
      Number(
        resumenBase
          .actividades_completadas ||
          0,
      );

    const resumen = {
      estrellas_totales:
        Number(
          resumenBase
            .estrellas_totales ||
            0,
        ),

      estrellas_ganadas:
        Number(
          resumenBase
            .estrellas_totales ||
            0,
        ),

      xp_total:
        Number(
          resumenBase.xp_total ||
            0,
        ),

      actividades_completadas:
        actividadesCompletadas,

      lecciones_completadas:
        actividadesCompletadas,

      actividades_intentadas:
        Number(
          resumenBase
            .actividades_intentadas ||
            0,
        ),

      intentos_totales:
        Number(
          resumenBase
            .intentos_totales ||
            0,
        ),

      precision_promedio:
        precisionPromedio,

      promedio_general:
        precisionPromedio,

      progreso_general:
        precisionPromedio,

      tiempo_total_segundos:
        tiempoTotalSegundos,

      tiempo_estudio_segundos:
        tiempoTotalSegundos,

      tiempo_estudio_minutos:
        Math.floor(
          tiempoTotalSegundos /
            60,
        ),

      racha_actual:
        Number(
          rachaResult.rows[0]
            ?.racha_actual ||
            0,
        ),
    };

    return res.status(200).json({
      ok: true,
      resumen,
      mundos:
        mundosResult.rows,
    });
  } catch (error) {
    console.error(
      "Error al obtener resumen del alumno:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "Error al obtener resumen del alumno.",
    });
  }
};

/*
 * GET
 * /api/progreso/actividad/:id_usuario/:actividad_codigo
 */
const obtenerProgresoActividad = async (
  req,
  res,
) => {
  try {
    const idUsuario =
      Number(
        req.params.id_usuario,
      );

    const actividadCodigo =
      String(
        req.params
          .actividad_codigo ||
          "",
      ).trim();

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0 ||
      !actividadCodigo
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los datos de la actividad no son válidos.",
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
        AND actividad_codigo = $2
      LIMIT 1;
      `,
      [
        idUsuario,
        actividadCodigo,
      ],
    );

    return res.status(200).json({
      ok: true,
      progreso:
        result.rows[0] ||
        null,
    });
  } catch (error) {
    console.error(
      "Error al obtener progreso de actividad:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "Error al obtener progreso de la actividad.",
    });
  }
};

module.exports = {
  guardarProgresoActividad,
  obtenerProgresoAlumno,
  obtenerResumenAlumno,
  obtenerProgresoActividad,
};