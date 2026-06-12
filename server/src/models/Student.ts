import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface StudentAttributes {
  id?: string;
  name: string;
  grade: string;
  score: number;
  streak: number;
}

export class Student extends Model<StudentAttributes> implements StudentAttributes {
  public id!: string;
  public name!: string;
  public grade!: string;
  public score!: number;
  public streak!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '8º',
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'students',
    timestamps: true,
  }
);

export default Student;
