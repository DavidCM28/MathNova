import AdminLayout from "../AdminLayout/AdminLayout";
import "./ActivitiesAdmin.css";

function ActivitiesAdmin() {
  return (
    <AdminLayout activePage="activities" shellClassName="activities-page">
      <main className="activities-main">
        <section className="activities-heading">
          <div>
            <p className="eyebrow">Gestión académica</p>
            <h1>Actividades y evaluaciones</h1>
            <p>Monitorea tareas, exámenes, estado de publicación y carga de revisión.</p>
          </div>
          <div className="activities-heading-actions">
            <button className="btn btn-primary" id="createActivity" type="button"><svg><use href="#i-plus"/></svg>Nueva actividad</button>
            <button className="btn btn-outline" id="scheduleEvaluation" type="button"><svg><use href="#i-calendar"/></svg>Programar evaluación</button>
          </div>
        </section>

        <section className="activity-stats" aria-label="Resumen de actividades">
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-task-solid"/></svg></div><div><p>Actividades publicadas</p><strong>186</strong><small className="positive">↑ 8.4% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon orange"><svg><use href="#i-review-solid"/></svg></div><div><p>Por revisar</p><strong>42</strong><small className="negative">↑ 12.1% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-calendar-solid"/></svg></div><div><p>Evaluaciones programadas</p><strong>18</strong><small className="positive">↑ 5.3% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon yellow"><svg><use href="#i-clock-solid"/></svg></div><div><p>Vencen esta semana</p><strong>11</strong><small className="negative">↑ 22.2% <span>vs. mes anterior</span></small></div></article>
        </section>

        <section className="activities-workspace">
          <article className="panel activities-table-panel">
            <div className="activity-tabs" role="tablist" aria-label="Tipo de actividad">
              <button className="active" type="button" data-activity-tab="">Todas</button>
              <button type="button" data-activity-tab="Tarea">Tareas</button>
              <button type="button" data-activity-tab="Examen">Exámenes</button>
              <button type="button" data-activity-tab="Proyecto">Proyectos</button>
            </div>
            <div className="activity-filters">
              <label>Materia<select id="subjectFilter"><option value="">Todas</option><option>Álgebra</option><option>Geometría</option><option>Estadística</option><option>Matemáticas</option></select></label>
              <label>Grupo<select id="activityGroupFilter"><option value="">Todos</option><option>1.° A</option><option>1.° B</option><option>2.° A</option><option>2.° B</option><option>3.° A</option><option>3.° B</option></select></label>
              <label>Estado<select id="activityStatusFilter"><option value="">Todos</option><option>Publicada</option><option>Pendiente de revisión</option><option>Borrador</option><option>Programada</option><option>Cerrada</option></select></label>
              <label>Fecha<select id="dateFilter"><option value="">Este mes</option><option>Esta semana</option><option>Próximo mes</option></select></label>
              <button className="filter-button" id="resetActivityFilters" type="button"><svg><use href="#i-filter"/></svg>Filtros</button>
            </div>

            <div className="activities-table-wrap">
              <table className="activities-table">
                <thead><tr><th>Título</th><th>Tipo</th><th>Grupo</th><th>Materia</th><th>Fecha límite</th><th>Entregas</th><th>Estado</th><th aria-label="Acciones"></th></tr></thead>
                <tbody id="activitiesTableBody">
                  <tr data-type="Tarea" data-subject="Álgebra" data-group="1.° A" data-status="Publicada"><td><div className="activity-title"><span className="item-icon green"><svg><use href="#i-file"/></svg></span><div><strong>Tarea de Álgebra</strong><small>Resolver ejercicios de expresiones algebraicas.</small></div></div></td><td><span className="type-pill task">Tarea</span></td><td>1.° A</td><td>Álgebra</td><td><strong>24 May 2024</strong><small>11:59 PM</small></td><td>28/32</td><td><span className="status active">Publicada</span></td><td><button className="row-menu" aria-label="Acciones de Tarea de Álgebra"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-type="Examen" data-subject="Geometría" data-group="1.° B" data-status="Pendiente de revisión"><td><div className="activity-title"><span className="item-icon purple"><svg><use href="#i-list"/></svg></span><div><strong>Examen de Geometría</strong><small>Figuras planas y teoremas.</small></div></div></td><td><span className="type-pill exam">Examen</span></td><td>1.° B</td><td>Geometría</td><td><strong>27 May 2024</strong><small>09:00 AM</small></td><td>—</td><td><span className="status review">Pendiente de revisión</span></td><td><button className="row-menu" aria-label="Acciones de Examen de Geometría"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-type="Proyecto" data-subject="Estadística" data-group="2.° A" data-status="Publicada"><td><div className="activity-title"><span className="item-icon blue"><svg><use href="#i-folder"/></svg></span><div><strong>Proyecto de Estadística</strong><small>Análisis de datos de una encuesta.</small></div></div></td><td><span className="type-pill project">Proyecto</span></td><td>2.° A</td><td>Estadística</td><td><strong>31 May 2024</strong><small>11:59 PM</small></td><td>21/28</td><td><span className="status active">Publicada</span></td><td><button className="row-menu" aria-label="Acciones de Proyecto de Estadística"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-type="Tarea" data-subject="Álgebra" data-group="2.° B" data-status="Borrador"><td><div className="activity-title"><span className="item-icon green"><svg><use href="#i-file"/></svg></span><div><strong>Tarea de Funciones</strong><small>Graficar funciones lineales.</small></div></div></td><td><span className="type-pill task">Tarea</span></td><td>2.° B</td><td>Álgebra</td><td><strong>02 Jun 2024</strong><small>11:59 PM</small></td><td>15/27</td><td><span className="status draft">Borrador</span></td><td><button className="row-menu" aria-label="Acciones de Tarea de Funciones"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-type="Examen" data-subject="Matemáticas" data-group="3.° A" data-status="Programada"><td><div className="activity-title"><span className="item-icon purple"><svg><use href="#i-list"/></svg></span><div><strong>Examen Trimestral de Matemáticas</strong><small>Álgebra, geometría y estadística.</small></div></div></td><td><span className="type-pill exam">Examen</span></td><td>3.° A</td><td>Matemáticas</td><td><strong>06 Jun 2024</strong><small>09:00 AM</small></td><td>—</td><td><span className="status full">Programada</span></td><td><button className="row-menu" aria-label="Acciones de Examen Trimestral"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-type="Proyecto" data-subject="Estadística" data-group="3.° B" data-status="Cerrada"><td><div className="activity-title"><span className="item-icon blue"><svg><use href="#i-folder"/></svg></span><div><strong>Proyecto: Modelado de Datos</strong><small>Construcción de modelo y predicción.</small></div></div></td><td><span className="type-pill project">Proyecto</span></td><td>3.° B</td><td>Estadística</td><td><strong>09 Jun 2024</strong><small>11:59 PM</small></td><td>10/26</td><td><span className="status closed">Cerrada</span></td><td><button className="row-menu" aria-label="Acciones de Modelado de Datos"><svg><use href="#i-dots"/></svg></button></td></tr>
                </tbody>
              </table>
              <div className="empty-table" id="emptyActivities">No hay actividades con estos filtros.</div>
            </div>
            <div className="table-pagination"><span id="activityResults">Mostrando 1 a 6 de 6 resultados</span><div><button aria-label="Página anterior">‹</button><button className="active">1</button><button aria-label="Página siguiente">›</button></div></div>
          </article>

          <aside className="activities-sidepanels">
            <article className="panel academic-calendar">
              <a className="sidepanel-title" href="#calendario"><svg><use href="#i-calendar"/></svg><h2>Calendario académico</h2><span>›</span></a>
              <div className="calendar-list">
                <div className="calendar-event"><div className="event-date blue"><span>MAY</span><strong>24</strong></div><div><strong>Tarea de Álgebra</strong><small>1.° A&nbsp; • &nbsp;Álgebra</small><em><i className="green-dot"></i>Vence 11:59 PM</em></div></div>
                <div className="calendar-event"><div className="event-date purple"><span>MAY</span><strong>27</strong></div><div><strong>Examen de Geometría</strong><small>1.° B&nbsp; • &nbsp;Geometría</small><em><i className="purple-dot"></i>Vence 09:00 AM</em></div></div>
                <div className="calendar-event"><div className="event-date blue"><span>MAY</span><strong>31</strong></div><div><strong>Proyecto de Estadística</strong><small>2.° A&nbsp; • &nbsp;Estadística</small><em><i className="blue-dot"></i>Vence 11:59 PM</em></div></div>
                <div className="calendar-event"><div className="event-date green"><span>JUN</span><strong>02</strong></div><div><strong>Tarea de Funciones</strong><small>2.° B&nbsp; • &nbsp;Álgebra</small><em><i className="green-dot"></i>Vence 11:59 PM</em></div></div>
                <div className="calendar-event"><div className="event-date purple"><span>JUN</span><strong>06</strong></div><div><strong>Examen Trimestral</strong><small>3.° A&nbsp; • &nbsp;Matemáticas</small><em><i className="purple-dot"></i>Vence 09:00 AM</em></div></div>
              </div>
              <a className="calendar-footer" href="#calendario-completo">Ver calendario completo <span>→</span></a>
            </article>

            <article className="panel review-load">
              <a className="sidepanel-title" href="#revision"><svg><use href="#i-group"/></svg><h2>Carga de revisión</h2><span>›</span></a>
              <div className="review-head"><span>Docente</span><span>Por revisar</span></div>
              <div className="teacher-row"><span className="teacher-avatar t1">ML</span><strong>María López</strong><div><i style={{ width: "78%" }}></i></div><b>18</b></div>
              <div className="teacher-row"><span className="teacher-avatar t2">JP</span><strong>Juan Pérez</strong><div><i style={{ width: "52%" }}></i></div><b>12</b></div>
              <div className="teacher-row"><span className="teacher-avatar t3">AM</span><strong>Ana Martínez</strong><div><i style={{ width: "31%" }}></i></div><b>7</b></div>
              <div className="teacher-row"><span className="teacher-avatar t4">CR</span><strong>Carlos Ramírez</strong><div><i style={{ width: "22%" }}></i></div><b>5</b></div>
              <a className="calendar-footer" href="#docentes">Ver todos los docentes <span>→</span></a>
            </article>
          </aside>
        </section>
      </main>
    </AdminLayout>
  );
}

export default ActivitiesAdmin;
