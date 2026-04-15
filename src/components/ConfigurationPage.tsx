import { Settings, Users, Bell, Shield, RotateCw, Download } from 'lucide-react';

export default function ConfigurationPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Configuración General</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Users size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Gestión de Usuarios</h3>
                <p className="text-xs text-gray-600 mb-3">Administra roles y permisos del equipo</p>
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Configurar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Notificaciones</h3>
                <p className="text-xs text-gray-600 mb-3">Configura alertas y recordatorios</p>
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Configurar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Seguridad</h3>
                <p className="text-xs text-gray-600 mb-3">Gestiona acceso y permisos de datos</p>
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Configurar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <RotateCw size={18} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Integración</h3>
                <p className="text-xs text-gray-600 mb-3">Conecta herramientas externas</p>
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Datos</h2>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Download size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Exportar Datos</h3>
                <p className="text-xs text-gray-600">Descarga un resumen de todas las evaluaciones y resultados</p>
              </div>
            </div>
            <button type="button" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0">
              Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Información</h2>

        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Versión del Sistema</h3>
          <p className="text-sm text-blue-800 mb-4">v1.0.0</p>
          <p className="text-xs text-blue-700">Para soporte técnico, contacta al equipo de RRHH</p>
        </div>
      </div>
    </div>
  );
}
