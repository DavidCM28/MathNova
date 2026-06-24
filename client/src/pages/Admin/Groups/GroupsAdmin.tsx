import AdminLayout from "../AdminLayout/AdminLayout";
import "./GroupsAdmin.css";

function GroupsAdmin() {
  return (
    <AdminLayout activePage="groups" shellClassName="groups-page">
      <main className="groups-main">
        <section className="groups-heading">
          <div>
            <p className="eyebrow">Gestión académica</p>
            <h1>Gestión de grupos y cursos</h1>
            <p>Organiza grupos, asigna docentes, monitorea la capacidad y revisa los horarios.</p>
          </div>
          <div className="groups-heading-actions">
            <button className="btn btn-primary" id="createGroup" type="button"><svg><use href="#i-plus"/></svg>Crear grupo</button>
            <button className="btn btn-outline" id="assignTeacher" type="button"><svg><use href="#i-user"/></svg>Asignar docente</button>
          </div>
        </section>

        <section className="course-stats" aria-label="Resumen de grupos y cursos">
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-user-group-solid"/></svg></div><div><p>Grupos activos</p><strong>64</strong><small className="positive">↑ 3.2% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-book-solid"/></svg></div><div><p>Cursos publicados</p><strong>28</strong><small className="positive">↑ 7.1% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon blue"><svg><use href="#i-pie-solid"/></svg></div><div><p>Cupo promedio</p><strong>82%</strong><small className="positive">↑ 4.6% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon orange"><svg><use href="#i-alert"/></svg></div><div><p>Asignaciones pendientes</p><strong>9</strong><small className="negative">↓ 18.2% <span>vs. mes anterior</span></small></div></article>
        </section>

        <section className="groups-workspace">
          <article className="panel groups-table-panel">
            <div className="table-filters">
              <label>Nivel<select id="levelFilter"><option value="">Todos</option><option>Primaria</option><option>Secundaria</option><option>Bachillerato</option></select></label>
              <label>Turno<select id="shiftFilter"><option value="">Todos</option><option>Matutino</option><option>Vespertino</option></select></label>
              <label>Estado<select id="statusFilter"><option value="">Todos</option><option>Activo</option><option>En revisión</option><option>Completo</option></select></label>
              <label className="search-field"><svg><use href="#i-search"/></svg><input id="groupSearch" type="search" placeholder="Buscar grupo, curso o docente..." aria-label="Buscar grupos" /></label>
            </div>

            <div className="table-scroll">
              <table className="groups-table">
                <thead><tr><th>Grupo</th><th>Curso</th><th>Docente</th><th>Alumnos</th><th>Horario</th><th>Estado</th><th aria-label="Acciones"></th></tr></thead>
                <tbody id="groupsTableBody">
                  <tr data-level="Secundaria" data-shift="Matutino" data-status="Activo"><td><span className="group-badge purple">3°A</span></td><td>Álgebra I</td><td>Laura Méndez</td><td>28 / 30</td><td>Lun, Mié, Vie<br /><span>08:00 – 09:30</span></td><td><span className="status active">Activo</span></td><td><button className="row-menu" aria-label="Acciones de 3°A"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Secundaria" data-shift="Matutino" data-status="Activo"><td><span className="group-badge blue">2°B</span></td><td>Geometría</td><td>Javier Ramírez</td><td>26 / 30</td><td>Mar, Jue<br /><span>10:00 – 11:30</span></td><td><span className="status active">Activo</span></td><td><button className="row-menu" aria-label="Acciones de 2°B"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Primaria" data-shift="Matutino" data-status="En revisión"><td><span className="group-badge green">1°A</span></td><td>Aritmética</td><td>María López</td><td>22 / 25</td><td>Lun, Mié, Vie<br /><span>10:00 – 11:00</span></td><td><span className="status review">En revisión</span></td><td><button className="row-menu" aria-label="Acciones de 1°A"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Bachillerato" data-shift="Matutino" data-status="Completo"><td><span className="group-badge purple">3°B</span></td><td>Trigonometría</td><td>Carlos Ortega</td><td>30 / 30</td><td>Mar, Jue<br /><span>08:00 – 09:30</span></td><td><span className="status full">Completo</span></td><td><button className="row-menu" aria-label="Acciones de 3°B"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Secundaria" data-shift="Vespertino" data-status="Activo"><td><span className="group-badge blue">2°A</span></td><td>Estadística</td><td>Ana Torres</td><td>24 / 28</td><td>Lun, Mié<br /><span>12:00 – 13:30</span></td><td><span className="status active">Activo</span></td><td><button className="row-menu" aria-label="Acciones de 2°A"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Primaria" data-shift="Vespertino" data-status="En revisión"><td><span className="group-badge green">1°B</span></td><td>Matemáticas I</td><td>Diego Salazar</td><td>19 / 25</td><td>Mar, Jue, Vie<br /><span>12:00 – 13:00</span></td><td><span className="status review">En revisión</span></td><td><button className="row-menu" aria-label="Acciones de 1°B"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-level="Bachillerato" data-shift="Vespertino" data-status="Activo"><td><span className="group-badge orange">4°C</span></td><td>Cálculo diferencial</td><td>Sofía Herrera</td><td>21 / 26</td><td>Lun, Jue<br /><span>15:00 – 16:30</span></td><td><span className="status active">Activo</span></td><td><button className="row-menu" aria-label="Acciones de 4°C"><svg><use href="#i-dots"/></svg></button></td></tr>
                </tbody>
              </table>
              <div className="empty-table" id="emptyTable">No encontramos grupos con esos filtros.</div>
            </div>
          </article>

          <aside className="groups-sidepanels">
            <article className="panel level-summary">
              <div className="sidepanel-title"><svg><use href="#i-bars-solid"/></svg><h2>Resumen por nivel</h2></div>
              <div className="level-row"><div><strong>Primaria</strong><span>18 grupos</span></div><div className="level-track"><i style={{ width: "72%" }}></i></div><div><small>130 / 180 alumnos</small><b>72%</b></div></div>
              <div className="level-row"><div><strong>Secundaria</strong><span>30 grupos</span></div><div className="level-track"><i style={{ width: "83%" }}></i></div><div><small>360 / 430 alumnos</small><b>83%</b></div></div>
              <div className="level-row"><div><strong>Bachillerato</strong><span>16 grupos</span></div><div className="level-track"><i style={{ width: "88%" }}></i></div><div><small>280 / 320 alumnos</small><b>88%</b></div></div>
              <a className="panel-link" href="#detalle">Ver detalle por nivel <span>›</span></a>
            </article>

            <article className="panel openings-panel">
              <div className="sidepanel-title"><svg><use href="#i-calendar"/></svg><h2>Próximas aperturas</h2></div>
              <div className="opening-list">
                <div className="opening-item"><div className="mini-date"><span>JUN</span><strong>03</strong></div><div><strong>3°C – Álgebra II</strong><small>Lunes, 03 de junio de 2024</small></div><em>Secundaria</em></div>
                <div className="opening-item"><div className="mini-date"><span>JUN</span><strong>10</strong></div><div><strong>2°C – Geometría Avanzada</strong><small>Lunes, 10 de junio de 2024</small></div><em>Secundaria</em></div>
                <div className="opening-item"><div className="mini-date"><span>JUN</span><strong>17</strong></div><div><strong>1°C – Matemáticas I</strong><small>Lunes, 17 de junio de 2024</small></div><em>Bachillerato</em></div>
              </div>
              <a className="panel-link" href="#aperturas">Ver todas las aperturas <span>›</span></a>
            </article>
          </aside>
        </section>
      </main>
    </AdminLayout>
  );
}

export default GroupsAdmin;
