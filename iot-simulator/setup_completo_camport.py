"""
Script de Setup Completo para Camport
Crea todos los datos necesarios para el funcionamiento completo del sistema
"""
import sqlite3
import uuid
from datetime import datetime
import json

db_path = r"C:\Users\sebas\proyecto-camport\backend\camport.db"

print("="*70)
print("  🐄 SETUP COMPLETO DE CAMPORT - DATOS DE PRUEBA")
print("="*70)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    # ============================================================
    # 1. CREAR GRUPO
    # ============================================================
    print("\n📦 Creando Grupo...")
    
    cursor.execute("SELECT id FROM grupos WHERE nombre = ?", ("Grupo Principal",))
    grupo = cursor.fetchone()
    
    if not grupo:
        grupo_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO grupos (id, nombre, descripcion, color, activo, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (grupo_id, "Grupo Principal", "Grupo de prueba para el sistema Camport", 
              "#2ecc71", 1, now, now))
        print(f"   ✅ Grupo 'Grupo Principal' creado (ID: {grupo_id[:8]}...)")
    else:
        grupo_id = grupo[0]
        print(f"   ℹ️  Grupo 'Grupo Principal' ya existe")
    
    # ============================================================
    # 2. CREAR POTRERO CON GEOCERCA
    # ============================================================
    print("\n🗺️  Creando Potrero con Geocerca...")
    
    cursor.execute("SELECT id FROM potreros WHERE nombre = ?", ("Potrero Norte",))
    potrero = cursor.fetchone()
    
    if not potrero:
        potrero_id = str(uuid.uuid4())
        
        # Coordenadas del potrero (polígono que contiene las posiciones iniciales)
        coordenadas = json.dumps([
            {"lat": -33.4569, "lng": -70.6483},
            {"lat": -33.4570, "lng": -70.6480},
            {"lat": -33.4575, "lng": -70.6485},
            {"lat": -33.4574, "lng": -70.6488}
        ])
        
        cursor.execute("""
            INSERT INTO potreros (id, nombre, descripcion, coordenadas, area, color, activo, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (potrero_id, "Potrero Norte", "Potrero de prueba en la zona norte", 
              coordenadas, 2.5, "#10B981", 1, now, now))
        print(f"   ✅ Potrero 'Potrero Norte' creado (ID: {potrero_id[:8]}...)")
        print(f"   📍 Geocerca con 4 puntos definida")
    else:
        potrero_id = potrero[0]
        print(f"   ℹ️  Potrero 'Potrero Norte' ya existe")
    
    # ============================================================
    # 3. OBTENER COLLARES EXISTENTES
    # ============================================================
    print("\n📡 Verificando Collares...")
    
    cursor.execute("SELECT id, identificador FROM collares ORDER BY identificador")
    collares = cursor.fetchall()
    
    if not collares:
        print("   ❌ ERROR: No hay collares. Ejecuta crear_collares_db.py primero")
        exit(1)
    
    print(f"   ✅ {len(collares)} collares encontrados: {', '.join([c[1] for c in collares])}")
    
    # ============================================================
    # 4. CREAR ANIMALES Y ASOCIARLOS A COLLARES
    # ============================================================
    print("\n🐄 Creando Animales...")
    
    animales_data = [
        {
            "identificador": "A001",
            "nombre": "Bella",
            "raza": "Holstein",
            "sexo": "hembra",
            "fecha_nacimiento": "2021-03-15",
            "edad_meses": 44,
            "peso": 520.5,
            "collar": "COL-001"
        },
        {
            "identificador": "A002",
            "nombre": "Mango",
            "raza": "Angus",
            "sexo": "macho",
            "fecha_nacimiento": "2022-05-20",
            "edad_meses": 29,
            "peso": 480.0,
            "collar": "COL-002"
        },
        {
            "identificador": "A003",
            "nombre": "Luna",
            "raza": "Hereford",
            "sexo": "hembra",
            "fecha_nacimiento": "2020-11-10",
            "edad_meses": 47,
            "peso": 495.3,
            "collar": "COL-003"
        }
    ]
    
    for animal_data in animales_data:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM animales WHERE identificador = ?", 
                      (animal_data["identificador"],))
        existe = cursor.fetchone()
        
        if existe:
            print(f"   ℹ️  Animal {animal_data['identificador']} ({animal_data['nombre']}) ya existe")
            continue
        
        # Obtener ID del collar
        cursor.execute("SELECT id FROM collares WHERE identificador = ?", 
                      (animal_data["collar"],))
        collar = cursor.fetchone()
        
        if not collar:
            print(f"   ⚠️  Collar {animal_data['collar']} no encontrado, saltando...")
            continue
        
        collar_id = collar[0]
        
        # Crear animal
        animal_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO animales (
                id, identificador, nombre, raza, fecha_nacimiento, edad_meses, peso,
                sexo, estado, observaciones, grupo_id, collar_id, potrero_id,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            animal_id,
            animal_data["identificador"],
            animal_data["nombre"],
            animal_data["raza"],
            animal_data["fecha_nacimiento"],
            animal_data["edad_meses"],
            animal_data["peso"],
            animal_data["sexo"],
            "activo",
            f"Animal de prueba - {animal_data['nombre']}",
            grupo_id,
            collar_id,
            potrero_id,
            now,
            now
        ))
        
        # Actualizar collar con el animal_id
        cursor.execute("""
            UPDATE collares 
            SET animal_id = ?, updated_at = ?
            WHERE id = ?
        """, (animal_id, now, collar_id))
        
        print(f"   ✅ Animal {animal_data['identificador']} ({animal_data['nombre']}) creado")
        print(f"      └─ Asociado a collar {animal_data['collar']}")
        print(f"      └─ Asignado a potrero 'Potrero Norte'")
    
    # ============================================================
    # 5. COMMIT Y VERIFICACIÓN
    # ============================================================
    conn.commit()
    
    print("\n" + "="*70)
    print("  📊 RESUMEN DE DATOS CREADOS")
    print("="*70)
    
    # Contar registros
    tablas = {
        "Usuarios": "usuarios",
        "Grupos": "grupos",
        "Potreros": "potreros",
        "Collares": "collares",
        "Animales": "animales",
        "Telemetrias": "telemetrias"
    }
    
    for nombre, tabla in tablas.items():
        cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
        count = cursor.fetchone()[0]
        print(f"   {nombre:15} : {count:3} registros")
    
    print("\n" + "="*70)
    print("  🔗 RELACIONES CONFIGURADAS")
    print("="*70)
    
    # Verificar relaciones
    cursor.execute("""
        SELECT a.identificador, a.nombre, c.identificador, p.nombre
        FROM animales a
        JOIN collares c ON a.collar_id = c.id
        JOIN potreros p ON a.potrero_id = p.id
    """)
    
    relaciones = cursor.fetchall()
    for rel in relaciones:
        print(f"   {rel[0]} ({rel[1]}) → Collar {rel[2]} → {rel[3]}")
    
    conn.close()
    
    print("\n" + "="*70)
    print("  ✅ SETUP COMPLETO EXITOSO")
    print("="*70)
    print("\n  🎯 Camport está listo para funcionar al 100%")
    print("  🚀 Ahora puedes ejecutar el simulador y todas las funciones estarán activas:")
    print("     - Telemetría con animales asociados")
    print("     - Detección de fugas de geocercas")
    print("     - Alertas de batería baja")
    print("     - Alertas de temperatura elevada")
    print("     - Reportes por grupo")
    print("\n  💡 Ejecuta: python main.py\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
