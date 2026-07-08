import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const pool = require("../db");
import authService, { type RegisterData } from "../services/authService";

type UsuarioDB = {
  id_usuario: number | string;
  nombre_completo?: string;
  correo?: string;
  usuario?: string | null;
  password_hash?: string;
  password?: string;
  contrasena?: string;
  role_id?: number | string | null;
  rol?: string | null;
  estado?: boolean | null;
};

const obtenerJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en el archivo .env");
  }

  return String(secret).trim();
};

const normalizarRol = (rol?: string | null, roleId?: number | string | null) => {
  const valor = String(rol || "").toLowerCase().trim();

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  const id = Number(roleId);

  if (id === 1) return "docente";
  if (id === 2) return "estudiante";
  if (id === 3) return "admin";

  return "estudiante";
};

const buscarUsuario = async (identificador: string) => {
  const limpio = identificador.trim().toLowerCase();

  const result = await pool.query(
    `SELECT *
     FROM public.usuario
     WHERE LOWER(correo) = $1
        OR LOWER(usuario) = $1
     LIMIT 1`,
    [limpio]
  );

  return result.rows[0] as UsuarioDB | undefined;
};

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterData = req.body;

      const result = await authService.register(userData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error: unknown) {
      console.error("Error en register controller:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { correo, email, usuario, correoUsuario, password, contrasena } =
        req.body;

      const identificador = String(
        correo || email || usuario || correoUsuario || ""
      ).trim();

      const passwordFinal = String(password || contrasena || "");

      if (!identificador || !passwordFinal) {
        res.status(400).json({
          ok: false,
          mensaje: "Correo/usuario y contraseña son obligatorios.",
        });
        return;
      }

      const usuarioDB = await buscarUsuario(identificador);

      if (!usuarioDB) {
        res.status(401).json({
          ok: false,
          mensaje: "Credenciales incorrectas.",
        });
        return;
      }

      if (usuarioDB.estado === false) {
        res.status(403).json({
          ok: false,
          mensaje: "La cuenta está desactivada.",
        });
        return;
      }

      const passwordHash =
        usuarioDB.password_hash || usuarioDB.password || usuarioDB.contrasena;

      if (!passwordHash) {
        console.error("Usuario sin password_hash:", usuarioDB.id_usuario);

        res.status(500).json({
          ok: false,
          mensaje: "El usuario no tiene contraseña registrada correctamente.",
        });
        return;
      }

      const passwordCorrecto = await bcrypt.compare(
        passwordFinal,
        passwordHash
      );

      if (!passwordCorrecto) {
        res.status(401).json({
          ok: false,
          mensaje: "Credenciales incorrectas.",
        });
        return;
      }

      const rol = normalizarRol(usuarioDB.rol, usuarioDB.role_id);
      const jwtSecret = obtenerJwtSecret();

      const token = jwt.sign(
        {
          id_usuario: usuarioDB.id_usuario,
          correo: usuarioDB.correo,
          rol,
          role_id: usuarioDB.role_id ?? null,
        },
        jwtSecret,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        ok: true,
        success: true,
        mensaje: "Inicio de sesión correcto.",
        message: "Inicio de sesión correcto.",
        token,
        usuario: {
          id_usuario: usuarioDB.id_usuario,
          nombre_completo: usuarioDB.nombre_completo,
          correo: usuarioDB.correo,
          usuario: usuarioDB.usuario,
          rol,
          role_id: usuarioDB.role_id ?? null,
        },
      });
    } catch (error: unknown) {
      console.error("Error en login controller:", error);

      res.status(500).json({
        ok: false,
        success: false,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error interno del servidor.",
      });
    }
  }

  async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        res.status(400).json({
          success: false,
          message: "Email es requerido",
        });
        return;
      }

      const exists = await authService.emailExists(email.trim().toLowerCase());

      res.status(200).json({
        success: true,
        exists,
      });
    } catch (error: unknown) {
      console.error("Error en checkEmail:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

export default new AuthController();