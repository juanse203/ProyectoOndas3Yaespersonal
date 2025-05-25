import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './Pages/Login/Login'
import HomePage from './Pages/HomePage/HomePage'
import Perfil from './Pages/Perfil/Perfil'
import RegistroUser from './Pages/GUsuarios/RegistroUsuario/RegistroUser'
import Usuarios from './Pages/GUsuarios/ListUsuario/ListUsers'
import AddProyecto from './Pages/GProyectos/AddProyecto/AddProyecto'
import DetallesProyect from './Pages/GProyectos/DetailsProyecto/Detalles'
import Proyectos from './Pages/GProyectos/ListProyectos/ListProyectos'

import Avances from './Pages/GAvances/Avances'
import Reportes from './Pages/Reportes/Reportes'
import ErrorPage from './Pages/ErrorPage/ErrorPage'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/Home' element={<HomePage />}/>

        {/* Gestion de usuarios */}
        <Route path='/perfil' element={<Perfil />}/>
        <Route path='/register' element={<RegistroUser />}/>
        <Route path='/Usuarios' element={<Usuarios />}/>

        {/* Gestion de proyectos */}
        <Route path='/AniadirProyect' element={<AddProyecto />}/>
        <Route path='/DetallesProyect/:id' element={<DetallesProyect />}/>
        <Route path='/Proyectos' element={<Proyectos />}/>
        <Route path='/Avances' element={<Avances />}/>
        <Route path='/Reportes' element={<Reportes />}/>

        {/* La clasica pagina de error claro que si */}
        <Route path='/*' element={<ErrorPage />}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
