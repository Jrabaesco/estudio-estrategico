import React, { useState } from 'react';
import axios from 'axios';
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });

  const { username, password, name } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5002/api/auth/register', formData); // Asegúrate de que la URL es correcta
      console.log(res.data);
      alert('Usuario registrado exitosamente!');
    } catch (err) {
      console.error(err.message);
      alert('Error al registrar el usuario. Intenta nuevamente.');
    }
  };

  return (
    <div className='registro-usuario'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo'></img>
      </div>
      <form onSubmit={onSubmit}>
        <img src='/images/logo.jpg' alt='logo'></img>
        <h4>REGISTRO DE USUARIOS "ESTRAPOL"</h4>
        <div>
          <input type="email" name="username" placeholder='CORREO CORPORATIVO' value={username} onChange={onChange} required />
        </div>
        <div>
          <input type="password" name="password" placeholder='CONTRASEÑA' value={password} onChange={onChange} required />
        </div>
        <div>
          <input type="text" name="name" placeholder='GRADO, NOMBRES Y APELLIDOS' value={name} onChange={onChange} required />
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
