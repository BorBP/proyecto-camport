/**
 * Controlador de Grupos de Animales
 * Gestión de agrupaciones de ganado para organización y manejo
 */

const { Grupo, Animal, Potrero } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/grupos
 * Listar todos los grupos con paginación
 */
const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      activo = true 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros opcionales
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (activo !== undefined) where.activo = activo === 'true';

    const grupos = await Grupo.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']],
      include: [
        {
          model: Animal,
          as: 'animales',
          where: { activo: true },
          required: false,
          attributes: ['id', 'nombre', 'identificacion', 'sexo', 'edad', 'estado_salud']
        }
      ]
    });

    // Agregar estadísticas por grupo
    const gruposConStats = grupos.rows.map(grupo => {
      const grupoData = grupo.toJSON();
      const animales = grupoData.animales || [];
      
      grupoData.estadisticas = {
        total_animales: animales.length,
        por_sexo: {
          machos: animales.filter(a => a.sexo === 'macho').length,
          hembras: animales.filter(a => a.sexo === 'hembra').length
        },
        por_estado_salud: {
          saludables: animales.filter(a => a.estado_salud === 'saludable').length,
          enfermos: animales.filter(a => a.estado_salud === 'enfermo').length,
          en_tratamiento: animales.filter(a => a.estado_salud === 'en_tratamiento').length
        },
        edad_promedio: animales.length > 0 ? 
          animales.filter(a => a.edad).reduce((sum, a) => sum + a.edad, 0) / 
          animales.filter(a => a.edad).length || 0 : 0
      };
      
      return grupoData;
    });

    res.status(200).json({
      data: gruposConStats,
      pagination: {
        total: grupos.count,
        pages: Math.ceil(grupos.count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener grupos:', error);
    res.status(500).json({
      error: 'Error al obtener grupos',
      message: error.message
    });
  }
};

/**
 * GET /api/grupos/:id
 * Obtener un grupo específico con sus animales
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const grupo = await Grupo.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animales',
          where: { activo: true },
          required: false,
          include: [
            {
              model: Potrero,
              as: 'potrero',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });

    if (!grupo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: `No existe un grupo con ID ${id}`
      });
    }

    const grupoData = grupo.toJSON();
    const animales = grupoData.animales || [];
    
    // Calcular estadísticas detalladas
    grupoData.estadisticas = {
      total_animales: animales.length,
      por_sexo: {
        machos: animales.filter(a => a.sexo === 'macho').length,
        hembras: animales.filter(a => a.sexo === 'hembra').length
      },
      por_estado_salud: {
        saludables: animales.filter(a => a.estado_salud === 'saludable').length,
        enfermos: animales.filter(a => a.estado_salud === 'enfermo').length,
        en_tratamiento: animales.filter(a => a.estado_salud === 'en_tratamiento').length,
        recuperacion: animales.filter(a => a.estado_salud === 'recuperacion').length
      },
      por_potrero: animales.reduce((acc, animal) => {
        const potrero = animal.potrero?.nombre || 'Sin asignar';
        acc[potrero] = (acc[potrero] || 0) + 1;
        return acc;
      }, {}),
      edad_promedio: animales.length > 0 ? 
        animales.filter(a => a.edad).reduce((sum, a) => sum + a.edad, 0) / 
        animales.filter(a => a.edad).length || 0 : 0,
      peso_promedio: animales.length > 0 ? 
        animales.filter(a => a.peso).reduce((sum, a) => sum + a.peso, 0) / 
        animales.filter(a => a.peso).length || 0 : 0
    };

    res.status(200).json({
      data: grupoData
    });

  } catch (error) {
    logger.error('Error al obtener grupo:', error);
    res.status(500).json({
      error: 'Error al obtener grupo',
      message: error.message
    });
  }
};

/**
 * POST /api/grupos
 * Crear un nuevo grupo
 */
const create = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      color = '#3498db',
      observaciones
    } = req.body;

    // Verificar que no exista otro grupo con el mismo nombre
    const nombreExiste = await Grupo.findOne({
      where: { nombre }
    });

    if (nombreExiste) {
      return res.status(409).json({
        error: 'Nombre duplicado',
        message: `Ya existe un grupo con el nombre "${nombre}"`
      });
    }

    const grupo = await Grupo.create({
      nombre,
      descripcion,
      color,
      observaciones,
      activo: true
    });

    logger.info(`Grupo creado: ${nombre} (ID: ${grupo.id})`, {
      userId: req.user.id,
      grupoId: grupo.id
    });

    res.status(201).json({
      message: 'Grupo creado exitosamente',
      data: grupo
    });

  } catch (error) {
    logger.error('Error al crear grupo:', error);
    res.status(500).json({
      error: 'Error al crear grupo',
      message: error.message
    });
  }
};

/**
 * PUT /api/grupos/:id
 * Actualizar un grupo existente
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      color,
      observaciones,
      activo
    } = req.body;

    const grupo = await Grupo.findByPk(id);
    if (!grupo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: `No existe un grupo con ID ${id}`
      });
    }

    // Verificar nombre único (excluyendo el grupo actual)
    if (nombre && nombre !== grupo.nombre) {
      const nombreExiste = await Grupo.findOne({
        where: { 
          nombre,
          id: { [Op.ne]: id }
        }
      });

      if (nombreExiste) {
        return res.status(409).json({
          error: 'Nombre duplicado',
          message: `Ya existe otro grupo con el nombre "${nombre}"`
        });
      }
    }

    // Actualizar el grupo
    await grupo.update({
      nombre: nombre || grupo.nombre,
      descripcion: descripcion !== undefined ? descripcion : grupo.descripcion,
      color: color || grupo.color,
      observaciones: observaciones !== undefined ? observaciones : grupo.observaciones,
      activo: activo !== undefined ? activo : grupo.activo
    });

    logger.info(`Grupo actualizado: ${grupo.nombre} (ID: ${id})`, {
      userId: req.user.id,
      grupoId: id
    });

    res.status(200).json({
      message: 'Grupo actualizado exitosamente',
      data: grupo
    });

  } catch (error) {
    logger.error('Error al actualizar grupo:', error);
    res.status(500).json({
      error: 'Error al actualizar grupo',
      message: error.message
    });
  }
};

/**
 * DELETE /api/grupos/:id
 * Eliminar un grupo
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const grupo = await Grupo.findByPk(id);
    if (!grupo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: `No existe un grupo con ID ${id}`
      });
    }

    // Verificar si tiene animales asignados
    const animalesAsignados = await Animal.count({
      where: { 
        grupo_id: id,
        activo: true
      }
    });

    if (animalesAsignados > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar',
        message: `El grupo tiene ${animalesAsignados} animales asignados. Muévalos antes de eliminar el grupo.`,
        animales_asignados: animalesAsignados
      });
    }

    // Soft delete para preservar datos históricos
    await grupo.update({ activo: false });

    logger.info(`Grupo desactivado: ${grupo.nombre} (ID: ${id})`, {
      userId: req.user.id,
      grupoId: id
    });

    res.status(200).json({
      message: 'Grupo desactivado exitosamente',
      note: 'El grupo se mantuvo en el sistema para preservar datos históricos'
    });

  } catch (error) {
    logger.error('Error al eliminar grupo:', error);
    res.status(500).json({
      error: 'Error al eliminar grupo',
      message: error.message
    });
  }
};

/**
 * POST /api/grupos/:id/asignar-animales
 * Asignar animales a un grupo
 */
const asignarAnimales = async (req, res) => {
  try {
    const { id } = req.params;
    const { animal_ids } = req.body;

    if (!Array.isArray(animal_ids) || animal_ids.length === 0) {
      return res.status(400).json({
        error: 'IDs de animales requeridos',
        message: 'Se debe proporcionar un array de IDs de animales'
      });
    }

    const grupo = await Grupo.findByPk(id);
    if (!grupo || !grupo.activo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: 'El grupo no existe o no está activo'
      });
    }

    // Verificar que todos los animales existen y están activos
    const animales = await Animal.findAll({
      where: {
        id: { [Op.in]: animal_ids },
        activo: true
      }
    });

    if (animales.length !== animal_ids.length) {
      const animalesEncontrados = animales.map(a => a.id);
      const animalesNoEncontrados = animal_ids.filter(id => !animalesEncontrados.includes(id));
      
      return res.status(404).json({
        error: 'Algunos animales no fueron encontrados',
        animales_no_encontrados: animalesNoEncontrados
      });
    }

    // Asignar animales al grupo
    await Animal.update(
      { grupo_id: id },
      { where: { id: { [Op.in]: animal_ids } } }
    );

    logger.info(`${animales.length} animales asignados al grupo ${grupo.nombre}`, {
      userId: req.user.id,
      grupoId: id,
      animalIds: animal_ids
    });

    res.status(200).json({
      message: `${animales.length} animales asignados exitosamente al grupo ${grupo.nombre}`,
      animales_asignados: animales.map(a => ({
        id: a.id,
        nombre: a.nombre,
        identificacion: a.identificacion
      }))
    });

  } catch (error) {
    logger.error('Error al asignar animales al grupo:', error);
    res.status(500).json({
      error: 'Error al asignar animales',
      message: error.message
    });
  }
};

/**
 * POST /api/grupos/:id/remover-animales
 * Remover animales de un grupo
 */
const removerAnimales = async (req, res) => {
  try {
    const { id } = req.params;
    const { animal_ids } = req.body;

    if (!Array.isArray(animal_ids) || animal_ids.length === 0) {
      return res.status(400).json({
        error: 'IDs de animales requeridos',
        message: 'Se debe proporcionar un array de IDs de animales'
      });
    }

    const grupo = await Grupo.findByPk(id);
    if (!grupo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: `No existe un grupo con ID ${id}`
      });
    }

    // Verificar que los animales están en el grupo
    const animales = await Animal.findAll({
      where: {
        id: { [Op.in]: animal_ids },
        grupo_id: id,
        activo: true
      }
    });

    if (animales.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron animales',
        message: 'Ninguno de los animales especificados está en este grupo'
      });
    }

    // Remover animales del grupo (grupo_id = null)
    await Animal.update(
      { grupo_id: null },
      { where: { id: { [Op.in]: animales.map(a => a.id) } } }
    );

    logger.info(`${animales.length} animales removidos del grupo ${grupo.nombre}`, {
      userId: req.user.id,
      grupoId: id,
      animalIds: animales.map(a => a.id)
    });

    res.status(200).json({
      message: `${animales.length} animales removidos exitosamente del grupo ${grupo.nombre}`,
      animales_removidos: animales.map(a => ({
        id: a.id,
        nombre: a.nombre,
        identificacion: a.identificacion
      }))
    });

  } catch (error) {
    logger.error('Error al remover animales del grupo:', error);
    res.status(500).json({
      error: 'Error al remover animales',
      message: error.message
    });
  }
};

/**
 * POST /api/grupos/:id/mover-potrero
 * Mover todo el grupo a otro potrero
 */
const moverAPotrero = async (req, res) => {
  try {
    const { id } = req.params;
    const { potrero_id } = req.body;

    const grupo = await Grupo.findByPk(id);
    if (!grupo || !grupo.activo) {
      return res.status(404).json({
        error: 'Grupo no encontrado',
        message: 'El grupo no existe o no está activo'
      });
    }

    // Verificar que el potrero existe
    if (potrero_id) {
      const potrero = await Potrero.findByPk(potrero_id);
      if (!potrero || !potrero.activo) {
        return res.status(404).json({
          error: 'Potrero no encontrado',
          message: 'El potrero no existe o no está activo'
        });
      }
    }

    // Obtener animales del grupo
    const animales = await Animal.findAll({
      where: {
        grupo_id: id,
        activo: true
      }
    });

    if (animales.length === 0) {
      return res.status(400).json({
        error: 'Grupo vacío',
        message: 'El grupo no tiene animales para mover'
      });
    }

    // Mover todos los animales al nuevo potrero
    await Animal.update(
      { potrero_id: potrero_id || null },
      { where: { grupo_id: id, activo: true } }
    );

    const nombrePotrero = potrero_id ? 
      (await Potrero.findByPk(potrero_id)).nombre : 'Sin asignar';

    logger.info(`Grupo ${grupo.nombre} movido a potrero ${nombrePotrero}`, {
      userId: req.user.id,
      grupoId: id,
      potreroId: potrero_id,
      animalesMovidos: animales.length
    });

    res.status(200).json({
      message: `Grupo ${grupo.nombre} movido exitosamente`,
      destino: nombrePotrero,
      animales_movidos: animales.length
    });

  } catch (error) {
    logger.error('Error al mover grupo a potrero:', error);
    res.status(500).json({
      error: 'Error al mover grupo',
      message: error.message
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  asignarAnimales,
  removerAnimales,
  moverAPotrero
};