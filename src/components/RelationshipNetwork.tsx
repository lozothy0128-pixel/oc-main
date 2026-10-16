import React, { useState } from 'react';
import { Character, CharacterRelationship } from '../types/character';
import { Network, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RelationshipNetworkProps {
  current: Character;
  allCharacters: Character[];
  relationships?: CharacterRelationship[];
  onSelectCharacter?: (char: Character) => void;
}

export const RelationshipNetwork: React.FC<RelationshipNetworkProps> = ({
  current,
  allCharacters,
  relationships = [],
  onSelectCharacter,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Match target characters
  const validRelations = relationships.filter((rel) =>
    allCharacters.some((c) => c.id === rel.targetCharacterId)
  );

  if (validRelations.length === 0) {
    return (
      <div className={`py-12 px-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center space-y-2.5 transition-colors ${
        isDark ? 'border-zinc-800 bg-[#0d1017]' : 'border-zinc-300 bg-white shadow-xs'
      }`}>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
        }`}>
          <Network className="w-5 h-5" />
        </div>
        <p className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
          暂无关联的 OC 人物关系
        </p>
        <p className={`text-[11px] max-w-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          在编辑角色卡中打开「关系」栏目，即可选择其他 OC 并建立关系。
        </p>
      </div>
    );
  }

  const width = 600;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;

  // Compute node positions
  const count = validRelations.length;
  const nodes = validRelations.map((rel, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const targetChar = allCharacters.find((c) => c.id === rel.targetCharacterId)!;
    return {
      rel,
      targetChar,
      x,
      y,
    };
  });

  const currentAvatar = current.avatar || current.standingIllustration;

  return (
    <div className="space-y-4">
      {/* SVG Canvas - Pure Minimalist (Only Avatars & Lines) */}
      <div className={`relative w-full aspect-[5/3] max-h-[360px] rounded-xl border overflow-hidden flex items-center justify-center select-none transition-colors ${
        isDark ? 'bg-[#0b0d14] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Connection Lines & Minimal Labels */}
          {nodes.map(({ rel, targetChar, x, y }) => {
            const isHovered = hoveredNodeId === targetChar.id;
            const midX = (centerX + x) / 2;
            const midY = (centerY + y) / 2;

            return (
              <g key={rel.id}>
                {/* Clean Line */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={
                    isDark
                      ? isHovered ? '#cbd5e1' : '#334155'
                      : isHovered ? '#0f172a' : '#cbd5e1'
                  }
                  strokeWidth={isHovered ? 2 : 1.5}
                  className="transition-colors duration-200"
                />

                {/* Minimal Text Label on Line */}
                {rel.relationType && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-22"
                      y="-8"
                      width="44"
                      height="16"
                      rx="4"
                      fill={isDark ? '#0f1118' : '#ffffff'}
                      stroke={
                        isDark
                          ? isHovered ? '#64748b' : '#334155'
                          : isHovered ? '#0f172a' : '#cbd5e1'
                      }
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={
                        isDark
                          ? isHovered ? '#f1f5f9' : '#94a3b8'
                          : isHovered ? '#0f172a' : '#475569'
                      }
                      fontSize="9"
                      fontWeight="500"
                    >
                      {rel.relationType}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Target Nodes (Avatars & Lines Only) */}
          {nodes.map(({ targetChar, x, y }) => {
            const isHovered = hoveredNodeId === targetChar.id;
            const targetAvatar = targetChar.avatar || targetChar.standingIllustration;

            return (
              <g
                key={targetChar.id}
                transform={`translate(${x}, ${y})`}
                onMouseEnter={() => setHoveredNodeId(targetChar.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectCharacter && onSelectCharacter(targetChar)}
                className="cursor-pointer"
              >
                {/* Outer Ring */}
                <circle
                  r="24"
                  fill={isDark ? '#0f1118' : '#ffffff'}
                  stroke={
                    isDark
                      ? isHovered ? '#ffffff' : '#475569'
                      : isHovered ? '#000000' : '#cbd5e1'
                  }
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />

                {/* Avatar Image Clip */}
                <clipPath id={`avatar-clip-${targetChar.id}`}>
                  <circle r="20" />
                </clipPath>

                {targetAvatar ? (
                  <image
                    href={targetAvatar}
                    x="-20"
                    y="-20"
                    width="40"
                    height="40"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#avatar-clip-${targetChar.id})`}
                  />
                ) : (
                  <circle
                    r="20"
                    fill={isDark ? '#27272a' : '#e4e4e7'}
                  />
                )}

                {/* Avatar Fallback Initial if no image */}
                {!targetAvatar && (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isDark ? '#e4e4e7' : '#18181b'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {targetChar.name ? targetChar.name.charAt(0) : '?'}
                  </text>
                )}

                {/* Character Name under avatar */}
                <text
                  x="0"
                  y="34"
                  textAnchor="middle"
                  fill={
                    isDark
                      ? isHovered ? '#ffffff' : '#cbd5e1'
                      : isHovered ? '#000000' : '#334155'
                  }
                  fontSize="10"
                  fontWeight={isHovered ? '600' : '500'}
                >
                  {targetChar.name}
                </text>
              </g>
            );
          })}

          {/* Center Main OC Node */}
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Center Outer Glow Ring */}
            <circle
              r="28"
              fill={isDark ? '#18181b' : '#ffffff'}
              stroke={isDark ? '#ffffff' : '#000000'}
              strokeWidth="2.5"
            />

            <clipPath id="avatar-clip-center">
              <circle r="24" />
            </clipPath>

            {currentAvatar ? (
              <image
                href={currentAvatar}
                x="-24"
                y="-24"
                width="48"
                height="48"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#avatar-clip-center)"
              />
            ) : (
              <circle r="24" fill={isDark ? '#27272a' : '#e4e4e7'} />
            )}

            {!currentAvatar && (
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill={isDark ? '#ffffff' : '#000000'}
                fontSize="13"
                fontWeight="bold"
              >
                {current.name ? current.name.charAt(0) : 'OC'}
              </text>
            )}

            {/* Center Label Badge */}
            <rect
              x="-22"
              y="32"
              width="44"
              height="14"
              rx="4"
              fill={isDark ? '#ffffff' : '#000000'}
            />
            <text
              x="0"
              y="42"
              textAnchor="middle"
              fill={isDark ? '#000000' : '#ffffff'}
              fontSize="8"
              fontWeight="bold"
            >
              当前OC
            </text>
          </g>
        </svg>
      </div>

      {/* Relationship List Cards below graph */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {validRelations.map((rel) => {
          const targetChar = allCharacters.find((c) => c.id === rel.targetCharacterId)!;
          const avatarUrl = targetChar.avatar || targetChar.standingIllustration;

          return (
            <div
              key={rel.id}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                isDark
                  ? 'bg-[#0d1017] border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs'
              }`}
            >
              <div
                onClick={() => onSelectCharacter && onSelectCharacter(targetChar)}
                className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border cursor-pointer flex items-center justify-center ${
                  isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {targetChar.name ? targetChar.name.charAt(0) : '?'}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-semibold text-xs transition cursor-pointer truncate ${
                      isDark ? 'text-white hover:text-zinc-300' : 'text-zinc-900 hover:text-black'
                    }`}
                    onClick={() => onSelectCharacter && onSelectCharacter(targetChar)}
                  >
                    {targetChar.name}
                    {targetChar.nickname && (
                      <span className={`text-[10px] ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        [{targetChar.nickname}]
                      </span>
                    )}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${
                    isDark
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {rel.relationType || '关联'}
                  </span>
                </div>

                {rel.description && (
                  <p className={`text-[11px] leading-relaxed truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {rel.description}
                  </p>
                )}

                {onSelectCharacter && (
                  <button
                    type="button"
                    onClick={() => onSelectCharacter(targetChar)}
                    className={`pt-0.5 text-[10px] flex items-center gap-1 cursor-pointer transition ${
                      isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    <span>查看档案</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
