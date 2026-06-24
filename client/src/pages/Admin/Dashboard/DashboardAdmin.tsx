import AdminLayout from "../AdminLayout/AdminLayout";
import "./DashboardAdmin.css";
import heroImage from "../../../assets/admin-dashboard.png";

function DashboardAdmin() {
  return (
    <AdminLayout activePage="dashboard">
      <main id="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Panel de administración</p>
            <h1>Bienvenido al<br /><span>Dashboard Administrador</span></h1>
            <p className="hero-description">Supervisa usuarios, grupos, actividades y el rendimiento de la plataforma<br className="desktop-only" /> para garantizar una gestión académica eficiente y segura.</p>
            <div className="hero-actions">
              <button className="btn btn-primary" id="createUser" type="button"><svg><use href="#i-plus"/></svg>Crear usuario</button>
              <button className="btn btn-outline" id="generateReport" type="button"><svg><use href="#i-file"/></svg>Generar reporte</button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true"><img src={heroImage} alt="Dashboard administrador de MathNova" /></div>
        </section>

        <section className="stats-grid" aria-label="Resumen general">
          <article className="stat-card">
            <div className="stat-icon blue"><svg><use href="#i-user-group-solid"/></svg></div>
            <div><p>Usuarios totales</p><strong>2,486</strong><small className="positive">↑ 8.4% <span>vs. mes anterior</span></small></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon green"><svg><use href="#i-teacher"/></svg></div>
            <div><p>Docentes activos</p><strong>128</strong><small className="positive">↑ 5.1% <span>vs. mes anterior</span></small></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon purple"><svg><use href="#i-user-group-solid"/></svg></div>
            <div><p>Grupos activos</p><strong>64</strong><small className="positive">↑ 3.2% <span>vs. mes anterior</span></small></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon orange"><svg><use href="#i-alert"/></svg></div>
            <div><p>Alertas pendientes</p><strong>7</strong><small className="negative">↑ 40.0% <span>vs. mes anterior</span></small></div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel performance-panel">
            <div className="panel-head"><h2>Rendimiento académico</h2><a href="#reportes">Ver reporte</a></div>
            <div className="performance-summary">
              <div className="score-ring" aria-label="Rendimiento general 87 por ciento"><strong>87%</strong><span>General</span></div>
              <div className="performance-copy"><strong>Buen desempeño general</strong><p>El rendimiento aumentó <b>4.2%</b> durante los últimos 30 días.</p></div>
            </div>
            <div className="progress-list">
              <div className="progress-row"><div><span>Aprobación</span><strong>87%</strong></div><div className="progress-track"><i className="progress-blue" style={{ width: "87%" }}></i></div></div>
              <div className="progress-row"><div><span>Participación</span><strong>78%</strong></div><div className="progress-track"><i className="progress-purple" style={{ width: "78%" }}></i></div></div>
              <div className="progress-row"><div><span>Tareas entregadas</span><strong>92%</strong></div><div className="progress-track"><i className="progress-green" style={{ width: "92%" }}></i></div></div>
            </div>
            <div className="weekly-trend">
              <div className="trend-head"><strong>Tendencia semanal</strong><span>+6.8% este mes</span></div>
              <div className="trend-chart" aria-label="Gráfica de rendimiento semanal">
                <i style={{ height: "42%" }}><span>L</span></i><i style={{ height: "56%" }}><span>M</span></i><i style={{ height: "51%" }}><span>M</span></i><i style={{ height: "68%" }}><span>J</span></i><i style={{ height: "63%" }}><span>V</span></i><i style={{ height: "81%" }}><span>S</span></i><i className="current" style={{ height: "92%" }}><span>D</span></i>
              </div>
            </div>
          </article>

          <article className="panel actions-panel">
            <div className="panel-head"><h2>Próximas acciones</h2><a href="#calendario">Ver calendario</a></div>
            <div className="action-list">
              <div className="action-item"><div className="date-box"><span>MAY</span><strong>24</strong></div><div><strong>Revisar solicitudes de acceso</strong><p>5 solicitudes pendientes</p></div><time>24 May 2024<br />10:00 AM</time></div>
              <div className="action-item"><div className="date-box"><span>MAY</span><strong>27</strong></div><div><strong>Validar evaluaciones programadas</strong><p>3 evaluaciones por validar</p></div><time>27 May 2024<br />02:00 PM</time></div>
              <div className="action-item"><div className="date-box"><span>MAY</span><strong>30</strong></div><div><strong>Generar reporte mensual</strong><p>Rendimiento y uso de la plataforma</p></div><time>30 May 2024<br />09:00 AM</time></div>
            </div>
          </article>

          <div className="right-stack">
            <article className="panel modules-panel">
              <div className="panel-head"><h2>Módulos clave</h2></div>
              <div className="module-grid">
                <a href="#usuarios" className="module-card"><svg className="blue-text"><use href="#i-user-group-solid"/></svg><strong>Usuarios</strong><p>Gestiona usuarios<br />y permisos</p><span>→</span></a>
                <a href="#cursos" className="module-card"><svg className="green-text"><use href="#i-cap"/></svg><strong>Cursos</strong><p>Administra grupos<br />y cursos</p><span>→</span></a>
                <a href="#reportes" className="module-card"><svg className="purple-text"><use href="#i-bars-solid"/></svg><strong>Reportes</strong><p>Analiza datos y<br />rendimiento</p><span>→</span></a>
              </div>
            </article>
            <article className="panel notice-panel">
              <div className="notice-title"><svg><use href="#i-megaphone"/></svg><h2>Avisos del sistema</h2></div>
              <ul><li>Se realizará mantenimiento programado el 25 de mayo de 2024 de 00:00 a 02:00 AM.</li><li>La importación masiva de usuarios ya está disponible.</li><li>Recuerda actualizar los permisos de fin de ciclo escolar.</li></ul>
            </article>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}

export default DashboardAdmin;
