require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logRequests, logErrors } = require('./middleware/logging');
const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');

const app = express();

// ==================== CONEXIÓN A MONGODB ====================
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });
    
    console.log('✅ MongoDB connected to:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// ==================== MIDDLEWARES ====================
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// CORS Config
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
}));

// Session Config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ==================== PASSPORT & ROUTES ====================
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use(logRequests);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    dbState: mongoose.connection.readyState,
    uptime: process.uptime()
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  logErrors(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Ocurrió un error en el servidor',
      timestamp: new Date().toISOString()
    }
  });
});

// ==================== SERVER START ====================
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 5002;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en modo ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Puerto: ${PORT}`);
    console.log(`🌐 CORS permitido para: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Recibido SIGTERM. Cerrando servidor...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('🔴 Conexiones cerradas');
        process.exit(0);
      });
    });
  });
};

startServer();