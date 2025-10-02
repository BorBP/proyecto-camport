/**
 * Controlador de Collares IoT
 * RF4: Simulación de collares inteligentes
 * Gestión de dispositivos IoT para monitoreo de ganado
 */

const { Collar, Animal, Telemetria } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/collares
 * Listar todos los collares con paginación
 */
const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      activo = true,
      asignado 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros opcionales
    if (search) {
      where[Op.or] = [
        { identificador: { [Op.iLike]: `%${search}%` } },
        { modelo: { [Op.iLike]: `%${search}%` } },
        { numero_serie: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (activo !== undefined) where.activo = activo === 'true';
    
    if (asignado === 'true') {
      where.animal_id = { [Op.ne]: null };
    } else if (asignado === 'false') {
      where.animal_id = null;
    }

    const collares = await Collar.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['identificador', 'ASC']],
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion', 'raza'],
          required: false
        }
      ]
    });

    // Agregar estadísticas de cada collar
    const collaresConStats = await Promise.all(
      collares.rows.map(async (collar) => {
        const collarData = collar.toJSON();
        
        // Obtener estadísticas de telemetría
        const stats = await getTelemetriaStats(collar.id);
        collarData.estadisticas = stats;
        
        return collarData;
      })
    );

    res.status(200).json({
      data: collaresConStats,
      pagination: {
        total: collares.count,
        pages: Math.ceil(collares.count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener collares:', error);
    res.status(500).json({
      error: 'Error al obtener collares',
      message: error.message
    });
  }
};

/**
 * GET /api/collares/:id
 * Obtener un collar específico con detalles completos
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const collar = await Collar.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion', 'raza', 'sexo', 'edad']
        }
      ]
    });

    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `No existe un collar con ID ${id}`
      });
    }

    const collarData = collar.toJSON();
    
    // Obtener estadísticas detalladas
    collarData.estadisticas = await getTelemetriaStats(id);
    
    // Obtener última telemetría
    const ultimaTelemetria = await Telemetria.findOne({
      where: { collar_id: id },
      order: [['timestamp', 'DESC']]
    });

    collarData.ultima_telemetria = ultimaTelemetria;

    res.status(200).json({
      data: collarData
    });

  } catch (error) {
    logger.error('Error al obtener collar:', error);
    res.status(500).json({
      error: 'Error al obtener collar',
      message: error.message
    });
  }
};

/**
 * POST /api/collares
 * Crear un nuevo collar
 */
const create = async (req, res) => {
  try {
    const {
      identificador,
      modelo,
      numero_serie,
      version_firmware,
      frecuencia_envio = 60,
      umbral_bateria_baja = 20,
      umbral_temperatura_alta = 39.5,
      observaciones
    } = req.body;

    // Verificar que el identificador sea único
    const identificadorExiste = await Collar.findOne({
      where: { identificador }
    });

    if (identificadorExiste) {
      return res.status(409).json({
        error: 'Identificador duplicado',
        message: `Ya existe un collar con el identificador ${identificador}`
      });
    }

    // Verificar que el número de serie sea único si se proporciona
    if (numero_serie) {
      const serieExiste = await Collar.findOne({
        where: { numero_serie }
      });

      if (serieExiste) {
        return res.status(409).json({
          error: 'Número de serie duplicado',
          message: `Ya existe un collar con el número de serie ${numero_serie}`
        });
      }
    }

    const collar = await Collar.create({
      identificador,
      modelo,
      numero_serie,
      version_firmware,
      frecuencia_envio,
      umbral_bateria_baja,
      umbral_temperatura_alta,
      bateria_actual: 100, // Collar nuevo comienza con batería completa
      estado: 'inactivo', // Hasta que se asigne a un animal
      observaciones,
      activo: true
    });

    logger.info(`Collar creado: ${identificador} (ID: ${collar.id})`, {
      userId: req.user.id,
      collarId: collar.id
    });

    res.status(201).json({
      message: 'Collar creado exitosamente',
      data: collar
    });

  } catch (error) {
    logger.error('Error al crear collar:', error);
    res.status(500).json({
      error: 'Error al crear collar',
      message: error.message
    });
  }
};

/**
 * PUT /api/collares/:id
 * Actualizar un collar existente
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      identificador,
      modelo,
      numero_serie,
      version_firmware,
      frecuencia_envio,
      umbral_bateria_baja,
      umbral_temperatura_alta,
      estado,
      observaciones,
      activo
    } = req.body;

    const collar = await Collar.findByPk(id);
    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `No existe un collar con ID ${id}`
      });
    }

    // Verificar identificador único (excluyendo el collar actual)
    if (identificador && identificador !== collar.identificador) {
      const identificadorExiste = await Collar.findOne({
        where: { 
          identificador,
          id: { [Op.ne]: id }
        }
      });

      if (identificadorExiste) {
        return res.status(409).json({
          error: 'Identificador duplicado',
          message: `Ya existe otro collar con el identificador ${identificador}`
        });
      }
    }

    // Verificar número de serie único
    if (numero_serie && numero_serie !== collar.numero_serie) {
      const serieExiste = await Collar.findOne({
        where: { 
          numero_serie,
          id: { [Op.ne]: id }
        }
      });

      if (serieExiste) {
        return res.status(409).json({
          error: 'Número de serie duplicado',
          message: `Ya existe otro collar con el número de serie ${numero_serie}`
        });
      }
    }

    // Actualizar el collar
    await collar.update({
      identificador: identificador || collar.identificador,
      modelo: modelo || collar.modelo,
      numero_serie: numero_serie !== undefined ? numero_serie : collar.numero_serie,
      version_firmware: version_firmware || collar.version_firmware,
      frecuencia_envio: frecuencia_envio !== undefined ? frecuencia_envio : collar.frecuencia_envio,
      umbral_bateria_baja: umbral_bateria_baja !== undefined ? umbral_bateria_baja : collar.umbral_bateria_baja,
      umbral_temperatura_alta: umbral_temperatura_alta !== undefined ? umbral_temperatura_alta : collar.umbral_temperatura_alta,
      estado: estado || collar.estado,
      observaciones: observaciones !== undefined ? observaciones : collar.observaciones,
      activo: activo !== undefined ? activo : collar.activo
    });

    logger.info(`Collar actualizado: ${collar.identificador} (ID: ${id})`, {
      userId: req.user.id,
      collarId: id
    });

    res.status(200).json({
      message: 'Collar actualizado exitosamente',
      data: collar
    });

  } catch (error) {
    logger.error('Error al actualizar collar:', error);
    res.status(500).json({
      error: 'Error al actualizar collar',
      message: error.message
    });
  }
};

/**
 * DELETE /api/collares/:id
 * Eliminar un collar
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const collar = await Collar.findByPk(id);
    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `No existe un collar con ID ${id}`
      });
    }

    // Verificar si está asignado a un animal
    if (collar.animal_id) {
      return res.status(409).json({
        error: 'No se puede eliminar',
        message: 'El collar está asignado a un animal. Desasígnelo primero.'
      });
    }

    // Verificar si tiene telemetría asociada
    const tieneTelemetria = await Telemetria.count({
      where: { collar_id: id }
    });

    if (tieneTelemetria > 0) {
      // Soft delete para preservar datos históricos
      await collar.update({ activo: false });

      logger.info(`Collar desactivado (soft delete): ${collar.identificador} (ID: ${id})`, {
        userId: req.user.id,
        collarId: id,
        razon: 'Tiene datos de telemetría asociados'
      });

      res.status(200).json({
        message: 'Collar desactivado exitosamente',
        note: 'El collar se mantuvo en el sistema para preservar datos históricos'
      });
    } else {
      // Hard delete si no tiene datos asociados
      await collar.destroy();

      logger.info(`Collar eliminado completamente: ${collar.identificador} (ID: ${id})`, {
        userId: req.user.id,
        collarId: id
      });

      res.status(200).json({
        message: 'Collar eliminado exitosamente'
      });
    }

  } catch (error) {
    logger.error('Error al eliminar collar:', error);
    res.status(500).json({
      error: 'Error al eliminar collar',
      message: error.message
    });
  }
};

/**
 * POST /api/collares/:id/asignar
 * Asignar collar a un animal
 */
const asignar = async (req, res) => {
  try {
    const { id } = req.params;
    const { animal_id } = req.body;

    const collar = await Collar.findByPk(id);
    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `No existe un collar con ID ${id}`
      });
    }

    if (!collar.activo) {
      return res.status(400).json({
        error: 'Collar inactivo',
        message: 'No se puede asignar un collar inactivo'
      });
    }

    // Verificar que el collar no esté ya asignado
    if (collar.animal_id) {
      return res.status(409).json({
        error: 'Collar ya asignado',
        message: 'El collar ya está asignado a otro animal'
      });
    }

    // Verificar que el animal existe y está activo
    const animal = await Animal.findByPk(animal_id);
    if (!animal || !animal.activo) {
      return res.status(404).json({
        error: 'Animal no válido',
        message: 'El animal no existe o no está activo'
      });
    }

    // Verificar que el animal no tenga otro collar asignado
    if (animal.collar_id) {
      return res.status(409).json({
        error: 'Animal ya tiene collar',
        message: 'El animal ya tiene un collar asignado'
      });
    }

    // Realizar la asignación bidireccional
    await Promise.all([
      collar.update({ 
        animal_id,
        estado: 'activo',
        fecha_asignacion: new Date()
      }),
      animal.update({ collar_id: id })
    ]);

    logger.info(`Collar asignado: ${collar.identificador} → ${animal.nombre}`, {
      userId: req.user.id,
      collarId: id,
      animalId: animal_id
    });

    res.status(200).json({
      message: 'Collar asignado exitosamente',
      data: {
        collar: {
          id: collar.id,
          identificador: collar.identificador
        },
        animal: {
          id: animal.id,
          nombre: animal.nombre,
          identificacion: animal.identificacion
        }
      }
    });

  } catch (error) {
    logger.error('Error al asignar collar:', error);
    res.status(500).json({
      error: 'Error al asignar collar',
      message: error.message
    });
  }
};

/**
 * POST /api/collares/:id/desasignar
 * Desasignar collar de un animal
 */
const desasignar = async (req, res) => {
  try {
    const { id } = req.params;

    const collar = await Collar.findByPk(id, {
      include: [{
        model: Animal,
        as: 'animal',
        attributes: ['id', 'nombre', 'identificacion']
      }]
    });

    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `No existe un collar con ID ${id}`
      });
    }

    if (!collar.animal_id) {
      return res.status(400).json({
        error: 'Collar no asignado',
        message: 'El collar no está asignado a ningún animal'
      });
    }

    const animalData = collar.animal;

    // Realizar la desasignación bidireccional
    await Promise.all([
      collar.update({ 
        animal_id: null,
        estado: 'inactivo',
        fecha_desasignacion: new Date()
      }),
      Animal.update(
        { collar_id: null },
        { where: { id: collar.animal_id } }
      )
    ]);

    logger.info(`Collar desasignado: ${collar.identificador} de ${animalData?.nombre}`, {
      userId: req.user.id,
      collarId: id,
      animalId: collar.animal_id
    });

    res.status(200).json({
      message: 'Collar desasignado exitosamente',
      data: {
        collar: {
          id: collar.id,
          identificador: collar.identificador
        },
        animal_anterior: animalData
      }
    });

  } catch (error) {
    logger.error('Error al desasignar collar:', error);
    res.status(500).json({
      error: 'Error al desasignar collar',
      message: error.message
    });
  }
};

/**
 * GET /api/collares/disponibles
 * Obtener collares disponibles para asignación
 */
const getDisponibles = async (req, res) => {
  try {
    const collares = await Collar.findAll({
      where: {
        activo: true,
        animal_id: null
      },
      attributes: ['id', 'identificador', 'modelo', 'bateria_actual', 'estado'],
      order: [['identificador', 'ASC']]
    });

    res.status(200).json({
      count: collares.length,
      data: collares
    });

  } catch (error) {
    logger.error('Error al obtener collares disponibles:', error);
    res.status(500).json({
      error: 'Error al obtener collares disponibles',
      message: error.message
    });
  }
};

/**
 * Función auxiliar para obtener estadísticas de telemetría de un collar
 */
async function getTelemetriaStats(collarId) {
  try {
    const [
      totalTelemetria,
      ultimaTelemetria,
      telemetriaReciente
    ] = await Promise.all([
      Telemetria.count({ where: { collar_id: collarId } }),
      Telemetria.findOne({
        where: { collar_id: collarId },
        order: [['timestamp', 'DESC']]
      }),
      Telemetria.findAll({
        where: {
          collar_id: collarId,
          timestamp: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ]);

    return {
      total_telemetria: totalTelemetria,
      telemetria_24h: telemetriaReciente.length,
      ultima_conexion: ultimaTelemetria?.timestamp || null,
      bateria_actual: ultimaTelemetria?.bateria || null,
      temperatura_actual: ultimaTelemetria?.temperatura || null,
      ubicacion_actual: ultimaTelemetria ? {
        latitud: ultimaTelemetria.latitud,
        longitud: ultimaTelemetria.longitud
      } : null
    };
  } catch (error) {
    logger.error('Error al obtener estadísticas de collar:', error);
    return null;
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  asignar,
  desasignar,
  getDisponibles
};