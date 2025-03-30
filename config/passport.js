const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Configuración de seguridad
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 30 * 60 * 1000, // 30 minutos
  ERROR_MESSAGES: {
    USER_NOT_FOUND: 'Credenciales incorrectas',
    INVALID_PASSWORD: 'Credenciales incorrectas',
    ACCOUNT_LOCKED: 'Cuenta temporalmente bloqueada'
  }
};

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passReqToCallback: true
      },
      async (req, username, password, done) => {
        try {
          const user = await User.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') }
          });

          if (!user) {
            return done(null, false, { 
              message: SECURITY_CONFIG.ERROR_MESSAGES.USER_NOT_FOUND 
            });
          }

          if (user.lockUntil && user.lockUntil > Date.now()) {
            return done(null, false, {
              message: SECURITY_CONFIG.ERROR_MESSAGES.ACCOUNT_LOCKED
            });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
              user.lockUntil = Date.now() + SECURITY_CONFIG.LOCK_TIME;
            }
            await user.save();
            return done(null, false, { 
              message: SECURITY_CONFIG.ERROR_MESSAGES.INVALID_PASSWORD 
            });
          }

          if (user.loginAttempts > 0 || user.lockUntil) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password -loginAttempts -lockUntil');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};