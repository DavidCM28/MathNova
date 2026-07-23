import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionDocentes.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import bannerGestionDocente from "../../assets/docente/gestiondocentes/banner_gestion_docente.png";

import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiEdit,
  FiBarChart2,
  FiTrendingUp,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiUserPlus,
  FiUser,
  FiClock,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiKey,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

type MenuKey =
  | "dashboard"
  | "ver-grupos"
  | "crear-grupo"
  | "administrar-alumnos"
  | "lista"
  | "calificaciones"
  | "gestion-docentes"
  | "actividades"
  | "avance-actividad"
  | "estadisticas";

type EstadoDocente = "Activo" | "Inactivo";

type Docente = {
  id: number;
  idUsuario: string;
  nombre: string;
  correo: string;
  usuario: string;
  rol: "Docente";
  estado: EstadoDocente;
  fechaRegistro: string;
  iniciales: string;
};

type FormDocente = {
  nombre: string;
  correo: string;
  usuario: string;
  contrasena: string;
  confirmarContrasena: string;
  estado: EstadoDocente;
};

const docentesIniciales: Docente[] = [
  {
    id: 1,
    idUsuario: "1042",
    nombre: "Mario Chacón",
    correo: "mario.chacon@gmail.com",
    usuario: "mario.chacon",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "15/06/2026",
    iniciales: "MC",
  },
  {
    id: 2,
    idUsuario: "1047",
    nombre: "Fernanda Soto",
    correo: "fersoto@gmail.com",
    usuario: "fersoto",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "20/06/2026",
    iniciales: "FS",
  },
  {
    id: 3,
    idUsuario: "1051",
    nombre: "Laura Medina",
    correo: "laura.medina@mathnova.com",
    usuario: "lmedina",
    rol: "Docente",
    estado: "Inactivo",
    fechaRegistro: "23/06/2026",
    iniciales: "LM",
  },
  {
    id: 4,
    idUsuario: "1056",
    nombre: "Roberto Salas",
    correo: "roberto.salas@mathnova.com",
    usuario: "rsalas",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "25/06/2026",
    iniciales: "RS",
  },

  {
    id: 5,
    idUsuario: "1061",
    nombre: "Daniela Torres",
    correo: "daniela.torres@mathnova.com",
    usuario: "dtorres",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "27/06/2026",
    iniciales: "DT",
  },
  {
    id: 6,
    idUsuario: "1064",
    nombre: "José Martínez",
    correo: "jose.martinez@mathnova.com",
    usuario: "jmartinez",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "29/06/2026",
    iniciales: "JM",
  },
  {
    id: 7,
    idUsuario: "1068",
    nombre: "Andrea Garza",
    correo: "andrea.garza@mathnova.com",
    usuario: "agarza",
    rol: "Docente",
    estado: "Inactivo",
    fechaRegistro: "01/07/2026",
    iniciales: "AG",
  },
  {
    id: 8,
    idUsuario: "1072",
    nombre: "Carlos Méndez",
    correo: "carlos.mendez@mathnova.com",
    usuario: "cmendez",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "03/07/2026",
    iniciales: "CM",
  },
  {
    id: 9,
    idUsuario: "1075",
    nombre: "Patricia Ríos",
    correo: "patricia.rios@mathnova.com",
    usuario: "prios",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "05/07/2026",
    iniciales: "PR",
  },
  {
    id: 10,
    idUsuario: "1079",
    nombre: "Miguel Herrera",
    correo: "miguel.herrera@mathnova.com",
    usuario: "mherrera",
    rol: "Docente",
    estado: "Inactivo",
    fechaRegistro: "07/07/2026",
    iniciales: "MH",
  },
  {
    id: 11,
    idUsuario: "1083",
    nombre: "Sofía Navarro",
    correo: "sofia.navarro@mathnova.com",
    usuario: "snavarro",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "09/07/2026",
    iniciales: "SN",
  },
  {
    id: 12,
    idUsuario: "1087",
    nombre: "Eduardo Campos",
    correo: "eduardo.campos@mathnova.com",
    usuario: "ecampos",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "11/07/2026",
    iniciales: "EC",
  },
  {
    id: 13,
    idUsuario: "1091",
    nombre: "Natalia Luna",
    correo: "natalia.luna@mathnova.com",
    usuario: "nluna",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "13/07/2026",
    iniciales: "NL",
  },
  {
    id: 14,
    idUsuario: "1095",
    nombre: "Ricardo Vega",
    correo: "ricardo.vega@mathnova.com",
    usuario: "rvega",
    rol: "Docente",
    estado: "Inactivo",
    fechaRegistro: "15/07/2026",
    iniciales: "RV",
  },
  {
    id: 15,
    idUsuario: "1099",
    nombre: "Mariana Flores",
    correo: "mariana.flores@mathnova.com",
    usuario: "mflores",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "17/07/2026",
    iniciales: "MF",
  },
  {
    id: 16,
    idUsuario: "1103",
    nombre: "Alejandro Cruz",
    correo: "alejandro.cruz@mathnova.com",
    usuario: "acruz",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "19/07/2026",
    iniciales: "AC",
  },
  {
    id: 17,
    idUsuario: "1107",
    nombre: "Gabriela Ortiz",
    correo: "gabriela.ortiz@mathnova.com",
    usuario: "gortiz",
    rol: "Docente",
    estado: "Activo",
    fechaRegistro: "21/07/2026",
    iniciales: "GO",
  },
  {
    id: 18,
    idUsuario: "1111",
    nombre: "Fernando Reyes",
    correo: "fernando.reyes@mathnova.com",
    usuario: "freyes",
    rol: "Docente",
    estado: "Inactivo",
    fechaRegistro: "23/07/2026",
    iniciales: "FR",
  },
];

const formularioInicial: FormDocente = {
  nombre: "",
  correo: "",
  usuario: "",
  contrasena: "",
  confirmarContrasena: "",
  estado: "Activo",
};

function generarContrasenaSegura() {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let resultado = "";

  for (let i = 0; i < 12; i += 1) {
    resultado += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return resultado;
}

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

function GestionDocentes() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposOpen, setGruposOpen] = useState(
    () => localStorage.getItem("docente-grupos-open") !== "false",
  );
  const [alumnosOpen, setAlumnosOpen] = useState(
    () => localStorage.getItem("docente-alumnos-open") !== "false",
  );
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("gestion-docentes");

  const [accesoDesbloqueado, setAccesoDesbloqueado] = useState(false);
  const [contrasenaAdmin, setContrasenaAdmin] = useState("");
  const [mostrarContrasenaAdmin, setMostrarContrasenaAdmin] = useState(false);
  const [mensajeAcceso, setMensajeAcceso] = useState("");

  const [docentes, setDocentes] = useState<Docente[]>(docentesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"Todos" | EstadoDocente>(
    "Todos",
  );
  const [pagina, setPagina] = useState(0);

  const [formulario, setFormulario] = useState<FormDocente>(formularioInicial);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState("");

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

  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroEstado]);

  const irARuta = (ruta: string, menu?: MenuKey) => {
    if (menu) setSelectedMenu(menu);
    setMenuOpen(false);
    navigate(ruta);
  };

  const docentesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return docentes.filter((docente) => {
      const coincideEstado =
        filtroEstado === "Todos" || docente.estado === filtroEstado;

      const coincideBusqueda =
        !termino ||
        docente.nombre.toLowerCase().includes(termino) ||
        docente.correo.toLowerCase().includes(termino) ||
        docente.usuario.toLowerCase().includes(termino) ||
        docente.idUsuario.includes(termino);

      return coincideEstado && coincideBusqueda;
    });
  }, [docentes, busqueda, filtroEstado]);

  const docentesPorPagina = 7;
  const totalPaginas = Math.max(
    1,
    Math.ceil(docentesFiltrados.length / docentesPorPagina),
  );

  const docentesVisibles = docentesFiltrados.slice(
    pagina * docentesPorPagina,
    pagina * docentesPorPagina + docentesPorPagina,
  );

  const docentesActivos = docentes.filter(
    (docente) => docente.estado === "Activo",
  ).length;
  const docentesInactivos = docentes.length - docentesActivos;

  const validarAcceso = () => {
    if (!contrasenaAdmin.trim()) {
      setMensajeAcceso("Ingresa la contraseña de superadministrador.");
      return;
    }

    setAccesoDesbloqueado(true);
    setMensajeAcceso("Acceso validado correctamente.");
    setContrasenaAdmin("");
  };

  const actualizarFormulario = <K extends keyof FormDocente>(
    campo: K,
    valor: FormDocente[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensajeFormulario("");
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setMensajeFormulario("");
    setMostrarContrasena(false);
    setMostrarConfirmacion(false);
  };

  const registrarDocente = () => {
    if (!accesoDesbloqueado) {
      setMensajeFormulario(
        "Primero debes validar el acceso de superadministrador.",
      );
      return;
    }

    if (
      !formulario.nombre.trim() ||
      !formulario.correo.trim() ||
      !formulario.usuario.trim() ||
      !formulario.contrasena
    ) {
      setMensajeFormulario("Completa todos los campos obligatorios.");
      return;
    }

    if (formulario.contrasena.length < 8) {
      setMensajeFormulario("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (formulario.contrasena !== formulario.confirmarContrasena) {
      setMensajeFormulario("Las contraseñas no coinciden.");
      return;
    }

    const repetido = docentes.some(
      (docente) =>
        docente.usuario.toLowerCase() === formulario.usuario.toLowerCase() ||
        docente.correo.toLowerCase() === formulario.correo.toLowerCase(),
    );

    if (repetido) {
      setMensajeFormulario("El usuario o correo ya está registrado.");
      return;
    }

    const nuevoDocente: Docente = {
      id: Date.now(),
      idUsuario: String(1060 + docentes.length),
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim(),
      usuario: formulario.usuario.trim(),
      rol: "Docente",
      estado: formulario.estado,
      fechaRegistro: new Date().toLocaleDateString("es-MX"),
      iniciales: obtenerIniciales(formulario.nombre) || "ND",
    };

    setDocentes((actuales) => [nuevoDocente, ...actuales]);
    setPagina(0);
    limpiarFormulario();
    setMensajeFormulario("Docente registrado correctamente.");
  };

  const cambiarEstadoDocente = (id: number) => {
    if (!accesoDesbloqueado) {
      setMensajeAcceso("Valida el acceso para modificar docentes.");
      return;
    }

    setDocentes((actuales) =>
      actuales.map((docente) =>
        docente.id === id
          ? {
              ...docente,
              estado: docente.estado === "Activo" ? "Inactivo" : "Activo",
            }
          : docente,
      ),
    );
  };

  const eliminarDocente = (id: number) => {
    if (!accesoDesbloqueado) {
      setMensajeAcceso("Valida el acceso para eliminar docentes.");
      return;
    }

    setDocentes((actuales) => actuales.filter((docente) => docente.id !== id));
    setPagina(0);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("mathnova_token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("mathnova_token");
    navigate("/login");
  };

  return (
    <main className="docente-page">
      <button
        type="button"
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
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
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                type="button"
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
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                >
                  <span />
                  Ver grupos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                >
                  <span />
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

            <div className="docente-menu-group">
              <button
                type="button"
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
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                >
                  <span />
                  Administrar alumnos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                >
                  <span />
                  Lista
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                >
                  <span />
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "gestion-docentes" ? "active" : ""
              }`}
              onClick={() => irARuta("/gestion-docentes", "gestion-docentes")}
            >
              <FiUserCheck />
              <span>Gestión de docentes</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active" : ""
              }`}
              onClick={() =>
                irARuta("/avance-actividad-docente", "avance-actividad")
              }
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
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

      <section className="gestion-docentes-content">
        <section className="gestion-docentes-hero-card">
          <div className="gestion-docentes-hero-text">
            <h1>Gestión de docentes</h1>
            <p>
              Administra el registro, acceso y estado de los usuarios docentes.
            </p>
          </div>

          <img
            src={bannerGestionDocente}
            alt="Gestión de docentes"
            className="gestion-docentes-hero-img"
          />
        </section>

        <section className="gestion-access-card">
          <div className="gestion-access-intro">
            <span className="gestion-access-icon">
              <FiShield />
            </span>

            <div>
              <h2>Acceso seguro requerido</h2>
              <p>
                Para desbloquear la gestión de docentes, valida tu contraseña de
                superadministrador.
              </p>
            </div>
          </div>

          <label className="gestion-access-field">
            <span>Contraseña de superadmin</span>

            <div>
              <input
                type={mostrarContrasenaAdmin ? "text" : "password"}
                value={contrasenaAdmin}
                onChange={(event) => {
                  setContrasenaAdmin(event.target.value);
                  setMensajeAcceso("");
                }}
                placeholder="Ingresa tu contraseña"
              />

              <button
                type="button"
                onClick={() => setMostrarContrasenaAdmin((actual) => !actual)}
                aria-label="Mostrar u ocultar contraseña"
              >
                {mostrarContrasenaAdmin ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <button
            type="button"
            className={`gestion-validate-btn ${
              accesoDesbloqueado ? "validated" : ""
            }`}
            onClick={validarAcceso}
          >
            {accesoDesbloqueado ? <FiCheck /> : <FiLock />}
            {accesoDesbloqueado ? "Acceso validado" : "Validar acceso"}
          </button>

          <div className="gestion-access-note">
            <FiInfo />
            <p>
              La contraseña de superadmin debe validarse cada vez que accedas a
              esta sección por seguridad.
            </p>
          </div>
        </section>

        {mensajeAcceso && (
          <p
            className={`gestion-message ${
              accesoDesbloqueado ? "success" : "warning"
            }`}
          >
            {mensajeAcceso}
          </p>
        )}

        <section className="gestion-stats-row">
          <article className="gestion-stat-card active">
            <div>
              <h3>Docentes activos</h3>
              <strong>{docentesActivos}</strong>
              <p>
                {docentes.length
                  ? Math.round((docentesActivos / docentes.length) * 100)
                  : 0}
                % del total
              </p>
            </div>
            <span>
              <FiUserCheck />
            </span>
          </article>

          <article className="gestion-stat-card inactive">
            <div>
              <h3>Docentes inactivos</h3>
              <strong>{docentesInactivos}</strong>
              <p>
                {docentes.length
                  ? Math.round((docentesInactivos / docentes.length) * 100)
                  : 0}
                % del total
              </p>
            </div>
            <span>
              <FiUser />
            </span>
          </article>

          <article className="gestion-stat-card pending">
            <div>
              <h3>Registros pendientes</h3>
              <strong>0</strong>
              <p>Sin solicitudes pendientes</p>
            </div>
            <span>
              <FiClock />
            </span>
          </article>
        </section>

        <section className="gestion-main-layout">
          <section className="gestion-list-column">
            <article className="gestion-list-card">
              <div className="gestion-section-title">
                <h2>Lista de docentes</h2>
              </div>

              <div className="gestion-list-tools">
                <div className="gestion-search-box">
                  <FiSearch />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar docente por nombre, correo o usuario..."
                  />
                </div>

                <div className="gestion-status-filter">
                  <span>Estado</span>
                  <div>
                    {(["Todos", "Activo", "Inactivo"] as const).map(
                      (estado) => (
                        <button
                          type="button"
                          key={estado}
                          className={filtroEstado === estado ? "active" : ""}
                          onClick={() => setFiltroEstado(estado)}
                        >
                          {estado}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="gestion-scroll-form-btn"
                  onClick={() =>
                    document
                      .querySelector(".gestion-form-card")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  <FiPlus />
                  Agregar docente
                </button>
              </div>

              <div className="gestion-table-wrap">
                <div className="gestion-table gestion-table-head">
                  <span>ID</span>
                  <span>Nombre completo</span>
                  <span>Correo</span>
                  <span>Usuario</span>
                  <span>Rol</span>
                  <span>Estado</span>
                  <span>Fecha registro</span>
                  <span>Acciones</span>
                </div>

                {docentesVisibles.length > 0 ? (
                  docentesVisibles.map((docente) => (
                    <div
                      className="gestion-table gestion-table-row"
                      key={docente.id}
                    >
                      <span>{docente.idUsuario}</span>

                      <span className="gestion-teacher-name">
                        <b>{docente.iniciales}</b>
                        {docente.nombre}
                      </span>

                      <span>{docente.correo}</span>
                      <span>{docente.usuario}</span>
                      <span>{docente.rol}</span>

                      <span>
                        <button
                          type="button"
                          className={`gestion-status-pill ${docente.estado.toLowerCase()}`}
                          onClick={() => cambiarEstadoDocente(docente.id)}
                        >
                          <i />
                          {docente.estado}
                        </button>
                      </span>

                      <span>{docente.fechaRegistro}</span>

                      <span className="gestion-actions">
                        <button
                          type="button"
                          className="edit"
                          onClick={() => cambiarEstadoDocente(docente.id)}
                          aria-label={`Cambiar estado de ${docente.nombre}`}
                        >
                          <FiRefreshCw />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          onClick={() => eliminarDocente(docente.id)}
                          aria-label={`Eliminar a ${docente.nombre}`}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="gestion-empty-table">
                    No se encontraron docentes con esos filtros.
                  </div>
                )}
              </div>

              <div className="gestion-table-footer">
                <p>
                  Mostrando {docentesVisibles.length} de{" "}
                  {docentesFiltrados.length} docentes
                </p>

                <div className="gestion-pagination">
                  <button
                    type="button"
                    className="gestion-pagination-arrow"
                    onClick={() =>
                      setPagina((actual) =>
                        actual === 0 ? totalPaginas - 1 : actual - 1,
                      )
                    }
                    disabled={totalPaginas <= 1}
                    aria-label="Página anterior"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from({ length: totalPaginas }, (_, indice) => (
                    <button
                      type="button"
                      key={indice}
                      className={`gestion-page-number ${
                        pagina === indice ? "active" : ""
                      }`}
                      onClick={() => setPagina(indice)}
                      aria-label={`Ir a la página ${indice + 1}`}
                    >
                      {indice + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="gestion-pagination-arrow"
                    onClick={() =>
                      setPagina((actual) =>
                        actual + 1 >= totalPaginas ? 0 : actual + 1,
                      )
                    }
                    disabled={totalPaginas <= 1}
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </article>

            <article className="gestion-important-card">
              <div>
                <span>
                  <FiShield />
                </span>
                <div>
                  <h2>Información importante</h2>
                  <p>
                    El id_usuario y la fecha de registro se generan
                    automáticamente.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  <FiKey />
                </span>
                <p>
                  La contraseña del docente debe guardarse protegida en el
                  backend.
                </p>
              </div>
            </article>
          </section>

          <aside className="gestion-form-card">
            <div className="gestion-form-title">
              <span>
                <FiUserPlus />
              </span>

              <div>
                <h2>Agregar nuevo docente</h2>
                <p>Completa los datos para registrar una cuenta.</p>
              </div>
            </div>

            <label className="gestion-form-field">
              <span>Nombre completo</span>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(event) =>
                  actualizarFormulario("nombre", event.target.value)
                }
                placeholder="Ej. Ana Pérez Gómez"
              />
            </label>

            <label className="gestion-form-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={formulario.correo}
                onChange={(event) =>
                  actualizarFormulario("correo", event.target.value)
                }
                placeholder="Ej. ana.perez@mathnova.com"
              />
            </label>

            <label className="gestion-form-field">
              <span>Nombre de usuario</span>
              <input
                type="text"
                value={formulario.usuario}
                onChange={(event) =>
                  actualizarFormulario("usuario", event.target.value)
                }
                placeholder="Ej. aperez"
              />
            </label>

            <label className="gestion-form-field">
              <span>Contraseña</span>

              <div className="gestion-password-row">
                <div className="gestion-password-input">
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    value={formulario.contrasena}
                    onChange={(event) =>
                      actualizarFormulario("contrasena", event.target.value)
                    }
                    placeholder="Mínimo 8 caracteres"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarContrasena((actual) => !actual)}
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {mostrarContrasena ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <button
                  type="button"
                  className="gestion-generate-btn"
                  onClick={() => {
                    const nueva = generarContrasenaSegura();
                    setFormulario((actual) => ({
                      ...actual,
                      contrasena: nueva,
                      confirmarContrasena: nueva,
                    }));
                    setMostrarContrasena(true);
                    setMostrarConfirmacion(true);
                  }}
                >
                  <FiRefreshCw />
                  Generar
                </button>
              </div>
            </label>

            <label className="gestion-form-field">
              <span>Confirmar contraseña</span>

              <div className="gestion-password-input">
                <input
                  type={mostrarConfirmacion ? "text" : "password"}
                  value={formulario.confirmarContrasena}
                  onChange={(event) =>
                    actualizarFormulario(
                      "confirmarContrasena",
                      event.target.value,
                    )
                  }
                  placeholder="Repite la contraseña"
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion((actual) => !actual)}
                  aria-label="Mostrar u ocultar confirmación"
                >
                  {mostrarConfirmacion ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label className="gestion-form-field">
              <span>Rol</span>
              <div className="gestion-locked-field">
                Docente
                <FiLock />
              </div>
            </label>

            <div className="gestion-form-field">
              <span>Estado</span>

              <div className="gestion-form-status">
                <button
                  type="button"
                  className={formulario.estado === "Activo" ? "active" : ""}
                  onClick={() => actualizarFormulario("estado", "Activo")}
                >
                  Activo
                </button>

                <button
                  type="button"
                  className={formulario.estado === "Inactivo" ? "inactive" : ""}
                  onClick={() => actualizarFormulario("estado", "Inactivo")}
                >
                  Inactivo
                </button>
              </div>
            </div>

            {mensajeFormulario && (
              <p
                className={`gestion-form-message ${
                  mensajeFormulario.includes("correctamente")
                    ? "success"
                    : "error"
                }`}
              >
                {mensajeFormulario}
              </p>
            )}

            <button
              type="button"
              className="gestion-register-btn"
              onClick={registrarDocente}
            >
              <FiUserPlus />
              Registrar docente
            </button>

            <button
              type="button"
              className="gestion-cancel-btn"
              onClick={limpiarFormulario}
            >
              <FiX />
              Cancelar
            </button>

            <div className="gestion-form-note">
              <FiInfo />
              <p>
                El id_usuario y la fecha de registro se generan automáticamente.
              </p>
            </div>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              type="button"
              onClick={cerrarSesion}
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

export default GestionDocentes;
