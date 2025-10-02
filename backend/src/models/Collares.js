/**
     * Modelo Collar - Collares IoT con sensores
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Collar = sequelize.define('Collar', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    identificador: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'ID único del collar (ej: COL-001)'
    },
    modelo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'SIM-V1'
    },
    version_firmware: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '1.0.0'
    },
    bateria_actual: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 100,
        comment: 'Nivel de batería en porcentaje (0-100)'
    },
    fecha_instalacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ultima_conexion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Foreign Key
    animal_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'animales',
        key: 'id'
        }
    }
    }, {
    tableName: 'collares',
    timestamps: true
    });

    module.exports = Collar;
