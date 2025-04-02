import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ExamenGeneral.css";

const ExamenGeneral = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [highlightAnswers, setHighlightAnswers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60);
  const [error, setError] = useState(null);
  const [questionsPerTopic, setQuestionsPerTopic] = useState({});
  const checkboxRef = useRef(null);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const topicRes = await axios.get(
          "http://localhost:5002/api/topics/all"
        );
        const fetchedTopics = topicRes.data;

        const questionLimits = {
          1: 8,
          2: 4,
          3: 7,
          4: 9,
          5: 5,
          6: 4,
          7: 9,
          8: 5,
          9: 12,
          10: 12,
          11: 2,
          12: 4,
          13: 3,
          14: 4,
          15: 6,
          16: 2,
          17: 2,
          18: 2,
        };

        const questionsArr = await Promise.all(
          fetchedTopics.map(async (topic, index) => {
            const questionsRes = await axios.get(
              `http://localhost:5002/api/topics/${topic._id}/questions`
            );
            const questionsForTopic = questionsRes.data.map((question) => ({
              ...question,
              topic_name: topic.name,
              shuffledOptions: shuffleArray(question.options),
            }));
            const limit = questionLimits[index + 1] || questionsForTopic.length;
            return shuffleArray(questionsForTopic).slice(0, limit);
          })
        );

        const allQuestions = questionsArr.flat();
        setQuestions(allQuestions);

        const questionsByTopic = {};
        allQuestions.forEach((question) => {
          if (!questionsByTopic[question.topic_name]) {
            questionsByTopic[question.topic_name] = 0;
          }
          questionsByTopic[question.topic_name]++;
        });
        setQuestionsPerTopic(questionsByTopic);
      } catch (error) {
        console.error("Error fetching topics and questions", error);
        setError(
          "Error al cargar las preguntas. Inténtalo de nuevo más tarde."
        );
      }
    };
    fetchQuestions();
  }, []);

  // Memorizar handleFinalize
  const handleFinalize = useCallback(async () => {
    const correctAnswers = answeredQuestions.filter((aq) => aq.correct).length;
    const totalQuestions = questions.length;
    const timeSpent = 2 * 60 * 60 - timeLeft; // Tiempo en segundos

    // Guardar el historial en la base de datos
    try {
      await axios.post("http://localhost:5002/api/historial", {
        userId: user._id, // ID del usuario
        examType: "general", // Tipo de examen
        correctAnswers: correctAnswers, // Respuestas correctas
        totalQuestions: totalQuestions, // Total de preguntas
        timeSpent: timeSpent, // Tiempo en segundos
      });
    } catch (error) {
      console.error("Error al guardar el historial", error);
    }

    // Redirigir a la página de resultados
    navigate.push(`/results`, {
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      totalQuestions,
      timer: timeSpent,
      questions,
      answeredQuestions,
    });
  }, [answeredQuestions, navigate, questions, timeLeft, user._id]);

  // Temporizador
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          handleFinalize();
          return 0;
        }
        if (prevTime === 1800 || prevTime === 900 || prevTime === 300) {
          alert(`Quedan ${prevTime / 60} minutos.`);
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleFinalize]);

  // Manejar la selección de una respuesta
  const handleAnswer = (questionId, option, correct) => {
    setAnsweredQuestions((prevAnswers) => {
      const existingAnswer = prevAnswers.find(
        (aq) => aq.questionId === questionId
      );
      if (existingAnswer) {
        return prevAnswers.map((aq) =>
          aq.questionId === questionId ? { ...aq, option, correct } : aq
        );
      } else {
        return [...prevAnswers, { questionId, option, correct }];
      }
    });
  };

  // Borrar una respuesta
  const handleDeleteAnswer = (questionId) => {
    setAnsweredQuestions(
      answeredQuestions.filter((aq) => aq.questionId !== questionId)
    );
  };

  // Formatear el tiempo restante
  const formatTime = (timer) => {
    const hours = String(Math.floor(timer / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Alternar resaltado de respuestas
  const toggleHighlightAnswers = () => {
    setHighlightAnswers(!highlightAnswers);
  };

  // Obtener la pregunta actual
  const currentQuestion = questions[currentQuestionIndex];
  const currentTopicName = currentQuestion ? currentQuestion.topic_name : "";

  // Calcular el índice relativo de la pregunta dentro de su tema
  const getRelativeQuestionIndex = () => {
    if (!currentQuestion) return 0;

    const topicName = currentQuestion.topic_name;
    const questionsInTopic = questions.filter(
      (q) => q.topic_name === topicName
    );
    const indexInTopic = questionsInTopic.findIndex(
      (q) => q._id === currentQuestion._id
    );

    return indexInTopic + 1; // Sumar 1 para mostrar el índice basado en 1
  };

  // Manejar clic en una pregunta
  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
    if (checkboxRef.current) {
      checkboxRef.current.checked = false; // Desmarcar el checkbox
    }
  };

  // Mostrar mensaje de error si hay un problema
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="examen-general">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Sistema de Evaluación del Conocimiento Policial - SIECOPOL</h2>
        <h3>Módulo de Examen Virtual</h3>
        <p>
          SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 -
          PROMOCIÓN 2026
        </p>
      </div>
      <div className="name_usuario">
        <p>
          Usuario: {user ? `${user.name}` : "Nombre de Usuario No Disponible"}
        </p>
      </div>
      <div className="contenedor_examen">
        <div className="caja_numero_preguntas">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`numero_pregunta ${
                answeredQuestions.some(
                  (aq) => aq.questionId === questions[index]._id
                )
                  ? "respondida"
                  : ""
              }`}
              onClick={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
            >
              <input
                type="radio"
                name="questionSelector"
                checked={currentQuestionIndex === index}
                onChange={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
              /><span>
              {index + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="datos_preguntas">
          {currentQuestion && (
            <div className="tema_pregunta2">
              {`${currentTopicName} (${getRelativeQuestionIndex()} de ${
                questionsPerTopic[currentTopicName] || 0
              })`}
            </div>
          )}
          <div className="encabezamiento_pregunta">
            <input type="checkbox" id="mostrar_preguntas" ref={checkboxRef} />
            <label htmlFor="mostrar_preguntas" className="icono_preguntas">
              <img src="/images/menu-icon.png" className="menu_icono" alt="" />
            </label>
            <div className="caja_numero_preguntas2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`numero_pregunta ${
                    answeredQuestions.some(
                      (aq) => aq.questionId === questions[index]._id
                    )
                      ? "respondida"
                      : ""
                  }`}
                  onClick={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
                >
                  <input
                    type="radio"
                    name="questionSelector"
                    checked={currentQuestionIndex === index}
                    onChange={() => handleQuestionClick(index)} // Utiliza la nueva función handleQuestionClick
                  />
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="cronometro">
              <span>{formatTime(timeLeft)}</span>
            </div>
            {currentQuestion && (
              <div className="tema_pregunta">
                {`${currentTopicName} (${getRelativeQuestionIndex()} de ${
                  questionsPerTopic[currentTopicName] || 0
                })`}
              </div>
            )}
            <button
              className="text"
              onClick={() => {
                if (window.confirm("¿Deseas finalizar el examen?"))
                  handleFinalize();
              }}
            >
              Finalizar
            </button>
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
                      highlightAnswers &&
                      answeredQuestions.find(
                        (aq) =>
                          aq.questionId === currentQuestion._id &&
                          aq.option === option
                      )
                        ? option === currentQuestion.correct_option
                          ? "correcta"
                          : "incorrecta"
                        : ""
                    } ${
                      highlightAnswers &&
                      option === currentQuestion.correct_option &&
                      answeredQuestions.find(
                        (aq) =>
                          aq.questionId === currentQuestion._id && !aq.correct
                      )
                        ? "correcta"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQuestion._id}`}
                      checked={
                        answeredQuestions.find(
                          (aq) =>
                            aq.questionId === currentQuestion._id &&
                            aq.option === option
                        ) || false
                      }
                      onChange={() =>
                        handleAnswer(
                          currentQuestion._id,
                          option,
                          option === currentQuestion.correct_option
                        )
                      }
                    />
                    <span>{String.fromCharCode(65 + idx)}.</span>
                    <label>{option}</label>
                  </div>
                ))}
                <button
                  className="borrar respuesta"
                  onClick={() => handleDeleteAnswer(currentQuestion._id)}
                >
                  Borrar Respuesta
                </button>
                <button className="activar" onClick={toggleHighlightAnswers}>
                  {highlightAnswers ? "Desactivar" : "Activar"} Color
                </button>
              </div>
            </div>
          )}
          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>PREGUNTAS CONTESTADAS: {answeredQuestions.length}</li>
              <li>
                PREGUNTAS SIN CONTESTAR:{" "}
                {questions.length - answeredQuestions.length}
              </li>
              <li>TOTAL PREGUNTAS: {questions.length}</li>
            </ul>
          </div>
          <div className="numero_letra_respuestas">
            {answeredQuestions.map((aq, index) => {
              const questionIndex = questions.findIndex(
                (q) => q._id === aq.questionId
              );
              const optionIndex = questions[
                questionIndex
              ].shuffledOptions.indexOf(aq.option);
              return (
                <div key={index}>
                  {questionIndex + 1}
                  {String.fromCharCode(65 + optionIndex)}
                </div>
              );
            })}
          </div>
          <div className="botones">
            <button
              onClick={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentQuestionIndex(
                  Math.min(questions.length - 1, currentQuestionIndex + 1)
                )
              }
            >
              Siguiente
            </button>
            <button
              className="text"
              onClick={() => {
                if (window.confirm("¿Deseas finalizar el examen?"))
                  handleFinalize();
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenGeneral;
