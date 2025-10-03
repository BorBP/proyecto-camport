/**
 * Setup global para tests
 * Configuración que se ejecuta antes de todos los tests
 */

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-only-do-not-use-in-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jwt-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '4'; // Menor para tests más rápidos
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:'; // Base de datos en memoria para tests
process.env.CORS_ORIGIN = 'http://localhost:3001';

// Timeout global para tests
jest.setTimeout(10000);

// Mock de console para tests más limpios (opcional)
global.console = {
  ...console,
  // Descomenta estas líneas si quieres silenciar logs en tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Función helper para esperar
global.wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para limpiar base de datos entre tests
global.cleanDatabase = async (sequelize) => {
  if (sequelize) {
    await sequelize.sync({ force: true });
  }
};
