const express = require('express');
const Topic = require('../models/Topic');
const Question = require('../models/Question');

const router = express.Router();

// Crear un nuevo tema
router.post('/create', async (req, res) => {
  const { _id, name, short_name } = req.body;
  try {
    const topic = new Topic({ _id, name, short_name });
    await topic.save();
    res.status(201).json({ msg: 'Tema creado exitosamente', topic });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener todos los temas
router.get('/all', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener un tema específico
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    const questions = await Question.find({ topic_id: req.params.id });
    res.status(200).json({ topic, questions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener preguntas por tema
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ topic_id: req.params.id });
    if (questions.length === 0) {
      return res.status(404).json({ msg: 'Preguntas no encontradas' });
    }
    res.status(200).json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener los últimos diez exámenes por temas del usuario
router.get('/topic/:userId/last-ten', async (req, res) => {
  try {
    const topicExams = await TopicExam.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(10);
    res.status(200).json(topicExams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener los últimos diez exámenes generales del usuario
router.get('/general/:userId/last-ten', async (req, res) => {
  try {
    const generalExams = await GeneralExam.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(10);
    res.status(200).json(generalExams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});


module.exports = router;
