/**
 * Controlador de Animales
 * RF2: Gestión de animales y grupos
 * Registrar, editar, eliminar y organizar animales en grupos
 */

const { Animal, Grupo, Collar, Potrero, Telemetria, Alerta } = require('../models');
const { logCRUDActivity } = require('../middleware');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/animales
 * Listar todos los animales con paginación
 */
const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      grupo_id, 
      potrero_id, 
      sexo,
      activo = true 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros opcionales
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { raza: { [Op.iLike]: `%${search}%` } },
        { identificacion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (grupo_id) where.grupo_id = grupo_id;
    if (potrero_id) where.potrero_id = potrero_id;
    if (sexo) where.sexo = sexo;
    if (activo !== undefined) where.activo = activo === 'true';

    const animales = await Animal.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']],
      include: [
        {
          model: Grupo,
          as: 'grupo',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Potrero,
          as: 'potrero',
          attributes: ['id', 'nombre', 'area']
        },
        {
          model: Collar,
          as: 'collar',
          attributes: ['id', 'identificador', 'modelo', 'bateria_actual', 'activo']
        }
      ]
    });

    res.status(200).json({
      data: animales.rows,
      pagination: {
        total: animales.count,
        pages: Math.ceil(animales.count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener animales:', error);
    res.status(500).json({
      error: 'Error al obtener animales',
      message: error.message
    });
  }
};

/**
 * GET /api/animales/:id
 * Obtener un animal específico con sus relaciones
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await Animal.findByPk(id, {
      include: [
        {
          model: Grupo,
          as: 'grupo',
          attributes: ['id', 'nombre', 'descripcion', 'color']
        },
        {
          model: Potrero,
          as: 'potrero',
          attributes: ['id', 'nombre', 'area', 'coordenadas']
        },
        {
          model: Collar,
          as: 'collar',
          attributes: ['id', 'identificador', 'modelo', 'bateria_actual', 'ultima_conexion', 'activo']
        }
      ]
    });

    if (!animal) {
      return res.status(404).json({
        error: 'Animal no encontrado',
        message: `No existe un animal con ID ${id}`
      });
    }

    // Obtener estadísticas básicas del animal
    const stats = await getAnimalStats(id);

    res.status(200).json({
      data: {
        ...animal.toJSON(),
        estadisticas: stats
      }
    });

  } catch (error) {
    logger.error('Error al obtener animal:', error);
    res.status(500).json({
      error: 'Error al obtener animal',
      message: error.message
    });
  }
};

/**
 * POST /api/animales
 * Crear un nuevo animal
 */
const create = async (req, res) => {
  try {
    const {
      nombre,
      identificacion,
      raza,
      sexo,
      fecha_nacimiento,
      peso,
      color,
      estado_salud = 'saludable',
      grupo_id,
      potrero_id,
      collar_id,
      observaciones
    } = req.body;

    // Verificar que no exista otra identificación igual
    if (identificacion) {
      const existeIdentificacion = await Animal.findOne({
        where: { identificacion }
      });

      if (existeIdentificacion) {
        return res.status(409).json({
          error: 'Identificación duplicada',
          message: `Ya existe un animal con la identificación ${identificacion}`
        });
      }
    }

    // Verificar que el collar no esté asignado a otro animal
    if (collar_id) {
      const collarAsignado = await Animal.findOne({
        where: { 
          collar_id,
          activo: true,
          id: { [Op.ne]: null }
        }
      });

      if (collarAsignado) {
        return res.status(409).json({
          error: 'Collar ya asignado',
          message: `El collar ya está asignado al animal ${collarAsignado.nombre}`
        });
      }

      // Verificar que el collar existe y está activo
      const collar = await Collar.findByPk(collar_id);
      if (!collar || !collar.activo) {
        return res.status(404).json({
          error: 'Collar no válido',
          message: 'El collar especificado no existe o no está activo'
        });
      }
    }

    // Calcular edad si hay fecha de nacimiento
    let edad = null;
    if (fecha_nacimiento) {
      const today = new Date();
      const birthDate = new Date(fecha_nacimiento);
      edad = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    }

    const animal = await Animal.create({
      nombre,
      identificacion,
      raza,
      sexo,
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
      edad,
      peso,
      color,
      estado_salud,
      grupo_id: grupo_id || null,
      potrero_id: potrero_id || null,
      collar_id: collar_id || null,
      observaciones,
      activo: true
    });

    // Si se asignó un collar, actualizar el collar con el animal_id
    if (collar_id) {
      await Collar.update(
        { animal_id: animal.id },
        { where: { id: collar_id } }
      );
    }

    // Obtener el animal creado con sus relaciones
    const animalCompleto = await Animal.findByPk(animal.id, {
      include: [
        { model: Grupo, as: 'grupo' },
        { model: Potrero, as: 'potrero' },
        { model: Collar, as: 'collar' }
      ]
    });

    logger.info(`Animal creado: ${nombre} (ID: ${animal.id})`, {
      userId: req.user.id,
      animalId: animal.id
    });

    res.status(201).json({
      message: 'Animal creado exitosamente',
      data: animalCompleto
    });

  } catch (error) {
    logger.error('Error al crear animal:', error);
    res.status(500).json({
      error: 'Error al crear animal',
      message: error.message
    });
  }
};

/**
 * PUT /api/animales/:id
 * Actualizar un animal existente
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      identificacion,
      raza,
      sexo,
      fecha_nacimiento,
      peso,
      color,
      estado_salud,
      grupo_id,
      potrero_id,
      collar_id,
      observaciones,
      activo
    } = req.body;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        error: 'Animal no encontrado',
        message: `No existe un animal con ID ${id}`
      });
    }

    // Verificar identificación única (excluyendo el animal actual)
    if (identificacion && identificacion !== animal.identificacion) {
      const existeIdentificacion = await Animal.findOne({
        where: { 
          identificacion,
          id: { [Op.ne]: id }
        }
      });

      if (existeIdentificacion) {
        return res.status(409).json({
          error: 'Identificación duplicada',
          message: `Ya existe otro animal con la identificación ${identificacion}`
        });
      }
    }

    // Manejar cambio de collar
    const collarAnterior = animal.collar_id;
    if (collar_id !== collarAnterior) {
      // Si había un collar anterior, liberarlo
      if (collarAnterior) {
        await Collar.update(
          { animal_id: null },
          { where: { id: collarAnterior } }
        );
      }

      // Si hay un nuevo collar, verificar que esté disponible
      if (collar_id) {
        const collarAsignado = await Animal.findOne({
          where: { 
            collar_id,
            activo: true,
            id: { [Op.ne]: id }
          }
        });

        if (collarAsignado) {
          return res.status(409).json({
            error: 'Collar ya asignado',
            message: `El collar ya está asignado al animal ${collarAsignado.nombre}`
          });
        }

        const collar = await Collar.findByPk(collar_id);
        if (!collar || !collar.activo) {
          return res.status(404).json({
            error: 'Collar no válido',
            message: 'El collar especificado no existe o no está activo'
          });
        }

        // Asignar nuevo collar
        await Collar.update(
          { animal_id: id },
          { where: { id: collar_id } }
        );
      }
    }

    // Calcular edad si cambió la fecha de nacimiento
    let edad = animal.edad;
    if (fecha_nacimiento && fecha_nacimiento !== animal.fecha_nacimiento) {
      const today = new Date();
      const birthDate = new Date(fecha_nacimiento);
      edad = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Actualizar el animal
    await animal.update({
      nombre: nombre || animal.nombre,
      identificacion: identificacion || animal.identificacion,
      raza: raza || animal.raza,
      sexo: sexo || animal.sexo,
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : animal.fecha_nacimiento,
      edad,
      peso: peso !== undefined ? peso : animal.peso,
      color: color || animal.color,
      estado_salud: estado_salud || animal.estado_salud,
      grupo_id: grupo_id !== undefined ? grupo_id : animal.grupo_id,
      potrero_id: potrero_id !== undefined ? potrero_id : animal.potrero_id,
      collar_id: collar_id !== undefined ? collar_id : animal.collar_id,
      observaciones: observaciones !== undefined ? observaciones : animal.observaciones,
      activo: activo !== undefined ? activo : animal.activo
    });

    // Obtener animal actualizado con relaciones
    const animalActualizado = await Animal.findByPk(id, {
      include: [
        { model: Grupo, as: 'grupo' },
        { model: Potrero, as: 'potrero' },
        { model: Collar, as: 'collar' }
      ]
    });

    logger.info(`Animal actualizado: ${animal.nombre} (ID: ${id})`, {
      userId: req.user.id,
      animalId: id
    });

    res.status(200).json({
      message: 'Animal actualizado exitosamente',
      data: animalActualizado
    });

  } catch (error) {
    logger.error('Error al actualizar animal:', error);
    res.status(500).json({
      error: 'Error al actualizar animal',
      message: error.message
    });
  }
};

/**
 * DELETE /api/animales/:id
 * Eliminar un animal (soft delete)
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        error: 'Animal no encontrado',
        message: `No existe un animal con ID ${id}`
      });
    }

    // Verificar si tiene telemetría asociada
    const tieneTelemetria = await Telemetria.count({
      where: { animal_id: id }
    });

    const tieneAlertas = await Alerta.count({
      where: { animal_id: id }
    });

    if (tieneTelemetria > 0 || tieneAlertas > 0) {
      // Soft delete para preservar datos históricos
      await animal.update({ activo: false });

      // Liberar collar si lo tiene
      if (animal.collar_id) {
        await Collar.update(
          { animal_id: null },
          { where: { id: animal.collar_id } }
        );
      }

      logger.info(`Animal desactivado (soft delete): ${animal.nombre} (ID: ${id})`, {
        userId: req.user.id,
        animalId: id,
        razon: 'Tiene datos históricos asociados'
      });

      res.status(200).json({
        message: 'Animal desactivado exitosamente',
        note: 'El animal se mantuvo en el sistema para preservar datos históricos'
      });
    } else {
      // Hard delete si no tiene datos asociados
      if (animal.collar_id) {
        await Collar.update(
          { animal_id: null },
          { where: { id: animal.collar_id } }
        );
      }

      await animal.destroy();

      logger.info(`Animal eliminado completamente: ${animal.nombre} (ID: ${id})`, {
        userId: req.user.id,
        animalId: id
      });

      res.status(200).json({
        message: 'Animal eliminado exitosamente'
      });
    }

  } catch (error) {
    logger.error('Error al eliminar animal:', error);
    res.status(500).json({
      error: 'Error al eliminar animal',
      message: error.message
    });
  }
};

/**
 * GET /api/animales/:id/telemetria
 * Obtener telemetría de un animal específico
 */
const getTelemetria = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, desde, hasta } = req.query;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        error: 'Animal no encontrado',
        message: `No existe un animal con ID ${id}`
      });
    }

    const where = { animal_id: id };

    if (desde && hasta) {
      where.timestamp = {
        [Op.between]: [new Date(desde), new Date(hasta)]
      };
    }

    const telemetrias = await Telemetria.findAll({
      where,
      limit: parseInt(limit),
      order: [['timestamp', 'DESC']],
      include: [{
        model: Collar,
        as: 'collar',
        attributes: ['identificador', 'modelo']
      }]
    });

    res.status(200).json({
      animal: {
        id: animal.id,
        nombre: animal.nombre,
        identificacion: animal.identificacion
      },
      count: telemetrias.length,
      data: telemetrias
    });

  } catch (error) {
    logger.error('Error al obtener telemetría del animal:', error);
    res.status(500).json({
      error: 'Error al obtener telemetría',
      message: error.message
    });
  }
};

/**
 * GET /api/animales/:id/alertas
 * Obtener alertas de un animal específico
 */
const getAlertas = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, limit = 20 } = req.query;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        error: 'Animal no encontrado',
        message: `No existe un animal con ID ${id}`
      });
    }

    const where = { animal_id: id };
    if (estado) where.estado = estado;

    const alertas = await Alerta.findAll({
      where,
      limit: parseInt(limit),
      order: [['fecha_creacion', 'DESC']]
    });

    res.status(200).json({
      animal: {
        id: animal.id,
        nombre: animal.nombre,
        identificacion: animal.identificacion
      },
      count: alertas.length,
      data: alertas
    });

  } catch (error) {
    logger.error('Error al obtener alertas del animal:', error);
    res.status(500).json({
      error: 'Error al obtener alertas',
      message: error.message
    });
  }
};

/**
 * Función auxiliar para obtener estadísticas de un animal
 */
async function getAnimalStats(animalId) {
  try {
    const [telemetriaCount, alertasCount, ultimaTelemetria] = await Promise.all([
      Telemetria.count({ where: { animal_id: animalId } }),
      Alerta.count({ where: { animal_id: animalId } }),
      Telemetria.findOne({
        where: { animal_id: animalId },
        order: [['timestamp', 'DESC']]
      })
    ]);

    return {
      total_telemetria: telemetriaCount,
      total_alertas: alertasCount,
      ultima_ubicacion: ultimaTelemetria ? {
        latitud: ultimaTelemetria.latitud,
        longitud: ultimaTelemetria.longitud,
        timestamp: ultimaTelemetria.timestamp
      } : null,
      bateria_actual: ultimaTelemetria ? ultimaTelemetria.bateria : null
    };
  } catch (error) {
    logger.error('Error al obtener estadísticas del animal:', error);
    return null;
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getTelemetria,
  getAlertas
};