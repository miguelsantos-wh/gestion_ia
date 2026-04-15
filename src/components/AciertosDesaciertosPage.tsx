import { useState } from 'react';
import { Clock, Eye } from 'lucide-react';
import PendingAciertosDesaciertos from './PendingAciertosDesaciertos';

type AciertosTab = 'pendientes' | 'resultados';

const TABS: { id: AciertosTab; label: string; icon: React.ReactNode }[] = [
  { id: 'pendientes', label: 'Evaluaciones Pendientes', icon: <Clock size={16} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={16} /> },
];

export default function AciertosDesaciertosPage() {
  const [activeTab, setActiveTab] = useState<AciertosTab>('pendientes');

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
