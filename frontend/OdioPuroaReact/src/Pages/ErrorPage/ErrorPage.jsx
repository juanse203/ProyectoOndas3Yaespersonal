import React from 'react'
import './ErrorPage.css'

const ErrorPage = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-message">
        Oops! La página que estás buscando no existe.
      </p>
      <button 
        className="error-button" 
        onClick={() => window.history.back()}
      >
        Volver atrás
      </button>
    </div>
  )
}

export default ErrorPage