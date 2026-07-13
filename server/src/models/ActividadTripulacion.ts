import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadTripulacionAttributes {
  id: number;
  id_estudiante: number;
  valores_tabla: object;
  intentos_tabla: object;
  modulo_seleccionado: string | null;
  intentos_modulo: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadTripulacionCreationAttributes
  extends Optional<ActividadTripulacionAttributes, 'id'> {}

export class ActividadTripulacion
  extends Model<ActividadTripulacionAttributes, ActividadTripulacionCreationAttributes>
  implements ActividadTripulacionAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare valores_tabla: object;
  declare intentos_tabla: object;
  declare modulo_seleccionado: string | null;
  declare intentos_modulo: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadTripulacion.init(
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
    modulo_seleccionado: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    intentos_modulo: {
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
    tableName: 'actividad_tripulacion',
    timestamps: true,
  }
);

export default ActividadTripulacion;