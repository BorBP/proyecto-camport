/**
 * Controlador de Telemetría
 * Maneja la recepción y consulta de datos de sensores IoT
 */

const { Telemetria, Collar, Animal } = require('../models');
const { emitTelemetria } = require('../config/socket');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * POST /api/telemetria/ingest
 * Recibir datos del simulador IoT Python
 * Este es el endpoint CRÍTICO para la integración
 */
const ingestTelemetria = async (req, res) => {
  try {
    const {
      collar_id,
      latitud,
      longitud,
      altitud,
      precision,
      bateria,
      temperatura,
      actividad,
      timestamp
    } = req.body;

    // Validar que el collar existe
    const collar = await Collar.findOne({
      where: { identificador: collar_id },
      include: [{
        model: Animal,
        as: 'animal'
      }]
    });

    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `El collar ${collar_id} no existe en el sistema`
      });
    }

    // Crear registro de telemetría
    const telemetria = await Telemetria.create({
      collar_id: collar.id,
      animal_id: collar.animal_id,
      latitud,
      longitud,
      altitud: altitud || null,
      precision: precision || null,
      bateria,
      temperatura: temperatura || null,
      actividad: actividad || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    // Actualizar última conexión del collar
    await collar.update({
      ultima_conexion: new Date(),
      bateria_actual: bateria
    });

    // Obtener datos completos para el frontend
    const telemetriaCompleta = await Telemetria.findByPk(telemetria.id, {
      include: [
        {
          model: Collar,
          as: 'collar',
          attributes: ['id', 'identificador', 'modelo']
        },
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'raza', 'edad']
        }
      ]
    });

    // Emitir evento Socket.io para actualizar frontend en tiempo real
    emitTelemetria({
      tipo: 'nueva_telemetria',
      data: telemetriaCompleta
    });

    logger.info(`Telemetría recibida: Collar ${collar_id}, Batería ${bateria}%`);

    res.status(201).json({
      message: 'Telemetría recibida exitosamente',
      data: telemetriaCompleta
    });

  } catch (error) {
    logger.error('Error al ingerir telemetría:', error);
    res.status(500).json({
      error: 'Error al procesar telemetría',
      message: error.message
    });
  }
};

/**
 * POST /api/telemetria/batch
 * Recibir múltiples datos de telemetría en lote (optimizado para IoT)
 */
const ingestBatch = async (req, res) => {
  try {
    const { datos } = req.body;

    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se espera un array de datos en el campo "datos"'
      });
    }

    const resultados = {
      exitosos: 0,
      fallidos: 0,
      errores: []
    };

    // Procesar cada registro
    for (const dato of datos) {
      try {
        const collar = await Collar.findOne({
          where: { identificador: dato.collar_id }
        });

        if (!collar) {
          resultados.fallidos++;
          resultados.errores.push({
            collar_id: dato.collar_id,
            error: 'Collar no encontrado'
          });
          continue;
        }

        await Telemetria.create({
          collar_id: collar.id,
          animal_id: collar.animal_id,
          latitud: dato.latitud,
          longitud: dato.longitud,
          altitud: dato.altitud || null,
          precision: dato.precision || null,
          bateria: dato.bateria,
          temperatura: dato.temperatura || null,
          actividad: dato.actividad || 0,
          timestamp: dato.timestamp ? new Date(dato.timestamp) : new Date()
        });

        await collar.update({
          ultima_conexion: new Date(),
          bateria_actual: dato.bateria
        });

        resultados.exitosos++;

      } catch (error) {
        resultados.fallidos++;
        resultados.errores.push({
          collar_id: dato.collar_id,
          error: error.message
        });
      }
    }

    logger.info(`Batch procesado: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`);

    res.status(200).json({
      message: 'Batch procesado',
      resultados
    });

  } catch (error) {
    logger.error('Error al procesar batch:', error);
    res.status(500).json({
      error: 'Error al procesar batch',
      message: error.message
    });
  }
};

/**
 * GET /api/telemetria/latest
 * Obtener la última telemetría de todos los animales
 */
const getLatestAll = async (req, res) => {
  try {
    // Obtener todos los collares activos
    const collares = await Collar.findAll({
      where: { activo: true },
      include: [{
        model: Animal,
        as: 'animal',
        attributes: ['id', 'nombre', 'raza', 'edad', 'sexo']
      }]
    });

    const telemetrias = [];

    // Para cada collar, obtener su última telemetría
    for (const collar of collares) {
      const ultimaTelemetria = await Telemetria.findOne({
        where: { collar_id: collar.id },
        order: [['timestamp', 'DESC']],
        include: [
          {
            model: Collar,
            as: 'collar',
            attributes: ['id', 'identificador', 'modelo', 'bateria_actual']
          },
          {
            model: Animal,
            as: 'animal',
            attributes: ['id', 'nombre', 'raza', 'edad', 'sexo']
          }
        ]
      });

      if (ultimaTelemetria) {
        telemetrias.push(ultimaTelemetria);
      }
    }

    res.status(200).json({
      count: telemetrias.length,
      data: telemetrias
    });

  } catch (error) {
    logger.error('Error al obtener telemetría:', error);
    res.status(500).json({
      error: 'Error al obtener telemetría',
      message: error.message
    });
  }
};

/**
 * GET /api/telemetria/animal/:animalId
 * Obtener telemetría de un animal específico
 */
const getByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    const { limit = 100, offset = 0, desde, hasta } = req.query;

    // Construir filtros
    const where = { animal_id: animalId };

    if (desde && hasta) {
      where.timestamp = {
        [Op.between]: [new Date(desde), new Date(hasta)]
      };
    } else if (desde) {
      where.timestamp = {
        [Op.gte]: new Date(desde)
      };
    } else if (hasta) {
      where.timestamp = {
        [Op.lte]: new Date(hasta)
      };
    }

    const telemetrias = await Telemetria.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: Collar,
          as: 'collar',
          attributes: ['id', 'identificador', 'modelo']
        },
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'raza']
        }
      ]
    });

    res.status(200).json({
      count: telemetrias.count,
      data: telemetrias.rows
    });

  } catch (error) {
    logger.error('Error al obtener telemetría por animal:', error);
    res.status(500).json({
      error: 'Error al obtener telemetría',
      message: error.message
    });
  }
};

/**
 * GET /api/telemetria/collar/:collarId
 * Obtener telemetría de un collar específico
 */
const getByCollar = async (req, res) => {
  try {
    const { collarId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Buscar por identificador del collar
    const collar = await Collar.findOne({
      where: { identificador: collarId }
    });

    if (!collar) {
      return res.status(404).json({
        error: 'Collar no encontrado',
        message: `El collar ${collarId} no existe`
      });
    }

    const telemetrias = await Telemetria.findAndCountAll({
      where: { collar_id: collar.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: Collar,
          as: 'collar',
          attributes: ['id', 'identificador', 'modelo', 'bateria_actual']
        },
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'raza']
        }
      ]
    });

    res.status(200).json({
      count: telemetrias.count,
      data: telemetrias.rows
    });

  } catch (error) {
    logger.error('Error al obtener telemetría por collar:', error);
    res.status(500).json({
      error: 'Error al obtener telemetría',
      message: error.message
    });
  }
};

/**
 * GET /api/telemetria/stats/:animalId
 * Obtener estadísticas de telemetría de un animal
 */
const getStatsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    const { dias = 7 } = req.query;

    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - parseInt(dias));

    const telemetrias = await Telemetria.findAll({
      where: {
        animal_id: animalId,
        timestamp: {
          [Op.gte]: fechaDesde
        }
      },
      order: [['timestamp', 'ASC']]
    });

    if (telemetrias.length === 0) {
      return res.status(404).json({
        error: 'Sin datos',
        message: 'No hay datos de telemetría para este animal en el período especificado'
      });
    }

    // Calcular estadísticas
    const stats = {
      total_registros: telemetrias.length,
      periodo: {
        desde: fechaDesde,
        hasta: new Date()
      },
      bateria: {
        promedio: telemetrias.reduce((sum, t) => sum + t.bateria, 0) / telemetrias.length,
        minima: Math.min(...telemetrias.map(t => t.bateria)),
        maxima: Math.max(...telemetrias.map(t => t.bateria)),
        actual: telemetrias[telemetrias.length - 1].bateria
      },
      temperatura: {
        promedio: telemetrias.filter(t => t.temperatura).reduce((sum, t) => sum + t.temperatura, 0) / telemetrias.filter(t => t.temperatura).length || 0,
        minima: Math.min(...telemetrias.filter(t => t.temperatura).map(t => t.temperatura)) || null,
        maxima: Math.max(...telemetrias.filter(t => t.temperatura).map(t => t.temperatura)) || null
      },
      actividad: {
        promedio: telemetrias.filter(t => t.actividad).reduce((sum, t) => sum + t.actividad, 0) / telemetrias.filter(t => t.actividad).length || 0,
        minima: Math.min(...telemetrias.filter(t => t.actividad).map(t => t.actividad)) || 0,
        maxima: Math.max(...telemetrias.filter(t => t.actividad).map(t => t.actividad)) || 0
      },
      ubicacion: {
        primera: {
          latitud: telemetrias[0].latitud,
          longitud: telemetrias[0].longitud
        },
        ultima: {
          latitud: telemetrias[telemetrias.length - 1].latitud,
          longitud: telemetrias[telemetrias.length - 1].longitud
        }
      }
    };

    res.status(200).json({
      data: stats
    });

  } catch (error) {
    logger.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
};

/**
 * DELETE /api/telemetria/old
 * Eliminar telemetría antigua (limpieza de datos)
 * Solo administradores
 */
const deleteOld = async (req, res) => {
  try {
    const { dias = 90 } = req.query;

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));

    const resultado = await Telemetria.destroy({
      where: {
        timestamp: {
          [Op.lt]: fechaLimite
        }
      }
    });

    logger.info(`Telemetría antigua eliminada: ${resultado} registros`);

    res.status(200).json({
      message: 'Telemetría antigua eliminada',
      registros_eliminados: resultado,
      fecha_limite: fechaLimite
    });

  } catch (error) {
    logger.error('Error al eliminar telemetría antigua:', error);
    res.status(500).json({
      error: 'Error al eliminar telemetría',
      message: error.message
    });
  }
};

module.exports = {
  ingestTelemetria,
  ingestBatch,
  getLatestAll,
  getByAnimal,
  getByCollar,
  getStatsByAnimal,
  deleteOld
};
