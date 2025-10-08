"""
Script para verificar el estado de la base de datos
"""
import sqlite3

db_path = r"C:\Users\sebas\proyecto-camport\backend\camport.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("="*60)
print("  ESTADO DE LA BASE DE DATOS CAMPORT")
print("="*60)

# Listar tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tablas = [t[0] for t in cursor.fetchall()]
print(f"\nTablas encontradas: {len(tablas)}")
for tabla in tablas:
    print(f"  - {tabla}")

print("\n" + "="*60)
print("  CONTEO DE REGISTROS")
print("="*60)

tablas_principales = ['usuarios', 'animales', 'grupos', 'potreros', 'collares', 'telemetrias', 'alertas']

for tabla in tablas_principales:
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
        count = cursor.fetchone()[0]
        print(f"  {tabla:15} : {count:5} registros")
    except:
        print(f"  {tabla:15} : ERROR")

print("\n" + "="*60)
print("  DETALLE DE COLLARES")
print("="*60)

cursor.execute("SELECT identificador, modelo, bateria_actual, activo, animal_id FROM collares")
collares = cursor.fetchall()
for collar in collares:
    animal_status = "CON ANIMAL" if collar[4] else "SIN ANIMAL"
    print(f"  {collar[0]}: {collar[1]} | Bat:{collar[2]:.1f}% | Activo:{collar[3]} | {animal_status}")

print("\n" + "="*60)
print("  DETALLE DE ANIMALES")
print("="*60)

cursor.execute("SELECT identificador, nombre, raza, estado, collar_id, potrero_id FROM animales")
animales = cursor.fetchall()
if animales:
    for animal in animales:
        collar_status = "CON COLLAR" if animal[4] else "SIN COLLAR"
        potrero_status = "EN POTRERO" if animal[5] else "SIN POTRERO"
        print(f"  {animal[0]} ({animal[1]}): {animal[2]} | {animal[3]} | {collar_status} | {potrero_status}")
else:
    print("  ⚠️  NO HAY ANIMALES REGISTRADOS")

print("\n" + "="*60)
print("  DETALLE DE POTREROS")
print("="*60)

cursor.execute("SELECT nombre, area, activo FROM potreros")
potreros = cursor.fetchall()
if potreros:
    for potrero in potreros:
        print(f"  {potrero[0]}: {potrero[1]} ha | Activo:{potrero[2]}")
else:
    print("  ⚠️  NO HAY POTREROS REGISTRADOS")

print("\n" + "="*60)
print("  ULTIMAS 5 TELEMETRIAS")
print("="*60)

cursor.execute("""
    SELECT collar_id, latitud, longitud, bateria, temperatura, timestamp 
    FROM telemetrias 
    ORDER BY timestamp DESC 
    LIMIT 5
""")
telemetrias = cursor.fetchall()
if telemetrias:
    for t in telemetrias:
        print(f"  Collar:{t[0][:8]}... | Pos:[{t[1]:.4f},{t[2]:.4f}] | Bat:{t[3]:.1f}% | Temp:{t[4]:.1f}°C | {t[5]}")
else:
    print("  ⚠️  NO HAY TELEMETRIAS")

conn.close()

print("\n" + "="*60)
print("  ANALISIS")
print("="*60)

if not animales:
    print("  ❌ FALTA: Crear animales y asociarlos a collares")
if not potreros:
    print("  ❌ FALTA: Crear potreros con geocercas")
if collares and animales and potreros:
    print("  ✅ TODOS LOS DATOS NECESARIOS ESTAN PRESENTES")
    
print("\n")
