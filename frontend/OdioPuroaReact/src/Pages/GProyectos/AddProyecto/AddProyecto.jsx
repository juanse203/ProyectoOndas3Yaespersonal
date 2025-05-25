import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../../Contexto/TeLaComesSinPretexto";
import { db } from "../../../firebase/firebase";
import { Link } from "react-router-dom";
import Header from "../../../Componentes/Header/Header";
import './AddProyecto.css';
import Swal from 'sweetalert2';

const AddProyecto = () => {
  const { userData } = useAuth();
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    area: "",
    objetivos: "",
    cronograma: "",
    presupuesto: "",
    institucion: "",
    observaciones: "",
    integrantes: [],
    profesorId: "", // usado solo por coordinadores
  });

  // Cargar profesores si el usuario es Coordinador
  useEffect(() => {
    if (userData?.rol === "Coordinador") {
      const fetchProfesores = async () => {
        try {
          const q = query(collection(db, "usuarios"), where("rol", "==", "Profesor"));
          const snap = await getDocs(q);
          setProfesores(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error al cargar profesores:", error);
        }
      };
      fetchProfesores();
    }
  }, [userData]);

  // Cargar todos los estudiantes
  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const q = query(collection(db, "usuarios"), where("rol", "==", "Estudiante"));
        const snap = await getDocs(q);
        setEstudiantes(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      }
    };

    fetchEstudiantes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const uid = e.target.value;
    setFormData(prev => ({
      ...prev,
      integrantes: e.target.checked
        ? [...prev.integrantes, uid]
        : prev.integrantes.filter(id => id !== uid)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const proyecto = {
        ...formData,
        creadorId: userData.uid,
        profesorId: userData.rol === "Profesor" ? userData.uid : formData.profesorId
      };

      if (userData.rol === "Coordinador" && !formData.profesorId) {
        alert("Debe seleccionar un profesor para asignar el proyecto.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/proyectos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proyecto),
      });

      if (!response.ok) {
        throw new Error("Error al crear el proyecto en el servidor");
      }

      Swal.fire({
        title: '¡Éxito!',
        text: 'Esooooooo se creo exitosamente!!.',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });

      setFormData({
        titulo: "",
        area: "",
        objetivos: "",
        cronograma: "",
        presupuesto: "",
        institucion: "",
        observaciones: "",
        integrantes: [],
        profesorId: "",
      });
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      Swal.fire('No me pagan lo suficiente', 'error');
    }
  };

  return (
    <div>
      <Header />
      <div className="create-project-container">
        <div className="header-section">
          <h2>Crear Proyecto</h2>
          <Link to={"/Proyectos"} className="button secondary-button">Volver</Link>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="titulo">Título</label>
              <input id="titulo" name="titulo" placeholder="Título del proyecto" value={formData.titulo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="area">Área</label>
              <input id="area" name="area" placeholder="Área de investigación o desarrollo" value={formData.area} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="objetivos">Objetivos</label>
              <textarea id="objetivos" name="objetivos" placeholder="Objetivos del proyecto" value={formData.objetivos} onChange={handleChange} required rows="4"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="cronograma">Cronograma</label>
              <input id="cronograma" name="cronograma" placeholder="Fechas clave o duración estimada" value={formData.cronograma} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="presupuesto">Presupuesto</label>
              <input id="presupuesto" name="presupuesto" placeholder="Presupuesto asignado" value={formData.presupuesto} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="institucion">Institución</label>
              <input id="institucion" name="institucion" placeholder="Institución a la que pertenece" value={formData.institucion} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea id="observaciones" name="observaciones" placeholder="Notas o consideraciones adicionales" value={formData.observaciones} onChange={handleChange} rows="3"></textarea>
            </div>
          </div>

          {userData?.rol === "Coordinador" && (
            <div className="form-group full-width">
              <label htmlFor="profesorId">Profesor a cargo</label>
              <select id="profesorId" name="profesorId" onChange={handleChange} value={formData.profesorId} required>
                <option value="">Seleccione un profesor</option>
                {profesores.map(p => (
                  <option key={p.uid} value={p.uid}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>
          )}

          {estudiantes.length > 0 && (
            <div className="form-group full-width student-selection">
              <h4>Seleccionar Estudiantes:</h4>
              <div className="student-checkbox-grid">
                {estudiantes.map(est => (
                  <label key={est.uid} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={est.uid}
                      onChange={handleCheckboxChange}
                      checked={formData.integrantes.includes(est.uid)}
                    />
                    <span className="checkbox-custom"></span>
                    {est.nombre} {est.apellido}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="button primary-button">Crear Proyecto</button>
        </form>
      </div>
    </div>
  )
}

export default AddProyecto
