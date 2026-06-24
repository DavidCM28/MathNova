import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TeacherAttributes {
  id_profesor: number;
  id_usuario: number;
  especialidad?: string;
  correo_institucional?: string;
  estado_profesor?: boolean;
}

export interface TeacherCreationAttributes extends Optional<TeacherAttributes, 'id_profesor'> {}

export class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> implements TeacherAttributes {
  public id_profesor!: number;
  public id_usuario!: number;
  public especialidad!: string;
  public correo_institucional!: string;
  public estado_profesor!: boolean;
}

Teacher.init(
  {
    id_profesor: {
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
    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    correo_institucional: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado_profesor: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'profesor',
    timestamps: false,
  }
);

export default Teacher;