import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SeleccionMundos.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-seleccion-mundo.png";
import estrellaIcon from "../../assets/estrella-sigue-explorando.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import mundoGeometry from "../../assets/mundo-2-MathGeometry.png";
import mundoData from "../../assets/mundo-3-MathData.png";
import zorritoFooter from "../../assets/zorrito-footer.png";
import zorritoHola from "../../assets/zorrito-hola-explorador.png";
import zorritoSeleccion from "../../assets/zorrito_seleccion_mundo.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup, GiRocket } from "react-icons/gi";

import { obtenerPerfilAlumno } from "../../services/alumnoService";
import type { Alumno } from "../../services/alumnoService";

import {
  clearAuthSession,
  getDisplayName,
  isGuestSession,
} from "../../utils/authSession";

function SeleccionMundos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [cargandoAlumno, setCargandoAlumno] = useState(true);

  const navigate = useNavigate();

  const modoInvitado = isGuestSession();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const cargarAlumno = async () => {
      const token = localStorage.getItem("token");
      const invitado = isGuestSession();

      if (!token && !invitado) {
        navigate("/login", { replace: true });
        return;
      }

      if (invitado) {
        setAlumno(null);
        setCargandoAlumno(false);
        return;
      }

      try {
        setCargandoAlumno(true);
        const perfilData = await obtenerPerfilAlumno();
        setAlumno(perfilData);
      } catch (error) {
        console.error("Error al cargar datos del alumno:", error);
      } finally {
        setCargandoAlumno(false);
      }
    };

    cargarAlumno();
  }, [navigate]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const estrellasTotales = modoInvitado
    ? 0
    : Number(alumno?.estrellas_totales ?? 0);

  const nombreAlumno = modoInvitado
    ? getDisplayName()
    : alumno?.nombre_completo?.split(" ")[0] || alumno?.usuario || "Explorador";

  return (
    <main className="mundos-page">
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
          <button className="menu-item" onClick={() => irARuta("/dashboard")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button className="menu-item active">
            <GiRingedPlanet />
            <span>Selección de mundos</span>
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

        <div className="mundos-sidebar-bottom">
          <div className="hello-box">
            <img src={zorritoHola} alt="Zorrito explorador" />
            <span>¡Hola, {nombreAlumno}!</span>
          </div>

          <div className="mundos-sidebar-fox-box">
            <img
              src={zorritoSeleccion}
              alt="Zorrito selección de mundo"
              className="mundos-sidebar-fox"
            />
          </div>
        </div>
      </aside>

      <section className="mundos-content">
        <section className="mundos-hero">
          <div className="mundos-title">
            <h1>Selección de mundos matemáticos</h1>
            <p>
              {modoInvitado
                ? "Explora los mundos disponibles. Para contestar actividades necesitarás iniciar sesión."
                : "Explora, aprende y conquista nuevos mundos."}
            </p>

            {modoInvitado && (
              <div className="guest-world-alert">
                Estás en modo espectador. Puedes ver los mundos y sus
                actividades, pero para iniciar retos y guardar progreso necesitas
                iniciar sesión o crear una cuenta.
              </div>
            )}
          </div>

          <img
            src={heroBanner}
            alt="Banner mundos matemáticos"
            className="mundos-hero-img"
          />

          <article className="mundos-stars-card">
            <h3>Estrellas totales</h3>

            <div className="mundos-stars-row">
              <strong>{cargandoAlumno ? "..." : estrellasTotales}</strong>
              <span>⭐</span>
            </div>

            <p>
              {modoInvitado
                ? "Inicia sesión para ganar estrellas"
                : estrellasTotales > 0
                ? "Sigue explorando y gana más estrellas"
                : "Completa actividades para ganar estrellas"}
            </p>
          </article>
        </section>

        <section className="worlds-grid">
          <article className="world-card">
            <div className="world-image green-world">
              <h2>math Numbers</h2>
              <img src={mundoNumbers} alt="Math Numbers" />
            </div>

            <div className="world-progress">
              <div className="level-pill green-pill">
                <strong>Nivel 4</strong>
                <span>120</span>
              </div>

              <div className="progress-track">
                <span className="progress-fill green-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/temas/numeros")}>
              <GiRocket />
              Explorar math Numbers
            </button>
          </article>

          <article className="world-card">
            <div className="world-image orange-world">
              <h2>math Geometry</h2>
              <img src={mundoGeometry} alt="Math Geometry" />
            </div>

            <div className="world-progress">
              <div className="level-pill orange-pill">
                <strong>Intermedio</strong>
                <span>150</span>
              </div>

              <div className="progress-track">
                <span className="progress-fill orange-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/actividades/geometria")}>
              <GiRocket />
              Explorar math Geometry
            </button>
          </article>

          <article className="world-card">
            <div className="world-image blue-world">
              <h2>math Data</h2>
              <img src={mundoData} alt="Math Data" />
            </div>

            <div className="world-progress">
              <div className="level-pill blue-pill">
                <strong>Avanzado</strong>
                <span>200</span>
              </div>

              <div className="progress-track">
                <span className="progress-fill blue-fill"></span>
              </div>
            </div>

            <button onClick={() => irARuta("/actividades-math-data")}>
              <GiRocket />
              Explorar math Data
            </button>
          </article>
        </section>

        <section className="reward-banner">
          <img src={estrellaIcon} alt="Estrella" />

          <div>
            <h2>¡Cada mundo tiene nuevos retos y recompensas!</h2>
            <p>
              Explora todos los mundos y conviértete en un Maestro de las
              Matemáticas.
            </p>
          </div>

          <img
            src={zorritoFooter}
            alt="Zorrito saludando"
            className="footer-fox"
          />
        </section>

        <footer className="mundos-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="footer-icons">
            <button className="footer-icon-btn" onClick={cerrarSesion}>
              <FiLogOut className="logout-icon" />
            </button>

            <FiHelpCircle className="help-icon" />

            <FiSettings className="settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default SeleccionMundos;