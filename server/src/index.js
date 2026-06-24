const alumnoRoutes = require("./routes/alumnoRoutes");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alumno", alumnoRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor de MathNova funcionando correctamente.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});