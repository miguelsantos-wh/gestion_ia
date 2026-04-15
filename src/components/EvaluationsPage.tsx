import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EvaluationsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Evaluaciones Pendientes</div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-500 mt-1">Por completar</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Evaluaciones Completadas</div>
              <div className="text-3xl font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-500 mt-1">Finalizadas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Tasa de Finalización</div>
              <div className="text-3xl font-bold text-gray-900">67%</div>
              <div className="text-xs text-gray-500 mt-1">General</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Evaluaciones Recientes</h3>
        <div className="space-y-3">
          {[
            { employee: 'Empleado A', type: 'Evaluación 360', status: 'pending', date: 'Hace 2 días' },
            { employee: 'Empleado B', type: 'Aciertos y Desaciertos', status: 'completed', date: 'Hace 1 día' },
            { employee: 'Empleado C', type: 'Evaluación 360', status: 'pending', date: 'Hace 3 días' },
            { employee: 'Empleado D', type: 'Percepción', status: 'completed', date: 'Hoy' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.employee}</div>
                <div className="text-xs text-gray-500">{item.type}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{item.date}</span>
                {item.status === 'completed' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <CheckCircle2 size={14} />
                    Completada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                    <Clock size={14} />
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
        <h3 className="text-sm font-bold text-blue-900 mb-2">Acceso Rápido</h3>
        <p className="text-sm text-blue-800 mb-4">Gestiona todas tus evaluaciones desde el panel lateral</p>
        <div className="flex gap-3">
          <button type="button" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Ver Evaluación 360
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-white transition-colors">
            Ver Aciertos y Desaciertos
          </button>
        </div>
      </div>
    </div>
  );
}
