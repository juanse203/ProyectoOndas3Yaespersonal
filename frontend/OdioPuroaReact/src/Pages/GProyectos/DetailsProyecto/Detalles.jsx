import React, { useEffect, useState } from "react"
import { useParams,  Link } from "react-router-dom"
import './Detalles.css'
import Header from "../../../Componentes/Header/Header"

const Detalles = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/proyectos/detalle/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("El proyecto no existe.");
          } else {
            throw new Error("Error al obtener el proyecto.");
          }
        } else {
          const data = await res.json();
          setProyecto(data);
        }
      } catch (err) {
        setError("Hubo un problema al cargar el proyecto.");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarProyecto();
  }, [id]);

  if (cargando) return <p>Cargando detalles del proyecto...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!proyecto) return <p>No se encontró el proyecto.</p>;

  return (
    <div>
      <Header />
      <div className="details-proyecto-page">
        <div className="details-proyecto-container">
          <div className="details-header">
            <h1>{proyecto.titulo}</h1>
            <button onClick={() => window.history.back()} className="bton-volver">
              Volver
            </button>
          </div>

          <section className="proyecto-info">
            <h3>Información General del Proyecto</h3>
            <div className="info-grid">
              <p><strong>Área:</strong> {proyecto.area}</p>
              <p><strong>Institución:</strong> {proyecto.institucion}</p>
              <p className="full-width"><strong>Objetivos:</strong> {proyecto.objetivos}</p>
              <p><strong>Cronograma:</strong> {proyecto.cronograma}</p>
              <p><strong>Presupuesto:</strong> ${proyecto.presupuesto}</p>
              <p><strong>Profesor Asignado:</strong> {proyecto.profesor?.nombre} {proyecto.profesor?.apellido}</p>
              <p className="full-width"><strong>Observaciones:</strong> {proyecto.observaciones || "Ninguna"}</p>
            </div>
            <p className="project-status-display">
              <strong>Estado Actual:</strong>{" "}
              <span className={`estado-etiqueta estado-${(proyecto.estadoActual || "Formulación").toLowerCase().replace(" ", "-")}`}>
                {proyecto.estadoActual || "Formulación"}
              </span>
            </p>
          </section>

          {proyecto.historialEstados?.length > 0 && (
            <section className="historial-estados">
              <h3>Historial de Estados</h3>
              <ul className="historial-estados-list">
                {proyecto.historialEstados.map((item, index) => (
                  <li key={index} className="historial-estados-item">
                    <span className={`estado-etiqueta estado-${item.estado.toLowerCase().replace(" ", "-")}`}>
                      {item.estado}
                    </span>
                    <span className="estado-fecha">{new Date(item.fecha).toLocaleDateString()}</span>
                    <p className="estado-observacion">{item.observacion}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {proyecto.integrantes?.length > 0 && (
            <section className="integrantes-lista">
              <h3>Estudiantes Asignados</h3>
              <ul className="integrantes-grid">
                {proyecto.integrantes?.map((est, idx) => (
                  <li key={idx} className="integrante-item">
                    {est.nombre} {est.apellido}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="avances-proyecto">
            <h3>Avances Registrados</h3>
            <Link to={"/Avances"} className="btn-nuevo-avance">Registrar Avance</Link>
            {proyecto.avances?.length > 0 ? (
              <ul className="avance-lista">
                {proyecto.avances.map((avance, idx) => (
                  <li key={idx} className="avance-item">
                    <div className="avance-header">
                      <strong>Fecha:</strong> {new Date(avance.fecha).toLocaleDateString()}
                    </div>
                    <p><strong>Descripción:</strong> {avance.descripcion}</p>
                    {avance.documentos?.length > 0 && (
                      <p><strong>Documentos:</strong> {avance.documentos.join(", ")}</p>
                    )}
                    {avance.fotos?.length > 0 && (
                      <p><strong>Fotos:</strong> {avance.fotos.join(", ")}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-avances-message">No hay avances registrados aún para este proyecto.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Detalles