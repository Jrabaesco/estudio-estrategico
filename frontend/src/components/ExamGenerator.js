import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ExamGenerator.css';

const ExamGenerator = ({ user }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get('http://localhost:5002/api/topics/all');
        setTopics(res.data);
      } catch (error) {
        console.error('Error fetching topics', error);
      }
    };
    fetchTopics();
  }, []);

  const handleTopicChange = async (e) => {
    const topicId = e.target.value;
    setSelectedTopic(topicId);

    // Fetch the number of questions for the selected topic
    try {
      const res = await axios.get(`http://localhost:5002/api/topics/${topicId}`);
      setMaxQuestions(res.data.questions.length);
    } catch (error) {
      console.error('Error fetching question count', error);
    }
  };

  const handleQuestionCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > maxQuestions) {
      alert(`Solo puedes seleccionar un máximo de ${maxQuestions} preguntas para este tema.`);
      setQuestionCount(maxQuestions);
    } else {
      setQuestionCount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTopic && questionCount > 0) {
      navigate.push(`/exam-by-topic/${selectedTopic}/${questionCount}`); // Redireccionar a exam-by-topic
    } else {
      alert('Por favor, selecciona un tema y una cantidad válida de preguntas.');
    }
  };

  return (
    <div className='conteiner'>
      <div className='imgFondo'>
          <img src="/images/fondoSolo.png" alt='img_fondo'></img>
      </div>
      <div className="menu_extem">
        <img src="favicon.ico" alt="Logo" />
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Proceso de Ascenso Suboficiales de Armas 2025 - Promoción 2026</h2>
        <form className='exam-form' onSubmit={handleSubmit}>
          <label>Examen por Temas - Escoge el Tema</label>
          <select name="temas" onChange={handleTopicChange} value={selectedTopic}>
            <option value="">Selecciona un tema</option>
            {topics.map(topic => (
              <option key={topic._id} value={topic._id}>{topic.short_name}</option>
            ))}
          </select>
          <label>¿Cuántas preguntas deseas practicar?</label>
          <input
            className="numero"
            type="number"
            value={questionCount}
            onChange={handleQuestionCountChange}
          /><br></br>
          <button type="submit">Generar Examen</button>
        </form>
      </div>
    </div>  
  );
};

export default ExamGenerator;
