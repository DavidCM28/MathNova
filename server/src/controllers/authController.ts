import { Request, Response } from 'express';
import authService from '../services/authService';
import { RegisterData } from '../services/authService';

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

    } catch (error) {
      console.error('Error en register controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email es requerido',
        });
        return;
      }

      const exists = await authService.emailExists(email);
      
      res.status(200).json({
        success: true,
        exists,
      });

    } catch (error) {
      console.error('Error en checkEmail:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}

export default new AuthController();