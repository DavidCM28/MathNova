const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then((client) => {
    console.log("Base de datos PostgreSQL conectada correctamente.");
    client.release();
  })
  .catch((error) => {
    console.error("Error al conectar con PostgreSQL:");
    console.error("Mensaje:", error.message);
    console.error("Código:", error.code);
  });

module.exports = pool;