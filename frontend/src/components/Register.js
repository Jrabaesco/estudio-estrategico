import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { username, password, name } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!username || !password || !name) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          username: username.toLowerCase(),
          password,
          name
        }
      );

      setSuccessMessage('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error al registrar el usuario. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='registro-usuario'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      <form onSubmit={handleSubmit}>
        <img src='/images/logo.jpg' alt='logo' />
        <h4>REGISTRO DE USUARIOS "ESTRAPOL"</h4>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div>
          <input
            type="email"
            name="username"
            placeholder='CORREO ELECTRÓNICO'
            value={username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            name="password"
            placeholder='CONTRASEÑA'
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <input
            type="text"
            name="name"
            placeholder='GRADO, NOMBRES Y APELLIDOS'
            value={name}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar'}
        </button>
        
        <div className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;