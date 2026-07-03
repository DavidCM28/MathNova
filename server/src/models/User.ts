import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface UserAttributes {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  contrasena: string;
  role_id: number;
  fecha_registro?: Date;
  estado_cuenta?: boolean;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id_usuario'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id_usuario!: number;
  public nombre_completo!: string;
  public correo_electronico!: string;
  public contrasena!: string;
  public role_id!: number;
  public fecha_registro!: Date;
  public estado_cuenta!: boolean;
}

User.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_completo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo_electronico: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado_cuenta: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'usuario',
    timestamps: false,
  }
);

export default User;