import React, { useState, useEffect, useRef } from 'react'; // Importar useRef
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import './ExamByTopic.css';

const ExamByTopic = ({ user }) => {
  const { topicId, questionCount } = useParams();
  const history = useHistory();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [highlightAnswers, setHighlightAnswers] = useState(false); // Activado por defecto
  const [topicName, setTopicName] = useState('');
  const checkboxRef = useRef(null); // Crear referencia para el checkbox

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5002/api/topics/${topicId}`);
        const shuffledQuestions = shuffleArray(res.data.questions);
        setQuestions(shuffledQuestions.slice(0, questionCount).map(question => ({
          ...question,
          shuffledOptions: shuffleArray(question.options)
        })));
        setTopicName(res.data.topic.name);
      } catch (error) {
        console.error('Error fetching questions', error);
      }
    };
    fetchQuestions();
  }, [topicId, questionCount]);

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

  const handleDeleteAnswer = (questionId) => {
    setAnsweredQuestions(answeredQuestions.filter(aq => aq.questionId !== questionId));
  };

  const formatTime = (timer) => {
    const hours = String(Math.floor(timer / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleFinalize = async () => {
    const correctAnswers = answeredQuestions.filter(aq => aq.correct).length;
    const totalQuestions = questions.length;
    const timeSpent = timer;

    // Guardar el historial en la base de datos
    try {
      await axios.post('http://localhost:5002/api/historial', {
        userId: user._id, // ID del usuario
        examType: 'tema', // Tipo de examen
        topicId: topicId, // ID del tema
        correctAnswers: correctAnswers, // Respuestas correctas
        totalQuestions: totalQuestions, // Total de preguntas
        timeSpent: timeSpent // Tiempo en segundos
      });
    } catch (error) {
      console.error('Error al guardar el historial', error);
    }

    // Redirigir a la página de resultados
    history.push(`/results`, { correctAnswers, incorrectAnswers: totalQuestions - correctAnswers, totalQuestions, timer, questions, answeredQuestions });
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

  const toggleHighlightAnswers = () => {
    setHighlightAnswers(!highlightAnswers);
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
    if (checkboxRef.current) {
      checkboxRef.current.checked = false; // Desmarcar el checkbox
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-by-topic">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>ESTUDIO ESTRATEGICO POLICIAL</h2>
        <h3>Módulo de Examen por Temas</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>
      <div className="name_usuario">
        <p>Usuario: {user ? `${user.name}` : 'Nombre de Usuario No Disponible'}</p>
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
          <div className="tema_pregunta2">{topicName}</div>
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
            <div className="cronometro">
              <span>{formatTime(timer)}</span>
            </div>
            <div className="tema_pregunta">{topicName}</div>
            <button className="text" onClick={() => {
              if (window.confirm('¿Deseas finalizar el examen?')) handleFinalize();
            }}>Finalizar</button>
          </div>
          {currentQuestion && (
            <div className="pregunta_completa">
              <div className="pregunta">
                <span>{currentQuestionIndex + 1}.</span>
                <label>{currentQuestion.question_text}</label>
              </div>
              <div className="todas_alternativas">
                {currentQuestion.shuffledOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`alternativas ${
                      highlightAnswers && answeredQuestions.find(aq => aq.questionId === currentQuestion._id && aq.option === option)
                        ? option === currentQuestion.correct_option
                          ? 'correcta'
                          : 'incorrecta'
                        : ''
                    } ${
                      highlightAnswers && option === currentQuestion.correct_option && answeredQuestions.find(aq => aq.questionId === currentQuestion._id && !aq.correct)
                        ? 'correcta'
                        : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQuestion._id}`}
                      checked={answeredQuestions.find(aq => aq.questionId === currentQuestion._id && aq.option === option) || false}
                      onChange={() => handleAnswer(currentQuestion._id, option, option === currentQuestion.correct_option)}
                    />
                    <span>{String.fromCharCode(65 + idx)}.</span>
                    <label>{option}</label>
                  </div>
                ))}
                <button className="borrar respuesta" onClick={() => handleDeleteAnswer(currentQuestion._id)}>Borrar Respuesta</button>
                <button className="activar" onClick={toggleHighlightAnswers}>{highlightAnswers ? 'Desactivar' : 'Activar'} Color</button>
              </div>
            </div>
          )}
          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>PREGUNTAS CONTESTADAS: {answeredQuestions.length}</li>
              <li>PREGUNTAS SIN CONTESTAR: {questions.length - answeredQuestions.length}</li>
              <li>TOTAL PREGUNTAS: {questions.length}</li>
            </ul>
          </div>
          <div className="numero_letra_respuestas">
            {answeredQuestions.map((aq, index) => {
              const questionIndex = questions.findIndex(q => q._id === aq.questionId);
              const optionIndex = questions[questionIndex].shuffledOptions.indexOf(aq.option);
              return (
                <div key={index}>
                  {questionIndex + 1}{String.fromCharCode(65 + optionIndex)}
                </div>
              );
            })}
          </div>
          <div className="botones">
            <button onClick={handleRestart}>Reiniciar</button>
            <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}>Anterior</button>
            <button onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}>Siguiente</button>
            <button onClick={() => history.push('/exam-generator')}>Escoger otro tema</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamByTopic;