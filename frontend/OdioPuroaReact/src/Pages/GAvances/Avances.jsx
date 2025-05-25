import React, { useState } from "react"
import Header from "../../Componentes/Header/Header"
import { collection, addDoc } from "firebase/firestore"
import { useAuth } from "../../Contexto/TeLaComesSinPretexto"
import './Avances.css'

const Avances = ({ projectId }) => {
  const { userData, db } = useAuth();

  const [formData, setFormData] = useState({
    fecha: "",
    descripcion: "",
    documentos: [],
    fotos: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    setFormData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], ...files],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      alert("No se puede registrar un avance sin un proyecto asociado.");
      return;
    }

    if (!db || !userData) {
      alert("No se puede guardar avance: faltan datos del usuario o base de datos.");
      return;
    }

    try {
      const avance = {
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        documentos: formData.documentos.map(file => file.name),
        fotos: formData.fotos.map(file => file.name),
        projectId: projectId,
        creadoPor: userData.uid,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "avances"), avance);
      alert("Avance registrado exitosamente");

      setFormData({
        fecha: "",
        descripcion: "",
        documentos: [],
        fotos: [],
      });
    } catch (error) {
      console.error("Error al registrar avance:", error);
      alert("Hubo un problema al registrar el avance");
    }
  };

  return (
    <div>
      <Header />
      <button onClick={() => window.history.back()} className="bton-volver">
        Volver
      </button>
      
      <h2>Registrar Avance</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción del Avance:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Documentos (PDFs, etc.):</label>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileChange(e, "documentos")}
          />
        </div>

        <div className="form-group">
          <label>Fotografías:</label>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileChange(e, "fotos")}
          />
        </div>

        <button type="submit">Guardar Avance</button>
      </form>
    </div>
  )
}

export default Avances