const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  max: 5,
  keepAlive: true,
});

pool
  .connect()
  .then((client) => {
    console.log("Base de datos Supabase conectada correctamente.");
    client.release();
  })
  .catch((error) => {
    console.error("Error al conectar con Supabase:", error.message);
  });

module.exports = pool;