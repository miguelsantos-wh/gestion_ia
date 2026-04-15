import { useMemo, useState } from 'react';
import { TrendingUp, Award, AlertCircle, BarChart2, Plus, Trash2 } from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES, DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';

const COMPETENCY_NAMES = [
  'Liderazgo',
  'Trabajo en equipo',
  'Resolución de problemas',
  'Aprendizaje continuo',
  'Hazlo Ahora',
  'Mejora continua',
  'Autoaprendizaje',
  'Alertidad',
  'Amabilidad',
  'Valor agregado',
  'Asertividad',
];

interface PdiItem {
  area: string;
  action: string;
  responsible: string;
  deadline: string;
}

function getClassification(score: number): { label: string; bg: string; border: string; badge: string; bar: string } {
  if (score >= 4.1) return { label: 'Sobresaliente', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', bar: '#059669' };
  if (score >= 3.1) return { label: 'Bueno', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', bar: '#2563eb' };
  if (score >= 2.1) return { label: 'Regular', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', bar: '#d97706' };
  return { label: 'Deficiente', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', bar: '#dc2626' };
}

function getClassificationDesc(label: string): string {
  if (label === 'Sobresaliente') return 'Desempeño excelente. Supera expectativas en la mayoría de áreas.';
  if (label === 'Bueno') return 'Cumple con las expectativas. Algunas áreas a mejorar.';
  if (label === 'Regular') return 'Desempeño aceptable, pero necesita mejoras claras.';
  return 'Desempeño por debajo de lo esperado. Requiere intervención.';
}

function getScoreColor(score: number): string {
  if (score >= 4.1) return 'text-green-600';
  if (score >= 3.1) return 'text-blue-600';
  if (score >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}

interface Evaluation360ResultsProps {
  employeeId: string;
}

export default function Evaluation360Results({ employeeId }: Evaluation360ResultsProps) {
  const { threeSixty } = useEvaluationStore();
  const data = threeSixty[employeeId];
  const template = EVALUATION_360_TEMPLATES.find(t => t.id === DEFAULT_360_TEMPLATE_ID)!;

  const [pdiItems, setPdiItems] = useState<PdiItem[]>([]);

  const competencyScores = useMemo(() => {
    if (!data) return null;
    const allSubmissions: number[][] = [];
    if (data.self) allSubmissions.push(data.self);
    data.peers.forEach(p => allSubmissions.push(p.scores));
    if (allSubmissions.length === 0) return null;

    return template.items.map((item, idx) => {
      const scores = allSubmissions.map(s => s[idx] ?? 0).filter(s => s > 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const name = COMPETENCY_NAMES[idx] ?? item.statement.slice(0, 30);
      const cls = getClassification(avg);
      return { id: idx + 1, name, score: avg, classification: cls };
    });
  }, [data, template]);

  const overallScore = useMemo(() => {
    if (!competencyScores) return null;
    const scored = competencyScores.filter(c => c.score > 0);
    if (scored.length === 0) return null;
    return scored.reduce((a, c) => a + c.score, 0) / scored.length;
  }, [competencyScores]);

  const strengths = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores]
      .filter(c => c.score >= 3.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [competencyScores]);

  const improvements = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores]
      .filter(c => c.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [competencyScores]);

  const addPdiItem = () => {
    setPdiItems(prev => [...prev, { area: '', action: '', responsible: '', deadline: '' }]);
  };

  const updatePdiItem = (idx: number, field: keyof PdiItem, value: string) => {
    setPdiItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removePdiItem = (idx: number) => {
    setPdiItems(prev => prev.filter((_, i) => i !== idx));
  };

  if (!data || (!data.self && data.peers.length === 0)) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
        <BarChart2 size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-400">Sin resultados disponibles</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Los resultados aparecerán una vez que el colaborador o sus evaluadores completen la evaluación 360.
        </p>
      </div>
    );
  }

  const overallCls = overallScore ? getClassification(overallScore) : null;
  const totalRespondents = (data.self ? 1 : 0) + data.peers.length;

  return (
    <div className="space-y-6">
      {overallScore !== null && overallCls && (
        <div className={`rounded-2xl border ${overallCls.border} ${overallCls.bg} p-5`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Puntaje global</p>
              <p className="text-xs text-gray-500">{totalRespondents} respuesta{totalRespondents !== 1 ? 's' : ''} · {data.self ? 'incluye autoevaluación' : 'sin autoevaluación'}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${getScoreColor(overallScore)}`}>{overallScore.toFixed(2)}</div>
              <div className="text-xs text-gray-500">de 5.0</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${overallCls.badge}`}>{overallCls.label}</span>
            <span className="text-xs text-gray-600">{getClassificationDesc(overallCls.label)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Resumen por Competencia</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {competencyScores?.map((comp) => (
            <div key={comp.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5 shrink-0 font-medium">{comp.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-800">{comp.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-xs font-bold ${comp.score > 0 ? getScoreColor(comp.score) : 'text-gray-300'}`}>
                        {comp.score > 0 ? comp.score.toFixed(2) : '—'}
                      </span>
                      {comp.score > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${comp.classification.badge}`}>
                          {comp.classification.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {comp.score > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${(comp.score / 5) * 100}%`, backgroundColor: comp.classification.bar }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {overallScore !== null && (
          <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Promedio Total</span>
            <span className={`text-lg font-black ${getScoreColor(overallScore)}`}>{overallScore.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-green-600" />
            <h3 className="text-xs font-bold text-green-900 uppercase tracking-wide">Fortalezas Identificadas</h3>
          </div>
          {strengths.length === 0 ? (
            <p className="text-xs text-green-600 italic">Sin fortalezas destacadas aún</p>
          ) : (
            <div className="space-y-2">
              {strengths.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-green-100">
                  <span className="text-xs font-black text-green-700 bg-green-100 w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-green-900">{s.name}</span>
                    <span className={`ml-2 text-xs font-bold ${getScoreColor(s.score)}`}>{s.score.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-yellow-600" />
            <h3 className="text-xs font-bold text-yellow-900 uppercase tracking-wide">Oportunidades de Mejora</h3>
          </div>
          {improvements.length === 0 ? (
            <p className="text-xs text-yellow-600 italic">Sin áreas de mejora identificadas</p>
          ) : (
            <div className="space-y-2">
              {improvements.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-yellow-100">
                  <span className="text-xs font-black text-yellow-700 bg-yellow-100 w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-yellow-900">{s.name}</span>
                    <span className={`ml-2 text-xs font-bold ${getScoreColor(s.score)}`}>{s.score.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Compromisos y Plan de Acción (PDI)</h3>
          </div>
          <button
            type="button"
            onClick={addPdiItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {pdiItems.length === 0 ? (
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs">
            Haz clic en "Agregar" para crear el plan de acción del colaborador
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Área de Mejora</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Acción Concreta</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Responsable</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Plazo</th>
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pdiItems.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.area}
                        onChange={e => updatePdiItem(idx, 'area', e.target.value)}
                        placeholder="Ej. Liderazgo"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.action}
                        onChange={e => updatePdiItem(idx, 'action', e.target.value)}
                        placeholder="Acción específica"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.responsible}
                        onChange={e => updatePdiItem(idx, 'responsible', e.target.value)}
                        placeholder="RRHH / Líder"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.deadline}
                        onChange={e => updatePdiItem(idx, 'deadline', e.target.value)}
                        placeholder="30 Jun 2025"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removePdiItem(idx)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
