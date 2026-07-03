import bcrypt from 'bcryptjs';
import User from '../models/User';
import Estudiante from '../models/Estudiante';
import Teacher from '../models/Teacher';
import Admin from '../models/Admin';

export interface RegisterData {
  nombre_completo: string;
  correo_electronico: string;
  contrasena: string;
  role_id: number;
  grado_escolar?: string;
  especialidad?: string;
  permisos_administracion?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id_usuario: number;
    nombre_completo: string;
    correo_electronico: string;
    role_id: number;
    fecha_registro?: Date;
  };
}

class AuthService {
  async emailExists(correo_electronico: string): Promise<boolean> {
    const user = await User.findOne({ where: { correo_electronico } });
    return !!user;
  }

  async hashPassword(contrasena: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(contrasena, saltRounds);
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const sequelize = User.sequelize;
    
    if (!userData.nombre_completo || !userData.correo_electronico || !userData.contrasena || !userData.role_id) {
      return {
        success: false,
        message: 'Faltan campos obligatorios: nombre_completo, correo_electronico, contrasena, role_id',
      };
    }

    const rolesValidos = [1,2,3];
    if (!rolesValidos.includes(userData.role_id)) {
      return {
        success: false,
        message: 'Rol inválido. Debe ser: admin, profesor o estudiante',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.correo_electronico)) {
      return {
        success: false,
        message: 'Formato de correo electrónico inválido',
      };
    }

    if (userData.contrasena.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      };
    }

    const emailExistente = await this.emailExists(userData.correo_electronico);
    if (emailExistente) {
      return {
        success: false,
        message: 'El correo electrónico ya está registrado',
      };
    }

    const transaction = await sequelize!.transaction();

    try {
      const passwordHash = await this.hashPassword(userData.contrasena);

      const nuevoUsuario = await User.create(
        {
          nombre_completo: userData.nombre_completo,
          correo_electronico: userData.correo_electronico,
          contrasena: passwordHash,
          role_id: userData.role_id,
        },
        { transaction }
      );

      switch (userData.role_id) {fesor', 'estudiante'
        case 3: // Estudiant
          await Estudiante.create(
            {
              id_usuario: nuevoUsuario.id_usuario,
              grado_escolar: userData.grado_escolar || undefined,
            },
            { transaction }
          );
          break;

        case 2: // Profesor
          await Teacher.create(
            {
              id_usuario: nuevoUsuario.id_usuario,
              especialidad: userData.especialidad || undefined,
            },
            { transaction }
          );
          break;

        case 1: // Admin
          await Admin.create(
            {
              id_usuario: nuevoUsuario.id_usuario,
              permisos_administracion: userData.permisos_administracion || 'basico',
            },
            { transaction }
          );
          break;
      }

      await transaction.commit();

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          id_usuario: nuevoUsuario.id_usuario,
          nombre_completo: nuevoUsuario.nombre_completo,
          correo_electronico: nuevoUsuario.correo_electronico,
          role_id: nuevoUsuario.role_id,
          fecha_registro: nuevoUsuario.fecha_registro,
        },
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error en registro:', error);
      throw error;
    }
  }
}

export default new AuthService();