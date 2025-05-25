import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import Header from '../../../Componentes/Header/Header'
import './RegistroUser.css'
import Swal from 'sweetalert2'

const RegistroUser = () => {
  // 1. Estado para almacenar los valores del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'Profesor',
  });

  // 2. Manejador para los cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 3. Manejador para el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 4. Realizar la petición POST al backend
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Envía los datos del formulario como JSON
      });

      const data = await response.json(); // Parsea la respuesta del servidor

      if (response.ok) {
        Swal.fire({ 
          title: '¡Éxito!',
          text: data.message || 'Usuario registrado correctamente.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          rol: 'Profesor',
        });
      } else {
        Swal.fire({ 
          title: '¡Error!',
          text: data.error || 'Hubo un problema al registrar el usuario.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      Swal.fire({ 
        title: '¡Error de Conexión!',
        text: "Hubo un problema al intentar conectar con el servidor.",
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  return (
    <div className='register-body'>
      <Header />
      <div className="register-container"> 
        <h2 className="register-title">Registrar Nuevo Usuario</h2> 
        <p className="register-subtitle">Completa los campos para añadir un nuevo usuario al sistema.</p>

        <form onSubmit={handleSubmit} className="register-form"> 
          <input
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Correo Electrónico" 
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select name="rol" value={formData.rol} onChange={handleChange} className="form-select">
            <option value="Profesor">Profesor</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Coordinador">Coordinador</option>
          </select>
          <button type="submit" className="btn-register">Guardar Usuario</button> 
        </form>
        <div className="register-actions">
            <Link to="/Usuarios" className="btn-back">Volver a Usuarios</Link>
        </div>
      </div>
    </div>
  )
}

export default RegistroUser