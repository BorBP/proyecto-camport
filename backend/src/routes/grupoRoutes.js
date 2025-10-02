/**
 * Rutas de Grupos de Animales
 * Gestión de agrupaciones de ganado para organización y manejo
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  requireRoles,
  requireAdmin,
  validateRequired,
  validateUUID,
  logCRUDActivity
} = require('../middleware');

const grupoController = require('../controllers/grupoController');

/**
 * GET /api/grupos
 * Listar grupos con filtros y paginación
 * Acceso: Administrador y Capataz
 */
router.get('/',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Grupo'),
  grupoController.getAll
);

/**
 * GET /api/grupos/:id
 * Obtener detalles de un grupo específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Grupo'),
  grupoController.getById
);

/**
 * POST /api/grupos
 * Crear un nuevo grupo
 * Acceso: Solo Administrador
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateRequired(['nombre']),
  logCRUDActivity('Grupo'),
  grupoController.create
);

/**
 * PUT /api/grupos/:id
 * Actualizar un grupo existente
 * Acceso: Solo Administrador
 */
router.put('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Grupo'),
  grupoController.update
);

/**
 * DELETE /api/grupos/:id
 * Eliminar un grupo (soft delete)
 * Acceso: Solo Administrador
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Grupo'),
  grupoController.remove
);

/**
 * POST /api/grupos/:id/asignar-animales
 * Asignar animales a un grupo
 * Acceso: Solo Administrador
 */
router.post('/:id/asignar-animales',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateRequired(['animal_ids']),
  logCRUDActivity('Grupo'),
  grupoController.asignarAnimales
);

/**
 * POST /api/grupos/:id/remover-animales
 * Remover animales de un grupo
 * Acceso: Solo Administrador
 */
router.post('/:id/remover-animales',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateRequired(['animal_ids']),
  logCRUDActivity('Grupo'),
  grupoController.removerAnimales
);

/**
 * POST /api/grupos/:id/mover-potrero
 * Mover todo el grupo a otro potrero
 * Acceso: Solo Administrador
 */
router.post('/:id/mover-potrero',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateUUID('potrero_id'),
  logCRUDActivity('Grupo'),
  grupoController.moverAPotrero
);

module.exports = router;