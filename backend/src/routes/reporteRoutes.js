/**
 * Rutas de Reportes
 * RF9: Exportación de reportes en CSV y PDF
 * Sistema de generación de documentos para análisis y auditoría
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

const reporteController = require('../controllers/reporteController');

/**
 * GET /api/reportes/animales
 * Generar reporte de animales con filtros opcionales
 * Acceso: Administrador y Capataz
 */
router.get('/animales',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateEnum('sexo', ['macho', 'hembra']),
  validateEnum('estado_salud', ['saludable', 'enfermo', 'en_tratamiento', 'recuperacion']),
  validateRange('edad_min', 0, 25),
  validateRange('edad_max', 0, 25),
  logCRUDActivity('Reporte'),
  reporteController.getReporteAnimales
);

/**
 * GET /api/reportes/telemetria
 * Generar reporte de datos de telemetría IoT
 * Acceso: Administrador y Capataz
 */
router.get('/telemetria',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateRange('limite', 100, 5000),
  logCRUDActivity('Reporte'),
  reporteController.getReporteTelemetria
);

/**
 * GET /api/reportes/alertas
 * Generar reporte de alertas del sistema
 * Acceso: Administrador y Capataz
 */
router.get('/alertas',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateEnum('tipo', ['fuga', 'bateria_baja', 'temperatura_alta', 'inactividad', 'sin_datos']),
  validateEnum('severidad', ['baja', 'media', 'alta', 'critica']),
  validateEnum('estado', ['nueva', 'en_proceso', 'atendida']),
  validateRange('limite', 100, 2000),
  logCRUDActivity('Reporte'),
  reporteController.getReporteAlertas
);

/**
 * GET /api/reportes/potreros
 * Generar reporte de actividad por potreros
 * Acceso: Administrador y Capataz
 */
router.get('/potreros',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Reporte'),
  reporteController.getReportePotreros
);

/**
 * GET /api/reportes/estadisticas-generales
 * Obtener estadísticas generales del sistema
 * Acceso: Administrador y Capataz
 */
router.get('/estadisticas-generales',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  reporteController.getEstadisticasGenerales
);

/**
 * POST /api/reportes/exportar
 * Exportar reporte en formato CSV o PDF
 * Acceso: Administrador y Capataz
 */
router.post('/exportar',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateRequired(['tipo_reporte', 'formato']),
  validateEnum('tipo_reporte', ['animales', 'telemetria', 'alertas', 'potreros']),
  validateEnum('formato', ['csv', 'pdf']),
  logCRUDActivity('Exportacion'),
  reporteController.exportarReporte
);

module.exports = router;