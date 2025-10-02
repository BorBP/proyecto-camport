/**
 * Middleware de Roles y Permisos
 * Verifica que el usuario tenga los permisos necesarios
 */

/**
 * Middleware para verificar si el usuario es administrador
 */
const requireAdmin = (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Verificar rol de administrador
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los administradores pueden acceder a este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireAdmin:', error);
    return res.status(500).json({
      error: 'Error de autorización',
      message: 'Ocurrió un error al verificar tus permisos'
    });
  }
};

/**
 * Middleware para verificar si el usuario es capataz
 */
const requireCapataz = (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Verificar rol de capataz
    if (req.user.rol !== 'capataz') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los capataces pueden acceder a este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireCapataz:', error);
    return res.status(500).json({
      error: 'Error de autorización',
      message: 'Ocurrió un error al verificar tus permisos'
    });
  }
};

/**
 * Middleware para verificar múltiples roles permitidos
 * @param {Array<string>} rolesPermitidos - Array con los roles permitidos
 * @example requireRoles(['administrador', 'capataz'])
 */
const requireRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Este recurso requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireRoles:', error);
      return res.status(500).json({
        error: 'Error de autorización',
        message: 'Ocurrió un error al verificar tus permisos'
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario solo acceda a sus propios recursos
 * o que sea administrador
 * @param {string} paramName - Nombre del parámetro que contiene el ID del usuario
 */
const requireOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
      }

      // Los administradores tienen acceso a todo
      if (req.user.rol === 'administrador') {
        return next();
      }

      // Obtener el ID del recurso (puede estar en params, query o body)
      const resourceUserId = req.params[paramName] || req.query[paramName] || req.body[paramName];

      // Verificar que el usuario sea el propietario del recurso
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes acceder a tus propios recursos'
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireOwnerOrAdmin:', error);
      return res.status(500).json({
        error: 'Error de autorización',
        message: 'Ocurrió un error al verificar tus permisos'
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requireCapataz,
  requireRoles,
  requireOwnerOrAdmin
};
