import { Router, Request, Response } from "express";

type QueryResult<T> = {
  rows: T[];
  rowCount?: number;
};

const pool = require("../db") as {
  query: <T = any>(sql: string, params?: unknown[]) => Promise<QueryResult<T>>;
};

const router = Router();

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function obtenerColor(idUsuario: number) {
  const colores = [
    "blue",
    "purple",
    "orange",
    "gray",
    "silver",
    "green",
    "yellow",
    "violet",
  ];

  return colores[idUsuario % colores.length];
}

function obtenerIdGrupo(valor: unknown) {
  if (!valor || valor === "todos") return null;

  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function obtenerEstado(promedio: number | null, actividades: number) {
  if (actividades <= 0 || promedio === null) {
    return {
      texto: "Sin progreso",
      clase: "pendiente",
    };
  }

  if (promedio >= 9) {
    return {
      texto: "Excelente",
      clase: "excelente",
    };
  }

  if (promedio >= 7) {
    return {
      texto: "Bien",
      clase: "bien",
    };
  }

  return {
    texto: "En riesgo",
    clase: "alerta",
  };
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const idGrupo = obtenerIdGrupo(req.query.grupo);

    const gruposResultado = await pool.query<{
      id_grupo: number;
      nombre_grupo: string;
      total_alumnos: number;
    }>(`
      SELECT
        g.id_grupo,
        g.nombre_grupo,
        COUNT(DISTINCT ga.id_alumno)::int AS total_alumnos
      FROM public.grupos g
      LEFT JOIN public.grupo_alumnos ga
        ON ga.id_grupo = g.id_grupo
        AND ga.estado = true
      GROUP BY g.id_grupo, g.nombre_grupo
      ORDER BY g.nombre_grupo ASC;
    `);

    const alumnosResultado = await pool.query<{
      id_usuario: number;
      nombre_completo: string;
      correo: string;
      usuario: string | null;
      id_grupo: number | null;
      grupo: string;
      actividades_intentadas: number | null;
      actividades_completadas: number | null;
      promedio_precision: number | null;
      estrellas: number | null;
      ultimo_modulo: string | null;
    }>(
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
        ORDER BY ga.id_alumno, ga.id_grupo DESC
      ),
      progreso_resumen AS (
        SELECT
          ap.id_usuario,
          COUNT(*)::int AS actividades_intentadas,
          COUNT(*) FILTER (WHERE ap.completada = true)::int AS actividades_completadas,
          COALESCE(ROUND(AVG(COALESCE(ap.precision, 0))::numeric, 1), 0)::float AS promedio_precision,
          COALESCE(SUM(COALESCE(ap.estrellas_obtenidas, 0)), 0)::int AS estrellas
        FROM public.actividad_progreso ap
        GROUP BY ap.id_usuario
      ),
      ultimo_modulo AS (
        SELECT DISTINCT ON (ap.id_usuario)
          ap.id_usuario,
          ap.actividad_titulo
        FROM public.actividad_progreso ap
        ORDER BY ap.id_usuario, ap.fecha_ultimo_intento DESC
      )
      SELECT
        r.id_usuario,
        r.nombre_completo,
        r.correo,
        r.usuario,
        ga.id_grupo,
        COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
        COALESCE(pr.actividades_intentadas, 0)::int AS actividades_intentadas,
        COALESCE(pr.actividades_completadas, 0)::int AS actividades_completadas,
        pr.promedio_precision,
        COALESCE(pr.estrellas, 0)::int AS estrellas,
        um.actividad_titulo AS ultimo_modulo
      FROM public.registro r
      LEFT JOIN grupos_alumno ga
        ON ga.id_alumno = r.id_usuario
      LEFT JOIN progreso_resumen pr
        ON pr.id_usuario = r.id_usuario
      LEFT JOIN ultimo_modulo um
        ON um.id_usuario = r.id_usuario
      WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
        AND r.estado = true
        AND (
          $1::bigint IS NULL
          OR ga.id_grupo = $1::bigint
        )
      ORDER BY r.nombre_completo ASC;
      `,
      [idGrupo]
    );

    const actividadesResultado = await pool.query<{
      actividad_titulo: string;
      promedio: number;
      completadas: number;
    }>(
      `
      WITH grupos_alumno AS (
        SELECT DISTINCT ON (ga.id_alumno)
          ga.id_alumno,
          ga.id_grupo
        FROM public.grupo_alumnos ga
        WHERE ga.estado = true
        ORDER BY ga.id_alumno, ga.id_grupo DESC
      )
      SELECT
        ap.actividad_titulo,
        ROUND((AVG(COALESCE(ap.precision, 0)) / 10)::numeric, 1)::float AS promedio,
        COUNT(*) FILTER (WHERE ap.completada = true)::int AS completadas
      FROM public.actividad_progreso ap
      INNER JOIN public.registro r
        ON r.id_usuario = ap.id_usuario
      LEFT JOIN grupos_alumno ga
        ON ga.id_alumno = r.id_usuario
      WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
        AND r.estado = true
        AND (
          $1::bigint IS NULL
          OR ga.id_grupo = $1::bigint
        )
      GROUP BY ap.actividad_titulo
      ORDER BY completadas DESC, promedio DESC, ap.actividad_titulo ASC
      LIMIT 4;
      `,
      [idGrupo]
    );

    const alumnos = alumnosResultado.rows.map((alumno) => {
      const actividadesIntentadas = Number(alumno.actividades_intentadas || 0);
      const actividadesCompletadas = Number(alumno.actividades_completadas || 0);

      const promedio =
        actividadesIntentadas > 0 && alumno.promedio_precision !== null
          ? Number((Number(alumno.promedio_precision) / 10).toFixed(1))
          : null;

      const estado = obtenerEstado(promedio, actividadesIntentadas);

      return {
        id: Number(alumno.id_usuario),
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        usuario: alumno.usuario,
        iniciales: obtenerIniciales(alumno.nombre_completo),
        color: obtenerColor(Number(alumno.id_usuario)),
        id_grupo: alumno.id_grupo,
        grupo: alumno.grupo || "Sin grupo",
        ultimo_modulo: alumno.ultimo_modulo || "Sin actividades",
        actividades_intentadas: actividadesIntentadas,
        actividades_completadas: actividadesCompletadas,
        promedio,
        estrellas: Number(alumno.estrellas || 0),
        estado: estado.texto,
        estado_clase: estado.clase,
      };
    });

    const alumnosConPromedio = alumnos.filter(
      (alumno) => alumno.promedio !== null
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

    const topAlumnos = [...alumnosConPromedio]
      .sort((a, b) => Number(b.promedio) - Number(a.promedio))
      .slice(0, 5);

    const mejorAlumno = topAlumnos[0] || null;

    return res.json({
      ok: true,
      grupos: gruposResultado.rows,
      alumnos,
      promedio_por_actividad: actividadesResultado.rows,
      top_alumnos: topAlumnos,
      resumen: {
        total_alumnos: alumnos.length,
        alumnos_con_progreso: alumnosConPromedio.length,
        alumnos_sin_progreso: alumnos.length - alumnosConPromedio.length,
        promedio_general: promedioGeneral,
        mejor_promedio: mejorAlumno?.promedio ?? null,
        mejor_alumno: mejorAlumno?.nombre ?? null,
      },
    });
  } catch (error) {
    console.error("Error al obtener calificaciones docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron cargar las calificaciones.",
    });
  }
});

export default router;