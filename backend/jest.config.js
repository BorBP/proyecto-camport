/**
 * Configuración de Jest para el Backend de Camport
 * Test-Driven Development (TDD)
 */

module.exports = {
  // Entorno de ejecución de los tests
  testEnvironment: 'node',

  // Directorio raíz de los tests
  roots: ['<rootDir>/src'],

  // Patrones para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/config/**',
    '!src/init-database.js',
    '!node_modules/**'
  ],

  // Umbral mínimo de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Directorio de salida del coverage
  coverageDirectory: '<rootDir>/coverage',

  // Reportes de coverage
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Setup antes de ejecutar los tests
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],

  // Tiempo máximo de ejecución por test (10 segundos)
  testTimeout: 10000,

  // Modo verbose para más detalles
  verbose: true,

  // Limpiar mocks automáticamente entre tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Variables de entorno para tests
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};
