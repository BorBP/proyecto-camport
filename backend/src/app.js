 /**
      * Configuración principal de Express
      */

     const express = require('express');
     const cors = require('cors');
     const helmet = require('helmet');
     const morgan = require('morgan');
     const rateLimit = require('express-rate-limit');
     const {
       bruteForceProtection,
       sqlInjectionProtection,
       maliciousHeaderProtection,
       sanitizeInput,
       validateContentType,
       payloadSizeLimit
     } = require('./middleware/securityMiddleware');

     const app = express();

     // ==========================================
     // MIDDLEWARES DE SEGURIDAD
     // ==========================================

     // 1. Helmet con configuración CSP avanzada
     app.use(helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           styleSrc: ["'self'", "'unsafe-inline'"],
           scriptSrc: ["'self'"],
           imgSrc: ["'self'", 'data:', 'https:'],
           connectSrc: ["'self'"],
           fontSrc: ["'self'"],
           objectSrc: ["'none'"],
           mediaSrc: ["'self'"],
           frameSrc: ["'none'"],
         },
       },
       hsts: {
         maxAge: 31536000, // 1 año
         includeSubDomains: true,
         preload: true
       },
       referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
     }));

     // 2. HTTPS enforcement en producción
     if (process.env.NODE_ENV === 'production') {
       app.use((req, res, next) => {
         if (req.header('x-forwarded-proto') !== 'https') {
           return res.redirect(301, `https://${req.header('host')}${req.url}`);
         }
         next();
       });
     }

     // 3. CORS sin wildcard - requiere configuración explícita
     const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim());
     if (!corsOrigins || corsOrigins.length === 0) {
       throw new Error('❌ CORS_ORIGIN no configurado. Define los orígenes permitidos en .env');
     }
     app.use(cors({
       origin: corsOrigins,
       credentials: true,
       optionsSuccessStatus: 200
     }));

     // 4. Rate limiting global
     const limiter = rateLimit({
       windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
       max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
       message: 'Demasiadas solicitudes, intenta más tarde',
       standardHeaders: true,
       legacyHeaders: false,
     });
     app.use('/api', limiter);

     // 5. Protección contra fuerza bruta
     app.use(bruteForceProtection(5, 15));

     // 6. Detección de headers maliciosos
     app.use(maliciousHeaderProtection);

     // ==========================================
     // MIDDLEWARES DE PARSING
     // ==========================================

     app.use(express.json({ limit: '1mb' }));
     app.use(express.urlencoded({ extended: true, limit: '1mb' }));

     // ==========================================
     // MIDDLEWARES DE SEGURIDAD POST-PARSING
     // ==========================================

     // 7. Validación de Content-Type
     app.use(validateContentType);

     // 8. Límite de tamaño de payload
     app.use(payloadSizeLimit(1024)); // 1MB

     // 9. Detección de SQL/NoSQL injection
     app.use(sqlInjectionProtection);

     // 10. Sanitización de entrada
     app.use(sanitizeInput);

     // Logging
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
         estado: 'operativo'
       });
     });

     app.get('/health', (req, res) => {
       res.json({
         status: 'ok',
         timestamp: new Date().toISOString(),
         uptime: process.uptime()
       });
     });

     // Importar rutas
     const authRoutes = require('./routes/authRoutes');
     const userRoutes = require('./routes/userRoutes');
     const animalRoutes = require('./routes/animalRoutes');
     const potreroRoutes = require('./routes/potreroRoutes');
     const collarRoutes = require('./routes/collarRoutes');
     const telemetriaRoutes = require('./routes/telemetriaRoutes');
     const grupoRoutes = require('./routes/grupoRoutes');
     const alertaRoutes = require('./routes/alertaRoutes');
     const reporteRoutes = require('./routes/reporteRoutes');

     // Registrar rutas
     app.use('/api/auth', authRoutes);
     app.use('/api/users', userRoutes);
     app.use('/api/animales', animalRoutes);
     app.use('/api/potreros', potreroRoutes);
     app.use('/api/collares', collarRoutes);
     app.use('/api/telemetria', telemetriaRoutes);
     app.use('/api/grupos', grupoRoutes);
     app.use('/api/alertas', alertaRoutes);
     app.use('/api/reportes', reporteRoutes);

     // ==========================================
     // MANEJO DE ERRORES
     // ==========================================

     app.use((req, res) => {
       res.status(404).json({
         error: 'Ruta no encontrada',
         path: req.originalUrl
       });
     });

     app.use((err, req, res, next) => {
       const logger = require('./utils/logger');
       logger.error('Error en aplicación:', {
         error: err.message,
         stack: err.stack,
         method: req.method,
         path: req.path,
         ip: req.ip
       });

       const statusCode = err.statusCode || 500;
       const message = err.message || 'Error interno del servidor';

       res.status(statusCode).json({
         error: message,
         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
       });
     });

     module.exports = app;
