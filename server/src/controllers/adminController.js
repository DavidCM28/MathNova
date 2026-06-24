const pool = require("../db");
const bcrypt = require("bcryptjs");

const existeTabla = async (nombreTabla) => {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) AS existe`,
    [nombreTabla]
  );

  return result.rows[0].existe;
};

const obtenerDashboardAdmin = async (req, res) => {
  try {
    const usuariosResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM public.registro"
    );

    const docentesResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM public.registro WHERE rol = 'docente' AND estado = true"
    );

    const alumnosResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM public.registro WHERE rol = 'estudiante' AND estado = true"
    );

    const loginsResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM public.login"
    );

    let gruposActivos = 0;
    let alertasPendientes = 0;

    if (await existeTabla("grupos")) {
      const gruposResult = await pool.query(
        "SELECT COUNT(*)::int AS total FROM public.grupos WHERE estado = true"
      );

      gruposActivos = gruposResult.rows[0].total;
    }

    if (await existeTabla("solicitudes")) {
      const solicitudesResult = await pool.query(
        "SELECT COUNT(*)::int AS total FROM public.solicitudes WHERE estado = 'pendiente'"
      );

      alertasPendientes = solicitudesResult.rows[0].total;
    }

    res.json({
      ok: true,
      dashboard: {
        tarjetas: {
          usuarios_totales: usuariosResult.rows[0].total,
          docentes_activos: docentesResult.rows[0].total,
          alumnos_activos: alumnosResult.rows[0].total,
          grupos_activos: gruposActivos,
          alertas_pendientes: alertasPendientes,
          inicios_sesion: loginsResult.rows[0].total,
        },
        rendimiento_academico: {
          porcentaje_general: 87,
          descripcion: "Buen desempeño general",
          aprobacion: 87,
          participacion: 78,
          tareas_entregadas: 92,
        },
        proximas_acciones: [
          {
            id: 1,
            titulo: "Revisar solicitudes de acceso",
            descripcion: "Solicitudes pendientes de revisión",
            fecha: "24 May 2024",
            hora: "10:00 AM",
          },
          {
            id: 2,
            titulo: "Validar evaluaciones programadas",
            descripcion: "Evaluaciones por validar",
            fecha: "27 May 2024",
            hora: "02:00 PM",
          },
          {
            id: 3,
            titulo: "Generar reporte mensual",
            descripcion: "Rendimiento y uso de la plataforma",
            fecha: "30 May 2024",
            hora: "09:00 AM",
          },
        ],
        modulos_clave: [
          {
            id: 1,
            titulo: "Usuarios",
            descripcion: "Gestiona usuarios y permisos",
            ruta: "/admin/usuarios",
          },
          {
            id: 2,
            titulo: "Cursos",
            descripcion: "Administra grupos y cursos",
            ruta: "/admin/grupos",
          },
          {
            id: 3,
            titulo: "Reportes",
            descripcion: "Analiza datos y rendimiento",
            ruta: "/admin/reportes",
          },
        ],
        avisos_sistema: [
          "Se realizará mantenimiento programado próximamente.",
          "La importación masiva de usuarios ya está disponible.",
          "Recuerda actualizar los permisos de fin de ciclo escolar.",
        ],
      },
    });
  } catch (error) {
    console.error("Error al obtener dashboard administrador:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

const obtenerUsuariosAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id_usuario,
        nombre_completo,
        correo,
        usuario,
        rol,
        estado,
        acepto_terminos,
        fecha_registro
      FROM public.registro
      ORDER BY id_usuario DESC`
    );

    res.json({
      ok: true,
      usuarios: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

const crearUsuarioAdmin = async (req, res) => {
  try {
    const {
      nombre_completo,
      correo,
      usuario,
      password,
      rol = "estudiante",
    } = req.body;

    if (!nombre_completo || !correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, correo y contraseña son obligatorios",
      });
    }

    const rolesPermitidos = ["estudiante", "docente", "admin"];

    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Rol no válido",
      });
    }

    const correoLimpio = correo.trim().toLowerCase();
    const usuarioLimpio = usuario && usuario.trim() !== "" ? usuario.trim() : null;
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO public.registro 
        (nombre_completo, correo, usuario, password_hash, rol, estado, acepto_terminos)
      VALUES ($1, $2, $3, $4, $5, true, true)
      RETURNING 
        id_usuario,
        nombre_completo,
        correo,
        usuario,
        rol,
        estado,
        acepto_terminos,
        fecha_registro`,
      [
        nombre_completo.trim(),
        correoLimpio,
        usuarioLimpio,
        password_hash,
        rol,
      ]
    );

    res.status(201).json({
      ok: true,
      mensaje: "Usuario creado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear usuario:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        mensaje: "El correo o usuario ya está registrado",
      });
    }

    res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor",
    });
  }
};

module.exports = {
  obtenerDashboardAdmin,
  obtenerUsuariosAdmin,
  crearUsuarioAdmin,
};