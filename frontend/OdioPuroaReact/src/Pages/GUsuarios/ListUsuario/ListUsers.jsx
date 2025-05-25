import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../Componentes/Header/Header';
import Swal from 'sweetalert2';
import { Pagination, Stack } from '@mui/material';
import './ListUsers.css';

const ListUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchUsuarios = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios?page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Error HTTP! Estado: ${response.status}`);
      }

      const data = await response.json();
      setUsuarios(data.items);
      setCurrentPage(data.meta.currentPage);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('No se pudieron cargar los usuarios.');
      setUsuarios([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios(currentPage);
  }, [currentPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (uid) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/api/delete/${uid}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('No se pudo eliminar el usuario');
          }

          Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
          fetchUsuarios(currentPage);
        } catch (error) {
          console.error('Error al eliminar:', error);
          Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
        }
      }
    });
  };

  const handleEdit = (uid) => {
    const usuario = usuarios.find((u) => u.id === uid);
    if (!usuario) return;

    setSelectedUser(usuario);
    setFormEdit({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      password: usuario.password || ''
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async () => {
    if (!selectedUser || !selectedUser.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/update/${selectedUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formEdit)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar');
      }

      Swal.fire('Actualizado', 'El usuario fue actualizado correctamente.', 'success');
      setIsModalOpen(false);
      fetchUsuarios(currentPage);
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
    }
  };

  return (
    <div className='body'>
      <div className="usuarios-container">
        <Header />
        <h1 className="usuarios-title">Administración de Usuarios</h1>

        <div className="acciones-header">
          <Link to="/register" className="btn-anadir">
            + Añadir Nuevo Usuario
          </Link>
        </div>

        {loading && <p className="loading-message">Cargando usuarios...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          usuarios.length > 0 ? (
            <>
              <div className="tabla-responsive">
                <table className="tabla-usuarios">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nombre} {user.apellido}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`rol-badge rol-${user.rol ? user.rol.toLowerCase() : 'desconocido'}`}>
                            {user.rol || 'Desconocido'}
                          </span>
                        </td>
                        <td className="acciones-columna">
                          <button onClick={() => handleEdit(user.id)} className="btn-accion btn-editar">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="btn-accion btn-eliminar">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination-container">
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </div>
            </>
          ) : (
            <p className="no-usuarios">No hay usuarios registrados.</p>
          )
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Editar Usuario</h2>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formEdit.nombre}
                onChange={handleFormChange}
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formEdit.apellido}
                onChange={handleFormChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Correo"
                value={formEdit.email}
                onChange={handleFormChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formEdit.password}
                onChange={handleFormChange}
              />
              <div className="modal-buttons">
                <button onClick={handleSubmitEdit} className="btn-guardar">Guardar</button>
                <button onClick={() => setIsModalOpen(false)} className="btn-cancelar">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListUsers