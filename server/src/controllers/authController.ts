import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const pool = require("../db");
import authService, { type RegisterData } from "../services/authService";

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

      const identificador = correo || email || usuario || correoUsuario;
      const passwordFinal = password || contrasena;

      if (!identificador || !passwordFinal) {
        res.status(400).json({
          ok: false,
          mensaje: "Correo/usuario y contraseña son obligatorios.",
        });
        return;
      }

      const usuarioEncontrado = await pool.query(
        `SELECT 
          id_usuario,
          nombre_completo,
          correo,
          usuario,
          password_hash,
          role_id,
          estado
        FROM public.registro
        WHERE correo = $1 OR usuario = $1
        LIMIT 1`,
        [identificador]
      );

      if (usuarioEncontrado.rows.length === 0) {
        res.status(401).json({
          ok: false,
          mensaje: "Credenciales incorrectas.",
        });
        return;
      }

      const usuarioDB = usuarioEncontrado.rows[0];

      if (!usuarioDB.estado) {
        res.status(403).json({
          ok: false,
          mensaje: "La cuenta está desactivada.",
        });
        return;
      }

      const passwordCorrecto = await bcrypt.compare(
        passwordFinal,
        usuarioDB.password_hash
      );

      if (!passwordCorrecto) {
        res.status(401).json({
          ok: false,
          mensaje: "Credenciales incorrectas.",
        });
        return;
      }

      const token = jwt.sign(
        {
          id_usuario: usuarioDB.id_usuario,
          correo: usuarioDB.correo,
          role_id: usuarioDB.role_id
        },
        process.env.JWT_SECRET || "mathnova_secret",
        {
          expiresIn: "2h",
        }
      );

      res.json({
        ok: true,
        mensaje: "Inicio de sesión correcto.",
        token,
        usuario: {
          id_usuario: usuarioDB.id_usuario,
          nombre_completo: usuarioDB.nombre_completo,
          correo: usuarioDB.correo,
          usuario: usuarioDB.usuario,
          role_id: usuarioDB.role_id,
        },
      });
    } catch (error: unknown) {
      console.error("Error en login controller:", error);

      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor.",
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