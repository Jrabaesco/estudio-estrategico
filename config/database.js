const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' }); // Ruta absoluta

const connectDB = async () => {
  console.log('URI:', process.env.MONGODB_URI); // Debug
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; // Exportación ES5