import { TrendingUp, Award, AlertCircle } from 'lucide-react';

interface CompetencyScore {
  id: number;
  name: string;
  score: number;
  classification: string;
  description: string;
}

interface EmployeeResults {
  name: string;
  position: string;
  overallScore: number;
  overallClassification: string;
  competencies: CompetencyScore[];
  strengths: string[];
  improvements: string[];
}

const MOCK_RESULTS: EmployeeResults = {
  name: 'Empleado A',
  position: 'Gerente de Ventas',
  overallScore: 3.78,
  overallClassification: 'Bueno',
  competencies: [
    { id: 1, name: 'Liderazgo', score: 2.6, classification: 'Regular', description: 'Desempeño aceptable, pero necesita mejoras claras.' },
    { id: 2, name: 'Trabajo en equipo', score: 3.6, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 3, name: 'Resolución de problemas', score: 3.4, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 4, name: 'Aprendizaje continuo', score: 3.8, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 5, name: 'Hazlo Ahora', score: 3.0, classification: 'Regular', description: 'Desempeño aceptable, pero necesita mejoras claras.' },
    { id: 6, name: 'Mejora continua', score: 3.0, classification: 'Regular', description: 'Desempeño aceptable, pero necesita mejoras claras.' },
    { id: 7, name: 'Autoaprendizaje', score: 3.2, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 8, name: 'Alertidad', score: 3.4, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 9, name: 'Amabilidad', score: 4.2, classification: 'Sobresaliente', description: 'Desempeño excelente. Supera expectativas en la mayoría de áreas.' },
    { id: 10, name: 'Valor agregado', score: 3.4, classification: 'Bueno', description: 'Cumple con las expectativas. Algunas áreas a mejorar.' },
    { id: 11, name: 'Asertividad', score: 4.2, classification: 'Sobresaliente', description: 'Desempeño excelente. Supera expectativas en la mayoría de áreas.' },
  ],
  strengths: ['Amabilidad', 'Asertividad', 'Aprendizaje continuo'],
  improvements: ['Liderazgo', 'Hazlo ahora', 'Mejora continua'],
};

function getClassificationColor(classification: string): { bg: string; border: string; text: string; badge: string } {
  switch (classification) {
    case 'Sobresaliente':
      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' };
    case 'Bueno':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
    case 'Regular':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
    case 'Deficiente':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };
  }
}

function getScoreColor(score: number): string {
  if (score >= 4.1) return 'text-green-600';
  if (score >= 3.1) return 'text-blue-600';
  if (score >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}

export default function Evaluation360Results() {
  const overallColors = getClassificationColor(MOCK_RESULTS.overallClassification);

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border ${overallColors.border} ${overallColors.bg} p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{MOCK_RESULTS.name}</h3>
            <p className="text-sm text-gray-600">{MOCK_RESULTS.position}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(MOCK_RESULTS.overallScore)}`}>{MOCK_RESULTS.overallScore.toFixed(2)}</div>
            <div className="text-sm text-gray-600">de 5.0</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${overallColors.badge}`}>
            {MOCK_RESULTS.overallClassification}
          </span>
          <span className="text-sm text-gray-600">
            {MOCK_RESULTS.overallClassification === 'Sobresaliente' && 'Desempeño excelente. Supera expectativas.'}
            {MOCK_RESULTS.overallClassification === 'Bueno' && 'Cumple con las expectativas.'}
            {MOCK_RESULTS.overallClassification === 'Regular' && 'Desempeño aceptable, necesita mejoras.'}
            {MOCK_RESULTS.overallClassification === 'Deficiente' && 'Desempeño por debajo de lo esperado.'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-900">Resumen de Resultados por Competencia</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Competencia</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Puntaje</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Clasificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_RESULTS.competencies.map((comp) => {
                const colors = getClassificationColor(comp.classification);
                return (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{comp.id}. {comp.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${getScoreColor(comp.score)}`}>{comp.score.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors.badge} mb-1`}>
                          {comp.classification}
                        </span>
                        <div className="text-xs text-gray-600">{comp.description}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Promedio Total</span>
            <span className={`text-lg font-bold ${getScoreColor(MOCK_RESULTS.overallScore)}`}>
              {(MOCK_RESULTS.competencies.reduce((sum, c) => sum + c.score, 0) / MOCK_RESULTS.competencies.length).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-green-600" />
            <h3 className="text-sm font-bold text-green-900">Fortalezas Identificadas</h3>
          </div>
          <div className="space-y-2">
            {MOCK_RESULTS.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <span className="text-xs font-bold text-green-700 bg-green-100 w-6 h-6 flex items-center justify-center rounded-full">
                  {idx + 1}
                </span>
                <span className="text-sm text-green-900">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-yellow-600" />
            <h3 className="text-sm font-bold text-yellow-900">Oportunidades de Mejora</h3>
          </div>
          <div className="space-y-2">
            {MOCK_RESULTS.improvements.map((improvement, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-100">
                <span className="text-xs font-bold text-yellow-700 bg-yellow-100 w-6 h-6 flex items-center justify-center rounded-full">
                  {idx + 1}
                </span>
                <span className="text-sm text-yellow-900">{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Compromisos y Plan de Acción (PDI)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Área de Mejora</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Acción Concreta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Responsable</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Plazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { area: 'Liderazgo', action: 'Participar en curso de liderazgo avanzado', responsible: 'RRHH', deadline: '30 Jun 2024' },
                { area: 'Hazlo Ahora', action: 'Implementar metodología de priorización diaria', responsible: 'Gerente directo', deadline: '15 Jun 2024' },
                { area: 'Mejora continua', action: 'Documentar procesos y proponer mejoras mensuales', responsible: 'Empleado', deadline: '30 Jun 2024' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-900">{item.area}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{item.action}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{item.responsible}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-900">{item.deadline}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
