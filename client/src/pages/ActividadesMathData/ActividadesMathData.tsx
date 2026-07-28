import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";
import "./ActividadesMathData.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-MathData.png";
import holaMathData from "../../assets/hola-MathData.png";
import mundoMathData from "../../assets/mundo-3-MathData.png";

import actividad1 from "../../assets/Actividad-1-MathData.png";
import actividad2 from "../../assets/Actividad-2-MathData.png";
import actividad3 from "../../assets/Actividad-3-3MathData.png";
import actividad4 from "../../assets/Actividad-4-MathData.png";
import actividad5 from "../../assets/Actividad-5-MathData.png";
import actividad6 from "../../assets/Activity-6-MathData.png";
import actividad7 from "../../assets/Actividad-7-MathData.png";
import actividad8 from "../../assets/Actividad-8-MathData.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiCircle,
  FiLock,
  FiX,
  FiArrowRight,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

const API_URL = "http://localhost:3001/api";

type EstadoActividad = "pendiente" | "en_curso" | "completada";
type FiltroEstado = "todas" | EstadoActividad;
type FiltroNivel = "todos" | "Fácil" | "Medio";

interface Actividad {
  img: string;
  titulo: string;
  texto: string;
  nivel: "Fácil" | "Medio";
  tiempo: string;
  ruta: string;
}

// Datos estáticos de las actividades. Son 8 (se acomodan en 4 + 4).
const ACTIVIDADES: Actividad[] = [
  {
    img: actividad1,
    titulo: "1. Generador de Energía",
    texto: "Completa la tabla de reactores y traza la gráfica.",
    nivel: "Fácil",
    tiempo: "12 min",
    ruta: "/actividades-math-data/generador-energia",
  },
  {
    img: actividad2,
    titulo: "2. Rampas de Lanzamiento",
    texto: "Calibra rampas identificando pendientes (+/-) y ecuaciones.",
    nivel: "Fácil",
    tiempo: "10 min",
    ruta: "/actividades-math-data/rampas-lanzamiento",
  },
  {
    img: actividad3,
    titulo: "3. Encuesta de Tripulación",
    texto: "Diseña la encuesta y construye una tabla de frecuencias.",
    nivel: "Fácil",
    tiempo: "12 min",
    ruta: "/actividades-math-data/encuesta-tripulacion",
  },
  {
    img: actividad4,
    titulo: "4. Holograma de Reportes",
    texto: "Transforma datos en gráficas de barras y circulares.",
    nivel: "Medio",
    tiempo: "15 min",
    ruta: "/actividades-math-data/holograma-reportes",
  },
  {
    img: actividad5,
    titulo: "5. Sensor de Frecuencias",
    texto: "Determina frecuencia absoluta y relativa (%) de señales.",
    nivel: "Fácil",
    tiempo: "8 min",
    ruta: "/actividades-math-data/sensor-frecuencias",
  },
  {
    img: actividad6,
    titulo: "6. Núcleo de Decisiones",
    texto: "Calcula media, mediana y moda para estimar tiempos.",
    nivel: "Medio",
    tiempo: "14 min",
    ruta: "/actividades-math-data/nucleo-decisiones",
  },
  {
    img: actividad7,
    titulo: "7. Oráculo de la Estación",
    texto: "Determina espacio muestral y compara cualitativamente eventos.",
    nivel: "Fácil",
    tiempo: "15 min",
    ruta: "/actividades-math-data/oraculo-estacion",
  },
  {
    img: actividad8,
    titulo: "8. Sala de Tres Caminos",
    texto:
      "Clasifica eventos como independientes, dependientes o excluyentes.",
    nivel: "Fácil",
    tiempo: "8 min",
    ruta: "/actividades-math-data/sala-tres-caminos",
  },
];

// Accesos rápidos del menú de ajustes (los mismos del sidebar, sin "cerrar sesión"
// porque ese ya tiene su propio ícono en el footer).
const ACCESOS_AJUSTES = [
  { icono: FiGrid, texto: "Dashboard principal", ruta: "/" },
  { icono: GiRingedPlanet, texto: "Selección de mundos", ruta: "/seleccion-mundos" },
  { icono: FiMessageSquare, texto: "Retroalimentación", ruta: "/retroalimentacion" },
  { icono: GiTrophyCup, texto: "Recompensas", ruta: "/recompensas" },
  { icono: FiUser, texto: "Perfil del alumno", ruta: "/perfil-alumno" },
  { icono: FiBarChart2, texto: "Estadísticas", ruta: "/estadisticas" },
];

// Quita acentos y normaliza mayúsculas/minúsculas para que el buscador
// encuentre resultados sin importar cómo se escriba el término.
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function ActividadesMathData() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // El ID del estudiante se obtiene de la sesión activa en cada render
  const usuarioSesion = getSessionUser();
  const ID_ESTUDIANTE = usuarioSesion?.id_usuario;

  // completadas[0] = Generador de Energía, [1] = Rampas, [2] = Tripulación, [3] = Holograma
  // Un usuario nuevo siempre arranca en "false" en las 4 posiciones, así que
  // solo la actividad 1 queda desbloqueada hasta que resuelva cada una.
  const [completadas, setCompletadas] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  // Actividades que el alumno empezó pero no ha terminado ("en curso").
  // Se guardan en localStorage para que, si sale de la actividad, al volver
  // a este panel siga viéndose marcada como "en curso".
  const [iniciadas, setIniciadas] = useState<boolean[]>(
    ACTIVIDADES.map(() => false)
  );

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>("todos");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Modal de bienvenida (icono de ayuda) y menú de ajustes (icono de engrane)
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen || mostrarAyuda ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, mostrarAyuda]);

  // Cerrar modal/menús con la tecla Escape
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMostrarAyuda(false);
      setMostrarAjustes(false);
      setFiltrosAbiertos(false);
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, []);

  // ==========================================
  // CARGAR ESTADO DE LAS 4 ACTIVIDADES CON BACKEND
  // ==========================================
  // OJO: antes este efecto se ejecutaba una sola vez (dependencias vacías),
  // así que si la sesión del usuario tardaba en estar lista, ID_ESTUDIANTE
  // llegaba como "undefined" al fetch, la petición fallaba y las actividades
  // 2, 3 y 4 se quedaban bloqueadas "solas" para siempre porque el efecto
  // nunca se volvía a ejecutar. Ahora depende de ID_ESTUDIANTE, valida la
  // respuesta antes de confiar en ella, y si no hay sesión (usuario nuevo o
  // invitado) deja el arreglo en su valor por defecto: todo en false, es
  // decir, solo la actividad 1 desbloqueada.
  useEffect(() => {
    if (!ID_ESTUDIANTE) return;

    let cancelado = false;

    const cargarEstado = async () => {
      try {
        const response = await fetch(
          `${API_URL}/progreso-general/${ID_ESTUDIANTE}`
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelado && data.success && data.data) {
          setCompletadas([
            Boolean(data.data.proporcionalidad),
            Boolean(data.data.rampas),
            Boolean(data.data.tripulacion),
            Boolean(data.data.holograma),
          ]);
        }
      } catch (error) {
        console.error("Error al cargar el estado de las actividades:", error);
      }
    };

    cargarEstado();

    return () => {
      cancelado = true;
    };
  }, [ID_ESTUDIANTE]);

  // ==========================================
  // CARGAR ACTIVIDADES "EN CURSO" (guardadas localmente)
  // ==========================================
  useEffect(() => {
    const claveIniciada = (index: number) =>
      `mathdata_iniciada_${ID_ESTUDIANTE ?? "invitado"}_${index}`;

    try {
      const guardado = ACTIVIDADES.map(
        (_, index) => localStorage.getItem(claveIniciada(index)) === "1"
      );
      setIniciadas(guardado);
    } catch (error) {
      console.error("No se pudo leer el progreso local:", error);
    }
  }, [ID_ESTUDIANTE]);

  // La actividad 0 (la nº1) siempre está desbloqueada; el resto necesita que
  // la actividad anterior esté completada. Antes había una excepción que
  // desbloqueaba automáticamente las actividades 5 a la 8 ("índice >= 4")
  // porque todavía no tenían backend propio — ese era justamente el bug:
  // un usuario nuevo veía esas 4 actividades abiertas sin haber completado
  // nada. Ahora el candado es 100% secuencial para las 8 actividades.
  // Nota: como el backend (progreso-general) hoy solo regresa el estado de
  // las actividades 1 a 4, "completadas" solo tiene 4 posiciones; para los
  // índices 4 en adelante completadas[index-1] es "undefined", lo cual se
  // evalúa como false y las mantiene bloqueadas hasta que el backend
  // también reporte su avance (se resuelve solo agregando esos campos ahí).
  const estaDesbloqueada = (index: number) => {
    if (index === 0) return true;
    return Boolean(completadas[index - 1]);
  };

  const obtenerEstado = (index: number): EstadoActividad => {
    if (completadas[index]) return "completada";
    if (iniciadas[index]) return "en_curso";
    return "pendiente";
  };

  const marcarIniciada = (index: number) => {
    if (completadas[index]) return; // ya terminada, no hace falta marcarla

    const clave = `mathdata_iniciada_${ID_ESTUDIANTE ?? "invitado"}_${index}`;

    try {
      localStorage.setItem(clave, "1");
    } catch (error) {
      console.error("No se pudo guardar el progreso local:", error);
    }

    setIniciadas((prev) => {
      const copia = [...prev];
      copia[index] = true;
      return copia;
    });
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    setMostrarAjustes(false);
    navigate(ruta);
  };

  const irAActividad = (index: number) => {
    if (!estaDesbloqueada(index)) return;

    marcarIniciada(index);
    setMenuOpen(false);
    navigate(ACTIVIDADES[index].ruta);
  };

  const toggleFiltroEstado = (valor: EstadoActividad) => {
    setFiltroEstado((prev) => (prev === valor ? "todas" : valor));
  };

  const toggleFiltroNivel = (valor: FiltroNivel) => {
    setFiltroNivel((prev) => (prev === valor ? "todos" : valor));
  };

  const coincideBusqueda = (item: Actividad, index: number) => {
    if (!busqueda.trim()) return true;

    const termino = normalizar(busqueda);
    const campos = [String(index + 1), item.titulo, item.texto, item.nivel];

    return campos.some((campo) => normalizar(campo).includes(termino));
  };

  const actividadesFiltradas = useMemo(() => {
    return ACTIVIDADES.map((item, index) => ({ item, index })).filter(
      ({ item, index }) => {
        const estado = obtenerEstado(index);

        if (filtroEstado !== "todas" && estado !== filtroEstado) return false;
        if (filtroNivel !== "todos" && item.nivel !== filtroNivel)
          return false;
        if (!coincideBusqueda(item, index)) return false;

        return true;
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, filtroEstado, filtroNivel, completadas, iniciadas]);

  const contadores = useMemo(() => {
    const base = { pendiente: 0, en_curso: 0, completada: 0 };

    ACTIVIDADES.forEach((_, index) => {
      base[obtenerEstado(index)] += 1;
    });

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completadas, iniciadas]);

  return (
    <main className="mathdatax-page">
      <button
        className={`mathdatax-hamburger-btn ${
          menuOpen ? "mathdatax-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="mathdatax-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ===================================================== */}
      {/* MODAL DE BIENVENIDA AL MUNDO MATH DATA (icono de ayuda) */}
      {/* ===================================================== */}
      {mostrarAyuda && (
        <div
          className="mathdatax-modal-overlay"
          onClick={() => setMostrarAyuda(false)}
        >
          <div
            className="mathdatax-modal-mundo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mathdatax-modal-cerrar"
              onClick={() => setMostrarAyuda(false)}
              aria-label="Cerrar"
            >
              <FiX />
            </button>

            <div className="mathdatax-modal-imagen-wrap">
              <img src={mundoMathData} alt="Mundo Math Data" />
            </div>

            <div className="mathdatax-modal-cuerpo">
              <span className="mathdatax-modal-kicker">
                <FiZap />
                Mundo Math Data
              </span>

              <h2>¡Bienvenido al mundo Math Data!</h2>

              <p>
                Aquí vas a explorar tablas, gráficas y probabilidad resolviendo
                retos interactivos, uno por uno vas a desbloquear el
                siguiente. ¿Listo para la misión?
              </p>

              <button
                className="mathdatax-modal-comenzar"
                onClick={() => setMostrarAyuda(false)}
              >
                Comenzar
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`mathdatax-sidebar ${
          menuOpen ? "mathdatax-sidebar-open" : ""
        }`}
      >
        <img src={logo} alt="MathNova" className="mathdatax-sidebar-logo" />

        <nav className="mathdatax-sidebar-menu">
          <button className="mathdatax-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="mathdatax-menu-item mathdatax-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="mathdatax-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mathdatax-sidebar-bottom">
          <div className="mathdatax-hello-box">
            <img src={holaMathData} alt="Explorador Math Data" />
            <span>¡Hola, explorador!</span>
          </div>

          <div className="mathdatax-weekly-progress">
            <div className="mathdatax-weekly-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 4</span>
            </div>

            <div className="mathdatax-star-progress">
              <span>☆</span>

              <div>
                <b></b>
              </div>

              <p>60%</p>
            </div>

            <div className="mathdatax-chart-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </aside>

      <section className="mathdatax-content">
        <img src={heroBanner} alt="Banner Math Data" className="mathdatax-bg" />

        <section className="mathdatax-main">
          <div className="mathdatax-header">
            <div className="mathdatax-title-box">
              <h1>Actividades de Math Data</h1>

              <p>Explora datos, tablas y gráficas con retos interactivos.</p>

              <div className="mathdatax-status-tabs">
                <button
                  className={
                    filtroEstado === "pendiente" ? "mathdatax-tab-activa" : ""
                  }
                  onClick={() => toggleFiltroEstado("pendiente")}
                >
                  <FiCircle />
                  Pendientes
                  <span className="mathdatax-tab-count">
                    {contadores.pendiente}
                  </span>
                </button>

                <button
                  className={
                    filtroEstado === "en_curso" ? "mathdatax-tab-activa" : ""
                  }
                  onClick={() => toggleFiltroEstado("en_curso")}
                >
                  <FiClock />
                  En curso
                  <span className="mathdatax-tab-count">
                    {contadores.en_curso}
                  </span>
                </button>

                <button
                  className={
                    filtroEstado === "completada" ? "mathdatax-tab-activa" : ""
                  }
                  onClick={() => toggleFiltroEstado("completada")}
                >
                  <FiCheckCircle />
                  Completadas
                  <span className="mathdatax-tab-count">
                    {contadores.completada}
                  </span>
                </button>
              </div>
            </div>

            <div className="mathdatax-search-area">
              <div className="mathdatax-search-box">
                <FiSearch />
                <input
                  placeholder="Buscar actividades o temas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    type="button"
                    className="mathdatax-search-clear"
                    onClick={() => setBusqueda("")}
                    aria-label="Limpiar búsqueda"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div className="mathdatax-filter-wrap">
                <button
                  className={`mathdatax-filter-btn ${
                    filtroNivel !== "todos" ? "mathdatax-filter-btn-activo" : ""
                  }`}
                  onClick={() => setFiltrosAbiertos((prev) => !prev)}
                >
                  <FiFilter />
                  Filtros
                </button>

                {filtrosAbiertos && (
                  <div className="mathdatax-filter-dropdown">
                    <strong>Nivel de dificultad</strong>

                    <button
                      className={
                        filtroNivel === "Fácil" ? "mathdatax-filter-opcion-activa" : ""
                      }
                      onClick={() => toggleFiltroNivel("Fácil")}
                    >
                      Fácil
                    </button>

                    <button
                      className={
                        filtroNivel === "Medio" ? "mathdatax-filter-opcion-activa" : ""
                      }
                      onClick={() => toggleFiltroNivel("Medio")}
                    >
                      Medio
                    </button>

                    {filtroNivel !== "todos" && (
                      <button
                        className="mathdatax-filter-limpiar"
                        onClick={() => setFiltroNivel("todos")}
                      >
                        Quitar filtro
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mathdatax-activities-grid">
            {actividadesFiltradas.length === 0 && (
              <div className="mathdatax-no-resultados">
                <FiSearch />
                <p>No encontramos actividades que coincidan con tu búsqueda.</p>
              </div>
            )}

            {actividadesFiltradas.map(({ item, index }) => {
              const bloqueada = !estaDesbloqueada(index);
              const estado = obtenerEstado(index);

              return (
                <article
                  className={`mathdatax-activity-card ${
                    bloqueada ? "mathdatax-activity-bloqueada" : ""
                  }`}
                  key={item.titulo}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="mathdatax-activity-img-wrap">
                    <img src={item.img} alt={item.titulo} />

                    {!bloqueada && (
                      <span
                        className={`mathdatax-status-badge mathdatax-status-${estado}`}
                      >
                        {estado === "completada" && <FiCheckCircle />}
                        {estado === "en_curso" && <FiClock />}
                        {estado === "pendiente" && <FiCircle />}
                        {estado === "completada" && "Completada"}
                        {estado === "en_curso" && "En curso"}
                        {estado === "pendiente" && "Pendiente"}
                      </span>
                    )}

                    {bloqueada && (
                      <div className="mathdatax-lock-overlay">
                        <FiLock />
                      </div>
                    )}
                  </div>

                  <div className="mathdatax-activity-info">
                    <h3>{item.titulo}</h3>

                    <p>{item.texto}</p>

                    <span
                      className={
                        item.nivel === "Fácil"
                          ? "mathdatax-easy"
                          : "mathdatax-medium"
                      }
                    >
                      {item.nivel}
                    </span>

                    <div className="mathdatax-activity-bottom">
                      <small>
                        <FiClock />
                        {item.tiempo}
                      </small>

                      <button
                        disabled={bloqueada}
                        onClick={() => irAActividad(index)}
                      >
                        {bloqueada
                          ? "Bloqueada"
                          : estado === "en_curso"
                          ? "Continuar"
                          : estado === "completada"
                          ? "Repasar"
                          : "Iniciar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <footer className="mathdatax-footer">
          <div className="mathdatax-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut className="mathdatax-logout-icon" />
            </button>

            <button
              onClick={() => setMostrarAyuda(true)}
              aria-label="Ayuda: introducción al mundo Math Data"
            >
              <FiHelpCircle className="mathdatax-help-icon" />
            </button>

            <div className="mathdatax-footer-icon-wrap">
              <button
                onClick={() => setMostrarAjustes((prev) => !prev)}
                aria-label="Abrir accesos rápidos"
              >
                <FiSettings className="mathdatax-settings-icon" />
              </button>

              {mostrarAjustes && (
                <>
                  <div
                    className="mathdatax-settings-overlay"
                    onClick={() => setMostrarAjustes(false)}
                  />

                  <div className="mathdatax-settings-dropdown">
                    <span className="mathdatax-settings-dropdown-titulo">
                      Accesos rápidos
                    </span>

                    {ACCESOS_AJUSTES.map(({ icono: Icono, texto, ruta }) => (
                      <button
                        key={ruta}
                        className="mathdatax-settings-item"
                        onClick={() => irARuta(ruta)}
                      >
                        <Icono />
                        <span>{texto}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathData;