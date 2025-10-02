/**
 * Rutas de Collares IoT
 * RF4: Simulación de collares inteligentes
 * Gestión de dispositivos IoT para monitoreo de ganado
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

const collarController = require('../controllers/collarController');

/**
 * GET /api/collares
 * Listar collares con filtros y paginación
 * Acceso: Administrador y Capataz
 */
router.get('/',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Collar'),
  collarController.getAll
);

/**
 * GET /api/collares/disponibles
 * Obtener collares disponibles para asignación
 * Acceso: Administrador y Capataz
 */
router.get('/disponibles',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  collarController.getDisponibles
);

/**
 * GET /api/collares/:id
 * Obtener detalles de un collar específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Collar'),
  collarController.getById
);

/**
 * POST /api/collares
 * Crear un nuevo collar
 * Acceso: Solo Administrador
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateRequired(['identificador', 'modelo']),
  validateRange('frecuencia_envio', 10, 3600), // Segundos entre envíos
  validateRange('umbral_bateria_baja', 5, 50), // Porcentaje de batería
  validateRange('umbral_temperatura_alta', 35, 45), // Temperatura en Celsius
  logCRUDActivity('Collar'),
  collarController.create
);

/**
 * PUT /api/collares/:id
 * Actualizar un collar existente
 * Acceso: Solo Administrador
 */
router.put('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateEnum('estado', ['activo', 'inactivo', 'mantenimiento', 'bateria_baja']),
  validateRange('frecuencia_envio', 10, 3600),
  validateRange('umbral_bateria_baja', 5, 50),
  validateRange('umbral_temperatura_alta', 35, 45),
  logCRUDActivity('Collar'),
  collarController.update
);

/**
 * DELETE /api/collares/:id
 * Eliminar un collar (soft delete si tiene datos asociados)
 * Acceso: Solo Administrador
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Collar'),
  collarController.remove
);

/**
 * POST /api/collares/:id/asignar
 * Asignar collar a un animal
 * Acceso: Solo Administrador
 */
router.post('/:id/asignar',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateRequired(['animal_id']),
  validateUUID('animal_id'),
  logCRUDActivity('Collar'),
  collarController.asignar
);

/**
 * POST /api/collares/:id/desasignar
 * Desasignar collar de un animal
 * Acceso: Solo Administrador
 */
router.post('/:id/desasignar',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Collar'),
  collarController.desasignar
);

module.exports = router;