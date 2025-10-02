/**
 * Middleware de Autenticación JWT
 * Verifica el token JWT en las solicitudes
 */

const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware principal de autenticación
 * Verifica el token JWT y adjunta el usuario al request
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        message: 'Debes incluir el token de autenticación en el header Authorization'
      });
    }

    // 2. Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Formato de token inválido',
        message: 'El formato correcto es: Bearer <token>'
      });
    }

    const token = parts[1];

    // 3. Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'El token proporcionado no es válido',
          code: 'TOKEN_INVALID'
        });
      }
      if (error.name === 'NotBeforeError') {
        return res.status(401).json({
          error: 'Token no válido aún',
          message: 'El token no es válido hasta una fecha futura',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }
      throw error;
    }

    // 4. Verificar que no sea un refresh token
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        error: 'Token de tipo incorrecto',
        message: 'No puedes usar un refresh token para autenticación',
        code: 'WRONG_TOKEN_TYPE'
      });
    }

    // 5. Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado a este token no existe',
        code: 'USER_NOT_FOUND'
      });
    }

    // 6. Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Usuario inactivo',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador',
        code: 'USER_INACTIVE'
      });
    }

    // 7. Verificar si el token fue emitido antes de un cambio de password
    // (esto es útil si implementas invalidación de tokens al cambiar password)
    if (usuario.passwordChangedAt && decoded.iat) {
      const passwordChangedTimestamp = Math.floor(usuario.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedTimestamp) {
        return res.status(401).json({
          error: 'Token obsoleto',
          message: 'Tu contraseña fue cambiada. Por favor inicia sesión nuevamente',
          code: 'TOKEN_OBSOLETE'
        });
      }
    }

    // 8. Adjuntar usuario al request para uso en controladores
    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp
    };

    // 9. Adjuntar información del token para auditoría
    req.tokenInfo = {
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
      timeToExpire: (decoded.exp * 1000) - Date.now()
    };

    next();
  } catch (error) {
    logger.error('Error en authMiddleware:', error);
    return res.status(500).json({
      error: 'Error de autenticación',
      message: 'Ocurrió un error al verificar tu identidad',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, solo lo verifica si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // No procesar refresh tokens
      if (decoded.type === 'refresh') {
        return next();
      }

      const usuario = await Usuario.findByPk(decoded.id);

      if (usuario && usuario.activo) {
        // Verificar token obsoleto
        if (usuario.passwordChangedAt && decoded.iat) {
          const passwordChangedTimestamp = Math.floor(usuario.passwordChangedAt.getTime() / 1000);
          if (decoded.iat < passwordChangedTimestamp) {
            return next(); // Token obsoleto, pero no falla
          }
        }

        req.user = {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          tokenIssuedAt: decoded.iat,
          tokenExpiresAt: decoded.exp
        };

        req.tokenInfo = {
          issuedAt: new Date(decoded.iat * 1000),
          expiresAt: new Date(decoded.exp * 1000),
          timeToExpire: (decoded.exp * 1000) - Date.now()
        };
      }
    } catch (error) {
      // Si hay error en el token opcional, simplemente no adjuntamos el usuario
      logger.debug('Token opcional inválido:', error.message);
    }

    next();
  } catch (error) {
    logger.error('Error en optionalAuth:', error);
    next();
  }
};

/**
 * Middleware para verificar si el token está próximo a expirar
 * Útil para avisar al frontend que debe refrescar el token
 */
const checkTokenExpiration = (warningMinutes = 10) => {
  return (req, res, next) => {
    try {
      if (req.tokenInfo && req.tokenInfo.timeToExpire) {
        const warningTime = warningMinutes * 60 * 1000; // convertir a ms
        
        if (req.tokenInfo.timeToExpire <= warningTime && req.tokenInfo.timeToExpire > 0) {
          res.set('X-Token-Expiring', 'true');
          res.set('X-Token-Expires-In', Math.floor(req.tokenInfo.timeToExpire / 1000).toString());
        }
      }
      
      next();
    } catch (error) {
      logger.error('Error en checkTokenExpiration:', error);
      next();
    }
  };
};

/**
 * Middleware para logging de actividad de autenticación
 */
const logAuthAccess = (req, res, next) => {
  try {
    if (req.user) {
      logger.info('Acceso autenticado', {
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.rol,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        tokenExpiresIn: req.tokenInfo?.timeToExpire
      });
    }
    
    next();
  } catch (error) {
    logger.error('Error en logAuthAccess:', error);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  checkTokenExpiration,
  logAuthAccess
};
