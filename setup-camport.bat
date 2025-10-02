     @echo off
     chcp 65001 >nul
     title Setup Proyecto Camport
     color 0A

     echo.
     echo ╔════════════════════════════════════════════════════════════╗
     echo ║     🚀 SETUP AUTOMATICO - PROYECTO CAMPORT                ║
     echo ╔════════════════════════════════════════════════════════════╗
     echo.

     REM Verificar si Git está instalado
     git --version >nul 2>&1
     if errorlevel 1 (
         echo ❌ ERROR: Git no esta instalado
         echo.
         echo Por favor instala Git desde: https://git-scm.com/download/win
         echo.
         pause
         exit /b 1
     )

     echo ✅ Git detectado correctamente
     echo.

     REM ===========================================
     REM 1. CREAR ARCHIVO .GITIGNORE
     REM ===========================================
     echo 📝 Creando .gitignore...
     (
     echo # Python - IoT Simulator
     echo __pycache__/
     echo *.py[cod]
     echo *$py.class
     echo *.so
     echo .Python
     echo env/
     echo venv/
     echo ENV/
     echo .venv
     echo pip-log.txt
     echo .pytest_cache/
     echo *.egg-info/
     echo dist/
     echo build/
     echo.
     echo # Node.js - Backend/Frontend
     echo node_modules/
     echo npm-debug.log*
     echo yarn-debug.log*
     echo yarn-error.log*
     echo package-lock.json
     echo.
     echo # Logs
     echo logs/
     echo *.log
     echo.
     echo # Variables de entorno
     echo .env
     echo .env.local
     echo .env.development
     echo .env.test
     echo .env.production
     echo.
     echo # IDEs
     echo .vscode/
     echo .idea/
     echo *.swp
     echo *.swo
     echo *~
     echo .DS_Store
     echo.
     echo # Build
     echo dist/
     echo build/
     echo.
     echo # Database
     echo *.db
     echo *.sqlite
     echo *.sqlite3
     echo.
     echo # OS
     echo Thumbs.db
     ) > .gitignore

     REM ===========================================
     REM 2. CREAR README.MD
     REM ===========================================
     echo 📝 Creando README.md...
     (
     echo # 🚢 Proyecto Camport
     echo.
     echo Sistema integral para gestion portuaria con simulacion IoT, backend
   API y frontend web.
     echo.
     echo ## 📁 Estructura del Proyecto
     echo.
     echo ```
     echo proyecto-camport/
     echo ├── iot-simulator/     # Simulador IoT en Python
     echo ├── backend/           # API Backend con JWT y motores
     echo └── frontend/          # Interfaz React/TypeScript
     echo ```
     echo.
     echo ## 👥 Equipo y Responsabilidades
     echo.
     echo - **IoT/Testing**: Desarrollo del simulador IoT con Python
     echo - **Backend**: API REST, autenticacion JWT, logica de negocio
     echo - **Frontend**: Interfaz de usuario con React/TypeScript
     echo.
     echo ## 📋 Arquitectura de Ramas
     echo.
     echo ```
     echo main
     echo   └── develop
     echo       ├── feature/iot-simulator
     echo       ├── feature/backend
     echo       └── feature/frontend
     echo ```
     echo.
     echo ## 🚀 Comenzar
     echo.
     echo 1. Lee `SETUP_GIT.md` para entender la arquitectura de ramas
     echo 2. Cada miembro trabaja en su rama asignada
     echo 3. Se integran cambios mediante Pull Requests
     echo.
     echo ## 🛠️ Tecnologias
     echo.
     echo - **IoT Simulator**: Python 3.x
     echo - **Backend**: Node.js / Python + JWT
     echo - **Frontend**: React + TypeScript
     echo - **Control de Versiones**: Git + GitHub
     echo.
     echo Para mas detalles, consulta [SETUP_GIT.md](./SETUP_GIT.md^)
     ) > README.md

     REM ===========================================
     REM 3. CREAR SETUP_GIT.MD
     REM ===========================================
     echo 📝 Creando SETUP_GIT.md...
     (
     echo # 🚀 Guia de Configuracion Git - Proyecto Camport
     echo.
     echo ## 📋 Arquitectura de Ramas
     echo.
     echo ```
     echo main (produccion^)
     echo   └── develop (desarrollo^)
     echo       ├── feature/iot-simulator (Python - IoT^)
     echo       ├── feature/backend (API + JWT^)
     echo       └── feature/frontend (React/TSX^)
     echo ```
     echo.
     echo ## 👥 Workflow Diario
     echo.
     echo ### Al iniciar el dia:
     echo ```bash
     echo git checkout tu-rama
     echo git pull origin tu-rama
     echo git pull origin develop
     echo ```
     echo.
     echo ### Al terminar una tarea:
     echo ```bash
     echo git add .
     echo git commit -m "feat: descripcion del cambio"
     echo git push origin tu-rama
     echo ```
     echo.
     echo ## 🔄 Clonar el Proyecto (Para tu equipo^)
     echo.
     echo ```bash
     echo git clone https://github.com/TU-USUARIO/proyecto-camport.git
     echo cd proyecto-camport
     echo.
     echo # Cada desarrollador va a su rama:
     echo git checkout feature/iot-simulator    # Desarrollador IoT
     echo git checkout feature/backend          # Desarrollador Backend
     echo git checkout feature/frontend         # Desarrollador Frontend
     echo ```
     echo.
     echo ## 📝 Convencion de Commits
     echo.
     echo - `feat:` Nueva caracteristica
     echo - `fix:` Correccion de bug
     echo - `docs:` Documentacion
     echo - `refactor:` Refactorizacion
     echo - `test:` Tests
     echo.
     echo ## 🔗 Pull Requests
     echo.
     echo 1. Actualiza tu rama con develop
     echo 2. Crea PR en GitHub: tu-rama → develop
     echo 3. Espera revision del equipo
     echo 4. Merge cuando sea aprobado
     ) > SETUP_GIT.md

     REM ===========================================
     REM 4. CREAR ESTRUCTURA DE DIRECTORIOS
     REM ===========================================
     echo 📁 Creando estructura de directorios...

     mkdir iot-simulator 2>nul
     mkdir backend 2>nul
     mkdir frontend 2>nul

     REM ===========================================
     REM 5. ARCHIVOS IOT SIMULATOR
     REM ===========================================
     echo 📝 Creando archivos para IoT Simulator...

     (
     echo # 🐍 Simulador IoT - Python
     echo.
     echo Simulador de sensores IoT para el proyecto Camport.
     echo.
     echo ## Instalacion
     echo.
     echo ```bash
     echo pip install -r requirements.txt
     echo ```
     echo.
     echo ## Uso
     echo.
     echo ```bash
     echo python main.py
     echo ```
     ) > iot-simulator\README.md

     (
     echo # Dependencias Python para el simulador IoT
     echo # Descomenta y agrega las que necesites:
     echo.
     echo # paho-mqtt==1.6.1
     echo # requests==2.31.0
     echo # python-dotenv==1.0.0
     echo # flask==2.3.0
     ) > iot-simulator\requirements.txt

     (
     echo """
     echo Simulador IoT - Proyecto Camport
     echo Punto de entrada principal
     echo """
     echo.
     echo def main(^):
     echo     print("🚀 Simulador IoT iniciado"^)
     echo     print("📡 Conectando sensores..."^)
     echo     # TODO: Implementar logica del simulador
     echo.
     echo if __name__ == "__main__":
     echo     main(^)
     ) > iot-simulator\main.py

     REM ===========================================
     REM 6. ARCHIVOS BACKEND
     REM ===========================================
     echo 📝 Creando archivos para Backend...

     (
     echo # 🔧 Backend API
     echo.
     echo API REST con autenticacion JWT y motores de base de datos.
     echo.
     echo ## Instalacion
     echo.
     echo ```bash
     echo npm install
     echo ```
     echo.
     echo ## Desarrollo
     echo.
     echo ```bash
     echo npm run dev
     echo ```
     ) > backend\README.md

     (
     echo {
     echo   "name": "camport-backend",
     echo   "version": "1.0.0",
     echo   "description": "Backend API para Proyecto Camport",
     echo   "main": "server.js",
     echo   "scripts": {
     echo     "start": "node server.js",
     echo     "dev": "nodemon server.js"
     echo   },
     echo   "keywords": ["api", "jwt", "backend"],
     echo   "author": "Equipo Camport",
     echo   "license": "ISC"
     echo }
     ) > backend\package.json

     (
     echo const express = require('express'^);
     echo const app = express(^);
     echo const PORT = process.env.PORT ^|^| 3000;
     echo.
     echo app.use(express.json(^)^);
     echo.
     echo app.get('/', (req, res^) =^> {
     echo   res.json({ message: '🚀 API Camport funcionando' }^);
     echo }^);
     echo.
     echo app.listen(PORT, (^) =^> {
     echo   console.log(`🚀 Servidor corriendo en puerto ${PORT}`^);
     echo }^);
     ) > backend\server.js

     REM ===========================================
     REM 7. ARCHIVOS FRONTEND
     REM ===========================================
     echo 📝 Creando archivos para Frontend...

     (
     echo # ⚛️ Frontend React
     echo.
     echo Interfaz de usuario con React y TypeScript.
     echo.
     echo ## Instalacion
     echo.
     echo ```bash
     echo npm install
     echo ```
     echo.
     echo ## Desarrollo
     echo.
     echo ```bash
     echo npm start
     echo ```
     ) > frontend\README.md

     (
     echo {
     echo   "name": "camport-frontend",
     echo   "version": "1.0.0",
     echo   "description": "Frontend para Proyecto Camport",
     echo   "scripts": {
     echo     "start": "react-scripts start",
     echo     "build": "react-scripts build",
     echo     "test": "react-scripts test"
     echo   },
     echo   "dependencies": {
     echo     "react": "^18.2.0",
     echo     "react-dom": "^18.2.0"
     echo   },
     echo   "keywords": ["react", "typescript", "frontend"],
     echo   "author": "Equipo Camport",
     echo   "license": "ISC"
     echo }
     ) > frontend\package.json

     (
     echo import React from 'react';
     echo.
     echo function App(^) {
     echo   return (
     echo     ^<div className="App"^>
     echo       ^<h1^>🚢 Proyecto Camport^</h1^>
     echo       ^<p^>Sistema de Gestion Portuaria^</p^>
     echo     ^</div^>
     echo   ^);
     echo }
     echo.
     echo export default App;
     ) > frontend\App.tsx

     echo.
     echo ✅ Todos los archivos creados exitosamente!
     echo.

     REM ===========================================
     REM 8. INICIALIZAR GIT
     REM ===========================================
     echo 🔧 Inicializando repositorio Git...
     git init

     REM ===========================================
     REM 9. CONFIGURAR USUARIO GIT
     REM ===========================================
     echo.
     echo ╔════════════════════════════════════════════════════════════╗
     echo ║     ⚙️ CONFIGURACION DE GIT                               ║
     echo ╚════════════════════════════════════════════════════════════╝
     echo.
     set /p gitname="Ingresa tu nombre: "
     set /p gitemail="Ingresa tu email: "
     git config user.name "%gitname%"
     git config user.email "%gitemail%"

     echo.
     echo ✅ Usuario configurado: %gitname% ^<%gitemail%^>

     REM ===========================================
     REM 10. CREAR COMMIT INICIAL
     REM ===========================================
     echo.
     echo 📦 Creando commit inicial...
     git add .
     git commit -m "Initial commit: Proyecto Camport - Estructura base con IoT,
    Backend y Frontend"

     REM ===========================================
     REM 11. CREAR RAMAS
     REM ===========================================
     echo.
     echo 🌿 Creando arquitectura de ramas...
     echo.

     git branch -M main
     echo    ✓ main

     git checkout -b develop 2>nul
     echo    ✓ develop

     git checkout -b feature/iot-simulator 2>nul
     echo    ✓ feature/iot-simulator
     git checkout develop 2>nul

     git checkout -b feature/backend 2>nul
     echo    ✓ feature/backend
     git checkout develop 2>nul

     git checkout -b feature/frontend 2>nul
     echo    ✓ feature/frontend
     git checkout develop 2>nul

     git checkout main 2>nul

     echo.
     echo ✅ Todas las ramas creadas exitosamente!
     echo.

     REM ===========================================
     REM 12. MOSTRAR RAMAS
     REM ===========================================
     echo 📋 Ramas disponibles:
     echo.
     git branch -a
     echo.

     REM ===========================================
     REM 13. CONECTAR CON GITHUB
     REM ===========================================
     echo.
     echo ╔════════════════════════════════════════════════════════════╗
     echo ║     🔗 CONECTAR CON GITHUB                                ║
     echo ╚════════════════════════════════════════════════════════════╝
     echo.
     echo IMPORTANTE: Antes de continuar, debes:
     echo.
     echo 1. Ir a: https://github.com/new
     echo 2. Nombre del repositorio: proyecto-camport
     echo 3. Descripcion: Sistema de gestion portuaria con IoT
     echo 4. Visibilidad: Public o Private (tu eleccion^)
     echo 5. NO marcar "Add a README file"
     echo 6. NO agregar .gitignore
     echo 7. NO agregar license
     echo 8. Click en "Create repository"
     echo.
     pause

     echo.
     set /p githubuser="Ingresa tu usuario de GitHub: "

     echo.
     echo 🚀 Conectando con GitHub...
     git remote add origin https://github.com/%githubuser%/proyecto-camport.git

     echo.
     echo 📤 Subiendo todas las ramas a GitHub...
     echo    (Esto puede tomar unos segundos^)
     echo.

     git push -u origin main
     if errorlevel 1 (
         echo.
         echo ❌ ERROR al subir main
         echo.
         echo Posibles causas:
         echo - El repositorio ya existe
         echo - No tienes permisos
         echo - Credenciales incorrectas
         echo.
         pause
         exit /b 1
     )

     git push -u origin develop
     git push -u origin feature/iot-simulator
     git push -u origin feature/backend
     git push -u origin feature/frontend

     echo.
     echo ╔════════════════════════════════════════════════════════════╗
     echo ║     ✅ ¡PROYECTO CREADO Y SUBIDO EXITOSAMENTE!            ║
     echo ╚════════════════════════════════════════════════════════════╝
     echo.
     echo 🎯 Tu repositorio esta en:
     echo    https://github.com/%githubuser%/proyecto-camport
     echo.
     echo 📋 Proximos pasos:
     echo    1. Ve a tu repositorio en GitHub
     echo    2. Invita a tu equipo (Settings ^> Collaborators^)
     echo    3. Comparte el enlace con tu equipo
     echo.
     echo 👥 Cada miembro debe:
     echo    git clone https://github.com/%githubuser%/proyecto-camport.git
     echo    cd proyecto-camport
     echo    git checkout su-rama-asignada
     echo.
     echo 📖 Lee SETUP_GIT.md para mas informacion
     echo.
     echo ╔════════════════════════════════════════════════════════════╗
     echo ║     Presiona cualquier tecla para salir                   ║
     echo ╚════════════════════════════════════════════════════════════╝
     pause >nul
