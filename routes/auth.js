const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Usuario ya existe' });
    }
    const userId = `usuario_${new Date().getTime()}`;
    user = new User({
      _id: userId,
      username,
      password,
      name
    });
    await user.save();
    res.status(201).json({ msg: 'Usuario registrado', userId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta de login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ msg: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ msg: 'Login exitoso', user });
    });
  })(req, res, next);
});

module.exports = router;
