import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { username, password, name } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpiar error al escribir
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validación básica del formulario
    if (!username || !password || !name) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        username: username.toLowerCase(), // Normalizar a minúsculas
        password,
        name
      });
      
      setSuccessMessage('Registro exitoso! Serás redirigido al login...');
      console.log('Registro exitoso:', res.data);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error en registro:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Error al registrar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='registro-usuario'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      
      <form onSubmit={onSubmit}>
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
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            name="password"
            placeholder='CONTRASEÑA'
            value={password}
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <input
            type="text"
            name="name"
            placeholder='GRADO, NOMBRES Y APELLIDOS'
            value={name}
            onChange={onChange}
            required
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;