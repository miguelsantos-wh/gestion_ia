import { useState } from 'react';
import type { PerformanceLevel, PotentialLevel } from '../types';
import { BOX_CONFIGS } from '../data/mockData';

const GRID_LAYOUT: { potential: PotentialLevel; performance: PerformanceLevel }[][] = [
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

interface PerceptionPlacementGridProps {
  compact?: boolean;
  onSelect: (performanceLevel: PerformanceLevel, potentialLevel: PotentialLevel) => void;
  disabled?: boolean;
}

export default function PerceptionPlacementGrid({
  compact = false,
  onSelect,
  disabled,
}: PerceptionPlacementGridProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2">
        <div className="flex flex-col items-center justify-center w-6 shrink-0">
          <div
            className="flex flex-col items-center gap-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
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
                    const config = BOX_CONFIGS.find(
                      (b) => b.potentialLevel === cell.potential && b.performanceLevel === cell.performance
                    );
                    if (!config) return null;
                    const isHovered = hoverId === config.id;
                    return (
                      <button
                        type="button"
                        key={colIdx}
                        disabled={disabled}
                        onMouseEnter={() => setHoverId(config.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => onSelect(cell.performance, cell.potential)}
                        className={`
                          relative rounded-xl border-2 transition-all text-left
                          ${compact ? 'min-h-[72px]' : 'min-h-[96px]'}
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
                        `}
                        style={{
                          backgroundColor: isHovered ? config.bgColor : `${config.bgColor}99`,
                          borderColor: isHovered ? config.color : `${config.color}40`,
                        }}
                      >
                        <div className="p-2">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-sm font-black leading-none" style={{ color: config.textColor }}>
                              {config.code}
                            </span>
                            <span className="text-xs font-bold leading-tight" style={{ color: config.textColor }}>
                              {config.label}
                            </span>
                          </div>
                          {!compact && (
                            <>
                              <div className="text-[9px] mt-0.5 opacity-90 leading-tight" style={{ color: config.textColor }}>
                                {config.description}
                              </div>
                              <div className="text-[10px] mt-0.5 opacity-75" style={{ color: config.textColor }}>
                                Toca para ubicar aquí
                              </div>
                            </>
                          )}
                        </div>
                      </button>
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
