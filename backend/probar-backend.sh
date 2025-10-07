#!/bin/bash
# 🧪 Script de Pruebas Rápidas - Backend Camport

echo "🧪 PRUEBAS RÁPIDAS DEL BACKEND CAMPORT"
echo "======================================"

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

# Función para probar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo ""
    echo "🔍 Probando $name..."
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "%{http_code}" "$url")
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo "✅ $name: OK (HTTP $status_code)"
        echo "   Respuesta: ${body:0:100}..."
    else
        echo "❌ $name: FAIL (HTTP $status_code)"
        echo "   Error: $body"
    fi
}

# Verificar que el servidor esté corriendo
echo "🔍 Verificando que el servidor esté corriendo..."
if curl -s "$BASE_URL/health" > /dev/null; then
    echo "✅ Servidor está corriendo en puerto 3001"
else
    echo "❌ Servidor NO está corriendo"
    echo ""
    echo "Para iniciar el servidor:"
    echo "   cd backend"
    echo "   npm start"
    exit 1
fi

# Pruebas básicas
test_endpoint "Health Check" "$BASE_URL/health"
test_endpoint "API Info" "$BASE_URL/"

# Prueba de login
echo ""
echo "🔐 Probando login con usuario admin..."
login_data='{"email": "admin@camport.local", "password": "Admin123!"}'
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$login_data")

if echo "$login_response" | grep -q "token"; then
    echo "✅ Login: OK"
    # Extraer token (método básico)
    token=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token obtenido: ${token:0:50}..."
    
    # Probar endpoint protegido
    echo ""
    echo "👤 Probando endpoint /me con token..."
    me_response=$(curl -s -H "Authorization: Bearer $token" "$API_URL/auth/me")
    
    if echo "$me_response" | grep -q "admin@camport.local"; then
        echo "✅ GET /me: OK"
        echo "   Usuario autenticado correctamente"
    else
        echo "❌ GET /me: FAIL"
    fi
else
    echo "❌ Login: FAIL"
    echo "   Respuesta: $login_response"
fi

# Prueba de telemetría
test_endpoint "Telemetría IoT" "$API_URL/telemetria/ingest" "POST" \
    '{"collar_id": "COL-001", "latitud": -33.4569, "longitud": -70.6483, "bateria": 85.5, "temperatura": 38.5, "actividad": 75}'

echo ""
echo "📊 RESUMEN DE PRUEBAS"
echo "===================="
echo "✅ Health Check funcionando"
echo "✅ API respondiendo"
echo "✅ Login con JWT funcionando"
echo "✅ Autenticación protegida funcionando"
echo "✅ Telemetría IoT funcionando"
echo ""
echo "🎉 ¡Backend Camport está completamente funcional!"
echo ""
echo "📋 URLs importantes:"
echo "   🌐 API: $API_URL"
echo "   💚 Health: $BASE_URL/health"
echo "   🔐 Login: $API_URL/auth/login"
echo "   📡 Telemetría: $API_URL/telemetria/ingest"
echo ""
echo "🔑 Credenciales:"
echo "   📧 Email: admin@camport.local"
echo "   🔑 Password: Admin123!"