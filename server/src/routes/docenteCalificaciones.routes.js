const express = require("express");
const pool = require("../db");

const router = express.Router();

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function obtenerColor(idUsuario) {
  const colores = ["blue", "purple", "orange", "gray", "silver", "green", "yellow", "violet"];
  return colores[Number(idUsuario) % colores.length];
}

function obtenerEstado({ promedio, progreso, totalActividades }) {
  if ((!promedio || promedio === 0) && (!progreso || progreso === 0) && totalActividades === 0) {
    return "sin-progreso";
  }

  if (promedio !== null && promedio !== undefined) {
    if (promedio >= 9) return "excelente";
    if (promedio >= 7) return "bien";
    return "rezago";
  }

  if (progreso >= 70) return "bien";
  if (progreso >= 40) return "en-progreso";

  return "rezago";
}

function calcularResumen(alumnos) {
  const total = alumnos.length;

  const alumnosConPromedio = alumnos.filter(
    (alumno) => alumno.promedio !== null && alumno.promedio !== undefined
  );

  const promedioGeneral =
    alumnosConPromedio.length > 0
      ? Number(
          (
            alumnosConPromedio.reduce(
              (suma, alumno) => suma + Number(alumno.promedio),
              0
            ) / alumnosConPromedio.length
          ).toFixed(1)
        )
      : null;

  const aprobados = alumnos.filter(
    (alumno) => alumno.promedio !== null && alumno.promedio >= 7
  ).length;

  const rezago = alumnos.filter((alumno) => alumno.estado === "rezago").length;

  const sinProgreso = alumnos.filter(
    (alumno) => alumno.estado === "sin-progreso"
  ).length;

  const conProgreso = total - sinProgreso;

  const mejorAlumno = [...alumnos]
    .filter((alumno) => alumno.promedio !== null)
    .sort((a, b) => Number(b.promedio) - Number(a.promedio))[0];

  const actividadesCompletadas = alumnos.reduce(
    (suma, alumno) => suma + Number(alumno.actividades_completadas || 0),
    0
  );

  return {
    total,
    promedio_general: promedioGeneral,
    aprobados,
    porcentaje_aprobados:
      total > 0 ? Number(((aprobados * 100) / total).toFixed(1)) : 0,
    rezago,
    sin_progreso: sinProgreso,
    con_progreso: conProgreso,
    actividades_completadas: actividadesCompletadas,
    mejor_promedio: mejorAlumno?.promedio ?? null,
    mejor_alumno: mejorAlumno?.nombre ?? null,
  };
}

function calcularPromedioPorActividad(alumnos) {
  const mapa = new Map();

  alumnos.forEach((alumno) => {
    alumno.actividades.forEach((actividad) => {
      if (actividad.calificacion === null || actividad.calificacion === undefined) return;

      const actual = mapa.get(actividad.titulo) || {
        titulo: actividad.titulo,
        suma: 0,
        total: 0,
      };

      actual.suma += Number(actividad.calificacion);
      actual.total += 1;

      mapa.set(actividad.titulo, actual);
    });
  });

  return Array.from(mapa.values())
    .map((item) => ({
      titulo: item.titulo,
      promedio: Number((item.suma / item.total).toFixed(1)),
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))
    .slice(0, 8);
}

router.get("/", async (req, res) => {
  try {
    const buscar = String(req.query.buscar || "").trim();
    const idGrupoRaw = Number(req.query.id_grupo || 0);
    const idGrupo =
      Number.isSafeInteger(idGrupoRaw) && idGrupoRaw > 0 ? idGrupoRaw : null;

    const existeActividadProgresoResultado = await pool.query(`
      SELECT to_regclass('public.actividad_progreso') IS NOT NULL AS existe
    `);

    const existeActividadProgreso =
      existeActividadProgresoResultado.rows[0]?.existe === true;

    const gruposResultado = await pool.query(`
      SELECT
        id_grupo,
        nombre_grupo
      FROM public.grupos
      ORDER BY nombre_grupo ASC
    `);

    let alumnosResultado;

    if (existeActividadProgreso) {
      alumnosResultado = await pool.query(
        `
        WITH grupos_alumno AS (
          SELECT DISTINCT ON (ga.id_alumno)
            ga.id_alumno,
            ga.id_grupo,
            g.nombre_grupo
          FROM public.grupo_alumnos ga
          INNER JOIN public.grupos g
            ON g.id_grupo = ga.id_grupo
          WHERE ga.estado = true
          ORDER BY ga.id_alumno, g.nombre_grupo ASC
        ),
        actividad_por_titulo AS (
          SELECT
            ap.id_usuario,
            COALESCE(NULLIF(ap.actividad_titulo, ''), 'Actividad') AS titulo,
            ROUND((AVG(COALESCE(ap.precision, 0)) / 10.0)::numeric, 1) AS calificacion,
            BOOL_OR(COALESCE(ap.completada, false)) AS completada
          FROM public.actividad_progreso ap
          GROUP BY
            ap.id_usuario,
            COALESCE(NULLIF(ap.actividad_titulo, ''), 'Actividad')
        ),
        actividad_resumen AS (
          SELECT
            id_usuario,
            ROUND(AVG(calificacion)::numeric, 1) AS promedio,
            COUNT(*)::int AS total_actividades,
            COUNT(*) FILTER (WHERE completada = true)::int AS actividades_completadas,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'titulo', titulo,
                'calificacion', calificacion,
                'completada', completada
              )
              ORDER BY titulo
            ) AS actividades
          FROM actividad_por_titulo
          GROUP BY id_usuario
        )
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          COALESCE(ga.id_grupo, 0) AS id_grupo,
          COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
          COALESCE(pa.progreso_general, 0)::int AS progreso,
          COALESCE(pa.estrellas_totales, 0)::int AS estrellas,
          ar.promedio,
          COALESCE(ar.total_actividades, 0)::int AS total_actividades,
          COALESCE(ar.actividades_completadas, 0)::int AS actividades_completadas,
          COALESCE(ar.actividades, '[]'::json) AS actividades
        FROM public.registro r
        LEFT JOIN grupos_alumno ga
          ON ga.id_alumno = r.id_usuario
        LEFT JOIN public.progreso_alumno pa
          ON pa.id_usuario = r.id_usuario
        LEFT JOIN actividad_resumen ar
          ON ar.id_usuario = r.id_usuario
        WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
          AND r.estado = true
          AND (
            $1 = ''
            OR LOWER(r.nombre_completo) LIKE LOWER($2)
            OR LOWER(r.correo) LIKE LOWER($2)
            OR LOWER(COALESCE(r.usuario, '')) LIKE LOWER($2)
          )
          AND (
            $3::bigint IS NULL
            OR ga.id_grupo = $3
          )
        ORDER BY r.nombre_completo ASC
        `,
        [buscar, `%${buscar}%`, idGrupo]
      );
    } else {
      alumnosResultado = await pool.query(
        `
        WITH grupos_alumno AS (
          SELECT DISTINCT ON (ga.id_alumno)
            ga.id_alumno,
            ga.id_grupo,
            g.nombre_grupo
          FROM public.grupo_alumnos ga
          INNER JOIN public.grupos g
            ON g.id_grupo = ga.id_grupo
          WHERE ga.estado = true
          ORDER BY ga.id_alumno, g.nombre_grupo ASC
        )
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          COALESCE(ga.id_grupo, 0) AS id_grupo,
          COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
          COALESCE(pa.progreso_general, 0)::int AS progreso,
          COALESCE(pa.estrellas_totales, 0)::int AS estrellas,
          NULL::numeric AS promedio,
          0::int AS total_actividades,
          0::int AS actividades_completadas,
          '[]'::json AS actividades
        FROM public.registro r
        LEFT JOIN grupos_alumno ga
          ON ga.id_alumno = r.id_usuario
        LEFT JOIN public.progreso_alumno pa
          ON pa.id_usuario = r.id_usuario
        WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
          AND r.estado = true
          AND (
            $1 = ''
            OR LOWER(r.nombre_completo) LIKE LOWER($2)
            OR LOWER(r.correo) LIKE LOWER($2)
            OR LOWER(COALESCE(r.usuario, '')) LIKE LOWER($2)
          )
          AND (
            $3::bigint IS NULL
            OR ga.id_grupo = $3
          )
        ORDER BY r.nombre_completo ASC
        `,
        [buscar, `%${buscar}%`, idGrupo]
      );
    }

    const alumnos = alumnosResultado.rows.map((alumno, index) => {
      const promedio =
        alumno.promedio !== null && alumno.promedio !== undefined
          ? Number(alumno.promedio)
          : null;

      const progreso = Number(alumno.progreso || 0);
      const totalActividades = Number(alumno.total_actividades || 0);
      const actividadesCompletadas = Number(alumno.actividades_completadas || 0);

      const actividades = Array.isArray(alumno.actividades)
        ? alumno.actividades
        : [];

      return {
        numero: index + 1,
        id_alumno: alumno.id_usuario,
        iniciales: obtenerIniciales(alumno.nombre_completo),
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        usuario: alumno.usuario,
        color: obtenerColor(alumno.id_usuario),
        id_grupo: Number(alumno.id_grupo || 0),
        grupo: alumno.grupo || "Sin grupo",
        promedio,
        progreso,
        estrellas: Number(alumno.estrellas || 0),
        total_actividades: totalActividades,
        actividades_completadas: actividadesCompletadas,
        actividades,
        estado: obtenerEstado({
          promedio,
          progreso,
          totalActividades,
        }),
      };
    });

    const resumen = calcularResumen(alumnos);
    const promedioPorActividad = calcularPromedioPorActividad(alumnos);

    const topAlumnos = [...alumnos]
      .sort((a, b) => {
        const promedioA = a.promedio ?? -1;
        const promedioB = b.promedio ?? -1;

        if (promedioB !== promedioA) return promedioB - promedioA;
        if (b.progreso !== a.progreso) return b.progreso - a.progreso;

        return b.estrellas - a.estrellas;
      })
      .slice(0, 5)
      .map((alumno, index) => ({
        lugar: index + 1,
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        grupo: alumno.grupo,
        promedio: alumno.promedio,
        progreso: alumno.progreso,
        estrellas: alumno.estrellas,
      }));

    return res.json({
      ok: true,
      grupos: gruposResultado.rows,
      alumnos,
      resumen,
      promedio_por_actividad: promedioPorActividad,
      top_alumnos: topAlumnos,
    });
  } catch (error) {
    console.error("Error al obtener calificaciones docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener las calificaciones.",
    });
  }
});

module.exports = router;