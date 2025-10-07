/**
 * Script de inicialización de la base de datos
 * Configura y sincroniza la base de datos SQLite para Camport
 */

require('dotenv').config();

const { sequelize } = require('./config/database');
const models = require('./models');
const logger = require('./utils/logger');

async function initializeDatabase() {
  try {
    console.log('🚀 Iniciando configuración de base de datos Camport...\n');

    // 1. Probar conexión
    console.log('📡 Probando conexión a SQLite...');
    await sequelize.authenticate();
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
      where: { email: 'admin@camport.local' }
    });

    if (!adminExiste) {
      await Usuario.create({
        nombre: 'Administrador del Sistema',
        email: 'admin@camport.local',
        password: 'Admin123!', // Se encripta automáticamente por el hook
        rol: 'administrador',
        activo: true
      });
      console.log('✅ Usuario administrador creado');
      console.log('   📧 Email: admin@camport.local');
      console.log('   🔑 Password: Admin123!');
    } else {
      console.log('✅ Usuario administrador ya existe');
    }

    console.log('\n🎉 Base de datos configurada exitosamente!');
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: npm run dev');
    console.log('   2. Acceder a: http://localhost:3001/api');
    console.log('   3. Login con: admin@camport.local / Admin123!');
    console.log('   4. Frontend en: http://localhost:5173');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
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
        color: '#10B981',
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
          version_firmware: '1.2.3',
          bateria_actual: 85,
          fecha_instalacion: new Date(),
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
        where: { identificador: `A00${i + 1}` },
        defaults: {
          nombre: nombres[i],
          raza: razas[i],
          sexo: i % 2 === 0 ? 'hembra' : 'macho',
          fecha_nacimiento: new Date(2020 + i, 3, 15),
          edad_meses: (4 - i) * 12,
          peso: 450 + (i * 50),
          estado: 'activo',
          observaciones: `Animal de prueba #${i + 1}`,
          grupo_id: grupo.id,
          potrero_id: potrero.id,
          collar_id: collares[i].id
        }
      });

      if (created) {
        console.log(`   ✅ Animal "${animal.nombre}" creado`);
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