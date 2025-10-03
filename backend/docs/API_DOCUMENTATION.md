# 📖 Documentación de la API - Backend Camport

Esta documentación detalla todos los endpoints disponibles en la API del sistema Camport. 

**URL Base**: `http://localhost:3000/api`

---

## 🔑 Autenticación (Auth)

Endpoints para gestionar la autenticación de usuarios.

### `POST /auth/register`
- **Descripción**: Registra un nuevo usuario en el sistema.
- **Acceso**: Público (con rate limiting).
- **Body**:
  ```json
  {
    "nombre": "Juan Capataz",
    "email": "juan@ejemplo.com",
    "password": "unaClaveSegura123",
    "rol": "capataz" // "administrador" o "capataz"
  }
  ```

### `POST /auth/login`
- **Descripción**: Inicia sesión y devuelve tokens de acceso y de refresco.
- **Acceso**: Público (con rate limiting para prevenir fuerza bruta).
- **Body**:
  ```json
  {
    "email": "juan@ejemplo.com",
    "password": "unaClaveSegura123"
  }
  ```

### `POST /auth/refresh`
- **Descripción**: Obtiene un nuevo token de acceso usando un token de refresco válido.
- **Acceso**: Público.
- **Body**:
  ```json
  {
    "refreshToken": "el_token_de_refresco_recibido_en_login"
  }
  ```

### `GET /auth/me`
- **Descripción**: Devuelve la información del usuario actualmente autenticado.
- **Acceso**: Autenticado (cualquier rol).
- **Headers**: `Authorization: Bearer <token_de_acceso>`

### `POST /auth/change-password`
- **Descripción**: Permite al usuario autenticado cambiar su propia contraseña.
- **Acceso**: Autenticado (cualquier rol).
- **Headers**: `Authorization: Bearer <token_de_acceso>`
- **Body**:
  ```json
  {
    "currentPassword": "claveActual123",
    "newPassword": "nuevaClaveSegura456"
  }
  ```

---

## 👤 Usuarios (Users)

Endpoints para la gestión de usuarios. La mayoría de las operaciones requieren rol de Administrador.

### `GET /users`
- **Descripción**: Lista todos los usuarios del sistema con paginación.
- **Acceso**: Administrador.
- **Query Params**: `page`, `limit`, `rol`, `activo`, `search`.

### `GET /users/:id`
- **Descripción**: Obtiene los detalles de un usuario específico.
- **Acceso**: Administrador o el propio usuario.

### `POST /users`
- **Descripción**: Crea un nuevo usuario.
- **Acceso**: Administrador.
- **Body**: Similar a `/auth/register`.

### `PUT /users/:id`
- **Descripción**: Actualiza la información de un usuario (nombre, email, rol, estado).
- **Acceso**: Administrador o el propio usuario (con limitaciones).

### `DELETE /users/:id`
- **Descripción**: Elimina un usuario del sistema.
- **Acceso**: Administrador.
- **Nota**: No puedes eliminarte a ti mismo.

### `PATCH /users/:id/password`
- **Descripción**: Cambiar la contraseña de un usuario específico.
- **Acceso**: Administrador o el propio usuario.
- **Headers**: `Authorization: Bearer <token_de_acceso>`
- **Body**:
  ```json
  {
    "currentPassword": "contraseñaActual123",
    "newPassword": "nuevaContraseñaSegura456"
  }
  ```
- **Validaciones**: 
  - La contraseña actual debe ser correcta
  - La nueva contraseña debe tener al menos 8 caracteres con letras y números

### `PATCH /users/:id/activate`
- **Descripción**: Activar o desactivar un usuario del sistema.
- **Acceso**: Solo Administrador.
- **Headers**: `Authorization: Bearer <token_de_acceso>`
- **Body**:
  ```json
  {
    "activo": true  // true para activar, false para desactivar
  }
  ```
- **Notas**: 
  - Un administrador no puede desactivarse a sí mismo
  - Los usuarios inactivos no podrán iniciar sesión

---

## 🐄 Animales

Gestión del ganado.

### `GET /animales`
- **Descripción**: Lista todos los animales.
- **Acceso**: Administrador, Capataz.

### `POST /animales`
- **Descripción**: Registra un nuevo animal.
- **Acceso**: Administrador.

### `GET /animales/:id`
- **Descripción**: Obtiene detalles de un animal.
- **Acceso**: Administrador, Capataz.

### `PUT /animales/:id`
- **Descripción**: Actualiza un animal.
- **Acceso**: Administrador.

### `DELETE /animales/:id`
- **Descripción**: Elimina un animal.
- **Acceso**: Administrador.

---

## 📡 Collares IoT

Gestión de los dispositivos de monitoreo.

### `GET /collares`
- **Descripción**: Lista todos los collares.
- **Acceso**: Administrador, Capataz.

### `POST /collares`
- **Descripción**: Registra un nuevo collar.
- **Acceso**: Administrador.

### `POST /collares/:id/asignar`
- **Descripción**: Asigna un collar a un animal.
- **Acceso**: Administrador.
- **Body**: `{ "animal_id": "uuid-del-animal" }`

---

## 🌳 Potreros (Geocercas)

Gestión de las áreas geográficas.

### `GET /potreros`
- **Descripción**: Lista todos los potreros.
- **Acceso**: Administrador, Capataz.

### `POST /potreros`
- **Descripción**: Crea un nuevo potrero.
- **Acceso**: Administrador.
- **Body**:
  ```json
  {
    "nombre": "Potrero Norte",
    "coordenadas": [
      { "lat": -33.1, "lng": -70.1 },
      { "lat": -33.2, "lng": -70.1 },
      { "lat": -33.2, "lng": -70.2 },
      { "lat": -33.1, "lng": -70.2 }
    ]
  }
  ```

---

## 👥 Grupos

Gestión de grupos de animales.

### `GET /grupos`
- **Descripción**: Lista todos los grupos.
- **Acceso**: Administrador, Capataz.

### `POST /grupos/:id/asignar-animales`
- **Descripción**: Añade uno o más animales a un grupo.
- **Acceso**: Administrador.
- **Body**: `{ "animal_ids": ["uuid-animal-1", "uuid-animal-2"] }`

---

## 📈 Telemetría

Endpoints para la ingesta y consulta de datos de los sensores.

### `POST /telemetria/ingest`
- **Descripción**: Endpoint principal para que los collares envíen sus datos.
- **Acceso**: Público (protegido por API Key en un futuro).
- **Body**:
  ```json
  {
    "collar_id": "uuid-del-collar",
    "latitud": -33.123,
    "longitud": -70.456,
    "bateria": 85.5,
    "temperatura": 38.7,
    "actividad": 50
  }
  ```

### `GET /telemetria/latest`
- **Descripción**: Devuelve la última telemetría registrada para todos los animales activos.
- **Acceso**: Administrador, Capataz.

---

## 🚨 Alertas

Gestión del sistema de alertas automáticas y manuales.

### `GET /alertas`
- **Descripción**: Lista todas las alertas con filtros.
- **Acceso**: Administrador, Capataz.
- **Query Params**: `page`, `limit`, `estado`, `tipo`, `severidad`.

### `PATCH /alertas/:id/atender`
- **Descripción**: Marca una alerta como "en proceso".
- **Acceso**: Administrador, Capataz.

### `PATCH /alertas/:id/resolver`
- **Descripción**: Marca una alerta como "resuelta".
- **Acceso**: Administrador, Capataz.

### `POST /alertas/motor/iniciar`
- **Descripción**: Inicia el motor de alertas automáticas.
- **Acceso**: Administrador.

### `POST /alertas/motor/detener`
- **Descripción**: Detiene el motor de alertas.
- **Acceso**: Administrador.

---

## 📄 Reportes

Generación de reportes del sistema.

### `POST /reportes/exportar`
- **Descripción**: Genera y devuelve un archivo CSV o PDF.
- **Acceso**: Administrador, Capataz.
- **Body**:
  ```json
  {
    "tipo_reporte": "animales", // animales, telemetria, alertas
    "formato": "csv", // csv, pdf
    "filtros": { 
      "sexo": "hembra",
      "potrero_id": "uuid-del-potrero"
    }
  }
  ```
