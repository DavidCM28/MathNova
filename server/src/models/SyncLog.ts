import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface SyncLogAttributes {
  id?: string;
  type: string;
  payload: string; // Stored as stringified JSON to maintain compatibility across dialects
  synced: boolean;
  timestamp: Date;
}

export class SyncLog extends Model<SyncLogAttributes> implements SyncLogAttributes {
  public id!: string;
  public type!: string;
  public payload!: string;
  public synced!: boolean;
  public timestamp!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SyncLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    synced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sync_logs',
    timestamps: true,
  }
);

export default SyncLog;
