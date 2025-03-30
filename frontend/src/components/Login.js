import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const { username, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      authenticate(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de autenticación:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='conteiner1'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <img src='/images/logo.jpg' alt='logo' />
          <h1>POLICÍA NACIONAL DEL PERÚ</h1>
          <h3>ESTUDIO ESTRATÉGICO POLICIAL</h3>
          <h4>Suboficiales de Armas</h4>
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            placeholder='USUARIO'
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder='CONTRASEÑA'
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
        <div className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;