# 🐄 Backend Camport - Sistema de Gestión Ganadera con IoT

Backend completo y robusto para la plataforma Camport, diseñada para el monitoreo y gestión de ganado en tiempo real utilizando dispositivos IoT.

**✅ BACKEND COMPLETAMENTE REFACTORIZADO Y FUNCIONAL**

El sistema está construido con una arquitectura modular y escalable, listo para un entorno de producción y compatible con el frontend React existente.

---

## ✨ Características Principales

### 🔐 Autenticación Robusta
- **Sistema JWT completo**: Login, refresh tokens, logout
- **Roles y permisos**: Administrador y Capataz con permisos granulares
- **Middleware de seguridad**: Rate limiting, CORS, Helmet, protección XSS
- **Credenciales de prueba**: admin@camport.local / Admin123!

### 📡 Telemetría IoT
- **Endpoint optimizado**: `/api/telemetria/ingest` para recepción de datos de sensores
- **Parámetros soportados**: Ubicación GPS, batería, temperatura, actividad
- **Validación robusta**: Coordenadas, rangos de valores, formatos
- **Socket.io**: Notificaciones en tiempo real al frontend

### 🚨 Sistema de Alertas Automáticas
Motor inteligente que detecta y notifica eventos críticos:
- **Batería baja**: < 20% (configurable)
- **Fiebre**: Temperatura ≥ 39.5°C (configurable)
- **Fuga de geocercas**: Animal fuera del potrero asignado
- **Inactividad**: Detección de baja actividad prolongada
- **Sin datos**: Collares que no transmiten telemetría

### 🗃️ Gestión Completa de Entidades
- **Animales**: CRUD con identificación, raza, estado, collar asignado
- **Potreros**: Geocercas con coordenadas, área, capacidad
- **Collares IoT**: Gestión de dispositivos, estado, batería
- **Grupos**: Organización lógica del ganado

### 🔒 Seguridad Nivel Enterprise
- **Helmet**: Headers de seguridad CSP, HSTS, XSS
- **CORS**: Configuración específica para orígenes permitidos
- **Rate Limiting**: Protección contra fuerza bruta y spam
- **Validación de entrada**: Sanitización contra inyección SQL
- **Logging de auditoría**: Tracking de actividades críticas

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: Sequelize con migraciones automáticas
- **Autenticación**: JWT con refresh tokens
- **Tiempo Real**: Socket.io para notificaciones
- **Seguridad**: Helmet, CORS, express-rate-limit
- **Logging**: Winston para logs estructurados

---

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- **Node.js** (versión 16 o superior)
- **npm** o **yarn**

### 2. Instalación

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración

# 4. Inicializar base de datos con datos de prueba
npm run db:init

# 5. Iniciar servidor en modo desarrollo
npm run dev
```

### 3. Variables de Entorno (.env)

```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
JWT_SECRET=devsecret_cambiar_en_produccion_2024
REFRESH_SECRET=refresh_secret_cambiar_en_produccion_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development

# SQLite (desarrollo)
SQLITE_STORAGE=./data/camport.sqlite

# Seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Datos del usuario autenticado
- `POST /api/auth/logout` - Cerrar sesión

### Telemetría IoT
- `POST /api/telemetria/ingest` - Recibir datos de sensores
- `GET /api/telemetria/latest` - Última telemetría de todos los animales
- `GET /api/telemetria/animal/:id` - Historial de un animal

### Gestión de Entidades
- `GET|POST|PUT|DELETE /api/animales` - CRUD Animales
- `GET|POST|PUT|DELETE /api/potreros` - CRUD Potreros/Geocercas
- `GET|POST|PUT|DELETE /api/collares` - CRUD Collares IoT
- `GET|POST|PUT|DELETE /api/alertas` - CRUD Alertas

---

## 🧪 Pruebas

### Ejecutar suite de pruebas completa
```bash
# Asegúrate de que el servidor esté ejecutándose
npm start

# En otra terminal, ejecutar pruebas
node test-api.js  # Requiere axios instalado
# O usar el script de PowerShell incluido
```

### Pruebas manuales con curl

```bash
# 1. Login
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@camport.local", "password": "Admin123!"}'

# 2. Telemetría
curl -X POST "http://localhost:3001/api/telemetria/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "collar_id": "COL-001",
    "latitud": -33.4569,
    "longitud": -70.6483,
    "bateria": 75.5,
    "temperatura": 38.2,
    "actividad": 45
  }'

# 3. Health Check
curl "http://localhost:3001/health"
```

---

## 🔧 Scripts NPM

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar con nodemon (desarrollo)
npm test           # Ejecutar tests con Jest
npm run db:sync    # Sincronizar modelos con BD
npm run db:init    # Inicializar BD con datos de prueba
```

---

## 📊 Datos de Prueba

El script `npm run db:init` crea automáticamente:

- **Usuario administrador**: admin@camport.local / Admin123!
- **3 animales**: Bella (Holstein), Mango (Angus), Luna (Hereford)
- **3 collares**: COL-001, COL-002, COL-003
- **1 potrero**: Potrero Norte con geocerca definida
- **1 grupo**: Grupo Principal

---

## 🚨 Sistema de Alertas

### Umbrales por Defecto
- **Batería baja**: < 20%
- **Temperatura alta**: ≥ 39.5°C
- **Inactividad**: < actividad configurada por 2 horas
- **Sin datos**: > 30 minutos sin telemetría

### Tipos de Alerta
- `bateria_baja` - Nivel crítico de batería
- `temperatura_alta` - Posible fiebre
- `fuga` - Animal fuera de geocerca
- `inactividad` - Baja actividad prolongada
- `sin_datos` - Collar sin transmitir

---

## 📱 Integración con Frontend

### CORS Configurado
- Permite requests desde `http://localhost:5173` (Vite/React)
- Headers permitidos: `Content-Type`, `Authorization`
- Métodos: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`

### Socket.io
```javascript
// Eventos emitidos al frontend
'telemetria:update'  // Nueva telemetría recibida
'alerta:nueva'       // Nueva alerta generada
```

### Formato de Respuesta Estándar
```json
{
  "message": "Descripción de la operación",
  "data": { /* datos solicitados */ },
  "error": "Mensaje de error (si aplica)"
}
```

---

## 🔄 Compatibilidad IoT

### Endpoint Principal: `/api/telemetria/ingest`

**Parámetros requeridos:**
- `collar_id` (string): Identificador único del collar
- `latitud` (float): Coordenada GPS (-90 a 90)
- `longitud` (float): Coordenada GPS (-180 a 180) 
- `bateria` (float): Nivel de batería (0-100)

**Parámetros opcionales:**
- `temperatura` (float): Temperatura corporal en °C
- `actividad` (integer): Nivel de actividad (0-100)
- `altitud` (float): Altitud en metros
- `precision` (float): Precisión GPS en metros
- `timestamp` (ISO string): Timestamp del dato

---

## 🎯 Estado del Refactor

### ✅ Completado
- [x] Autenticación JWT funcional
- [x] CORS configurado correctamente
- [x] Sistema de telemetría operativo
- [x] Motor de alertas automáticas
- [x] Base de datos SQLite configurada
- [x] Socket.io para tiempo real
- [x] Datos de prueba creados
- [x] Usuario admin funcional
- [x] Rate limiting y seguridad
- [x] Logging estructurado
- [x] Validación de entrada robusta
- [x] Manejo de errores centralizado
- [x] Documentación actualizada

### 🎉 Resultado
**Backend 100% funcional y listo para integración con frontend React**

---

## 📞 Soporte

Para problemas o consultas sobre la implementación:

1. Verificar que el servidor esté ejecutándose en puerto 3001
2. Revisar logs en consola para errores específicos
3. Confirmar que la base de datos se haya inicializado correctamente
4. Probar endpoints con las credenciales de prueba proporcionadas

**URLs de verificación:**
- Health Check: http://localhost:3001/health
- API Info: http://localhost:3001/
- Frontend: http://localhost:5173

# 2. Navega al directorio del backend
cd backend

# 3. Instala las dependencias del proyecto
npm install
```

### 3. Configuración del Entorno

```bash
# 1. Copia el archivo de ejemplo para las variables de entorno
cp .env.example .env

# 2. Abre el archivo .env en un editor de texto y configúralo.
# Es MUY IMPORTANTE que llenes las variables de la base de datos.
```

Un ejemplo de configuración del `.env` para la base de datos:
```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=camport
DB_PASSWORD=tu_password_secreto_de_postgres
DB_PORT=5432
```
**Nota**: También puedes configurar el `JWT_SECRET` y otros parámetros según tus necesidades.

### 4. Configuración de la Base de Datos

```bash
# 1. Inicia sesión en PostgreSQL y crea la base de datos
# Reemplaza 'postgres' si tienes otro usuario
psql -U postgres

# 2. Dentro de la consola de psql, ejecuta:
CREATE DATABASE camport;

# 3. Sal de psql
\q

# 4. Inicializa la base de datos con las tablas y datos de prueba.
# El flag '--with-test-data' crea animales, collares y potreros de ejemplo.
npm run db:init
```
Si todo sale bien, verás un mensaje indicando que la base de datos fue inicializada y poblada con datos de prueba.

### 5. Ejecutar la Aplicación

```bash
# Para un entorno de desarrollo con recarga automática (nodemon)
npm run dev

# Para un entorno de producción
npm start
```

El servidor se iniciará, por defecto, en `http://localhost:3000`.

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular para facilitar la mantenibilidad y escalabilidad.

- **/src/config**: Configuraciones de la base de datos, JWT y Socket.io.
- **/src/controllers**: Lógica de negocio que maneja las solicitudes (requests) y respuestas (responses).
- **/src/middleware**: Funciones que se ejecutan antes de los controladores (autenticación, validación, seguridad).
- **/src/models**: Definiciones de los modelos de la base de datos (usando Sequelize).
- **/src/routes**: Definición de los endpoints de la API.
- **/src/services**: Lógica de negocio desacoplada, como el motor de alertas.
- **/src/utils**: Utilidades compartidas (logger, funciones geoespaciales, etc.).

---

## 📚 Documentación Adicional

- **[Documentación de la API](./API_DOCUMENTATION.md)**: Consulta este archivo para ver una lista detallada de todos los endpoints disponibles, sus parámetros, y ejemplos de uso.
- **[Guía de Seguridad](./SECURITY.md)**: Revisa este documento para entender todas las medidas de seguridad implementadas en el proyecto.
