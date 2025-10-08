"""
Script para crear collares directamente en la base de datos SQLite
"""
import sqlite3
import uuid
from datetime import datetime

# Conectar a la base de datos
db_path = r"C:\Users\sebas\proyecto-camport\backend\camport.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Conectado a la base de datos")
    print("Creando collares...\n")
    
    collares = [
        ('COL-001', 'SmartCollar Pro', '1.2.3'),
        ('COL-002', 'SmartCollar Pro', '1.2.3'),
        ('COL-003', 'SmartCollar Pro', '1.2.3')
    ]
    
    for identificador, modelo, firmware in collares:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM collares WHERE identificador = ?", (identificador,))
        existe = cursor.fetchone()
        
        if existe:
            print(f"   INFO - Collar {identificador} ya existe")
        else:
            # Crear el collar
            collar_id = str(uuid.uuid4())
            now = datetime.now().isoformat()
            
            cursor.execute("""
                INSERT INTO collares (id, identificador, modelo, version_firmware, 
                                     bateria_actual, activo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (collar_id, identificador, modelo, firmware, 100.0, 1, now, now))
            
            print(f"   OK - Collar {identificador} creado con ID: {collar_id[:8]}...")
    
    conn.commit()
    print("\nCollares creados exitosamente!")
    
    # Mostrar los collares
    print("\nCollares en la base de datos:")
    cursor.execute("SELECT identificador, modelo, bateria_actual, activo FROM collares")
    for row in cursor.fetchall():
        print(f"   - {row[0]}: {row[1]} (Bateria: {row[2]}%, Activo: {'Si' if row[3] else 'No'})")
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
