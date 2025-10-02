/**
 * Rutas de Animales
 * RF2: Gestión de animales y grupos
 * Implementa CRUD completo con validaciones y seguridad
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  requireRoles,
  requireAdmin,
  validateRequired,
  validateUUID,
  validateEnum,
  validateRange,
  logCRUDActivity
} = require('../middleware');

const animalController = require('../controllers/animalController');

/**
 * GET /api/animales
 * Listar animales con filtros y paginación
 * Acceso: Administrador y Capataz
 */
router.get('/',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Animal'),
  animalController.getAll
);

/**
 * GET /api/animales/:id
 * Obtener detalles de un animal específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Animal'),
  animalController.getById
);

/**
 * POST /api/animales
 * Crear un nuevo animal
 * Acceso: Solo Administrador
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateRequired(['nombre', 'raza', 'sexo']),
  validateEnum('sexo', ['macho', 'hembra']),
  validateEnum('estado_salud', ['saludable', 'enfermo', 'en_tratamiento', 'recuperacion']),
  validateRange('peso', 50, 1500), // Peso en kg para ganado bovino
  validateRange('edad', 0, 25), // Edad en años
  logCRUDActivity('Animal'),
  animalController.create
);

/**
 * PUT /api/animales/:id
 * Actualizar un animal existente
 * Acceso: Solo Administrador
 */
router.put('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateEnum('sexo', ['macho', 'hembra']),
  validateEnum('estado_salud', ['saludable', 'enfermo', 'en_tratamiento', 'recuperacion']),
  validateRange('peso', 50, 1500),
  validateRange('edad', 0, 25),
  logCRUDActivity('Animal'),
  animalController.update
);

/**
 * DELETE /api/animales/:id
 * Eliminar un animal (soft delete si tiene datos asociados)
 * Acceso: Solo Administrador
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Animal'),
  animalController.remove
);

/**
 * GET /api/animales/:id/telemetria
 * Obtener telemetría de un animal específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id/telemetria',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  animalController.getTelemetria
);

/**
 * GET /api/animales/:id/alertas
 * Obtener alertas de un animal específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id/alertas',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  animalController.getAlertas
);

module.exports = router;