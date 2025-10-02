/**
     * Modelo Telemetria - Datos de sensores en tiempo real
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Telemetria = sequelize.define('Telemetria', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    latitud: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
        min: -90,
        max: 90
        }
    },
    longitud: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
        min: -180,
        max: 180
        }
    },
    altitud: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Altitud en metros'
    },
    precision: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Precisión del GPS en metros'
    },
    bateria: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Nivel de batería (0-100)'
    },
    temperatura: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Temperatura corporal en °C'
    },
    actividad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Nivel de actividad (0-100)'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Foreign Keys
    collar_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: 'collares',
        key: 'id'
        }
    },
    animal_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'animales',
        key: 'id'
        }
    }
    }, {
    tableName: 'telemetrias',
    timestamps: false,
    indexes: [
        {
        fields: ['collar_id', 'timestamp']
        },
        {
        fields: ['animal_id', 'timestamp']
        }
    ]
    });

    module.exports = Telemetria;
