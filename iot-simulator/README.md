# 🐍 Simulador IoT - Camport

     Simulador de collares inteligentes IoT para el proyecto Camport de gestión ganadera.

     ## 📋 Descripción

     Este simulador genera datos realistas de telemetría de collares IoT para ganado bovino, incluyendo:

     - 📍 **Posición GPS** (latitud, longitud, altitud)
     - 🔋 **Nivel de batería** (con descarga gradual)
     - 🌡️ **Temperatura corporal** (con variaciones naturales)
     - 🏃 **Nivel de actividad** (0-100)
     - ⏱️ **Timestamp** en formato ISO 8601

     Los datos se envían periódicamente al backend de Camport vía HTTP POST.

     ## 🚀 Instalación

     1. **Instalar dependencias:**

     ```bash
     pip install -r requirements.txt

     1. Configurar el simulador:

   Edita config.json para ajustar:

     * URL del backend
     * Intervalo de envío
     * Configuración de collares
     * Parámetros de simulación

   ▶️ Uso

   Ejecutar el simulador:

     python main.py

   Detener el simulador:

   Presiona Ctrl+C para detener la simulación de forma segura.

   ⚙️ Configuración

   Archivo config.json

     {
       "backend": {
         "url": "http://localhost:3000",
         "endpoint": "/api/telemetria/ingest"
       },
       "simulacion": {
         "intervalo_envio": 10,
         "duracion_total": 0,
         "modo_debug": true
       },
       "collares": [
         {
           "id": "COL-001",
           "animal": "Bella",
           "activo": true,
           "posicion_inicial": {...},
           "bateria_inicial": 100
         }
       ]
     }

   Parámetros principales:

     * intervalo_envio: Segundos entre cada envío (default: 10)
     * duracion_total: Duración en segundos (0 = infinito)
     * modo_debug: Muestra información detallada en consola
     * velocidad_movimiento: Velocidad de desplazamiento del animal
     * descarga_bateria: Porcentaje de descarga por ciclo

   📡 Formato de Telemetría

   El simulador envía datos JSON al backend:

     {
       "collar_id": "COL-001",
       "latitud": -33.4569,
       "longitud": -70.6483,
       "altitud": 500.5,
       "precision": 5.2,
       "bateria": 85.5,
       "temperatura": 38.5,
       "actividad": 65,
       "timestamp": "2025-01-02T10:30:00Z"
     }

   📁 Estructura del Proyecto

     iot-simulator/
     ├── main.py                 # Punto de entrada principal
     ├── collar_simulator.py     # Lógica de simulación del collar
     ├── api_client.py          # Cliente HTTP para backend
     ├── utils.py               # Utilidades y helpers
     ├── config.json            # Configuración del simulador
     ├── requirements.txt       # Dependencias Python
     └── README.md             # Esta documentación

   🔧 Módulos

   collar_simulator.py

     * Clase CollarSimulator: Simula el comportamiento de un collar IoT
     * Actualiza posición GPS dentro del potrero
     * Simula descarga de batería
     * Genera variaciones de temperatura
     * Calcula niveles de actividad

   api_client.py

     * Clase APIClient: Maneja la comunicación con el backend
     * Envía telemetría vía HTTP POST
     * Verifica disponibilidad del backend
     * Maneja errores de conexión

   utils.py

     * Funciones auxiliares para logging
     * Carga de configuración
     * Helpers de formato y display

   🐄 Collares Configurados

   Por defecto hay 3 collares configurados:

     * COL-001 → Bella (Holstein)
     * COL-002 → Mango (Angus)
     * COL-003 → Luna (Hereford)

   🎯 Características

   ✅ Movimiento realista dentro del potrero (algoritmo ray-casting)
   ✅ Descarga gradual de batería
   ✅ Variaciones naturales de temperatura corporal
   ✅ Niveles de actividad dinámicos
   ✅ Precisión GPS variable
   ✅ Logs con colores para mejor visualización
   ✅ Manejo robusto de errores
   ✅ Resumen estadístico al finalizar

   📊 Ejemplo de Output

     ╔══════════════════════════════════════════════════════════╗
     ║           🐄 CAMPORT IoT SIMULATOR 🐄                   ║
     ║        Sistema de Simulación de Collares IoT            ║
     ╚══════════════════════════════════════════════════════════╝

     📋 CONFIGURACIÓN:
        Backend: http://localhost:3000
        Intervalo: 10s
        Collares activos: 3
        Modo debug: ✓

     🚀 Iniciando simulación...

     ============================================================
       CICLO #1 - 2025-01-02 15:30:45
     ============================================================

     📡 COL-001 (Bella): Pos[-33.4569, -70.6483] Bat:100.0% Temp:38.5°C Act:65
     ✓ COL-001: Telemetría enviada exitosamente

   🔗 Integración con Backend

   El simulador envía datos al endpoint:

     POST http://localhost:3000/api/telemetria/ingest

   Asegúrate de que el backend esté ejecutándose antes de iniciar el simulador.

   📝 Notas

     * El simulador puede ejecutarse sin conexión al backend (modo offline)
     * Los datos se pueden guardar localmente en JSON (opcional)
     * La batería nunca baja de 0%
     * La temperatura normal está entre 37.5°C y 40°C
     * Temperatura > 39.5°C genera advertencia de posible fiebre

   🐮 Proyecto Camport

   Este simulador es parte del proyecto académico Camport, un sistema integral de
   monitoreo ganadero con geocercas digitales y alertas automáticas.

   -------------------------------------------------------------------------------

   Desarrollado para el proyecto Camport - 2025


     ---

     ## ✅ **¡SIMULADOR COMPLETO!**

     Ya tienes todos los archivos necesarios:

     ### Estructura final:

   iot-simulator/ ├── main.py ⭐ (nuevo) ├── collar_simulator.py ⭐ (nuevo) ├──
   api_client.py ⭐ (nuevo) ├── utils.py ⭐ (nuevo) ├── config.json ✅ ├──
   requirements.txt ✅ └── README.md ⭐ (actualizado)


     ### 🎯 Para ejecutar:

     1. **Instalar dependencias:**
     ```bash
     pip install -r requirements.txt

     1. Asegúrate que el backend esté corriendo (puerto 3000)
     2. Ejecutar el simulador:

     python main.py