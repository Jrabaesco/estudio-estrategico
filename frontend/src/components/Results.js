import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { correctAnswers, incorrectAnswers, totalQuestions, timer, questions, answeredQuestions } = location.state;

  const handleCorrectErrors = () => {
    const incorrectQuestions = questions.filter(question => {
      const answered = answeredQuestions.find(aq => aq.questionId === question._id);
      return answered && !answered.correct;
    });
    navigate.push('/correct-errors', { incorrectQuestions });
  };

  const formatTime = (timer) => {
    const hours = String(Math.floor(timer / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="results">
      <h1>Examén Virtual Finalizado</h1>
      <p>Estimado usuario, su examen virtual ha finalizado.</p>
      <p>Usted ha Obtenido:</p>
      <p className='puntaje'>{correctAnswers}  PUNTO (S)</p>
      <p>Conforme al detalle siguiente:</p>
      <p>Preguntas correctas: {correctAnswers}</p>
      <p>Preguntas incorrectas: {incorrectAnswers}</p>
      <p>Total de preguntas: {totalQuestions}</p>
      <p>Tiempo transcurrido: {formatTime(timer)}</p>
      <button onClick={handleCorrectErrors}>Corregir Errores</button>
      <button onClick={() => navigate.push('/exam-generator')}>Volver a Exámenes por Temas</button>
      <div className='respuestas_desarrolladas'>
        <h2>Examen Desarrollado</h2>
        {questions.map((question, index) => (
          <div key={question._id} className="pregunta_completa">
            <div className="pregunta">
              <span>{index + 1}.</span>
              <label>{question.question_text}</label>
            </div>
            <div className="todas_alternativas">
              {question.shuffledOptions.map((option, idx) => {
                const answered = answeredQuestions.find(aq => aq.questionId === question._id && aq.option === option);
                const isCorrect = option === question.correct_option;
                const isUserCorrect = answered && answered.correct;
                const isUserIncorrect = answered && !answered.correct && option === answered.option;
                const className = isUserCorrect ? 'correcta' : isUserIncorrect ? 'incorrecta' : isCorrect ? 'correcta' : '';
                return (
                  <div key={idx} className={`alternativas ${className}`}>
                    <input
                      type="radio"
                      name={`question_${question._id}`}
                      checked={answered && answered.option === option}
                      readOnly
                    />
                    <span>{String.fromCharCode(65 + idx)}.</span>
                    <label>{option}</label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
