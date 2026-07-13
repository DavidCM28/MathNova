import { sequelize } from '../config/database';
import Student from './Student';
import SyncLog from './SyncLog';
import User from './User';
import Estudiante from './Estudiante';
import Teacher from './Teacher';
import Admin from './Admin';
import ProporcionalidadInversa from './ProporcionalidadInversa';
import ActividadRampas from './ActividadRampas';
import ActividadTripulacion from './ActividadTripulacion';

User.hasOne(Estudiante, { foreignKey: 'id_usuario' });
Estudiante.belongsTo(User, { foreignKey: 'id_usuario' });

User.hasOne(Teacher, { foreignKey: 'id_usuario' });
Teacher.belongsTo(User, { foreignKey: 'id_usuario' });

User.hasOne(Admin, { foreignKey: 'id_usuario' });
Admin.belongsTo(User, { foreignKey: 'id_usuario' });

User.hasMany(ProporcionalidadInversa, { foreignKey: 'id_estudiante' });
ProporcionalidadInversa.belongsTo(User, { foreignKey: 'id_estudiante' });

export {
  sequelize,
  Student,
  SyncLog,
  User,
  Estudiante,
  Teacher,
  Admin,
  ProporcionalidadInversa,
  ActividadRampas,
  ActividadTripulacion,
};

export const initDb = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    await sequelize.sync({ force });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect/sync to the database:', error);
  }
};