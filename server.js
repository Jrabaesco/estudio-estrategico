const express = require('express');
const connectDB = require('./config/database');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics'); // Importar las rutas de temas

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Configurar sesión
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: true
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes); // Usar las rutas de temas

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));