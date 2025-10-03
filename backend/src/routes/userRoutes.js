/**
 * Rutas de Usuarios
 * Gestión completa de usuarios con middlewares de autenticación, roles y validación.
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  requireAdmin,
  requireOwnerOrAdmin,
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateEnum
} = require('../middleware');

const userController = require('../controllers/userController');

/**
 * GET /api/users
 * Listar todos los usuarios - Solo administradores
 */
router.get('/',
  authenticate,
  requireAdmin,
  userController.getAll
);

/**
 * GET /api/users/:id
 * Obtener un usuario específico - Propietario o administrador
 */
router.get('/:id',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  userController.getById
);

/**
 * POST /api/users
 * Crear nuevo usuario - Solo administradores
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateRequired(['nombre', 'email', 'password', 'rol']),
  validateEmail,
  validatePassword,
  validateEnum('rol', ['administrador', 'capataz']),
  userController.create
);

/**
 * PUT /api/users/:id
 * Actualizar usuario - Propietario o administrador
 */
router.put('/:id',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  validateEmail, // Opcional, para validar si se envía un nuevo email
  userController.update
);

/**
 * DELETE /api/users/:id
 * Eliminar usuario - Solo administradores
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  userController.remove
);

/**
 * PATCH /api/users/:id/password
 * Cambiar contraseña de un usuario - Propietario o administrador
 */
router.patch('/:id/password',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  validateRequired(['currentPassword', 'newPassword']),
  validatePassword,
  userController.changePassword
);

/**
 * PATCH /api/users/:id/activate
 * Activar/desactivar usuario - Solo administradores
 */
router.patch('/:id/activate',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateRequired(['activo']),
  userController.toggleActive
);

module.exports = router;
