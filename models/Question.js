const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  topic_id: { type: String, required: true },
  question_text: { type: String, required: true },
  options: [
    { type: String, required: true }
  ],
  correct_option: { type: String, required: true },
  tips: { type: String }
});

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
