import type { EvaluationTemplate } from '../types/evaluation';

interface Eval360QuestionnaireProps {
  template: EvaluationTemplate;
  values: (number | null)[];
  onChange: (index: number, value: number) => void;
  disabled?: boolean;
}

export default function Eval360Questionnaire({ template, values, onChange, disabled }: Eval360QuestionnaireProps) {
  return (
    <div className="space-y-8">
      {template.items.map((item, idx) => (
        <div key={item.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {item.order}. {item.statement}
          </p>
          <div className="space-y-2 mt-3">
            {item.options.map((o) => (
              <label
                key={o.value}
                className={`
                  flex gap-3 p-2.5 rounded-xl cursor-pointer border transition-all
                  ${values[idx] === o.value ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white hover:border-gray-200'}
                  ${disabled ? 'opacity-60 pointer-events-none' : ''}
                `}
              >
                <input
                  type="radio"
                  name={`q-${item.id}`}
                  className="mt-1 shrink-0"
                  checked={values[idx] === o.value}
                  onChange={() => onChange(idx, o.value)}
                  disabled={disabled}
                />
                <span className="text-xs text-gray-700 leading-relaxed">{o.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
