/**
     * Modelo Potrero - Geocercas/Potreros del predio
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Potrero = sequelize.define('Potrero', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    coordenadas: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array de objetos {lat, lng} que definen el polígono de la geocerca'
    },
    area: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Área en hectáreas'
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#10B981'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
    }, {
    tableName: 'potreros',
    timestamps: true
    });

    module.exports = Potrero;
