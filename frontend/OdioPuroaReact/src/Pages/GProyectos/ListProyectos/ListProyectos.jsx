import React, { useEffect, useState } from "react";
import Header from "../../../Componentes/Header/Header";
import { Link } from "react-router-dom";
import './ListProyectos.css';

const EstadoEtiqueta = ({ estado }) => {
  const getColor = () => {
    switch (estado) {
      case 'Formulación': return '#ffc107';
      case 'Activo': return '#28a745';
      case 'Evaluación': return '#007bff';
      case 'Inactivo': return '#dc3545';
      case 'Finalizado': return '#6c757d';
      default: return '#666';
    }
  };

  return (
    <span className="estado-etiqueta" style={{ backgroundColor: getColor() }}>
      {estado}
    </span>
  );
};

const ListProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoInputs, setEstadoInputs] = useState({});

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/proyectos/listar");
        if (!res.ok) throw new Error("Error al obtener proyectos");
        const data = await res.json();
        setProyectos(data);
      } catch (error) {
        console.error("Error:", error);
        alert("No se pudieron cargar los proyectos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, []);

  const handleInputChange = (proyectoId, field, value) => {
    setEstadoInputs(prev => ({
      ...prev,
      [proyectoId]: {
        ...prev[proyectoId],
        [field]: value
      }
    }));
  };

  const cambiarEstado = async (proyectoId) => {
    const input = estadoInputs[proyectoId] || {};
    const { nuevoEstado, observacion } = input;

    if (!nuevoEstado) {
      alert("Seleccione un nuevo estado");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/proyectos/estado/${proyectoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nuevoEstado, observacion })
      });

      if (res.ok) {
        alert("Estado actualizado correctamente");
        // Recargar proyectos
        const updatedProyectos = proyectos.map(proy =>
          proy.proyectoId === proyectoId
            ? {
                ...proy,
                estadoActual: nuevoEstado,
                historialEstados: [
                  ...(proy.historialEstados || []),
                  {
                    estado: nuevoEstado,
                    fecha: new Date().toISOString(),
                    observacion
                  }
                ]
              }
            : proy
        );
        setProyectos(updatedProyectos);
        setEstadoInputs(prev => ({ ...prev, [proyectoId]: {} }));
      } else {
        const err = await res.json();
        alert(err.message || "Error al actualizar estado");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    }
  };

  return (
    <div className="list-proyectos-container">
      <Header />
      <h2>Lista de Proyectos</h2>
      <Link to={"/AniadirProyect"} className="btn-nuevo-proyecto">Añadir Proyecto</Link>

      {loading ? (
        <p>Cargando proyectos...</p>
      ) : (
        <ul className="proyectos-lista">
          {proyectos.map(proyecto => {
            const input = estadoInputs[proyecto.proyectoId] || {};
            return (
              <li key={proyecto.proyectoId} className="proyecto-item">
                <h3>{proyecto.titulo}</h3>
                <p><strong>Área:</strong> {proyecto.area}</p>
                <p><strong>Institución:</strong> {proyecto.institucion}</p>
                <p><strong>Estado:</strong> <EstadoEtiqueta estado={proyecto.estadoActual} /></p>

                <div className="formulario-cambio-estado">
                  <select
                    value={input.nuevoEstado || ""}
                    onChange={e => handleInputChange(proyecto.proyectoId, "nuevoEstado", e.target.value)}
                  >
                    <option value="" disabled>Cambiar estado</option>
                    <option value="Formulación">Formulación</option>
                    <option value="Activo">Activo</option>
                    <option value="Evaluación">Evaluación</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Observación del cambio"
                    value={input.observacion || ""}
                    onChange={e => handleInputChange(proyecto.proyectoId, "observacion", e.target.value)}
                  />
                  <button type="button" onClick={() => cambiarEstado(proyecto.proyectoId)}>
                    Guardar Cambio
                  </button>
                </div>

                <section className="historial-estados">
                  <h4>Historial de Estados</h4>
                  <ul>
                    {(proyecto.historialEstados || []).map((historialItem, index) => (
                      <li key={index}>
                        <EstadoEtiqueta estado={historialItem.estado} />
                        <span className="fecha-historial">{new Date(historialItem.fecha).toLocaleString()}</span>
                        <br />
                        <small>{historialItem.observacion}</small>
                      </li>
                    ))}
                  </ul>
                </section>

                <Link to={`/DetallesProyect/${proyecto.proyectoId}`} className="btn-ver-detalles">
                  Ver detalles
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )
}

export default ListProyectos
