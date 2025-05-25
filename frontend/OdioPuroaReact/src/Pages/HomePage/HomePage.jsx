import React from 'react'
import Header from '../../Componentes/Header/Header'
import { Box, Typography } from '@mui/material'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className='body'>
      <Box className="main-container">
        <Header />

        <Box className="welcome-area">
          <Box className="welcome-content">
            <Typography variant="h4" component="h1" className="welcome-title">
              ¡Bienvenido a Proyectos ONDAS!
            </Typography>
            <Typography variant="body1" className="welcome-message">
              Explora y gestiona todos tus proyectos en un solo lugar.
            </Typography>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default HomePage