# 🚀 Guia de Configuracion Git - Proyecto Camport

## 📋 Arquitectura de Ramas

```
main (produccion)
  └── develop (desarrollo)
      ├── feature/iot-simulator (Python - IoT)
      ├── feature/backend (API + JWT)
      └── feature/frontend (React/TSX)
```

## 👥 Workflow Diario

### Al iniciar el dia:
```bash
git checkout tu-rama
git pull origin tu-rama
git pull origin develop
```

### Al terminar una tarea:
```bash
git add .
git commit -m "feat: descripcion del cambio"
git push origin tu-rama
```

## 🔄 Clonar el Proyecto (Para tu equipo)

```bash
git clone https://github.com/TU-USUARIO/proyecto-camport.git
cd proyecto-camport

# Cada desarrollador va a su rama:
git checkout feature/iot-simulator    # Desarrollador IoT
git checkout feature/backend          # Desarrollador Backend
git checkout feature/frontend         # Desarrollador Frontend
```

## 📝 Convencion de Commits

- `feat:` Nueva caracteristica
- `fix:` Correccion de bug
- `docs:` Documentacion
- `refactor:` Refactorizacion
- `test:` Tests

## 🔗 Pull Requests

1. Actualiza tu rama con develop
2. Crea PR en GitHub: tu-rama → develop
3. Espera revision del equipo
4. Merge cuando sea aprobado
