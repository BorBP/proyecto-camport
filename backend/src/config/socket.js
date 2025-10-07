  /**
      * Configuración de Socket.io para comunicación en tiempo real
      */

     const socketIO = require('socket.io');
     const { verifyToken } = require('../utils/jwt');
     const logger = require('../utils/logger');

     let io = null;

     /**
      * Inicializa Socket.io
      * @param {Object} server - Servidor HTTP
      */
     function init(server) {
       io = socketIO(server, {
         cors: {
           origin: process.env.CORS_ORIGIN?.split(',') || '*',
           credentials: false // Consistente con el CORS de Express
         }
       });

       // Middleware de autenticación para sockets
       io.use((socket, next) => {
         const token = socket.handshake.auth.token;

         if (!token) {
           return next(new Error('Token no proporcionado'));
         }

         try {
           const decoded = verifyToken(token);
           socket.userId = decoded.id;
           socket.userRole = decoded.rol;
           next();
         } catch (error) {
           next(new Error('Autenticación fallida'));
         }
       });

       // Eventos de conexión
       io.on('connection', (socket) => {
         logger.info(`🔌 Cliente conectado: ${socket.id}`);

         // Unirse a sala de usuario
         socket.join(`user_${socket.userId}`);

         socket.on('disconnect', () => {
           logger.info(`🔌 Cliente desconectado: ${socket.id}`);
         });
       });

       return io;
     }

     /**
      * Obtiene la instancia de Socket.io
      */
     function getIO() {
       if (!io) {
         throw new Error('Socket.io no ha sido inicializado');
       }
       return io;
     }

     /**
      * Emite evento de nueva telemetría
      */
     function emitTelemetria(data) {
       if (io) {
         io.emit('telemetria:update', data);
       }
     }

     /**
      * Emite evento de nueva alerta
      */
     function emitAlerta(alerta) {
       if (io) {
         io.emit('alerta:nueva', alerta);
       }
     }

     module.exports = {
       init,
       getIO,
       emitTelemetria,
       emitAlerta
     };
