@echo off
title Sistema Camport - Iniciando...
color 0A

echo.
echo ========================================
echo    🚢 SISTEMA CAMPORT - INICIO
echo ========================================
echo.

echo [1/3] Verificando dependencias...
cd backend
if not exist "node_modules" (
    echo ⚠️  Instalando dependencias del backend...
    npm install
)

cd ..\frontend
if not exist "node_modules" (
    echo ⚠️  Instalando dependencias del frontend...
    npm install
)

echo.
echo [2/3] Iniciando servicios...
echo ✅ Backend iniciándose en puerto 3001...
cd ..\backend
start "Camport Backend" cmd /c "npm start"

timeout /t 3 /nobreak >nul

echo ✅ Frontend iniciándose en puerto 3000...
cd ..\frontend
start "Camport Frontend" cmd /c "npm start"

echo.
echo [3/3] Sistema iniciado correctamente!
echo.
echo 📡 Backend:  http://localhost:3001/api
echo 🌐 Frontend: http://localhost:3000
echo.
echo ⚠️  Cierra ambas ventanas para detener el sistema
echo ========================================
echo.

pause