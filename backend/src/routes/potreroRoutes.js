/**
 * Rutas de Potreros (Geocercas)
 * RF1: Gestión de potreros y geocercas
 * Crear, editar y eliminar geocercas digitales para delimitar áreas de pastoreo
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  requireRoles,
  requireAdmin,
  validateRequired,
  validateUUID,
  validateCoordinates,
  validateRange,
  logCRUDActivity
} = require('../middleware');

const potreroController = require('../controllers/potreroController');

/**
 * GET /api/potreros
 * Listar potreros con filtros y paginación
 * Acceso: Administrador y Capataz
 */
router.get('/',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Potrero'),
  potreroController.getAll
);

/**
 * GET /api/potreros/:id
 * Obtener detalles de un potrero específico
 * Acceso: Administrador y Capataz
 */
router.get('/:id',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Potrero'),
  potreroController.getById
);

/**
 * POST /api/potreros
 * Crear un nuevo potrero (geocerca)
 * Acceso: Solo Administrador
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateRequired(['nombre', 'coordenadas']),
  validateRange('area', 0.1, 10000), // Área en hectáreas
  validateRange('capacidad_maxima', 1, 1000), // Capacidad de animales
  logCRUDActivity('Potrero'),
  potreroController.create
);

/**
 * PUT /api/potreros/:id
 * Actualizar un potrero existente
 * Acceso: Solo Administrador
 */
router.put('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  validateRange('area', 0.1, 10000),
  validateRange('capacidad_maxima', 1, 1000),
  logCRUDActivity('Potrero'),
  potreroController.update
);

/**
 * DELETE /api/potreros/:id
 * Eliminar un potrero (soft delete si tiene datos asociados)
 * Acceso: Solo Administrador
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateUUID('id'),
  logCRUDActivity('Potrero'),
  potreroController.remove
);

/**
 * POST /api/potreros/:id/validar-punto
 * Validar si un punto está dentro del potrero (geocerca)
 * Útil para detectar si un animal está dentro o fuera del área
 * Acceso: Administrador y Capataz
 */
router.post('/:id/validar-punto',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  validateRequired(['latitud', 'longitud']),
  validateCoordinates,
  potreroController.validarPunto
);

module.exports = router;