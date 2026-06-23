import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaAlumnosDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/hola-profe-docente.png";

import {
  FiGrid,
  FiUsers,
  FiEdit,
  FiMessageSquare,
  FiBarChart2,
  FiClipboard,
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiSearch,
  FiDownload,
  FiPrinter,
  FiMoreVertical,
  FiUser,
  FiCalendar,
} from "react-icons/fi";

type Alumno = {
  id: number;
  nombre: string;
  iniciales: string;
  grupo: string;
  edad: number;
  modulo: string;
  asistencia: number;
  promedio: number;
  estado: "Excelente" | "Bueno" | "Regular" | "En riesgo";
  color: string;
};

const alumnos: Alumno[] = [
  {
    id: 1,
    nombre: "Mariana Fuentes Ruiz",
    iniciales: "MF",
    grupo: "2°A",
    edad: 9,
    modulo: "Fracciones",
    asistencia: 96,
    promedio: 9.4,
    estado: "Excelente",
    color: "#00a86b",
  },
  {
    id: 2,
    nombre: "Santiago Jiménez López",
    iniciales: "SJ",
    grupo: "2°A",
    edad: 9,
    modulo: "Ecuaciones lineales",
    asistencia: 90,
    promedio: 8.7,
    estado: "Bueno",
    color: "#f59e0b",
  },
  {
    id: 3,
    nombre: "Ana Sofía García Pérez",
    iniciales: "AG",
    grupo: "2°A",
    edad: 10,
    modulo: "Áreas y perímetros",
    asistencia: 78,
    promedio: 7.6,
    estado: "Regular",
    color: "#f59e0b",
  },
  {
    id: 4,
    nombre: "Diego Hernández Torres",
    iniciales: "DC",
    grupo: "2°A",
    edad: 9,
    modulo: "Fracciones",
    asistencia: 62,
    promedio: 6.1,
    estado: "En riesgo",
    color: "#6d5dfc",
  },
  {
    id: 5,
    nombre: "Lucía Medina Chávez",
    iniciales: "LM",
    grupo: "2°A",
    edad: 9,
    modulo: "Ecuaciones lineales",
    asistencia: 95,
    promedio: 9.1,
    estado: "Excelente",
    color: "#14b8a6",
  },
  {
    id: 6,
    nombre: "José Valdez Ríos",
    iniciales: "JV",
    grupo: "2°A",
    edad: 10,
    modulo: "Geometría",
    asistencia: 88,
    promedio: 8.3,
    estado: "Bueno",
    color: "#06b6d4",
  },
  {
    id: 7,
    nombre: "Valeria Sánchez Morales",
    iniciales: "VS",
    grupo: "2°A",
    edad: 9,
    modulo: "Fracciones",
    asistencia: 75,
    promedio: 7.2,
    estado: "Regular",
    color: "#fb923c",
  },
  {
    id: 8,
    nombre: "Juan Ramírez Díaz",
    iniciales: "JR",
    grupo: "2°A",
    edad: 10,
    modulo: "Ecuaciones lineales",
    asistencia: 58,
    promedio: 5.8,
    estado: "En riesgo",
    color: "#3b82f6",
  },
  {
    id: 9,
    nombre: "Carla Torres Aguilar",
    iniciales: "CT",
    grupo: "2°A",
    edad: 9,
    modulo: "Áreas y perímetros",
    asistencia: 92,
    promedio: 8.9,
    estado: "Bueno",
    color: "#7c3aed",
  },
  {
    id: 10,
    nombre: "Óscar López Navarro",
    iniciales: "OL",
    grupo: "2°A",
    edad: 9,
    modulo: "Geometría",
    asistencia: 70,
    promedio: 6.9,
    estado: "Regular",
    color: "#f59e0b",
  },
];

function ListaAlumnosDocente() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("lista");

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

  return (
    <main className="lista-page">
      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
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
              onClick={() => irARuta("/dashboard-docente")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
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
                  onClick={() => irARuta("/mis-grupos-docente")}
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente")}
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
                  onClick={() => irARuta("/administrar-alumnos-docente")}
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente")}
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/calificaciones-docente")}
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
              onClick={() => irARuta("/actividades-docente")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "retroalimentacion" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/retroalimentacion-docente")}
            >
              <FiMessageSquare />
              <span>Retroalimentación</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "evaluaciones" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/evaluaciones-docente")}
            >
              <FiClipboard />
              <span>Evaluaciones</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente")}
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

      <section className="lista-content">
        <header className="lista-header">
          <h1>Lista de alumnos</h1>
          <p>
            Consulta la lista completa del grupo y la información académica de
            tus alumnos.
          </p>
        </header>

        <section className="lista-toolbar">
          <div className="lista-field grupo-field">
            <label>Grupo</label>
            <select>
              <option>2°A - Matemáticas</option>
              <option>1°B - Matemáticas</option>
              <option>3°A - Matemáticas</option>
            </select>
          </div>

          <div className="lista-search">
            <FiSearch />
            <input type="text" placeholder="Buscar alumno por nombre..." />
          </div>

          <div className="lista-field filtro-field">
            <label>Filtrar por</label>
            <select>
              <option>Todos</option>
              <option>Excelente</option>
              <option>Bueno</option>
              <option>Regular</option>
              <option>En riesgo</option>
            </select>
          </div>

          <button className="lista-outline-btn">
            <FiDownload />
            Exportar
          </button>

          <button className="lista-blue-btn">
            <FiPrinter />
            Imprimir
          </button>
        </section>

        <section className="lista-layout">
          <article className="lista-table-card">
            <div className="lista-table">
              <div className="lista-table-row lista-table-head">
                <span>No.</span>
                <span>Nombre</span>
                <span>Grupo</span>
                <span>Edad</span>
                <span>Módulo actual</span>
                <span>Asistencia</span>
                <span>Promedio</span>
                <span>Estado</span>
                <span></span>
              </div>

              {alumnos.map((alumno) => (
                <div className="lista-table-row" key={alumno.id}>
                  <span>{alumno.id}</span>

                  <span className="lista-student">
                    <span
                      className="lista-avatar"
                      style={{ background: alumno.color }}
                    >
                      {alumno.iniciales}
                    </span>
                    {alumno.nombre}
                  </span>

                  <span>{alumno.grupo}</span>
                  <span>{alumno.edad}</span>
                  <span>{alumno.modulo}</span>

                  <span className="lista-assistance">
                    <span
                      className={`dot ${
                        alumno.asistencia < 65
                          ? "red"
                          : alumno.asistencia < 80
                            ? "orange"
                            : "green"
                      }`}
                    ></span>
                    {alumno.asistencia}%
                  </span>

                  <span>{alumno.promedio}</span>

                  <span>
                    <span
                      className={`lista-status ${alumno.estado
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {alumno.estado}
                    </span>
                  </span>

                  <button className="lista-more-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              ))}
            </div>
          </article>

          <aside className="lista-side">
            <article className="lista-side-card resumen-card">
              <div className="side-title-row">
                <h2>Resumen del grupo</h2>
                <FiUser />
              </div>

              <div className="resumen-grid">
                <div>
                  <p>Total de alumnos</p>
                  <strong className="blue-number">28</strong>
                </div>

                <div>
                  <p>Promedio general</p>
                  <strong className="green-number">7.9</strong>
                </div>

                <div>
                  <p>Alumnos en riesgo</p>
                  <strong className="red-number">4</strong>
                </div>

                <div>
                  <p>Asistencia promedio</p>
                  <strong className="blue-number">81%</strong>
                </div>
              </div>
            </article>

            <article className="lista-side-card asistencia-card">
              <div className="side-title-row">
                <h2>Asistencia semanal</h2>
                <FiCalendar />
              </div>

              <div className="bar-chart">
                <div className="chart-lines">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>

                <div className="bars">
                  <div className="bar-item">
                    <strong>85</strong>
                    <span className="bar blue-bar"></span>
                    <small>Lun</small>
                  </div>

                  <div className="bar-item">
                    <strong>82</strong>
                    <span className="bar green-bar"></span>
                    <small>Mar</small>
                  </div>

                  <div className="bar-item">
                    <strong>79</strong>
                    <span className="bar yellow-bar"></span>
                    <small>Mié</small>
                  </div>

                  <div className="bar-item">
                    <strong>83</strong>
                    <span className="bar purple-bar"></span>
                    <small>Jue</small>
                  </div>

                  <div className="bar-item">
                    <strong>86</strong>
                    <span className="bar red-bar"></span>
                    <small>Vie</small>
                  </div>
                </div>
              </div>
            </article>

            <article className="lista-side-card desempeño-card">
              <h2>Distribución por desempeño</h2>

              <div className="donut-area">
                <div className="donut">
                  <span>28</span>
                </div>

                <div className="donut-legend">
                  <p>
                    <span className="legend-dot green-dot"></span>
                    Excelente (9)
                    <strong>32%</strong>
                  </p>

                  <p>
                    <span className="legend-dot blue-dot"></span>
                    Bueno (8)
                    <strong>29%</strong>
                  </p>

                  <p>
                    <span className="legend-dot orange-dot"></span>
                    Regular (7)
                    <strong>25%</strong>
                  </p>

                  <p>
                    <span className="legend-dot red-dot"></span>
                    En riesgo (4)
                    <strong>14%</strong>
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
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

export default ListaAlumnosDocente;
