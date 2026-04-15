import { useState } from 'react';
import { Employee, BoxConfig } from '../types';
import { BOX_CONFIGS } from '../data/mockData';

interface NineBoxGridProps {
  employees: Employee[];
  onEmployeeClick: (employee: Employee) => void;
  selectedEmployee?: Employee | null;
  compact?: boolean;
}

const GRID_LAYOUT: { potential: 'high' | 'medium' | 'low'; performance: 'low' | 'medium' | 'high' }[][] = [
  [
    { potential: 'high', performance: 'low' },
    { potential: 'high', performance: 'medium' },
    { potential: 'high', performance: 'high' },
  ],
  [
    { potential: 'medium', performance: 'low' },
    { potential: 'medium', performance: 'medium' },
    { potential: 'medium', performance: 'high' },
  ],
  [
    { potential: 'low', performance: 'low' },
    { potential: 'low', performance: 'medium' },
    { potential: 'low', performance: 'high' },
  ],
];

function getBoxConfig(potential: string, performance: string): BoxConfig | undefined {
  return BOX_CONFIGS.find(
    (b) => b.potentialLevel === potential && b.performanceLevel === performance
  );
}

function getBoxEmployees(employees: Employee[], potential: string, performance: string): Employee[] {
  return employees.filter(
    (e) => e.potentialLevel === potential && e.performanceLevel === performance
  );
}

export default function NineBoxGrid({ employees, onEmployeeClick, selectedEmployee, compact = false }: NineBoxGridProps) {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2">
        <div className="flex flex-col items-center justify-center w-6 shrink-0">
          <div className="flex flex-col items-center gap-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Valores</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-1">
            <div className="flex flex-col justify-between w-12 shrink-0 text-right pr-2">
              <span className="text-xs font-medium text-gray-400 py-1">Alto</span>
              <span className="text-xs font-medium text-gray-400 py-1">Medio</span>
              <span className="text-xs font-medium text-gray-400 py-1">Bajo</span>
            </div>

            <div className="flex-1 grid grid-rows-3 gap-1">
              {GRID_LAYOUT.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-1">
                  {row.map((cell, colIdx) => {
                    const config = getBoxConfig(cell.potential, cell.performance);
                    const boxEmployees = getBoxEmployees(employees, cell.potential, cell.performance);
                    if (!config) return null;
                    const isHovered = hoveredBox === config.id;
                    const hasSelected = selectedEmployee &&
                      selectedEmployee.potentialLevel === cell.potential &&
                      selectedEmployee.performanceLevel === cell.performance;

                    return (
                      <div
                        key={colIdx}
                        onMouseEnter={() => setHoveredBox(config.id)}
                        onMouseLeave={() => setHoveredBox(null)}
                        className={`
                          relative rounded-xl border-2 transition-all duration-200 cursor-pointer
                          ${compact ? 'min-h-[80px]' : 'min-h-[118px]'}
                          ${hasSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                        `}
                        style={{
                          backgroundColor: isHovered ? config.bgColor : `${config.bgColor}99`,
                          borderColor: isHovered ? config.color : `${config.color}40`,
                          transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                        }}
                      >
                        <div className="p-2 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span
                                className={`font-black leading-none ${compact ? 'text-sm' : 'text-base'}`}
                                style={{ color: config.textColor }}
                              >
                                {config.code}
                              </span>
                              <span
                                className={`font-bold leading-tight ${compact ? 'text-[10px]' : 'text-xs'}`}
                                style={{ color: config.textColor }}
                              >
                                {config.label}
                              </span>
                            </div>
                            {!compact && (
                              <div
                                className="text-[10px] mt-0.5 opacity-85 leading-snug"
                                style={{ color: config.textColor }}
                              >
                                {config.description}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {boxEmployees.map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => onEmployeeClick(emp)}
                                className={`
                                  w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center
                                  transition-all duration-150 hover:scale-110 hover:shadow-md
                                  ${selectedEmployee?.id === emp.id ? 'ring-2 ring-white ring-offset-1 shadow-lg scale-110' : ''}
                                `}
                                style={{ backgroundColor: config.color, color: '#fff' }}
                                title={`${emp.name} - ${emp.position}`}
                              >
                                {emp.avatar}
                              </button>
                            ))}
                            {boxEmployees.length > 0 && (
                              <span
                                className="text-xs font-semibold self-center"
                                style={{ color: config.textColor }}
                              >
                                {boxEmployees.length > 1 ? `${boxEmployees.length}` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          {boxEmployees.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex ml-12 gap-1 mt-1">
            <div className="flex-1 grid grid-cols-3 gap-1 text-center">
              <span className="text-xs font-medium text-gray-400">Bajo</span>
              <span className="text-xs font-medium text-gray-400">Medio</span>
              <span className="text-xs font-medium text-gray-400">Alto</span>
            </div>
          </div>
          <div className="flex justify-center ml-12 mt-0.5">
            <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Resultados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
