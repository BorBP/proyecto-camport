/**
 * 🔐 EJEMPLOS DE IMPLEMENTACIÓN - Middlewares de Autenticación Camport
 * 
 * Esta guía muestra cómo implementar correctamente todos los middlewares
 * de autenticación y seguridad en diferentes tipos de rutas.
 */

// ==========================================
// IMPORTS NECESARIOS
// ==========================================

const express = require('express');
const router = express.Router();
const {
  // Autenticación
  authenticate,
  optionalAuth,
  checkTokenExpiration,
  logAuthAccess,
  
  // Roles y permisos
  requireAdmin,
  requireCapataz,
  requireRoles,
  requireOwnerOrAdmin,
  
  // Validaciones
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateRange,
  validateEnum,
  validateCoordinates,
  validateDate,
  
  // Seguridad avanzada
  bruteForceProtection,
  sqlInjectionProtection,
  maliciousHeaderProtection,
  sanitizeInput,
  validateContentType,
  payloadSizeLimit,
  
  // Auditoría y logging
  logAuthActivity,
  logCRUDActivity,
  logUnauthorizedAccess,
  detectSuspiciousActivity,
  generateMetrics,
  logConfigChanges
} = require('../middleware');

// ==========================================
// EJEMPLOS POR TIPO DE RUTA
// ==========================================

// 🔓 1. RUTAS PÚBLICAS (Sin autenticación)
// ==========================================

/**
 * Ruta completamente pública
 * Solo usa middlewares de seguridad básica
 */
router.get('/public/info', (req, res) => {
  res.json({
    mensaje: 'Esta es una ruta pública',
    timestamp: new Date().toISOString()
  });
});

/**
 * Ruta pública con datos opcionales del usuario
 * Usa optionalAuth para obtener datos del usuario si está logueado
 */
router.get('/public/dashboard',
  optionalAuth,
  (req, res) => {
    if (req.user) {
      res.json({
        mensaje: `Bienvenido ${req.user.nombre}`,
        personalizado: true,
        rol: req.user.rol
      });
    } else {
      res.json({
        mensaje: 'Bienvenido invitado',
        personalizado: false
      });
    }
  }
);

// 🔐 2. RUTAS AUTENTICADAS BÁSICAS
// ==========================================

/**
 * Ruta que requiere autenticación básica
 * Cualquier usuario logueado puede acceder
 */
router.get('/profile',
  authenticate,
  checkTokenExpiration(10), // Avisar si token expira en 10 minutos
  (req, res) => {
    res.json({
      usuario: req.user,
      tokenInfo: req.tokenInfo
    });
  }
);

/**
 * Actualizar perfil con validaciones
 */
router.put('/profile',
  // 1. Validaciones
  validateRequired(['nombre']),
  validateEmail, // Si se proporciona email
  
  // 2. Autenticación
  authenticate,
  
  // 3. Controlador
  (req, res) => {
    // Lógica para actualizar perfil
    res.json({ mensaje: 'Perfil actualizado' });
  }
);

// 👑 3. RUTAS SOLO ADMINISTRADORES
// ==========================================

/**
 * Listar todos los usuarios - Solo administradores
 */
router.get('/admin/users',
  authenticate,
  requireAdmin,
  logCRUDActivity('Usuario'),
  (req, res) => {
    // Solo administradores pueden ver todos los usuarios
    res.json({ usuarios: [] });
  }
);

/**
 * Eliminar usuario - Solo administradores
 */
router.delete('/admin/users/:id',
  validateUUID('id'),
  authenticate,
  requireAdmin,
  logCRUDActivity('Usuario'),
  (req, res) => {
    // Eliminar usuario
    res.json({ mensaje: 'Usuario eliminado' });
  }
);

/**
 * Configuración del sistema - Solo administradores
 */
router.put('/admin/config',
  validateRequired(['configuracion']),
  authenticate,
  requireAdmin,
  logConfigChanges, // Log especial para cambios de config
  (req, res) => {
    // Cambiar configuración
    res.json({ mensaje: 'Configuración actualizada' });
  }
);

// 🧑‍🌾 4. RUTAS SOLO CAPATACES
// ==========================================

/**
 * Reportes de campo - Solo capataces
 */
router.get('/capataz/reportes',
  authenticate,
  requireCapataz,
  logCRUDActivity('Reporte'),
  (req, res) => {
    res.json({ reportes: [] });
  }
);

/**
 * Actualizar estado del ganado - Solo capataces
 */
router.put('/capataz/animales/:id/estado',
  validateUUID('id'),
  validateRequired(['estado']),
  validateEnum('estado', ['saludable', 'enfermo', 'en_tratamiento']),
  authenticate,
  requireCapataz,
  logCRUDActivity('Animal'),
  (req, res) => {
    res.json({ mensaje: 'Estado actualizado' });
  }
);

// 👥 5. RUTAS MÚLTIPLES ROLES
// ==========================================

/**
 * Dashboard - Administradores y Capataces
 */
router.get('/dashboard',
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logAuthAccess,
  (req, res) => {
    const data = {
      administrador: {
        usuarios: 100,
        sistema: 'operativo'
      },
      capataz: {
        animales: 50,
        alertas: 5
      }
    };
    
    res.json(data[req.user.rol] || {});
  }
);

/**
 * Gestión de animales - Ambos roles
 */
router.post('/animales',
  // 1. Validaciones
  validateRequired(['nombre', 'raza', 'sexo', 'peso']),
  validateEnum('sexo', ['macho', 'hembra']),
  validateRange('peso', 50, 1000),
  validateCoordinates, // Si incluye ubicación
  
  // 2. Autenticación y autorización
  authenticate,
  requireRoles(['administrador', 'capataz']),
  
  // 3. Logging
  logCRUDActivity('Animal'),
  
  // 4. Controlador
  (req, res) => {
    res.json({ mensaje: 'Animal creado', id: 'uuid-generated' });
  }
);

// 🔒 6. RUTAS PROPIETARIO O ADMIN
// ==========================================

/**
 * Ver datos de usuario específico
 * Solo el propietario o un administrador
 */
router.get('/users/:userId',
  validateUUID('userId'),
  authenticate,
  requireOwnerOrAdmin('userId'),
  logCRUDActivity('Usuario'),
  (req, res) => {
    res.json({ usuario: { id: req.params.userId } });
  }
);

/**
 * Actualizar datos personales
 * Solo el propietario o un administrador
 */
router.put('/users/:userId/personal',
  validateUUID('userId'),
  validateRequired(['nombre']),
  validateEmail,
  authenticate,
  requireOwnerOrAdmin('userId'),
  logCRUDActivity('Usuario'),
  (req, res) => {
    res.json({ mensaje: 'Datos actualizados' });
  }
);

// 📊 7. RUTAS CON VALIDACIONES COMPLEJAS
// ==========================================

/**
 * Crear potrero con validaciones geográficas
 */
router.post('/potreros',
  // Validaciones de datos
  validateRequired(['nombre', 'area', 'latitud', 'longitud']),
  validateRange('area', 100, 10000), // Entre 100m² y 1 hectárea
  validateCoordinates,
  
  // Autenticación y permisos
  authenticate,
  requireRoles(['administrador', 'capataz']),
  
  // Logging
  logCRUDActivity('Potrero'),
  
  (req, res) => {
    res.json({ mensaje: 'Potrero creado' });
  }
);

/**
 * Programar evento con validaciones de fecha
 */
router.post('/eventos',
  validateRequired(['nombre', 'fecha_inicio', 'fecha_fin', 'tipo']),
  validateDate('fecha_inicio'),
  validateDate('fecha_fin'),
  validateEnum('tipo', ['vacunacion', 'revision', 'traslado']),
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Evento'),
  (req, res) => {
    res.json({ mensaje: 'Evento programado' });
  }
);

// 🔍 8. RUTAS DE BÚSQUEDA Y FILTRADO
// ==========================================

/**
 * Buscar animales con filtros opcionales
 */
router.get('/animales/buscar',
  // Validaciones opcionales
  validateEnum('sexo', ['macho', 'hembra']), // Solo si se proporciona
  validateRange('edad_min', 0, 20), // Solo si se proporciona
  validateRange('edad_max', 0, 20),
  
  // Autenticación
  authenticate,
  requireRoles(['administrador', 'capataz']),
  
  (req, res) => {
    const filtros = {
      sexo: req.query.sexo,
      edadMin: req.query.edad_min,
      edadMax: req.query.edad_max
    };
    
    res.json({ animales: [], filtros });
  }
);

// 📱 9. RUTAS PARA DISPOSITIVOS IOT
// ==========================================

/**
 * Recibir datos de telemetría (sin autenticación tradicional)
 * Usa validación de dispositivo en lugar de usuario
 */
router.post('/iot/telemetria',
  validateRequired(['deviceId', 'data']),
  // Aquí iría un middleware de autenticación de dispositivo
  // authenticateDevice,
  logCRUDActivity('Telemetria'),
  (req, res) => {
    res.json({ mensaje: 'Datos recibidos', deviceId: req.body.deviceId });
  }
);

// 🚨 10. RUTAS DE EMERGENCIA/ALERTAS
// ==========================================

/**
 * Crear alerta de emergencia
 */
router.post('/alertas/emergencia',
  validateRequired(['tipo', 'descripcion', 'prioridad']),
  validateEnum('tipo', ['animal_perdido', 'cerca_rota', 'emergencia_veterinaria']),
  validateEnum('prioridad', ['baja', 'media', 'alta', 'critica']),
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Alerta'),
  (req, res) => {
    // Crear alerta y notificar
    res.json({ mensaje: 'Alerta creada', id: 'alert-uuid' });
  }
);

// ==========================================
// EJEMPLO DE RUTA COMPLETA CON TODOS LOS MIDDLEWARES
// ==========================================

/**
 * Ejemplo de ruta con stack completo de middlewares
 * Esta ruta demuestra el uso de todos los tipos de middleware
 */
router.put('/ejemplo/completo/:id',
  // 1. Validaciones de formato y datos
  validateUUID('id'),
  validateRequired(['nombre', 'tipo', 'datos']),
  validateEnum('tipo', ['tipo1', 'tipo2', 'tipo3']),
  validateRange('valor', 1, 100),
  validateEmail, // Si se incluye email
  validateCoordinates, // Si se incluyen coordenadas
  
  // 2. Autenticación
  authenticate,
  checkTokenExpiration(5), // Avisar si token expira en 5 minutos
  
  // 3. Autorización
  requireRoles(['administrador', 'capataz']),
  // O requireOwnerOrAdmin('id') si es un recurso del usuario
  
  // 4. Logging y auditoría
  logAuthAccess,
  logCRUDActivity('Ejemplo'),
  
  // 5. Controlador final
  (req, res) => {
    res.json({
      mensaje: 'Operación completada exitosamente',
      usuario: req.user,
      datos: req.body,
      id: req.params.id,
      timestamp: new Date().toISOString()
    });
  }
);

// ==========================================
// NOTAS IMPORTANTES
// ==========================================

/*
📋 ORDEN RECOMENDADO DE MIDDLEWARES:

1. Validaciones de formato (UUID, email, etc.)
2. Validaciones de datos (required, range, enum, etc.)
3. Autenticación (authenticate/optionalAuth)
4. Verificaciones de token (checkTokenExpiration)
5. Autorización (requireAdmin, requireRoles, etc.)
6. Logging (logAuthAccess, logCRUDActivity)
7. Controlador (función que maneja la lógica)

🔒 MEJORES PRÁCTICAS:

- Siempre validar antes de autenticar (mejor rendimiento)
- Usar validate* middlewares para datos de entrada
- Aplicar require* middlewares después de authenticate
- Loguear operaciones sensibles con logCRUDActivity
- Usar checkTokenExpiration en rutas importantes
- Combinar múltiples middlewares para seguridad en capas

⚠️ ERRORES COMUNES A EVITAR:

- No validar UUIDs antes de buscar en BD
- Poner autorización antes que autenticación
- No loguear operaciones administrativas
- Olvidar validar enums y rangos
- No usar requireOwnerOrAdmin para recursos personales
*/

module.exports = router;