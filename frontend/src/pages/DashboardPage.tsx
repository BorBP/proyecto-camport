import React from 'react';
import { FiUsers, FiMapPin, FiAlertTriangle, FiActivity } from 'react-icons/fi';

const DashboardPage: React.FC = () => {
  // Datos de ejemplo (en una app real estos vendrían de la API)
  const stats = [
    {
      title: 'Total de Animales',
      value: '127',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: FiUsers,
      color: 'blue'
    },
    {
      title: 'Animales Activos',
      value: '98',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: FiActivity,
      color: 'green'
    },
    {
      title: 'Alertas Pendientes',
      value: '7',
      change: '-12.3%',
      changeType: 'negative' as const,
      icon: FiAlertTriangle,
      color: 'red'
    },
    {
      title: 'Zonas Monitoreadas',
      value: '12',
      change: '0%',
      changeType: 'neutral' as const,
      icon: FiMapPin,
      color: 'purple'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      animal: 'Vaca #127',
      type: 'Salida de geocerca',
      time: 'Hace 15 min',
      severity: 'high'
    },
    {
      id: 2,
      animal: 'Toro #045',
      type: 'Batería baja',
      time: 'Hace 1 hora',
      severity: 'medium'
    },
    {
      id: 3,
      animal: 'Vaca #089',
      type: 'Inactividad prolongada',
      time: 'Hace 2 horas',
      severity: 'low'
    }
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  const severityClasses: Record<string, string> = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                        stat.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas recientes */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Alertas Recientes</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.animal}</p>
                    <p className="text-sm text-gray-600">{alert.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full border ${severityClasses[alert.severity]}`}>
                      {alert.severity === 'high' ? 'Alta' : 
                       alert.severity === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="btn btn-primary w-full">
                Ver Todas las Alertas
              </button>
            </div>
          </div>
        </div>

        {/* Actividad del sistema */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Estado del Sistema</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Collares Conectados</span>
                <span className="font-semibold text-green-600">98/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última Sincronización</span>
                <span className="font-semibold text-gray-900">Hace 2 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado del Servidor</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-600">En línea</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Velocidad de Datos</span>
                <span className="font-semibold text-gray-900">1.2 KB/s</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Próxima Actualización</h4>
              <p className="text-sm text-blue-700">
                Sistema de predicción de comportamiento animal - Próximamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;