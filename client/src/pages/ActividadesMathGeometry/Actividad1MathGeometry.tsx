import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Actividad1MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-Act1MathGeometry.png";

import zorritoActividad from "../../assets/zorrito-actividad1-MathGeometry.png";
import zorritoInstrucciones from "../../assets/zorrito-instrucciones.png";
import profesorPista from "../../assets/profesor-dando-pista.png";
import sombraConfusion from "../../assets/sombra-confusion.png";
import bytePista from "../../assets/byte-pista.png";

import trianguloFigura from "../../assets/Triangulo-a-construir-MathGeometry.png";
import cuadradoFigura from "../../assets/Cuadrado-a-construir-MathGeometry.png";
import rectanguloFigura from "../../assets/Rectangulo-a-construir-MathGeometry.png";

import incisoTriangulo from "../../assets/inciso-A-Triangulo-MathGeometry.png";
import incisoCuadrado from "../../assets/inciso-B-Cuadrado-MathGeometry.png";
import incisoRectangulo from "../../assets/inciso-C-Rectangulo-MathGeometry.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiCheck,
  FiPause,
  FiTarget,
  FiFlag,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type FiguraId = "triangulo" | "cuadrado" | "rectangulo";
type OpcionId = "triangulo" | "cuadrado" | "rectangulo";

function Actividad1MathGeometry() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [selecciones, setSelecciones] = useState<
    Record<FiguraId, OpcionId | "">
  >({
    triangulo: "",
    cuadrado: "",
    rectangulo: "",
  });

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

  const opciones = [
    {
      id: "triangulo" as OpcionId,
      letra: "A",
      nombre: "Triángulo",
      img: incisoTriangulo,
    },
    {
      id: "cuadrado" as OpcionId,
      letra: "B",
      nombre: "Cuadrado",
      img: incisoCuadrado,
    },
    {
      id: "rectangulo" as OpcionId,
      letra: "C",
      nombre: "Rectángulo",
      img: incisoRectangulo,
    },
  ];

  const figuras = [
    {
      id: "triangulo" as FiguraId,
      nombre: "Triángulo construido",
      img: trianguloFigura,
      correcta: "triangulo" as OpcionId,
    },
    {
      id: "cuadrado" as FiguraId,
      nombre: "Cuadrado construido",
      img: cuadradoFigura,
      correcta: "cuadrado" as OpcionId,
    },
    {
      id: "rectangulo" as FiguraId,
      nombre: "Rectángulo construido",
      img: rectanguloFigura,
      correcta: "rectangulo" as OpcionId,
    },
  ];

  const figurasCompletadas = figuras.filter(
    (figura) => selecciones[figura.id] === figura.correcta,
  ).length;

  const todoCorrecto = figurasCompletadas === figuras.length;

  return (
    <main className="act1geo-page">
      <button
        className={`act1geo-hamburger-btn ${
          menuOpen ? "act1geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act1geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act1geo-sidebar ${menuOpen ? "act1geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act1geo-sidebar-logo" />

        <nav className="act1geo-sidebar-menu">
          <button className="act1geo-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="act1geo-menu-item act1geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="act1geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="act1geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="act1geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="act1geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="act1geo-sidebar-progress-area">
          <article className="act1geo-side-week-card">
            <div className="act1geo-side-week-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="act1geo-side-progress">
              <span>★</span>

              <div>
                <b></b>
              </div>

              <strong>60%</strong>
            </div>
          </article>
        </div>
      </aside>

      <section className="act1geo-content">
        <img src={heroBanner} alt="Banner Actividad 1" className="act1geo-bg" />

        <section className="act1geo-main">
          <div className="act1geo-breadcrumb">
            <button type="button" onClick={() => irARuta("/seleccion-mundos")}>
              Mundos
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              Actividades MathGeometry
            </button>

            <span>›</span>

            <button type="button" className="act1geo-breadcrumb-current">
              Act 1
            </button>
          </div>

          <header className="act1geo-topbar">
            <div className="act1geo-title-area">
              <h1>Actividad 1 - El Constructor de Caminos</h1>

              <p className="act1geo-subtitle">
                Une puntos para formar figuras básicas como triángulos,
                cuadrados y rectángulos.
              </p>

              <div className="act1geo-pills">
                <span>Introducción</span>
                <span>8–12 min</span>
                <span>3 intentos</span>
              </div>
            </div>

            <div className="act1geo-actions-top">
              <button>
                <FiPause />
                Pausa
              </button>

              <button onClick={() => irARuta("/actividades/geometria")}>
                <FiLogOut />
                Salir
              </button>
            </div>
          </header>

          <img
            src={zorritoActividad}
            alt="Nova explorador"
            className="act1geo-hero-fox"
          />

          <section className="act1geo-message-row">
            <div className="act1geo-avatar">
              <img src={zorritoInstrucciones} alt="Zorrito instrucciones" />
            </div>

            <div className="act1geo-message">
              Explorador, une los puntos marcados y elige la figura correcta
              para que Nova avance.
            </div>
          </section>

          <section className="act1geo-layout">
            <article className="act1geo-board">
              <h2>Observa los puntos y descubre la figura</h2>

              <div className="act1geo-rows">
                {figuras.map((figura) => (
                  <div className="act1geo-row" key={figura.id}>
                    <div className="act1geo-figure-card">
                      <img src={figura.img} alt={figura.nombre} />
                      <span>¡{figura.nombre}!</span>
                    </div>

                    <div className="act1geo-options">
                      {opciones.map((opcion) => {
                        const seleccionada =
                          selecciones[figura.id] === opcion.id;
                        const correcta = figura.correcta === opcion.id;

                        return (
                          <button
                            key={opcion.id}
                            className={`act1geo-option-card ${
                              seleccionada ? "act1geo-selected" : ""
                            } ${
                              seleccionada && correcta ? "act1geo-correct" : ""
                            }`}
                            onClick={() =>
                              setSelecciones((prev) => ({
                                ...prev,
                                [figura.id]: opcion.id,
                              }))
                            }
                          >
                            <div className="act1geo-option-head">
                              <span>{opcion.letra}</span>
                              <strong>{opcion.nombre}</strong>

                              {seleccionada && correcta && (
                                <b>
                                  <FiCheck />
                                </b>
                              )}
                            </div>

                            <div className="act1geo-option-img-wrap">
                              <img src={opcion.img} alt={opcion.nombre} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="act1geo-right-panel">
              <article className="act1geo-tip-card">
                <img src={profesorPista} alt="Profesor Astro" />
                <div>
                  <h3>Consejo del Profesor Astro</h3>
                  <p>
                    Cuenta los lados y los vértices. Un triángulo tiene 3 lados
                    y 3 vértices.
                  </p>
                </div>
              </article>

              <article className="act1geo-tip-card">
                <img src={sombraConfusion} alt="Sombra confusión" />
                <div>
                  <h3>¡Cuidado con Sombra!</h3>
                  <p>
                    No confundas las figuras. Observa bien cuántos lados y
                    esquinas tiene cada una.
                  </p>
                </div>
              </article>

              <article className="act1geo-tip-card">
                <img src={bytePista} alt="Byte pista" />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>
                    Une los puntos siguiendo el contorno. Cuando se cierren los
                    lados, aparece la figura.
                  </p>
                </div>
              </article>

              <div
                className={`act1geo-answer-box ${
                  todoCorrecto ? "act1geo-answer-ok" : ""
                }`}
              >
                <FiCheck />
                <span>
                  {todoCorrecto
                    ? "Respuesta correcta"
                    : "Selecciona las figuras correctas"}
                </span>
              </div>

              <button className="act1geo-check-btn">Comprobar</button>
            </aside>
          </section>

          <section className="act1geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Figuras completadas</span>
                <strong>{figurasCompletadas}/3</strong>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <span>Intentos</span>
                <strong>1/3</strong>
              </div>
            </article>

            <article>
              <FiClock />
              <div>
                <span>Tiempo</span>
                <strong>02:33</strong>
              </div>
            </article>

            <article className="act1geo-xp-card">
              <span className="act1geo-star">★</span>

              <div>
                <span>XP</span>
                <strong>40</strong>
              </div>
            </article>
          </section>
        </section>

        <footer className="act1geo-footer">
          <div className="act1geo-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut />
            </button>

            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Actividad1MathGeometry;
