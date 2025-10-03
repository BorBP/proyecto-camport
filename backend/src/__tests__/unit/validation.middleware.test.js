/**
 * Tests Unitarios para Middlewares de Validación
 * TDD - Test Driven Development
 */

const {
  validateRequired,
  validateEmail,
  validatePassword,
  validateUUID,
  validateRange,
  validateEnum,
  validateCoordinates,
  validateDate
} = require('../../middleware/validationMiddleware');

describe('Middleware de Validación', () => {
  
  let req, res, next;

  beforeEach(() => {
    // Mock de request, response y next
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateRequired', () => {
    
    it('debería pasar si todos los campos requeridos están presentes', () => {
      req.body = {
        nombre: 'Juan',
        email: 'juan@ejemplo.com',
        password: 'Pass123'
      };

      const middleware = validateRequired(['nombre', 'email', 'password']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debería fallar si falta un campo requerido', () => {
      req.body = {
        nombre: 'Juan',
        email: 'juan@ejemplo.com'
        // falta password
      };

      const middleware = validateRequired(['nombre', 'email', 'password']);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          camposFaltantes: ['password']
        })
      );
    });

    it('debería fallar si hay múltiples campos faltantes', () => {
      req.body = {
        nombre: 'Juan'
      };

      const middleware = validateRequired(['nombre', 'email', 'password', 'rol']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          camposFaltantes: expect.arrayContaining(['email', 'password', 'rol'])
        })
      );
    });

    it('debería fallar si un campo está presente pero vacío', () => {
      req.body = {
        nombre: '',
        email: 'juan@ejemplo.com'
      };

      const middleware = validateRequired(['nombre', 'email']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          camposFaltantes: ['nombre']
        })
      );
    });

    it('debería aceptar el número 0 como valor válido', () => {
      req.body = {
        cantidad: 0,
        precio: 100
      };

      const middleware = validateRequired(['cantidad', 'precio']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateEmail', () => {
    
    it('debería pasar con email válido', () => {
      req.body = { email: 'usuario@ejemplo.com' };

      validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debería rechazar email sin @', () => {
      req.body = { email: 'usuario.ejemplo.com' };

      validateEmail(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar email sin dominio', () => {
      req.body = { email: 'usuario@' };

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar email sin usuario', () => {
      req.body = { email: '@ejemplo.com' };

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería aceptar emails con subdominios', () => {
      req.body = { email: 'usuario@mail.ejemplo.com' };

      validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería aceptar emails con caracteres especiales válidos', () => {
      const emailsValidos = [
        'user+tag@ejemplo.com',
        'user.name@ejemplo.com',
        'user_name@ejemplo.com',
        'user-name@ejemplo.com'
      ];

      emailsValidos.forEach(email => {
        req.body = { email };
        next.mockClear();
        res.status.mockClear();

        validateEmail(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    it('debería pasar si no hay campo email (validación opcional)', () => {
      req.body = { nombre: 'Juan' };

      validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    
    it('debería pasar con contraseña válida', () => {
      req.body = { password: 'Password123' };

      validatePassword(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debería rechazar contraseña menor a 8 caracteres', () => {
      req.body = { password: 'Pass12' };

      validatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.stringContaining('8 caracteres')
        })
      );
    });

    it('debería rechazar contraseña sin letras', () => {
      req.body = { password: '12345678' };

      validatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar contraseña sin números', () => {
      req.body = { password: 'PasswordSinNumero' };

      validatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería aceptar contraseña con letras, números y símbolos', () => {
      req.body = { password: 'Pass123!@#' };

      validatePassword(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería pasar si no hay campo password (validación opcional)', () => {
      req.body = { nombre: 'Juan' };

      validatePassword(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateUUID', () => {
    
    it('debería pasar con UUID válido', () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validateUUID('id');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería rechazar UUID inválido', () => {
      req.params = { id: 'not-a-uuid' };

      const middleware = validateUUID('id');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.any(String)
        })
      );
    });

    it('debería rechazar UUID con formato incorrecto', () => {
      req.params = { id: '550e8400-e29b-41d4-a716-44665544000' }; // Un dígito menos

      const middleware = validateUUID('id');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería validar UUIDs en diferentes versiones', () => {
      const uuidsValidos = [
        '550e8400-e29b-41d4-a716-446655440000', // v4
      ];

      uuidsValidos.forEach(uuid => {
        req.params = { id: uuid };
        next.mockClear();
        res.status.mockClear();

        const middleware = validateUUID('id');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });
  });

  describe('validateRange', () => {
    
    it('debería pasar si el valor está dentro del rango', () => {
      req.body = { edad: 25 };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería rechazar valor menor al mínimo', () => {
      req.body = { edad: 15 };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar valor mayor al máximo', () => {
      req.body = { edad: 105 };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería aceptar el valor mínimo exacto', () => {
      req.body = { edad: 18 };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería aceptar el valor máximo exacto', () => {
      req.body = { edad: 100 };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería pasar si el campo no existe (validación opcional)', () => {
      req.body = { nombre: 'Juan' };

      const middleware = validateRange('edad', 18, 100);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateEnum', () => {
    
    it('debería pasar si el valor está en las opciones', () => {
      req.body = { rol: 'administrador' };

      const middleware = validateEnum('rol', ['administrador', 'capataz']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería rechazar valor no incluido en las opciones', () => {
      req.body = { rol: 'usuario' };

      const middleware = validateEnum('rol', ['administrador', 'capataz']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          opcionesPermitidas: ['administrador', 'capataz']
        })
      );
    });

    it('debería ser case-sensitive', () => {
      req.body = { rol: 'ADMINISTRADOR' };

      const middleware = validateEnum('rol', ['administrador', 'capataz']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar si el campo no existe (validación opcional)', () => {
      req.body = { nombre: 'Juan' };

      const middleware = validateEnum('rol', ['administrador', 'capataz']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateCoordinates', () => {
    
    it('debería pasar con coordenadas válidas', () => {
      req.body = {
        latitud: -33.4489,
        longitud: -70.6693
      };

      validateCoordinates(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería rechazar latitud fuera de rango (-90 a 90)', () => {
      req.body = {
        latitud: 95,
        longitud: -70.6693
      };

      validateCoordinates(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar longitud fuera de rango (-180 a 180)', () => {
      req.body = {
        latitud: -33.4489,
        longitud: -190
      };

      validateCoordinates(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería aceptar coordenadas en los límites', () => {
      const coordenadasLimite = [
        { latitud: -90, longitud: -180 },
        { latitud: 90, longitud: 180 },
        { latitud: 0, longitud: 0 }
      ];

      coordenadasLimite.forEach(coords => {
        req.body = coords;
        next.mockClear();
        res.status.mockClear();

        validateCoordinates(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    it('debería pasar si las coordenadas no están presentes', () => {
      req.body = { nombre: 'Santiago' };

      validateCoordinates(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateDate', () => {
    
    it('debería pasar con fecha válida en formato ISO', () => {
      req.body = { fecha: '2024-01-15' };

      const middleware = validateDate('fecha');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería pasar con fecha y hora válida', () => {
      req.body = { fecha: '2024-01-15T10:30:00Z' };

      const middleware = validateDate('fecha');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería rechazar fecha inválida', () => {
      req.body = { fecha: '2024-13-45' }; // Mes y día inválidos

      const middleware = validateDate('fecha');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería rechazar formato de fecha incorrecto', () => {
      req.body = { fecha: '15/01/2024' }; // Formato DD/MM/YYYY

      const middleware = validateDate('fecha');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar si el campo no existe (validación opcional)', () => {
      req.body = { nombre: 'Juan' };

      const middleware = validateDate('fecha');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
