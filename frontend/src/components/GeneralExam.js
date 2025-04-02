import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GeneralExam.css';

const GeneralExam = ({ user }) => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate.push('/examen-general'); // Ruta para iniciar el examen general
  };

  return (
    <div className="general-exam">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Sistema de Evaluación del Conocimiento Policial - TIPO SIECOPOL</h2>
        <h3>Módulo de Examen Virtual</h3>
        <p>
          SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026
        </p>
      </div>
      <div className="name_usuario">
        <p>Usuario: {user ? `${user.name}` : 'Nombre de Usuario No Disponible'}</p>
      </div>
      <div className="instrucciones">
        <div className="instrucciones_contenido">
          <h4>Estimado(a) Usuario(a)</h4>
          <p>Usted se encuentra en el Módulo de Examen Virtual del Sistema de Evaluaciones de Conocimiento Policial (TIPO SIECOPOL), el cual ha sido desarrollado con la finalidad de generar un único examen a cada postulante a partir  del Banco de Preguntas válidas seleccionadas para el presente prceso de evaluación, considerando su grado y especialidad.</p>
          <div className='advertencia'>
          <h4>Advertencía</h4>
            <ul>
              <li>Todas las acciones que realice en este equipo de cómputo durante el examen están siendo gravadas.</li>
              <li>Ante cualquier manipulación del teclado fuera de lo establecido, el sistema automáticamente dara por finalizado su examen.</li>
            </ul>
          </div>
          <h4>Instrucciones:</h4>
            <ul>
              <li>Para ver la pregunta debe seleccionarla haciendo click en el número del tablero ubicado a la izquierda de la pantalla</li>
              <li>Conteste la pregunta haciendo click en la letra o el texto de la alternativa que considere correcta.</li>
              <li>Puede regresar a una pregunta ya contestada, cambiar la alternativaseleccionada o borrar la respuesta para ser contestada posteriormente.</li>
              <li>Si desea puede finalizar el examen antes de cumplirse el tiempo de duración establecido.</li>
              <li>No olvide acercarse al Administrador del Examen Virtual para firmar y recibir el acta de finalización correspondiente</li>
            </ul>
            <p>Atentamente,</p>
            <p>Dirección de Recursos Humanos de la Policía Nacional del Perú</p>
        </div>
        <div className='button_instrucciones'>
          <button onClick={handleStartExam} className="btn_comenzar_examen">Generar Examen Virtual</button>
        </div>
      </div>
    </div>
  );
};

export default GeneralExam;
