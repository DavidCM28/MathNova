import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProporcionalidadInversaAttributes {
  id: number;
  id_estudiante: number;
  valores_tabla: object;
  intentos_tabla: object;
  prediccion: number | null;
  prediccion_correcta: boolean | null;
  pantalla_actual: number;
  completada: boolean;
  tiempo_total: number;
  xp_obtenido: number;
}

export interface ProporcionalidadInversaCreationAttributes
  extends Optional<ProporcionalidadInversaAttributes, 'id'> {}

export class ProporcionalidadInversa
  extends Model<ProporcionalidadInversaAttributes, ProporcionalidadInversaCreationAttributes>
  implements ProporcionalidadInversaAttributes
{
  public id!: number;
  public id_estudiante!: number;
  public valores_tabla!: object;
  public intentos_tabla!: object;
  public prediccion!: number | null;
  public prediccion_correcta!: boolean | null;
  public pantalla_actual!: number;
  public completada!: boolean;
  public tiempo_total!: number;
  public xp_obtenido!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProporcionalidadInversa.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_estudiante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario',
      },
    },
    valores_tabla: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    intentos_tabla: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    prediccion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prediccion_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    pantalla_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    completada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tiempo_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    xp_obtenido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'actividad_proporcionalidad',
    timestamps: true,
  }
);

export default ProporcionalidadInversa;