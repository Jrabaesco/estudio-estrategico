// routes/auth.js (versión actualizada)
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Ruta de registro (POST /api/auth/register)
router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;
  
  // Validación básica
  if (!username || !password || !name) {
    return res.status(400).json({ msg: 'Por favor proporcione todos los campos requeridos' });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    
    const userId = `usuario_${new Date().getTime()}`;
    user = new User({
      _id: userId,
      username,
      password,
      name
    });

    await user.save();
    res.status(201).json({ 
      msg: 'Usuario registrado exitosamente',
      userId,
      username: user.username,
      name: user.name
    });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ 
      msg: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Ruta de login (POST /api/auth/login)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error en autenticación:', err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ msg: info.message || 'Autenticación fallida' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error en login:', err);
        return next(err);
      }
      return res.json({ 
        msg: 'Login exitoso',
        user: {
          id: user._id,
          username: user.username,
          name: user.name
        }
      });
    });
  })(req, res, next);
});

// Ruta de verificación de sesión (GET /api/auth/check)
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name
      }
    });
  }
  res.json({ isAuthenticated: false });
});

// Ruta de logout (GET /api/auth/logout)
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ msg: 'Sesión cerrada exitosamente' });
});

module.exports = router;