/**
     * Modelo Alerta - Alertas del sistema
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');

    const Alerta = sequelize.define('Alerta', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tipo: {
        type: DataTypes.ENUM('fuga', 'bateria_baja', 'inactividad', 'fiebre', 'otro'),
        allowNull: false
    },
    severidad: {
        type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media'
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('nueva', 'en_gestion', 'atendida', 'descartada'),
        allowNull: false,
        defaultValue: 'nueva'
    },
    datos_adicionales: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos extra: coordenadas, valores de sensores, etc.'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    atendida_en: {
        type: DataTypes.DATE,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Foreign Keys
    animal_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: 'animales',
        key: 'id'
        }
    },
    atendido_por: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'usuarios',
        key: 'id'
        }
    }
    }, {
    tableName: 'alertas',
    timestamps: true,
    indexes: [
        {
        fields: ['tipo', 'estado']
        },
        {
        fields: ['animal_id', 'timestamp']
        }
    ]
    });

    module.exports = Alerta;
