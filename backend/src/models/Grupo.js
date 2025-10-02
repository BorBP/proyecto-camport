/**
     * Modelo Grupo - Grupos de animales
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Grupo = sequelize.define('Grupo', {
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
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#3B82F6',
        comment: 'Color hexadecimal para identificar el grupo en el mapa'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
    }, {
    tableName: 'grupos',
    timestamps: true
    });

    module.exports = Grupo;
