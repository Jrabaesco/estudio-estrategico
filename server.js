require('dotenv').config({ path: __dirname + '/.env' }); // Carga el .env desde la raíz del proyecto
const express = require('express');
const mongoose = require('mongoose'); // Importar mongoose directamente para debug
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');

const app = express();

// Debug: Verificar variables de entorno
console.log('MONGODB_URI:', process.env.MONGODB_URI); 
console.log('PORT:', process.env.PORT);

// Conexión a MongoDB con manejo mejorado de errores
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout de 5 segundos
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Termina la aplicación con error
  }
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Configuración de sesión mejorada
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', dbState: mongoose.connection.readyState });
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Iniciar servidor después de conectar a MongoDB
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI?.split('@')[1] || 'hidden'}`);
  });
};

startServer();