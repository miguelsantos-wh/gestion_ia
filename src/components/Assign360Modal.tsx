import { useState } from 'react';
import { X, Users, User, Briefcase, Equal, UserCheck, Globe, Copy, Check } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Role } from '../types/evaluation';
import type { Employee } from '../types';

interface RoleConfig {
  role: Eval360Role;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  allowAnonymous: boolean;
}

const ROLE_CONFIGS: RoleConfig[] = [
  { role: 'self', label: 'Autoevaluación', description: 'El propio colaborador se evalúa a sí mismo.', icon: <User size={16} />, color: '#2563eb', allowAnonymous: false },
  { role: 'leader', label: 'Evaluación por Líder', description: 'Su líder directo lo evalúa.', icon: <Briefcase size={16} />, color: '#0d9488', allowAnonymous: false },
  { role: 'peer', label: 'Evaluación por Par', description: 'Un compañero con el mismo puesto o nivel.', icon: <Equal size={16} />, color: '#7c3aed', allowAnonymous: true },
  { role: 'collaborator', label: 'Evaluación por Colaborador', description: 'Alguien que depende del evaluado.', icon: <UserCheck size={16} />, color: '#d97706', allowAnonymous: true },
  { role: 'client', label: 'Evaluación por Cliente', description: 'Un cliente interno o externo.', icon: <Globe size={16} />, color: '#dc2626', allowAnonymous: true },
  { role: 'anonymous', label: 'Evaluación Anónima', description: 'Link anónimo para cualquier evaluador.', icon: <Users size={16} />, color: '#64748b', allowAnonymous: true },
];

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

interface Assign360ModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

export default function Assign360Modal({ targetEmployee, onClose }: Assign360ModalProps) {
  const { saveEval360Assignment, eval360Assignments } = useEvaluationStore();
  const [selectedRole, setSelectedRole] = useState<Eval360Role>('leader');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorEmployeeId, setEvaluatorEmployeeId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roleConfig = ROLE_CONFIGS.find(r => r.role === selectedRole)!;
  const otherEmployees = EMPLOYEES.filter(e => e.id !== targetEmployee.id);

  const existingForTarget = eval360Assignments.filter(a => a.targetEmployeeId === targetEmployee.id);
  const selfDone = existingForTarget.some(a => a.role === 'self');
  const leaderDone = existingForTarget.filter(a => a.role === 'leader').length > 0;
  const peerCount = existingForTarget.filter(a => a.role === 'peer').length;
  const collabCount = existingForTarget.filter(a => a.role === 'collaborator').length;
  const clientCount = existingForTarget.filter(a => a.role === 'client').length;

  const handleGenerate = () => {
    const name = isAnonymous ? 'Anónimo' : (evaluatorName.trim() || (evaluatorEmployeeId ? EMPLOYEES.find(e => e.id === evaluatorEmployeeId)?.name ?? '' : ''));
    if (!isAnonymous && !name) return;

    const id = saveEval360Assignment({
      targetEmployeeId: targetEmployee.id,
      role: selectedRole,
      evaluatorName: name,
      evaluatorEmployeeId: evaluatorEmployeeId || undefined,
      isAnonymous,
    });

    const link = buildHashLink('/eval-360', {
      employeeId: targetEmployee.id,
      mode: selectedRole === 'self' ? 'self' : 'peer',
      assignmentId: id,
    });
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    void navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setEvaluatorName('');
    setEvaluatorEmployeeId('');
    setIsAnonymous(false);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Asignar Evaluación 360</h2>
            <p className="text-xs text-gray-500 mt-0.5">Para: <span className="font-semibold text-gray-700">{targetEmployee.name}</span></p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {ROLE_CONFIGS.map((rc) => {
              const count = existingForTarget.filter(a => a.role === rc.role).length;
              return (
                <button
                  key={rc.role}
                  type="button"
                  onClick={() => { setSelectedRole(rc.role); handleReset(); }}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedRole === rc.role ? 'border-current shadow-sm' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  style={selectedRole === rc.role ? { borderColor: rc.color, backgroundColor: `${rc.color}0d` } : {}}
                >
                  <div className="flex items-center justify-between w-full">
                    <span style={{ color: rc.color }}>{rc.icon}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${rc.color}18`, color: rc.color }}>
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 leading-tight">{rc.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-600 leading-relaxed">{roleConfig.description}</p>
          </div>

          {!generatedLink ? (
            <div className="space-y-3">
              {selectedRole !== 'self' && selectedRole !== 'anonymous' && (
                <>
                  {roleConfig.allowAnonymous && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => { setIsAnonymous(e.target.checked); setEvaluatorName(''); setEvaluatorEmployeeId(''); }}
                        className="w-4 h-4 rounded accent-slate-700"
                      />
                      <span className="text-sm text-gray-700">Generar enlace anónimo</span>
                    </label>
                  )}

                  {!isAnonymous && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Seleccionar de la lista de colaboradores</label>
                        <select
                          value={evaluatorEmployeeId}
                          onChange={e => { setEvaluatorEmployeeId(e.target.value); if (e.target.value) setEvaluatorName(''); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">— Seleccionar colaborador —</option>
                          {otherEmployees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} · {e.position}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">o</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del evaluador externo</label>
                        <input
                          type="text"
                          placeholder="Ej. Juan Pérez"
                          value={evaluatorName}
                          onChange={e => { setEvaluatorName(e.target.value); if (e.target.value) setEvaluatorEmployeeId(''); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {selectedRole === 'self' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">Se generará un enlace de autoevaluación para <strong>{targetEmployee.name}</strong>. Solo debe haber una autoevaluación.</p>
                  {selfDone && <p className="text-xs text-amber-600 font-semibold mt-1">Ya existe una autoevaluación asignada.</p>}
                </div>
              )}

              {selectedRole === 'anonymous' && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">Se generará un enlace que puede ser compartido con cualquier persona de forma anónima.</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!isAnonymous && selectedRole !== 'self' && selectedRole !== 'anonymous' && !evaluatorName.trim() && !evaluatorEmployeeId}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: roleConfig.color }}
              >
                Generar enlace
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-green-100 bg-green-50 p-3 flex items-center gap-2">
                <Check size={16} className="text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-semibold">Asignación guardada. Comparte el enlace con el evaluador.</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Enlace generado</p>
                <code className="text-[10px] text-gray-600 break-all block bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                  {generatedLink}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-2 w-full py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={{ backgroundColor: copied ? '#059669' : roleConfig.color }}
                >
                  {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar enlace</>}
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Asignar otro evaluador
              </button>
            </div>
          )}

          {existingForTarget.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Asignaciones actuales</p>
              <div className="space-y-1.5">
                {existingForTarget.map((a) => {
                  const rc = ROLE_CONFIGS.find(r => r.role === a.role)!;
                  return (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <span style={{ color: rc.color }}>{rc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{a.isAnonymous ? 'Anónimo' : a.evaluatorName}</p>
                        <p className="text-[10px] text-gray-400">{rc.label}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${a.completedAt ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.completedAt ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Auto: {selfDone ? '1' : '0'} · Líder: {leaderDone ? '1+' : '0'} · Par: {peerCount} · Colaborador: {collabCount} · Cliente: {clientCount}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
