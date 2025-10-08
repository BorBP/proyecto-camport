"""
Script para inicializar los collares en el backend de Camport
"""
import requests
import json

# Headers para evitar bloqueo de seguridad
headers_base = {
    'User-Agent': 'CamportIoTSimulator/1.0',
    'Content-Type': 'application/json'
}

# Datos de login
login_data = {
    'email': 'admin@camport.local',
    'password': 'Admin123!'
}

print("Autenticando con el backend...")

# Login
response = requests.post('http://localhost:3000/api/auth/login', json=login_data, headers=headers_base)
if response.status_code != 200:
    print(f'Error al hacer login: {response.text}')
    exit(1)

token = response.json()['token']
headers_auth = {
    **headers_base,
    'Authorization': f'Bearer {token}'
}

print("Autenticado correctamente\n")
print("Creando collares...\n")

# Crear collares
collares = [
    {'identificador': 'COL-001', 'modelo': 'SmartCollar Pro', 'version_firmware': '1.2.3'},
    {'identificador': 'COL-002', 'modelo': 'SmartCollar Pro', 'version_firmware': '1.2.3'},
    {'identificador': 'COL-003', 'modelo': 'SmartCollar Pro', 'version_firmware': '1.2.3'}
]

for collar in collares:
    response = requests.post('http://localhost:3000/api/collares', json=collar, headers=headers_auth)
    if response.status_code in [200, 201]:
        print(f'   OK Collar {collar["identificador"]} creado')
    elif response.status_code == 400:
        print(f'   INFO Collar {collar["identificador"]} ya existe')
    else:
        print(f'   ERROR creando {collar["identificador"]}: HTTP {response.status_code}')

print('\nInicializacion de collares completa!')
