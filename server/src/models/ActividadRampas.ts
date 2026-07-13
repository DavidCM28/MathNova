import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadRampasAttributes {
  id: number;
  id_estudiante: number;
  pendiente_ascenso: string | null;
  pendiente_descenso: string | null;
  ecuacion_ascenso: string | null;
  ecuacion_descenso: string | null;
  bitacora_pendiente_ascenso: string | null;
  bitacora_ecuacion_ascenso: string | null;
  bitacora_pendiente_descenso: string | null;
  bitacora_ecuacion_descenso: string | null;
  error_signo_descenso: boolean;
  intentos_verificacion: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadRampasCreationAttributes
  extends Optional<ActividadRampasAttributes, 'id'> {}

export class ActividadRampas
  extends Model<ActividadRampasAttributes, ActividadRampasCreationAttributes>
  implements ActividadRampasAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare pendiente_ascenso: string | null;
  declare pendiente_descenso: string | null;
  declare ecuacion_ascenso: string | null;
  declare ecuacion_descenso: string | null;
  declare bitacora_pendiente_ascenso: string | null;
  declare bitacora_ecuacion_ascenso: string | null;
  declare bitacora_pendiente_descenso: string | null;
  declare bitacora_ecuacion_descenso: string | null;
  declare error_signo_descenso: boolean;
  declare intentos_verificacion: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadRampas.init(
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
    pendiente_ascenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pendiente_descenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ecuacion_ascenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ecuacion_descenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    bitacora_pendiente_ascenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    bitacora_ecuacion_ascenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    bitacora_pendiente_descenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    bitacora_ecuacion_descenso: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    error_signo_descenso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    intentos_verificacion: {
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
    tableName: 'actividad_rampas',
    timestamps: true,
  }
);

export default ActividadRampas;