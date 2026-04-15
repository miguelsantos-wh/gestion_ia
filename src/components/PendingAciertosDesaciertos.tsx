import { CheckCircle2, Clock } from 'lucide-react';

interface PendingEvaluation {
  id: string;
  employeeName: string;
  position: string;
  evaluationType: 'hits' | 'misses' | 'both';
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

const MOCK_PENDING: PendingEvaluation[] = [
  {
    id: '1',
    employeeName: 'Empleado B',
    position: 'Asistente Administrativo',
    evaluationType: 'both',
    assignedDate: '2024-05-01',
    dueDate: '2024-05-31',
    status: 'pending',
  },
  {
    id: '2',
    employeeName: 'Empleado C',
    position: 'Especialista en Marketing',
    evaluationType: 'hits',
    assignedDate: '2024-05-05',
    dueDate: '2024-05-30',
    status: 'pending',
  },
  {
    id: '3',
    employeeName: 'Empleado D',
    position: 'Desarrollador Senior',
    evaluationType: 'misses',
    assignedDate: '2024-04-20',
    dueDate: '2024-05-20',
    status: 'completed',
  },
  {
    id: '4',
    employeeName: 'Empleado E',
    position: 'Gerente de Proyecto',
    evaluationType: 'both',
    assignedDate: '2024-05-10',
    dueDate: '2024-06-09',
    status: 'pending',
  },
];

export default function PendingAciertosDesaciertos() {
  const pending = MOCK_PENDING.filter((e) => e.status === 'pending');
  const completed = MOCK_PENDING.filter((e) => e.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-red-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-900 mb-1">Evaluaciones Pendientes</div>
              <div className="text-2xl font-bold text-red-600">{pending.length}</div>
              <div className="text-xs text-red-600 mt-0.5">Por completar</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-green-900 mb-1">Evaluaciones Completadas</div>
              <div className="text-2xl font-bold text-green-600">{completed.length}</div>
              <div className="text-xs text-green-600 mt-0.5">Finalizadas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-900">Evaluaciones Asignadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Colaborador a Evaluar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Puesto</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Tipo de Evaluación</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Fecha Asignación</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Vencimiento</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Estatus</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_PENDING.map((evaluation) => (
                <tr key={evaluation.id} className={evaluation.status === 'pending' ? 'bg-red-50 hover:bg-red-100' : 'bg-green-50 hover:bg-green-100'}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{evaluation.employeeName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{evaluation.position}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {evaluation.evaluationType === 'both' && 'Ambos'}
                      {evaluation.evaluationType === 'hits' && 'Aciertos'}
                      {evaluation.evaluationType === 'misses' && 'Desaciertos'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-600">
                      {new Date(evaluation.assignedDate).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(evaluation.dueDate).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {evaluation.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-red-200 text-red-700 text-xs font-medium">
                        <Clock size={14} />
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-green-200 text-green-700 text-xs font-medium">
                        <CheckCircle2 size={14} />
                        Completada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      disabled={evaluation.status === 'completed'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        evaluation.status === 'completed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {evaluation.status === 'completed' ? 'Ver' : 'Responder'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Instrucciones</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <div>
              <div className="text-sm font-medium text-gray-900">Selecciona "Responder"</div>
              <div className="text-xs text-gray-600">En la evaluación que desees completar</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <div>
              <div className="text-sm font-medium text-gray-900">Completa el formulario</div>
              <div className="text-xs text-gray-600">Indica los aciertos y desaciertos del colaborador evaluado</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <div>
              <div className="text-sm font-medium text-gray-900">Envía tu evaluación</div>
              <div className="text-xs text-gray-600">Haz clic en "Enviar" para registrar tu respuesta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
