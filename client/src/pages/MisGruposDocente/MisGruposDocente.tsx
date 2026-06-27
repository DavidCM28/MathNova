import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MisGruposDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";
import heroMisGrupos from "../../assets/hero-banner-docentes-mis-grupos.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiBarChart2,
  FiChevronDown,
  FiPlus,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiUserPlus,
  FiEye,
  FiPieChart,
} from "react-icons/fi";

function MisGruposDocente() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("ver-grupos");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  const seleccionarMenu = (menu: string) => {
    setSelectedMenu(menu);
  };

  const irARuta = (ruta: string, menu?: string) => {
    if (menu) {
      setSelectedMenu(menu);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const grupos = [
    {
      nombre: "2°A",
      alumnos: "24 alumnos",
      promedio: "85%",
      color: "blue",
    },
    {
      nombre: "2°B",
      alumnos: "22 alumnos",
      promedio: "78%",
      color: "purple",
    },
    {
      nombre: "1°C",
      alumnos: "26 alumnos",
      promedio: "88%",
      color: "green",
    },
    {
      nombre: "3°A",
      alumnos: "24 alumnos",
      promedio: "76%",
      color: "orange",
    },
  ];

  const gruposFiltrados = grupos.filter((grupo) => {
    const textoBusqueda = busqueda.toLowerCase().trim();
    const coincideBusqueda = grupo.nombre.toLowerCase().includes(textoBusqueda);
    const coincideGrupo =
      grupoSeleccionado === "Todos" || grupo.nombre === grupoSeleccionado;

    return coincideBusqueda && coincideGrupo;
  });

  const totalAlumnos = grupos.reduce((total, grupo) => {
    return total + Number(grupo.alumnos.split(" ")[0]);
  }, 0);

  const promedioGeneral = Math.round(
    grupos.reduce(
      (total, grupo) => total + Number(grupo.promedio.replace("%", "")),
      0,
    ) / grupos.length,
  );

  return (
    <main className="docente-page">
      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="docente-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`docente-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="docente-sidebar-scroll">
          <img src={logo} alt="MathNova" className="docente-sidebar-logo" />

          <nav className="docente-sidebar-menu">
            <button
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
              type="button"
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
                type="button"
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => seleccionarMenu("ver-grupos")}
                  type="button"
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                  type="button"
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
                type="button"
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                  type="button"
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                  type="button"
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                  type="button"
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <button
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
              type="button"
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
              type="button"
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="docente-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="mgd-content">
        <section className="mgd-header">
          <div className="mgd-header-text">
            <h1>Mis grupos</h1>
            <p>Administra y revisa los grupos que tienes a tu cargo.</p>
          </div>

          <img
            src={heroMisGrupos}
            alt="Mis grupos docente"
            className="mgd-hero-img"
          />
        </section>

        <section className="mgd-filter-card">
          <div className="mgd-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar grupo por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <label className="mgd-filter-box">
            <span>Filtrar por grupo</span>
            <select
              value={grupoSeleccionado}
              onChange={(e) => setGrupoSeleccionado(e.target.value)}
            >
              <option>Todos</option>
              {grupos.map((grupo) => (
                <option key={grupo.nombre}>{grupo.nombre}</option>
              ))}
            </select>
          </label>

          <button
            className="mgd-create-btn"
            onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
            type="button"
          >
            <FiPlus />
            Crear grupo
          </button>
        </section>

        <section className="mgd-stats-row">
          <article className="mgd-stat-card blue-card">
            <div>
              <h3>Total de grupos</h3>
              <strong>{grupos.length}</strong>
              <p>Activos este ciclo</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUsers />
            </div>
          </article>

          <article className="mgd-stat-card green-card">
            <div>
              <h3>Alumnos totales</h3>
              <strong>{totalAlumnos}</strong>
              <p>En todos tus grupos</p>
            </div>

            <div className="mgd-stat-icon">
              <FiUserPlus />
            </div>
          </article>

          <article className="mgd-stat-card orange-card">
            <div>
              <h3>Promedio general</h3>
              <strong>{promedioGeneral}%</strong>
              <p>Rendimiento promedio</p>
            </div>

            <div className="mgd-stat-icon">
              <FiPieChart />
            </div>
          </article>
        </section>

        <section className="mgd-main-grid">
          <section className="mgd-groups-grid">
            {gruposFiltrados.length > 0 ? (
              gruposFiltrados.map((grupo) => (
                <article className="mgd-group-card" key={grupo.nombre}>
                  <div className="mgd-group-top">
                    <h2 className={`mgd-title-${grupo.color}`}>
                      {grupo.nombre}
                    </h2>

                    <span className="mgd-students-pill">
                      <FiUsers />
                      {grupo.alumnos}
                    </span>
                  </div>

                  <div className="mgd-group-average-block">
                    <div className={`mgd-average-icon icon-${grupo.color}`}>
                      <FiPieChart />
                    </div>

                    <div>
                      <span>Promedio del grupo</span>
                      <strong className={`mgd-average-${grupo.color}`}>
                        {grupo.promedio}
                      </strong>
                    </div>
                  </div>

                  <div className="mgd-card-actions">
                    <button
                      onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                      type="button"
                    >
                      <FiEye />
                      Ver detalle
                    </button>

                    <button
                      onClick={() =>
                        irARuta("/crear-grupo-docente", "crear-grupo")
                      }
                      type="button"
                    >
                      <FiEdit />
                      Editar
                    </button>

                    <button
                      className="stats-btn"
                      onClick={() =>
                        irARuta("/estadisticas-docente", "estadisticas")
                      }
                      type="button"
                    >
                      <FiBarChart2 />
                      Ver estadísticas
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="mgd-empty-card">
                <h3>No se encontraron grupos</h3>
                <p>
                  Intenta buscar otro nombre o cambia el filtro seleccionado.
                </p>
              </article>
            )}
          </section>
        </section>

        <footer className="mgd-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="mgd-footer-icons">
            <button
              onClick={() => irARuta("/login", "logout")}
              type="button"
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <button type="button" aria-label="Ayuda">
              <FiHelpCircle className="help-icon" />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default MisGruposDocente;
