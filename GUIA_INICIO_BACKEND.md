# 🚀 Guía Completa - Iniciar Backend Camport

Esta guía te llevará paso a paso para iniciar y hacer funcionar el backend Camport completamente refactorizado.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **Git** (para clonar el repositorio) - [Descargar aquí](https://git-scm.com/)

Para verificar si están instalados:
```bash
node --version    # Debe mostrar v16.x.x o superior
npm --version     # Debe mostrar 8.x.x o superior
git --version     # Debe mostrar 2.x.x o superior
```

---

## 🔽 Paso 1: Obtener el Código

### Si ya tienes el proyecto:
```bash
cd "C:\Users\[TU_USUARIO]\OneDrive\Documentos\Semestre 6\Proyecto de integracion\Proyecto Camport"
```

### Si necesitas clonarlo desde GitHub:
```bash
git clone https://github.com/BorBP/proyecto-camport.git
cd proyecto-camport
```

---

## 📁 Paso 2: Navegar al Backend

```bash
cd backend
```

**Verificar que estás en el directorio correcto:**
```bash
# En Windows PowerShell:
Get-Location

# En CMD o bash:
pwd

# Deberías ver algo como:
# C:\Users\[TU_USUARIO]\...\Proyecto Camport\backend
```

---

## 📦 Paso 3: Instalar Dependencias

```bash
npm install
```

**Qué va a pasar:**
- Se descargará e instalará todas las dependencias necesarias
- Se creará la carpeta `node_modules`
- Puede tomar 1-3 minutos dependiendo de tu conexión

**Verificar instalación exitosa:**
```bash
# Verificar que node_modules existe
ls node_modules     # En bash
dir node_modules    # En CMD
Get-ChildItem node_modules  # En PowerShell
```

---

## 🗄️ Paso 4: Inicializar Base de Datos

```bash
npm run db:init
```

**Qué hace este comando:**
- Crea la base de datos SQLite
- Sincroniza todos los modelos (tablas)
- Crea el usuario administrador
- Agrega datos de prueba (animales, collares, potreros)

**Resultado esperado:**
```
🚀 Iniciando configuración de base de datos Camport...
📡 Probando conexión a SQLite...
✅ Conexión exitosa
🔄 Sincronizando modelos con la base de datos...
✅ Modelos sincronizados
📋 Verificando tablas creadas:
   ✅ usuarios
   ✅ animales
   ✅ grupos
   ✅ potreros
   ✅ collares
   ✅ telemetrias
   ✅ alertas
👤 Verificando usuario administrador...
✅ Usuario administrador creado
   📧 Email: admin@camport.local
   🔑 Password: Admin123!
📦 Creando datos de prueba...
✅ Datos de prueba creados exitosamente!
```

---

## 🚀 Paso 5: Iniciar el Servidor

### Opción A: Modo Producción
```bash
npm start
```

### Opción B: Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

**Resultado esperado:**
```
[INFO] ✅ Conexión a la base de datos establecida
[INFO] 🔌 Socket.io configurado
[INFO] Motor de alertas iniciado - procesando cada 60 segundos
[INFO] 🚨 Sistema de alertas iniciado
[INFO] 🚀 Servidor Camport en puerto 3001
[INFO] 📡 API: http://localhost:3001/api
```

**🎉 ¡Si ves estos mensajes, el backend está funcionando correctamente!**

---

## ✅ Paso 6: Verificar que Funciona

### 6.1 Health Check
Abre tu navegador o usa curl:
```bash
# En navegador:
http://localhost:3001/health

# Con curl:
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T14:33:17.416Z",
  "uptime": 20.7550633
}
```

### 6.2 Información del API
```bash
# En navegador:
http://localhost:3001/

# Con curl:
curl http://localhost:3001/
```

**Respuesta esperada:**
```json
{
  "nombre": "Camport API",
  "version": "1.0.0",
  "descripcion": "Sistema de Control Ganadero con IoT",
  "estado": "operativo"
}
```

### 6.3 Probar Login
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@camport.local", "password": "Admin123!"}'
```

**Respuesta esperada:**
```json
{
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id": "...",
      "nombre": "Administrador del Sistema",
      "email": "admin@camport.local",
      "rol": "administrador"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6.4 Probar Telemetría IoT
```bash
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
```

**Respuesta esperada:**
```json
{
  "message": "Telemetría recibida exitosamente",
  "data": {
    "id": "...",
    "latitud": -33.4569,
    "longitud": -70.6483,
    "bateria": 75.5,
    "temperatura": 38.2,
    "actividad": 45,
    "collar": {"identificador": "COL-001"},
    "animal": {"nombre": "Bella"}
  }
}
```

---

## 🔧 Comandos Útiles

### Para el día a día:
```bash
# Iniciar servidor
npm start

# Iniciar en modo desarrollo (con auto-reload)
npm run dev

# Reinicializar base de datos (cuidado: borra datos)
npm run db:init

# Solo sincronizar modelos (sin borrar datos)
npm run db:sync

# Ejecutar tests
npm test

# Ver logs detallados
npm start -- --verbose
```

### Para parar el servidor:
- **Ctrl + C** en la terminal donde está corriendo

---

## 📊 URLs Importantes

Una vez que el servidor esté corriendo:

| Descripción | URL | Método |
|-------------|-----|--------|
| **Health Check** | http://localhost:3001/health | GET |
| **API Info** | http://localhost:3001/ | GET |
| **Login** | http://localhost:3001/api/auth/login | POST |
| **Datos Usuario** | http://localhost:3001/api/auth/me | GET |
| **Telemetría IoT** | http://localhost:3001/api/telemetria/ingest | POST |
| **Animales** | http://localhost:3001/api/animales | GET |
| **Alertas** | http://localhost:3001/api/alertas | GET |

---

## 🔑 Credenciales de Prueba

**Usuario Administrador:**
- **Email**: `admin@camport.local`
- **Password**: `Admin123!`

**Datos de Prueba Disponibles:**
- **3 Animales**: Bella, Mango, Luna
- **3 Collares**: COL-001, COL-002, COL-003
- **1 Potrero**: Potrero Norte
- **1 Grupo**: Grupo Principal

---

## 🐛 Solución de Problemas

### Problema: "Puerto 3001 ya está en uso"
```bash
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :3001

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID [número] /F

# O cambiar el puerto en .env
PORT=3002
```

### Problema: "Error de conexión a base de datos"
```bash
# Verificar que la carpeta data existe
ls data/
# Si no existe:
mkdir data

# Reinicializar base de datos
npm run db:init
```

### Problema: "Módulo no encontrado"
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Problema: "JWT_SECRET no definido"
```bash
# Verificar que el archivo .env existe
ls .env

# Si no existe, copiar desde .env.example
cp .env.example .env
```

### Problema: "Cannot find module 'nodemon'"
```bash
# Instalar nodemon globalmente
npm install -g nodemon

# O usar directamente node
npm start
```

---

## 🎯 Verificación Final

**✅ El backend está funcionando correctamente si:**

1. **Servidor inicia sin errores**
2. **Health check responde OK**: http://localhost:3001/health
3. **Login funciona** con `admin@camport.local / Admin123!`
4. **Telemetría acepta datos** del endpoint `/api/telemetria/ingest`
5. **Logs muestran**: "Motor de alertas iniciado" y "Socket.io configurado"

**🎉 ¡Tu backend Camport está listo para conectar con el frontend!**

---

## 🔗 Próximos Pasos

1. **Para Frontend React**: El backend está configurado para CORS en `http://localhost:5173`
2. **Para IoT Simulator**: Usar endpoint `http://localhost:3001/api/telemetria/ingest`
3. **Para Testing**: Usar las credenciales y datos de prueba proporcionados
4. **Para Producción**: Cambiar variables de entorno en `.env`

---

## 📞 Soporte

Si encuentras problemas:

1. **Verificar logs** en la consola donde corre el servidor
2. **Revisar archivos**:
   - `.env` (configuración)
   - `data/camport.sqlite` (base de datos)
   - `logs/` (si existen logs de error)
3. **Comandos de diagnóstico**:
   ```bash
   node --version
   npm --version
   ls -la
   npm list
   ```