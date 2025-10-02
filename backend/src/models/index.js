/**
 * Índice de modelos - Importa todos los modelos y establece relaciones
 */

const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Animal = require('./Animal');
const Grupo = require('./Grupo');
const Potrero = require('./Potrero');
const Collar = require('./Collares');
const Telemetria = require('./Telemetria');
const Alerta = require('./Alerta');

// ==========================================
// RELACIONES ENTRE MODELOS
// ==========================================

// Usuario - Alerta (usuario que atiende la alerta)
Usuario.hasMany(Alerta, {
foreignKey: 'atendido_por',
as: 'alertas_atendidas'
});
Alerta.belongsTo(Usuario, {
foreignKey: 'atendido_por',
as: 'usuario_atencion'
});

// Grupo - Animal (un grupo tiene muchos animales)
Grupo.hasMany(Animal, {
foreignKey: 'grupo_id',
as: 'animales'
});
Animal.belongsTo(Grupo, {
foreignKey: 'grupo_id',
as: 'grupo'
});

// Potrero - Animal (un potrero puede tener muchos animales)
Potrero.hasMany(Animal, {
foreignKey: 'potrero_id',
as: 'animales'
});
Animal.belongsTo(Potrero, {
foreignKey: 'potrero_id',
as: 'potrero'
});

// Collar - Animal (relación uno a uno)
Collar.hasOne(Animal, {
foreignKey: 'collar_id',
as: 'animal'
});
Animal.belongsTo(Collar, {
foreignKey: 'collar_id',
as: 'collar'
});

// Collar - Telemetria (un collar genera mucha telemetría)
Collar.hasMany(Telemetria, {
foreignKey: 'collar_id',
as: 'telemetrias'
});
Telemetria.belongsTo(Collar, {
foreignKey: 'collar_id',
as: 'collar'
});

// Animal - Telemetria (a través del collar)
Animal.hasMany(Telemetria, {
foreignKey: 'animal_id',
as: 'telemetrias'
});
Telemetria.belongsTo(Animal, {
foreignKey: 'animal_id',
as: 'animal'
});

// Animal - Alerta (un animal puede tener muchas alertas)
Animal.hasMany(Alerta, {
foreignKey: 'animal_id',
as: 'alertas'
});
Alerta.belongsTo(Animal, {
foreignKey: 'animal_id',
as: 'animal'
});

// ==========================================
// EXPORTAR MODELOS
// ==========================================

module.exports = {
sequelize,
Usuario,
Animal,
Grupo,
Potrero,
Collar,
Telemetria,
Alerta
};
