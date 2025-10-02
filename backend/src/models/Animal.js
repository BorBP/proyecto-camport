/**
     * Modelo Animal - Animales del ganado
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Animal = sequelize.define('Animal', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    identificador: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Número de identificación único del animal (ej: caravana)'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    raza: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    edad_meses: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    peso: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Peso en kilogramos'
    },
    sexo: {
        type: DataTypes.ENUM('macho', 'hembra'),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('activo', 'enfermo', 'vendido', 'muerto'),
        allowNull: false,
        defaultValue: 'activo'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Foreign Keys
    grupo_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'grupos',
        key: 'id'
        }
    },
    collar_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'collares',
        key: 'id'
        }
    },
    potrero_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'potreros',
        key: 'id'
        }
    }
    }, {
    tableName: 'animales',
    timestamps: true
    });

    module.exports = Animal;
