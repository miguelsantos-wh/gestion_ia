import type { EvaluationTemplate } from '../types/evaluation';

interface Eval360QuestionnaireProps {
  template: EvaluationTemplate;
  values: (number | null)[];
  onChange: (index: number, value: number) => void;
  disabled?: boolean;
}

const SCORE_LABELS: Record<number, { label: string; color: string; bg: string; ring: string }> = {
  1: { label: 'Deficiente', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-400' },
  2: { label: 'Regular', color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-400' },
  3: { label: 'Aceptable', color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-400' },
  4: { label: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500' },
  5: { label: 'Sobresaliente', color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-500' },
};

export default function Eval360Questionnaire({ template, values, onChange, disabled }: Eval360QuestionnaireProps) {
  return (
    <div className="space-y-6">
      {template.items.map((item, idx) => {
        const selected = values[idx];
        const meta = selected !== null && selected !== undefined ? SCORE_LABELS[selected] : null;

        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              selected !== null && selected !== undefined
                ? 'border-blue-200 shadow-sm'
                : 'border-gray-200'
            } ${disabled ? 'opacity-70' : ''}`}
          >
            {/* Value name + description header */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {item.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{item.valueName}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.valueDescription}</p>
                </div>
                {meta && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                )}
              </div>
            </div>

            {/* Question statement */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-sm text-gray-700 font-medium leading-snug">{item.statement}</p>
            </div>

            {/* Options — Google Forms style */}
            <div className="px-5 pb-5 space-y-2 mt-1">
              {item.options.map((o) => {
                const isSelected = values[idx] === o.value;
                const scoreMeta = SCORE_LABELS[o.value];
                return (
                  <label
                    key={o.value}
                    className={`
                      flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all select-none
                      ${isSelected
                        ? `${scoreMeta.bg} border-transparent ring-2 ${scoreMeta.ring}`
                        : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
                      }
                      ${disabled ? 'pointer-events-none' : ''}
                    `}
                  >
                    {/* Custom radio */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                      ${isSelected ? `border-transparent ${scoreMeta.bg}` : 'border-gray-300 bg-white'}
                    `}>
                      {isSelected && (
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          o.value === 1 ? 'bg-red-500' :
                          o.value === 2 ? 'bg-orange-500' :
                          o.value === 3 ? 'bg-yellow-500' :
                          o.value === 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`q-${item.id}`}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onChange(idx, o.value)}
                      disabled={disabled}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs leading-relaxed ${isSelected ? `font-semibold ${scoreMeta.color}` : 'text-gray-700'}`}>
                        {o.text}
                      </span>
                    </div>
                    <span className={`text-[11px] font-black shrink-0 mt-0.5 ${isSelected ? scoreMeta.color : 'text-gray-300'}`}>
                      {o.value}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
