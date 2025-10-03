@echo off
title Sistema Camport - Estado
color 0B

echo.
echo ========================================
echo    🚢 SISTEMA CAMPORT - ESTADO
echo ========================================
echo.

echo [1/4] Verificando puertos...
echo.

echo 🔍 Puerto 3001 (Backend):
netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend ACTIVO en puerto 3001
) else (
    echo ❌ Backend NO está corriendo
)

echo.
echo 🔍 Puerto 3000 (Frontend):
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend ACTIVO en puerto 3000
) else (
    echo ❌ Frontend NO está corriendo
)

echo.
echo [2/4] Verificando archivos de configuración...
echo.

if exist "backend\.env" (
    echo ✅ Backend .env encontrado
) else (
    echo ❌ Backend .env FALTANTE
)

if exist "frontend\.env" (
    echo ✅ Frontend .env encontrado
) else (
    echo ❌ Frontend .env FALTANTE
)

echo.
echo [3/4] Verificando dependencias...
echo.

if exist "backend\node_modules" (
    echo ✅ Backend node_modules OK
) else (
    echo ❌ Backend necesita npm install
)

if exist "frontend\node_modules" (
    echo ✅ Frontend node_modules OK
) else (
    echo ❌ Frontend necesita npm install
)

echo.
echo [4/4] Configuración actual:
echo.
echo 📡 Backend URL: http://localhost:3001/api
echo 🌐 Frontend URL: http://localhost:3000
echo 🔗 Frontend apunta a: http://localhost:3001/api
echo.

if exist "backend\.env" (
    echo 🔧 Puerto Backend configurado:
    findstr "PORT=" backend\.env 2>nul
)

echo.
echo ========================================
echo.
pause