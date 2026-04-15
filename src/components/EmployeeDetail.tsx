import { Employee } from '../types';
import { BOX_CONFIGS } from '../data/mockData';
import { X, Calendar, Briefcase, TrendingUp, Target, Award } from 'lucide-react';

interface EmployeeDetailProps {
  employee: Employee;
  onClose: () => void;
  /** Etiqueta de la vista por tipo de evaluación (matriz Individual) */
  lensLabel?: string;
}

function RadarBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 5) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-800">{score.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? '#059669' : pct >= 60 ? '#2563eb' : pct >= 40 ? '#d97706' : '#dc2626',
          }}
        />
      </div>
    </div>
  );
}

function GoalBar({ label, progress }: { label: string; progress: number }) {
  const capped = Math.min(progress, 100);
  const exceeded = progress > 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${exceeded ? 'text-emerald-600' : 'text-gray-800'}`}>
          {progress}%{exceeded && ' ✓'}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${capped}%`,
            background: exceeded ? '#059669' : capped >= 75 ? '#2563eb' : capped >= 50 ? '#d97706' : '#dc2626',
          }}
        />
      </div>
    </div>
  );
}

export default function EmployeeDetail({ employee, onClose, lensLabel }: EmployeeDetailProps) {
  const boxConfig = BOX_CONFIGS.find(
    (b) => b.potentialLevel === employee.potentialLevel && b.performanceLevel === employee.performanceLevel
  );

  const perfPct = ((employee.performance - 1) / 4) * 100;
  const potPct = ((employee.potential - 1) / 4) * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div
        className="p-5 relative"
        style={{ background: `linear-gradient(135deg, ${boxConfig?.color}15, ${boxConfig?.color}30)` }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0"
            style={{ backgroundColor: boxConfig?.color }}
          >
            {employee.avatar}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: boxConfig?.bgColor, color: boxConfig?.textColor }}
              >
                {boxConfig ? `${boxConfig.code} · ${boxConfig.label}` : ''}
              </span>
              <span className="text-xs text-gray-400">{employee.department}</span>
              {lensLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {lensLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <Briefcase size={14} className="mx-auto mb-1 text-gray-500" />
            <div className="text-base font-bold text-gray-800">{employee.tenure}</div>
            <div className="text-xs text-gray-500">años</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <TrendingUp size={14} className="mx-auto mb-1 text-gray-500" />
            <div className="text-base font-bold text-gray-800">{employee.performance.toFixed(1)}</div>
            <div className="text-xs text-gray-500">resultados</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <Target size={14} className="mx-auto mb-1 text-gray-500" />
            <div className="text-base font-bold text-gray-800">{employee.potential.toFixed(1)}</div>
            <div className="text-xs text-gray-500">valores</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={14} className="text-blue-600" />
            <h4 className="text-sm font-bold text-gray-800">Métricas Clave</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Resultados</span>
              <div className="flex items-center gap-2 flex-1 mx-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${perfPct}%`, backgroundColor: boxConfig?.color }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-800">{employee.performance.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Valores</span>
              <div className="flex items-center gap-2 flex-1 mx-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${potPct}%`, backgroundColor: boxConfig?.color }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-800">{employee.potential.toFixed(1)}/5</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Target size={14} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-gray-800">Objetivos</h4>
          </div>
          {employee.goals.map((g) => (
            <GoalBar key={g.label} label={g.label} progress={g.progress} />
          ))}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Award size={14} className="text-amber-500" />
            <h4 className="text-sm font-bold text-gray-800">Competencias</h4>
          </div>
          {employee.competencies.map((c) => (
            <RadarBar key={c.label} label={c.label} score={c.score} />
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Definición del cuadrante</p>
            <p className="text-xs text-gray-600 mb-1.5">{boxConfig?.description}</p>
            <ul className="text-xs text-gray-700 leading-relaxed list-disc pl-4 space-y-0.5">
              {boxConfig?.detailBullets?.map((line, i) => (
                <li key={`db-${i}`}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recomendación</p>
            <p className="text-xs text-gray-700 leading-relaxed">{boxConfig?.recommendation}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />
          <span>Última evaluación: {new Date(employee.lastReview).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
