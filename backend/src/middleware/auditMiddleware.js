/**
 * Middleware de Auditoría y Logging
 * Registra actividades importantes para seguridad y análisis
 */

const logger = require('../utils/logger');

/**
 * Middleware para log de actividades de autenticación
 */
const logAuthActivity = (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Capturar información de la actividad de auth
      const activity = {
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode
      };

      // Si es un login exitoso
      if (req.path.includes('/login') && res.statusCode === 200 && data.data?.usuario) {
        logger.info('Inicio de sesión exitoso', {
          ...activity,
          userId: data.data.usuario.id,
          userEmail: data.data.usuario.email,
          userRole: data.data.usuario.rol
        });
      }

      // Si es un login fallido
      if (req.path.includes('/login') && res.statusCode === 401) {
        logger.warn('Intento de inicio de sesión fallido', {
          ...activity,
          email: req.body?.email,
          reason: data.error
        });

        // Marcar como intento fallido para protección de fuerza bruta
        if (req.checkBruteForce) {
          req.checkBruteForce(true);
        }
      }

      // Si es un registro exitoso
      if (req.path.includes('/register') && res.statusCode === 201) {
        logger.info('Usuario registrado exitosamente', {
          ...activity,
          userId: data.data?.usuario?.id,
          userEmail: data.data?.usuario?.email,
          userRole: data.data?.usuario?.rol
        });
      }

      // Si es logout
      if (req.path.includes('/logout') && res.statusCode === 200) {
        logger.info('Cierre de sesión', {
          ...activity,
          userId: req.user?.id,
          userEmail: req.user?.email
        });
      }

      // Si es refresh token
      if (req.path.includes('/refresh')) {
        if (res.statusCode === 200) {
          logger.info('Token refrescado exitosamente', activity);
        } else {
          logger.warn('Intento de refresh token fallido', {
            ...activity,
            reason: data.error
          });
        }
      }

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('Error en logAuthActivity:', error);
    next();
  }
};

/**
 * Middleware para log de actividades CRUD importantes
 */
const logCRUDActivity = (resourceType) => {
  return (req, res, next) => {
    try {
      const originalJson = res.json;
      
      res.json = function(data) {
        const activity = {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          path: req.path,
          resourceType,
          userId: req.user?.id,
          userEmail: req.user?.email,
          userRole: req.user?.rol,
          statusCode: res.statusCode
        };

        // Log según el tipo de operación
        if (res.statusCode >= 200 && res.statusCode < 300) {
          switch (req.method) {
            case 'POST':
              logger.info(`${resourceType} creado`, {
                ...activity,
                resourceId: data.data?.id,
                action: 'CREATE'
              });
              break;

            case 'PUT':
            case 'PATCH':
              logger.info(`${resourceType} actualizado`, {
                ...activity,
                resourceId: req.params.id || req.params.userId,
                action: 'UPDATE'
              });
              break;

            case 'DELETE':
              logger.warn(`${resourceType} eliminado`, {
                ...activity,
                resourceId: req.params.id || req.params.userId,
                action: 'DELETE'
              });
              break;

            case 'GET':
              // Solo loguear operaciones GET sensibles (no listar)
              if (req.params.id) {
                logger.info(`${resourceType} consultado`, {
                  ...activity,
                  resourceId: req.params.id,
                  action: 'READ'
                });
              }
              break;
          }
        } else {
          // Log de errores
          logger.warn(`Error en operación ${resourceType}`, {
            ...activity,
            error: data.error,
            action: req.method
          });
        }

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Error en logCRUDActivity:', error);
      next();
    }
  };
};

/**
 * Middleware para detectar y loguear accesos no autorizados
 */
const logUnauthorizedAccess = (req, res, next) => {
  try {
    const originalStatus = res.status;
    
    res.status = function(code) {
      if (code === 401 || code === 403) {
        const activity = {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          path: req.path,
          statusCode: code,
          userId: req.user?.id,
          userEmail: req.user?.email,
          headers: {
            authorization: req.get('Authorization') ? 'presente' : 'ausente',
            contentType: req.get('Content-Type')
          }
        };

        if (code === 401) {
          logger.warn('Acceso no autenticado', activity);
        } else {
          logger.warn('Acceso sin autorización', activity);
        }
      }

      return originalStatus.call(this, code);
    };

    next();
  } catch (error) {
    logger.error('Error en logUnauthorizedAccess:', error);
    next();
  }
};

/**
 * Middleware para detectar y loguear patrones sospechosos
 */
const detectSuspiciousActivity = (req, res, next) => {
  try {
    const suspiciousIndicators = [];
    
    // 1. Headers sospechosos
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
    suspiciousHeaders.forEach(header => {
      if (req.get(header)) {
        suspiciousIndicators.push(`Header sospechoso: ${header}`);
      }
    });

    // 2. User-Agent vacío o sospechoso
    const userAgent = req.get('User-Agent');
    if (!userAgent) {
      suspiciousIndicators.push('User-Agent ausente');
    } else if (userAgent.length < 10) {
      suspiciousIndicators.push('User-Agent muy corto');
    }

    // 3. Múltiples parámetros inusuales
    const queryKeys = Object.keys(req.query || {});
    if (queryKeys.length > 20) {
      suspiciousIndicators.push('Demasiados parámetros query');
    }

    // 4. Headers de tamaño inusual
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > 8192) { // 8KB
      suspiciousIndicators.push('Headers muy grandes');
    }

    // 5. Paths sospechosos
    const suspiciousPaths = [
      '/admin', '/wp-admin', '/.env', '/config',
      '/phpinfo', '/info.php', '/test.php'
    ];
    
    if (suspiciousPaths.some(path => req.path.includes(path))) {
      suspiciousIndicators.push('Path sospechoso');
    }

    // Si hay indicadores sospechosos, loguear
    if (suspiciousIndicators.length > 0) {
      logger.warn('Actividad sospechosa detectada', {
        ip: req.ip,
        userAgent,
        method: req.method,
        path: req.path,
        indicators: suspiciousIndicators,
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    logger.error('Error en detectSuspiciousActivity:', error);
    next();
  }
};

/**
 * Middleware para generar métricas de uso
 */
const generateMetrics = (req, res, next) => {
  try {
    const startTime = Date.now();
    
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      
      // Métricas básicas
      const metrics = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        userRole: req.user?.rol,
        requestSize: parseInt(req.get('Content-Length')) || 0,
        responseSize: parseInt(res.get('Content-Length')) || 0
      };

      // Log métricas (puedes enviar a un sistema de métricas)
      if (duration > 5000) { // Requests lentos (>5s)
        logger.warn('Request lento detectado', metrics);
      }

      if (res.statusCode >= 500) {
        logger.error('Error del servidor', metrics);
      }

      // En producción, podrías enviar estas métricas a sistemas como:
      // - Prometheus
      // - New Relic
      // - DataDog
      // - CloudWatch

      return originalEnd.apply(this, args);
    };

    next();
  } catch (error) {
    logger.error('Error en generateMetrics:', error);
    next();
  }
};

/**
 * Middleware para loguear cambios sensibles de configuración
 */
const logConfigChanges = (req, res, next) => {
  try {
    // Solo aplicar a rutas de configuración o admin
    const isConfigRoute = req.path.includes('/config') || 
                         req.path.includes('/admin') ||
                         req.path.includes('/settings');

    if (!isConfigRoute) {
      return next();
    }

    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.warn('Cambio de configuración realizado', {
          timestamp: new Date().toISOString(),
          userId: req.user?.id,
          userEmail: req.user?.email,
          userRole: req.user?.rol,
          ip: req.ip,
          method: req.method,
          path: req.path,
          body: req.body, // En producción, filtrar datos sensibles
          userAgent: req.get('User-Agent')
        });
      }

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('Error en logConfigChanges:', error);
    next();
  }
};

module.exports = {
  logAuthActivity,
  logCRUDActivity,
  logUnauthorizedAccess,
  detectSuspiciousActivity,
  generateMetrics,
  logConfigChanges
};