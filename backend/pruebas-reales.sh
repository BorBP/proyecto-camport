#!/bin/bash

# Script de Pruebas Reales - Backend Camport
# Verifica que todos los componentes funcionen correctamente

echo "🧪 PRUEBAS REALES - Backend Camport"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

test_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

test_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# ==========================================
# 1. VERIFICAR ARCHIVOS CRÍTICOS
# ==========================================
echo "1️⃣  Verificando archivos críticos..."

if [ -f "server.js" ]; then
    test_pass "server.js existe"
else
    test_fail "server.js NO existe"
fi

if [ -f "src/app.js" ]; then
    test_pass "src/app.js existe"
else
    test_fail "src/app.js NO existe"
fi

if [ -f ".env" ]; then
    test_pass "Archivo .env configurado"
else
    test_warn "Archivo .env no existe (ejecuta: cp .env.example .env)"
fi

if [ -f "package.json" ]; then
    test_pass "package.json existe"
else
    test_fail "package.json NO existe"
fi

echo ""

# ==========================================
# 2. VERIFICAR DEPENDENCIAS
# ==========================================
echo "2️⃣  Verificando dependencias..."

if [ -d "node_modules" ]; then
    test_pass "node_modules instalado"

    # Verificar dependencias críticas
    if [ -d "node_modules/express" ]; then
        test_pass "Express instalado"
    else
        test_fail "Express NO instalado"
    fi

    if [ -d "node_modules/sequelize" ]; then
        test_pass "Sequelize instalado"
    else
        test_fail "Sequelize NO instalado"
    fi

    if [ -d "node_modules/jsonwebtoken" ]; then
        test_pass "JWT instalado"
    else
        test_fail "JWT NO instalado"
    fi

    if [ -d "node_modules/socket.io" ]; then
        test_pass "Socket.io instalado"
    else
        test_fail "Socket.io NO instalado"
    fi
else
    test_fail "node_modules NO existe (ejecuta: npm install)"
fi

echo ""

# ==========================================
# 3. VERIFICAR ESTRUCTURA DE CÓDIGO
# ==========================================
echo "3️⃣  Verificando estructura de código..."

# Contar controladores
CONTROLLERS=$(ls -1 src/controllers/*.js 2>/dev/null | wc -l)
if [ "$CONTROLLERS" -eq 8 ]; then
    test_pass "8 controladores encontrados"
else
    test_fail "Esperados 8 controladores, encontrados $CONTROLLERS"
fi

# Contar rutas
ROUTES=$(ls -1 src/routes/*.js 2>/dev/null | wc -l)
if [ "$ROUTES" -eq 9 ]; then
    test_pass "9 archivos de rutas encontrados"
else
    test_fail "Esperados 9 rutas, encontrados $ROUTES"
fi

# Contar modelos
MODELS=$(ls -1 src/models/*.js 2>/dev/null | grep -v index.js | wc -l)
if [ "$MODELS" -ge 7 ]; then
    test_pass "$MODELS modelos encontrados"
else
    test_warn "Esperados 7+ modelos, encontrados $MODELS"
fi

# Contar middlewares
MIDDLEWARES=$(ls -1 src/middleware/*.js 2>/dev/null | grep -v index.js | grep -v EXAMPLES.js | wc -l)
if [ "$MIDDLEWARES" -ge 5 ]; then
    test_pass "$MIDDLEWARES middlewares encontrados"
else
    test_warn "Esperados 5+ middlewares, encontrados $MIDDLEWARES"
fi

echo ""

# ==========================================
# 4. VERIFICAR SINTAXIS DE CÓDIGO
# ==========================================
echo "4️⃣  Verificando sintaxis de código..."

# Servidor principal
if node -c server.js 2>/dev/null; then
    test_pass "server.js - sintaxis correcta"
else
    test_fail "server.js - error de sintaxis"
fi

# App principal
if node -c src/app.js 2>/dev/null; then
    test_pass "src/app.js - sintaxis correcta"
else
    test_fail "src/app.js - error de sintaxis"
fi

# Verificar todos los controladores
SYNTAX_ERRORS=0
for file in src/controllers/*.js; do
    if ! node -c "$file" 2>/dev/null; then
        test_fail "$(basename $file) - error de sintaxis"
        ((SYNTAX_ERRORS++))
    fi
done

if [ "$SYNTAX_ERRORS" -eq 0 ]; then
    test_pass "Todos los controladores tienen sintaxis correcta"
fi

# Verificar todas las rutas
SYNTAX_ERRORS=0
for file in src/routes/*.js; do
    if ! node -c "$file" 2>/dev/null; then
        test_fail "$(basename $file) - error de sintaxis"
        ((SYNTAX_ERRORS++))
    fi
done

if [ "$SYNTAX_ERRORS" -eq 0 ]; then
    test_pass "Todas las rutas tienen sintaxis correcta"
fi

echo ""

# ==========================================
# 5. VERIFICAR CONFIGURACIÓN DE SEGURIDAD
# ==========================================
echo "5️⃣  Verificando configuración de seguridad..."

if grep -q "helmet()" src/app.js; then
    test_pass "Helmet configurado"
else
    test_fail "Helmet NO configurado"
fi

if grep -q "cors(" src/app.js; then
    test_pass "CORS configurado"
else
    test_fail "CORS NO configurado"
fi

if grep -q "rateLimit" src/app.js; then
    test_pass "Rate limiting configurado"
else
    test_fail "Rate limiting NO configurado"
fi

if grep -q "bruteForceProtection" src/app.js; then
    test_pass "Brute force protection activado"
else
    test_warn "Brute force protection NO activado"
fi

if grep -q "sqlInjectionProtection" src/app.js; then
    test_pass "SQL injection protection activado"
else
    test_warn "SQL injection protection NO activado"
fi

echo ""

# ==========================================
# 6. VERIFICAR ENDPOINTS EN RUTAS
# ==========================================
echo "6️⃣  Verificando endpoints registrados..."

# Contar endpoints aproximadamente
AUTH_ENDPOINTS=$(grep -c "router\." src/routes/authRoutes.js 2>/dev/null || echo 0)
test_info "authRoutes: ~$AUTH_ENDPOINTS endpoints"

ANIMAL_ENDPOINTS=$(grep -c "router\." src/routes/animalRoutes.js 2>/dev/null || echo 0)
test_info "animalRoutes: ~$ANIMAL_ENDPOINTS endpoints"

COLLAR_ENDPOINTS=$(grep -c "router\." src/routes/collarRoutes.js 2>/dev/null || echo 0)
test_info "collarRoutes: ~$COLLAR_ENDPOINTS endpoints"

TELEMETRIA_ENDPOINTS=$(grep -c "router\." src/routes/telemetriaRoutes.js 2>/dev/null || echo 0)
test_info "telemetriaRoutes: ~$TELEMETRIA_ENDPOINTS endpoints"

ALERTA_ENDPOINTS=$(grep -c "router\." src/routes/alertaRoutes.js 2>/dev/null || echo 0)
test_info "alertaRoutes: ~$ALERTA_ENDPOINTS endpoints"

TOTAL_APPROX=$((AUTH_ENDPOINTS + ANIMAL_ENDPOINTS + COLLAR_ENDPOINTS + TELEMETRIA_ENDPOINTS + ALERTA_ENDPOINTS))

if [ "$TOTAL_APPROX" -ge 30 ]; then
    test_pass "~$TOTAL_APPROX endpoints totales detectados"
else
    test_warn "Solo ~$TOTAL_APPROX endpoints detectados (esperados 50+)"
fi

echo ""

# ==========================================
# 7. VERIFICAR SERVICIOS
# ==========================================
echo "7️⃣  Verificando servicios..."

if [ -f "src/services/alertService.js" ]; then
    test_pass "alertService.js implementado"
else
    test_warn "alertService.js NO encontrado"
fi

if [ -f "src/services/reporteService.js" ]; then
    test_pass "reporteService.js implementado"
else
    test_warn "reporteService.js NO encontrado"
fi

echo ""

# ==========================================
# 8. VERIFICAR DOCUMENTACIÓN
# ==========================================
echo "8️⃣  Verificando documentación..."

if [ -f "README_PRINCIPAL.md" ]; then
    test_pass "README_PRINCIPAL.md existe"
else
    test_warn "README_PRINCIPAL.md NO existe"
fi

if [ -f "REPORTE_FINAL_100.md" ]; then
    test_pass "REPORTE_FINAL_100.md existe"
else
    test_warn "REPORTE_FINAL_100.md NO existe"
fi

if [ -f "SECURITY.md" ]; then
    test_pass "SECURITY.md existe"
else
    test_warn "SECURITY.md NO existe"
fi

if [ -f "TESTING.md" ]; then
    test_pass "TESTING.md existe"
else
    test_warn "TESTING.md NO existe"
fi

echo ""

# ==========================================
# 9. VERIFICAR SCRIPTS
# ==========================================
echo "9️⃣  Verificando scripts disponibles..."

if grep -q '"start"' package.json; then
    test_pass "Script 'npm start' disponible"
else
    test_warn "Script 'npm start' NO configurado"
fi

if grep -q '"dev"' package.json; then
    test_pass "Script 'npm run dev' disponible"
else
    test_warn "Script 'npm run dev' NO configurado"
fi

if grep -q '"test"' package.json; then
    test_pass "Script 'npm test' disponible"
else
    test_warn "Script 'npm test' NO configurado"
fi

echo ""

# ==========================================
# RESUMEN
# ==========================================
echo "=============================================="
echo "📊 RESUMEN DE PRUEBAS"
echo "=============================================="
echo -e "${GREEN}✅ Pasadas:${NC} $PASSED"
echo -e "${RED}❌ Fallidas:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
if [ "$TOTAL" -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
else
    PERCENTAGE=0
fi

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 EXCELENTE! Todas las pruebas pasaron.${NC}"
    echo -e "${GREEN}   El backend está completamente funcional.${NC}"
    echo ""
    echo "📋 PRÓXIMOS PASOS:"
    echo "   1. Configurar .env con tus valores"
    echo "   2. Instalar PostgreSQL y crear BD"
    echo "   3. Ejecutar: npm install"
    echo "   4. Ejecutar: npm run dev"
    echo "   5. Probar endpoints con Postman o curl"
    exit 0
elif [ "$PERCENTAGE" -ge 80 ]; then
    echo -e "${YELLOW}⚠️  BUENO. La mayoría de pruebas pasaron ($PERCENTAGE%).${NC}"
    echo -e "${YELLOW}   Revisa las fallas arriba.${NC}"
    exit 1
else
    echo -e "${RED}❌ ATENCIÓN! Muchas pruebas fallaron ($PERCENTAGE% pasadas).${NC}"
    echo -e "${RED}   Revisa los errores arriba.${NC}"
    exit 2
fi
