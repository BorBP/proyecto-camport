/**
 * Tests Unitarios para el Modelo Usuario
 * TDD - Test Driven Development
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configurar base de datos de prueba en memoria
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
  define: {
    timestamps: true
  }
});

// Importar el modelo después de configurar sequelize
const defineUsuario = require('../../models/Usuario');
const Usuario = defineUsuario(sequelize);

describe('Modelo Usuario', () => {
  
  // Setup: Sincronizar la base de datos antes de cada test
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  // Teardown: Cerrar la conexión después de todos los tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('Creación de usuarios', () => {
    
    it('debería crear un usuario válido con todos los campos', async () => {
      const usuarioData = {
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        password: 'Password123',
        rol: 'capataz',
        activo: true
      };

      const usuario = await Usuario.create(usuarioData);

      expect(usuario.id).toBeDefined();
      expect(usuario.nombre).toBe(usuarioData.nombre);
      expect(usuario.email).toBe(usuarioData.email);
      expect(usuario.rol).toBe(usuarioData.rol);
      expect(usuario.activo).toBe(true);
      expect(usuario.createdAt).toBeDefined();
      expect(usuario.updatedAt).toBeDefined();
    });

    it('debería encriptar la contraseña automáticamente al crear', async () => {
      const plainPassword = 'MiPassword123';
      const usuario = await Usuario.create({
        nombre: 'Test User',
        email: 'test@ejemplo.com',
        password: plainPassword,
        rol: 'capataz'
      });

      // La contraseña guardada NO debe ser la misma que la original
      expect(usuario.password).not.toBe(plainPassword);
      
      // Debe ser un hash válido de bcrypt
      expect(usuario.password).toMatch(/^\$2[aby]\$\d{2}\$/);
      
      // Debe poder compararse correctamente
      const isValid = await bcrypt.compare(plainPassword, usuario.password);
      expect(isValid).toBe(true);
    });

    it('debería establecer activo=true por defecto', async () => {
      const usuario = await Usuario.create({
        nombre: 'Usuario Activo',
        email: 'activo@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      expect(usuario.activo).toBe(true);
    });

    it('debería generar un UUID automáticamente', async () => {
      const usuario = await Usuario.create({
        nombre: 'UUID Test',
        email: 'uuid@ejemplo.com',
        password: 'Pass123',
        rol: 'administrador'
      });

      // Validar formato UUID v4
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(usuario.id).toMatch(uuidRegex);
    });
  });

  describe('Validaciones de campos requeridos', () => {
    
    it('debería fallar si falta el nombre', async () => {
      await expect(
        Usuario.create({
          email: 'sin-nombre@ejemplo.com',
          password: 'Pass123',
          rol: 'capataz'
        })
      ).rejects.toThrow();
    });

    it('debería fallar si falta el email', async () => {
      await expect(
        Usuario.create({
          nombre: 'Sin Email',
          password: 'Pass123',
          rol: 'capataz'
        })
      ).rejects.toThrow();
    });

    it('debería fallar si falta la contraseña', async () => {
      await expect(
        Usuario.create({
          nombre: 'Sin Password',
          email: 'sin-pass@ejemplo.com',
          rol: 'capataz'
        })
      ).rejects.toThrow();
    });

    it('debería fallar si falta el rol', async () => {
      await expect(
        Usuario.create({
          nombre: 'Sin Rol',
          email: 'sin-rol@ejemplo.com',
          password: 'Pass123'
        })
      ).rejects.toThrow();
    });
  });

  describe('Validaciones de formato de email', () => {
    
    it('debería aceptar emails válidos', async () => {
      const emailsValidos = [
        'usuario@ejemplo.com',
        'nombre.apellido@empresa.co',
        'test123@test-domain.io',
        'user+tag@ejemplo.com'
      ];

      for (const email of emailsValidos) {
        const usuario = await Usuario.create({
          nombre: 'Test',
          email: email,
          password: 'Pass123',
          rol: 'capataz'
        });
        expect(usuario.email).toBe(email);
      }
    });

    it('debería rechazar emails inválidos', async () => {
      const emailsInvalidos = [
        'sin-arroba.com',
        '@sin-usuario.com',
        'sin-dominio@',
        'espacios en@medio.com',
        'sin.extension@dominio'
      ];

      for (const email of emailsInvalidos) {
        await expect(
          Usuario.create({
            nombre: 'Test',
            email: email,
            password: 'Pass123',
            rol: 'capataz'
          })
        ).rejects.toThrow();
      }
    });

    it('debería convertir el email a minúsculas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test Mayusculas',
        email: 'MAYUSCULAS@EJEMPLO.COM',
        password: 'Pass123',
        rol: 'capataz'
      });

      expect(usuario.email).toBe('mayusculas@ejemplo.com');
    });
  });

  describe('Validaciones de rol', () => {
    
    it('debería aceptar rol "administrador"', async () => {
      const usuario = await Usuario.create({
        nombre: 'Admin',
        email: 'admin@ejemplo.com',
        password: 'Pass123',
        rol: 'administrador'
      });

      expect(usuario.rol).toBe('administrador');
    });

    it('debería aceptar rol "capataz"', async () => {
      const usuario = await Usuario.create({
        nombre: 'Capataz',
        email: 'capataz@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      expect(usuario.rol).toBe('capataz');
    });

    it('debería rechazar roles inválidos', async () => {
      const rolesInvalidos = ['usuario', 'moderador', 'superadmin', 'guest'];

      for (const rol of rolesInvalidos) {
        await expect(
          Usuario.create({
            nombre: 'Test',
            email: `test-${rol}@ejemplo.com`,
            password: 'Pass123',
            rol: rol
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Restricción de unicidad de email', () => {
    
    it('debería permitir crear usuarios con emails diferentes', async () => {
      await Usuario.create({
        nombre: 'Usuario 1',
        email: 'usuario1@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      await Usuario.create({
        nombre: 'Usuario 2',
        email: 'usuario2@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      const count = await Usuario.count();
      expect(count).toBe(2);
    });

    it('debería rechazar emails duplicados', async () => {
      const email = 'duplicado@ejemplo.com';

      await Usuario.create({
        nombre: 'Usuario Original',
        email: email,
        password: 'Pass123',
        rol: 'capataz'
      });

      await expect(
        Usuario.create({
          nombre: 'Usuario Duplicado',
          email: email,
          password: 'Pass456',
          rol: 'administrador'
        })
      ).rejects.toThrow();
    });

    it('debería considerar emails case-insensitive para unicidad', async () => {
      await Usuario.create({
        nombre: 'Usuario Minuscula',
        email: 'test@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      // Intentar crear con el mismo email pero en mayúsculas
      await expect(
        Usuario.create({
          nombre: 'Usuario Mayuscula',
          email: 'TEST@EJEMPLO.COM',
          password: 'Pass456',
          rol: 'capataz'
        })
      ).rejects.toThrow();
    });
  });

  describe('Método comparePassword', () => {
    
    it('debería validar contraseña correcta', async () => {
      const plainPassword = 'MiPassword123';
      const usuario = await Usuario.create({
        nombre: 'Test Password',
        email: 'password@ejemplo.com',
        password: plainPassword,
        rol: 'capataz'
      });

      const isValid = await usuario.comparePassword(plainPassword);
      expect(isValid).toBe(true);
    });

    it('debería rechazar contraseña incorrecta', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test Password',
        email: 'password2@ejemplo.com',
        password: 'PasswordCorrecto123',
        rol: 'capataz'
      });

      const isValid = await usuario.comparePassword('PasswordIncorrecto456');
      expect(isValid).toBe(false);
    });

    it('debería ser case-sensitive al validar contraseñas', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test Case',
        email: 'case@ejemplo.com',
        password: 'Password123',
        rol: 'capataz'
      });

      const isValidLower = await usuario.comparePassword('password123');
      const isValidUpper = await usuario.comparePassword('PASSWORD123');
      
      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
    });
  });

  describe('Actualización de contraseña', () => {
    
    it('debería re-encriptar la contraseña al actualizar', async () => {
      const usuario = await Usuario.create({
        nombre: 'Update Test',
        email: 'update@ejemplo.com',
        password: 'PasswordOriginal123',
        rol: 'capataz'
      });

      const hashOriginal = usuario.password;

      // Actualizar contraseña
      usuario.password = 'NuevaPassword456';
      await usuario.save();

      // El nuevo hash debe ser diferente
      expect(usuario.password).not.toBe(hashOriginal);
      expect(usuario.password).not.toBe('NuevaPassword456');

      // Debe poder validar la nueva contraseña
      const isValid = await usuario.comparePassword('NuevaPassword456');
      expect(isValid).toBe(true);

      // No debe poder validar la contraseña antigua
      const isOldValid = await usuario.comparePassword('PasswordOriginal123');
      expect(isOldValid).toBe(false);
    });

    it('no debería re-encriptar si no se modifica la contraseña', async () => {
      const usuario = await Usuario.create({
        nombre: 'No Update Password',
        email: 'noupdate@ejemplo.com',
        password: 'Password123',
        rol: 'capataz'
      });

      const hashOriginal = usuario.password;

      // Actualizar solo el nombre
      usuario.nombre = 'Nombre Actualizado';
      await usuario.save();

      // El hash de la contraseña debe permanecer igual
      expect(usuario.password).toBe(hashOriginal);
    });
  });

  describe('Consultas y búsquedas', () => {
    
    beforeEach(async () => {
      // Crear usuarios de prueba
      await Usuario.bulkCreate([
        { nombre: 'Admin 1', email: 'admin1@ejemplo.com', password: 'Pass123', rol: 'administrador', activo: true },
        { nombre: 'Admin 2', email: 'admin2@ejemplo.com', password: 'Pass123', rol: 'administrador', activo: false },
        { nombre: 'Capataz 1', email: 'capataz1@ejemplo.com', password: 'Pass123', rol: 'capataz', activo: true },
        { nombre: 'Capataz 2', email: 'capataz2@ejemplo.com', password: 'Pass123', rol: 'capataz', activo: true },
      ]);
    });

    it('debería encontrar usuarios por rol', async () => {
      const administradores = await Usuario.findAll({ where: { rol: 'administrador' } });
      const capataces = await Usuario.findAll({ where: { rol: 'capataz' } });

      expect(administradores.length).toBe(2);
      expect(capataces.length).toBe(2);
    });

    it('debería encontrar usuarios activos', async () => {
      const activos = await Usuario.findAll({ where: { activo: true } });
      expect(activos.length).toBe(3);
    });

    it('debería encontrar usuario por email', async () => {
      const usuario = await Usuario.findOne({ where: { email: 'admin1@ejemplo.com' } });
      
      expect(usuario).not.toBeNull();
      expect(usuario.nombre).toBe('Admin 1');
    });

    it('debería contar usuarios correctamente', async () => {
      const total = await Usuario.count();
      const adminCount = await Usuario.count({ where: { rol: 'administrador' } });
      const activosCount = await Usuario.count({ where: { activo: true } });

      expect(total).toBe(4);
      expect(adminCount).toBe(2);
      expect(activosCount).toBe(3);
    });
  });

  describe('Eliminación de usuarios', () => {
    
    it('debería eliminar un usuario correctamente', async () => {
      const usuario = await Usuario.create({
        nombre: 'Para Eliminar',
        email: 'eliminar@ejemplo.com',
        password: 'Pass123',
        rol: 'capataz'
      });

      await usuario.destroy();

      const encontrado = await Usuario.findByPk(usuario.id);
      expect(encontrado).toBeNull();
    });

    it('debería poder eliminar múltiples usuarios', async () => {
      await Usuario.bulkCreate([
        { nombre: 'User 1', email: 'user1@ejemplo.com', password: 'Pass123', rol: 'capataz' },
        { nombre: 'User 2', email: 'user2@ejemplo.com', password: 'Pass123', rol: 'capataz' },
        { nombre: 'User 3', email: 'user3@ejemplo.com', password: 'Pass123', rol: 'capataz' },
      ]);

      await Usuario.destroy({ where: { rol: 'capataz' } });

      const count = await Usuario.count();
      expect(count).toBe(0);
    });
  });
});
