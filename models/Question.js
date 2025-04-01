const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  short_name: { type: String, required: true }
});

const Topic = mongoose.model('Topic', TopicSchema);
module.exports = Topic;
