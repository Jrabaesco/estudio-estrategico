const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logStream = fs.createWriteStream(
  path.join(logDir, 'requests.log'), 
  { flags: 'a' }
);

// Middleware para registrar peticiones
const logRequests = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  logStream.write(JSON.stringify(logData) + '\n');
  next();
};

// Registrar errores
const logErrors = (err) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    request: err.request ? {
      method: err.request.method,
      url: err.request.url
    } : null
  };
  
  console.error('❌ Error:', errorLog);
  fs.appendFileSync(
    path.join(logDir, 'errors.log'),
    JSON.stringify(errorLog) + '\n'
  );
};

module.exports = { logRequests, logErrors };