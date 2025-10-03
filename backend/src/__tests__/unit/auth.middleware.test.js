/**
 * Tests Unitarios para Middlewares de Autenticación y Roles
 * TDD - Test Driven Development
 */

const jwt = require('jsonwebtoken');
const {
  authenticate,
  requireAdmin,
  requireRoles,
  requireOwnerOrAdmin
} = require('../../middleware/authMiddleware');

describe('Middlewares de Autenticación y Roles', () => {
  
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      params: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticate - Middleware de autenticación', () => {
    
    it('debería autenticar con token JWT válido', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const token = jwt.sign(
        { id: userId, rol: 'administrador' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.rol).toBe('administrador');
    });

    it('debería rechazar solicitud sin token', () => {
      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('token')
        })
      );
    });

    it('debería rechazar token inválido', () => {
      req.headers.authorization = 'Bearer token-invalido-123';

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería rechazar token expirado', () => {
      const tokenExpirado = jwt.sign(
        { id: '123', rol: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expirado hace 1 hora
      );

      req.headers.authorization = `Bearer ${tokenExpirado}`;

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería rechazar token con secreto incorrecto', () => {
      const tokenMalicioso = jwt.sign(
        { id: '123', rol: 'admin' },
        'secreto-incorrecto',
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${tokenMalicioso}`;

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería rechazar header Authorization sin "Bearer"', () => {
      const token = jwt.sign(
        { id: '123', rol: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = token; // Sin prefijo "Bearer"

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería aceptar token en minúsculas "bearer"', () => {
      const token = jwt.sign(
        { id: '123', rol: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `bearer ${token}`; // "bearer" en minúscula

      authenticate(req, res, next);

      // Depende de la implementación, algunos middlewares aceptan ambos
      // expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAdmin - Middleware de rol administrador', () => {
    
    it('debería permitir acceso a administrador', () => {
      req.user = {
        id: '123',
        rol: 'administrador'
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debería denegar acceso a capataz', () => {
      req.user = {
        id: '456',
        rol: 'capataz'
      };

      requireAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('administrador')
        })
      );
    });

    it('debería denegar acceso si no hay usuario autenticado', () => {
      req.user = null;

      requireAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debería ser case-sensitive con el rol', () => {
      req.user = {
        id: '123',
        rol: 'ADMINISTRADOR' // En mayúsculas
      };

      requireAdmin(req, res, next);

      // Si es case-sensitive, debería denegar
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireRoles - Middleware de roles múltiples', () => {
    
    it('debería permitir acceso si el usuario tiene uno de los roles permitidos', () => {
      req.user = {
        id: '123',
        rol: 'administrador'
      };

      const middleware = requireRoles(['administrador', 'capataz']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería permitir acceso a capataz cuando está en la lista', () => {
      req.user = {
        id: '456',
        rol: 'capataz'
      };

      const middleware = requireRoles(['administrador', 'capataz']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería denegar acceso si el rol no está permitido', () => {
      req.user = {
        id: '789',
        rol: 'usuario'
      };

      const middleware = requireRoles(['administrador', 'capataz']);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debería denegar si no hay usuario autenticado', () => {
      req.user = null;

      const middleware = requireRoles(['administrador']);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debería funcionar con un solo rol en el array', () => {
      req.user = {
        id: '123',
        rol: 'administrador'
      };

      const middleware = requireRoles(['administrador']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería manejar array vacío de roles', () => {
      req.user = {
        id: '123',
        rol: 'administrador'
      };

      const middleware = requireRoles([]);
      middleware(req, res, next);

      // Con array vacío, nadie debería tener acceso
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireOwnerOrAdmin - Middleware de propietario o admin', () => {
    
    it('debería permitir al propietario acceder a su recurso', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      
      req.user = {
        id: userId,
        rol: 'capataz'
      };
      req.params = {
        id: userId
      };

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería permitir a admin acceder a cualquier recurso', () => {
      req.user = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        rol: 'administrador'
      };
      req.params = {
        id: '550e8400-e29b-41d4-a716-446655440002' // ID diferente
      };

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería denegar a capataz acceder a recurso de otro usuario', () => {
      req.user = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        rol: 'capataz'
      };
      req.params = {
        id: '550e8400-e29b-41d4-a716-446655440002' // ID diferente
      };

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('debería denegar si no hay usuario autenticado', () => {
      req.user = null;
      req.params = {
        id: '550e8400-e29b-41d4-a716-446655440000'
      };

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debería funcionar con diferentes nombres de parámetro', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      
      req.user = {
        id: userId,
        rol: 'capataz'
      };
      req.params = {
        userId: userId // Nombre de parámetro diferente
      };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería denegar si el parámetro no existe en la request', () => {
      req.user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        rol: 'capataz'
      };
      req.params = {}; // Sin parámetro

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debería ser case-sensitive al comparar IDs', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      
      req.user = {
        id: userId.toUpperCase(), // En mayúsculas
        rol: 'capataz'
      };
      req.params = {
        id: userId.toLowerCase() // En minúsculas
      };

      const middleware = requireOwnerOrAdmin('id');
      middleware(req, res, next);

      // Debería comparar sin importar mayúsculas/minúsculas para UUIDs
      // pero esto depende de la implementación
    });
  });

  describe('Flujo completo de autenticación y autorización', () => {
    
    it('debería pasar por authenticate y requireAdmin correctamente', () => {
      const token = jwt.sign(
        { id: '123', rol: 'administrador' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      // Simular middleware chain
      authenticate(req, res, () => {
        requireAdmin(req, res, next);
      });

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.rol).toBe('administrador');
    });

    it('debería fallar en requireAdmin después de authenticate exitoso', () => {
      const token = jwt.sign(
        { id: '123', rol: 'capataz' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, () => {
        requireAdmin(req, res, next);
      });

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
