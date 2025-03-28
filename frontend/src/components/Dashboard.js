import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  return (
    <div className='conteiner'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo'></img>
      </div>
      <div className="dashboard">
        <h1>Bienvenido! <br></br> {user.name} {user.surname}</h1>
        <div className="options">
          <Link to="/ballot" className="option"><img src='/images/logo_transparente.png' alt='Balotario Didáctico'></img>Balotario Didáctico</Link>
          <Link to="/exam-generator" className="option"><img src='/images/logo_transparente.png' alt='Examen por Temas'/>Examen por Temas</Link>
          <Link to="/general-exam" className="option"><img src='/images/logo_transparente.png' alt='Examen SIECOPOL'/>Examen SIECOPOL</Link>
        </div>
      </div>
    </div>  
  );
};

export default Dashboard;
