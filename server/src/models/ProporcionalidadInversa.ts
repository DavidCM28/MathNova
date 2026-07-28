import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProporcionalidadInversaAttributes {
  id: number;
  id_estudiante: number;
  valores_tabla: object;
  intentos_tabla: object;
  celdas_asistidas: object;
  prediccion: number | null;
  prediccion_correcta: boolean | null;
  prediccion_asistida: boolean;
  pantalla_actual: number;
  completada: boolean;
  tiempo_total: number;
  xp_obtenido: number;
  intentos_completados: number;
  historial_intentos: object[];
}

export interface ProporcionalidadInversaCreationAttributes
  extends Optional<ProporcionalidadInversaAttributes, 'id'> {}

export class ProporcionalidadInversa
  extends Model<ProporcionalidadInversaAttributes, ProporcionalidadInversaCreationAttributes>
  implements ProporcionalidadInversaAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare valores_tabla: object;
  declare intentos_tabla: object;
  declare celdas_asistidas: object;
  declare prediccion: number | null;
  declare prediccion_correcta: boolean | null;
  declare prediccion_asistida: boolean;
  declare pantalla_actual: number;
  declare completada: boolean;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare intentos_completados: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
        model: 'registro', // ✅ CAMBIADO: antes era 'usuario'
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
    celdas_asistidas: {
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
    prediccion_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    // ✅ NUEVO: para el sistema de reinicio de actividad
    intentos_completados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    historial_intentos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'actividad_proporcionalidad',
    timestamps: true,
  }
);

export default ProporcionalidadInversa;