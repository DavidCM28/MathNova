import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./DashboardAdmin.css";
import heroImage from "../../../assets/admin-dashboard.png";
import { obtenerDashboardAdmin } from "../../../services/adminService";

type TarjetasAdmin = {
  usuarios_totales: number;
  docentes_activos: number;
  alumnos_activos: number;
  grupos_activos: number;
  alertas_pendientes: number;
  inicios_sesion: number;
};

type RendimientoAcademico = {
  porcentaje_general: number;
  descripcion: string;
  aprobacion: number;
  participacion: number;
  tareas_entregadas: number;
};

type ProximaAccion = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
};

type ModuloClave = {
  id: number;
  titulo: string;
  descripcion: string;
  ruta: string;
};

type DashboardAdminData = {
  tarjetas: TarjetasAdmin;
  rendimiento_academico: RendimientoAcademico;
  proximas_acciones: ProximaAccion[];
  modulos_clave: ModuloClave[];
  avisos_sistema: string[];
};

function DashboardAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdminData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const data = await obtenerDashboardAdmin();
        setDashboard(data);
      } catch (error) {
        console.error("Error al cargar dashboard administrador:", error);
        setError("No se pudo cargar la información del dashboard.");
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  const tarjetas = dashboard?.tarjetas;
  const rendimiento = dashboard?.rendimiento_academico;
  const acciones = dashboard?.proximas_acciones ?? [];
  const modulos = dashboard?.modulos_clave ?? [];
  const avisos = dashboard?.avisos_sistema ?? [];

  const formatearNumero = (valor?: number) => {
    return Number(valor ?? 0).toLocaleString("es-MX");
  };

  return (
    <AdminLayout activePage="dashboard">
      <main id="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Panel de administración</p>
            <h1>
              Bienvenido al
              <br />
              <span>Dashboard Administrador</span>
            </h1>
            <p className="hero-description">
              Supervisa usuarios, grupos, actividades y el rendimiento de la plataforma
              <br className="desktop-only" /> para garantizar una gestión académica eficiente y segura.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" id="createUser" type="button">
                <svg>
                  <use href="#i-plus" />
                </svg>
                Crear usuario
              </button>
              <button className="btn btn-outline" id="generateReport" type="button">
                <svg>
                  <use href="#i-file" />
                </svg>
                Generar reporte
              </button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <img src={heroImage} alt="Dashboard administrador de MathNova" />
          </div>
        </section>

        {cargando && <p style={{ padding: "20px" }}>Cargando dashboard...</p>}

        {error && <p style={{ padding: "20px", color: "#dc2626", fontWeight: 700 }}>{error}</p>}

        {!cargando && !error && (
          <>
            <section className="stats-grid" aria-label="Resumen general">
              <article className="stat-card">
                <div className="stat-icon blue">
                  <svg>
                    <use href="#i-user-group-solid" />
                  </svg>
                </div>
                <div>
                  <p>Usuarios totales</p>
                  <strong>{formatearNumero(tarjetas?.usuarios_totales)}</strong>
                  <small className="positive">
                    ↑ 8.4% <span>vs. mes anterior</span>
                  </small>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon green">
                  <svg>
                    <use href="#i-teacher" />
                  </svg>
                </div>
                <div>
                  <p>Docentes activos</p>
                  <strong>{formatearNumero(tarjetas?.docentes_activos)}</strong>
                  <small className="positive">
                    ↑ 5.1% <span>vs. mes anterior</span>
                  </small>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon purple">
                  <svg>
                    <use href="#i-user-group-solid" />
                  </svg>
                </div>
                <div>
                  <p>Grupos activos</p>
                  <strong>{formatearNumero(tarjetas?.grupos_activos)}</strong>
                  <small className="positive">
                    ↑ 3.2% <span>vs. mes anterior</span>
                  </small>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon orange">
                  <svg>
                    <use href="#i-alert" />
                  </svg>
                </div>
                <div>
                  <p>Alertas pendientes</p>
                  <strong>{formatearNumero(tarjetas?.alertas_pendientes)}</strong>
                  <small className="negative">
                    ↑ 40.0% <span>vs. mes anterior</span>
                  </small>
                </div>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="panel performance-panel">
                <div className="panel-head">
                  <h2>Rendimiento académico</h2>
                  <a href="#reportes">Ver reporte</a>
                </div>

                <div className="performance-summary">
                  <div
                    className="score-ring"
                    aria-label={`Rendimiento general ${rendimiento?.porcentaje_general ?? 0} por ciento`}
                  >
                    <strong>{rendimiento?.porcentaje_general ?? 0}%</strong>
                    <span>General</span>
                  </div>
                  <div className="performance-copy">
                    <strong>{rendimiento?.descripcion ?? "Sin datos disponibles"}</strong>
                    <p>
                      El rendimiento aumentó <b>4.2%</b> durante los últimos 30 días.
                    </p>
                  </div>
                </div>

                <div className="progress-list">
                  <div className="progress-row">
                    <div>
                      <span>Aprobación</span>
                      <strong>{rendimiento?.aprobacion ?? 0}%</strong>
                    </div>
                    <div className="progress-track">
                      <i className="progress-blue" style={{ width: `${rendimiento?.aprobacion ?? 0}%` }}></i>
                    </div>
                  </div>

                  <div className="progress-row">
                    <div>
                      <span>Participación</span>
                      <strong>{rendimiento?.participacion ?? 0}%</strong>
                    </div>
                    <div className="progress-track">
                      <i className="progress-purple" style={{ width: `${rendimiento?.participacion ?? 0}%` }}></i>
                    </div>
                  </div>

                  <div className="progress-row">
                    <div>
                      <span>Tareas entregadas</span>
                      <strong>{rendimiento?.tareas_entregadas ?? 0}%</strong>
                    </div>
                    <div className="progress-track">
                      <i className="progress-green" style={{ width: `${rendimiento?.tareas_entregadas ?? 0}%` }}></i>
                    </div>
                  </div>
                </div>

                <div className="weekly-trend">
                  <div className="trend-head">
                    <strong>Tendencia semanal</strong>
                    <span>+6.8% este mes</span>
                  </div>
                  <div className="trend-chart" aria-label="Gráfica de rendimiento semanal">
                    <i style={{ height: "42%" }}>
                      <span>L</span>
                    </i>
                    <i style={{ height: "56%" }}>
                      <span>M</span>
                    </i>
                    <i style={{ height: "51%" }}>
                      <span>M</span>
                    </i>
                    <i style={{ height: "68%" }}>
                      <span>J</span>
                    </i>
                    <i style={{ height: "63%" }}>
                      <span>V</span>
                    </i>
                    <i style={{ height: "81%" }}>
                      <span>S</span>
                    </i>
                    <i className="current" style={{ height: "92%" }}>
                      <span>D</span>
                    </i>
                  </div>
                </div>
              </article>

              <article className="panel actions-panel">
                <div className="panel-head">
                  <h2>Próximas acciones</h2>
                  <a href="#calendario">Ver calendario</a>
                </div>

                <div className="action-list">
                  {acciones.map((accion) => (
                    <div className="action-item" key={accion.id}>
                      <div className="date-box">
                        <span>{accion.fecha.split(" ")[0].toUpperCase()}</span>
                        <strong>{accion.fecha.split(" ")[1]}</strong>
                      </div>
                      <div>
                        <strong>{accion.titulo}</strong>
                        <p>{accion.descripcion}</p>
                      </div>
                      <time>
                        {accion.fecha}
                        <br />
                        {accion.hora}
                      </time>
                    </div>
                  ))}
                </div>
              </article>

              <div className="right-stack">
                <article className="panel modules-panel">
                  <div className="panel-head">
                    <h2>Módulos clave</h2>
                  </div>

                  <div className="module-grid">
                    {modulos.map((modulo, index) => (
                      <a href={modulo.ruta} className="module-card" key={modulo.id}>
                        <svg className={index === 0 ? "blue-text" : index === 1 ? "green-text" : "purple-text"}>
                          <use href={index === 0 ? "#i-user-group-solid" : index === 1 ? "#i-cap" : "#i-bars-solid"} />
                        </svg>
                        <strong>{modulo.titulo}</strong>
                        <p>{modulo.descripcion}</p>
                        <span>→</span>
                      </a>
                    ))}
                  </div>
                </article>

                <article className="panel notice-panel">
                  <div className="notice-title">
                    <svg>
                      <use href="#i-megaphone" />
                    </svg>
                    <h2>Avisos del sistema</h2>
                  </div>

                  <ul>
                    {avisos.map((aviso, index) => (
                      <li key={index}>{aviso}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          </>
        )}
      </main>
    </AdminLayout>
  );
}

export default DashboardAdmin;