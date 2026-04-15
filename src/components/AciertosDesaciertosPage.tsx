import { useState } from 'react';
import { Clock, Eye, X } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import PendingAciertosDesaciertos from './PendingAciertosDesaciertos';

type AciertosTab = 'resumen' | 'pendientes' | 'resultados';

const TABS: { id: AciertosTab; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <Eye size={16} /> },
  { id: 'pendientes', label: 'Evaluaciones Pendientes', icon: <Clock size={16} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={16} /> },
];

function AciertosProfileView({ employeeId, onClose }: { employeeId: string; onClose: () => void }) {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<Exclude<AciertosTab, 'resumen'>>('pendientes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
            {employee.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
            <p className="text-sm text-gray-600">{employee.position} · {employee.department}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
          <div className="text-xs font-semibold text-orange-600 mb-1">Estado Aciertos</div>
          <div className="text-lg font-bold text-orange-900">Pendiente</div>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
          <div className="text-xs font-semibold text-amber-600 mb-1">Estado Desaciertos</div>
          <div className="text-lg font-bold text-amber-900">Pendiente</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pendientes')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'pendientes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Clock size={16} />
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resultados')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'resultados'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Eye size={16} />
              Resultados
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pendientes' && <PendingAciertosDesaciertos />}
          {activeTab === 'resultados' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Eye size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700 mb-2">Resultados Aciertos y Desaciertos</h3>
              <p className="text-sm text-gray-400 max-w-xs">Los resultados se mostrarán aquí una vez completadas las evaluaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AciertosDesaciertosPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (selectedEmployeeId) {
    return <AciertosProfileView employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 mb-4">
        <h3 className="text-sm font-bold text-orange-900 mb-1">Selecciona un Empleado</h3>
        <p className="text-sm text-orange-800">Elige un empleado para evaluar sus aciertos y desaciertos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => setSelectedEmployeeId(employee.id)}
            className="text-left p-4 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 shrink-0">
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-orange-700 truncate">{employee.name}</div>
                <div className="text-xs text-gray-500 truncate">{employee.position}</div>
                <div className="text-xs text-gray-400 truncate">{employee.department}</div>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium group-hover:bg-orange-200">
                Aciertos: Pendiente
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium group-hover:bg-amber-200">
                Desaciertos: Pendiente
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
