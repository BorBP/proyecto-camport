
     /**
      * Camport - Sistema de Control Ganadero con IoT
      * Servidor Principal
      */

     require('dotenv').config();
     const app = require('./src/app');
     const { sequelize } = require('./src/config/database');
     const logger = require('./src/utils/logger');

     const PORT = process.env.PORT || 3000;

     // Función para iniciar el servidor
     async function startServer() {
       try {
         // 1. Verificar conexión a la base de datos
         await sequelize.authenticate();
         logger.info('✅ Conexión a la base de datos establecida');

         // 2. Sincronizar modelos con la BD (en desarrollo)
         if (process.env.NODE_ENV === 'development') {
           await sequelize.sync({ alter: true });
           logger.info('✅ Modelos sincronizados con la base de datos');
         }

         // 3. Iniciar servidor HTTP
         const server = app.listen(PORT, () => {
           logger.info(`🚀 Servidor Camport en puerto ${PORT}`);
           logger.info(`📡 API: http://localhost:${PORT}/api`);
         });

         // 4. Configurar Socket.io para tiempo real
         const io = require('./src/config/socket').init(server);
         logger.info('🔌 Socket.io configurado');

         // 5. Iniciar servicio de alertas automáticas
         const AlertService = require('./src/services/alertService');
         AlertService.iniciar();
         logger.info('🚨 Sistema de alertas iniciado');

         // 6. Manejo de cierre graceful
         process.on('SIGTERM', () => shutdown(server));
         process.on('SIGINT', () => shutdown(server));

       } catch (error) {
         logger.error('❌ Error al iniciar:', error);
         process.exit(1);
       }
     }

     // Función para cerrar ordenadamente
     async function shutdown(server) {
       logger.info('⏳ Cerrando servidor...');

       try {
         server.close(() => logger.info('✅ Servidor HTTP cerrado'));
         await sequelize.close();
         logger.info('✅ Base de datos cerrada');

         const AlertService = require('./src/services/alertService');
         AlertService.stopMonitoring();
         logger.info('✅ Sistema de alertas detenido');

         process.exit(0);
       } catch (error) {
         logger.error('❌ Error al cerrar:', error);
         process.exit(1);
       }
     }

     // Manejo de errores no capturados
     process.on('unhandledRejection', (reason, promise) => {
       logger.error('❌ Unhandled Rejection:', reason);
     });

     process.on('uncaughtException', (error) => {
       logger.error('❌ Uncaught Exception:', error);
       process.exit(1);
     });

     // 🚀 Iniciar el servidor
     startServer();
