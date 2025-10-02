/**
 * Servicio de Reportes
 * RF9: Exportación de reportes
 * Generación de reportes en CSV y PDF para análisis y documentación
 */

const { Animal, Collar, Potrero, Telemetria, Alerta, Grupo, Usuario } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ReporteService {
  
  /**
   * Generar reporte de animales
   */
  async generarReporteAnimales(filtros = {}) {
    try {
      const { 
        potrero_id, 
        grupo_id, 
        sexo, 
        estado_salud,
        edad_min,
        edad_max,
        con_collar = null
      } = filtros;

      const where = { activo: true };
      
      // Aplicar filtros
      if (potrero_id) where.potrero_id = potrero_id;
      if (grupo_id) where.grupo_id = grupo_id;
      if (sexo) where.sexo = sexo;
      if (estado_salud) where.estado_salud = estado_salud;
      if (con_collar === true) where.collar_id = { [Op.ne]: null };
      if (con_collar === false) where.collar_id = null;
      
      if (edad_min || edad_max) {
        where.edad = {};
        if (edad_min) where.edad[Op.gte] = edad_min;
        if (edad_max) where.edad[Op.lte] = edad_max;
      }

      const animales = await Animal.findAll({
        where,
        include: [
          {
            model: Grupo,
            as: 'grupo',
            attributes: ['nombre', 'descripcion']
          },
          {
            model: Potrero,
            as: 'potrero',
            attributes: ['nombre', 'area']
          },
          {
            model: Collar,
            as: 'collar',
            attributes: ['identificador', 'modelo', 'bateria_actual']
          }
        ],
        order: [['nombre', 'ASC']]
      });

      // Obtener estadísticas adicionales para cada animal
      const reporteData = await Promise.all(
        animales.map(async (animal) => {
          const stats = await this.obtenerEstadisticasAnimal(animal.id);
          
          return {
            id: animal.id,
            nombre: animal.nombre,
            identificacion: animal.identificacion,
            raza: animal.raza,
            sexo: animal.sexo,
            edad: animal.edad,
            peso: animal.peso,
            color: animal.color,
            estado_salud: animal.estado_salud,
            grupo: animal.grupo?.nombre || 'Sin grupo',
            potrero: animal.potrero?.nombre || 'Sin asignar',
            collar: animal.collar?.identificador || 'Sin collar',
            collar_bateria: animal.collar?.bateria_actual || null,
            total_telemetria: stats.total_telemetria,
            total_alertas: stats.total_alertas,
            ultima_ubicacion: stats.ultima_ubicacion,
            fecha_registro: animal.createdAt
          };
        })
      );

      return {
        titulo: 'Reporte de Animales',
        fecha_generacion: new Date(),
        filtros_aplicados: filtros,
        total_registros: reporteData.length,
        estadisticas_generales: this.calcularEstadisticasAnimales(reporteData),
        datos: reporteData
      };

    } catch (error) {
      logger.error('Error generando reporte de animales:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de telemetría
   */
  async generarReporteTelemetria(filtros = {}) {
    try {
      const {
        animal_id,
        collar_id,
        fecha_desde,
        fecha_hasta,
        limite = 1000
      } = filtros;

      const where = {};
      
      if (animal_id) where.animal_id = animal_id;
      if (collar_id) {
        // Buscar collar por identificador
        const collar = await Collar.findOne({
          where: { identificador: collar_id }
        });
        if (collar) where.collar_id = collar.id;
      }
      
      if (fecha_desde && fecha_hasta) {
        where.timestamp = {
          [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)]
        };
      } else if (fecha_desde) {
        where.timestamp = { [Op.gte]: new Date(fecha_desde) };
      } else if (fecha_hasta) {
        where.timestamp = { [Op.lte]: new Date(fecha_hasta) };
      }

      const telemetrias = await Telemetria.findAll({
        where,
        limit: parseInt(limite),
        order: [['timestamp', 'DESC']],
        include: [
          {
            model: Animal,
            as: 'animal',
            attributes: ['nombre', 'identificacion', 'raza']
          },
          {
            model: Collar,
            as: 'collar',
            attributes: ['identificador', 'modelo']
          }
        ]
      });

      const reporteData = telemetrias.map(tel => ({
        timestamp: tel.timestamp,
        animal_nombre: tel.animal?.nombre,
        animal_identificacion: tel.animal?.identificacion,
        collar_identificador: tel.collar?.identificador,
        latitud: tel.latitud,
        longitud: tel.longitud,
        altitud: tel.altitud,
        precision: tel.precision,
        bateria: tel.bateria,
        temperatura: tel.temperatura,
        actividad: tel.actividad
      }));

      // Calcular estadísticas
      const estadisticas = this.calcularEstadisticasTelemetria(reporteData);

      return {
        titulo: 'Reporte de Telemetría',
        fecha_generacion: new Date(),
        filtros_aplicados: filtros,
        total_registros: reporteData.length,
        periodo: {
          desde: fecha_desde || 'Sin límite',
          hasta: fecha_hasta || 'Sin límite'
        },
        estadisticas,
        datos: reporteData
      };

    } catch (error) {
      logger.error('Error generando reporte de telemetría:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de alertas
   */
  async generarReporteAlertas(filtros = {}) {
    try {
      const {
        tipo,
        severidad,
        estado,
        animal_id,
        fecha_desde,
        fecha_hasta,
        limite = 500
      } = filtros;

      const where = {};
      
      if (tipo) where.tipo = tipo;
      if (severidad) where.severidad = severidad;
      if (estado) where.estado = estado;
      if (animal_id) where.animal_id = animal_id;
      
      if (fecha_desde && fecha_hasta) {
        where.fecha_creacion = {
          [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)]
        };
      } else if (fecha_desde) {
        where.fecha_creacion = { [Op.gte]: new Date(fecha_desde) };
      } else if (fecha_hasta) {
        where.fecha_creacion = { [Op.lte]: new Date(fecha_hasta) };
      }

      const alertas = await Alerta.findAll({
        where,
        limit: parseInt(limite),
        order: [['fecha_creacion', 'DESC']],
        include: [
          {
            model: Animal,
            as: 'animal',
            attributes: ['nombre', 'identificacion', 'raza']
          },
          {
            model: Usuario,
            as: 'usuario_atencion',
            attributes: ['nombre', 'email']
          }
        ]
      });

      const reporteData = alertas.map(alerta => ({
        id: alerta.id,
        tipo: alerta.tipo,
        titulo: alerta.titulo,
        descripcion: alerta.descripcion,
        severidad: alerta.severidad,
        estado: alerta.estado,
        animal_nombre: alerta.animal?.nombre,
        animal_identificacion: alerta.animal?.identificacion,
        fecha_creacion: alerta.fecha_creacion,
        fecha_atencion: alerta.fecha_atencion,
        fecha_resolucion: alerta.fecha_resolucion,
        atendido_por: alerta.usuario_atencion?.nombre,
        accion_tomada: alerta.accion_tomada,
        tiempo_resolucion: alerta.fecha_resolucion && alerta.fecha_creacion ?
          Math.round((alerta.fecha_resolucion - alerta.fecha_creacion) / (60 * 1000)) : null, // minutos
        datos_adicionales: alerta.datos_adicionales
      }));

      // Calcular estadísticas
      const estadisticas = this.calcularEstadisticasAlertas(reporteData);

      return {
        titulo: 'Reporte de Alertas',
        fecha_generacion: new Date(),
        filtros_aplicados: filtros,
        total_registros: reporteData.length,
        periodo: {
          desde: fecha_desde || 'Sin límite',
          hasta: fecha_hasta || 'Sin límite'
        },
        estadisticas,
        datos: reporteData
      };

    } catch (error) {
      logger.error('Error generando reporte de alertas:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de actividad por potrero
   */
  async generarReportePotreros(filtros = {}) {
    try {
      const { incluir_historico = false } = filtros;

      const potreros = await Potrero.findAll({
        where: { activo: true },
        include: [
          {
            model: Animal,
            as: 'animales',
            where: { activo: true },
            required: false,
            attributes: ['id', 'nombre', 'identificacion', 'sexo', 'estado_salud']
          }
        ],
        order: [['nombre', 'ASC']]
      });

      const reporteData = await Promise.all(
        potreros.map(async (potrero) => {
          const stats = await this.obtenerEstadisticasPotrero(potrero.id, incluir_historico);
          
          return {
            id: potrero.id,
            nombre: potrero.nombre,
            descripcion: potrero.descripcion,
            area: potrero.area,
            capacidad_maxima: potrero.capacidad_maxima,
            tipo_pasto: potrero.tipo_pasto,
            animales_actuales: potrero.animales?.length || 0,
            ocupacion_porcentaje: potrero.capacidad_maxima ? 
              Math.round(((potrero.animales?.length || 0) / potrero.capacidad_maxima) * 100) : null,
            animales_por_sexo: {
              machos: potrero.animales?.filter(a => a.sexo === 'macho').length || 0,
              hembras: potrero.animales?.filter(a => a.sexo === 'hembra').length || 0
            },
            estado_salud: {
              saludables: potrero.animales?.filter(a => a.estado_salud === 'saludable').length || 0,
              enfermos: potrero.animales?.filter(a => a.estado_salud === 'enfermo').length || 0,
              en_tratamiento: potrero.animales?.filter(a => a.estado_salud === 'en_tratamiento').length || 0
            },
            alertas_recientes: stats.alertas_recientes,
            fecha_creacion: potrero.createdAt
          };
        })
      );

      return {
        titulo: 'Reporte de Potreros',
        fecha_generacion: new Date(),
        total_potreros: reporteData.length,
        estadisticas_generales: this.calcularEstadisticasPotreros(reporteData),
        datos: reporteData
      };

    } catch (error) {
      logger.error('Error generando reporte de potreros:', error);
      throw error;
    }
  }

  /**
   * Convertir datos a formato CSV
   */
  convertirACSV(reporte) {
    try {
      if (!reporte.datos || reporte.datos.length === 0) {
        return 'No hay datos para exportar';
      }

      // Obtener headers de las claves del primer objeto
      const headers = Object.keys(reporte.datos[0]);
      
      // Crear filas CSV
      const csvRows = [
        // Header del reporte
        `# ${reporte.titulo}`,
        `# Generado el: ${reporte.fecha_generacion?.toLocaleString('es-CL')}`,
        `# Total de registros: ${reporte.total_registros || reporte.datos.length}`,
        '', // Línea vacía
        // Headers de columnas
        headers.join(','),
        // Datos
        ...reporte.datos.map(row => 
          headers.map(header => {
            let value = row[header];
            
            // Manejar valores especiales
            if (value === null || value === undefined) {
              value = '';
            } else if (typeof value === 'object') {
              value = JSON.stringify(value);
            } else if (typeof value === 'string' && value.includes(',')) {
              value = `"${value}"`;
            }
            
            return value;
          }).join(',')
        )
      ];

      return csvRows.join('\n');

    } catch (error) {
      logger.error('Error convirtiendo a CSV:', error);
      throw error;
    }
  }

  /**
   * Generar reporte en formato PDF básico (placeholder)
   * En implementación real se usaría una librería como puppeteer o jsPDF
   */
  async generarPDF(reporte) {
    try {
      // Por ahora retornamos un formato de texto estructurado
      // En implementación real se generaría un PDF con formato profesional
      
      const pdfContent = `
REPORTE: ${reporte.titulo}
Fecha de generación: ${reporte.fecha_generacion?.toLocaleString('es-CL')}
Total de registros: ${reporte.total_registros || reporte.datos?.length || 0}

${reporte.estadisticas_generales ? `
ESTADÍSTICAS GENERALES:
${JSON.stringify(reporte.estadisticas_generales, null, 2)}
` : ''}

${reporte.filtros_aplicados ? `
FILTROS APLICADOS:
${JSON.stringify(reporte.filtros_aplicados, null, 2)}
` : ''}

DATOS:
${reporte.datos ? reporte.datos.slice(0, 50).map((item, index) => `
${index + 1}. ${JSON.stringify(item, null, 2)}
`).join('') : 'Sin datos'}

${reporte.datos && reporte.datos.length > 50 ? 
  `\n... y ${reporte.datos.length - 50} registros más` : ''}
      `;

      return {
        content: pdfContent,
        filename: `${reporte.titulo.replace(/\s+/g, '_')}_${Date.now()}.txt`,
        note: 'Implementación básica - En producción se generaría PDF real'
      };

    } catch (error) {
      logger.error('Error generando PDF:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un animal específico
   */
  async obtenerEstadisticasAnimal(animalId) {
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
      } : null
    };
  }

  /**
   * Obtener estadísticas de un potrero específico
   */
  async obtenerEstadisticasPotrero(potreroId, incluirHistorico = false) {
    const whereAlertas = { potrero_id: potreroId };
    
    if (!incluirHistorico) {
      whereAlertas.fecha_creacion = {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
      };
    }

    const alertas = await Alerta.count({ where: whereAlertas });

    return {
      alertas_recientes: alertas
    };
  }

  /**
   * Calcular estadísticas generales de animales
   */
  calcularEstadisticasAnimales(animales) {
    const total = animales.length;
    
    return {
      total,
      por_sexo: {
        machos: animales.filter(a => a.sexo === 'macho').length,
        hembras: animales.filter(a => a.sexo === 'hembra').length
      },
      por_estado_salud: {
        saludables: animales.filter(a => a.estado_salud === 'saludable').length,
        enfermos: animales.filter(a => a.estado_salud === 'enfermo').length,
        en_tratamiento: animales.filter(a => a.estado_salud === 'en_tratamiento').length
      },
      con_collar: animales.filter(a => a.collar).length,
      sin_collar: animales.filter(a => !a.collar).length,
      edad_promedio: total > 0 ? 
        animales.filter(a => a.edad).reduce((sum, a) => sum + a.edad, 0) / 
        animales.filter(a => a.edad).length : 0
    };
  }

  /**
   * Calcular estadísticas de telemetría
   */
  calcularEstadisticasTelemetria(telemetrias) {
    if (telemetrias.length === 0) return {};

    const baterias = telemetrias.filter(t => t.bateria !== null).map(t => t.bateria);
    const temperaturas = telemetrias.filter(t => t.temperatura !== null).map(t => t.temperatura);

    return {
      total_registros: telemetrias.length,
      bateria: {
        promedio: baterias.length > 0 ? baterias.reduce((a, b) => a + b, 0) / baterias.length : 0,
        minima: baterias.length > 0 ? Math.min(...baterias) : null,
        maxima: baterias.length > 0 ? Math.max(...baterias) : null
      },
      temperatura: {
        promedio: temperaturas.length > 0 ? temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length : 0,
        minima: temperaturas.length > 0 ? Math.min(...temperaturas) : null,
        maxima: temperaturas.length > 0 ? Math.max(...temperaturas) : null
      },
      periodo_datos: telemetrias.length > 0 ? {
        desde: new Date(Math.min(...telemetrias.map(t => new Date(t.timestamp)))),
        hasta: new Date(Math.max(...telemetrias.map(t => new Date(t.timestamp))))
      } : null
    };
  }

  /**
   * Calcular estadísticas de alertas
   */
  calcularEstadisticasAlertas(alertas) {
    const total = alertas.length;
    
    if (total === 0) return {};

    const resueltas = alertas.filter(a => a.estado === 'atendida');
    const tiemposResolucion = alertas
      .filter(a => a.tiempo_resolucion !== null)
      .map(a => a.tiempo_resolucion);

    return {
      total,
      por_estado: {
        nuevas: alertas.filter(a => a.estado === 'nueva').length,
        en_proceso: alertas.filter(a => a.estado === 'en_proceso').length,
        atendidas: resueltas.length
      },
      por_tipo: alertas.reduce((acc, a) => {
        acc[a.tipo] = (acc[a.tipo] || 0) + 1;
        return acc;
      }, {}),
      por_severidad: alertas.reduce((acc, a) => {
        acc[a.severidad] = (acc[a.severidad] || 0) + 1;
        return acc;
      }, {}),
      tasa_resolucion: total > 0 ? Math.round((resueltas.length / total) * 100) : 0,
      tiempo_promedio_resolucion: tiemposResolucion.length > 0 ?
        Math.round(tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length) : null
    };
  }

  /**
   * Calcular estadísticas de potreros
   */
  calcularEstadisticasPotreros(potreros) {
    const total = potreros.length;
    const totalAnimales = potreros.reduce((sum, p) => sum + p.animales_actuales, 0);
    
    return {
      total_potreros: total,
      total_animales: totalAnimales,
      ocupacion_promedio: total > 0 ? 
        potreros.filter(p => p.ocupacion_porcentaje !== null)
          .reduce((sum, p) => sum + p.ocupacion_porcentaje, 0) / 
        potreros.filter(p => p.ocupacion_porcentaje !== null).length : 0,
      area_total: potreros.reduce((sum, p) => sum + (p.area || 0), 0),
      potreros_con_alertas: potreros.filter(p => p.alertas_recientes > 0).length
    };
  }
}

module.exports = new ReporteService();