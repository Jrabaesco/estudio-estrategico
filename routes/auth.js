const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// Validaciones comunes
const userValidations = [
  check('username', 'El usuario es requerido').not().isEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
];

// Ruta de registro
router.post('/register', [
  ...userValidations,
  check('name', 'El nombre es requerido').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, name } = req.body;

  try {
    // Verificar si el usuario existe (case insensitive)
    let user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'El usuario ya existe' }] });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    user = new User({
      username: username.toLowerCase(), // Normalizar username
      password: hashedPassword,
      name
    });

    await user.save();

    // Responder sin datos sensibles
    res.status(201).json({ 
      msg: 'Usuario registrado exitosamente',
      user: { id: user._id, name: user.name }
    });

  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ errors: [{ msg: 'Error en el servidor' }] });
  }
});

// Ruta de login
router.post('/login', userValidations, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error en autenticación:', err);
      return res.status(500).json({ errors: [{ msg: 'Error en el servidor' }] });
    }
    if (!user) {
      return res.status(401).json({ errors: [{ msg: info.message || 'Credenciales inválidas' }] });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ errors: [{ msg: 'Error en el servidor' }] });
      }
      
      // Excluir datos sensibles en la respuesta
      const userData = {
        id: user._id,
        name: user.name,
        username: user.username
      };
      
      return res.status(200).json({ 
        msg: 'Autenticación exitosa',
        user: userData
      });
    });
  })(req, res, next);
});

module.exports = router;