import { useNavigate } from "react-router-dom";
import "./Feedback.css";

import logo from "../../assets/logo_MathNova.png";
import novaFox from "../../assets/zorrito_login.png";

import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiEdit,
  FiGrid,
  FiHome,
  FiMessageSquare,
  FiShield,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

function FeedbackSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="fb-sidebar">
      <img src={logo} alt="MathNova" className="fb-logo" />

      <nav className="fb-nav">
        <button onClick={() => navigate("/") }>
          <FiGrid />
          <span>Dashboard principal</span>
        </button>
        <button onClick={() => navigate("/temas/numeros") }>
          <GiRingedPlanet />
          <span>Selección de mundos matemáticos</span>
        </button>
        <button onClick={() => navigate("/temas/numeros") }>
          <FiBookOpen />
          <span>Temas</span>
        </button>
        <button>
          <FiEdit />
          <span>Actividades</span>
        </button>
        <button className="active">
          <FiMessageSquare />
          <span>Retroalimentación</span>
        </button>
        <button>
          <GiTrophyCup />
          <span>Recompensas</span>
        </button>
        <button onClick={() => navigate("/perfil-alumno") }>
          <FiUser />
          <span>Perfil del alumno</span>
        </button>
        <button onClick={() => navigate("/estadisticas") }>
          <FiBarChart2 />
          <span>Estadísticas</span>
        </button>
      </nav>

      <div className="fb-user-mini">
        <img src={novaFox} alt="Nova" />
        <span>¡Hola, explorador!</span>
      </div>

      <div className="fb-weekly-card">
        <h3>Progreso semanal</h3>
        <div className="fb-week-bars" aria-label="Progreso semanal">
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

function FeedbackTopbar() {
  return (
    <header className="fb-topbar">
      <div>
        <h1>Retroalimentación</h1>
        <p>Revisa tu progreso, consejos y recomendaciones personalizadas.</p>
      </div>

      <div className="fb-user-area">
        <button className="fb-bell" aria-label="Notificaciones">
          <FiBell />
        </button>
        <div className="fb-profile-chip">
          <img src={novaFox} alt="Alex" />
          <div>
            <strong>Alex</strong>
            <span>1° Secundaria</span>
          </div>
          <FiChevronDown />
        </div>
      </div>
    </header>
  );
}

function ScoreSummaryCard() {
  return (
    <article className="fb-card summary-card">
      <div className="fb-card-icon blue">
        <FiBarChart2 />
      </div>
      <h2>Resumen de Desempeño</h2>
      <span className="summary-badge">General</span>

      <div className="summary-box">
        <div className="summary-row">
          <FiCheck />
          <span>Ejercicios correctos:</span>
          <strong>95%</strong>
        </div>
        <div className="summary-row">
          <FiCheck />
          <span>Tiempo promedio:</span>
          <strong>45s</strong>
        </div>
        <div className="summary-row">
          <FiCheck />
          <span>Mejor tema:</span>
          <strong>Álgebra</strong>
        </div>
      </div>

      <button>Ver Detalles →</button>
    </article>
  );
}

function StudyGuideCard() {
  const topics = [
    { label: "Álgebra", level: "Básico", value: 75 },
    { label: "Geometría", level: "Intermedio", value: 60 },
    { label: "Fracciones", level: "Intermedio", value: 45 },
    { label: "Estadística", level: "Básico", value: 50 },
  ];

  return (
    <article className="fb-card guide-card">
      <div className="fb-card-icon green">
        <FiBookOpen />
      </div>
      <h2>Tu Guía de Estudio</h2>
      <p>Recomendaciones basadas en tus últimas actividades, Alex.</p>

      <div className="guide-total">
        <span style={{ width: "75%" }}></span>
      </div>
      <strong className="guide-percent">75% completado</strong>

      <div className="guide-list">
        {topics.map((topic) => (
          <div className="guide-item" key={topic.label}>
            <div>
              <span>{topic.label}</span>
              <b>{topic.level}</b>
            </div>
            <i><span style={{ width: `${topic.value}%` }}></span></i>
          </div>
        ))}
      </div>

      <button>Comenzar Guía →</button>
    </article>
  );
}

function NovaMessageCard() {
  return (
    <article className="fb-card nova-message-card">
      <div className="fb-card-icon orange">
        <FiAward />
      </div>
      <h2>Mensaje de Nova</h2>

      <div className="message-panel">
        <p>¡Estás haciendo un trabajo increíble, Alex!</p>
        <p>Tus habilidades en <strong>Geometría</strong> han mejorado mucho.</p>
        <p>Te sugiero que practiques un poco más las <strong>Fracciones</strong> esta semana.</p>
      </div>

      <button>Ver Historial →</button>
    </article>
  );
}

function ProgressPanel() {
  return (
    <aside className="fb-progress-panel">
      <h2>¡Progreso Constante!</h2>
      <p>Sigue las guías de Nova para avanzar.</p>
      <img src={novaFox} alt="Nova" />

      <div className="progress-stats-box">
        <div>
          <FiAward />
          <strong>4</strong>
          <span>Guías completadas</span>
        </div>
        <div>
          <FiAward />
          <strong>22</strong>
          <span>Estrellas ganadas por feedback</span>
        </div>
      </div>
    </aside>
  );
}

function FeedbackDock() {
  return (
    <div className="fb-bottom-dock">
      <FiHome />
      <FiShield />
      <FiSun />
    </div>
  );
}

function Feedback() {
  return (
    <main className="fb-page">
      <FeedbackSidebar />
      <section className="fb-main">
        <FeedbackTopbar />

        <section className="fb-content-grid">
          <div className="fb-cards-row">
            <ScoreSummaryCard />
            <StudyGuideCard />
            <NovaMessageCard />
          </div>
          <ProgressPanel />
        </section>

        <footer className="fb-footer">© MathNova. Todos los derechos reservados.</footer>
        <FeedbackDock />
      </section>
    </main>
  );
}

export default Feedback;
