import { useNavigate } from "react-router-dom";
import "./LearningWorlds.css";

import logo from "../../assets/logo_MathNova.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import mundoGeometry from "../../assets/mundo-2-MathGeometry.png";
import mundoData from "../../assets/mundo-3-MathData.png";
import novaFox from "../../assets/zorrito_login.png";

import {
  FiActivity,
  FiArchive,
  FiBarChart2,
  FiBookOpen,
  FiCheckSquare,
  FiCircle,
  FiClipboard,
  FiCompass,
  FiDivide,
  FiEdit,
  FiGrid,
  FiHome,
  FiMessageSquare,
  FiMinus,
  FiPieChart,
  FiPlus,
  FiShield,
  FiShoppingCart,
  FiSquare,
  FiSun,
  FiTriangle,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type WorldKind = "numbers" | "geometry" | "data";
type IconKind =
  | "sum"
  | "multiply"
  | "divide"
  | "fraction"
  | "patterns"
  | "daily"
  | "shapes"
  | "angles"
  | "polygons"
  | "area"
  | "volume"
  | "construction"
  | "collect"
  | "organize"
  | "bars"
  | "pie"
  | "central"
  | "trend";

interface LessonCard {
  title: string;
  description: string;
  progress: number;
  icon: IconKind;
}

interface WorldConfig {
  kind: WorldKind;
  title: string;
  subtitle: string;
  planet: string;
  rating: string;
  lessons: LessonCard[];
}

const worldConfigs: Record<WorldKind, WorldConfig> = {
  numbers: {
    kind: "numbers",
    title: "Números y\nOperaciones",
    subtitle: "¡Explora el planeta de los Números y Operaciones\ny avanza paso a paso!",
    planet: mundoNumbers,
    rating: "4/5",
    lessons: [
      {
        title: "Suma y resta",
        description: "Aprende a sumar y restar números naturales de forma divertida.",
        progress: 75,
        icon: "sum",
      },
      {
        title: "Multiplicación",
        description: "Descubre la multiplicación y sus propiedades con ejemplos prácticos.",
        progress: 60,
        icon: "multiply",
      },
      {
        title: "División",
        description: "Entiende la división como repartir en partes iguales y mucho más.",
        progress: 45,
        icon: "divide",
      },
      {
        title: "Fracciones",
        description: "Aprende qué son las fracciones y cómo compararlas.",
        progress: 70,
        icon: "fraction",
      },
      {
        title: "Patrones",
        description: "Identifica y crea patrones numéricos y geométricos paso a paso.",
        progress: 0,
        icon: "patterns",
      },
      {
        title: "Problemas cotidianos",
        description: "Resuelve problemas de la vida diaria usando lo que aprendes.",
        progress: 0,
        icon: "daily",
      },
    ],
  },
  geometry: {
    kind: "geometry",
    title: "Geometría",
    subtitle: "¡Explora el mundo de las formas, ángulos y\nvolúmenes!",
    planet: mundoGeometry,
    rating: "4/5",
    lessons: [
      {
        title: "Formas básicas",
        description: "Aprende a reconocer círculos, cuadrados y triángulos.",
        progress: 75,
        icon: "shapes",
      },
      {
        title: "Ángulos",
        description: "Descubre cómo medir ángulos agudos, rectos y obtusos.",
        progress: 60,
        icon: "angles",
      },
      {
        title: "Polígonos",
        description: "Aprende a identificar hexágonos, pentágonos y sus lados.",
        progress: 45,
        icon: "polygons",
      },
      {
        title: "Área",
        description: "Aprende a calcular el área de rectángulos, cuadrados y círculos.",
        progress: 70,
        icon: "area",
      },
      {
        title: "Volumen",
        description: "Aprende a calcular el volumen de cubos, esferas y cilindros.",
        progress: 0,
        icon: "volume",
      },
      {
        title: "Construcciones",
        description: "Aprende a usar regla y compás para dibujar formas geométricas.",
        progress: 0,
        icon: "construction",
      },
    ],
  },
  data: {
    kind: "data",
    title: "Datos y\nEstadística",
    subtitle: "¡Explora el mundo de la información, gráficos\ny tendencias!",
    planet: mundoData,
    rating: "4/5",
    lessons: [
      {
        title: "Recolección de datos",
        description: "Aprende a diseñar encuestas y recopilar información.",
        progress: 75,
        icon: "collect",
      },
      {
        title: "Organización de datos",
        description: "Usa tablas y bases de datos para organizar la información.",
        progress: 60,
        icon: "organize",
      },
      {
        title: "Gráficos de barras",
        description: "Aprende a interpretar gráficos de barras.",
        progress: 45,
        icon: "bars",
      },
      {
        title: "Gráficos de pastel",
        description: "Usa gráficos de pastel para mostrar proporciones.",
        progress: 70,
        icon: "pie",
      },
      {
        title: "Media, Mediana y Moda",
        description: "Descubre las medidas de tendencia central.",
        progress: 0,
        icon: "central",
      },
      {
        title: "Tendencias y Predicciones",
        description: "Identifica patrones y haz predicciones.",
        progress: 0,
        icon: "trend",
      },
    ],
  },
};

function MathNovaSidebar({ active }: { active: "dashboard" | "topics" | "feedback" | "stats" }) {
  const navigate = useNavigate();

  return (
    <aside className="mn-sidebar">
      <img className="mn-sidebar-logo" src={logo} alt="MathNova" />

      <nav className="mn-nav">
        <button className={`mn-nav-item ${active === "dashboard" ? "active" : ""}`} onClick={() => navigate("/") }>
          <FiGrid />
          <span>Dashboard principal</span>
        </button>
        <button className="mn-nav-item" onClick={() => navigate("/temas/numeros") }>
          <GiRingedPlanet />
          <span>Selección de mundos matemáticos</span>
        </button>
        <button className={`mn-nav-item ${active === "topics" ? "active" : ""}`} onClick={() => navigate("/temas/numeros") }>
          <FiBookOpen />
          <span>Temas</span>
        </button>
        <button className="mn-nav-item">
          <FiEdit />
          <span>Actividades</span>
        </button>
        <button className={`mn-nav-item ${active === "feedback" ? "active" : ""}`} onClick={() => navigate("/retroalimentacion") }>
          <FiMessageSquare />
          <span>Retroalimentación</span>
        </button>
        <button className="mn-nav-item">
          <GiTrophyCup />
          <span>Recompensas</span>
        </button>
        <button className="mn-nav-item" onClick={() => navigate("/perfil-alumno") }>
          <FiUser />
          <span>Perfil del alumno</span>
        </button>
        <button className={`mn-nav-item ${active === "stats" ? "active" : ""}`} onClick={() => navigate("/estadisticas") }>
          <FiBarChart2 />
          <span>Estadísticas</span>
        </button>
      </nav>

      <div className="mn-user-chip">
        <img src={novaFox} alt="Nova" />
        <span>¡Hola, explorador!</span>
      </div>

      <div className="mn-weekly-card">
        <h3>Progreso semanal</h3>
        <div className="mn-week-bars" aria-label="Progreso semanal">
          <span className="orange"></span>
          <span className="blue"></span>
          <span className="yellow"></span>
          <span className="yellow tall"></span>
          <span className="green"></span>
          <span className="blue high"></span>
          <span className="green high"></span>
        </div>
      </div>
    </aside>
  );
}

function LessonIcon({ type }: { type: IconKind }) {
  if (type === "sum") {
    return (
      <div className="lesson-symbol lesson-sum">
        <FiPlus />
        <FiMinus />
      </div>
    );
  }

  if (type === "multiply") {
    return <FiX className="lesson-symbol single-icon" />;
  }

  if (type === "divide") {
    return <FiDivide className="lesson-symbol single-icon" />;
  }

  if (type === "fraction") {
    return (
      <div className="lesson-symbol fraction-icon">
        <span></span>
        <b>¾</b>
      </div>
    );
  }

  if (type === "patterns") {
    return (
      <div className="lesson-symbol pattern-icon">
        <FiTriangle />
        <FiSquare />
        <FiCircle />
        <FiTriangle />
        <FiSquare />
        <FiCircle />
      </div>
    );
  }

  if (type === "daily") {
    return (
      <div className="lesson-symbol daily-icon">
        <FiShoppingCart />
        <span>?</span>
      </div>
    );
  }

  if (type === "shapes") {
    return (
      <div className="lesson-symbol shape-icon">
        <FiCircle />
        <FiSquare />
        <FiTriangle />
      </div>
    );
  }

  if (type === "angles") {
    return (
      <div className="lesson-symbol angle-icon">
        <FiActivity />
      </div>
    );
  }

  if (type === "polygons") {
    return (
      <div className="lesson-symbol polygon-icon">
        <span></span>
        <b></b>
      </div>
    );
  }

  if (type === "area") {
    return (
      <div className="lesson-symbol area-icon">
        <FiSquare />
        <FiCircle />
      </div>
    );
  }

  if (type === "volume") {
    return (
      <div className="lesson-symbol volume-icon">
        <FiArchive />
        <FiCircle />
      </div>
    );
  }

  if (type === "construction") {
    return (
      <div className="lesson-symbol construction-icon">
        <FiTriangle />
        <FiCompass />
      </div>
    );
  }

  if (type === "collect") {
    return <FiClipboard className="lesson-symbol single-icon" />;
  }

  if (type === "organize") {
    return <FiCheckSquare className="lesson-symbol single-icon" />;
  }

  if (type === "bars") {
    return <FiBarChart2 className="lesson-symbol single-icon" />;
  }

  if (type === "pie") {
    return <FiPieChart className="lesson-symbol single-icon" />;
  }

  if (type === "central") {
    return <FiBarChart2 className="lesson-symbol single-icon central-icon" />;
  }

  return <FiTrendingUp className="lesson-symbol single-icon" />;
}

function RatingStars({ rating }: { rating: string }) {
  return (
    <div className="mn-stars">
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span className="muted">★</span>
      <b>{rating}</b>
    </div>
  );
}

function TopicCard({ lesson }: { lesson: LessonCard }) {
  const isStarted = lesson.progress > 0;

  return (
    <article className="mn-topic-card">
      <div className="mn-topic-icon">
        <LessonIcon type={lesson.icon} />
      </div>

      <div className="mn-topic-info">
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
      </div>

      <div className="mn-progress-row">
        <div className="mn-progress-track">
          <span style={{ width: `${lesson.progress}%` }}></span>
        </div>
        <strong>{lesson.progress}%</strong>
      </div>

      <button className={isStarted ? "mn-action-btn primary" : "mn-action-btn ghost"}>
        {isStarted ? "Continuar" : "Ver tema"}
      </button>
    </article>
  );
}

function WorldHero({ config }: { config: WorldConfig }) {
  return (
    <section className={`mn-world-hero ${config.kind}`}>
      <div className="mn-hero-text">
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>

        <div className="mn-score-card">
          <div className="mn-score-total">
            <span>Estrellas totales</span>
            <strong>850</strong>
          </div>
          <i></i>
          <small>Sigue explorando</small>
          <b>★</b>
        </div>
      </div>

      <div className="mn-hero-art">
        <span className="float-orbit orbit-one"></span>
        <span className="float-orbit orbit-two"></span>
        <span className="float-badge formula">7 + 5 = 12</span>
        <FiCompass className="float-icon compass" />
        <FiTriangle className="float-icon triangle" />
        <FiPieChart className="float-icon pie" />
        <img className="mn-planet-img" src={config.planet} alt={config.title.replace("\n", " ")} />
        <img className="mn-fox-img" src={novaFox} alt="Nova" />
        <RatingStars rating={config.rating} />
      </div>
    </section>
  );
}

function NovaTip() {
  return (
    <aside className="mn-nova-tip">
      <h3><span>✦</span> Consejo de Nova</h3>
      <p>¿Sabías que cada número es un pequeño secreto del planeta? ¡Sigue explorando para descubrirlos todos!</p>
      <img src={novaFox} alt="Nova" />
    </aside>
  );
}

function BottomDock() {
  return (
    <div className="mn-bottom-dock">
      <FiHome />
      <FiShield />
      <FiSun />
    </div>
  );
}

function WorldPage({ kind }: { kind: WorldKind }) {
  const config = worldConfigs[kind];

  return (
    <main className="mn-page">
      <MathNovaSidebar active={kind === "data" ? "stats" : "topics"} />

      <section className="mn-main">
        <WorldHero config={config} />

        <section className="mn-lessons-layout">
          <div className="mn-topic-grid">
            {config.lessons.map((lesson) => (
              <TopicCard key={lesson.title} lesson={lesson} />
            ))}
          </div>
          <NovaTip />
        </section>

        <footer className="mn-footer">© MathNova. Todos los derechos reservados.</footer>
        <BottomDock />
      </section>
    </main>
  );
}

export function NumbersWorld() {
  return <WorldPage kind="numbers" />;
}

export function GeometryWorld() {
  return <WorldPage kind="geometry" />;
}

export function DataWorld() {
  return <WorldPage kind="data" />;
}

export default NumbersWorld;
