import { TrendingUp, Target, Activity } from 'lucide-react';

export default function KPITrackerPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Target size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Evaluaciones Completadas</div>
              <div className="text-3xl font-bold text-gray-900">72%</div>
              <div className="text-xs text-gray-500 mt-1">+5% respecto al mes anterior</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Promedio de Desempeño</div>
              <div className="text-3xl font-bold text-gray-900">3.52</div>
              <div className="text-xs text-gray-500 mt-1">de 5.0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Ciclos Activos</div>
              <div className="text-3xl font-bold text-gray-900">2</div>
              <div className="text-xs text-gray-500 mt-1">Ciclo 2024 - Evaluación 360</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Próximamente</h3>
        <p className="text-sm text-gray-600">Aquí se mostrarán métricas y KPIs detallados del desempeño del equipo.</p>
      </div>
    </div>
  );
}
