import express from "express";
import cors from "cors";

const authRoutes = require("./routes/auth.routes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gruposRoutes = require("./routes/grupos.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor MathNova funcionando",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/grupos", gruposRoutes);

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada",
  });
});

export default app;