#!/bin/bash

# Script de Verificación de Seguridad - Backend Camport
# Verifica que todas las mejoras de seguridad estén correctamente implementadas

echo "🔐 VERIFICACIÓN DE SEGURIDAD - Backend Camport"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

echo "1️⃣  Verificando archivo .env..."
if [ -f ".env" ]; then
    check "Archivo .env existe"

    # Verificar JWT_SECRET
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2)
    if [ ${#JWT_SECRET} -ge 64 ]; then
        check "JWT_SECRET tiene longitud adecuada (${#JWT_SECRET} chars)"
    else
        echo -e "${RED}❌ FAIL${NC}: JWT_SECRET es muy corto (${#JWT_SECRET} chars, mínimo 64)"
        ((FAILED++))
    fi

    # Verificar CORS_ORIGIN
    if grep -q "^CORS_ORIGIN=" .env; then
        CORS=$(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2)
        if [[ "$CORS" == *"*"* ]]; then
            echo -e "${RED}❌ FAIL${NC}: CORS_ORIGIN contiene wildcard (*)"
            ((FAILED++))
        elif [ -n "$CORS" ]; then
            check "CORS_ORIGIN configurado sin wildcard"
        else
            warn "CORS_ORIGIN está vacío"
        fi
    else
        echo -e "${RED}❌ FAIL${NC}: CORS_ORIGIN no está definido"
        ((FAILED++))
    fi

    # Verificar BCRYPT_ROUNDS
    if grep -q "^BCRYPT_ROUNDS=12" .env; then
        check "BCRYPT_ROUNDS configurado a 12"
    else
        warn "BCRYPT_ROUNDS no está en 12 (usará default 12)"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: Archivo .env no existe"
    echo -e "${YELLOW}   Ejecuta: cp .env.example .env${NC}"
    ((FAILED++))
fi

echo ""
echo "2️⃣  Verificando sintaxis de archivos..."
node -c src/app.js 2>/dev/null
check "src/app.js - Sintaxis correcta"

node -c src/models/Usuario.js 2>/dev/null
check "src/models/Usuario.js - Sintaxis correcta"

node -c src/routes/authRoutes.js 2>/dev/null
check "src/routes/authRoutes.js - Sintaxis correcta"

node -c src/middleware/validationMiddleware.js 2>/dev/null
check "src/middleware/validationMiddleware.js - Sintaxis correcta"

node -c src/middleware/roleMiddleware.js 2>/dev/null
check "src/middleware/roleMiddleware.js - Sintaxis correcta"

echo ""
echo "3️⃣  Verificando middlewares de seguridad en app.js..."
if grep -q "bruteForceProtection" src/app.js; then
    check "bruteForceProtection activado"
else
    echo -e "${RED}❌ FAIL${NC}: bruteForceProtection NO activado"
    ((FAILED++))
fi

if grep -q "sqlInjectionProtection" src/app.js; then
    check "sqlInjectionProtection activado"
else
    echo -e "${RED}❌ FAIL${NC}: sqlInjectionProtection NO activado"
    ((FAILED++))
fi

if grep -q "maliciousHeaderProtection" src/app.js; then
    check "maliciousHeaderProtection activado"
else
    echo -e "${RED}❌ FAIL${NC}: maliciousHeaderProtection NO activado"
    ((FAILED++))
fi

if grep -q "sanitizeInput" src/app.js; then
    check "sanitizeInput activado"
else
    echo -e "${RED}❌ FAIL${NC}: sanitizeInput NO activado"
    ((FAILED++))
fi

if grep -q "validateContentType" src/app.js; then
    check "validateContentType activado"
else
    echo -e "${RED}❌ FAIL${NC}: validateContentType NO activado"
    ((FAILED++))
fi

if grep -q "payloadSizeLimit" src/app.js; then
    check "payloadSizeLimit activado"
else
    echo -e "${RED}❌ FAIL${NC}: payloadSizeLimit NO activado"
    ((FAILED++))
fi

echo ""
echo "4️⃣  Verificando rate limiting específico..."
if grep -q "loginLimiter" src/routes/authRoutes.js; then
    check "loginLimiter configurado"
else
    echo -e "${RED}❌ FAIL${NC}: loginLimiter NO configurado"
    ((FAILED++))
fi

if grep -q "registerLimiter" src/routes/authRoutes.js; then
    check "registerLimiter configurado"
else
    echo -e "${RED}❌ FAIL${NC}: registerLimiter NO configurado"
    ((FAILED++))
fi

echo ""
echo "5️⃣  Verificando Helmet CSP..."
if grep -q "contentSecurityPolicy" src/app.js; then
    check "Content Security Policy configurado"
else
    echo -e "${RED}❌ FAIL${NC}: CSP NO configurado"
    ((FAILED++))
fi

if grep -q "maxAge.*31536000" src/app.js; then
    check "HSTS configurado (1 año)"
else
    warn "HSTS no configurado a 1 año"
fi

echo ""
echo "6️⃣  Verificando HTTPS enforcement..."
if grep -q "x-forwarded-proto.*https" src/app.js; then
    check "HTTPS enforcement implementado"
else
    echo -e "${RED}❌ FAIL${NC}: HTTPS enforcement NO implementado"
    ((FAILED++))
fi

echo ""
echo "7️⃣  Verificando bcrypt rounds..."
if grep -q "BCRYPT_ROUNDS.*12" src/models/Usuario.js; then
    check "Bcrypt rounds = 12 configurado"
else
    echo -e "${RED}❌ FAIL${NC}: Bcrypt rounds NO configurado a 12"
    ((FAILED++))
fi

echo ""
echo "8️⃣  Verificando logging centralizado..."
CONSOLE_ERRORS=$(grep -r "console\.error" src/middleware/validationMiddleware.js src/middleware/roleMiddleware.js 2>/dev/null | wc -l)
if [ "$CONSOLE_ERRORS" -eq 0 ]; then
    check "No hay console.error en middlewares"
else
    echo -e "${RED}❌ FAIL${NC}: Encontrados $CONSOLE_ERRORS console.error en middlewares"
    ((FAILED++))
fi

echo ""
echo "9️⃣  Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    check ".env en .gitignore"
else
    echo -e "${RED}❌ FAIL${NC}: .env NO está en .gitignore"
    ((FAILED++))
fi

if grep -q "\*\.pem" .gitignore; then
    check "Certificados en .gitignore"
else
    warn "Certificados no protegidos en .gitignore"
fi

if grep -q "secrets/" .gitignore; then
    check "Directorio secrets/ en .gitignore"
else
    warn "Directorio secrets/ no protegido"
fi

echo ""
echo "🔟  Verificando dependencias..."
if command -v npm &> /dev/null; then
    VULNS=$(npm audit --production 2>&1 | grep "found.*vulnerabilit" | grep -oE "[0-9]+ vulnerabilit" | grep -oE "[0-9]+")
    if [ -z "$VULNS" ] || [ "$VULNS" -eq 0 ]; then
        check "0 vulnerabilidades en dependencias"
    else
        echo -e "${RED}❌ FAIL${NC}: $VULNS vulnerabilidades encontradas"
        echo -e "${YELLOW}   Ejecuta: npm audit fix${NC}"
        ((FAILED++))
    fi
else
    warn "npm no encontrado, no se puede verificar vulnerabilidades"
fi

echo ""
echo "=============================================="
echo "📊 RESUMEN"
echo "=============================================="
echo -e "${GREEN}✅ Pasadas:${NC} $PASSED"
echo -e "${YELLOW}⚠️  Advertencias:${NC} $WARNINGS"
echo -e "${RED}❌ Fallidas:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 EXCELENTE! Todas las verificaciones pasaron.${NC}"
    echo -e "${GREEN}   El backend está correctamente configurado.${NC}"
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  BUENO. La mayoría de verificaciones pasaron ($PERCENTAGE%).${NC}"
    echo -e "${YELLOW}   Revisa las fallas y advertencias arriba.${NC}"
    exit 1
else
    echo -e "${RED}❌ ATENCIÓN! Demasiadas verificaciones fallaron ($PERCENTAGE% pasadas).${NC}"
    echo -e "${RED}   Por favor revisa las configuraciones de seguridad.${NC}"
    exit 2
fi
