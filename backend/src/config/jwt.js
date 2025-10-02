  /**
      * Configuración de JWT (JSON Web Tokens)
      */

     const jwt = require('jsonwebtoken');

     const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
     const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

     /**
      * Genera un token JWT
      * @param {Object} payload - Datos a incluir en el token
      * @returns {String} Token generado
      */
     function generateToken(payload) {
       return jwt.sign(payload, JWT_SECRET, {
         expiresIn: JWT_EXPIRES_IN
       });
     }

     /**
      * Verifica y decodifica un token JWT
      * @param {String} token - Token a verificar
      * @returns {Object} Payload decodificado
      */
     function verifyToken(token) {
       try {
         return jwt.verify(token, JWT_SECRET);
       } catch (error) {
         throw new Error('Token inválido o expirado');
       }
    }

     module.exports = {
       generateToken,
       verifyToken,
       JWT_SECRET,
       JWT_EXPIRES_IN
     };
