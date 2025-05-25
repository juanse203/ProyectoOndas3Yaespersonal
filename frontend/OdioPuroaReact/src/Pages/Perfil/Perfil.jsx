import React, { useState, useEffect } from 'react';
import Header from '../../Componentes/Header/Header';
import './Perfil.css';
import { useAuth } from '../../Contexto/TeLaComesSinPretexto';
import Swal from 'sweetalert2';

const Perfil = () => {
  const { userData, setUserData } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        password: userData.password || '',
        rol: userData.rol || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    if (!userData?.uid) {
      Swal.fire("Error", "Usuario no identificado", "error");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/update/${userData.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al actualizar");

      const updatedUser = { ...userData, ...formData };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      Swal.fire("Error", "Hubo un error al actualizar el perfil", "error");
    }
  };

  return (
    <div className='body'>
      <Header />
      <div className="perfil-layout">
        <div className="form-section">
          <div className="perfil-form-card">
            <h2>Mi Perfil</h2>
            <div className="form-row">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              type="text"
              name="rol"
              placeholder="Rol"
              value={formData.rol}
              onChange={handleChange}
              disabled
            />
            <button onClick={handleGuardar}>Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
