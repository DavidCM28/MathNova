import express from "express";
import cors from "cors";
import syncRoutes from "./routes/syncRoutes";
import authRoutes from "./routes/authRoutes";
import proporcionalidadRoutes from "./routes/proporcionalidadRoutes";
// @ts-ignore
import alumnoRoutes from "./routes/alumnoRoutes";
// @ts-ignore
import adminRoutes from "./routes/adminRoutes";
// @ts-ignore
import gruposRoutes from "./routes/grupos.routes";

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

// ============================================
// RUTAS
// ============================================

app.use("/api", syncRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/proporcionalidad", proporcionalidadRoutes);
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