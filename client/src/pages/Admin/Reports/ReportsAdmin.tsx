import AdminLayout from "../AdminLayout/AdminLayout";
import "./ReportsAdmin.css";

function ReportsAdmin() {
  return (
    <AdminLayout activePage="reports" shellClassName="reports-page">
      <main className="reports-main">
        <section className="reports-heading">
          <div><h1>Reportes y estadísticas</h1><p>Analiza el uso de la plataforma, el rendimiento académico y los indicadores operativos.</p></div>
          <div><button className="btn report-button" id="exportPdf" type="button"><svg><use href="#i-pdf"/></svg>Exportar PDF</button><button className="btn btn-outline" id="downloadData" type="button"><svg><use href="#i-download"/></svg>Descargar datos</button></div>
        </section>

        <section className="report-filters panel">
          <label className="date-range"><svg><use href="#i-calendar"/></svg><span>30 abr. 2024&nbsp;&nbsp; – &nbsp;&nbsp;27 may. 2024</span><svg><use href="#i-down"/></svg></label>
          <label><span>Sede</span><select id="reportCampus"><option>Todas las sedes</option><option>Campus Centro</option><option>Campus Norte</option></select></label>
          <label><span>Nivel</span><select id="reportLevel"><option>Todos los niveles</option><option>Primaria</option><option>Secundaria</option><option>Bachillerato</option></select></label>
          <label><span>Periodo</span><select id="reportPeriod"><option>Semanal</option><option>Mensual</option><option>Trimestral</option></select></label>
        </section>

        <section className="report-stats">
          <article className="stat-card"><div className="stat-icon blue"><svg><use href="#i-user-group-solid"/></svg></div><div><p>Usuarios activos mensuales</p><strong>2,148</strong><small className="positive">▲ 12.6% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-check-solid"/></svg></div><div><p>Tasa de finalización</p><strong>87%</strong><small className="positive">▲ 5.3% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-star-solid"/></svg></div><div><p>Promedio general</p><strong>8.9</strong><small className="positive">▲ 0.6 <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon orange"><svg><use href="#i-shield-solid"/></svg></div><div><p>Retención</p><strong>93%</strong><small className="positive">▲ 4.1% <span>vs. mes anterior</span></small></div></article>
        </section>

        <section className="analytics-grid">
          <article className="panel line-chart-card">
            <div className="chart-head"><div><h2>Uso de la plataforma</h2><p>Usuarios activos semanales</p></div><div className="chart-legend"><span><i className="solid-dot"></i>Usuarios activos</span><span><i className="dotted-line"></i>Promedio (8 sem.)</span><button>⋮</button></div></div>
            <svg className="line-chart" viewBox="0 0 620 215" role="img" aria-label="Uso semanal de la plataforma">
              <defs><linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2b7df0" stopOpacity=".28"/><stop offset="1" stopColor="#2b7df0" stopOpacity=".02"/></linearGradient></defs>
              <g className="chart-grid"><path d="M45 18H605M45 58H605M45 98H605M45 138H605M45 178H605"/><path d="M45 18V178"/></g>
              <g className="axis-labels"><text x="8" y="22">3,000</text><text x="8" y="62">2,500</text><text x="8" y="102">2,000</text><text x="8" y="142">1,500</text><text x="24" y="182">0</text></g>
              <path d="M45 123L115 98L185 121L255 93L325 76L395 47L465 63L535 39L605 82L605 178H45Z" fill="url(#lineArea)"/>
              <path d="M45 134L115 116L185 119L255 108L325 91L395 73L465 76L535 59L605 94" fill="none" stroke="#377be0" strokeWidth="2" strokeDasharray="3 4"/>
              <path d="M45 123L115 98L185 121L255 93L325 76L395 47L465 63L535 39L605 82" fill="none" stroke="#0867ed" strokeWidth="3"/>
              <g fill="#0867ed" stroke="#fff" strokeWidth="2"><circle cx="45" cy="123" r="5"/><circle cx="115" cy="98" r="5"/><circle cx="185" cy="121" r="5"/><circle cx="255" cy="93" r="5"/><circle cx="325" cy="76" r="5"/><circle cx="395" cy="47" r="5"/><circle cx="465" cy="63" r="5"/><circle cx="535" cy="39" r="5"/><circle cx="605" cy="82" r="5"/></g>
              <g className="axis-labels x-axis"><text x="45" y="203">1 abr.</text><text x="105" y="203">8 abr.</text><text x="171" y="203">15 abr.</text><text x="240" y="203">22 abr.</text><text x="309" y="203">29 abr.</text><text x="379" y="203">6 may.</text><text x="445" y="203">13 may.</text><text x="516" y="203">20 may.</text><text x="584" y="203">27 may.</text></g>
            </svg>
          </article>

          <article className="panel subject-chart-card">
            <div className="chart-head"><div><h2>Rendimiento por materia</h2><p>Promedio general por materia</p></div><button>⋮</button></div>
            <div className="bar-chart"><div className="bar-scale"><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div><div className="bars"><div><b>9.1</b><i style={{ height: "91%" }}></i><span>Álgebra</span></div><div><b>8.7</b><i style={{ height: "87%" }}></i><span>Geometría</span></div><div><b>8.3</b><i style={{ height: "83%" }}></i><span>Estadística</span></div><div><b>9.2</b><i style={{ height: "92%" }}></i><span>Cálculo</span></div></div></div>
          </article>

          <article className="panel distribution-card">
            <div className="chart-head"><div><h2>Distribución de usuarios</h2><p>Por rol en la plataforma</p></div></div>
            <div className="distribution-content"><div className="donut"><span>42%</span></div><div className="donut-legend"><p><i className="d-blue"></i>Alumnos <b>42%</b></p><p><i className="d-green"></i>Docentes <b>30%</b></p><p><i className="d-purple"></i>Padres <b>18%</b></p><p><i className="d-orange"></i>Administradores <b>10%</b></p></div></div>
            <small className="distribution-total">Total: 2,148 usuarios</small>
          </article>
        </section>

        <section className="report-bottom-grid">
          <article className="panel indicators-card">
            <h2>Indicadores clave</h2>
            <table><thead><tr><th>Indicador</th><th>Valor actual</th><th>Periodo anterior</th><th>Variación</th></tr></thead><tbody>
              <tr><td><i className="metric-icon blue"><svg><use href="#i-user-group-solid"/></svg></i>Usuarios activos mensuales</td><td>2,148</td><td>1,906</td><td className="positive">▲ 12.6%</td></tr>
              <tr><td><i className="metric-icon green"><svg><use href="#i-check-solid"/></svg></i>Tasa de finalización</td><td>87%</td><td>81.7%</td><td className="positive">▲ 5.3%</td></tr>
              <tr><td><i className="metric-icon purple"><svg><use href="#i-star-solid"/></svg></i>Promedio general</td><td>8.9</td><td>8.3</td><td className="positive">▲ 0.6</td></tr>
              <tr><td><i className="metric-icon orange"><svg><use href="#i-shield-solid"/></svg></i>Retención</td><td>93%</td><td>88.9%</td><td className="positive">▲ 4.1%</td></tr>
              <tr><td><i className="metric-icon blue"><svg><use href="#i-bars-solid"/></svg></i>Actividades completadas</td><td>5,842</td><td>4,986</td><td className="positive">▲ 17.2%</td></tr>
            </tbody></table>
          </article>

          <article className="panel analytics-alerts">
            <h2>Alertas analíticas</h2>
            <div className="analytics-alert warning"><span><svg><use href="#i-alert"/></svg></span><div><strong>Descenso en el uso en la última semana</strong><p>Los usuarios activos disminuyeron 20.4% respecto a la semana anterior.</p></div><a href="#detalle">Ver detalle</a></div>
            <div className="analytics-alert success"><span><svg><use href="#i-trend"/></svg></span><div><strong>Mejora significativa en la finalización</strong><p>La tasa de finalización aumentó 5.3% comparado con el periodo anterior.</p></div><a href="#detalle">Ver detalle</a></div>
            <div className="analytics-alert purple"><span><svg><use href="#i-user-group-solid"/></svg></span><div><strong>Aumento en registros de nuevos usuarios</strong><p>Se registraron 246 nuevos usuarios en el último periodo (+18.7%).</p></div><a href="#detalle">Ver detalle</a></div>
            <a className="alerts-footer" href="#alertas">Ver todas las alertas</a>
          </article>
        </section>
      </main>
    </AdminLayout>
  );
}

export default ReportsAdmin;
