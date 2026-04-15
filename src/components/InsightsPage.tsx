import { Lightbulb, TrendingUp, AlertCircle, Award } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-2">Tendencias de Desempeño</h3>
              <p className="text-xs text-blue-800">Se está observando una mejora general en competencias de liderazgo respecto al trimestre anterior.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center shrink-0">
              <Award size={20} className="text-green-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-900 mb-2">Fortalezas del Equipo</h3>
              <p className="text-xs text-green-800">Las competencias de trabajo en equipo y comunicación son las más desarrolladas en el área.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-200 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-yellow-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-yellow-900 mb-2">Áreas de Mejora</h3>
              <p className="text-xs text-yellow-800">Se recomienda enfoque en desarrollo de liderazgo y gestión del cambio para próximos ciclos.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-900 mb-2">Potencial de Crecimiento</h3>
              <p className="text-xs text-purple-800">25% del equipo muestra alto potencial para promoción en los próximos 18 meses.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Análisis Detallado</h3>
        <p className="text-sm text-gray-600">Próximamente se habilitarán gráficos interactivos y análisis profundos de los datos de evaluación.</p>
      </div>
    </div>
  );
}
