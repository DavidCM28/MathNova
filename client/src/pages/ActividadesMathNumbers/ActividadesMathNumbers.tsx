import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathNumbers.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-MathNumbers.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import zorritoHola from "../../assets/zorrito-hola-explorador.png";

import actividad1 from "../../assets/Actividad-1-MathNumbers.png";
import actividad2 from "../../assets/Actividad-2-MathNumbers.png";
import actividad3 from "../../assets/Actividad-3-MathNumbers.png";
import actividad4 from "../../assets/Actividad-4-MathNumbers.png";
import actividad5 from "../../assets/Actividad-5-MathNumbers.png";
import actividad6 from "../../assets/Actividad-6-MathNumbers.png";
import actividad7 from "../../assets/Actividad-7-MathNumbers.png";
import actividad8 from "../../assets/Actividad-8-MathNumbers.png";
import actividad9 from "../../assets/Actividad-9-MathNumbers.png";
import actividad10 from "../../assets/Actividad-10-MathNumbers.png";

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
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function ActividadesMathNumbers() {
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

  const actividades = [
    {
      img: actividad1,
      titulo: "1. El Cofre de Bienvenida",
      texto: "Sincroniza energía convirtiendo fracciones a decimales.",
      nivel: "Fácil",
      tiempo: "5 min",
    },
    {
      img: actividad2,
      titulo: "2. El Radar de Supervivencia",
      texto: "Ubica números con signo en la recta numérica bajo presión.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad3,
      titulo: "3. El Ascensor del Búnker",
      texto: "Programa la ruta ordenando los pisos de menor a mayor.",
      nivel: "Fácil",
      tiempo: "12 min",
    },
    {
      img: actividad4,
      titulo: "4. Escuadrón Táctico",
      texto: "Desactiva una trampa láser siguiendo el orden jerárquico.",
      nivel: "Medio",
      tiempo: "15 min",
    },
    {
      img: actividad5,
      titulo: "5. Espejos de la Bóveda",
      texto: "Identifica propiedades conmutativas y asociativas.",
      nivel: "Fácil",
      tiempo: "8 min",
    },
    {
      img: actividad6,
      titulo: "6. Simulador de Códigos",
      texto: "Representa algebraicamente una sucesión sencilla.",
      nivel: "Medio",
      tiempo: "14 min",
    },
    {
      img: actividad7,
      titulo: "7. Escalera de Escape",
      texto: "Identifica aumentos constantes en figuras de hexágonos.",
      nivel: "Fácil",
      tiempo: "10 min",
    },
    {
      img: actividad8,
      titulo: "8. Traductor del Sistema",
      texto: "Traduce lenguaje común al algebraico con una interfaz.",
      nivel: "Fácil",
      tiempo: "9 min",
    },
    {
      img: actividad9,
      titulo: "9. Cajas de Suministros",
      texto: "Plantea y resuelve ecuaciones lineales intuitivamente.",
      nivel: "Medio",
      tiempo: "11 min",
    },
    {
      img: actividad10,
      titulo: "10. Ofertas del Mercader",
      texto: "Calcula porcentajes de descuento en compras virtuales.",
      nivel: "Fácil",
      tiempo: "8 min",
    },
  ];

  return (
    <main className="numbersx-page">
      <button
        className={`numbersx-hamburger-btn ${
          menuOpen ? "numbersx-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="numbersx-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`numbersx-sidebar ${
          menuOpen ? "numbersx-sidebar-open" : ""
        }`}
      >
        <img src={logo} alt="MathNova" className="numbersx-sidebar-logo" />

        <nav className="numbersx-sidebar-menu">
          <button className="numbersx-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="numbersx-menu-item numbersx-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="numbersx-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="numbersx-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="numbersx-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="numbersx-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="numbersx-sidebar-bottom">
          <div className="numbersx-hello-box">
            <img src={zorritoHola} alt="Explorador MathNumbers" />
            <span>¡Hola, explorador!</span>
          </div>

          <div className="numbersx-weekly-progress">
            <div className="numbersx-weekly-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 4</span>
            </div>

            <div className="numbersx-star-progress">
              <span>☆</span>
              <div>
                <b></b>
              </div>
              <p>60%</p>
            </div>

            <img src={mundoNumbers} alt="MathNumbers" />
            <small>¡Sigue calculando!</small>
          </div>
        </div>
      </aside>

      <section className="numbersx-content">
        <img
          src={heroBanner}
          alt="Banner MathNumbers"
          className="numbersx-bg"
        />

        <section className="numbersx-main">
          <div className="numbersx-header">
            <div className="numbersx-title-box">
              <h1>Actividades de MathNumbers</h1>

              <p>Explora números, fracciones, álgebra y porcentajes con retos interactivos.</p>

              <div className="numbersx-status-tabs">
                <button>
                  <FiCircle />
                  Pendientes
                </button>

                <button>
                  <FiCircle />
                  En curso
                </button>

                <button>
                  <FiCheckCircle />
                  Completadas
                </button>
              </div>
            </div>

            <div className="numbersx-search-area">
              <div className="numbersx-search-box">
                <FiSearch />
                <input placeholder="Buscar actividades o temas..." />
              </div>

              <button className="numbersx-filter-btn">
                <FiFilter />
                Filtros
              </button>
            </div>
          </div>

          <div className="numbersx-activities-grid">
            {actividades.map((item, index) => (
              <article className="numbersx-activity-card" key={index}>
                <img src={item.img} alt={item.titulo} />

                <div className="numbersx-activity-info">
                  <h3>{item.titulo}</h3>

                  <p>{item.texto}</p>

                  <span
                    className={
                      item.nivel === "Fácil" ? "numbersx-easy" : "numbersx-medium"
                    }
                  >
                    {item.nivel}
                  </span>

                  <div className="numbersx-activity-bottom">
                    <small>
                      <FiClock />
                      {item.tiempo}
                    </small>

                    <button>Iniciar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="numbersx-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="numbersx-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut className="numbersx-logout-icon" />
            </button>

            <FiHelpCircle className="numbersx-help-icon" />
            <FiSettings className="numbersx-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathNumbers;
