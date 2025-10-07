/**
 * Utilidades para JWT (JSON Web Token)
 * Funciones para generar y verificar tokens de autenticación
 */

const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para un usuario
 * @param {Object} usuario - Objeto del usuario con { id, email, rol }
 * @returns {string} Token JWT generado
 */
const generateToken = (usuario) => {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Genera un refresh token (con mayor duración)
 * @param {Object} usuario - Objeto del usuario con { id }
 * @returns {string} Refresh token JWT
 */
const generateRefreshToken = (usuario) => {
  const payload = {
    id: usuario.id,
    type: 'refresh'
  };

  const options = {
    expiresIn: '30d' // Los refresh tokens duran más
  };

  // Usar REFRESH_SECRET si está disponible, sino usar JWT_SECRET
  const secret = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign(payload, secret, options);
};

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expiró
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica un refresh token JWT
 * @param {string} token - Refresh token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expiró
 */
const verifyRefreshToken = (token) => {
  try {
    const secret = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Decodifica un token sin verificar (útil para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken
};
