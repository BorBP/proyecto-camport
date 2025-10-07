# 🚀 Guía Rápida PowerShell - Iniciar Backend Camport

# Paso 1: Navegar al directorio del backend
Set-Location "C:\Users\$env:USERNAME\OneDrive\Documentos\Semestre 6\Proyecto de integracion\Proyecto Camport\backend"

Write-Host "📁 Directorio actual:" -ForegroundColor Cyan
Get-Location

# Paso 2: Verificar que Node.js está instalado
Write-Host "`n🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js NO está instalado. Descárgalo desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Paso 3: Instalar dependencias (si no están instaladas)
if (!(Test-Path "node_modules")) {
    Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n✅ Dependencias ya están instaladas" -ForegroundColor Green
}

# Paso 4: Verificar archivo .env
if (Test-Path ".env") {
    Write-Host "`n✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "`n❌ Archivo .env NO encontrado" -ForegroundColor Red
    exit 1
}

# Paso 5: Inicializar base de datos (si no existe)
if (!(Test-Path "data/camport.sqlite")) {
    Write-Host "`n🗄️ Inicializando base de datos..." -ForegroundColor Yellow
    npm run db:init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos inicializada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error inicializando base de datos" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n✅ Base de datos ya existe" -ForegroundColor Green
}

# Paso 6: Mostrar información importante
Write-Host "`n🎯 INFORMACIÓN IMPORTANTE" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta
Write-Host "📧 Usuario admin: admin@camport.local" -ForegroundColor Cyan
Write-Host "🔑 Password: Admin123!" -ForegroundColor Cyan
Write-Host "🌐 API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "💚 Health: http://localhost:3001/health" -ForegroundColor Cyan

# Paso 7: Preguntar cómo iniciar
Write-Host "`n🚀 ¿Cómo deseas iniciar el servidor?" -ForegroundColor Yellow
Write-Host "1. Modo Producción (npm start)" -ForegroundColor White
Write-Host "2. Modo Desarrollo con auto-reload (npm run dev)" -ForegroundColor White
Write-Host "3. Salir sin iniciar" -ForegroundColor White

$choice = Read-Host "`nIngresa tu opción (1, 2 o 3)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Iniciando servidor en modo producción..." -ForegroundColor Green
        npm start
    }
    "2" {
        Write-Host "`n🔄 Iniciando servidor en modo desarrollo..." -ForegroundColor Green
        npm run dev
    }
    "3" {
        Write-Host "`n👋 ¡Hasta luego! Para iniciar después ejecuta:" -ForegroundColor Yellow
        Write-Host "   npm start    (modo producción)" -ForegroundColor Cyan
        Write-Host "   npm run dev  (modo desarrollo)" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "`n❌ Opción inválida. Ejecuta manualmente:" -ForegroundColor Red
        Write-Host "   npm start    (modo producción)" -ForegroundColor Cyan
        Write-Host "   npm run dev  (modo desarrollo)" -ForegroundColor Cyan
    }
}