import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiMap, 
  FiAlertTriangle, 
  FiFileText, 
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Dashboard',
      description: 'Resumen general'
    },
    {
      path: '/animals',
      icon: FiUsers,
      label: 'Animales',
      description: 'Gestión del ganado'
    },
    {
      path: '/map',
      icon: FiMap,
      label: 'Mapa',
      description: 'Ubicación en tiempo real'
    },
    {
      path: '/alerts',
      icon: FiAlertTriangle,
      label: 'Alertas',
      description: 'Notificaciones'
    },
    {
      path: '/reports',
      icon: FiFileText,
      label: 'Reportes',
      description: 'Informes y estadísticas'
    },
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Configuración',
      description: 'Ajustes del sistema'
    }
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header del sidebar */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Camport</h1>
              <p className="text-xs text-gray-500">Sistema Ganadero</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <FiMenu className="w-5 h-5 text-gray-600" />
          ) : (
            <FiX className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-color text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                >
                  <IconComponent className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">
              Sistema IoT Ganadero
            </p>
            <p className="text-xs text-blue-500">
              Versión 1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;