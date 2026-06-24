const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

async function probarConexion() {
  let client;

  try {
    client = await pool.connect();
    console.log("Base de datos Supabase conectada correctamente.");
  } catch (error) {
    console.error("Error al conectar con Supabase:", error.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}

probarConexion();

module.exports = pool;