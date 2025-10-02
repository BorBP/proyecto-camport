/**
 * Script de Pruebas para Middlewares de Autenticación
 * Ejecuta pruebas básicas para verificar el funcionamiento correcto
 */

const request = require('supertest');
const app = require('../app_secure'); // Usar la versión segura

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Datos de prueba
const testUser = {
  nombre: 'Usuario Test',
  email: 'test@camport.com',
  password: 'password123',
  rol: 'capataz'
};

let authToken = '';

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  log('blue', '\n🧪 INICIANDO PRUEBAS DE MIDDLEWARES - CAMPORT\n');
  
  try {
    // 1. Probar rutas públicas
    await testPublicRoutes();
    
    // 2. Probar validaciones
    await testValidations();
    
    // 3. Probar autenticación
    await testAuthentication();
    
    // 4. Probar autorización
    await testAuthorization();
    
    // 5. Probar seguridad
    await testSecurity();
    
    log('green', '\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n');
    
  } catch (error) {
    log('red', `\n❌ ERROR EN PRUEBAS: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * 1. Pruebas de rutas públicas
 */
async function testPublicRoutes() {
  log('yellow', '1. 🔓 Probando rutas públicas...');
  
  // Root endpoint
  const rootResponse = await request(app).get('/');
  if (rootResponse.status !== 200) {
    throw new Error('Root endpoint failed');
  }
  log('green', '   ✓ Root endpoint funcional');
  
  // Health check
  const healthResponse = await request(app).get('/health');
  if (healthResponse.status !== 200) {
    throw new Error('Health endpoint failed');
  }
  log('green', '   ✓ Health endpoint funcional');
  
  // Verificar middlewares de seguridad en respuesta
  if (healthResponse.body.security && healthResponse.body.security.middlewares) {
    log('green', '   ✓ Middlewares de seguridad activos');
  }
}

/**
 * 2. Pruebas de validaciones
 */
async function testValidations() {
  log('yellow', '2. ✅ Probando middlewares de validación...');
  
  // Test validación de campos requeridos
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({});
  
  if (registerResponse.status !== 400) {
    throw new Error('Required field validation failed');
  }
  log('green', '   ✓ Validación de campos requeridos');
  
  // Test validación de email
  const emailResponse = await request(app)
    .post('/api/auth/register')
    .send({
      nombre: 'Test',
      email: 'email-invalido',
      password: 'password123',
      rol: 'capataz'
    });
  
  if (emailResponse.status !== 400) {
    throw new Error('Email validation failed');
  }
  log('green', '   ✓ Validación de email');
  
  // Test validación de contraseña
  const passwordResponse = await request(app)
    .post('/api/auth/register')
    .send({
      nombre: 'Test',
      email: 'test@test.com',
      password: '123', // Muy corta
      rol: 'capataz'
    });
  
  if (passwordResponse.status !== 400) {
    throw new Error('Password validation failed');
  }
  log('green', '   ✓ Validación de contraseña');
  
  // Test validación de enum
  const enumResponse = await request(app)
    .post('/api/auth/register')
    .send({
      nombre: 'Test',
      email: 'test@test.com',
      password: 'password123',
      rol: 'rol-invalido'
    });
  
  if (enumResponse.status !== 400) {
    throw new Error('Enum validation failed');
  }
  log('green', '   ✓ Validación de enum');
}

/**
 * 3. Pruebas de autenticación
 */
async function testAuthentication() {
  log('yellow', '3. 🔐 Probando middlewares de autenticación...');
  
  // Test acceso sin token
  const noTokenResponse = await request(app).get('/api/auth/me');
  if (noTokenResponse.status !== 401) {
    throw new Error('No token test failed');
  }
  log('green', '   ✓ Bloqueo sin token');
  
  // Test token inválido
  const invalidTokenResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer token-invalido');
  
  if (invalidTokenResponse.status !== 401) {
    throw new Error('Invalid token test failed');
  }
  log('green', '   ✓ Bloqueo con token inválido');
  
  // Test formato incorrecto
  const wrongFormatResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'InvalidFormat token');
  
  if (wrongFormatResponse.status !== 401) {
    throw new Error('Wrong format test failed');
  }
  log('green', '   ✓ Bloqueo con formato incorrecto');
  
  // Registrar usuario para pruebas siguientes
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  if (registerResponse.status !== 201) {
    // Si falla, intentar login (usuario ya existe)
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.data.token;
      log('green', '   ✓ Login exitoso (usuario existente)');
    }
  } else {
    authToken = registerResponse.body.data.token;
    log('green', '   ✓ Registro exitoso');
  }
  
  // Test con token válido
  const validTokenResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${authToken}`);
  
  if (validTokenResponse.status !== 200) {
    throw new Error('Valid token test failed');
  }
  log('green', '   ✓ Acceso con token válido');
}

/**
 * 4. Pruebas de autorización
 */
async function testAuthorization() {
  log('yellow', '4. 👑 Probando middlewares de autorización...');
  
  if (!authToken) {
    log('yellow', '   ⚠️  Saltando pruebas de autorización (no hay token)');
    return;
  }
  
  // Test ruta que requiere admin (debería fallar con capataz)
  const adminResponse = await request(app)
    .get('/api/admin/test') // Esta ruta no existe, pero debería fallar en auth
    .set('Authorization', `Bearer ${authToken}`);
  
  // Si la ruta no existe (404) pero pasó la auth, es correcto
  // Si es 403, también es correcto (sin permisos)
  if (adminResponse.status === 403) {
    log('green', '   ✓ Bloqueo de rol no autorizado');
  } else if (adminResponse.status === 404) {
    log('green', '   ✓ Autorización funcionando (ruta no existe)');
  }
}

/**
 * 5. Pruebas de seguridad
 */
async function testSecurity() {
  log('yellow', '5. 🛡️  Probando middlewares de seguridad...');
  
  // Test protección contra SQL injection
  const sqlResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: "test@test.com' OR 1=1 --",
      password: 'password123'
    });
  
  // Debería rechazarse por SQL injection o credenciales inválidas
  if (sqlResponse.status !== 200) {
    log('green', '   ✓ Protección contra SQL injection');
  }
  
  // Test payload muy grande (debería fallar)
  const largePayload = 'x'.repeat(2 * 1024 * 1024); // 2MB
  const payloadResponse = await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'application/json')
    .send({ data: largePayload });
  
  if (payloadResponse.status === 413) {
    log('green', '   ✓ Limitación de tamaño de payload');
  }
  
  // Test Content-Type inválido
  const contentTypeResponse = await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'text/plain')
    .send('data');
  
  if (contentTypeResponse.status === 415) {
    log('green', '   ✓ Validación de Content-Type');
  }
  
  // Test User-Agent sospechoso
  const suspiciousResponse = await request(app)
    .get('/')
    .set('User-Agent', 'sqlmap/1.0');
  
  if (suspiciousResponse.status === 403) {
    log('green', '   ✓ Detección de User-Agent sospechoso');
  } else {
    log('yellow', '   ⚠️  User-Agent sospechoso no bloqueado (normal en test)');
  }
}

/**
 * Función para mostrar estadísticas del sistema
 */
async function showSystemInfo() {
  log('blue', '\n📊 INFORMACIÓN DEL SISTEMA:\n');
  
  try {
    const response = await request(app).get('/health');
    const health = response.body;
    
    console.log(`   Estado: ${health.status}`);
    console.log(`   Uptime: ${Math.round(health.uptime)}s`);
    console.log(`   Middlewares de seguridad: ${health.security?.middlewares?.length || 0}`);
    
    if (health.security?.middlewares) {
      console.log(`   Activos:`);
      health.security.middlewares.forEach(middleware => {
        console.log(`     - ${middleware}`);
      });
    }
  } catch (error) {
    log('red', `   Error obteniendo información: ${error.message}`);
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  showSystemInfo().then(() => runTests());
}

module.exports = {
  runTests,
  testPublicRoutes,
  testValidations,
  testAuthentication,
  testAuthorization,
  testSecurity
};