import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import './Home.css';

export const Home: React.FC = () => {
  const {
    student,
    isOnline,
    isOverridden,
    simulateConnection,
    pendingSyncQueue,
    syncOfflineData,
    completeLesson,
    completedLessons,
    clearQueue,
  } = useApp();

  const [equationAnswer, setEquationAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; message: string }>({
    status: 'idle',
    message: '',
  });

  const handleSolveEquation = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(equationAnswer.trim(), 10);
    
    if (answer === 5) {
      setFeedback({
        status: 'correct',
        message: '¡Excelente! La respuesta es 5. Has ganado +50 puntos de XP.',
      });
      completeLesson('algebra_linear_101', 'Ecuaciones Lineales Básicas');
      setEquationAnswer('');
    } else {
      setFeedback({
        status: 'incorrect',
        message: 'Respuesta incorrecta. Intenta despejar X nuevamente: 2x = 15 - 5.',
      });
    }
  };

  return (
    <div className="mathnova-dashboard">
      {/* Header Panel */}
      <header className="dashboard-header">
        <div className="branding">
          <span className="logo-icon">📐</span>
          <div>
            <h1>MathNova</h1>
            <p className="subtitle">Plataforma de Matemáticas para Secundaria ({student.grade})</p>
          </div>
        </div>
        
        <div className="student-stats">
          <div className="stat-card">
            <span className="stat-label">Estudiante</span>
            <span className="stat-value">{student.name}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Puntos XP</span>
            <span className="stat-value highlight-score">{student.score} ⭐</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Racha</span>
            <span className="stat-value highlight-streak">🔥 {student.streak} días</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Left Column: Learning activities */}
        <main className="learning-zone">
          <div className="panel card-challenge">
            <div className="panel-header">
              <h2>Desafío del Día: Álgebra</h2>
              <span className="badge-grade">8º Grado</span>
            </div>
            
            <div className="challenge-body">
              <p className="instruction">Resuelve la siguiente ecuación de primer grado:</p>
              <div className="math-expression">
                2x + 5 = 15
              </div>
              
              <form onSubmit={handleSolveEquation} className="challenge-form">
                <div className="input-group">
                  <label htmlFor="equation-input">Valor de X:</label>
                  <input
                    type="number"
                    id="equation-input"
                    value={equationAnswer}
                    onChange={(e) => setEquationAnswer(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="math-input"
                    required
                  />
                </div>
                <Button type="submit" variant="primary">Enviar Solución</Button>
              </form>

              {feedback.status !== 'idle' && (
                <div className={`feedback-alert feedback-${feedback.status}`}>
                  {feedback.status === 'correct' ? '✅' : '❌'} {feedback.message}
                </div>
              )}
            </div>
          </div>

          <div className="panel card-lessons">
            <div className="panel-header">
              <h2>Tus Lecciones</h2>
            </div>
            <div className="lessons-list">
              <div className={`lesson-item ${completedLessons.includes('algebra_linear_101') ? 'completed' : ''}`}>
                <span className="lesson-icon">📈</span>
                <div className="lesson-details">
                  <h3>Ecuaciones Lineales Básicas</h3>
                  <p>Aprende a despejar incógnitas simples.</p>
                </div>
                <span className="lesson-status">
                  {completedLessons.includes('algebra_linear_101') ? 'Completado (+50 XP)' : 'Pendiente'}
                </span>
              </div>

              <div className="lesson-item disabled">
                <span className="lesson-icon">📐</span>
                <div className="lesson-details">
                  <h3>Teorema de Pitágoras</h3>
                  <p>Relaciones geométricas en triángulos rectángulos.</p>
                </div>
                <span className="lesson-status">Bloqueado</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Column: Connection and Database sync details */}
        <aside className="connection-zone">
          {/* Connection Simulator Panel */}
          <div className="panel panel-connection">
            <div className="panel-header">
              <h2>Estado de Red (Simulador)</h2>
              <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'ONLINE (Remoto Postgres)' : 'OFFLINE (Local MySQL)'}
              </span>
            </div>

            <div className="connection-body">
              <p className="description">
                El sistema detecta automáticamente la conexión a internet. Puedes usar los botones inferiores para simular la pérdida de conexión.
              </p>

              <div className="simulation-actions">
                <Button
                  variant={!isOnline ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => simulateConnection(false)}
                >
                  Simular Offline (MySQL)
                </Button>
                <Button
                  variant={isOnline ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => simulateConnection(true)}
                >
                  Conectar a Internet
                </Button>
                {isOverridden && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => simulateConnection(null)}
                  >
                    Restablecer Estado Real
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sync Queue Panel */}
          <div className="panel panel-sync">
            <div className="panel-header">
              <h2>Cola de Sincronización Local</h2>
              <span className="sync-badge">{pendingSyncQueue.length} pendiente(s)</span>
            </div>

            <div className="sync-body">
              <p className="description">
                Transacciones guardadas localmente en la base de datos MySQL (simulada) pendientes de subida a PostgreSQL.
              </p>

              {pendingSyncQueue.length === 0 ? (
                <div className="empty-queue">
                  <span className="empty-icon">✓</span>
                  <p>Todo está sincronizado con el servidor principal.</p>
                </div>
              ) : (
                <div className="queue-list">
                  {pendingSyncQueue.map((item) => (
                    <div className="queue-item" key={item.id}>
                      <div className="queue-item-meta">
                        <span className="queue-type">{item.type}</span>
                        <span className="queue-time">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="queue-data">{JSON.stringify(item.data, null, 2)}</pre>
                    </div>
                  ))}

                  <div className="sync-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={syncOfflineData}
                      disabled={!isOnline}
                    >
                      Sincronizar Ahora
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearQueue}>
                      Limpiar Cola
                    </Button>
                  </div>
                  {!isOnline && (
                    <p className="sync-warning">
                      ⚠️ Conecta la red para poder sincronizar los datos con PostgreSQL.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
