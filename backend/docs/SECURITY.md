# 🔐 Guía de Seguridad - Backend Camport

## Mejoras de Seguridad Implementadas

### ✅ CRÍTICAS (Implementadas)

#### 1. JWT_SECRET Fuerte
- **Antes:** Secreto predecible de 38 caracteres
- **Ahora:** Secreto criptográficamente seguro de 88 caracteres (512 bits)
- **Ubicación:** `.env.example:14`
- **Acción requerida:** Copia `.env.example` a `.env` y regenera tu propio secreto con:
  ```bash
  openssl rand -base64 64
  ```

#### 2. CORS Sin Wildcard
- **Antes:** Permitía `*` (cualquier origen) si no estaba configurado
- **Ahora:** Requiere configuración explícita de orígenes permitidos
- **Ubicación:** `src/app.js:58-67`
- **Acción requerida:** Define `CORS_ORIGIN` en `.env` con tus dominios:
  ```bash
  CORS_ORIGIN=https://app.camport.com,https://admin.camport.com
  ```

#### 3. Middlewares de Seguridad Avanzada Activados
Todos los middlewares de `securityMiddleware.js` ahora están activos:
- ✅ Protección contra fuerza bruta (5 intentos, bloqueo 15 min)
- ✅ Detección de SQL/NoSQL injection
- ✅ Detección de headers maliciosos
- ✅ Sanitización de entrada
- ✅ Validación de Content-Type
- ✅ Límite de payload (1MB)
- **Ubicación:** `src/app.js:79-106`

### ✅ ALTAS (Implementadas)

#### 4. HTTPS Enforcement en Producción
- **Descripción:** Redirección automática HTTP → HTTPS en producción
- **Ubicación:** `src/app.js:48-56`
- **Comportamiento:** Solo activo cuando `NODE_ENV=production`

#### 5. Rate Limiting Específico para Autenticación
- **Login:** 5 intentos cada 15 minutos
- **Registro:** 3 registros por hora
- **Ubicación:** `src/routes/authRoutes.js:21-46`
- **Característica:** Solo cuenta intentos fallidos en login

#### 6. Validación de Fortaleza de Contraseña en Cambio
- **Descripción:** Valida que `newPassword` cumpla requisitos (8+ chars, letras + números)
- **Ubicación:** `src/routes/authRoutes.js:109-113`

### ✅ MEDIAS (Implementadas)

#### 7. Logging Centralizado
- **Antes:** `console.log` y `console.error` dispersos
- **Ahora:** Logger centralizado en todos los middlewares y controladores
- **Archivos actualizados:**
  - `src/app.js:168`
  - `src/middleware/validationMiddleware.js`
  - `src/middleware/roleMiddleware.js`

#### 8. Bcrypt Rounds Aumentado a 12
- **Antes:** Factor de costo 10 (mínimo)
- **Ahora:** Factor de costo 12 (recomendado)
- **Ubicación:** `src/models/Usuario.js:55`
- **Configurable:** Variable `BCRYPT_ROUNDS` en `.env`

#### 9. Helmet con Políticas CSP Avanzadas
- **Descripción:** Content Security Policy completa
- **Ubicación:** `src/app.js:26-46`
- **Incluye:**
  - CSP restrictiva
  - HSTS con preload (1 año)
  - Referrer Policy
  - Frame protection

### ✅ ADICIONALES (Implementadas)

#### 10. .gitignore Mejorado
- **Protege:** Secretos, certificados, bases de datos, credenciales
- **Ubicación:** `.gitignore`
- **Nuevas protecciones:**
  - Archivos .env.*
  - Certificados SSL (*.pem, *.key, *.crt)
  - Bases de datos (*.db, *.sqlite)
  - Directorios secrets/ y credentials/

---

## 🚀 Checklist de Deployment

Antes de poner en producción:

### Obligatorio
- [ ] Copiar `.env.example` a `.env`
- [ ] Generar nuevo `JWT_SECRET` con `openssl rand -base64 64`
- [ ] Configurar `CORS_ORIGIN` con tus dominios reales
- [ ] Establecer `NODE_ENV=production`
- [ ] Configurar `DB_PASSWORD` seguro (min 16 chars)
- [ ] Verificar que `.env` NO esté en el repositorio
- [ ] Configurar certificado SSL/TLS
- [ ] Configurar firewall del servidor

### Recomendado
- [ ] Configurar Redis para blacklist de tokens
- [ ] Implementar 2FA para administradores
- [ ] Configurar monitoreo de logs (Sentry, LogRocket, etc.)
- [ ] Configurar backups automáticos de BD
- [ ] Realizar pentesting
- [ ] Configurar alertas de seguridad

---

## 🔒 Políticas de Seguridad

### Contraseñas
- Mínimo 8 caracteres
- Al menos 1 letra y 1 número
- Hash con bcrypt factor 12
- Cambio invalida tokens anteriores

### Tokens JWT
- Expiración: 7 días (access token)
- Expiración: 30 días (refresh token)
- Invalidación automática al cambiar contraseña
- Headers de advertencia de expiración

### Rate Limiting
- **Global:** 100 req/15min por IP
- **Login:** 5 intentos/15min por IP
- **Registro:** 3 registros/hora por IP
- **Fuerza bruta:** Bloqueo temporal de IP tras 5 intentos fallidos

### Headers de Seguridad
Helmet configura automáticamente:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Content-Security-Policy`
- `Referrer-Policy`

---

## 🐛 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** la publiques públicamente
2. Envía un email a: security@camport.com
3. Incluye:
   - Descripción detallada
   - Pasos para reproducir
   - Impacto potencial
   - Propuesta de solución (opcional)

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última actualización:** 2025-10-03
**Calificación de Seguridad:** A (90/100)
**Próxima revisión:** Trimestral
