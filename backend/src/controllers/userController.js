
/**
 * Controlador de Usuarios
 * Maneja la lógica de negocio para la gestión de usuarios (CRUD).
 */

const { Usuario } = require('../models');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users
 * Listar todos los usuarios con filtros y paginación.
 * Acceso: Solo Administradores.
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, rol, activo, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (rol) where.rol = rol;
    if (activo !== undefined) where.activo = activo;
    if (search) {
      where.nombre = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const usuarios = await Usuario.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] }, // Nunca exponer el hash de la contraseña
      order: [['nombre', 'ASC']]
    });

    res.status(200).json({
      data: usuarios.rows,
      pagination: {
        total: usuarios.count,
        pages: Math.ceil(usuarios.count / limit),
        currentPage: parseInt(page),
      }
    });
  } catch (error) {
    logger.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * GET /api/users/:id
 * Obtener un usuario específico por su ID.
 * Acceso: Propietario o Administrador.
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ data: usuario });
  } catch (error) {
    logger.error(`Error al obtener usuario ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /api/users
 * Crear un nuevo usuario.
 * Acceso: Solo Administradores.
 */
const create = async (req, res) => {
  try {
    const { nombre, email, password, rol, activo } = req.body;

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol,
      activo
    });

    const usuarioData = nuevoUsuario.toJSON();
    delete usuarioData.password;

    res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      data: usuarioData 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }
    logger.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * PUT /api/users/:id
 * Actualizar un usuario existente.
 * Acceso: Propietario o Administrador.
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Solo un admin puede cambiar el rol o el estado de otro usuario
    if (req.user.id !== id && req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'No tienes permiso para modificar a este usuario.' });
    }
    if ((rol || activo !== undefined) && req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'Solo los administradores pueden cambiar el rol o estado de un usuario.' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    if (rol) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;

    await usuario.save();

    const usuarioData = usuario.toJSON();
    delete usuarioData.password;

    res.status(200).json({ 
      message: 'Usuario actualizado exitosamente', 
      data: usuarioData 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }
    logger.error(`Error al actualizar usuario ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * DELETE /api/users/:id
 * Eliminar un usuario.
 * Acceso: Solo Administradores.
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    logger.error(`Error al eliminar usuario ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * PATCH /api/users/:id/password
 * Cambiar la contraseña de un usuario.
 * Acceso: Propietario del perfil o Administrador.
 */
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar contraseña actual
    const isValidPassword = await usuario.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar con nueva contraseña
    usuario.password = newPassword;
    await usuario.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    logger.error(`Error al cambiar contraseña del usuario ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * PATCH /api/users/:id/activate
 * Activar o desactivar un usuario.
 * Acceso: Solo Administradores.
 */
const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    // Validar que activo sea boolean
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ 
        error: 'Campo inválido', 
        message: 'El campo "activo" debe ser true o false' 
      });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir desactivarse a sí mismo
    if (req.user.id === id && !activo) {
      return res.status(400).json({ 
        error: 'No puedes desactivarte a ti mismo.' 
      });
    }

    usuario.activo = activo;
    await usuario.save();

    const usuarioData = usuario.toJSON();
    delete usuarioData.password;

    res.status(200).json({ 
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      data: usuarioData
    });
  } catch (error) {
    logger.error(`Error al cambiar estado del usuario ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  changePassword,
  toggleActive
};
