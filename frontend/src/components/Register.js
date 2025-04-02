import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

// Configuración de axios para incluir credenciales
axios.defaults.withCredentials = true;

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

  const API_URL = process.env.REACT_APP_API_URL || 'https://estudio-estrategico-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (!formData.username || !formData.password || !formData.name) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          username: formData.username.toLowerCase(),
          password: formData.password,
          name: formData.name
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 
                         err.response?.data?.message || 
                         'Error al registrar. Intente nuevamente.';
      setError(errorMessage);
      console.error('Error en registro:', err.response?.data || err.message);
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
        
        <input
          type="email"
          name="username"
          placeholder='CORREO ELECTRÓNICO'
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder='CONTRASEÑA'
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        <input
          type="text"
          name="name"
          placeholder='GRADO, NOMBRES Y APELLIDOS'
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        
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