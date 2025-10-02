@echo off
echo ================================
echo    CAMPORT - INSTALADOR COMPLETO
echo    Backend + Base de Datos
echo ================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo    Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version

REM Verificar si npm está disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm no está disponible
    pause
    exit /b 1
)

echo ✅ npm detectado: 
npm --version
echo.

echo ==============================
echo  PASO 1: VERIFICAR POSTGRESQL
echo ==============================

REM Verificar si PostgreSQL está instalado
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL NO está instalado
    echo.
    echo 📋 INSTRUCCIONES PARA INSTALAR POSTGRESQL:
    echo.
    echo 1. Ve a: https://www.postgresql.org/download/windows/
    echo 2. Descarga el instalador para Windows
    echo 3. Ejecuta el instalador con configuración por defecto
    echo 4. Anota la contraseña que pongas para el usuario 'postgres'
    echo 5. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL está instalado
    psql --version
)

echo.
echo =============================
echo  PASO 2: INSTALAR DEPENDENCIAS
echo =============================

cd backend
if not exist package.json (
    echo ❌ ERROR: package.json no encontrado
    pause
    exit /b 1
)

echo 📦 Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

echo.
echo ===============================
echo  PASO 3: CONFIGURAR BASE DE DATOS
echo ===============================

echo 🔧 Configurando PostgreSQL...
echo.
echo NECESITAMOS CREAR LA BASE DE DATOS 'camport'
echo.
set /p DB_PASSWORD="Ingresa la contraseña de PostgreSQL (usuario 'postgres'): "

echo 📊 Creando base de datos...
psql -U postgres -c "CREATE DATABASE camport;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Base de datos 'camport' creada exitosamente
) else (
    echo ⚠️  Base de datos podría ya existir (continuando...)
)

echo.
echo ===============================
echo  PASO 4: CONFIGURAR VARIABLES DE ENTORNO
echo ===============================

echo 📝 Actualizando archivo .env...

REM Crear archivo .env con la contraseña correcta
(
echo # Servidor
echo PORT=3000
echo NODE_ENV=development
echo.
echo # Base de Datos PostgreSQL
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=camport
echo DB_USER=postgres
echo DB_PASSWORD=%DB_PASSWORD%
echo.
echo # JWT - Autenticación
echo JWT_SECRET=camport_secret_key_change_in_production
echo JWT_EXPIRES_IN=7d
echo.
echo # Sistema de Alertas - Umbrales
echo BATERIA_BAJA_THRESHOLD=20
echo TEMPERATURA_ALTA_THRESHOLD=39.5
echo INACTIVIDAD_THRESHOLD=120
echo ALERT_CHECK_INTERVAL=60000
echo.
echo # CORS
echo CORS_ORIGIN=http://localhost:3001,http://localhost:5173
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW=15
echo RATE_LIMIT_MAX_REQUESTS=100
) > .env

echo ✅ Archivo .env configurado

echo.
echo ===============================
echo  PASO 5: INICIALIZAR BASE DE DATOS
echo ===============================

echo 🗄️ Sincronizando modelos y creando tablas...
node src/init-database.js --with-test-data
if %errorlevel% neq 0 (
    echo ❌ Error inicializando base de datos
    echo    Verifica que PostgreSQL esté ejecutándose
    echo    y que la contraseña sea correcta
    pause
    exit /b 1
)

echo ✅ Base de datos inicializada con datos de prueba

echo.
echo ===============================
echo  PASO 6: VERIFICAR FUNCIONAMIENTO
echo ===============================

echo 🧪 Probando conexión a base de datos...
node -e "require('dotenv').config(); const { Sequelize } = require('sequelize'); const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'postgres', logging: false }); sequelize.authenticate().then(() => { console.log('✅ Conexión a base de datos exitosa'); process.exit(0); }).catch(err => { console.log('❌ Error de conexión:', err.message); process.exit(1); });"

if %errorlevel% neq 0 (
    echo ❌ Error de conexión a base de datos
    pause
    exit /b 1
)

echo.
echo ===============================
echo    🎉 INSTALACIÓN COMPLETADA
echo ===============================
echo.
echo ✅ Backend Camport está 100%% funcional
echo ✅ Base de datos PostgreSQL configurada
echo ✅ Datos de prueba cargados
echo ✅ Variables de entorno configuradas
echo.
echo 🚀 PARA INICIAR EL SERVIDOR:
echo    npm start
echo.
echo 🌐 PARA PROBAR LA API:
echo    http://localhost:3000/api/health
echo.
echo 📊 CREDENCIALES DE PRUEBA:
echo    Usuario: admin@camport.com
echo    Contraseña: admin123
echo.
echo ¡Tu sistema Camport está listo para usar!
echo.
pause