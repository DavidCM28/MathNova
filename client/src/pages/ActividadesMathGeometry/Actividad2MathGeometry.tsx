import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Actividad2MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-Act1MathGeometry.png";
import profesorHero from "../../assets/profesor-explicando.png";
import byteAct2 from "../../assets/byte-Act2-MathGeometry.png";
import sombraError from "../../assets/sombra-error.png";
import zorritoInstrucciones from "../../assets/zorrito-instrucciones.png";

import mapaPuente from "../../assets/Act2-MathGeometry-puente.png";
import piezaCamino3 from "../../assets/pieza-camino-3-MathGeometry.png";
import piezaCamino2 from "../../assets/pieza-camino-2-MathGeometry.png";
import piezaCamino1 from "../../assets/pieza-camino-1-MathGeometry.png";

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

import { FaStar } from "react-icons/fa";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type SegmentoId = "pieza3" | "pieza2" | "pieza1";

function Actividad2MathGeometry() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [segmentoSeleccionado, setSegmentoSeleccionado] =
    useState<SegmentoId>("pieza3");
  const [segmentoColocado, setSegmentoColocado] = useState<SegmentoId | null>(
    null,
  );
  const [revisado, setRevisado] = useState(false);

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

  const segmentos = [
    {
      id: "pieza3" as SegmentoId,
      letra: "A",
      nombre: "Segmento curvo",
      img: piezaCamino3,
    },
    {
      id: "pieza2" as SegmentoId,
      letra: "B",
      nombre: "Segmento recto",
      img: piezaCamino2,
    },
    {
      id: "pieza1" as SegmentoId,
      letra: "C",
      nombre: "Segmento ondulado",
      img: piezaCamino1,
    },
  ];

  const piezaActual =
    segmentos.find((segmento) => segmento.id === segmentoColocado) || null;

  const respuestaCorrecta = segmentoColocado === "pieza3";

  const seleccionarSegmento = (id: SegmentoId) => {
    setSegmentoSeleccionado(id);
    setSegmentoColocado(id);
    setRevisado(false);
  };

  const comprobarRespuesta = () => {
    if (!segmentoColocado) {
      setSegmentoColocado(segmentoSeleccionado);
    }

    setRevisado(true);
  };

  return (
    <main className="act2geo-page">
      <button
        className={`act2geo-hamburger-btn ${
          menuOpen ? "act2geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act2geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act2geo-sidebar ${menuOpen ? "act2geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act2geo-sidebar-logo" />

        <nav className="act2geo-sidebar-menu">
          <button className="act2geo-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="act2geo-menu-item act2geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="act2geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="act2geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="act2geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="act2geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="act2geo-sidebar-progress-area">
          <article className="act2geo-side-week-card">
            <div className="act2geo-side-week-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 3</span>
            </div>

            <div className="act2geo-side-progress">
              <span>★</span>

              <div>
                <b></b>
              </div>

              <strong>60%</strong>
            </div>
          </article>
        </div>
      </aside>

      <section className="act2geo-content">
        <img
          src={heroBanner}
          alt="Banner MathGeometry"
          className="act2geo-bg"
        />

        <section className="act2geo-main">
          <div className="act2geo-breadcrumb">
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

            <button type="button" className="act2geo-breadcrumb-current">
              Act 2
            </button>
          </div>

          <header className="act2geo-topbar">
            <div className="act2geo-title-area">
              <h1>Actividad 2 - La Ruta Perdida</h1>

              <p className="act2geo-subtitle">
                Conecta el tramo correcto para reconstruir el camino.
              </p>

              <div className="act2geo-pills">
                <span>Introductorio</span>
                <span>8–12 min</span>
                <span>3 intentos</span>
              </div>
            </div>

            <div className="act2geo-actions-top">
              <button type="button">
                <FiPause />
                Pausa
              </button>

              <button
                type="button"
                onClick={() => irARuta("/actividades/geometria")}
              >
                <FiLogOut />
                Salir
              </button>
            </div>
          </header>

          <img
            src={profesorHero}
            alt="Profesor Astro"
            className="act2geo-hero-professor"
          />

          <section className="act2geo-message-row">
            <div className="act2geo-avatar">
              <img src={zorritoInstrucciones} alt="Nova instrucciones" />
            </div>

            <div className="act2geo-message">
              Explorador, una parte del camino se perdió. Observa los puntos
              marcados y elige el segmento que los conecta correctamente para
              que Nova pueda avanzar.
            </div>
          </section>

          <section className="act2geo-layout">
            <article className="act2geo-challenge-card">
              <div
                className="act2geo-map-wrap"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();

                  const id = event.dataTransfer.getData(
                    "segmento",
                  ) as SegmentoId;

                  if (id) {
                    setSegmentoSeleccionado(id);
                    setSegmentoColocado(id);
                    setRevisado(false);
                  }
                }}
              >
                <img src={mapaPuente} alt="Ruta perdida" />

                <div
                  className={`act2geo-drop-zone ${
                    piezaActual ? "act2geo-drop-filled" : ""
                  }`}
                >
                  {piezaActual ? (
                    <img
                      src={piezaActual.img}
                      alt={piezaActual.nombre}
                      className="act2geo-placed-piece"
                    />
                  ) : (
                    <span>Arrastra aquí</span>
                  )}
                </div>
              </div>

              <h2>Elige o arrastra el segmento que falta:</h2>

              <div className="act2geo-options">
                {segmentos.map((segmento) => {
                  const seleccionado = segmentoSeleccionado === segmento.id;
                  const colocada = segmentoColocado === segmento.id;
                  const correcta = segmento.id === "pieza3";

                  return (
                    <button
                      key={segmento.id}
                      type="button"
                      draggable
                      className={`act2geo-option-card ${
                        seleccionado ? "act2geo-selected" : ""
                      } ${
                        revisado && colocada && correcta
                          ? "act2geo-correct"
                          : ""
                      } ${
                        revisado && colocada && !correcta
                          ? "act2geo-incorrect"
                          : ""
                      }`}
                      onClick={() => seleccionarSegmento(segmento.id)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("segmento", segmento.id);
                      }}
                    >
                      <div className="act2geo-option-head">
                        <span>{segmento.letra}</span>
                        <strong>{segmento.nombre}</strong>

                        {colocada && (
                          <b>
                            <FiCheck />
                          </b>
                        )}
                      </div>

                      <div className="act2geo-piece-wrap">
                        <img src={segmento.img} alt={segmento.nombre} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>

            <aside className="act2geo-right-panel">
              <article className="act2geo-tip-card">
                <img src={sombraError} alt="Sombra" />
                <div>
                  <h3>¿Necesitas ayuda?</h3>
                  <p>Estamos aquí para ti.</p>
                </div>
              </article>

              <article className="act2geo-tip-card">
                <img src={piezaCamino2} alt="Segmento" />
                <div>
                  <h3>Un segmento une dos puntos.</h3>
                  <p>Busca el tramo que inicia y termina en los círculos.</p>
                </div>
              </article>

              <article className="act2geo-tip-card">
                <img src={byteAct2} alt="Byte" />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>Observa dónde empieza y termina el tramo.</p>
                </div>
              </article>

              <button
                className="act2geo-check-btn"
                type="button"
                onClick={comprobarRespuesta}
              >
                Comprobar
              </button>

              <div
                className={`act2geo-answer-box ${
                  revisado && respuestaCorrecta ? "act2geo-answer-ok" : ""
                } ${revisado && !respuestaCorrecta ? "act2geo-answer-bad" : ""}`}
              >
                <FiCheck />
                <span>
                  {!segmentoColocado
                    ? "Arrastra una pieza al puente"
                    : revisado && respuestaCorrecta
                      ? "Respuesta correcta"
                      : revisado && !respuestaCorrecta
                        ? "Intenta con otro segmento"
                        : "Segmento colocado"}
                </span>
              </div>
            </aside>
          </section>

          <section className="act2geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Rutas completadas</span>
                <strong>{revisado && respuestaCorrecta ? "1/1" : "0/1"}</strong>
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

            <article className="act2geo-xp-card">
              <FaStar className="act2geo-xp-star-icon" />

              <div className="act2geo-xp-info">
                <span>XP</span>
                <strong>40</strong>
              </div>
            </article>
          </section>
        </section>

        <footer className="act2geo-footer">
          <div className="act2geo-footer-icons">
            <button type="button" onClick={() => navigate("/login")}>
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

export default Actividad2MathGeometry;
