import AdminLayout from "../AdminLayout/AdminLayout";
import "./ResourcesAdmin.css";

function ResourcesAdmin() {
  return (
    <AdminLayout activePage="resources" shellClassName="resources-page">
      <main className="resources-main">
        <section className="resources-heading">
          <div>
            <p className="eyebrow">Biblioteca académica</p>
            <h1>Recursos y contenido</h1>
            <p>Gestiona materiales educativos, bibliotecas, categorías y estado de publicación.</p>
          </div>
          <div className="resources-heading-actions">
            <button className="btn btn-primary" id="uploadResource" type="button"><svg><use href="#i-upload-cloud"/></svg>Subir recurso</button>
            <button className="btn btn-outline" id="createCollection" type="button"><svg><use href="#i-folder"/></svg>Crear colección</button>
          </div>
        </section>

        <section className="resource-stats" aria-label="Resumen de recursos">
          <article className="stat-card"><div className="stat-icon blue"><svg><use href="#i-folder-solid"/></svg></div><div><p>Recursos totales</p><strong>532</strong><small className="positive">↑ 8.4% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-check-solid"/></svg></div><div><p>Publicados</p><strong>417</strong><small className="positive">↑ 6.2% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon yellow"><svg><use href="#i-clock-outline"/></svg></div><div><p>En revisión</p><strong>38</strong><small className="positive">↑ 11.8% <span>vs. mes anterior</span></small></div></article>
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-download"/></svg></div><div><p>Descargas este mes</p><strong>9,840</strong><small className="positive">↑ 12.5% <span>vs. mes anterior</span></small></div></article>
        </section>

        <section className="panel resource-filters">
          <label className="resource-search"><svg><use href="#i-search"/></svg><input id="resourceSearch" type="search" placeholder="Buscar recursos..." aria-label="Buscar recursos" /></label>
          <label>Materia<select id="resourceSubject"><option value="">Todas</option><option>Álgebra</option><option>Geometría</option><option>Estadística</option><option>Cálculo</option></select></label>
          <label>Nivel<select id="resourceLevel"><option value="">Todos</option><option>Primaria</option><option>Secundaria</option><option>Preparatoria</option></select></label>
          <label>Formato<select id="resourceFormat"><option value="">Todos</option><option>PDF</option><option>Excel</option><option>PPTX</option><option>Video</option></select></label>
          <label>Estado<select id="resourceStatus"><option value="">Todos</option><option>Publicado</option><option>En revisión</option><option>Archivado</option></select></label>
          <button className="filter-button" id="resetResourceFilters" type="button"><svg><use href="#i-filter"/></svg>Filtros</button>
        </section>

        <section className="resources-workspace">
          <article className="panel resources-table-panel">
            <div className="resources-table-wrap">
              <table className="resources-table">
                <thead><tr><th>Recurso</th><th>Materia</th><th>Formato</th><th>Nivel</th><th>Autor</th><th>Estado</th><th>Fecha</th><th aria-label="Acciones"></th></tr></thead>
                <tbody id="resourcesTableBody">
                  <tr data-subject="Álgebra" data-level="Secundaria" data-format="PDF" data-status="Publicado"><td><div className="resource-name"><span className="file-icon pdf"><svg><use href="#i-file"/></svg><b>PDF</b></span><div><strong>Guía de Álgebra Básica</strong><small>Conceptos fundamentales y ejercicios resueltos para nivel básico.</small></div></div></td><td>Álgebra</td><td><span className="format-pill pdf">PDF</span></td><td>Secundaria</td><td>María López</td><td><span className="status active">Publicado</span></td><td><strong>24 May 2024</strong><small>10:30 AM</small></td><td><button className="row-menu" aria-label="Acciones de Guía de Álgebra"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-subject="Geometría" data-level="Secundaria" data-format="Excel" data-status="En revisión"><td><div className="resource-name"><span className="file-icon excel"><svg><use href="#i-file"/></svg><b>XLSX</b></span><div><strong>Banco de ejercicios de Geometría</strong><small>Más de 200 ejercicios con soluciones detalladas.</small></div></div></td><td>Geometría</td><td><span className="format-pill excel">Excel</span></td><td>Secundaria</td><td>Juan Pérez</td><td><span className="status review">En revisión</span></td><td><strong>23 May 2024</strong><small>04:15 PM</small></td><td><button className="row-menu" aria-label="Acciones de Banco de Geometría"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-subject="Estadística" data-level="Preparatoria" data-format="PPTX" data-status="Publicado"><td><div className="resource-name"><span className="file-icon ppt"><svg><use href="#i-file"/></svg><b>PPTX</b></span><div><strong>Presentación de Estadística</strong><small>Medidas de tendencia central y dispersión.</small></div></div></td><td>Estadística</td><td><span className="format-pill ppt">PPTX</span></td><td>Preparatoria</td><td>Ana Torres</td><td><span className="status active">Publicado</span></td><td><strong>22 May 2024</strong><small>09:20 AM</small></td><td><button className="row-menu" aria-label="Acciones de Presentación de Estadística"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-subject="Álgebra" data-level="Secundaria" data-format="Video" data-status="Archivado"><td><div className="resource-name"><span className="file-icon video"><svg><use href="#i-file"/></svg><b>MP4</b></span><div><strong>Video: Ecuaciones lineales</strong><small>Explicación paso a paso con ejemplos prácticos.</small></div></div></td><td>Álgebra</td><td><span className="format-pill video">Video</span></td><td>Secundaria</td><td>Carlos Ramírez</td><td><span className="status closed">Archivado</span></td><td><strong>20 May 2024</strong><small>02:45 PM</small></td><td><button className="row-menu" aria-label="Acciones de Video de ecuaciones"><svg><use href="#i-dots"/></svg></button></td></tr>
                  <tr data-subject="Cálculo" data-level="Preparatoria" data-format="PDF" data-status="Publicado"><td><div className="resource-name"><span className="file-icon pdf"><svg><use href="#i-file"/></svg><b>PDF</b></span><div><strong>Introducción al cálculo diferencial</strong><small>Límites, derivadas y aplicaciones.</small></div></div></td><td>Cálculo</td><td><span className="format-pill pdf">PDF</span></td><td>Preparatoria</td><td>Ana Torres</td><td><span className="status active">Publicado</span></td><td><strong>18 May 2024</strong><small>12:10 PM</small></td><td><button className="row-menu" aria-label="Acciones de Introducción al cálculo"><svg><use href="#i-dots"/></svg></button></td></tr>
                </tbody>
              </table>
              <div className="empty-table" id="emptyResources">No encontramos recursos con esos filtros.</div>
            </div>
            <div className="resource-pagination"><span id="resourceResults">Mostrando 1 a 5 de 532 recursos</span><div><button>‹</button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>107</button><button>›</button></div><select aria-label="Recursos por página"><option>10 por página</option><option>20 por página</option><option>50 por página</option></select></div>
          </article>

          <aside className="resource-sidepanels">
            <article className="panel categories-panel">
              <div className="resource-panel-head"><h2>Categorías destacadas</h2><a href="#categorias">Ver todas</a></div>
              <div className="category-grid">
                <a href="#algebra"><span className="category-icon blue">x²</span><div><strong>Álgebra</strong><small>156 recursos</small></div></a>
                <a href="#geometria"><span className="category-icon green">∠</span><div><strong>Geometría</strong><small>128 recursos</small></div></a>
                <a href="#estadistica"><span className="category-icon purple"><svg><use href="#i-bars-solid"/></svg></span><div><strong>Estadística</strong><small>94 recursos</small></div></a>
                <a href="#calculo"><span className="category-icon orange">∫</span><div><strong>Cálculo</strong><small>72 recursos</small></div></a>
              </div>
            </article>

            <article className="panel recent-resources">
              <div className="resource-panel-head"><h2>Recursos recientes</h2><a href="#recientes">Ver todas</a></div>
              <div className="recent-resource-list">
                <div><span className="mini-file pdf"><svg><use href="#i-file"/></svg></span><p><strong>Guía de funciones cuadráticas</strong><small>PDF&nbsp; • &nbsp;María López</small></p><time>Hoy, 09:15 AM</time></div>
                <div><span className="mini-file excel"><svg><use href="#i-file"/></svg></span><p><strong>Ejercicios de trigonometría</strong><small>Excel&nbsp; • &nbsp;Juan Pérez</small></p><time>Ayer, 04:40 PM</time></div>
                <div><span className="mini-file ppt"><svg><use href="#i-file"/></svg></span><p><strong>Introducción al cálculo diferencial</strong><small>PPTX&nbsp; • &nbsp;Ana Torres</small></p><time>21 May 2024</time></div>
              </div>
              <a className="recent-footer" href="#recientes">Ver todos los recursos recientes <span>→</span></a>
            </article>
          </aside>
        </section>
      </main>
    </AdminLayout>
  );
}

export default ResourcesAdmin;
