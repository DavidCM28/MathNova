import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadSensorAttributes {
  id: number;
  id_estudiante: number;
  valores_absoluta: object;
  intentos_absoluta: object;
  valores_relativa: object;
  intentos_relativa: object;
  pregunta_senal_frecuente: string | null;
  intentos_pregunta_senal: number;
  pregunta_zona_origen: string | null;
  intentos_pregunta_zona: number;
  veces_pista_p4: number;
  veces_pista_p6: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadSensorCreationAttributes
  extends Optional<ActividadSensorAttributes, 'id'> {}

export class ActividadSensor
  extends Model<ActividadSensorAttributes, ActividadSensorCreationAttributes>
  implements ActividadSensorAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare valores_absoluta: object;
  declare intentos_absoluta: object;
  declare valores_relativa: object;
  declare intentos_relativa: object;
  declare pregunta_senal_frecuente: string | null;
  declare intentos_pregunta_senal: number;
  declare pregunta_zona_origen: string | null;
  declare intentos_pregunta_zona: number;
  declare veces_pista_p4: number;
  declare veces_pista_p6: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadSensor.init(
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
        model: 'registro',
        key: 'id_usuario',
      },
    },
    valores_absoluta: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    intentos_absoluta: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    valores_relativa: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    intentos_relativa: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    pregunta_senal_frecuente: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    intentos_pregunta_senal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pregunta_zona_origen: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    intentos_pregunta_zona: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_p4: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_p6: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resultado_correcto: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    historial_intentos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'actividad_sensor',
    timestamps: true,
  }
);

export default ActividadSensor;