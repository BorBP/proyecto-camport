/**
 * Controlador de Alertas
 * RF6 y RF7: Generación y gestión de alertas automáticas
 * Maneja el workflow completo de alertas del sistema ganadero
 */

const { Alerta, Animal, Collar, Potrero, Usuario } = require('../models');
const { emitAlertaActualizada, emitEstadisticasAlertas } = require('../config/socket');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/alertas
 * Listar alertas con filtros y paginación
 */
const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      estado, 
      tipo, 
      severidad,
      animal_id,
      desde,
      hasta,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Aplicar filtros
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (severidad) where.severidad = severidad;
    if (animal_id) where.animal_id = animal_id;

    if (desde && hasta) {
      where.fecha_creacion = {
        [Op.between]: [new Date(desde), new Date(hasta)]
      };
    } else if (desde) {
      where.fecha_creacion = {
        [Op.gte]: new Date(desde)
      };
    } else if (hasta) {
      where.fecha_creacion = {
        [Op.lte]: new Date(hasta)
      };
    }

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const alertas = await Alerta.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_creacion', 'DESC']],
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion', 'raza'],
          required: false
        },
        {
          model: Usuario,
          as: 'usuario_atencion',
          attributes: ['id', 'nombre', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      data: alertas.rows,
      pagination: {
        total: alertas.count,
        pages: Math.ceil(alertas.count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener alertas:', error);
    res.status(500).json({
      error: 'Error al obtener alertas',
      message: error.message
    });
  }
};

/**
 * GET /api/alertas/:id
 * Obtener detalles de una alerta específica
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const alerta = await Alerta.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion', 'raza', 'edad'],
          include: [
            {
              model: Collar,
              as: 'collar',
              attributes: ['id', 'identificador', 'modelo']
            },
            {
              model: Potrero,
              as: 'potrero',
              attributes: ['id', 'nombre', 'area']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_atencion',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ]
    });

    if (!alerta) {
      return res.status(404).json({
        error: 'Alerta no encontrada',
        message: `No existe una alerta con ID ${id}`
      });
    }

    res.status(200).json({
      data: alerta
    });

  } catch (error) {
    logger.error('Error al obtener alerta:', error);
    res.status(500).json({
      error: 'Error al obtener alerta',
      message: error.message
    });
  }
};

/**
 * PATCH /api/alertas/:id/atender
 * Marcar alerta como "en proceso" y asignar responsable
 */
const atender = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.user.id;

    const alerta = await Alerta.findByPk(id);
    if (!alerta) {
      return res.status(404).json({
        error: 'Alerta no encontrada',
        message: `No existe una alerta con ID ${id}`
      });
    }

    if (alerta.estado !== 'nueva') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Solo se pueden atender alertas en estado "nueva"'
      });
    }

    // Actualizar alerta
    await alerta.update({
      estado: 'en_proceso',
      atendido_por: userId,
      fecha_atencion: new Date(),
      comentarios: comentario ? [
        ...(alerta.comentarios || []),
        {
          usuario_id: userId,
          comentario,
          timestamp: new Date(),
          accion: 'atender'
        }
      ] : alerta.comentarios
    });

    // Obtener alerta actualizada con relaciones
    const alertaActualizada = await Alerta.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion']
        },
        {
          model: Usuario,
          as: 'usuario_atencion',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    // Emitir actualización via Socket.io
    emitAlertaActualizada({
      tipo: 'alerta_atendida',
      data: alertaActualizada
    });

    logger.info(`Alerta atendida: ${id} por usuario ${req.user.nombre}`, {
      alertaId: id,
      userId,
      tipoAlerta: alerta.tipo
    });

    res.status(200).json({
      message: 'Alerta marcada como en proceso',
      data: alertaActualizada
    });

  } catch (error) {
    logger.error('Error al atender alerta:', error);
    res.status(500).json({
      error: 'Error al atender alerta',
      message: error.message
    });
  }
};

/**
 * PATCH /api/alertas/:id/resolver
 * Marcar alerta como "atendida" (resuelta)
 */
const resolver = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario, accion_tomada } = req.body;
    const userId = req.user.id;

    const alerta = await Alerta.findByPk(id);
    if (!alerta) {
      return res.status(404).json({
        error: 'Alerta no encontrada',
        message: `No existe una alerta con ID ${id}`
      });
    }

    if (!['nueva', 'en_proceso'].includes(alerta.estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Solo se pueden resolver alertas en estado "nueva" o "en proceso"'
      });
    }

    // Preparar comentarios
    const nuevosComentarios = [...(alerta.comentarios || [])];
    
    if (comentario || accion_tomada) {
      nuevosComentarios.push({
        usuario_id: userId,
        comentario: comentario || accion_tomada,
        timestamp: new Date(),
        accion: 'resolver'
      });
    }

    // Actualizar alerta
    await alerta.update({
      estado: 'atendida',
      atendido_por: alerta.atendido_por || userId,
      fecha_atencion: alerta.fecha_atencion || new Date(),
      fecha_resolucion: new Date(),
      comentarios: nuevosComentarios,
      accion_tomada: accion_tomada || comentario
    });

    // Obtener alerta actualizada
    const alertaActualizada = await Alerta.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animal',
          attributes: ['id', 'nombre', 'identificacion']
        },
        {
          model: Usuario,
          as: 'usuario_atencion',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    // Emitir actualización
    emitAlertaActualizada({
      tipo: 'alerta_resuelta',
      data: alertaActualizada
    });

    logger.info(`Alerta resuelta: ${id} por usuario ${req.user.nombre}`, {
      alertaId: id,
      userId,
      tipoAlerta: alerta.tipo,
      accionTomada: accion_tomada
    });

    res.status(200).json({
      message: 'Alerta marcada como resuelta',
      data: alertaActualizada
    });

  } catch (error) {
    logger.error('Error al resolver alerta:', error);
    res.status(500).json({
      error: 'Error al resolver alerta',
      message: error.message
    });
  }
};

/**
 * POST /api/alertas/:id/comentarios
 * Agregar comentario a una alerta
 */
const agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.user.id;

    if (!comentario || comentario.trim().length === 0) {
      return res.status(400).json({
        error: 'Comentario requerido',
        message: 'El comentario no puede estar vacío'
      });
    }

    const alerta = await Alerta.findByPk(id);
    if (!alerta) {
      return res.status(404).json({
        error: 'Alerta no encontrada',
        message: `No existe una alerta con ID ${id}`
      });
    }

    // Agregar comentario
    const nuevosComentarios = [
      ...(alerta.comentarios || []),
      {
        usuario_id: userId,
        comentario: comentario.trim(),
        timestamp: new Date(),
        accion: 'comentario'
      }
    ];

    await alerta.update({
      comentarios: nuevosComentarios
    });

    logger.info(`Comentario agregado a alerta ${id} por ${req.user.nombre}`, {
      alertaId: id,
      userId
    });

    res.status(200).json({
      message: 'Comentario agregado exitosamente',
      comentario: nuevosComentarios[nuevosComentarios.length - 1]
    });

  } catch (error) {
    logger.error('Error al agregar comentario:', error);
    res.status(500).json({
      error: 'Error al agregar comentario',
      message: error.message
    });
  }
};

/**
 * GET /api/alertas/estadisticas
 * Obtener estadísticas de alertas para dashboard
 */
const getEstadisticas = async (req, res) => {
  try {
    const { periodo = '7d' } = req.query;
    
    // Calcular fecha desde
    let fechaDesde;
    switch (periodo) {
      case '24h':
        fechaDesde = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fechaDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Consultas paralelas para estadísticas
    const [
      totalAlertas,
      alertasNuevas,
      alertasEnProceso,
      alertasAtendidas,
      alertasPorTipo,
      alertasPorSeveridad,
      alertasRecientes
    ] = await Promise.all([
      Alerta.count({
        where: { fecha_creacion: { [Op.gte]: fechaDesde } }
      }),
      Alerta.count({
        where: { 
          estado: 'nueva',
          fecha_creacion: { [Op.gte]: fechaDesde }
        }
      }),
      Alerta.count({
        where: { 
          estado: 'en_proceso',
          fecha_creacion: { [Op.gte]: fechaDesde }
        }
      }),
      Alerta.count({
        where: { 
          estado: 'atendida',
          fecha_creacion: { [Op.gte]: fechaDesde }
        }
      }),
      Alerta.findAll({
        where: { fecha_creacion: { [Op.gte]: fechaDesde } },
        attributes: [
          'tipo',
          [Alerta.sequelize.fn('COUNT', Alerta.sequelize.col('id')), 'count']
        ],
        group: ['tipo']
      }),
      Alerta.findAll({
        where: { fecha_creacion: { [Op.gte]: fechaDesde } },
        attributes: [
          'severidad',
          [Alerta.sequelize.fn('COUNT', Alerta.sequelize.col('id')), 'count']
        ],
        group: ['severidad']
      }),
      Alerta.findAll({
        where: {
          estado: 'nueva',
          fecha_creacion: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        limit: 5,
        order: [['fecha_creacion', 'DESC']],
        include: [{
          model: Animal,
          as: 'animal',
          attributes: ['nombre', 'identificacion']
        }]
      })
    ]);

    const estadisticas = {
      periodo,
      resumen: {
        total: totalAlertas,
        nuevas: alertasNuevas,
        en_proceso: alertasEnProceso,
        atendidas: alertasAtendidas,
        porcentaje_resolucion: totalAlertas > 0 ? 
          Math.round((alertasAtendidas / totalAlertas) * 100) : 0
      },
      por_tipo: alertasPorTipo.reduce((acc, item) => {
        acc[item.tipo] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      por_severidad: alertasPorSeveridad.reduce((acc, item) => {
        acc[item.severidad] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      recientes: alertasRecientes,
      configuracion_motor: alertService.getConfiguracion()
    };

    res.status(200).json({
      data: estadisticas
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
 * POST /api/alertas/configurar-umbrales
 * Configurar umbrales del motor de alertas (solo administradores)
 */
const configurarUmbrales = async (req, res) => {
  try {
    const {
      bateria_baja,
      temperatura_alta,
      inactividad_horas,
      tiempo_sin_datos
    } = req.body;

    const nuevosUmbrales = {};
    if (bateria_baja !== undefined) nuevosUmbrales.bateria_baja = bateria_baja;
    if (temperatura_alta !== undefined) nuevosUmbrales.temperatura_alta = temperatura_alta;
    if (inactividad_horas !== undefined) nuevosUmbrales.inactividad_horas = inactividad_horas;
    if (tiempo_sin_datos !== undefined) nuevosUmbrales.tiempo_sin_datos = tiempo_sin_datos;

    if (Object.keys(nuevosUmbrales).length === 0) {
      return res.status(400).json({
        error: 'Sin cambios',
        message: 'No se proporcionaron umbrales para actualizar'
      });
    }

    alertService.configurarUmbrales(nuevosUmbrales);

    logger.info(`Umbrales de alertas actualizados por ${req.user.nombre}`, {
      userId: req.user.id,
      nuevosUmbrales
    });

    res.status(200).json({
      message: 'Umbrales actualizados exitosamente',
      configuracion: alertService.getConfiguracion()
    });

  } catch (error) {
    logger.error('Error al configurar umbrales:', error);
    res.status(500).json({
      error: 'Error al configurar umbrales',
      message: error.message
    });
  }
};

/**
 * POST /api/alertas/motor/iniciar
 * Iniciar el motor de alertas automáticas (solo administradores)
 */
const iniciarMotor = async (req, res) => {
  try {
    alertService.iniciar();

    logger.info(`Motor de alertas iniciado por ${req.user.nombre}`, {
      userId: req.user.id
    });

    res.status(200).json({
      message: 'Motor de alertas iniciado exitosamente',
      configuracion: alertService.getConfiguracion()
    });

  } catch (error) {
    logger.error('Error al iniciar motor:', error);
    res.status(500).json({
      error: 'Error al iniciar motor',
      message: error.message
    });
  }
};

/**
 * POST /api/alertas/motor/detener
 * Detener el motor de alertas automáticas (solo administradores)
 */
const detenerMotor = async (req, res) => {
  try {
    alertService.detener();

    logger.info(`Motor de alertas detenido por ${req.user.nombre}`, {
      userId: req.user.id
    });

    res.status(200).json({
      message: 'Motor de alertas detenido exitosamente',
      configuracion: alertService.getConfiguracion()
    });

  } catch (error) {
    logger.error('Error al detener motor:', error);
    res.status(500).json({
      error: 'Error al detener motor',
      message: error.message
    });
  }
};

module.exports = {
  getAll,
  getById,
  atender,
  resolver,
  agregarComentario,
  getEstadisticas,
  configurarUmbrales,
  iniciarMotor,
  detenerMotor
};