const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  _id: { 
    type: String,
    required: true,
    unique: true,
    default: () => `user_${new mongoose.Types.ObjectId()}`
  },
  username: { 
    type: String, 
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El usuario no puede exceder los 30 caracteres']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No se incluye en consultas a menos que se solicite explícitamente
  },
  name: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Actualiza automáticamente createdAt y updatedAt
  versionKey: false // Desactiva el campo __v
});

// Middleware para hashear la contraseña
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Middleware para actualizar la fecha de modificación
UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la cuenta está bloqueada
UserSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Método para incrementar intentos fallidos
UserSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutos
  }
  
  return await this.updateOne(updates);
};

// Método para resetear intentos fallidos
UserSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;