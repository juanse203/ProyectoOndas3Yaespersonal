import React, { useEffect, useState } from "react";
import Header from "../../Componentes/Header/Header";
import './Reportes.css';

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

const Reportes = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filtros, setFiltros] = useState({ profesorId: '', institucion: '', estado: '' });

  const fetchReportes = async () => {
    try {
      const params = new URLSearchParams(filtros);
      const res = await fetch(`http://localhost:5000/api/reportes/listar?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener reportes");
      const data = await res.json();
      setProyectos(data);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudieron cargar los reportes.");
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const handleInputChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = () => {
    fetchReportes();
  };

  const descargarPDF = () => {
    const params = new URLSearchParams(filtros);
    window.open(`http://localhost:5000/api/reportes/reporte-pdf?${params.toString()}`, '_blank');
  };

  return (
    <div className="body">
      <Header />
      <div className="reportes-page-container">
        <div className="reportes-main-content">
          <h2>Reportes de Proyectos</h2>

          <div className="filtros-reportes-card">
            <h3>Filtros de Búsqueda</h3>
            <div className="filtros-grid">
              <input
                type="text"
                name="profesorId"
                placeholder="ID del Profesor"
                value={filtros.profesorId}
                onChange={handleInputChange}
                className="input-filter"
              />
              <input
                type="text"
                name="institucion"
                placeholder="Institución"
                value={filtros.institucion}
                onChange={handleInputChange}
                className="input-filter"
              />
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleInputChange}
                className="select-filter"
              >
                <option value="">Todos los Estados</option>
                <option value="Formulación">Formulación</option>
                <option value="Activo">Activo</option>
                <option value="Evaluación">Evaluación</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
            <div className="filtros-acciones">
              <button onClick={aplicarFiltros} className="button primary-button">Aplicar Filtros</button>
              <button onClick={descargarPDF} className="button secondary-button">Descargar PDF</button>
            </div>
          </div>

          <div className="reportes-resultados-section">
            {proyectos.length > 0 ? (
              <ul className="reporte-lista">
                {proyectos.map((p, idx) => (
                  <li key={idx} className="reporte-item report-card">
                    <h3>{p.titulo}</h3>
                    <p><strong>Institución:</strong> {p.institucion}</p>
                    <p><strong>Estado:</strong> <span className={`estado-etiqueta estado-${(p.estadoActual || "Formulación").toLowerCase().replace(" ", "-")}`}>{p.estadoActual || "Formulación"}</span></p>
                    <p><strong>Último cambio:</strong> {p.historialEstados?.length > 0 ? new Date(p.historialEstados[p.historialEstados.length - 1].fecha).toLocaleString() : 'N/A'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-reports-message">No se encontraron proyectos con los filtros aplicados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportes
