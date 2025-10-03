/**
 * Rutas de Autenticación
 * Maneja registro, login, logout y refresh de tokens
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
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

// Rate limiter específico para login (prevención de fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: 'Demasiados intentos de login',
    message: 'Has excedido el límite de intentos de inicio de sesión. Intenta nuevamente en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Solo cuenta intentos fallidos
});

// Rate limiter para registro (prevención de spam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    error: 'Límite de registros excedido',
    message: 'Has excedido el límite de registros por hora. Intenta más tarde.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar middleware de logging de autenticación a todas las rutas
router.use(logAuthActivity);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register',
  registerLimiter,
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
  loginLimiter,
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
  // Validar fortaleza de newPassword
  (req, res, next) => {
    req.body.password = req.body.newPassword; // Para que validatePassword lo evalúe
    next();
  },
  validatePassword,
  authController.changePassword
);

module.exports = router;
