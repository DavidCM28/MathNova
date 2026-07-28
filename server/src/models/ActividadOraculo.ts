import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActividadOraculoAttributes {
  id: number;
  id_estudiante: number;
  espacio_valores: string[];
  intentos_espacio: number;
  espacio_asistido: boolean;
  posible_valor: string | null;
  num_resultados_valor: string | null;
  intentos_paso2: number;
  paso2_asistido: boolean;
  orden_valores: string[];
  intentos_orden: number;
  orden_asistido: boolean;
  comp1_valor: string | null;
  comp2_valor: string | null;
  intentos_comparacion: number;
  comparacion_asistida: boolean;
  prediccion_valor: string | null;
  intentos_prediccion: number;
  prediccion_asistida: boolean;
  veces_pista_espacio: number;
  veces_pista_orden: number;
  veces_pista_comparacion: number;
  veces_pista_prediccion: number;
  mejor_aciertos: number;
  completada: boolean;
  resultado_correcto: boolean | null;
  tiempo_total: number;
  xp_obtenido: number;
  historial_intentos: object[];
}

export interface ActividadOraculoCreationAttributes
  extends Optional<ActividadOraculoAttributes, 'id'> {}

export class ActividadOraculo
  extends Model<ActividadOraculoAttributes, ActividadOraculoCreationAttributes>
  implements ActividadOraculoAttributes
{
  declare id: number;
  declare id_estudiante: number;
  declare espacio_valores: string[];
  declare intentos_espacio: number;
  declare espacio_asistido: boolean;
  declare posible_valor: string | null;
  declare num_resultados_valor: string | null;
  declare intentos_paso2: number;
  declare paso2_asistido: boolean;
  declare orden_valores: string[];
  declare intentos_orden: number;
  declare orden_asistido: boolean;
  declare comp1_valor: string | null;
  declare comp2_valor: string | null;
  declare intentos_comparacion: number;
  declare comparacion_asistida: boolean;
  declare prediccion_valor: string | null;
  declare intentos_prediccion: number;
  declare prediccion_asistida: boolean;
  declare veces_pista_espacio: number;
  declare veces_pista_orden: number;
  declare veces_pista_comparacion: number;
  declare veces_pista_prediccion: number;
  declare mejor_aciertos: number;
  declare completada: boolean;
  declare resultado_correcto: boolean | null;
  declare tiempo_total: number;
  declare xp_obtenido: number;
  declare historial_intentos: object[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActividadOraculo.init(
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
    espacio_valores: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    intentos_espacio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    espacio_asistido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    posible_valor: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    num_resultados_valor: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    intentos_paso2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    paso2_asistido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    orden_valores: {
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
    comp1_valor: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    comp2_valor: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    intentos_comparacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    comparacion_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    prediccion_valor: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    intentos_prediccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    prediccion_asistida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    veces_pista_espacio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_comparacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    veces_pista_prediccion: {
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
    tableName: 'actividad_oraculo',
    timestamps: true,
  }
);

export default ActividadOraculo;