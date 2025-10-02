/**
 * Script de inicialización de la base de datos
 * Configura y sincroniza la base de datos PostgreSQL para Camport
 */

require('dotenv').config();

const { sequelize, testConnection } = require('./src/config/database');
const models = require('./src/models');
const logger = require('./src/utils/logger');

async function initializeDatabase() {
  try {
    console.log('🚀 Iniciando configuración de base de datos Camport...\n');

    // 1. Probar conexión
    console.log('📡 Probando conexión a PostgreSQL...');
    await testConnection();
    console.log('✅ Conexión exitosa\n');

    // 2. Sincronizar modelos
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ 
      force: false, // No eliminar tablas existentes
      alter: true   // Alterar tablas para coincidir con modelos
    });
    console.log('✅ Modelos sincronizados\n');

    // 3. Verificar tablas creadas
    console.log('📋 Verificando tablas creadas:');
    const tablas = await sequelize.getQueryInterface().showAllTables();
    tablas.forEach(tabla => {
      console.log(`   ✅ ${tabla}`);
    });
    console.log(`\n📊 Total de tablas: ${tablas.length}\n`);

    // 4. Crear usuario administrador por defecto si no existe
    console.log('👤 Verificando usuario administrador...');
    const { Usuario } = models;
    const adminExiste = await Usuario.findOne({
      where: { email: 'admin@camport.com' }
    });

    if (!adminExiste) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@camport.com',
        password: hashedPassword,
        rol: 'administrador',
        activo: true
      });
      console.log('✅ Usuario administrador creado');
      console.log('   📧 Email: admin@camport.com');
      console.log('   🔑 Password: admin123');
    } else {
      console.log('✅ Usuario administrador ya existe');
    }

    console.log('\n🎉 Base de datos configurada exitosamente!');
    console.log('\n📋 INFORMACIÓN DE CONEXIÓN:');
    console.log(`   🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   🔢 Puerto: ${process.env.DB_PORT || '5432'}`);
    console.log(`   📚 Base de datos: ${process.env.DB_NAME || 'camport'}`);
    console.log(`   👤 Usuario: ${process.env.DB_USER || 'postgres'}`);

    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: npm run dev');
    console.log('   2. Acceder a: http://localhost:3000');
    console.log('   3. Login con: admin@camport.com / admin123');
    console.log('   4. Configurar datos de prueba (animales, collares, potreros)');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n🔧 SOLUCIÓN:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose');
      console.log('   2. Crear la base de datos "camport":');
      console.log('      CREATE DATABASE camport;');
      console.log('   3. Verificar credenciales en archivo .env');
    }
    
    process.exit(1);
  }
}

async function createTestData() {
  try {
    console.log('\n📦 Creando datos de prueba...');
    
    const { Potrero, Collar, Animal, Grupo } = models;

    // Crear grupo de prueba
    const [grupo, grupoCreated] = await Grupo.findOrCreate({
      where: { nombre: 'Grupo Principal' },
      defaults: {
        descripcion: 'Grupo de prueba para el sistema Camport',
        color: '#2ecc71',
        activo: true
      }
    });

    if (grupoCreated) {
      console.log('   ✅ Grupo "Grupo Principal" creado');
    }

    // Crear potrero de prueba
    const [potrero, potreroCreated] = await Potrero.findOrCreate({
      where: { nombre: 'Potrero Norte' },
      defaults: {
        descripcion: 'Potrero de prueba en la zona norte',
        coordenadas: [
          { lat: -33.4569, lng: -70.6483 },
          { lat: -33.4570, lng: -70.6480 },
          { lat: -33.4575, lng: -70.6485 },
          { lat: -33.4574, lng: -70.6488 }
        ],
        area: 2.5,
        capacidad_maxima: 50,
        tipo_pasto: 'Kikuyo',
        activo: true
      }
    });

    if (potreroCreated) {
      console.log('   ✅ Potrero "Potrero Norte" creado');
    }

    // Crear collares de prueba
    const collares = [];
    for (let i = 1; i <= 3; i++) {
      const [collar, created] = await Collar.findOrCreate({
        where: { identificador: `COL-00${i}` },
        defaults: {
          modelo: 'SmartCollar Pro',
          numero_serie: `SC${1000 + i}`,
          version_firmware: '1.2.3',
          frecuencia_envio: 60,
          umbral_bateria_baja: 20,
          umbral_temperatura_alta: 39.5,
          bateria_actual: 85,
          estado: 'inactivo',
          activo: true
        }
      });

      if (created) {
        console.log(`   ✅ Collar "${collar.identificador}" creado`);
      }
      collares.push(collar);
    }

    // Crear animales de prueba
    const razas = ['Holstein', 'Angus', 'Hereford'];
    const nombres = ['Bella', 'Mango', 'Luna', 'Thor', 'Princesa'];
    
    for (let i = 0; i < 3; i++) {
      const [animal, created] = await Animal.findOrCreate({
        where: { identificacion: `A00${i + 1}` },
        defaults: {
          nombre: nombres[i],
          raza: razas[i],
          sexo: i % 2 === 0 ? 'hembra' : 'macho',
          fecha_nacimiento: new Date(2020 + i, 3, 15),
          edad: 4 - i,
          peso: 450 + (i * 50),
          color: i === 0 ? 'Negro con blanco' : i === 1 ? 'Rojo' : 'Marrón',
          estado_salud: 'saludable',
          grupo_id: grupo.id,
          potrero_id: potrero.id,
          collar_id: collares[i].id,
          activo: true
        }
      });

      if (created) {
        console.log(`   ✅ Animal "${animal.nombre}" creado`);
        
        // Actualizar collar con animal_id
        await collares[i].update({ 
          animal_id: animal.id,
          estado: 'activo'
        });
      }
    }

    console.log('✅ Datos de prueba creados exitosamente!');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--with-test-data')) {
    await initializeDatabase();
    await createTestData();
  } else {
    await initializeDatabase();
  }

  process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initializeDatabase, createTestData };