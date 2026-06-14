import { useEffect, useState } from "react";
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
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHome,
  FiShield,
  FiSettings,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type LessonCard = {
  title: string;
  description: string;
  progress: number;
  image: string;
};

const lessons: LessonCard[] = [
  {
    title: "Suma y resta",
    description:
      "Aprende a sumar y restar números naturales de forma divertida.",
    progress: 75,
    image: sumaRestaIcon,
  },
  {
    title: "Multiplicación",
    description:
      "Descubre la multiplicación y sus propiedades con ejemplos prácticos.",
    progress: 60,
    image: multiplicacionIcon,
  },
  {
    title: "División",
    description:
      "Entiende la división como repartir en partes iguales y mucho más.",
    progress: 45,
    image: divisionIcon,
  },
  {
    title: "Fracciones",
    description: "Aprende qué son las fracciones y cómo compararlas.",
    progress: 70,
    image: fraccionesIcon,
  },
  {
    title: "Patrones",
    description:
      "Identifica y crea patrones numéricos y geométricos paso a paso.",
    progress: 0,
    image: patronesIcon,
  },
  {
    title: "Problemas cotidianos",
    description: "Resuelve problemas de la vida diaria usando lo que aprendes.",
    progress: 0,
    image: problemasIcon,
  },
];

function WorldPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  return (
    <main className="learning-page">
      <button
        className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="sidebar-logo" />

        <nav className="sidebar-menu">
          <button className="menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button className="menu-item active">
            <FiBookOpen />
            <span>Temas</span>
          </button>

          <button className="menu-item">
            <FiEdit />
            <span>Actividades</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button className="menu-item" onClick={() => irARuta("/recompensas")}>
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="user-chip">
          <img src={zorritoHola} alt="Nova" />
          <span>¡Hola, explorador!</span>
        </div>

        <div className="weekly-progress">
          <h3>Progreso semanal</h3>

          <div className="bars">
            <span className="bar red small"></span>
            <span className="bar blue"></span>
            <span className="bar yellow medium"></span>
            <span className="bar blue tall"></span>
            <span className="bar yellow large"></span>
            <span className="bar blue tall"></span>
            <span className="bar green large"></span>
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
                <strong>850</strong>
              </div>

              <i></i>

              <small>Sigue explorando</small>
              <b>★</b>
            </div>
          </div>
        </section>

        <section className="topics-zone">
          <div className="topics-grid">
            {lessons.map((lesson) => (
              <article className="topic-card" key={lesson.title}>
                <img src={lesson.image} alt={lesson.title} />

                <div className="topic-info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>

                <div className="progress-row">
                  <div className="progress-track">
                    <span style={{ width: `${lesson.progress}%` }}></span>
                  </div>
                  <strong>{lesson.progress}%</strong>
                </div>

                <button
                  className={lesson.progress > 0 ? "blue-btn" : "white-btn"}
                >
                  {lesson.progress > 0 ? "Continuar" : "Ver tema"}
                </button>
              </article>
            ))}
          </div>

          <aside className="nova-tip">
            <h3>Consejo de Nova</h3>

            <p>
              ¿Sabías que cada número es un pequeño secreto del planeta? ¡Sigue
              explorando para descubrirlos todos!
            </p>

            <img src={novaConsejo} alt="Nova" />
          </aside>
        </section>

        <footer className="learning-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="bottom-icons">
            <FiHome />
            <FiShield />
            <FiSettings />
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
