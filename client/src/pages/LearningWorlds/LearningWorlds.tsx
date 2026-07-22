import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningWorlds.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import patronesIcon from "../../assets/patrones.png";
import fraccionesIcon from "../../assets/fracciones.png";
import divisionIcon from "../../assets/division.png";
import multiplicacionIcon from "../../assets/multiplicacion.png";
import sumaRestaIcon from "../../assets/suma-resta.png";
import heroBannerNumbers from "../../assets/hero-banner-num-ope.png";

import zorritoHola from "../../assets/zorrito-hola-explorador.png";
import novaConsejo from "../../assets/zorrito-consejo-nova.png";
import problemasIcon from "../../assets/problemas cotidianos.png";

import {
  FiBarChart2,
  FiBookOpen,
  FiEdit,
  FiGrid,
  FiHome,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import {
  obtenerIdUsuarioAutenticado,
  obtenerProgresoAlumno,
  obtenerResumenAlumno,
} from "../../services/progresoService";
import type {
  ProgresoActividad,
  ResumenAlumno,
} from "../../services/progresoService";

import { getDisplayName, isGuestSession } from "../../utils/authSession";
import { activityListRoute } from "../MathNumbersActivities/constants";

type LessonKey =
  | "suma-resta"
  | "multiplicacion"
  | "division"
  | "fracciones"
  | "patrones"
  | "problemas";

type LessonDefinition = {
  key: LessonKey;
  title: string;
  description: string;
  image: string;
  route: string;
  keywords: string[];
};

type LessonCard = LessonDefinition & {
  progress: number;
};

const lessonDefinitions: LessonDefinition[] = [
  {
    key: "suma-resta",
    title: "Suma y resta",
    description:
      "Aprende a sumar y restar números naturales de forma divertida.",
    image: sumaRestaIcon,
    route: "/actividades/mathnumbers/escuadron-tactico",
    keywords: ["suma", "resta", "jerarquia", "escuadron"],
  },
  {
    key: "multiplicacion",
    title: "Multiplicación",
    description:
      "Descubre la multiplicación y sus propiedades con ejemplos prácticos.",
    image: multiplicacionIcon,
    route: "/actividades/mathnumbers/escuadron-tactico",
    keywords: ["multiplicacion", "jerarquia", "escuadron"],
  },
  {
    key: "division",
    title: "División",
    description:
      "Entiende la división como repartir en partes iguales y mucho más.",
    image: divisionIcon,
    route: "/actividades/mathnumbers/escuadron-tactico",
    keywords: ["division", "jerarquia", "escuadron"],
  },
  {
    key: "fracciones",
    title: "Fracciones",
    description: "Aprende qué son las fracciones y cómo compararlas.",
    image: fraccionesIcon,
    route: "/actividades/mathnumbers/cofre-bienvenida",
    keywords: ["fraccion", "decimal", "cofre"],
  },
  {
    key: "patrones",
    title: "Patrones",
    description:
      "Identifica y crea patrones numéricos y geométricos paso a paso.",
    image: patronesIcon,
    route: activityListRoute,
    keywords: ["patron", "secuencia"],
  },
  {
    key: "problemas",
    title: "Problemas cotidianos",
    description: "Resuelve problemas de la vida diaria usando lo que aprendes.",
    image: problemasIcon,
    route: activityListRoute,
    keywords: ["problema", "cotidiano"],
  },
];

const coloresBarras = [
  "red",
  "blue",
  "yellow",
  "blue",
  "yellow",
  "blue",
  "green",
];

const normalizarTexto = (valor: unknown): string =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const numeroSeguro = (valor: unknown): number => {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
};

const limitarPorcentaje = (valor: unknown): number =>
  Math.min(100, Math.max(0, Math.round(numeroSeguro(valor))));

const textoActividad = (actividad: ProgresoActividad): string =>
  normalizarTexto(
    [
      actividad.mundo,
      actividad.tema,
      actividad.actividad_codigo,
      actividad.actividad_titulo,
    ].join(" "),
  );

const obtenerProgresoActividad = (actividad: ProgresoActividad): number => {
  if (actividad.completada) {
    return 100;
  }

  return limitarPorcentaje(actividad.precision);
};

const obtenerProgresoTema = (
  actividades: ProgresoActividad[],
  keywords: string[],
): number => {
  const coincidencias = actividades.filter((actividad) => {
    const texto = textoActividad(actividad);

    return keywords.some((keyword) => texto.includes(normalizarTexto(keyword)));
  });

  if (coincidencias.length === 0) {
    return 0;
  }

  return Math.max(...coincidencias.map(obtenerProgresoActividad));
};

function WorldPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumen, setResumen] = useState<ResumenAlumno | null>(null);
  const [actividades, setActividades] = useState<ProgresoActividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const navigate = useNavigate();
  const modoInvitado = isGuestSession();

  const cargarProgreso = useCallback(async () => {
    if (modoInvitado) {
      setResumen(null);
      setActividades([]);
      setErrorCarga("");
      setCargando(false);
      return;
    }

    const idUsuario = obtenerIdUsuarioAutenticado();

    if (!idUsuario) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setCargando(true);
      setErrorCarga("");

      const [respuestaResumen, respuestaActividades] = await Promise.all([
        obtenerResumenAlumno(idUsuario),
        obtenerProgresoAlumno(idUsuario),
      ]);

      setResumen(respuestaResumen?.resumen ?? null);
      setActividades(
        Array.isArray(respuestaActividades?.progreso)
          ? respuestaActividades.progreso
          : [],
      );
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el progreso.";

      setErrorCarga(mensaje);
      setResumen(null);
      setActividades([]);
      console.error("Error al cargar el progreso de MathNumbers:", error);
    } finally {
      setCargando(false);
    }
  }, [modoInvitado, navigate]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    void cargarProgreso();

    const actualizarAlVolver = () => {
      void cargarProgreso();
    };

    window.addEventListener("focus", actualizarAlVolver);

    return () => {
      window.removeEventListener("focus", actualizarAlVolver);
    };
  }, [cargarProgreso]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const estrellasTotales = numeroSeguro(
    resumen?.estrellas_totales ?? resumen?.estrellas_ganadas,
  );

  const actividadesCompletadas = numeroSeguro(
    resumen?.actividades_completadas ?? resumen?.lecciones_completadas,
  );

  const promedioGeneral = limitarPorcentaje(
    resumen?.promedio_general ??
      resumen?.precision_promedio ??
      resumen?.progreso_general,
  );

  const lessons = useMemo<LessonCard[]>(
    () =>
      lessonDefinitions.map((lesson) => ({
        ...lesson,
        progress: obtenerProgresoTema(actividades, lesson.keywords),
      })),
    [actividades],
  );

  const progresoSemanal = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const valores = Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - index));

      const inicio = fecha.getTime();
      const fin = inicio + 24 * 60 * 60 * 1000;

      return actividades.filter((actividad) => {
        if (!actividad.fecha_ultimo_intento) {
          return false;
        }

        const fechaActividad = new Date(
          actividad.fecha_ultimo_intento,
        ).getTime();

        return fechaActividad >= inicio && fechaActividad < fin;
      }).length;
    });

    const maximo = Math.max(...valores, 1);

    return valores.map((valor) =>
      valor === 0 ? 12 : Math.max(25, Math.round((valor / maximo) * 100)),
    );
  }, [actividades]);

  const saludo = modoInvitado
    ? "¡Hola, explorador!"
    : `¡Hola, ${getDisplayName().split(" ")[0] || "explorador"}!`;

  const mensajeEstrellas = cargando
    ? "Cargando progreso..."
    : errorCarga
      ? "No se pudo actualizar el progreso"
      : actividadesCompletadas > 0
        ? `${actividadesCompletadas} actividades completadas`
        : "Comienza tu primera actividad";

  return (
    <main className="learning-page">
      <button
        type="button"
        className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen((actual) => !actual)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="sidebar-logo" />

        <nav className="sidebar-menu">
          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/dashboard")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button type="button" className="menu-item active">
            <FiBookOpen />
            <span>Temas</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta(activityListRoute)}
          >
            <FiEdit />
            <span>Actividades</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="user-chip">
          <img src={zorritoHola} alt="Nova" />
          <span>{saludo}</span>
        </div>

        <div className="weekly-progress">
          <h3>Progreso semanal</h3>

          <div className="bars">
            {progresoSemanal.map((altura, index) => (
              <span
                key={`barra-${index}`}
                className={`bar ${coloresBarras[index]}`}
                style={{ height: `${altura}%` }}
                title={`${altura}% de actividad relativa`}
              />
            ))}
          </div>
        </div>
      </aside>

      <section className="learning-content">
        <section className="numbers-hero">
          <img
            src={heroBannerNumbers}
            alt="Números y operaciones"
            className="numbers-hero-img"
          />

          <div className="hero-info">
            <h1>Números y Operaciones</h1>

            <p>
              ¡Explora el planeta de los Números y Operaciones y avanza paso a
              paso!
            </p>

            <div className="stars-card">
              <div>
                <span>Estrellas totales</span>
                <strong>{cargando ? "..." : estrellasTotales}</strong>
              </div>

              <i />

              <small>{mensajeEstrellas}</small>
              <b>★</b>
            </div>

            {!cargando && promedioGeneral > 0 && (
              <p>
                Promedio actual de MathNumbers:{" "}
                <strong>{promedioGeneral}%</strong>
              </p>
            )}
          </div>
        </section>

        <section className="topics-zone">
          <div className="topics-grid">
            {lessons.map((lesson) => (
              <article className="topic-card" key={lesson.key}>
                <img src={lesson.image} alt={lesson.title} />

                <div className="topic-info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>

                <div className="progress-row">
                  <div className="progress-track">
                    <span style={{ width: `${lesson.progress}%` }} />
                  </div>
                  <strong>{cargando ? "..." : `${lesson.progress}%`}</strong>
                </div>

                <button
                  type="button"
                  className={lesson.progress > 0 ? "blue-btn" : "white-btn"}
                  onClick={() => irARuta(lesson.route)}
                >
                  {lesson.progress > 0 ? "Continuar" : "Ver tema"}
                </button>
              </article>
            ))}
          </div>

          <aside className="nova-tip">
            <h3>Consejo de Nova</h3>

            <p>
              {actividadesCompletadas > 0
                ? "¡Muy bien! Continúa practicando los temas con menor porcentaje para ganar más estrellas."
                : "¿Sabías que cada número es un pequeño secreto del planeta? ¡Sigue explorando para descubrirlos todos!"}
            </p>

            <img src={novaConsejo} alt="Nova" />
          </aside>
        </section>

        <footer className="learning-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="bottom-icons">
            <button
              type="button"
              aria-label="Ir al dashboard"
              onClick={() => irARuta("/dashboard")}
            >
              <FiHome />
            </button>

            <button
              type="button"
              aria-label="Ir a recompensas"
              onClick={() => irARuta("/recompensas")}
            >
              <FiShield />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export function NumbersWorld() {
  return <WorldPage />;
}

export function GeometryWorld() {
  return <WorldPage />;
}

export function DataWorld() {
  return <WorldPage />;
}

export default NumbersWorld;
