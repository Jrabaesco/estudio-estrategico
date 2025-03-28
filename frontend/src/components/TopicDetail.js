import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import './TopicDetail.css';

const TopicDetail = ({ user }) => {
  const { id } = useParams();
  const history = useHistory();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const checkboxRef = useRef(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await axios.get(`http://localhost:5002/api/topics/${id}`);
        setTopic(res.data.topic);
        setQuestions(res.data.questions.map(question => ({
          ...question,
          shuffledOptions: shuffleArray(question.options)
        })));
      } catch (error) {
        console.error('Error fetching topic data', error);
      }
    };
    fetchTopic();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleAnswer = (questionId, option, correct) => {
    const existingAnswerIndex = answeredQuestions.findIndex(aq => aq.questionId === questionId);
    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answeredQuestions];
      updatedAnswers[existingAnswerIndex] = { questionId, option, correct };
      setAnsweredQuestions(updatedAnswers);
    } else {
      setAnsweredQuestions([...answeredQuestions, { questionId, option, correct }]);
    }
  };

  const formatTime = (timer) => {
    const hours = String(Math.floor(timer / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleFinalize = () => {
    const correctAnswers = answeredQuestions.filter(aq => aq.correct).length;
    const incorrectAnswers = answeredQuestions.length - correctAnswers;
    alert(`Preguntas correctas: ${correctAnswers}\nPreguntas incorrectas: ${incorrectAnswers}\nTotal de preguntas respondidas: ${answeredQuestions.length}\nTiempo transcurrido: ${formatTime(timer)}`);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnsweredQuestions([]);
    setTimer(0);
    setQuestions(questions.map(question => ({
      ...question,
      shuffledOptions: shuffleArray(question.options)
    })));
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
    if (checkboxRef.current) {
      checkboxRef.current.checked = false; // Desmarcar el checkbox
    }
  };

  return (
    <div className="topic-detail">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>BALOTARIO DIDÁCTICO</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>
      <div className="name_usuario">
        <p>Usuario: {user ? user.name : 'Invitado'}</p> {/* Verificación del objeto user */}
      </div>
      <div className="contenedor_examen">
        <div className="caja_numero_preguntas">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`numero_pregunta ${answeredQuestions.some(aq => aq.questionId === questions[index]._id) ? 'respondida' : ''}`}
              onClick={() => handleQuestionClick(index)} 
            >
              <input type='radio' name='questionSelector' />
              <span>{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="datos_preguntas">
          <div className="tema_pregunta2">{topic && topic.short_name}</div>
          <div className="encabezamiento_pregunta">
            <input type="checkbox" id="mostrar_preguntas" ref={checkboxRef} />
            <label htmlFor="mostrar_preguntas" className="icono_preguntas">
              <img src="/images/menu-icon.png" className="menu_icono" alt="" />
            </label>
            <div className="caja_numero_preguntas2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`numero_pregunta ${answeredQuestions.some(aq => aq.questionId === questions[index]._id) ? 'respondida' : ''}`}
                  onClick={() => handleQuestionClick(index)} 
                >
                  <input type='radio' name='questionSelector' />
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="cronómetro">
              <span>{formatTime(timer)}</span>
            </div>
            <div className="tema_pregunta">{topic && topic.name}</div>
            <button className="text" onClick={handleFinalize}>Finalizar Examen</button>
          </div>
          {currentQuestion && (
            <div className="pregunta_completa">
              <div className="pregunta">
                <span>{currentQuestionIndex + 1}.</span>
                <label>{currentQuestion.question_text}</label>
              </div>
              <div className="todas_alternativas">
                {currentQuestion.shuffledOptions.map((option, idx) => {
                  const isSelected = answeredQuestions.some(aq => aq.questionId === currentQuestion._id && aq.option === option);
                  const isCorrect = option === currentQuestion.correct_option;

                  return (
                    <div
                      key={idx}
                      className={`alternativas ${isSelected ? (isCorrect ? 'correcta' : 'incorrecta') : ''} ${answeredQuestions.some(aq => aq.questionId === currentQuestion._id) && isCorrect ? 'correcta' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion._id}`}
                        checked={isSelected}
                        onChange={() => handleAnswer(currentQuestion._id, option, isCorrect)}
                      />
                      <span>{String.fromCharCode(65 + idx)}.</span>
                      <label>{option}</label>
                    </div>
                  );
                })}
                <button className="ayuda" onClick={() => alert(currentQuestion.tips)}>Ayuda</button>
              </div>
            </div>
          )}
          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>CORRECTAS: {answeredQuestions.filter(aq => aq.correct).length}</li>
              <li>INCORRECTAS: {answeredQuestions.length - answeredQuestions.filter(aq => aq.correct).length}</li>
              <li>TOTAL RESPONDIDAS: {answeredQuestions.length}</li>
              <li>TOTAL PREGUNTAS: {questions.length}</li>
            </ul>
          </div>
          <div className="botones">
            <button onClick={handleRestart}>Reiniciar</button>
            <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}>Anterior</button>
            <button onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}>Siguiente</button>
            <button onClick={() => history.push('/ballot')}>Menú Temas</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;