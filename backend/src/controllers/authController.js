/**
 * Controlador de Autenticación
 * Maneja registro, login, logout y refresh de tokens
 */

const { Usuario } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email ya registrado',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear el usuario (el password se encripta automáticamente por el hook)
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol
    });

    // Generar token JWT
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    logger.info(`Usuario registrado: ${email}`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: usuario.toJSON(), // Sin password
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message
    });
  }
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Usuario inactivo',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador'
      });
    }

    // Verificar la contraseña
    const passwordValida = await usuario.comparePassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar tokens
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    logger.info(`Usuario autenticado: ${email}`);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: {
        usuario: usuario.toJSON(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refrescar token JWT
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verificar el refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: 'Refresh token inválido',
        message: 'El refresh token no es válido o ha expirado'
      });
    }

    // Verificar que sea un refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es un refresh token'
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        error: 'Usuario no válido',
        message: 'El usuario no existe o está inactivo'
      });
    }

    // Generar nuevo access token
    const token = generateToken(usuario);

    res.status(200).json({
      message: 'Token refrescado exitosamente',
      data: {
        token
      }
    });
  } catch (error) {
    logger.error('Error en refresh:', error);
    res.status(500).json({
      error: 'Error al refrescar token',
      message: error.message
    });
  }
};

/**
 * POST /api/auth/logout
 * Cerrar sesión (en el cliente se debe eliminar el token)
 */
const logout = (req, res) => {
  try {
    // En una implementación con refresh token guardados en BD,
    // aquí invalidaríamos el refresh token
    
    res.status(200).json({
      message: 'Sesión cerrada exitosamente',
      note: 'Asegúrate de eliminar el token en el cliente'
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error al cerrar sesión',
      message: error.message
    });
  }
};

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
const getMe = async (req, res) => {
  try {
    // req.user viene del middleware authenticate
    const usuario = await Usuario.findByPk(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    res.status(200).json({
      data: usuario.toJSON()
    });
  } catch (error) {
    logger.error('Error en getMe:', error);
    res.status(500).json({
      error: 'Error al obtener datos del usuario',
      message: error.message
    });
  }
};

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    // Verificar la contraseña actual
    const passwordValida = await usuario.comparePassword(currentPassword);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta',
        message: 'La contraseña actual que proporcionaste es incorrecta'
      });
    }

    // Actualizar la contraseña (se encripta automáticamente por el hook)
    await usuario.update({ 
      password: newPassword,
      passwordChangedAt: new Date() // Para invalidar tokens existentes
    });

    logger.info(`Contraseña cambiada para usuario: ${usuario.email}`);

    res.status(200).json({
      message: 'Contraseña cambiada exitosamente',
      note: 'Deberás iniciar sesión nuevamente con tu nueva contraseña'
    });
  } catch (error) {
    logger.error('Error en changePassword:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword
};
