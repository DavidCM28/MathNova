import AdminLayout from "../AdminLayout/AdminLayout";
import "./SettingsAdmin.css";

function SettingsAdmin() {
  return (
    <AdminLayout activePage="settings" shellClassName="settings-page">
      <main className="settings-main">
        <section className="settings-heading"><div><h1>Configuración y permisos</h1><p>Personaliza la configuración global, define roles y asegura las reglas de acceso.</p></div><div><button className="btn settings-save" id="saveSettings" type="button"><svg><use href="#i-save"/></svg>Guardar cambios</button><button className="btn btn-primary" id="createRoleTop" type="button"><svg><use href="#i-plus"/></svg>Crear rol</button></div></section>

        <div className="settings-tabs" role="tablist" aria-label="Secciones de configuración"><button type="button" data-settings-tab="General">General</button><button className="active" type="button" data-settings-tab="Roles y permisos">Roles y permisos</button><button type="button" data-settings-tab="Notificaciones">Notificaciones</button><button type="button" data-settings-tab="Seguridad">Seguridad</button></div>

        <section className="settings-stats">
          <article className="stat-card"><div className="stat-icon blue"><svg><use href="#i-user-group-solid"/></svg></div><div><p>Roles activos</p><strong>6</strong><small>roles definidos en el sistema</small></div></article>
          <article className="stat-card"><div className="stat-icon green"><svg><use href="#i-key-solid"/></svg></div><div><p>Permisos personalizados</p><strong>24</strong><small>permisos configurados</small></div></article>
          <article className="stat-card"><div className="stat-icon purple"><svg><use href="#i-shield-solid"/></svg></div><div><p>Reglas de seguridad</p><strong>14</strong><small>reglas activas</small></div></article>
        </section>

        <section className="settings-workspace">
          <article className="panel roles-panel">
            <div className="settings-panel-head"><h2>Roles del sistema</h2><p>Selecciona un rol para ver y editar sus permisos.</p></div>
            <div className="role-list" id="roleList">
              <button className="active" type="button" data-role="Super Administrador"><span className="role-icon blue"><svg><use href="#i-shield-solid"/></svg></span><span><strong>Super Administrador</strong><small>Acceso total al sistema</small></span><em>Activo</em></button>
              <button type="button" data-role="Administrador"><span className="role-icon blue"><svg><use href="#i-shield-solid"/></svg></span><span><strong>Administrador</strong><small>Gestión de administración general</small></span><em>Activo</em></button>
              <button type="button" data-role="Coordinador"><span className="role-icon purple"><svg><use href="#i-badge"/></svg></span><span><strong>Coordinador</strong><small>Gestión académica</small></span><em>Activo</em></button>
              <button type="button" data-role="Docente"><span className="role-icon orange"><svg><use href="#i-user-solid"/></svg></span><span><strong>Docente</strong><small>Gestión de clases y actividades</small></span><em>Activo</em></button>
              <button type="button" data-role="Alumno"><span className="role-icon teal"><svg><use href="#i-user-card"/></svg></span><span><strong>Alumno</strong><small>Acceso a su información</small></span><em>Activo</em></button>
              <button type="button" data-role="Padre"><span className="role-icon yellow"><svg><use href="#i-user-solid"/></svg></span><span><strong>Padre</strong><small>Acceso a información de su(s) hijo(s)</small></span><em>Activo</em></button>
            </div>
            <button className="create-role-link" id="createRoleInline" type="button"><span>+</span> Crear rol</button>
          </article>

          <div className="settings-right">
            <article className="panel permissions-panel">
              <div className="permissions-heading"><div><h2>Matriz de permisos</h2><p>Define los permisos que tiene asignado el rol seleccionado.</p></div><span>ⓘ&nbsp; Rol seleccionado: <strong id="selectedRole">Super Administrador</strong></span></div>
              <div className="permissions-table-wrap"><table className="permissions-table"><thead><tr><th>Módulo / Permiso</th><th>Ver</th><th>Crear</th><th>Editar</th><th>Eliminar</th><th>Exportar</th><th>Aprobar</th></tr></thead><tbody>
                <tr><td><svg><use href="#i-users"/></svg>Usuarios</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td><svg><use href="#i-group"/></svg>Grupos</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td><svg><use href="#i-edit"/></svg>Actividades</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td><svg><use href="#i-chart"/></svg>Reportes</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td><svg><use href="#i-folder"/></svg>Recursos</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
                <tr><td><svg><use href="#i-settings"/></svg>Configuración</td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td><td><input type="checkbox" defaultChecked /></td></tr>
              </tbody></table></div>
            </article>

            <div className="settings-bottom-panels">
              <article className="panel toggle-panel"><h2><svg><use href="#i-shield-outline"/></svg>Políticas de seguridad</h2><div className="toggle-row"><div><strong>Expiración de sesión por inactividad</strong><small>Cerrar sesión automáticamente tras 30 minutos de inactividad.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Expiración de sesión"></button></div><div className="toggle-row"><div><strong>Contraseña segura obligatoria</strong><small>Requiere contraseñas con mínimo 8 caracteres y combinación.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Contraseña segura"></button></div><div className="toggle-row"><div><strong>Verificación en dos pasos (2FA)</strong><small>Requiere verificación adicional para usuarios con roles administrativos.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Verificación en dos pasos"></button></div><div className="toggle-row"><div><strong>Registro de auditoría</strong><small>Registrar acciones críticas realizadas en el sistema.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Registro de auditoría"></button></div></article>
              <article className="panel toggle-panel"><h2><svg><use href="#i-bell"/></svg>Notificaciones del sistema</h2><div className="toggle-row"><div><strong>Nuevos usuarios registrados</strong><small>Notificar cuando se registre un nuevo usuario en el sistema.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Nuevos usuarios"></button></div><div className="toggle-row"><div><strong>Cambios en roles y permisos</strong><small>Notificar cuando se creen o modifiquen roles y permisos.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Cambios en permisos"></button></div><div className="toggle-row"><div><strong>Intentos de acceso fallidos</strong><small>Notificar intentos de acceso fallidos repetidos.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Accesos fallidos"></button></div><div className="toggle-row"><div><strong>Actualizaciones del sistema</strong><small>Notificar sobre actualizaciones y mantenimientos programados.</small></div><button className="switch on" type="button" aria-pressed="true" aria-label="Actualizaciones"></button></div></article>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}

export default SettingsAdmin;
