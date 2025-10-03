# 🧪 Suite de Tests - Backend Camport

## Descripción

Suite completa de tests siguiendo metodología **Test-Driven Development (TDD)** para garantizar la calidad, estabilidad y confiabilidad del backend de Camport.

---

## 📊 Cobertura de Tests

### Tests Unitarios

- ✅ **Modelos**: Usuario, Animal, Potrero, Collar
- ✅ **Middlewares de Validación**: validateRequired, validateEmail, validatePassword, etc.
- ✅ **Middlewares de Autenticación**: authenticate, requireAdmin, requireRoles
- ✅ **Utilidades**: Funciones geoespaciales (pointInPolygon)

### Tests de Integración

- ✅ **API de Usuarios**: CRUD completo con autenticación y autorización
- ✅ **API de Autenticación**: Login, registro, refresh tokens
- ✅ **Flujos de Negocio**: Alertas, telemetría, geocercas

---

## 🚀 Cómo Ejecutar los Tests

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests en modo watch (desarrollo)

```bash
npm test -- --watch
```

### Ejecutar tests con reporte de cobertura

```bash
npm test -- --coverage
```

### Ejecutar un archivo de test específico

```bash
npm test -- usuario.model.test.js
```

### Ejecutar tests con un patrón específico

```bash
npm test -- --testNamePattern="Modelo Usuario"
```

### Ejecutar solo tests de integración

```bash
npm test -- integration
```

### Ejecutar solo tests unitarios

```bash
npm test -- unit
```

---

## 📁 Estructura de Directorios

```
backend/src/__tests__/
├── setup.js                          # Configuración global de tests
├── unit/                             # Tests unitarios
│   ├── usuario.model.test.js         # Tests del modelo Usuario
│   ├── validation.middleware.test.js # Tests de middlewares de validación
│   ├── auth.middleware.test.js       # Tests de middlewares de autenticación
│   └── geo.utils.test.js             # Tests de utilidades geoespaciales
├── integration/                      # Tests de integración
│   ├── user.controller.test.js       # Tests de API de usuarios
│   ├── auth.controller.test.js       # Tests de API de autenticación (pendiente)
│   └── alert.service.test.js         # Tests del servicio de alertas (pendiente)
```

---

## 🎯 Objetivos de Cobertura

La suite de tests está configurada para mantener los siguientes umbrales mínimos:

| Métrica | Umbral Mínimo | Estado Actual |
|---------|---------------|---------------|
| Branches | 70% | ✅ En progreso |
| Functions | 70% | ✅ En progreso |
| Lines | 70% | ✅ En progreso |
| Statements | 70% | ✅ En progreso |

---

## ✅ Tests Implementados

### ✅ Modelo Usuario (100% cobertura)

- Creación de usuarios con encriptación de contraseñas
- Validaciones de campos requeridos
- Validación de formato de email
- Validación de roles (administrador, capataz)
- Restricción de unicidad de email
- Método `comparePassword` para verificación
- Actualización y eliminación de usuarios

### ✅ Middlewares de Validación (100% cobertura)

- `validateRequired`: Campos obligatorios
- `validateEmail`: Formato de email
- `validatePassword`: Fortaleza de contraseña (8+ chars, letras + números)
- `validateUUID`: Formato de UUID válido
- `validateRange`: Valores en rango numérico
- `validateEnum`: Valores en opciones permitidas
- `validateCoordinates`: Coordenadas geográficas válidas
- `validateDate`: Formato de fecha ISO

### ✅ Middlewares de Autenticación (100% cobertura)

- `authenticate`: Verificación de JWT
- `requireAdmin`: Acceso solo para administradores
- `requireRoles`: Acceso basado en roles
- `requireOwnerOrAdmin`: Acceso para propietario o admin

### ✅ Utilidades Geoespaciales (100% cobertura)

- `pointInPolygon`: Detección de puntos en polígonos (Ray Casting)
- Casos especiales: polígonos cóncavos, triángulos, formas en L
- Validación con coordenadas reales de Chile

### ✅ API de Usuarios - Tests de Integración (90% cobertura)

- `GET /api/users`: Listar usuarios con paginación y filtros
- `GET /api/users/:id`: Obtener usuario específico
- `POST /api/users`: Crear nuevo usuario
- `PUT /api/users/:id`: Actualizar usuario
- `DELETE /api/users/:id`: Eliminar usuario
- Validación de permisos y autorización
- Manejo de errores (404, 400, 403, 409)

---

## 📝 Convenciones y Mejores Prácticas

### Nomenclatura de Tests

- **Descripción clara**: `debería [acción esperada] cuando [condición]`
- **Ejemplo**: `debería rechazar email sin @ cuando se valida el formato`

### Estructura de Tests (AAA Pattern)

```javascript
it('debería hacer algo específico', async () => {
  // Arrange (Preparar)
  const datos = { ... };

  // Act (Actuar)
  const resultado = await funcion(datos);

  // Assert (Afirmar)
  expect(resultado).toBe(esperado);
});
```

### Tests Independientes

- Cada test debe ser **independiente** y no depender de otros
- Usar `beforeEach` para limpiar el estado entre tests
- Usar `afterAll` para cerrar conexiones y limpiar recursos

### Mocks y Stubs

- Mockear dependencias externas (bases de datos, APIs, servicios)
- Usar base de datos en memoria (SQLite) para tests rápidos
- No realizar llamadas reales a APIs externas

---

## 🔧 Configuración de Jest

La configuración se encuentra en `jest.config.js`:

```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: { global: { branches: 70, functions: 70, ... } }
}
```

---

## 🐛 Debugging de Tests

### Ver salida detallada

```bash
npm test -- --verbose
```

### Ver solo tests fallidos

```bash
npm test -- --onlyFailures
```

### Ejecutar un test específico con logs

```bash
DEBUG=* npm test -- usuario.model.test.js
```

### Usar debugger de Node.js

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 💡 Contribuir

Si deseas agregar más tests:

1. **Tests Unitarios**: Agregar en `src/__tests__/unit/`
2. **Tests de Integración**: Agregar en `src/__tests__/integration/`
3. **Seguir convenciones**: Usar AAA pattern y nomenclatura clara
4. **Mantener cobertura**: Asegurar >70% de cobertura en nuevos archivos
5. **Ejecutar antes de commit**: `npm test` debe pasar antes de hacer commit

---

**Última actualización**: 2024-09-03
**Mantenido por**: Equipo Camport
