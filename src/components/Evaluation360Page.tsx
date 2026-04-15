import { useState } from 'react';
import { BarChart3, Eye, Clock, X, Send, CheckCircle } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import Evaluation360View from './Evaluation360View';
import Evaluation360Results from './Evaluation360Results';
import PendingEvaluations360 from './PendingEvaluations360';

type Eval360Tab = 'responder' | 'resultados' | 'pendientes';

function Eval360EmployeeView({ employeeId }: { employeeId: string }) {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<'responder' | 'resultados'>('responder');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
          {employee.avatar}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
          <p className="text-sm text-gray-600">{employee.position} · {employee.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="text-xs font-semibold text-blue-600 mb-1">Estado</div>
          <div className="text-lg font-bold text-blue-900">Pendiente</div>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
          <div className="text-xs font-semibold text-purple-600 mb-1">Evaluadores</div>
          <div className="text-lg font-bold text-purple-900">3</div>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="text-xs font-semibold text-green-600 mb-1">Completadas</div>
          <div className="text-lg font-bold text-green-900">0</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('responder')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'responder'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Send size={16} />
              Responder Evaluación
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
          {activeTab === 'responder' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Send size={28} className="text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-700 mb-2">Responder Evaluación 360</h3>
              <p className="text-sm text-gray-400 max-w-xs">Accederás a las preguntas para completar tu evaluación</p>
            </div>
          )}
          {activeTab === 'resultados' && <Evaluation360Results />}
        </div>
      </div>
    </div>
  );
}

function Eval360AdminView({ selectedEmployeeId, onSelectEmployee }: { selectedEmployeeId: string | null; onSelectEmployee: (id: string | null) => void }) {
  const employee = selectedEmployeeId ? EMPLOYEES.find(e => e.id === selectedEmployeeId) : null;
  const [activeTab, setActiveTab] = useState<Eval360Tab>('responder');

  if (employee) {
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
            onClick={() => onSelectEmployee(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-xs font-semibold text-blue-600 mb-1">Estado</div>
            <div className="text-lg font-bold text-blue-900">Pendiente</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
            <div className="text-xs font-semibold text-purple-600 mb-1">Evaluadores</div>
            <div className="text-lg font-bold text-purple-900">3</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="text-xs font-semibold text-green-600 mb-1">Completadas</div>
            <div className="text-lg font-bold text-green-900">0</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="border-b border-gray-100">
            <div className="flex items-center overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('responder')}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === 'responder'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Send size={16} />
                Asignar
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
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'responder' && <Evaluation360View />}
            {activeTab === 'resultados' && <Evaluation360Results />}
            {activeTab === 'pendientes' && <PendingEvaluations360 />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-1">Evaluación 360</h3>
        <p className="text-sm text-blue-800">Asigna evaluaciones, revisa resultados y da seguimiento a tus colaboradores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelectEmployee(emp.id)}
            className="text-left p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 shrink-0">
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">{emp.name}</div>
                <div className="text-xs text-gray-500 truncate">{emp.position}</div>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                Pendiente
              </span>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                3 evaluadores
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Evaluation360Page() {
  const { isAdmin, currentEmployee } = useUser();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (!isAdmin && currentEmployee) {
    return <Eval360EmployeeView employeeId={currentEmployee.id} />;
  }

  return <Eval360AdminView selectedEmployeeId={selectedEmployeeId} onSelectEmployee={setSelectedEmployeeId} />;
}
