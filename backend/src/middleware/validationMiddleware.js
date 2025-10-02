/**
 * Middleware de Validación de Datos
 * Valida los datos de entrada en las solicitudes
 */

/**
 * Valida que los campos requeridos estén presentes
 * @param {Array<string>} camposRequeridos - Array con nombres de campos requeridos
 */
const validateRequired = (camposRequeridos) => {
  return (req, res, next) => {
    try {
      const camposFaltantes = [];

      // Verificar cada campo requerido
      for (const campo of camposRequeridos) {
        // Buscar el campo en body, params o query
        const valor = req.body[campo] ?? req.params[campo] ?? req.query[campo];

        // Verificar que el valor exista y no sea vacío
        if (valor === undefined || valor === null || valor === '') {
          camposFaltantes.push(campo);
        }
      }

      // Si hay campos faltantes, retornar error
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          error: 'Campos requeridos faltantes',
          message: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`,
          camposFaltantes
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateRequired:', error);
      return res.status(500).json({
        error: 'Error de validación',
        message: 'Ocurrió un error al validar los datos'
      });
    }
  };
};

/**
 * Valida el formato de email
 */
const validateEmail = (req, res, next) => {
  try {
    const email = req.body.email;

    if (!email) {
      return next(); // Si no hay email, dejar que validateRequired lo maneje
    }

    // Expresión regular para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'El formato del email no es válido'
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateEmail:', error);
    return res.status(500).json({
      error: 'Error de validación',
      message: 'Ocurrió un error al validar el email'
    });
  }
};

/**
 * Valida la fortaleza de la contraseña
 */
const validatePassword = (req, res, next) => {
  try {
    const password = req.body.password;

    if (!password) {
      return next(); // Si no hay password, dejar que validateRequired lo maneje
    }

    // Requisitos: mínimo 8 caracteres, al menos una letra y un número
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    const tieneLetra = /[a-zA-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);

    if (!tieneLetra || !tieneNumero) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La contraseña debe contener al menos una letra y un número'
      });
    }

    next();
  } catch (error) {
    console.error('Error en validatePassword:', error);
    return res.status(500).json({
      error: 'Error de validación',
      message: 'Ocurrió un error al validar la contraseña'
    });
  }
};

/**
 * Valida que un valor sea un UUID válido
 * @param {string} paramName - Nombre del parámetro a validar
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    try {
      const valor = req.params[paramName] || req.body[paramName] || req.query[paramName];

      if (!valor) {
        return next(); // Si no hay valor, dejar que validateRequired lo maneje
      }

      // Expresión regular para validar UUID v4
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(valor)) {
        return res.status(400).json({
          error: 'ID inválido',
          message: `El ${paramName} proporcionado no es un ID válido`
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateUUID:', error);
      return res.status(500).json({
        error: 'Error de validación',
        message: 'Ocurrió un error al validar el ID'
      });
    }
  };
};

/**
 * Valida que un valor esté dentro de un rango numérico
 * @param {string} campo - Nombre del campo
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 */
const validateRange = (campo, min, max) => {
  return (req, res, next) => {
    try {
      const valor = req.body[campo] || req.query[campo];

      if (valor === undefined || valor === null) {
        return next(); // Si no hay valor, continuar
      }

      const numero = Number(valor);

      if (isNaN(numero)) {
        return res.status(400).json({
          error: 'Valor inválido',
          message: `${campo} debe ser un número`
        });
      }

      if (numero < min || numero > max) {
        return res.status(400).json({
          error: 'Valor fuera de rango',
          message: `${campo} debe estar entre ${min} y ${max}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateRange:', error);
      return res.status(500).json({
        error: 'Error de validación',
        message: 'Ocurrió un error al validar el rango'
      });
    }
  };
};

/**
 * Valida que un valor esté dentro de opciones permitidas
 * @param {string} campo - Nombre del campo
 * @param {Array} opcionesPermitidas - Array con valores permitidos
 */
const validateEnum = (campo, opcionesPermitidas) => {
  return (req, res, next) => {
    try {
      const valor = req.body[campo] || req.query[campo] || req.params[campo];

      if (!valor) {
        return next(); // Si no hay valor, continuar
      }

      if (!opcionesPermitidas.includes(valor)) {
        return res.status(400).json({
          error: 'Valor inválido',
          message: `${campo} debe ser uno de: ${opcionesPermitidas.join(', ')}`,
          opcionesPermitidas
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateEnum:', error);
      return res.status(500).json({
        error: 'Error de validación',
        message: 'Ocurrió un error al validar las opciones'
      });
    }
  };
};

/**
 * Valida coordenadas geográficas
 */
const validateCoordinates = (req, res, next) => {
  try {
    const { latitud, longitud } = req.body;

    if (latitud !== undefined && latitud !== null) {
      const lat = Number(latitud);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          error: 'Latitud inválida',
          message: 'La latitud debe ser un número entre -90 y 90'
        });
      }
    }

    if (longitud !== undefined && longitud !== null) {
      const lng = Number(longitud);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'Longitud inválida',
          message: 'La longitud debe ser un número entre -180 y 180'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en validateCoordinates:', error);
    return res.status(500).json({
      error: 'Error de validación',
      message: 'Ocurrió un error al validar las coordenadas'
    });
  }
};

/**
 * Valida formato de fecha ISO
 * @param {string} campo - Nombre del campo de fecha
 */
const validateDate = (campo) => {
  return (req, res, next) => {
    try {
      const valor = req.body[campo] || req.query[campo];

      if (!valor) {
        return next(); // Si no hay valor, continuar
      }

      const fecha = new Date(valor);

      if (isNaN(fecha.getTime())) {
        return res.status(400).json({
          error: 'Fecha inválida',
          message: `${campo} debe ser una fecha válida en formato ISO`
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateDate:', error);
      return res.status(500).json({
        error: 'Error de validación',
        message: 'Ocurrió un error al validar la fecha'
      });
    }
  };
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateRange,
  validateEnum,
  validateCoordinates,
  validateDate
};
