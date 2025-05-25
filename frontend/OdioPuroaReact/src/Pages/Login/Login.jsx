import React, {useState} from 'react'
import './Login.css'
import { useAuth } from '../../Contexto/TeLaComesSinPretexto'
import { useNavigate } from "react-router-dom"
import logo from '../../assets/logOndas.png'
import librito from '../../assets/Librito-mision.jpg'

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/Home");
    } catch (err) {
      setError("Correo o contraseña inválidos.");
    }
  };

  return (
    <div className="login-container">
      <img className="logOndas" src={logo} alt="logo" />
      <div className="login-main">
        <div className="login-image">
          <img src={librito} alt="Misión Ondas" className="login-img" />
        </div>
        <div className="login-form-container">
          <div className="login-form-box">
            <h2 className="login-title">Bienvenido a Ondas</h2>
            <p className="login-subtitle">¡Bienvenido! Por favor, introduzca sus datos.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="email" className="login-label">Correo</label>
              <input
                id="email"
                type="email"
                required
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label htmlFor="password" className="login-label">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-button">Entrar</button>
            </form>
          </div>
        </div>
      </div>
      <div className="login-footer">
        <p><strong>INFORMACIÓN DE CONTACTO DE PROGRAMA ONDAS</strong></p>
        <p>Código postal: 111321 | Correo Electrónico: ondas@minciencias.gov.co | Teléfono: (57) (1) 6258480 ext. 5405</p>
      </div>
    </div>
  )
}

export default Login