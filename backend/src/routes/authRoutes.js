/**
 * Rutas de Autenticación
 * Maneja registro, login, logout y refresh de tokens
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  checkTokenExpiration,
  validateRequired,
  validateEmail,
  validatePassword,
  validateEnum,
  logAuthActivity
} = require('../middleware');

const authController = require('../controllers/authController');

// Aplicar middleware de logging de autenticación a todas las rutas
router.use(logAuthActivity);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register',
  validateRequired(['nombre', 'email', 'password', 'rol']),
  validateEmail,
  validatePassword,
  validateEnum('rol', ['administrador', 'capataz']),
  authController.register
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login',
  validateRequired(['email', 'password']),
  validateEmail,
  authController.login
);

/**
 * POST /api/auth/refresh
 * Refrescar token JWT
 */
router.post('/refresh',
  validateRequired(['refreshToken']),
  authController.refresh
);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout',
  authController.logout
);

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me',
  authenticate,
  checkTokenExpiration(10), // Avisar si token expira en 10 minutos
  authController.getMe
);

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.post('/change-password',
  authenticate,
  validateRequired(['currentPassword', 'newPassword']),
  validatePassword,
  authController.changePassword
);

module.exports = router;
