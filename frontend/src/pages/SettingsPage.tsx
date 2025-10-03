import React, { useState } from 'react';
import { FiSettings, FiUser, FiUsers, FiMap, FiBell, FiDatabase, FiShield, FiWifi } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: FiUser },
    { id: 'usuarios', label: 'Usuarios', icon: FiUsers },
    { id: 'sistema', label: 'Sistema', icon: FiSettings },
    { id: 'notificaciones', label: 'Notificaciones', icon: FiBell },
    { id: 'mapas', label: 'Mapas', icon: FiMap },
    { id: 'seguridad', label: 'Seguridad', icon: FiShield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <PerfilTab />;
      case 'usuarios':
        return <UsuariosTab />;
      case 'sistema':
        return <SistemaTab />;
      case 'notificaciones':
        return <NotificacionesTab />;
      case 'mapas':
        return <MapasTab />;
      case 'seguridad':
        return <SeguridadTab />;
      default:
        return <PerfilTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Administra la configuración del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-color text-primary-color'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido de la tab activa */}
      {renderTabContent()}
    </div>
  );
};

const PerfilTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Información Personal</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input type="text" className="form-input" defaultValue="Administrador Camport" />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input type="email" className="form-input" defaultValue="admin@camport.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <input type="text" className="form-input" defaultValue="Administrador" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="tel" className="form-input" defaultValue="+56 9 1234 5678" />
            </div>
          </div>
          <button className="btn btn-primary">Guardar Cambios</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Contraseña Actual</label>
            <input type="password" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Nueva Contraseña</label>
            <input type="password" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <input type="password" className="form-input" />
          </div>
          <button className="btn btn-primary">Cambiar Contraseña</button>
        </div>
      </div>
    </div>
  );
};

const UsuariosTab: React.FC = () => {
  const usuarios = [
    { id: 1, nombre: 'Admin Principal', email: 'admin@camport.com', rol: 'administrador', activo: true },
    { id: 2, nombre: 'Capataz González', email: 'capataz@camport.com', rol: 'capataz', activo: true },
    { id: 3, nombre: 'Operador López', email: 'operador@camport.com', rol: 'capataz', activo: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
        <button className="btn btn-primary">Agregar Usuario</button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="font-medium">{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary">Editar</button>
                      <button className="btn btn-sm btn-error">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SistemaTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Configuración General</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Nombre del Sistema</label>
            <input type="text" className="form-input" defaultValue="Camport - Sistema Ganadero" />
          </div>
          <div className="form-group">
            <label className="form-label">Zona Horaria</label>
            <select className="form-input">
              <option>UTC-3 (Chile)</option>
              <option>UTC-5 (Colombia)</option>
              <option>UTC-6 (México)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Idioma</label>
            <select className="form-input">
              <option>Español</option>
              <option>English</option>
              <option>Português</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Configuración de Datos</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Intervalo de Actualización (segundos)</label>
            <input type="number" className="form-input" defaultValue="30" min="10" max="300" />
          </div>
          <div className="form-group">
            <label className="form-label">Retención de Datos (días)</label>
            <input type="number" className="form-input" defaultValue="365" min="30" max="1095" />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Backup automático diario</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificacionesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Alertas del Sistema</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Alertas de salida de geocerca</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Alertas de batería baja</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Alertas de inactividad prolongada</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Alertas de temperatura anómala</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Métodos de Notificación</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Notificaciones en la aplicación</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Notificaciones por email</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Notificaciones SMS</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapasTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Configuración de Mapas</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Proveedor de Mapas</label>
            <select className="form-input">
              <option>OpenStreetMap</option>
              <option>Google Maps</option>
              <option>Mapbox</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Zoom por Defecto</label>
            <input type="number" className="form-input" defaultValue="15" min="1" max="20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Latitud Central</label>
              <input type="number" className="form-input" defaultValue="-33.4489" step="0.0001" />
            </div>
            <div className="form-group">
              <label className="form-label">Longitud Central</label>
              <input type="number" className="form-input" defaultValue="-70.6693" step="0.0001" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeguridadTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Configuración de Seguridad</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Tiempo de Sesión (minutos)</label>
            <input type="number" className="form-input" defaultValue="480" min="30" max="1440" />
          </div>
          <div className="form-group">
            <label className="form-label">Intentos de Login Máximos</label>
            <input type="number" className="form-input" defaultValue="5" min="3" max="10" />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Requerir cambio de contraseña cada 90 días</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Registrar actividad de usuarios</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Estado de Seguridad</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex justify-between items-center">
            <span>Certificado SSL:</span>
            <span className="text-green-600 font-medium">Activo</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Firewall:</span>
            <span className="text-green-600 font-medium">Protegido</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Última Auditoría:</span>
            <span className="text-gray-600">2025-10-01</span>
          </div>
          <button className="btn btn-primary">Ejecutar Auditoría de Seguridad</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;