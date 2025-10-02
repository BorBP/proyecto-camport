/**
 * Controlador de Reportes
 * RF9: Exportación de reportes en CSV y PDF
 * Generación de documentos para análisis y auditoría
 */

const reporteService = require('../services/reporteService');
const logger = require('../utils/logger');

/**
 * GET /api/reportes/animales
 * Generar reporte de animales con filtros
 */
const getReporteAnimales = async (req, res) => {
  try {
    const filtros = {
      potrero_id: req.query.potrero_id,
      grupo_id: req.query.grupo_id,
      sexo: req.query.sexo,
      estado_salud: req.query.estado_salud,
      edad_min: req.query.edad_min ? parseInt(req.query.edad_min) : undefined,
      edad_max: req.query.edad_max ? parseInt(req.query.edad_max) : undefined,
      con_collar: req.query.con_collar === 'true' ? true : 
                  req.query.con_collar === 'false' ? false : null
    };

    const reporte = await reporteService.generarReporteAnimales(filtros);

    logger.info(`Reporte de animales generado por ${req.user.nombre}`, {
      userId: req.user.id,
      filtros,
      totalRegistros: reporte.total_registros
    });

    res.status(200).json({
      data: reporte
    });

  } catch (error) {
    logger.error('Error generando reporte de animales:', error);
    res.status(500).json({
      error: 'Error generando reporte de animales',
      message: error.message
    });
  }
};

/**
 * GET /api/reportes/telemetria
 * Generar reporte de telemetría IoT
 */
const getReporteTelemetria = async (req, res) => {
  try {
    const filtros = {
      animal_id: req.query.animal_id,
      collar_id: req.query.collar_id,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      limite: req.query.limite ? parseInt(req.query.limite) : 1000
    };

    const reporte = await reporteService.generarReporteTelemetria(filtros);

    logger.info(`Reporte de telemetría generado por ${req.user.nombre}`, {
      userId: req.user.id,
      filtros,
      totalRegistros: reporte.total_registros
    });

    res.status(200).json({
      data: reporte
    });

  } catch (error) {
    logger.error('Error generando reporte de telemetría:', error);
    res.status(500).json({
      error: 'Error generando reporte de telemetría',
      message: error.message
    });
  }
};

/**
 * GET /api/reportes/alertas
 * Generar reporte de alertas del sistema
 */
const getReporteAlertas = async (req, res) => {
  try {
    const filtros = {
      tipo: req.query.tipo,
      severidad: req.query.severidad,
      estado: req.query.estado,
      animal_id: req.query.animal_id,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      limite: req.query.limite ? parseInt(req.query.limite) : 500
    };

    const reporte = await reporteService.generarReporteAlertas(filtros);

    logger.info(`Reporte de alertas generado por ${req.user.nombre}`, {
      userId: req.user.id,
      filtros,
      totalRegistros: reporte.total_registros
    });

    res.status(200).json({
      data: reporte
    });

  } catch (error) {
    logger.error('Error generando reporte de alertas:', error);
    res.status(500).json({
      error: 'Error generando reporte de alertas',
      message: error.message
    });
  }
};

/**
 * GET /api/reportes/potreros
 * Generar reporte de actividad por potreros
 */
const getReportePotreros = async (req, res) => {
  try {
    const filtros = {
      incluir_historico: req.query.incluir_historico === 'true'
    };

    const reporte = await reporteService.generarReportePotreros(filtros);

    logger.info(`Reporte de potreros generado por ${req.user.nombre}`, {
      userId: req.user.id,
      filtros,
      totalPotreros: reporte.total_potreros
    });

    res.status(200).json({
      data: reporte
    });

  } catch (error) {
    logger.error('Error generando reporte de potreros:', error);
    res.status(500).json({
      error: 'Error generando reporte de potreros',
      message: error.message
    });
  }
};

/**
 * POST /api/reportes/exportar
 * Exportar reporte en formato CSV o PDF
 */
const exportarReporte = async (req, res) => {
  try {
    const { 
      tipo_reporte,
      formato,
      filtros = {}
    } = req.body;

    if (!['animales', 'telemetria', 'alertas', 'potreros'].includes(tipo_reporte)) {
      return res.status(400).json({
        error: 'Tipo de reporte inválido',
        message: 'Los tipos válidos son: animales, telemetria, alertas, potreros'
      });
    }

    if (!['csv', 'pdf'].includes(formato)) {
      return res.status(400).json({
        error: 'Formato inválido',
        message: 'Los formatos válidos son: csv, pdf'
      });
    }

    // Generar el reporte según el tipo
    let reporte;
    switch (tipo_reporte) {
      case 'animales':
        reporte = await reporteService.generarReporteAnimales(filtros);
        break;
      case 'telemetria':
        reporte = await reporteService.generarReporteTelemetria(filtros);
        break;
      case 'alertas':
        reporte = await reporteService.generarReporteAlertas(filtros);
        break;
      case 'potreros':
        reporte = await reporteService.generarReportePotreros(filtros);
        break;
    }

    // Exportar en el formato solicitado
    let archivoExportado;
    let contentType;
    let extension;

    if (formato === 'csv') {
      archivoExportado = reporteService.convertirACSV(reporte);
      contentType = 'text/csv; charset=utf-8';
      extension = 'csv';
    } else if (formato === 'pdf') {
      archivoExportado = await reporteService.generarPDF(reporte);
      contentType = 'text/plain; charset=utf-8'; // Temporal hasta implementar PDF real
      extension = 'txt';
    }

    const nombreArchivo = `reporte_${tipo_reporte}_${Date.now()}.${extension}`;

    logger.info(`Reporte exportado: ${tipo_reporte} en ${formato} por ${req.user.nombre}`, {
      userId: req.user.id,
      tipoReporte: tipo_reporte,
      formato,
      nombreArchivo
    });

    // Para CSV directo
    if (formato === 'csv') {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
      res.status(200).send(archivoExportado);
    } else {
      // Para PDF (implementación básica)
      res.status(200).json({
        message: 'Reporte generado exitosamente',
        archivo: {
          nombre: archivoExportado.filename,
          contenido: archivoExportado.content,
          nota: archivoExportado.note
        }
      });
    }

  } catch (error) {
    logger.error('Error exportando reporte:', error);
    res.status(500).json({
      error: 'Error exportando reporte',
      message: error.message
    });
  }
};

/**
 * GET /api/reportes/estadisticas-generales
 * Obtener estadísticas generales del sistema
 */
const getEstadisticasGenerales = async (req, res) => {
  try {
    const { periodo = '30d' } = req.query;

    // Generar múltiples reportes para estadísticas
    const [
      reporteAnimales,
      reportePotreros,
      reporteAlertas
    ] = await Promise.all([
      reporteService.generarReporteAnimales({}),
      reporteService.generarReportePotreros({}),
      reporteService.generarReporteAlertas({
        fecha_desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
      })
    ]);

    const estadisticas = {
      fecha_generacion: new Date(),
      periodo,
      resumen_general: {
        total_animales: reporteAnimales.total_registros,
        total_potreros: reportePotreros.total_potreros,
        total_alertas_mes: reporteAlertas.total_registros,
        animales_con_collar: reporteAnimales.estadisticas_generales.con_collar,
        tasa_ocupacion_promedio: reportePotreros.estadisticas_generales.ocupacion_promedio
      },
      animales: reporteAnimales.estadisticas_generales,
      potreros: reportePotreros.estadisticas_generales,
      alertas: reporteAlertas.estadisticas
    };

    res.status(200).json({
      data: estadisticas
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas generales',
      message: error.message
    });
  }
};

module.exports = {
  getReporteAnimales,
  getReporteTelemetria,
  getReporteAlertas,
  getReportePotreros,
  exportarReporte,
  getEstadisticasGenerales
};