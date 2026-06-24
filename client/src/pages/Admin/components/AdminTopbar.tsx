type AdminTopbarProps = {
  onMenuClick: () => void;
};

function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <header className="topbar">
      <button className="menu-button" id="menuButton" type="button" aria-label="Abrir menú" onClick={onMenuClick}>
        <svg><use href="#i-menu" /></svg>
      </button>
      <div className="topbar-actions">
        <button className="icon-button notification" type="button" aria-label="Notificaciones">
          <svg><use href="#i-bell" /></svg><span>3</span>
        </button>
        <button className="school-year" type="button">
          Año escolar 2024–2025 <svg><use href="#i-down" /></svg>
        </button>
        <button className="account-button" type="button" aria-label="Perfil">
          <span className="avatar avatar-small"><span></span></span>
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
