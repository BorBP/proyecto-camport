/**
 * Servicio de Alertas Automáticas
 * RF6: Generación de alertas automáticas
 * Motor de reglas para detectar eventos críticos en tiempo real
 */

const { Alerta, Animal, Collar, Potrero, Telemetria } = require('../models');
const { emitAlerta } = require('../config/socket');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AlertService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.umbrales = {
      bateria_baja: 20,          // Porcentaje
      temperatura_alta: 39.5,    // Celsius
      inactividad_horas: 2,      // Horas sin movimiento
      tiempo_sin_datos: 30       // Minutos sin telemetría
    };
  }

  /**
   * Iniciar el motor de alertas
   */
  iniciar() {
    if (this.isRunning) {
      logger.warn('Motor de alertas ya está ejecutándose');
      return;
    }

    this.isRunning = true;

    // Ejecutar cada minuto
    this.intervalId = setInterval(() => {
      this.procesarAlertas();
    }, 60000);

    logger.info('Motor de alertas iniciado - procesando cada 60 segundos');
  }

  /**
   * Detener el motor de alertas
   */
  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Motor de alertas detenido');
  }

  /**
   * Procesar todas las alertas automáticas
   */
  async procesarAlertas() {
    try {
      logger.debug('Procesando alertas automáticas...');

      const [
        alertasFuga,
        alertasBateria,
        alertasTemperatura,
        alertasInactividad,
        alertasSinDatos
      ] = await Promise.allSettled([
        this.verificarFugasDeGeocercas(),
        this.verificarBateriaBaja(),
        this.verificarTemperaturaAlta(),
        this.verificarInactividad(),
        this.verificarCollarsSinDatos()
      ]);

      // Contar alertas generadas
      let totalAlertas = 0;
      [alertasFuga, alertasBateria, alertasTemperatura, alertasInactividad, alertasSinDatos]
        .forEach(result => {
          if (result.status === 'fulfilled') {
            totalAlertas += result.value || 0;
          } else {
            logger.error('Error en verificación de alertas:', result.reason);
          }
        });

      if (totalAlertas > 0) {
        logger.info(`Procesamiento completado: ${totalAlertas} alertas generadas`);
      }

    } catch (error) {
      logger.error('Error en procesamiento de alertas:', error);
    }
  }

  /**
   * Verificar fugas de geocercas
   */
  async verificarFugasDeGeocercas() {
    try {
      let alertasGeneradas = 0;

      // Obtener todos los animales activos con collar y potrero asignado
      const animales = await Animal.findAll({
        where: {
          activo: true,
          collar_id: { [Op.ne]: null },
          potrero_id: { [Op.ne]: null }
        },
        include: [
          {
            model: Collar,
            as: 'collar',
            where: { activo: true }
          },
          {
            model: Potrero,
            as: 'potrero',
            where: { activo: true }
          }
        ]
      });

      for (const animal of animales) {
        // Obtener última telemetría
        const ultimaTelemetria = await Telemetria.findOne({
          where: { animal_id: animal.id },
          order: [['timestamp', 'DESC']]
        });

        if (!ultimaTelemetria) continue;

        // Verificar si está dentro del potrero
        const dentroDelPotrero = this.puntoEnPoligono(
          { lat: ultimaTelemetria.latitud, lng: ultimaTelemetria.longitud },
          animal.potrero.coordenadas
        );

        if (!dentroDelPotrero) {
          // Verificar si ya existe una alerta de fuga activa reciente
          const alertaExistente = await Alerta.findOne({
            where: {
              animal_id: animal.id,
              tipo: 'fuga',
              estado: { [Op.in]: ['nueva', 'en_proceso'] },
              fecha_creacion: {
                [Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // Últimos 30 minutos
              }
            }
          });

          if (!alertaExistente) {
            await this.crearAlerta({
              tipo: 'fuga',
              titulo: 'Animal fuera del potrero',
              descripcion: `${animal.nombre} (${animal.identificacion}) salió del potrero ${animal.potrero.nombre}`,
              severidad: 'alta',
              animal_id: animal.id,
              potrero_id: animal.potrero_id,
              datos_adicionales: {
                ubicacion_actual: {
                  latitud: ultimaTelemetria.latitud,
                  longitud: ultimaTelemetria.longitud
                },
                potrero: animal.potrero.nombre,
                timestamp_deteccion: ultimaTelemetria.timestamp
              }
            });
            alertasGeneradas++;
          }
        }
      }

      return alertasGeneradas;
    } catch (error) {
      logger.error('Error verificando fugas:', error);
      return 0;
    }
  }

  /**
   * Verificar batería baja en collares
   */
  async verificarBateriaBaja() {
    try {
      let alertasGeneradas = 0;

      // Obtener última telemetría de cada collar activo
      const collares = await Collar.findAll({
        where: { activo: true, animal_id: { [Op.ne]: null } },
        include: [{
          model: Animal,
          as: 'animal',
          where: { activo: true }
        }]
      });

      for (const collar of collares) {
        const ultimaTelemetria = await Telemetria.findOne({
          where: { collar_id: collar.id },
          order: [['timestamp', 'DESC']]
        });

        if (!ultimaTelemetria) continue;

        if (ultimaTelemetria.bateria <= this.umbrales.bateria_baja) {
          // Verificar alerta existente
          const alertaExistente = await Alerta.findOne({
            where: {
              animal_id: collar.animal_id,
              tipo: 'bateria_baja',
              estado: { [Op.in]: ['nueva', 'en_proceso'] },
              fecha_creacion: {
                [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
              }
            }
          });

          if (!alertaExistente) {
            let severidad = 'media';
            if (ultimaTelemetria.bateria <= 10) severidad = 'alta';
            if (ultimaTelemetria.bateria <= 5) severidad = 'critica';

            await this.crearAlerta({
              tipo: 'bateria_baja',
              titulo: 'Batería baja en collar',
              descripcion: `Collar ${collar.identificador} del animal ${collar.animal.nombre} tiene ${ultimaTelemetria.bateria}% de batería`,
              severidad,
              animal_id: collar.animal_id,
              datos_adicionales: {
                collar_id: collar.identificador,
                bateria_actual: ultimaTelemetria.bateria,
                umbral_configurado: this.umbrales.bateria_baja
              }
            });
            alertasGeneradas++;
          }
        }
      }

      return alertasGeneradas;
    } catch (error) {
      logger.error('Error verificando batería:', error);
      return 0;
    }
  }

  /**
   * Verificar temperatura alta (fiebre)
   */
  async verificarTemperaturaAlta() {
    try {
      let alertasGeneradas = 0;

      // Obtener telemetrías recientes con temperatura
      const telemetriasRecientes = await Telemetria.findAll({
        where: {
          temperatura: { [Op.ne]: null },
          timestamp: {
            [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Última hora
          }
        },
        include: [{
          model: Animal,
          as: 'animal',
          where: { activo: true }
        }],
        order: [['timestamp', 'DESC']]
      });

      // Agrupar por animal y obtener la más reciente
      const telemetriasPorAnimal = {};
      telemetriasRecientes.forEach(tel => {
        if (!telemetriasPorAnimal[tel.animal_id] ||
            tel.timestamp > telemetriasPorAnimal[tel.animal_id].timestamp) {
          telemetriasPorAnimal[tel.animal_id] = tel;
        }
      });

      for (const telemetria of Object.values(telemetriasPorAnimal)) {
        if (telemetria.temperatura > this.umbrales.temperatura_alta) {
          // Verificar alerta existente
          const alertaExistente = await Alerta.findOne({
            where: {
              animal_id: telemetria.animal_id,
              tipo: 'temperatura_alta',
              estado: { [Op.in]: ['nueva', 'en_proceso'] },
              fecha_creacion: {
                [Op.gte]: new Date(Date.now() - 6 * 60 * 60 * 1000) // Últimas 6 horas
              }
            }
          });

          if (!alertaExistente) {
            let severidad = 'media';
            if (telemetria.temperatura >= 40) severidad = 'alta';
            if (telemetria.temperatura >= 41) severidad = 'critica';

            await this.crearAlerta({
              tipo: 'temperatura_alta',
              titulo: 'Temperatura corporal elevada',
              descripcion: `${telemetria.animal.nombre} presenta temperatura de ${telemetria.temperatura}°C (normal: <${this.umbrales.temperatura_alta}°C)`,
              severidad,
              animal_id: telemetria.animal_id,
              datos_adicionales: {
                temperatura_actual: telemetria.temperatura,
                umbral_configurado: this.umbrales.temperatura_alta,
                timestamp_deteccion: telemetria.timestamp,
                posible_fiebre: telemetria.temperatura >= 40
              }
            });
            alertasGeneradas++;
          }
        }
      }

      return alertasGeneradas;
    } catch (error) {
      logger.error('Error verificando temperatura:', error);
      return 0;
    }
  }

  /**
   * Verificar inactividad prolongada
   */
  async verificarInactividad() {
    try {
      let alertasGeneradas = 0;
      const tiempoLimite = new Date(Date.now() - this.umbrales.inactividad_horas * 60 * 60 * 1000);

      const animales = await Animal.findAll({
        where: {
          activo: true,
          collar_id: { [Op.ne]: null }
        }
      });

      for (const animal of animales) {
        // Obtener telemetrías en el período de inactividad
        const telemetriasRecientes = await Telemetria.findAll({
          where: {
            animal_id: animal.id,
            timestamp: { [Op.gte]: tiempoLimite }
          },
          order: [['timestamp', 'ASC']]
        });

        if (telemetriasRecientes.length >= 2) {
          // Verificar si hay movimiento significativo
          let hayMovimiento = false;
          for (let i = 1; i < telemetriasRecientes.length; i++) {
            const distancia = this.calcularDistancia(
              telemetriasRecientes[i-1].latitud, telemetriasRecientes[i-1].longitud,
              telemetriasRecientes[i].latitud, telemetriasRecientes[i].longitud
            );

            // Si se movió más de 10 metros, hay actividad
            if (distancia > 0.01) { // ~10 metros
              hayMovimiento = true;
              break;
            }
          }

          if (!hayMovimiento) {
            // Verificar alerta existente
            const alertaExistente = await Alerta.findOne({
              where: {
                animal_id: animal.id,
                tipo: 'inactividad',
                estado: { [Op.in]: ['nueva', 'en_proceso'] },
                fecha_creacion: {
                  [Op.gte]: new Date(Date.now() - 12 * 60 * 60 * 1000) // Últimas 12 horas
                }
              }
            });

            if (!alertaExistente) {
              await this.crearAlerta({
                tipo: 'inactividad',
                titulo: 'Inactividad prolongada detectada',
                descripcion: `${animal.nombre} no presenta movimiento significativo en las últimas ${this.umbrales.inactividad_horas} horas`,
                severidad: 'media',
                animal_id: animal.id,
                datos_adicionales: {
                  horas_sin_movimiento: this.umbrales.inactividad_horas,
                  ultima_ubicacion: telemetriasRecientes.length > 0 ? {
                    latitud: telemetriasRecientes[telemetriasRecientes.length - 1].latitud,
                    longitud: telemetriasRecientes[telemetriasRecientes.length - 1].longitud,
                    timestamp: telemetriasRecientes[telemetriasRecientes.length - 1].timestamp
                  } : null
                }
              });
              alertasGeneradas++;
            }
          }
        }
      }

      return alertasGeneradas;
    } catch (error) {
      logger.error('Error verificando inactividad:', error);
      return 0;
    }
  }

  /**
   * Verificar collares sin datos
   */
  async verificarCollarsSinDatos() {
    try {
      let alertasGeneradas = 0;
      const tiempoLimite = new Date(Date.now() - this.umbrales.tiempo_sin_datos * 60 * 1000);

      const collares = await Collar.findAll({
        where: {
          activo: true,
          animal_id: { [Op.ne]: null },
          estado: 'activo'
        },
        include: [{
          model: Animal,
          as: 'animal',
          where: { activo: true }
        }]
      });

      for (const collar of collares) {
        const ultimaTelemetria = await Telemetria.findOne({
          where: { collar_id: collar.id },
          order: [['timestamp', 'DESC']]
        });

        if (!ultimaTelemetria || ultimaTelemetria.timestamp < tiempoLimite) {
          // Verificar alerta existente
          const alertaExistente = await Alerta.findOne({
            where: {
              animal_id: collar.animal_id,
              tipo: 'sin_datos',
              estado: { [Op.in]: ['nueva', 'en_proceso'] },
              fecha_creacion: {
                [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
              }
            }
          });

          if (!alertaExistente) {
            const minutosDesdeUltimoDato = ultimaTelemetria
              ? Math.floor((Date.now() - ultimaTelemetria.timestamp) / (60 * 1000))
              : null;

            await this.crearAlerta({
              tipo: 'sin_datos',
              titulo: 'Collar sin transmitir datos',
              descripcion: `Collar ${collar.identificador} del animal ${collar.animal.nombre} no transmite datos desde hace ${minutosDesdeUltimoDato || 'más de'} ${minutosDesdeUltimoDato ? 'minutos' : '30 minutos'}`,
              severidad: 'media',
              animal_id: collar.animal_id,
              datos_adicionales: {
                collar_id: collar.identificador,
                minutos_sin_datos: minutosDesdeUltimoDato,
                ultima_transmision: ultimaTelemetria?.timestamp || null
              }
            });
            alertasGeneradas++;
          }
        }
      }

      return alertasGeneradas;
    } catch (error) {
      logger.error('Error verificando collares sin datos:', error);
      return 0;
    }
  }

  /**
   * Crear una nueva alerta y notificar
   */
  async crearAlerta(datosAlerta) {
    try {
      const alerta = await Alerta.create({
        ...datosAlerta,
        estado: 'nueva',
        fecha_creacion: new Date()
      });

      // Obtener alerta completa con relaciones
      const alertaCompleta = await Alerta.findByPk(alerta.id, {
        include: [
          {
            model: Animal,
            as: 'animal',
            attributes: ['id', 'nombre', 'identificacion']
          }
        ]
      });

      // Emitir notificación via Socket.io
      emitAlerta({
        tipo: 'nueva_alerta',
        data: alertaCompleta
      });

      logger.info(`Alerta creada: ${datosAlerta.tipo} - ${datosAlerta.titulo}`, {
        alertaId: alerta.id,
        animalId: datosAlerta.animal_id,
        severidad: datosAlerta.severidad
      });

      return alerta;
    } catch (error) {
      logger.error('Error creando alerta:', error);
      throw error;
    }
  }

  /**
   * Configurar umbrales personalizados
   */
  configurarUmbrales(nuevosUmbrales) {
    this.umbrales = { ...this.umbrales, ...nuevosUmbrales };
    logger.info('Umbrales de alertas actualizados:', this.umbrales);
  }

  /**
   * Obtener configuración actual
   */
  getConfiguracion() {
    return {
      isRunning: this.isRunning,
      umbrales: this.umbrales,
      intervalos: {
        procesamiento_segundos: 60,
        verificacion_fuga_minutos: 30,
        verificacion_bateria_horas: 24,
        verificacion_temperatura_horas: 6,
        verificacion_inactividad_horas: 12,
        verificacion_sin_datos_horas: 2
      }
    };
  }

  /**
   * Función auxiliar: Verificar si un punto está dentro de un polígono
   */
  puntoEnPoligono(punto, poligono) {
    if (!poligono || !Array.isArray(poligono) || poligono.length < 3) {
      return false;
    }

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

  /**
   * Función auxiliar: Calcular distancia entre dos puntos en km
   */
  calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Crear instancia singleton
const alertService = new AlertService();

module.exports = alertService;
