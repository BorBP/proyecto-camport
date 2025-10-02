/**
 * Middleware de Seguridad Avanzada
 * Detecta intentos de ataques y comportamientos sospechosos
 */

const logger = require('../utils/logger');

// Cache para rastrear intentos fallidos por IP
const failedAttempts = new Map();
const blockedIPs = new Set();

/**
 * Middleware para detectar ataques de fuerza bruta
 * Bloquea IPs que hacen demasiados intentos fallidos
 */
const bruteForceProtection = (maxAttempts = 5, windowMinutes = 15) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Si la IP está bloqueada
    if (blockedIPs.has(clientIP)) {
      logger.warn(`IP bloqueada intentando acceder: ${clientIP}`);
      return res.status(429).json({
        error: 'IP bloqueada',
        message: 'Tu IP ha sido bloqueada temporalmente por múltiples intentos fallidos',
        retryAfter: windowMinutes * 60
      });
    }

    // Continuar con la request
    req.checkBruteForce = (failed = false) => {
      if (!failed) {
        // Si fue exitoso, limpiar intentos fallidos
        failedAttempts.delete(clientIP);
        return;
      }

      // Incrementar intentos fallidos
      const now = Date.now();
      const attempts = failedAttempts.get(clientIP) || { count: 0, firstAttempt: now };
      
      // Si es una nueva ventana de tiempo, resetear
      if (now - attempts.firstAttempt > windowMinutes * 60 * 1000) {
        attempts.count = 1;
        attempts.firstAttempt = now;
      } else {
        attempts.count++;
      }

      failedAttempts.set(clientIP, attempts);

      // Si excede max intentos, bloquear IP
      if (attempts.count >= maxAttempts) {
        blockedIPs.add(clientIP);
        logger.warn(`IP bloqueada por fuerza bruta: ${clientIP} (${attempts.count} intentos)`);
        
        // Desbloquear después del tiempo de ventana
        setTimeout(() => {
          blockedIPs.delete(clientIP);
          failedAttempts.delete(clientIP);
          logger.info(`IP desbloqueada: ${clientIP}`);
        }, windowMinutes * 60 * 1000);
      }
    };

    next();
  };
};

/**
 * Middleware para detectar patrones de inyección SQL/NoSQL
 */
const sqlInjectionProtection = (req, res, next) => {
  try {
    const suspiciousPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
      /(\$where|\$ne|\$gt|\$lt|\$or|\$and)/i,
      /(script\s*>|javascript:|data:)/i,
      /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i
    ];

    const checkValue = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
          for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
              logger.warn(`Posible inyección detectada en ${currentPath}: ${value}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
              });
              
              return res.status(400).json({
                error: 'Entrada inválida',
                message: 'Se detectaron caracteres no permitidos en la entrada'
              });
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          const result = checkValue(value, currentPath);
          if (result) return result;
        }
      }
    };

    // Verificar body, query y params
    const checkResult = checkValue({ ...req.body, ...req.query, ...req.params });
    if (checkResult) return checkResult;

    next();
  } catch (error) {
    logger.error('Error en sqlInjectionProtection:', error);
    next();
  }
};

/**
 * Middleware para detectar headers maliciosos
 */
const maliciousHeaderProtection = (req, res, next) => {
  try {
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-cluster-client-ip'
    ];

    const userAgent = req.get('User-Agent');
    const suspiciousUserAgents = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /burp/i,
      /curl.*bot/i,
      /python.*requests/i
    ];

    // Verificar User-Agent sospechoso
    if (userAgent) {
      for (const pattern of suspiciousUserAgents) {
        if (pattern.test(userAgent)) {
          logger.warn(`User-Agent sospechoso detectado: ${userAgent}`, {
            ip: req.ip,
            path: req.path
          });
          
          return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Cliente no autorizado'
          });
        }
      }
    }

    // Verificar headers de proxy sospechosos
    for (const header of suspiciousHeaders) {
      const value = req.get(header);
      if (value && value.includes('127.0.0.1')) {
        logger.warn(`Header sospechoso detectado: ${header}=${value}`, {
          ip: req.ip,
          path: req.path
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error en maliciousHeaderProtection:', error);
    next();
  }
};

/**
 * Middleware para sanitizar entrada de datos
 */
const sanitizeInput = (req, res, next) => {
  try {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      return str
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/data:/gi, ''); // Remover data:
    };

    const sanitizeObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return sanitizeString(obj);
    };

    // Sanitizar body, query y params
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);

    next();
  } catch (error) {
    logger.error('Error en sanitizeInput:', error);
    next();
  }
};

/**
 * Middleware para validar Content-Type en requests POST/PUT
 */
const validateContentType = (req, res, next) => {
  try {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      
      if (!contentType) {
        return res.status(400).json({
          error: 'Content-Type requerido',
          message: 'Debes especificar el Content-Type del cuerpo de la petición'
        });
      }

      const allowedTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data'
      ];

      const isValid = allowedTypes.some(type => contentType.includes(type));
      
      if (!isValid) {
        return res.status(415).json({
          error: 'Content-Type no soportado',
          message: `Content-Type debe ser uno de: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error en validateContentType:', error);
    next();
  }
};

/**
 * Middleware para limitar el tamaño del payload
 */
const payloadSizeLimit = (maxSizeKB = 1024) => {
  return (req, res, next) => {
    try {
      const contentLength = parseInt(req.get('Content-Length')) || 0;
      const maxSizeBytes = maxSizeKB * 1024;

      if (contentLength > maxSizeBytes) {
        logger.warn(`Payload demasiado grande: ${contentLength} bytes (máximo: ${maxSizeBytes})`, {
          ip: req.ip,
          path: req.path
        });

        return res.status(413).json({
          error: 'Payload demasiado grande',
          message: `El tamaño máximo permitido es ${maxSizeKB}KB`,
          received: `${Math.round(contentLength / 1024)}KB`
        });
      }

      next();
    } catch (error) {
      logger.error('Error en payloadSizeLimit:', error);
      next();
    }
  };
};

module.exports = {
  bruteForceProtection,
  sqlInjectionProtection,
  maliciousHeaderProtection,
  sanitizeInput,
  validateContentType,
  payloadSizeLimit
};