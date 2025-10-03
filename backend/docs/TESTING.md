# 🧪 Guía de Pruebas - API Camport

Ejemplos de pruebas para los endpoints de autenticación usando cURL y otros métodos.

## 📋 Prerrequisitos

1. Tener el servidor corriendo: `npm run dev`
2. Base de datos PostgreSQL configurada
3. Variables de entorno configuradas en `.env`

---

## 🔐 Endpoints de Autenticación

### 1. Registrar Usuario (POST /api/auth/register)

**Registrar un Administrador:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "admin@camport.com",
    "password": "admin123",
    "rol": "administrador"
  }'
```

**Registrar un Capataz:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María González",
    "email": "capataz@camport.com",
    "password": "capataz123",
    "rol": "capataz"
  }'
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "admin@camport.com",
      "rol": "administrador",
      "activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error - Email ya existe (409):**
```json
{
  "error": "Email ya registrado",
  "message": "Ya existe un usuario con este email"
}
```

**Error - Validación (400):**
```json
{
  "error": "Campos requeridos faltantes",
  "message": "Los siguientes campos son obligatorios: nombre, email, password, rol",
  "camposFaltantes": ["nombre", "email"]
}
```

---

### 2. Iniciar Sesión (POST /api/auth/login)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@camport.com",
    "password": "admin123"
  }'
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "admin@camport.com",
      "rol": "administrador",
      "activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error - Credenciales Inválidas (401):**
```json
{
  "error": "Credenciales inválidas",
  "message": "Email o contraseña incorrectos"
}
```

**Error - Usuario Inactivo (403):**
```json
{
  "error": "Usuario inactivo",
  "message": "Tu cuenta ha sido desactivada. Contacta al administrador"
}
```

---

### 3. Obtener Datos del Usuario Autenticado (GET /api/auth/me)

```bash
# Reemplaza YOUR_TOKEN con el token recibido en login/register
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta Exitosa (200):**
```json
{
  "data": {
    "id": "uuid-del-usuario",
    "nombre": "Juan Pérez",
    "email": "admin@camport.com",
    "rol": "administrador",
    "activo": true,
    "createdAt": "2025-01-02T10:00:00.000Z",
    "updatedAt": "2025-01-02T10:00:00.000Z"
  }
}
```

**Error - Sin Token (401):**
```json
{
  "error": "Token no proporcionado",
  "message": "Debes incluir el token de autenticación en el header Authorization"
}
```

**Error - Token Expirado (401):**
```json
{
  "error": "Token expirado",
  "message": "Tu sesión ha expirado, por favor inicia sesión nuevamente"
}
```

---

### 4. Refrescar Token (POST /api/auth/refresh)

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Token refrescado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 5. Cerrar Sesión (POST /api/auth/logout)

```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Respuesta (200):**
```json
{
  "message": "Sesión cerrada exitosamente",
  "note": "Asegúrate de eliminar el token en el cliente"
}
```

---

## 👥 Endpoints de Usuarios

### 6. Listar Usuarios - Solo Admin (GET /api/users)

```bash
# Requiere token de administrador
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Lista de usuarios",
  "user": {
    "id": "uuid-admin",
    "email": "admin@camport.com",
    "nombre": "Juan Pérez",
    "rol": "administrador"
  }
}
```

**Error - No es Admin (403):**
```json
{
  "error": "Acceso denegado",
  "message": "Solo los administradores pueden acceder a este recurso"
}
```

---

### 7. Obtener Usuario por ID (GET /api/users/:id)

```bash
# El usuario solo puede ver su propio perfil, o ser admin
curl -X GET http://localhost:3000/api/users/UUID_DEL_USUARIO \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Crear Usuario - Solo Admin (POST /api/users)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro López",
    "email": "pedro@camport.com",
    "password": "pedro123",
    "rol": "capataz"
  }'
```

---

### 9. Actualizar Usuario (PUT /api/users/:id)

```bash
# Solo el propietario o un admin pueden actualizar
curl -X PUT http://localhost:3000/api/users/UUID_DEL_USUARIO \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro López Actualizado",
    "email": "pedro.lopez@camport.com"
  }'
```

---

### 10. Eliminar Usuario - Solo Admin (DELETE /api/users/:id)

```bash
curl -X DELETE http://localhost:3000/api/users/UUID_DEL_USUARIO \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### 11. Cambiar Contraseña (PATCH /api/users/:id/password)

```bash
curl -X PATCH http://localhost:3000/api/users/UUID_DEL_USUARIO/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newPassword456"
  }'
```

---

### 12. Activar/Desactivar Usuario - Solo Admin (PATCH /api/users/:id/activate)

```bash
# Desactivar usuario
curl -X PATCH http://localhost:3000/api/users/UUID_DEL_USUARIO/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": false
  }'

# Activar usuario
curl -X PATCH http://localhost:3000/api/users/UUID_DEL_USUARIO/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": true
  }'
```

---

## 🧪 Probar con Postman

### Configuración Inicial

1. **Importar la colección** (crear en Postman)
2. **Configurar variable de entorno:**
   - `BASE_URL`: `http://localhost:3000`
   - `TOKEN`: (se actualizará automáticamente)

### Script para guardar token automáticamente

En la pestaña "Tests" de Postman para login/register:

```javascript
// Guardar el token automáticamente
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("TOKEN", response.data.token);
        console.log("Token guardado:", response.data.token);
    }
}
```

Luego en las demás peticiones, usar:
```
Authorization: Bearer {{TOKEN}}
```

---

## 🔍 Probar Validaciones

### Email Inválido
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "email-invalido",
    "password": "password123",
    "rol": "capataz"
  }'
```

**Error (400):**
```json
{
  "error": "Email inválido",
  "message": "El formato del email no es válido"
}
```

---

### Contraseña Débil
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test@test.com",
    "password": "123",
    "rol": "capataz"
  }'
```

**Error (400):**
```json
{
  "error": "Contraseña débil",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

---

### Rol Inválido
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test@test.com",
    "password": "password123",
    "rol": "superusuario"
  }'
```

**Error (400):**
```json
{
  "error": "Valor inválido",
  "message": "rol debe ser uno de: administrador, capataz",
  "opcionesPermitidas": ["administrador", "capataz"]
}
```

---

## 🐛 Debugging

### Ver el contenido de un token JWT

Puedes decodificar el token en [jwt.io](https://jwt.io) para ver su contenido:

```json
{
  "id": "uuid-del-usuario",
  "email": "admin@camport.com",
  "rol": "administrador",
  "iat": 1704196800,
  "exp": 1704801600
}
```

---

## 📝 Notas Importantes

1. **Guarda el token** que recibes en login/register
2. **Usa el token en el header** `Authorization: Bearer <token>`
3. **Los tokens expiran** según `JWT_EXPIRES_IN` en .env
4. **Usa HTTPS en producción** para proteger los tokens

---

## ✅ Checklist de Pruebas

- [ ] Registrar usuario administrador
- [ ] Registrar usuario capataz
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Obtener perfil con token válido
- [ ] Intentar acceder sin token (debe fallar)
- [ ] Capataz intentando acceder a ruta de admin (debe fallar)
- [ ] Admin accediendo a ruta de admin (debe funcionar)
- [ ] Validación de email inválido
- [ ] Validación de contraseña débil
- [ ] Validación de rol inválido
- [ ] Refrescar token
- [ ] Logout

---

**¡Listo para probar! 🚀**
