import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login = ({ authenticate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const history = useHistory();
  const { username, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { 
        username, 
        password 
      }, {
        withCredentials: true // Necesario para cookies/sesiones
      });
      
      authenticate(res.data.user);
      history.push('/dashboard');
    } catch (err) {
      console.error('Error de autenticación:', err.response?.data || err.message);
      alert('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className='conteiner1'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo'></img>
      </div>
      <form className="login-form" onSubmit={onSubmit}>
        <div>
          <img src='/images/logo.jpg' alt='logo'></img>
          <h1>POLICÍA NACIONAL DEL PERÚ</h1>
          <h3>ESTUDIO ESTRATÉGICO POLICIAL</h3>
          <h4>Suboficiales de Armas</h4>
          <input type="text" name="username" value={username} onChange={onChange} placeholder='USUARIO' required />
        </div>
        <div>
          <input type="password" name="password" value={password} onChange={onChange} placeholder='CONTRASEÑA' required />
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;