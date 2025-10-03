import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // El error ya se maneja en el contexto
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y encabezado */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-color rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Bienvenido a Camport
          </h2>
          <p className="mt-2 text-gray-600">
            Sistema de Gestión Ganadera con IoT
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="admin@camport.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Información de prueba */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Credenciales de prueba:
            </h4>
            <div className="text-sm text-blue-700">
              <p><strong>Email:</strong> admin@camport.com</p>
              <p><strong>Contraseña:</strong> admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Camport. Sistema de gestión ganadera.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;