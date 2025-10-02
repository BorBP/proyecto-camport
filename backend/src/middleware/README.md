# 🔐 Middlewares de Autenticación - Camport Backend (ACTUALIZADO)

Sistema **completo y avanzado** de middlewares para autenticación, autorización, validación y seguridad en el backend de Camport.

## 🚀 NUEVAS CARACTERÍSTICAS AÑADIDAS

### ✨ Mejoras de Autenticación
- ✅ Detección de tokens obsoletos (después de cambio de contraseña)
- ✅ Advertencias de expiración de token
- ✅ Códigos de error específicos para mejor debugging
- ✅ Logging detallado de actividad de autenticación
- ✅ Soporte para cambio de contraseña

### 🛡️ Seguridad Avanzada
- ✅ Protección contra ataques de fuerza bruta
- ✅ Detección de inyección SQL/NoSQL
- ✅ Filtrado de headers maliciosos
- ✅ Sanitización automática de datos de entrada
- ✅ Validación de Content-Type
- ✅ Limitación de tamaño de payload
- ✅ Detección de actividad sospechosa

### 📊 Auditoría y Monitoreo
- ✅ Logging completo de actividades CRUD
- ✅ Detección automática de accesos no autorizados
- ✅ Métricas de rendimiento en tiempo real
- ✅ Alertas por cambios de configuración
- ✅ Rastreo de patrones sospechosos

## 📋 Tabla de Contenidos

1. [Instalación y Configuración](#instalación-y-configuración)
2. [Middlewares de Autenticación](#middlewares-de-autenticación)
3. [Middlewares de Roles](#middlewares-de-roles)
4. [Middlewares de Validación](#middlewares-de-validación)
5. [Middlewares de Seguridad Avanzada](#middlewares-de-seguridad-avanzada)
6. [Middlewares de Auditoría](#middlewares-de-auditoría)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)
8. [Configuración en Producción](#configuración-en-producción)
9. [Pruebas y Validación](#pruebas-y-validación)

---

## 🛠️ Instalación y Configuración

### Variables de Entorno Requeridas

Actualiza tu `.env` con las nuevas configuraciones:

```env
# JWT - Autenticación
JWT_SECRET=camport_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Seguridad - Fuerza Bruta
BRUTE_FORCE_MAX_ATTEMPTS=5
BRUTE_FORCE_WINDOW_MINUTES=15

# Seguridad - Payload
MAX_PAYLOAD_SIZE_KB=1024

# Logging y Auditoría
LOG_LEVEL=info
ENABLE_AUTH_LOGGING=true
ENABLE_CRUD_LOGGING=true
ENABLE_SECURITY_LOGGING=true
```

### Implementación en app.js

```javascript
// Usar la versión segura del app.js
const app = require('./src/app_secure');
```

---

## 🔑 Middlewares de Autenticación

### `authenticate` (Mejorado)
```javascript
const { authenticate } = require('../middleware');

router.get('/protected', authenticate, (req, res) => {
  // req.user contiene: { id, email, nombre, rol, tokenIssuedAt, tokenExpiresAt }
  // req.tokenInfo contiene: { issuedAt, expiresAt, timeToExpire }
  res.json({ user: req.user });
});
```

**Nuevas características:**
- ✅ Detección de tokens obsoletos
- ✅ Códigos de error específicos
- ✅ Información detallada del token
- ✅ Logging automático

### `optionalAuth` (Mejorado)
```javascript
router.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: `Hola ${req.user.nombre}` });
  } else {
    res.json({ message: 'Hola invitado' });
  }
});
```

### `checkTokenExpiration` (NUEVO)
```javascript
router.get('/important', 
  authenticate,
  checkTokenExpiration(10), // Avisar si expira en 10 minutos
  (req, res) => {
    // Headers automáticos: X-Token-Expiring, X-Token-Expires-In
    res.json({ data: 'importante' });
  }
);
```

### `logAuthAccess` (NUEVO)
```javascript
router.get('/sensitive', 
  authenticate,
  logAuthAccess, // Log automático de accesos
  (req, res) => {
    res.json({ data: 'sensible' });
  }
);
```

---

## 🛡️ Middlewares de Seguridad Avanzada

### `bruteForceProtection`
```javascript
app.use(bruteForceProtection(5, 15)); // 5 intentos en 15 minutos

// En las rutas de login, usar:
router.post('/login', (req, res) => {
  // Marcar intento fallido:
  if (loginFailed) {
    req.checkBruteForce(true);
  } else {
    req.checkBruteForce(false); // Limpiar intentos
  }
});
```

### `sqlInjectionProtection`
```javascript
app.use(sqlInjectionProtection);
// Bloquea automáticamente patrones como:
// - UNION SELECT
// - DROP TABLE
// - $where, $ne (NoSQL)
// - <script>, javascript:
```

### `maliciousHeaderProtection`
```javascript
app.use(maliciousHeaderProtection);
// Detecta:
// - User-Agents sospechosos (sqlmap, nikto, etc.)
// - Headers de proxy maliciosos
// - Herramientas de scanning
```

### `sanitizeInput`
```javascript
app.use(sanitizeInput);
// Limpia automáticamente:
// - Caracteres < y >
// - URLs javascript:
// - URLs data:
```

### `validateContentType`
```javascript
app.use(validateContentType);
// Valida Content-Type en POST/PUT/PATCH
// Permite: application/json, application/x-www-form-urlencoded, multipart/form-data
```

### `payloadSizeLimit`
```javascript
app.use(payloadSizeLimit(1024)); // Máximo 1MB
// Previene ataques de DoS por payload grande
```

---

## 📊 Middlewares de Auditoría

### `logAuthActivity`
```javascript
router.use('/auth', logAuthActivity);
// Logs automáticos para:
// - Inicios de sesión exitosos/fallidos
// - Registros de usuarios
// - Refresh de tokens
// - Cierres de sesión
```

### `logCRUDActivity`
```javascript
router.use('/users', logCRUDActivity('Usuario'));
router.use('/animales', logCRUDActivity('Animal'));
// Logs automáticos para operaciones CREATE, READ, UPDATE, DELETE
```

### `logUnauthorizedAccess`
```javascript
app.use(logUnauthorizedAccess);
// Log automático de respuestas 401 y 403
```

### `detectSuspiciousActivity`
```javascript
app.use(detectSuspiciousActivity);
// Detecta:
// - Headers sospechosos
// - User-Agents vacíos o muy cortos
// - Demasiados parámetros query
// - Headers muy grandes
// - Paths sospechosos
```

### `generateMetrics`
```javascript
app.use(generateMetrics);
// Genera métricas de:
// - Tiempo de respuesta
// - Errores del servidor
// - Tamaño de requests/responses
// - Requests lentos (>5s)
```

---

## 💡 Ejemplos de Implementación

### Ruta Básica Autenticada
```javascript
router.get('/profile',
  authenticate,
  checkTokenExpiration(10),
  (req, res) => {
    res.json({ user: req.user });
  }
);
```

### Ruta Solo Administradores
```javascript
router.delete('/users/:id',
  validateUUID('id'),
  authenticate,
  requireAdmin,
  logCRUDActivity('Usuario'),
  (req, res) => {
    // Eliminar usuario
  }
);
```

### Ruta con Validaciones Complejas
```javascript
router.post('/animales',
  validateRequired(['nombre', 'raza', 'sexo']),
  validateEnum('sexo', ['macho', 'hembra']),
  validateRange('peso', 50, 1000),
  validateCoordinates,
  authenticate,
  requireRoles(['administrador', 'capataz']),
  logCRUDActivity('Animal'),
  (req, res) => {
    // Crear animal
  }
);
```

### Ruta de Autenticación Completa
```javascript
router.post('/login',
  validateRequired(['email', 'password']),
  validateEmail,
  bruteForceProtection(5, 15),
  logAuthActivity,
  authController.login
);
```

---

## 🔧 Configuración en Producción

### 1. Variables de Entorno
```env
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key-256-bits
JWT_EXPIRES_IN=2h
BRUTE_FORCE_MAX_ATTEMPTS=3
BRUTE_FORCE_WINDOW_MINUTES=30
MAX_PAYLOAD_SIZE_KB=512
LOG_LEVEL=warn
ENABLE_SECURITY_LOGGING=true
```

### 2. Configuración de Logs
```javascript
// En producción, enviar logs a sistemas externos
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    // Agregar transports para CloudWatch, Elasticsearch, etc.
  ]
});
```

### 3. Configuración de Métricas
```javascript
// Integrar con sistemas de monitoreo
const promClient = require('prom-client');

// Métricas personalizadas para Prometheus
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

---

## 🧪 Pruebas y Validación

### Ejecutar Pruebas Automáticas
```bash
# Cambiar al directorio del backend
cd backend

# Ejecutar pruebas de middleware
node src/middleware/test-middlewares.js
```

### Pruebas Manuales con curl

#### Test de Autenticación
```bash
# Sin token (debe fallar)
curl http://localhost:3000/api/auth/me

# Con token inválido (debe fallar)
curl -H "Authorization: Bearer token-invalido" \
     http://localhost:3000/api/auth/me

# Con token válido
curl -H "Authorization: Bearer YOUR_VALID_TOKEN" \
     http://localhost:3000/api/auth/me
```

#### Test de Validaciones
```bash
# Campos requeridos faltantes
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{}'

# Email inválido
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"email-invalido"}'
```

#### Test de Seguridad
```bash
# SQL Injection (debe bloquearse)
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com OR 1=1","password":"test"}'

# Payload muy grande (debe bloquearse)
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"data":"'$(python -c "print('x'*2000000)")'}"}'
```

---

## 📈 Monitoreo y Métricas

### Logs de Seguridad
```javascript
// Los logs se generan automáticamente en formato JSON:
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "warn",
  "message": "Intento de inicio de sesión fallido",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "email": "hacker@evil.com",
  "reason": "Credenciales inválidas"
}
```

### Métricas de Rendimiento
```javascript
// Métricas automáticas disponibles:
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "duration": 234,
  "ip": "192.168.1.100",
  "userId": "user-uuid",
  "userRole": "capataz"
}
```

---

## 🚨 Alertas y Notificaciones

### Configurar Alertas Críticas
```javascript
// En producción, configurar alertas para:
// - Múltiples intentos de login fallidos
// - Detección de SQL injection
// - Accesos administrativos
// - Cambios de configuración
// - Errores del servidor (500)
// - Requests anormalmente lentos

if (securityEvent.severity === 'critical') {
  notificationService.sendAlert({
    type: 'security',
    message: securityEvent.message,
    details: securityEvent
  });
}
```

---

## 🆘 Solución de Problemas

### Error: "IP bloqueada"
```javascript
// Desbloquear IP manualmente:
const { blockedIPs } = require('./src/middleware/securityMiddleware');
blockedIPs.delete('192.168.1.100');
```

### Error: "Token obsoleto"
```javascript
// Forzar relogin después de cambio de contraseña:
// El sistema automáticamente invalida tokens antiguos
```

### Error: "Payload demasiado grande"
```javascript
// Aumentar límite si es necesario:
app.use(payloadSizeLimit(2048)); // 2MB
```

---

## 📚 Recursos Adicionales

- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**✨ Sistema desarrollado por el Equipo Camport** 
**🔒 Seguridad avanzada implementada**
**📊 Monitoreo completo integrado**
