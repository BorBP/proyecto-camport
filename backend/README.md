# 🐄 Backend Camport - Sistema de Gestión Ganadera con IoT

Backend completo y robusto para la plataforma Camport, diseñada para el monitoreo y gestión de ganado en tiempo real utilizando dispositivos IoT.

El sistema está construido con una arquitectura modular y escalable, listo para un entorno de producción.

---

## ✨ Características Principales

- **Gestión Completa de Entidades**: CRUD para Animales, Potreros (Geocercas), Collares IoT y Grupos de ganado.
- **Autenticación y Autorización**: Sistema basado en JWT con roles (Administrador, Capataz) y permisos granulares.
- **Recepción de Telemetría**: Endpoints optimizados para la ingesta de datos de sensores (ubicación, temperatura, batería, etc.).
- **Motor de Alertas Automáticas**: Servicio en background que detecta y notifica eventos críticos en tiempo real:
  - Fuga de animales de las geocercas.
  - Niveles de batería bajos en los collares.
  - Fiebre (temperatura corporal elevada).
  - Inactividad prolongada.
- **Notificaciones en Tiempo Real**: Integración con Socket.io para notificar al frontend sobre nuevas alertas y actualizaciones de telemetría.
- **Generación de Reportes**: API para exportar datos clave en formatos CSV y PDF.
- **Seguridad Nivel Enterprise**: Implementación de más de 10 middlewares de seguridad, incluyendo Helmet, CORS, rate limiting, protección contra inyección SQL, XSS y más.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js con Express.js
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JSON Web Tokens (JWT)
- **Comunicación en Tiempo Real**: Socket.io
- **Seguridad**: Helmet, express-rate-limit, csurf, entre otros.
- **Validación**: express-validator

---

## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos pasos para tener el entorno de desarrollo local funcionando.

### 1. Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)

### 2. Clonar y Configurar el Proyecto

```bash
# 1. Clona este repositorio (si aún no lo has hecho)
# git clone ...

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
