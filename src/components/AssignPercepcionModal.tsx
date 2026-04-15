import { useState, useMemo } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { X, Search, Copy, CheckCircle, Users } from 'lucide-react';
import type { Employee } from '../types';

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

interface AssignPercepcionModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

export default function AssignPercepcionModal({ targetEmployee, onClose }: AssignPercepcionModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [copied, setCopied] = useState(false);

  const evaluators = useMemo(
    () =>
      EMPLOYEES.filter(
        (e) =>
          e.id !== targetEmployee.id &&
          (e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.position.toLowerCase().includes(search.toLowerCase()) ||
            e.department.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, targetEmployee.id]
  );

  const link = selected
    ? buildHashLink('/eval-percepcion', {
        employeeId: targetEmployee.id,
        evaluatorName: selected.name,
      })
    : null;

  const copy = () => {
    if (!link) return;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Asignar evaluador</h2>
              <p className="text-xs text-gray-500">Para: {targetEmployee.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Selecciona quién va a evaluar a <strong>{targetEmployee.name}</strong>. Se generará un enlace con el nombre del evaluador pre-llenado.
            El evaluador puede editarlo si quiere o dejarlo como está.
          </p>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar evaluador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {evaluators.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">Sin resultados</div>
            ) : (
              evaluators.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                    selected?.id === emp.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected?.id === emp.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${selected?.id === emp.id ? 'text-white' : 'text-gray-800'}`}>
                      {emp.name}
                    </div>
                    <div className={`text-[10px] truncate ${selected?.id === emp.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {emp.position} · {emp.department}
                    </div>
                  </div>
                  {selected?.id === emp.id && <CheckCircle size={15} className="text-white shrink-0" />}
                </button>
              ))
            )}
          </div>

          {selected && link && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-teal-800">
                Enlace para <span className="font-black">{selected.name}</span>
              </p>
              <p className="text-[10px] text-teal-700 leading-relaxed">
                Al abrir este enlace, el nombre "{selected.name}" estará pre-llenado. Puede modificarlo o dejarlo anónimo.
              </p>
              <code className="text-[10px] text-teal-800 break-all bg-white px-2 py-1.5 rounded-lg border border-teal-100 block leading-relaxed">
                {link}
              </code>
              <button
                type="button"
                onClick={copy}
                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {copied ? <><CheckCircle size={15} /> Copiado!</> : <><Copy size={15} /> Copiar enlace</>}
              </button>
            </div>
          )}

          {!selected && (
            <p className="text-xs text-gray-400 text-center">Selecciona un evaluador para generar el enlace</p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
