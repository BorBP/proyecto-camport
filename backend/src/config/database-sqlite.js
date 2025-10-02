/**
 * Configuración de Sequelize para SQLite (Desarrollo/Demo)
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Crear instancia de Sequelize para SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../camport.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Probar conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a SQLite:', error);
    throw error;
  }
}

module.exports = { sequelize, testConnection };