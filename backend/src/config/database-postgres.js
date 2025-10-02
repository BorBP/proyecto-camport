 /**
      * Configuración de Sequelize (ORM para PostgreSQL)
      */

     const { Sequelize } = require('sequelize');
     const logger = require('../utils/logger');

     // Crear instancia de Sequelize
     const sequelize = new Sequelize(
       process.env.DB_NAME,
       process.env.DB_USER,
       process.env.DB_PASSWORD,
       {
         host: process.env.DB_HOST,
         port: process.env.DB_PORT || 5432,
         dialect: 'postgres',
         logging: process.env.NODE_ENV === 'development' ? console.log : false,
         pool: {
           max: 5,
           min: 0,
           acquire: 30000,
           idle: 10000
         },
         define: {
           timestamps: true,
           underscored: true
         }
       }
     );

     // Probar conexión
     async function testConnection() {
       try {
         await sequelize.authenticate();
         logger.info('✅ Conexión a PostgreSQL exitosa');
       } catch (error) {
         logger.error('❌ Error conectando a PostgreSQL:', error);
         throw error;
       }
     }

     module.exports = { sequelize, testConnection };
