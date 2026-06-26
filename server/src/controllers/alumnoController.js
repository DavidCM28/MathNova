const pool = require("../db");

const formatearTiempo = (segundos) => {
  const minutosTotales = Math.floor(segundos / 60);
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;

  if (horas <= 0) {
    return `${minutos}m`;
  }

  return `${horas}h ${minutos}m`;
};

const obtenerPerfilAlumno = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const usuarioResult = await pool.query(
      `SELECT 
        id_usuario,
        nombre_completo,
        correo,
        usuario,
        rol,
        estado,
        fecha_registro
      FROM public.registro
      WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Alumno no encontrado",
      });
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(a.id)::int AS total_actividades,
        COUNT(p.id) FILTER (WHERE p.estado = 'completada')::int AS completadas,
        COUNT(p.id) FILTER (WHERE p.estado = 'en_curso')::int AS en_curso,
        COALESCE(ROUND(AVG(p.puntaje) FILTER (WHERE p.estado = 'completada')), 0)::int AS promedio,
        COALESCE(SUM(p.tiempo_segundos), 0)::int AS tiempo_total,
        ROUND(
          CASE 
            WHEN COUNT(a.id) = 0 THEN 0
            ELSE COUNT(p.id) FILTER (WHERE p.estado = 'completada') * 100.0 / COUNT(a.id)
          END
        )::int AS progreso_general
      FROM public.actividades a
      LEFT JOIN public.progreso_alumno p
        ON p.actividad_id = a.id
        AND p.alumno_id = $1`,
      [idUsuario]
    );

    const usuario = usuarioResult.rows[0];
    const stats = statsResult.rows[0];

    const nivel = Math.floor(stats.completadas / 3) + 1;
    const estrellasTotales = stats.completadas * 25 + stats.promedio;

    res.json({
      ok: true,
      alumno: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        usuario: usuario.usuario,
        rol: usuario.rol,
        estado: usuario.estado,
        miembro_desde: usuario.fecha_registro,
        grado: "Secundaria",
        escuela: "MathNova Academy",
        nivel,
        titulo:
          nivel >= 5
            ? "Maestro Nova"
            : nivel >= 3
            ? "Explorador Matemático"
            : "Aprendiz Nova",
        estrellas_totales: estrellasTotales,
        racha_actual: stats.completadas,
        lecciones_completadas: stats.completadas,
        tiempo_estudio_segundos: stats.tiempo_total,
        tiempo_estudio: formatearTiempo(stats.tiempo_total),
        progreso_general: stats.progreso_general,
        promedio: stats.promedio,
        total_actividades: stats.total_actividades,
        actividades_en_curso: stats.en_curso,
        mundos_completados: [
          {
            id: 1,
            nombre: "MathNumbers",
            completado: stats.progreso_general >= 30,
          },
          {
            id: 2,
            nombre: "MathGeometry",
            completado: stats.progreso_general >= 60,
          },
          {
            id: 3,
            nombre: "MathData",
            completado: stats.progreso_general >= 90,
          },
        ],
        insignias: [
          {
            id: 1,
            nombre: "Primeros Pasos",
            estado: stats.completadas >= 1 ? "Completada" : "Bloqueada",
          },
          {
            id: 2,
            nombre: "Explorador",
            estado: estrellasTotales >= 100 ? "Completada" : "Bloqueada",
          },
          {
            id: 3,
            nombre: "Cálculo Ágil",
            estado: stats.progreso_general >= 50 ? "Completada" : "Bloqueada",
          },
          {
            id: 4,
            nombre: "Constancia",
            estado: stats.completadas >= 5 ? "Nivel 2" : "Nivel 1",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil del alumno:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

const obtenerProgresoAlumno = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const result = await pool.query(
      `SELECT 
        a.id,
        a.titulo,
        a.modulo,
        a.tema,
        a.dificultad,
        a.duracion_min,
        COALESCE(p.estado, 'pendiente') AS estado,
        COALESCE(p.porcentaje, 0) AS porcentaje,
        COALESCE(p.puntaje, 0) AS puntaje,
        COALESCE(p.intentos, 0) AS intentos,
        COALESCE(p.tiempo_segundos, 0) AS tiempo_segundos,
        p.updated_at
      FROM public.actividades a
      LEFT JOIN public.progreso_alumno p
        ON p.actividad_id = a.id
        AND p.alumno_id = $1
      ORDER BY COALESCE(p.updated_at, '1900-01-01') DESC, a.id ASC`,
      [idUsuario]
    );

    res.json({
      ok: true,
      actividades: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener progreso del alumno:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

const obtenerEstadisticasAlumno = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const result = await pool.query(
      `SELECT
        COUNT(a.id)::int AS total_actividades,
        COUNT(p.id) FILTER (WHERE p.estado = 'completada')::int AS completadas,
        COUNT(p.id) FILTER (WHERE p.estado = 'en_curso')::int AS en_curso,
        COUNT(a.id)::int - COUNT(p.id) FILTER (WHERE p.estado IN ('completada', 'en_curso'))::int AS pendientes,
        COALESCE(ROUND(AVG(p.puntaje) FILTER (WHERE p.estado = 'completada')), 0)::int AS promedio,
        COALESCE(SUM(p.tiempo_segundos), 0)::int AS tiempo_total,
        ROUND(
          CASE 
            WHEN COUNT(a.id) = 0 THEN 0
            ELSE COUNT(p.id) FILTER (WHERE p.estado = 'completada') * 100.0 / COUNT(a.id)
          END
        )::int AS progreso_general
      FROM public.actividades a
      LEFT JOIN public.progreso_alumno p
        ON p.actividad_id = a.id
        AND p.alumno_id = $1`,
      [idUsuario]
    );

    const estadisticas = result.rows[0];

    res.json({
      ok: true,
      estadisticas: {
        ...estadisticas,
        nivel: Math.floor(estadisticas.completadas / 3) + 1,
        tiempo_formateado: formatearTiempo(estadisticas.tiempo_total),
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del alumno:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

const guardarProgresoActividad = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const { actividad_id, estado, porcentaje, puntaje, tiempo_segundos } =
      req.body;

    if (!actividad_id || !estado) {
      return res.status(400).json({
        ok: false,
        mensaje: "La actividad y el estado son obligatorios",
      });
    }

    const estadosPermitidos = ["pendiente", "en_curso", "completada"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Estado no válido",
      });
    }

    const actividadExiste = await pool.query(
      `SELECT id FROM public.actividades WHERE id = $1`,
      [actividad_id]
    );

    if (actividadExiste.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "La actividad no existe",
      });
    }

    const result = await pool.query(
      `INSERT INTO public.progreso_alumno
        (alumno_id, actividad_id, estado, porcentaje, puntaje, intentos, tiempo_segundos, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, 1, $6, NOW())
      ON CONFLICT (alumno_id, actividad_id)
      DO UPDATE SET
        estado = EXCLUDED.estado,
        porcentaje = EXCLUDED.porcentaje,
        puntaje = EXCLUDED.puntaje,
        intentos = public.progreso_alumno.intentos + 1,
        tiempo_segundos = public.progreso_alumno.tiempo_segundos + EXCLUDED.tiempo_segundos,
        updated_at = NOW()
      RETURNING *`,
      [
        idUsuario,
        actividad_id,
        estado,
        porcentaje ?? 0,
        puntaje ?? 0,
        tiempo_segundos ?? 0,
      ]
    );

    res.json({
      ok: true,
      mensaje: "Progreso guardado correctamente",
      progreso: result.rows[0],
    });
  } catch (error) {
    console.error("Error al guardar progreso del alumno:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

module.exports = {
  obtenerPerfilAlumno,
  obtenerProgresoAlumno,
  obtenerEstadisticasAlumno,
  guardarProgresoActividad,
};