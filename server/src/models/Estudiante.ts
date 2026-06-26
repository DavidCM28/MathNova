import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EstudianteAttributes {
  id_estudiante: number;
  id_usuario: number;
  matricula?: string;
  id_grupo?: number;
  grado_escolar?: string;
  avatar?: string;
  id_nivel?: number;
  experiencia_acumulada?: number;
  estado_estudiante?: boolean;
}

export interface EstudianteCreationAttributes extends Optional<EstudianteAttributes, 'id_estudiante'> {}

export class Estudiante extends Model<EstudianteAttributes, EstudianteCreationAttributes> implements EstudianteAttributes {
  public id_estudiante!: number;
  public id_usuario!: number;
  public matricula!: string;
  public id_grupo!: number;
  public grado_escolar!: string;
  public avatar!: string;
  public id_nivel!: number;
  public experiencia_acumulada!: number;
  public estado_estudiante!: boolean;
}

Estudiante.init(
  {
    id_estudiante: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario',
      },
    },
    matricula: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    id_grupo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'grupo',
        key: 'id_grupo',
      },
    },
    grado_escolar: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'nivel',
        key: 'id_nivel',
      },
    },
    experiencia_acumulada: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    estado_estudiante: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'estudiante',
    timestamps: false,
  }
);

export default Estudiante;