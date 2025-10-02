/**
 * Índice de Middlewares
 * Exporta todos los middlewares de forma centralizada
 */

const { authenticate, optionalAuth, checkTokenExpiration, logAuthAccess } = require('./authMiddleware');
const { 
  requireAdmin, 
  requireCapataz, 
  requireRoles, 
  requireOwnerOrAdmin 
} = require('./roleMiddleware');
const { 
  validateRequired, 
  validateEmail, 
  validatePassword, 
  validateUUID, 
  validateRange, 
  validateEnum, 
  validateCoordinates, 
  validateDate 
} = require('./validationMiddleware');
const {
  bruteForceProtection,
  sqlInjectionProtection,
  maliciousHeaderProtection,
  sanitizeInput,
  validateContentType,
  payloadSizeLimit
} = require('./securityMiddleware');
const {
  logAuthActivity,
  logCRUDActivity,
  logUnauthorizedAccess,
  detectSuspiciousActivity,
  generateMetrics,
  logConfigChanges
} = require('./auditMiddleware');

module.exports = {
  // Autenticación
  authenticate,
  optionalAuth,
  checkTokenExpiration,
  logAuthAccess,
  
  // Roles y permisos
  requireAdmin,
  requireCapataz,
  requireRoles,
  requireOwnerOrAdmin,
  
  // Validaciones
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateRange,
  validateEnum,
  validateCoordinates,
  validateDate,
  
  // Seguridad avanzada
  bruteForceProtection,
  sqlInjectionProtection,
  maliciousHeaderProtection,
  sanitizeInput,
  validateContentType,
  payloadSizeLimit,
  
  // Auditoría y logging
  logAuthActivity,
  logCRUDActivity,
  logUnauthorizedAccess,
  detectSuspiciousActivity,
  generateMetrics,
  logConfigChanges
};
