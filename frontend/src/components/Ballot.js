import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Ballot.css';

const Ballot = ({ user }) => { // Recibir el objeto user como prop
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get('http://localhost:5002/api/topics/all'); // Asegúrate de que la URL sea correcta
        setTopics(res.data);
      } catch (error) {
        console.error('Error fetching topics', error);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className='conteiner'>
      <div className='imgFondo'>
          <img src="/images/fondoSolo.png" alt='img_fondo'></img>
      </div>
      <div className="ballot">
        <h1>{user.name}</h1>
        <p>¿Qué BALOTARIO DIDÁTICO deseas practicar?</p>
        <div className="topics">
          {topics.map(topic => (
            <Link to={`/topic/${topic._id}`} key={topic._id} className="topic"><img src='/images/logo_transparente.png' alt='Imagen'/>
              {topic.short_name}
            </Link>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Ballot;
