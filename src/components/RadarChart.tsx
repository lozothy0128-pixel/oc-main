import React from 'react';
import { CharacterStats } from '../types/character';
import { useTheme } from '../context/ThemeContext';

interface RadarChartProps {
  stats?: CharacterStats | null;
  color?: string;
  size?: number;
  showLabels?: boolean;
}

const STAT_CONFIG: { key: keyof CharacterStats; label: string }[] = [
  { key: 'stamina', label: '体力' },
  { key: 'endurance', label: '耐力' },
  { key: 'vision', label: '视力' },
  { key: 'patience', label: '耐心' },
  { key: 'hearing', label: '听觉' },
  { key: 'taste', label: '味觉' },
  { key: 'smell', label: '嗅觉' },
  { key: 'luck', label: '运气' },
  { key: 'constitution', label: '体质' },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  stats,
  color = '#8b5cf6',
  showLabels = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const safeStats = stats || ({} as Partial<CharacterStats>);
  const viewBoxSize = 280;
  const center = viewBoxSize / 2;
  const radius = 80; // Safe radius with 60px margin for labels inside 280x280
  const numAxes = STAT_CONFIG.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Levels for background web
  const levels = [0.25, 0.5, 0.75, 1];

  // Helper to compute coordinates
  const getCoordinates = (index: number, valueFactor: number, offset = 0) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueFactor + offset;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build points for character stats safely
  const statPoints = STAT_CONFIG.map((item, i) => {
    const rawVal = safeStats[item.key];
    const num = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : 50;
    const val = Math.max(0, Math.min(100, num)) / 100;
    return getCoordinates(i, val);
  });

  const statPath =
    statPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ') + ' Z';

  return (
    <div className="relative flex items-center justify-center select-none w-full max-w-[220px] sm:max-w-[260px] aspect-square mx-auto">
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full"
      >
        {/* Background webs */}
        {levels.map((lvl) => {
          const ringPoints =
            STAT_CONFIG.map((_, i) => getCoordinates(i, lvl))
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ') + ' Z';
          return (
            <path
              key={`ring-${lvl}`}
              d={ringPoints}
              fill={lvl === 1 ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)') : 'none'}
              stroke={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}
              strokeWidth="1"
              strokeDasharray={lvl === 1 ? 'none' : '2,2'}
            />
          );
        })}

        {/* Axis lines */}
        {STAT_CONFIG.map((_, i) => {
          const outer = getCoordinates(i, 1);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon filled */}
        <path
          d={statPath}
          fill={color}
          fillOpacity={isDark ? 0.35 : 0.25}
          stroke={color}
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />

        {/* Data points */}
        {statPoints.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
            stroke={isDark ? '#0c0d12' : '#ffffff'}
            strokeWidth="1.5"
            className="transition-all duration-300 ease-out"
          />
        ))}

        {/* Attribute Labels */}
        {showLabels &&
          STAT_CONFIG.map((item, i) => {
            const labelPos = getCoordinates(i, 1, 14);
            const rawVal = safeStats[item.key];
            const val = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : 50;
            return (
              <text
                key={`lbl-${item.key}`}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[9.5px] sm:text-[10px] font-medium transition-colors ${
                  isDark ? 'fill-zinc-300' : 'fill-zinc-700'
                }`}
              >
                {item.label} <tspan className={`font-bold ${isDark ? 'fill-zinc-100' : 'fill-zinc-900'}`}>{val}</tspan>
              </text>
            );
          })}
      </svg>
    </div>
  );
};
