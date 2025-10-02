/**
 * Rutas de Telemetría
 * Endpoints para recibir y consultar datos IoT
 */

const express = require('express');
const router = express.Router();
const {
  authenticate,
  optionalAuth,
  requireAdmin,
  validateRequired,
  validateUUID,
  validateCoordinates,
  validateRange
} = require('../middleware');

const telemetriaController = require('../controllers/telemetriaController');

/**
 * POST /api/telemetria/ingest
 * Recibir datos del simulador IoT Python
 * CRÍTICO: Este es el endpoint principal para la integración IoT
 */
router.post('/ingest',
  validateRequired(['collar_id', 'latitud', 'longitud', 'bateria']),
  validateCoordinates,
  validateRange('bateria', 0, 100),
  telemetriaController.ingestTelemetria
);

/**
 * POST /api/telemetria/batch
 * Recibir múltiples datos en lote (optimizado)
 */
router.post('/batch',
  validateRequired(['datos']),
  telemetriaController.ingestBatch
);

/**
 * GET /api/telemetria/latest
 * Obtener última telemetría de todos los animales
 * Requiere autenticación
 */
router.get('/latest',
  authenticate,
  telemetriaController.getLatestAll
);

/**
 * GET /api/telemetria/animal/:animalId
 * Obtener telemetría histórica de un animal
 * Query params: limit, offset, desde, hasta
 */
router.get('/animal/:animalId',
  authenticate,
  validateUUID('animalId'),
  telemetriaController.getByAnimal
);

/**
 * GET /api/telemetria/collar/:collarId
 * Obtener telemetría de un collar específico
 * collarId es el identificador del collar (ej: COL-001)
 */
router.get('/collar/:collarId',
  authenticate,
  telemetriaController.getByCollar
);

/**
 * GET /api/telemetria/stats/:animalId
 * Obtener estadísticas de telemetría
 * Query params: dias (default: 7)
 */
router.get('/stats/:animalId',
  authenticate,
  validateUUID('animalId'),
  telemetriaController.getStatsByAnimal
);

/**
 * DELETE /api/telemetria/old
 * Eliminar telemetría antigua (limpieza)
 * Solo administradores
 * Query params: dias (default: 90)
 */
router.delete('/old',
  authenticate,
  requireAdmin,
  telemetriaController.deleteOld
);

module.exports = router;
