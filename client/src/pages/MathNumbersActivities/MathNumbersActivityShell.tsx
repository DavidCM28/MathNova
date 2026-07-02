import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import logo from "../../assets/logo_MathNova.png";

type MathNumbersActivityShellProps = {
  avatar: string;
  title: string;
  topic: string;
  subtitle: string;
  progress: number;
  total: number;
  heroImage: string;
  heroAlt: string;
  rewardTitle: string;
  rewardText: string;
  children: ReactNode;
  bottom?: ReactNode;
};

function MathNumbersActivityShell({
  title,
  topic,
  subtitle,
  progress,
  total,
  heroImage,
  heroAlt,
  rewardTitle,
  rewardText,
  children,
  bottom,
}: MathNumbersActivityShellProps) {
  const navigate = useNavigate();
  const progressPercent = Math.min(100, Math.round((progress / total) * 100));

  return (
    <main className="mnrx-page mnrx-activity-page">
      <aside className="mnrx-sidebar" aria-label="Navegación principal">
        <img className="mnrx-sidebar-logo" src={logo} alt="MathNova" />

        <nav className="mnrx-nav">
          <button
            type="button"
            className="mnrx-nav-item"
            onClick={() => navigate("/")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="mnrx-nav-item mnrx-nav-active"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="mnrx-nav-item"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="mnrx-nav-item"
            onClick={() => navigate("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnrx-nav-item"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="mnrx-nav-item"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>
      </aside>

      <section className="mnrx-content">
        <header className="mnrx-hero">
          <div className="mnrx-hero-copy">
            <p className="mnrx-breadcrumb">
              MathNumbers <span>/</span> {topic}
            </p>

            <h1>{title}</h1>
            <p>{subtitle}</p>

            <div className="mnrx-hero-controls">
              <button
                type="button"
                onClick={() => navigate("/actividades-math-numbers")}
              >
                ← Volver
              </button>

              <div className="mnrx-progress-card">
                <span>
                  Progreso: <b>{progress}/{total}</b>
                </span>

                <div>
                  <i style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <img className="mnrx-hero-img" src={heroImage} alt={heroAlt} />

          <article className="mnrx-reward-card">
            <span>🏆</span>
            <div>
              <small>{rewardTitle}</small>
              <strong>{rewardText}</strong>
            </div>
          </article>
        </header>

        <section className="mnrx-activity-shell-body">{children}</section>

        {bottom && (
          <section className="mnrx-activity-bottom-area">{bottom}</section>
        )}
      </section>
    </main>
  );
}

export default MathNumbersActivityShell;