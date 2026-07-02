const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const gruposRoutes = require("./routes/grupos.routes");
const listaAlumnosRoutes = require("./routes/listaAlumnos.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor de MathNova funcionando correctamente.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/lista-alumnos", listaAlumnosRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});