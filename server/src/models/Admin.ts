import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AdminAttributes {
  id_administrador: number;
  id_usuario: number;
  permisos_administracion?: string;
  fecha_alta?: Date;
}

export interface AdminCreationAttributes extends Optional<AdminAttributes, 'id_administrador'> {}

export class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id_administrador!: number;
  public id_usuario!: number;
  public permisos_administracion!: string;
  public fecha_alta!: Date;
}

Admin.init(
  {
    id_administrador: {
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
    permisos_administracion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_alta: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'administrador',
    timestamps: false,
  }
);

export default Admin;