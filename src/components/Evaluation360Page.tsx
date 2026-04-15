import { useState } from 'react';
import { ClipboardList, Eye, Clock } from 'lucide-react';
import Evaluation360View from './Evaluation360View';
import Evaluation360Results from './Evaluation360Results';
import PendingEvaluations360 from './PendingEvaluations360';

type Eval360Tab = 'asignar' | 'resultados' | 'pendientes';

const TABS: { id: Eval360Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'asignar', label: 'Asignar Evaluación', icon: <ClipboardList size={16} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={16} /> },
  { id: 'pendientes', label: 'Evaluaciones Pendientes', icon: <Clock size={16} /> },
];

export default function Evaluation360Page() {
  const [activeTab, setActiveTab] = useState<Eval360Tab>('asignar');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'asignar' && <Evaluation360View />}
          {activeTab === 'resultados' && <Evaluation360Results />}
          {activeTab === 'pendientes' && <PendingEvaluations360 />}
        </div>
      </div>
    </div>
  );
}
