import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Título dinámico de la página */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Sistema de Gestión Ganadera
          </h2>
          <p className="text-sm text-gray-500">
            Monitoreo IoT en tiempo real
          </p>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <FiBell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-color rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">
                  {user?.nombre}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.rol}
                </div>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown del usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-3 border-b">
                  <div className="font-medium text-gray-800">{user?.nombre}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Mi Perfil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;