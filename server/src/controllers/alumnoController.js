const pool = require("../db");

const formatearTiempo = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (horas <= 0) {
    return `${mins}m`;
  }

  return `${horas}h ${mins}m`;
};

const obtenerPerfilAlumno = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario es obligatorio",
      });
    }

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
      [id_usuario]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Alumno no encontrado",
      });
    }

    await pool.query(
      `INSERT INTO public.progreso_alumno (id_usuario)
       VALUES ($1)
       ON CONFLICT (id_usuario) DO NOTHING`,
      [id_usuario]
    );

    const progresoResult = await pool.query(
      `SELECT 
        nivel,
        titulo,
        estrellas_totales,
        racha_actual,
        lecciones_completadas,
        tiempo_estudio_minutos,
        progreso_general,
        grado,
        escuela,
        fecha_actualizacion
      FROM public.progreso_alumno
      WHERE id_usuario = $1`,
      [id_usuario]
    );

    const usuario = usuarioResult.rows[0];
    const progreso = progresoResult.rows[0];

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
        grado: progreso.grado,
        escuela: progreso.escuela,
        nivel: progreso.nivel,
        titulo: progreso.titulo,
        estrellas_totales: progreso.estrellas_totales,
        racha_actual: progreso.racha_actual,
        lecciones_completadas: progreso.lecciones_completadas,
        tiempo_estudio_minutos: progreso.tiempo_estudio_minutos,
        tiempo_estudio: formatearTiempo(progreso.tiempo_estudio_minutos),
        progreso_general: progreso.progreso_general,
        mundos_completados: [
          {
            id: 1,
            nombre: "MathNumbers",
            completado: progreso.progreso_general >= 30,
          },
          {
            id: 2,
            nombre: "MathGeometry",
            completado: progreso.progreso_general >= 60,
          },
          {
            id: 3,
            nombre: "MathData",
            completado: progreso.progreso_general >= 90,
          },
        ],
        insignias: [
          {
            id: 1,
            nombre: "Primeros Pasos",
            estado: progreso.lecciones_completadas >= 1 ? "Completada" : "Bloqueada",
          },
          {
            id: 2,
            nombre: "Explorador",
            estado: progreso.estrellas_totales >= 100 ? "Completada" : "Bloqueada",
          },
          {
            id: 3,
            nombre: "Cálculo Ágil",
            estado: progreso.progreso_general >= 50 ? "Completada" : "Bloqueada",
          },
          {
            id: 4,
            nombre: "Constancia",
            estado: progreso.racha_actual >= 5 ? "Nivel 2" : "Nivel 1",
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

const actualizarProgresoAlumno = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const {
      nivel,
      titulo,
      estrellas_totales,
      racha_actual,
      lecciones_completadas,
      tiempo_estudio_minutos,
      progreso_general,
      grado,
      escuela,
    } = req.body;

    await pool.query(
      `INSERT INTO public.progreso_alumno (id_usuario)
       VALUES ($1)
       ON CONFLICT (id_usuario) DO NOTHING`,
      [id_usuario]
    );

    const result = await pool.query(
      `UPDATE public.progreso_alumno
       SET
        nivel = COALESCE($1, nivel),
        titulo = COALESCE($2, titulo),
        estrellas_totales = COALESCE($3, estrellas_totales),
        racha_actual = COALESCE($4, racha_actual),
        lecciones_completadas = COALESCE($5, lecciones_completadas),
        tiempo_estudio_minutos = COALESCE($6, tiempo_estudio_minutos),
        progreso_general = COALESCE($7, progreso_general),
        grado = COALESCE($8, grado),
        escuela = COALESCE($9, escuela),
        fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $10
       RETURNING *`,
      [
        nivel,
        titulo,
        estrellas_totales,
        racha_actual,
        lecciones_completadas,
        tiempo_estudio_minutos,
        progreso_general,
        grado,
        escuela,
        id_usuario,
      ]
    );

    res.json({
      ok: true,
      mensaje: "Progreso actualizado correctamente",
      progreso: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar progreso del alumno:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

module.exports = {
  obtenerPerfilAlumno,
  actualizarProgresoAlumno,
};