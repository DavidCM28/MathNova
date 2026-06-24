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
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
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

  const irARuta = (ruta: string) => {
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
    <main className="mgd-page">
      <button
        className={`mgd-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="mgd-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`mgd-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="mgd-sidebar-scroll">
          <img src={logo} alt="MathNova" className="mgd-sidebar-logo" />

          <nav className="mgd-sidebar-menu">
            <button
              className={`mgd-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="mgd-menu-group">
              <button
                className="mgd-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`mgd-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => seleccionarMenu("ver-grupos")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="mgd-menu-divider"></div>

            <div className="mgd-menu-group">
              <button
                className="mgd-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`mgd-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`mgd-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`mgd-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="mgd-menu-divider"></div>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`mgd-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="mgd-fox-card">
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
            onClick={() => irARuta("/crear-grupo-docente")}
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
              gruposFiltrados.map((grupo, index) => (
                <article className="mgd-group-card" key={index}>
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
                    <button onClick={() => irARuta("/lista-alumnos-docente")}>
                      <FiEye />
                      Ver detalle
                    </button>

                    <button onClick={() => irARuta("/crear-grupo-docente")}>
                      <FiEdit />
                      Editar
                    </button>

                    <button
                      className="stats-btn"
                      onClick={() => irARuta("/estadisticas-docente")}
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
            <button onClick={() => irARuta("/login")}>
              <FiLogOut className="logout-icon" />
            </button>

            <button>
              <FiHelpCircle className="help-icon" />
            </button>

            <button>
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default MisGruposDocente;
