require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gruposRoutes = require("./routes/grupos.routes");
const progresoRoutes = require("./routes/progreso.routes");
const proporcionalidadRoutes = require("./routes/proporcionalidadRoutes").default;
// const docenteAlumnosRoutes = require("./routes/docenteAlumnos.routes");

const app = express();
const PORT = process.env.PORT || 3001;

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
    mensaje: "Servidor MathNova funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/proporcionalidad", proporcionalidadRoutes);
// app.use("/api/docente/alumnos", docenteAlumnosRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log("Base de datos Supabase conectada correctamente.");
});