/**
     * Modelo Usuario - Usuarios del sistema (Administrador/Capataz)
     */

    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');
    const bcrypt = require('bcryptjs');

    const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
        isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'capataz'),
        allowNull: false,
        defaultValue: 'capataz'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp del último cambio de contraseña para invalidar tokens'
    }
    }, {
    tableName: 'usuarios',
    timestamps: true
    });

    // ==========================================
    // HOOKS - Encriptar password antes de guardar
    // ==========================================

    // Factor de costo de bcrypt (10-12 recomendado, mayor = más seguro pero más lento)
    const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

    Usuario.beforeCreate(async (usuario) => {
    if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, BCRYPT_ROUNDS);
    }
    });

    Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, BCRYPT_ROUNDS);
    }
    });

    // ==========================================
    // MÉTODOS DE INSTANCIA
    // ==========================================

    /**
     * Compara password en texto plano con el hash almacenado
     */
    Usuario.prototype.comparePassword = async function(passwordPlano) {
    return await bcrypt.compare(passwordPlano, this.password);
    };

    /**
     * Convierte el usuario a JSON sin incluir el password
     */
    Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
    };

    module.exports = Usuario;
