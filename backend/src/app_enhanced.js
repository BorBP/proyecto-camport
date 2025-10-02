/**
 * Configuración principal de Express con Middlewares de Seguridad Avanzada
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importar middlewares personalizados
const {
  bruteForceProtection,
  sqlInjectionProtection,
  maliciousHeaderProtection,
  sanitizeInput,
  validateContentType,
  payloadSizeLimit,
  logUnauthorizedAccess,
  detectSuspiciousActivity,
  generateMetrics
} = require('./middleware');

const app = express();

// ==========================================
// MIDDLEWARES DE SEGURIDAD AVANZADA
// ==========================================

// Protección contra headers maliciosos y actividad sospechosa
app.use(maliciousHeaderProtection);
app.use(detectSuspiciousActivity);

// Protección contra ataques de fuerza bruta
app.use(bruteForceProtection(5, 15)); // 5 intentos en 15 minutos

// Limitar tamaño del payload
app.use(payloadSizeLimit(1024)); // Máximo 1MB

// ==========================================
// MIDDLEWARES DE SEGURIDAD BÁSICA
// ==========================================

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Demasiadas solicitudes, intenta más tarde'
});
app.use('/api', limiter);

// ==========================================
// MIDDLEWARES DE PARSING Y VALIDACIÓN
// ==========================================

// Validar Content-Type
app.use(validateContentType);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitizar entrada de datos
app.use(sanitizeInput);

// Protección contra inyección SQL/NoSQL
app.use(sqlInjectionProtection);

// ==========================================
// MIDDLEWARES DE LOGGING Y AUDITORÍA
// ==========================================

// Logging de accesos no autorizados
app.use(logUnauthorizedAccess);

// Métricas de rendimiento
app.use(generateMetrics);

// Logging de desarrollo
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// RUTAS
// ==========================================

app.get('/', (req, res) => {
  res.json({
    nombre: 'Camport API',
    version: '1.0.0',
    descripcion: 'Sistema de Control Ganadero con IoT',
    estado: 'operativo',
    seguridad: {
      https: req.secure,
      rateLimiting: true,
      bruteForceProtection: true,
      sqlInjectionProtection: true,
      sanitization: true,
      maliciousHeaderProtection: true,
      payloadSizeLimit: '1MB'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    security: {
      middlewares: [
        'helmet',
        'cors',
        'rateLimit',
        'bruteForceProtection',
        'sqlInjectionProtection',
        'maliciousHeaderProtection',
        'sanitizeInput',
        'payloadSizeLimit',
        'detectSuspiciousActivity'
      ]
    }
  });
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const potreroRoutes = require('./routes/potreroRoutes');
const animalRoutes = require('./routes/animalRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const collarRoutes = require('./routes/collarRoutes');
const telemetriaRoutes = require('./routes/telemetriaRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/potreros', potreroRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/collares', collarRoutes);
app.use('/api/telemetria', telemetriaRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/reportes', reporteRoutes);

// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;