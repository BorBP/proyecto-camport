/**
 * Controlador de Potreros (Geocercas)
 * RF1: Gestión de potreros y geocercas
 * Crear, editar y eliminar geocercas digitales para delimitar áreas de pastoreo
 */

const { Potrero, Animal, Alerta } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/potreros
 * Listar todos los potreros con paginación
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

    const potreros = await Potrero.findAndCountAll({
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
          attributes: ['id', 'nombre', 'identificacion', 'raza']
        }
      ]
    });

    // Agregar conteo de animales y calcular área
    const potrerosConStats = potreros.rows.map(potrero => {
      const potreroData = potrero.toJSON();
      potreroData.conteo_animales = potreroData.animales ? potreroData.animales.length : 0;
      
      // Calcular área del polígono si tiene coordenadas
      if (potreroData.coordenadas && Array.isArray(potreroData.coordenadas)) {
        potreroData.area_calculada = calcularAreaPoligono(potreroData.coordenadas);
      }
      
      return potreroData;
    });

    res.status(200).json({
      data: potrerosConStats,
      pagination: {
        total: potreros.count,
        pages: Math.ceil(potreros.count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener potreros:', error);
    res.status(500).json({
      error: 'Error al obtener potreros',
      message: error.message
    });
  }
};

/**
 * GET /api/potreros/:id
 * Obtener un potrero específico con sus animales
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const potrero = await Potrero.findByPk(id, {
      include: [
        {
          model: Animal,
          as: 'animales',
          where: { activo: true },
          required: false,
          attributes: ['id', 'nombre', 'identificacion', 'raza', 'sexo', 'edad', 'estado_salud']
        }
      ]
    });

    if (!potrero) {
      return res.status(404).json({
        error: 'Potrero no encontrado',
        message: `No existe un potrero con ID ${id}`
      });
    }

    const potreroData = potrero.toJSON();
    
    // Calcular estadísticas del potrero
    potreroData.estadisticas = {
      total_animales: potreroData.animales ? potreroData.animales.length : 0,
      animales_por_sexo: potreroData.animales ? {
        machos: potreroData.animales.filter(a => a.sexo === 'macho').length,
        hembras: potreroData.animales.filter(a => a.sexo === 'hembra').length
      } : { machos: 0, hembras: 0 },
      estado_salud: potreroData.animales ? {
        saludables: potreroData.animales.filter(a => a.estado_salud === 'saludable').length,
        enfermos: potreroData.animales.filter(a => a.estado_salud === 'enfermo').length,
        en_tratamiento: potreroData.animales.filter(a => a.estado_salud === 'en_tratamiento').length
      } : { saludables: 0, enfermos: 0, en_tratamiento: 0 }
    };

    // Calcular área si tiene coordenadas
    if (potreroData.coordenadas && Array.isArray(potreroData.coordenadas)) {
      potreroData.area_calculada = calcularAreaPoligono(potreroData.coordenadas);
    }

    res.status(200).json({
      data: potreroData
    });

  } catch (error) {
    logger.error('Error al obtener potrero:', error);
    res.status(500).json({
      error: 'Error al obtener potrero',
      message: error.message
    });
  }
};

/**
 * POST /api/potreros
 * Crear un nuevo potrero (geocerca)
 */
const create = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      coordenadas,
      area,
      capacidad_maxima,
      tipo_pasto,
      observaciones
    } = req.body;

    // Validar que las coordenadas formen un polígono válido
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
      return res.status(400).json({
        error: 'Coordenadas inválidas',
        message: 'Se requieren al menos 3 coordenadas para formar un polígono válido'
      });
    }

    // Validar formato de coordenadas
    const coordenadasValidas = coordenadas.every(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      coord.lat >= -90 && coord.lat <= 90 &&
      coord.lng >= -180 && coord.lng <= 180
    );

    if (!coordenadasValidas) {
      return res.status(400).json({
        error: 'Formato de coordenadas inválido',
        message: 'Cada coordenada debe tener lat y lng válidos'
      });
    }

    // Verificar que no exista otro potrero con el mismo nombre
    const nombreExiste = await Potrero.findOne({
      where: { nombre }
    });

    if (nombreExiste) {
      return res.status(409).json({
        error: 'Nombre duplicado',
        message: `Ya existe un potrero con el nombre "${nombre}"`
      });
    }

    // Calcular área automáticamente si no se proporciona
    const areaCalculada = area || calcularAreaPoligono(coordenadas);

    const potrero = await Potrero.create({
      nombre,
      descripcion,
      coordenadas,
      area: areaCalculada,
      capacidad_maxima: capacidad_maxima || null,
      tipo_pasto: tipo_pasto || null,
      observaciones,
      activo: true
    });

    logger.info(`Potrero creado: ${nombre} (ID: ${potrero.id})`, {
      userId: req.user.id,
      potreroId: potrero.id,
      area: areaCalculada
    });

    res.status(201).json({
      message: 'Potrero creado exitosamente',
      data: potrero
    });

  } catch (error) {
    logger.error('Error al crear potrero:', error);
    res.status(500).json({
      error: 'Error al crear potrero',
      message: error.message
    });
  }
};

/**
 * PUT /api/potreros/:id
 * Actualizar un potrero existente
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      coordenadas,
      area,
      capacidad_maxima,
      tipo_pasto,
      observaciones,
      activo
    } = req.body;

    const potrero = await Potrero.findByPk(id);
    if (!potrero) {
      return res.status(404).json({
        error: 'Potrero no encontrado',
        message: `No existe un potrero con ID ${id}`
      });
    }

    // Verificar nombre único (excluyendo el potrero actual)
    if (nombre && nombre !== potrero.nombre) {
      const nombreExiste = await Potrero.findOne({
        where: { 
          nombre,
          id: { [Op.ne]: id }
        }
      });

      if (nombreExiste) {
        return res.status(409).json({
          error: 'Nombre duplicado',
          message: `Ya existe otro potrero con el nombre "${nombre}"`
        });
      }
    }

    // Validar coordenadas si se están actualizando
    if (coordenadas) {
      if (!Array.isArray(coordenadas) || coordenadas.length < 3) {
        return res.status(400).json({
          error: 'Coordenadas inválidas',
          message: 'Se requieren al menos 3 coordenadas para formar un polígono válido'
        });
      }

      const coordenadasValidas = coordenadas.every(coord => 
        coord && 
        typeof coord.lat === 'number' && 
        typeof coord.lng === 'number' &&
        coord.lat >= -90 && coord.lat <= 90 &&
        coord.lng >= -180 && coord.lng <= 180
      );

      if (!coordenadasValidas) {
        return res.status(400).json({
          error: 'Formato de coordenadas inválido',
          message: 'Cada coordenada debe tener lat y lng válidos'
        });
      }
    }

    // Calcular nueva área si cambiaron las coordenadas
    let nuevaArea = area;
    if (coordenadas && !area) {
      nuevaArea = calcularAreaPoligono(coordenadas);
    }

    // Actualizar el potrero
    await potrero.update({
      nombre: nombre || potrero.nombre,
      descripcion: descripcion !== undefined ? descripcion : potrero.descripcion,
      coordenadas: coordenadas || potrero.coordenadas,
      area: nuevaArea !== undefined ? nuevaArea : potrero.area,
      capacidad_maxima: capacidad_maxima !== undefined ? capacidad_maxima : potrero.capacidad_maxima,
      tipo_pasto: tipo_pasto !== undefined ? tipo_pasto : potrero.tipo_pasto,
      observaciones: observaciones !== undefined ? observaciones : potrero.observaciones,
      activo: activo !== undefined ? activo : potrero.activo
    });

    logger.info(`Potrero actualizado: ${potrero.nombre} (ID: ${id})`, {
      userId: req.user.id,
      potreroId: id
    });

    res.status(200).json({
      message: 'Potrero actualizado exitosamente',
      data: potrero
    });

  } catch (error) {
    logger.error('Error al actualizar potrero:', error);
    res.status(500).json({
      error: 'Error al actualizar potrero',
      message: error.message
    });
  }
};

/**
 * DELETE /api/potreros/:id
 * Eliminar un potrero
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const potrero = await Potrero.findByPk(id);
    if (!potrero) {
      return res.status(404).json({
        error: 'Potrero no encontrado',
        message: `No existe un potrero con ID ${id}`
      });
    }

    // Verificar si tiene animales asignados
    const animalesAsignados = await Animal.count({
      where: { 
        potrero_id: id,
        activo: true
      }
    });

    if (animalesAsignados > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar',
        message: `El potrero tiene ${animalesAsignados} animales asignados. Muévalos antes de eliminar el potrero.`
      });
    }

    // Verificar si tiene alertas asociadas
    const alertasAsociadas = await Alerta.count({
      where: { potrero_id: id }
    });

    if (alertasAsociadas > 0) {
      // Soft delete para preservar datos históricos
      await potrero.update({ activo: false });

      logger.info(`Potrero desactivado (soft delete): ${potrero.nombre} (ID: ${id})`, {
        userId: req.user.id,
        potreroId: id,
        razon: 'Tiene alertas históricas asociadas'
      });

      res.status(200).json({
        message: 'Potrero desactivado exitosamente',
        note: 'El potrero se mantuvo en el sistema para preservar datos históricos de alertas'
      });
    } else {
      // Hard delete si no tiene datos asociados
      await potrero.destroy();

      logger.info(`Potrero eliminado completamente: ${potrero.nombre} (ID: ${id})`, {
        userId: req.user.id,
        potreroId: id
      });

      res.status(200).json({
        message: 'Potrero eliminado exitosamente'
      });
    }

  } catch (error) {
    logger.error('Error al eliminar potrero:', error);
    res.status(500).json({
      error: 'Error al eliminar potrero',
      message: error.message
    });
  }
};

/**
 * POST /api/potreros/:id/validar-punto
 * Validar si un punto (lat, lng) está dentro del potrero
 * Útil para detectar si un animal está dentro de la geocerca
 */
const validarPunto = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitud, longitud } = req.body;

    if (!latitud || !longitud) {
      return res.status(400).json({
        error: 'Coordenadas requeridas',
        message: 'Se requieren latitud y longitud'
      });
    }

    const potrero = await Potrero.findByPk(id);
    if (!potrero) {
      return res.status(404).json({
        error: 'Potrero no encontrado',
        message: `No existe un potrero con ID ${id}`
      });
    }

    if (!potrero.coordenadas || !Array.isArray(potrero.coordenadas)) {
      return res.status(400).json({
        error: 'Potrero sin coordenadas',
        message: 'El potrero no tiene coordenadas definidas'
      });
    }

    // Verificar si el punto está dentro del polígono
    const dentroDelPoligono = puntoEnPoligono(
      { lat: latitud, lng: longitud },
      potrero.coordenadas
    );

    res.status(200).json({
      potrero: {
        id: potrero.id,
        nombre: potrero.nombre
      },
      punto: {
        latitud,
        longitud
      },
      dentro_del_potrero: dentroDelPoligono
    });

  } catch (error) {
    logger.error('Error al validar punto en potrero:', error);
    res.status(500).json({
      error: 'Error al validar punto',
      message: error.message
    });
  }
};

/**
 * Función auxiliar para calcular el área de un polígono
 * Usando la fórmula del área de polígono por coordenadas geográficas
 */
function calcularAreaPoligono(coordenadas) {
  if (!coordenadas || coordenadas.length < 3) return 0;

  let area = 0;
  const n = coordenadas.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordenadas[i].lng * coordenadas[j].lat;
    area -= coordenadas[j].lng * coordenadas[i].lat;
  }

  area = Math.abs(area) / 2;

  // Convertir de grados cuadrados a metros cuadrados (aproximación)
  // 1 grado ≈ 111,320 metros en el ecuador
  const metrosXGrado = 111320;
  const areaMetrosCuadrados = area * metrosXGrado * metrosXGrado;

  // Convertir a hectáreas (1 hectárea = 10,000 m²)
  return parseFloat((areaMetrosCuadrados / 10000).toFixed(2));
}

/**
 * Función auxiliar para verificar si un punto está dentro de un polígono
 * Algoritmo Ray Casting
 */
function puntoEnPoligono(punto, poligono) {
  const { lat, lng } = punto;
  let dentro = false;

  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    if (
      ((poligono[i].lat > lat) !== (poligono[j].lat > lat)) &&
      (lng < (poligono[j].lng - poligono[i].lng) * (lat - poligono[i].lat) / (poligono[j].lat - poligono[i].lat) + poligono[i].lng)
    ) {
      dentro = !dentro;
    }
  }

  return dentro;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  validarPunto
};