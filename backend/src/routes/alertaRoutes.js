/**
 * Rutas de Alertas
 * RF6 y RF7: Generación y gestión de alertas automáticas
 * Sistema completo de workflow de alertas ganaderas
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

const alertaController = require('../controllers/alertaController');

/**
 * GET /api/alertas
 * Listar alertas con filtros y paginación
 * Acceso: Administrador y Capataz
 */
router.get('/',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Alerta'),
  alertaController.getAll
);

/**
 * GET /api/alertas/estadisticas
 * Obtener estadísticas de alertas para dashboard
 * Acceso: Administrador y Capataz
 */
router.get('/estadisticas',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  alertaController.getEstadisticas
);

/**
 * GET /api/alertas/:id
 * Obtener detalles de una alerta específica
 * Acceso: Administrador y Capataz
 */
router.get('/:id',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Alerta'),
  alertaController.getById
);

/**
 * PATCH /api/alertas/:id/atender
 * Marcar alerta como "en proceso" y asignar responsable
 * Acceso: Administrador y Capataz
 */
router.patch('/:id/atender',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  logCRUDActivity('Alerta'),
  alertaController.atender
);

/**
 * PATCH /api/alertas/:id/resolver
 * Marcar alerta como "atendida" (resuelta)
 * Acceso: Administrador y Capataz
 */
router.patch('/:id/resolver',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  validateRequired(['accion_tomada']),
  logCRUDActivity('Alerta'),
  alertaController.resolver
);

/**
 * POST /api/alertas/:id/comentarios
 * Agregar comentario a una alerta
 * Acceso: Administrador y Capataz
 */
router.post('/:id/comentarios',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  validateUUID('id'),
  validateRequired(['comentario']),
  logCRUDActivity('Alerta'),
  alertaController.agregarComentario
);

/**
 * POST /api/alertas/configurar-umbrales
 * Configurar umbrales del motor de alertas
 * Acceso: Solo Administrador
 */
router.post('/configurar-umbrales',
  authenticate,
  requireAdmin,
  validateRange('bateria_baja', 5, 50),
  validateRange('temperatura_alta', 35, 45),
  validateRange('inactividad_horas', 1, 24),
  validateRange('tiempo_sin_datos', 10, 180),
  logCRUDActivity('Configuracion'),
  alertaController.configurarUmbrales
);

/**
 * POST /api/alertas/motor/iniciar
 * Iniciar el motor de alertas automáticas
 * Acceso: Solo Administrador
 */
router.post('/motor/iniciar',
  authenticate,
  requireAdmin,
  logCRUDActivity('MotorAlertas'),
  alertaController.iniciarMotor
);

/**
 * POST /api/alertas/motor/detener
 * Detener el motor de alertas automáticas
 * Acceso: Solo Administrador
 */
router.post('/motor/detener',
  authenticate,
  requireAdmin,
  logCRUDActivity('MotorAlertas'),
  alertaController.detenerMotor
);

module.exports = router;