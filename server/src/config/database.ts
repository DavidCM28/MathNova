import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialectStr = (process.env.DB_DIALECT || 'mysql').toLowerCase();
const dialect: Dialect = (dialectStr === 'postgres' || dialectStr === 'postgresql') ? 'postgres' : 'mysql';

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || (dialect === 'postgres' ? '5432' : '3306'), 10);
const dbName = process.env.DB_NAME || 'mathnova';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

console.log(`📡 Database Configured: Using ${dialect.toUpperCase()} on ${dbHost}:${dbPort}`);

export const sequelize = process.env.DATABASE_URL && dialect === 'postgres'
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    })
  : new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: dialect,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

export default sequelize;
