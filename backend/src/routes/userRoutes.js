/**
 * Rutas de Usuarios
 * Ejemplo de uso completo de middlewares de autenticación, roles y validación
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  requireAdmin,
  requireRoles,
  requireOwnerOrAdmin,
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateEnum
} = require('../middleware');

// Controladores (deben ser creados)
// const userController = require('../controllers/userController');

/**
 * GET /api/users
 * Listar todos los usuarios - Solo administradores
 */
router.get('/',
  authenticate,
  requireAdmin,
  (req, res) => {
    // userController.getAll(req, res);
    res.status(200).json({
      message: 'Lista de usuarios',
      user: req.user,
      note: 'Solo los administradores pueden ver esta lista'
    });
  }
);

/**
 * GET /api/users/:id
 * Obtener un usuario específico - Propietario o administrador
 */
router.get('/:id',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  (req, res) => {
    // userController.getById(req, res);
    res.status(200).json({
      message: `Detalles del usuario ${req.params.id}`,
      user: req.user
    });
  }
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
  (req, res) => {
    // userController.create(req, res);
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: {
        nombre: req.body.nombre,
        email: req.body.email,
        rol: req.body.rol
      }
    });
  }
);

/**
 * PUT /api/users/:id
 * Actualizar usuario - Propietario o administrador
 */
router.put('/:id',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  validateEmail,
  (req, res) => {
    // userController.update(req, res);
    res.status(200).json({
      message: `Usuario ${req.params.id} actualizado exitosamente`,
      user: req.user
    });
  }
);

/**
 * DELETE /api/users/:id
 * Eliminar usuario - Solo administradores
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  (req, res) => {
    // userController.delete(req, res);
    res.status(200).json({
      message: `Usuario ${req.params.id} eliminado exitosamente`,
      user: req.user
    });
  }
);

/**
 * PATCH /api/users/:id/password
 * Cambiar contraseña - Propietario o administrador
 */
router.patch('/:id/password',
  authenticate,
  validateUUID('id'),
  requireOwnerOrAdmin('id'),
  validateRequired(['currentPassword', 'newPassword']),
  validatePassword,
  (req, res) => {
    // userController.changePassword(req, res);
    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
      user: req.user
    });
  }
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
  (req, res) => {
    // userController.toggleActive(req, res);
    res.status(200).json({
      message: `Usuario ${req.body.activo ? 'activado' : 'desactivado'} exitosamente`,
      user: req.user
    });
  }
);

module.exports = router;
