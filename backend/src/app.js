 /**
      * Configuración principal de Express
      */

     const express = require('express');
     const cors = require('cors');
     const helmet = require('helmet');
     const morgan = require('morgan');
     const rateLimit = require('express-rate-limit');

     const app = express();

     // ==========================================
     // MIDDLEWARES DE SEGURIDAD
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
     // MIDDLEWARES DE PARSING
     // ==========================================

     app.use(express.json());
     app.use(express.urlencoded({ extended: true }));

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
     // const grupoRoutes = require('./routes/grupoRoutes'); // Pendiente de implementar
     // const alertaRoutes = require('./routes/alertaRoutes'); // Pendiente de implementar
     // const reporteRoutes = require('./routes/reporteRoutes'); // Pendiente de implementar

     // Registrar rutas
     app.use('/api/auth', authRoutes);
     app.use('/api/users', userRoutes);
     app.use('/api/animales', animalRoutes);
     app.use('/api/potreros', potreroRoutes);
     app.use('/api/collares', collarRoutes);
     app.use('/api/telemetria', telemetriaRoutes);
     // app.use('/api/grupos', grupoRoutes); // Pendiente de implementar
     // app.use('/api/alertas', alertaRoutes); // Pendiente de implementar
     // app.use('/api/reportes', reporteRoutes); // Pendiente de implementar

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
       console.error('Error:', err);

       const statusCode = err.statusCode || 500;
       const message = err.message || 'Error interno del servidor';

       res.status(statusCode).json({
         error: message,
         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
       });
     });

     module.exports = app;
