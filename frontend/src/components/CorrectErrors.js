import React, { useState, useEffect, useRef } from 'react'; // Importar useRef
import { useLocation, useNavigate } from 'react-router-dom';
import './CorrectErrors.css';

const CorrectErrors = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { incorrectQuestions } = location.state || {}; // Añadido para evitar errores
  const [questions, setQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [highlightAnswers, setHighlightAnswers] = useState(false); // Activado por defecto
  const [timer, setTimer] = useState(0);
  const checkboxRef = useRef(null); // Crear referencia para el checkbox

  useEffect(() => {
    if (incorrectQuestions) {
      setQuestions(incorrectQuestions.map(question => ({
        ...question,
        shuffledOptions: shuffleArray(question.options)
      })));
    }
  }, [incorrectQuestions]);

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

  const handleFinalize = () => {
    const correctAnswers = answeredQuestions.filter(aq => aq.correct).length;
    const incorrectAnswers = answeredQuestions.length - correctAnswers;
    navigate.push('/results', { correctAnswers, incorrectAnswers, totalQuestions: questions.length, timer, questions, answeredQuestions });
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
    <div className="correct-errors">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>ESTUDIO ESTRATÉGICO POLICIAL</h2>
        <h3>CORRECCIÓN DE ERRORES</h3>
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
              onClick={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
            >
              <input type='radio' name='questionSelector' />
              <span>{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="datos_preguntas">
          <div className="tema_pregunta2">
            MÓDULO DE CORRECCIÓN DE ERRORES
          </div>
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
                  onClick={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
                >
                  <input type='radio' name='questionSelector' />
                  <span>{index + 1}</span>
                </div>
            ))}
            </div>
            <div className="cronometro">
              <span>{formatTime(timer)}</span>
            </div>
            <div className="tema_pregunta">
              MÓDULO DE CORRECCIÓN DE ERRORES
            </div>
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
            <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}>Anterior</button>
            <button onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectErrors;
