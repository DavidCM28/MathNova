import AdminLayout from "../AdminLayout/AdminLayout";
import "./RequestsAdmin.css";

function RequestsAdmin() {
  return (
    <AdminLayout activePage="requests" shellClassName="requests-page">
      <main className="requests-main">
        <section className="requests-heading"><div><h1>Solicitudes y soporte</h1><p>Revisa aprobaciones, gestiona solicitudes de soporte y resuelve incidencias de la plataforma.</p></div><div><button className="btn btn-primary" id="assignTicket" type="button"><svg><use href="#i-plus"/></svg>Asignar ticket</button><button className="btn btn-outline" id="exportIncidents" type="button"><svg><use href="#i-download"/></svg>Exportar incidencias</button></div></section>

        <div className="support-tabs" role="tablist" aria-label="Tipo de solicitud"><button className="active" type="button" data-support-tab=""><svg><use href="#i-check-circle"/></svg>Aprobaciones</button><button type="button" data-support-tab="Ticket"><svg><use href="#i-headphones"/></svg>Tickets</button><button type="button" data-support-tab="Incidencia"><svg><use href="#i-alert"/></svg>Incidencias</button></div>

        <section className="support-stats">
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-clipboard-solid"/></svg></div><div><p>Solicitudes pendientes</p><strong>24</strong><small className="positive">+ 14.3% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon blue"><svg><use href="#i-headphones-solid"/></svg></div><div><p>Tickets abiertos</p><strong>18</strong><small className="positive">+ 5.6% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon red"><svg><use href="#i-alert"/></svg></div><div><p>Incidencias críticas</p><strong>3</strong><small className="positive">− 25.0% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-clock-outline"/></svg></div><div><p>Tiempo medio de respuesta</p><strong>2.4 h</strong><small className="positive">− 8.7% <span>vs. mes anterior</span></small></div></article>
        </section>

        <section className="requests-workspace">
          <article className="requests-table-area">
            <div className="request-filters">
              <label>Tipo<select id="requestType"><option value="">Todos</option><option>Aprobación</option><option>Ticket</option><option>Incidencia</option></select></label>
              <label>Prioridad<select id="requestPriority"><option value="">Todos</option><option>Alta</option><option>Media</option><option>Baja</option></select></label>
              <label>Estado<select id="requestStatus"><option value="">Todos</option><option>Pendiente</option><option>En proceso</option><option>Resuelto</option></select></label>
              <label className="request-search"><input id="requestSearch" type="search" placeholder="Buscar por ID, asunto, solicitante o asignado..." aria-label="Buscar solicitudes" /><svg><use href="#i-search"/></svg></label>
            </div>
            <div className="panel requests-table-panel">
              <div className="requests-table-wrap"><table className="requests-table"><thead><tr><th>ID</th><th>Asunto</th><th>Tipo</th><th>Solicitante</th><th>Prioridad</th><th>Estado</th><th>Asignado a</th><th>Fecha</th><th aria-label="Acciones"></th></tr></thead><tbody id="requestsTableBody">
                <tr data-type="Aprobación" data-priority="Alta" data-status="Pendiente"><td><a href="#apr-0156">APR-2024-0156</a></td><td>Solicitud de acceso para nueva docente</td><td><span className="request-kind approval"><svg><use href="#i-check-circle"/></svg>Aprobación</span></td><td><strong>María López</strong><small>Docente</small></td><td><span className="priority high">Alta</span></td><td><span className="status review">Pendiente</span></td><td>Ana Torres</td><td><strong>24 May 2024</strong><small>10:15 AM</small></td><td><button className="row-menu" aria-label="Acciones de APR-2024-0156"><svg><use href="#i-dots"/></svg></button></td></tr>
                <tr data-type="Ticket" data-priority="Media" data-status="En proceso"><td><a href="#tck-0321">TCK-2024-0321</a></td><td>Restablecer contraseña de usuario</td><td><span className="request-kind ticket"><svg><use href="#i-headphones"/></svg>Ticket</span></td><td><strong>Juan Pérez</strong><small>Docente</small></td><td><span className="priority medium">Media</span></td><td><span className="status full">En proceso</span></td><td>Carlos Vega</td><td><strong>24 May 2024</strong><small>09:02 AM</small></td><td><button className="row-menu" aria-label="Acciones de TCK-2024-0321"><svg><use href="#i-dots"/></svg></button></td></tr>
                <tr data-type="Incidencia" data-priority="Alta" data-status="En proceso"><td><a href="#inc-0078">INC-2024-0078</a></td><td>Error al generar reporte de evaluaciones</td><td><span className="request-kind incident"><svg><use href="#i-alert"/></svg>Incidencia</span></td><td><strong>Sofía Ramírez</strong><small>Coordinadora</small></td><td><span className="priority high">Alta</span></td><td><span className="status full">En proceso</span></td><td>Equipo Soporte</td><td><strong>23 May 2024</strong><small>04:35 PM</small></td><td><button className="row-menu" aria-label="Acciones de INC-2024-0078"><svg><use href="#i-dots"/></svg></button></td></tr>
                <tr data-type="Aprobación" data-priority="Baja" data-status="Pendiente"><td><a href="#apr-0155">APR-2024-0155</a></td><td>Aprobación de nuevo curso Matemáticas Avanzadas</td><td><span className="request-kind approval"><svg><use href="#i-check-circle"/></svg>Aprobación</span></td><td><strong>Luis Hernández</strong><small>Docente</small></td><td><span className="priority low">Baja</span></td><td><span className="status review">Pendiente</span></td><td>Ana Torres</td><td><strong>23 May 2024</strong><small>11:20 AM</small></td><td><button className="row-menu" aria-label="Acciones de APR-2024-0155"><svg><use href="#i-dots"/></svg></button></td></tr>
                <tr data-type="Ticket" data-priority="Media" data-status="Resuelto"><td><a href="#tck-0318">TCK-2024-0318</a></td><td>No puedo ingresar a la plataforma</td><td><span className="request-kind ticket"><svg><use href="#i-headphones"/></svg>Ticket</span></td><td><strong>Ana Gómez</strong><small>Estudiante</small></td><td><span className="priority medium">Media</span></td><td><span className="status active">Resuelto</span></td><td>Diego Ruiz</td><td><strong>22 May 2024</strong><small>03:14 PM</small></td><td><button className="row-menu" aria-label="Acciones de TCK-2024-0318"><svg><use href="#i-dots"/></svg></button></td></tr>
                <tr data-type="Incidencia" data-priority="Alta" data-status="Resuelto"><td><a href="#inc-0077">INC-2024-0077</a></td><td>Intermitencia en la carga de actividades</td><td><span className="request-kind incident"><svg><use href="#i-alert"/></svg>Incidencia</span></td><td><strong>Miguel Castro</strong><small>Docente</small></td><td><span className="priority high">Alta</span></td><td><span className="status active">Resuelto</span></td><td>Equipo Soporte</td><td><strong>22 May 2024</strong><small>10:48 AM</small></td><td><button className="row-menu" aria-label="Acciones de INC-2024-0077"><svg><use href="#i-dots"/></svg></button></td></tr>
              </tbody></table><div className="empty-table" id="emptyRequests">No encontramos solicitudes con esos filtros.</div></div>
              <div className="request-pagination"><span id="requestResults">Mostrando 1 a 6 de 45 solicitudes</span><div><button>‹</button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>8</button><button>›</button></div><select aria-label="Solicitudes por página"><option>10 por página</option><option>20 por página</option></select></div>
            </div>
          </article>

          <aside className="request-sidepanels">
            <article className="panel sla-panel"><h2>SLA y cumplimiento</h2><div className="sla-row"><div><span>Cumplimiento de SLA</span><strong>92%</strong></div><div className="sla-track"><i className="green" style={{ width: "92%" }}></i></div><small>Meta: ≥ 90%</small></div><div className="sla-row"><div><span>Tickets respondidos a tiempo</span><strong>41 / 45</strong></div><div className="sla-track"><i className="blue" style={{ width: "91%" }}></i></div><small>Meta: ≥ 90%</small></div><div className="sla-row"><div><span>Incidencias críticas resueltas</span><strong>7 / 10</strong></div><div className="sla-track"><i className="orange" style={{ width: "70%" }}></i></div><small>Meta: ≥ 90%</small></div><a href="#sla">Ver reporte completo <span>›</span></a></article>
            <article className="panel latest-incidents"><h2>Últimas incidencias</h2><div className="incident-list"><div><p><strong>INC-2024-0078&nbsp; • &nbsp;Alta</strong><span>23 May, 04:35 PM</span></p><small>Error al generar reporte de evaluaciones</small></div><div><p><strong>INC-2024-0076&nbsp; • &nbsp;Alta</strong><span>22 May, 08:12 AM</span></p><small>Fallos intermitentes en inicio de sesión</small></div><div><p><strong>INC-2024-0075&nbsp; • &nbsp;Alta</strong><span>21 May, 07:50 PM</span></p><small>No se guardan calificaciones</small></div></div><a href="#incidencias">Ver todas las incidencias <span>›</span></a></article>
          </aside>
        </section>
      </main>
    </AdminLayout>
  );
}

export default RequestsAdmin;
