import { sequelize } from '../config/database';
import { Student } from './Student';
import { SyncLog } from './SyncLog';

// Setup relationships here if needed in the future

export {
  sequelize,
  Student,
  SyncLog
};

export const initDb = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Sync schemas
    await sequelize.sync({ force });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect/sync to the database:', error);
  }
};
