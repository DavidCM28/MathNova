import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadHologramaAttributes {
  id: number;
  id_estudiante: number;
  valores_barras: object;
  intentos_barras: object;
  valores_porcentajes: object;
  intentos_porcentajes: object;
  tipo_grafica_seleccionado: string | null;
  intentos_tipo_grafica: number;
  pregunta_barra_alta: string | null;
  intentos_pregunta_barra: number;
  pregunta_sector_mayor: string | null;
  intentos_pregunta_sector: number;
  veces_pista_consultada: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadHologramaCreationAttributes
  extends Optional<ActividadHologramaAttributes, 'id'> {}

export class ActividadHolograma
  extends Model<ActividadHologramaAttributes, ActividadHologramaCreationAttributes>
  implements ActividadHologramaAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare valores_barras: object;
  declare intentos_barras: object;
  declare valores_porcentajes: object;
  declare intentos_porcentajes: object;
  declare tipo_grafica_seleccionado: string | null;
  declare intentos_tipo_grafica: number;
  declare pregunta_barra_alta: string | null;
  declare intentos_pregunta_barra: number;
  declare pregunta_sector_mayor: string | null;
  declare intentos_pregunta_sector: number;
  declare veces_pista_consultada: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadHolograma.init(
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
    valores_barras: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    intentos_barras: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    valores_porcentajes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    intentos_porcentajes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    tipo_grafica_seleccionado: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    intentos_tipo_grafica: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pregunta_barra_alta: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    intentos_pregunta_barra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pregunta_sector_mayor: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    intentos_pregunta_sector: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_consultada: {
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
    tableName: 'actividad_holograma',
    timestamps: true,
  }
);

export default ActividadHolograma;