import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadNucleoAttributes {
  id: number;
  id_estudiante: number;
  orden_valores: number[];
  orden_posiciones_correctas: boolean[];
  intentos_orden: number;
  orden_asistido: boolean;
  valor_media: string | null;
  intentos_media: number;
  media_asistida: boolean;
  valor_mediana: string | null;
  intentos_mediana: number;
  mediana_asistida: boolean;
  valor_moda: string | null;
  intentos_moda: number;
  moda_asistida: boolean;
  valor_rango: string | null;
  intentos_rango: number;
  rango_asistida: boolean;
  veces_pista_orden: number;
  veces_pista_media: number;
  veces_pista_mediana: number;
  veces_pista_moda: number;
  veces_pista_rango: number;
  veces_pista_decision: number;
  mejor_aciertos: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadNucleoCreationAttributes
  extends Optional<ActividadNucleoAttributes, 'id'> {}

export class ActividadNucleo
  extends Model<ActividadNucleoAttributes, ActividadNucleoCreationAttributes>
  implements ActividadNucleoAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare orden_valores: number[];
  declare orden_posiciones_correctas: boolean[];
  declare intentos_orden: number;
  declare orden_asistido: boolean;
  declare valor_media: string | null;
  declare intentos_media: number;
  declare media_asistida: boolean;
  declare valor_mediana: string | null;
  declare intentos_mediana: number;
  declare mediana_asistida: boolean;
  declare valor_moda: string | null;
  declare intentos_moda: number;
  declare moda_asistida: boolean;
  declare valor_rango: string | null;
  declare intentos_rango: number;
  declare rango_asistida: boolean;
  declare veces_pista_orden: number;
  declare veces_pista_media: number;
  declare veces_pista_mediana: number;
  declare veces_pista_moda: number;
  declare veces_pista_rango: number;
  declare veces_pista_decision: number;
  declare mejor_aciertos: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadNucleo.init(
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
    orden_valores: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    orden_posiciones_correctas: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    intentos_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    orden_asistido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    valor_media: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    intentos_media: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    media_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    valor_mediana: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    intentos_mediana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mediana_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    valor_moda: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    intentos_moda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    moda_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    valor_rango: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    intentos_rango: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rango_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    veces_pista_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_media: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_mediana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_moda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_rango: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_decision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mejor_aciertos: {
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
    tableName: 'actividad_nucleo',
    timestamps: true,
  }
);

export default ActividadNucleo;