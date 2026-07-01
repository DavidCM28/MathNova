import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const inferredDialect = databaseUrl?.startsWith('postgres') ? 'postgres' : 'mysql';
const dialectStr = (process.env.DB_DIALECT || inferredDialect).toLowerCase();
const dialect: Dialect =
  dialectStr === 'postgres' || dialectStr === 'postgresql' ? 'postgres' : 'mysql';

const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;
const dbHost = process.env.DB_HOST || parsedDatabaseUrl?.hostname || 'localhost';
const dbPort = parseInt(
  process.env.DB_PORT || parsedDatabaseUrl?.port || (dialect === 'postgres' ? '5432' : '3306'),
  10
);
const dbName = process.env.DB_NAME || 'mathnova';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  process.env.NODE_ENV === 'production';

console.log(`📡 Database Configured: Using ${dialect.toUpperCase()} on ${dbHost}:${dbPort}`);

export const sequelize = databaseUrl && dialect === 'postgres'
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: useSsl ? { rejectUnauthorized: false } : false
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
