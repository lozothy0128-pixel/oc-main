import React from 'react';
import { Character } from '../types/character';
import { Edit3, Download, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CharacterCardProps {
  character: Character;
  onView: (char: Character) => void;
  onEdit: (char: Character) => void;
  onDuplicate: (char: Character, e: React.MouseEvent) => void;
  onExportSingle: (char: Character, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'compact';
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onView,
  onEdit,
  onExportSingle,
  onDelete,
  viewMode = 'grid',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const displayImage = character.avatar || character.standingIllustration;

  if (viewMode === 'compact') {
    return (
      <div 
        onClick={() => onView(character)}
        className={`group relative rounded-xl p-2.5 sm:p-3 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
          isDark
            ? 'bg-[#10121a] hover:bg-[#151824] border border-zinc-800 hover:border-zinc-600'
            : 'bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center ${
            isDark ? 'border-zinc-700/80 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'
          }`}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={character.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${
                isDark ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                {character.name ? character.name.charAt(0) : '?'}
              </div>
            )}
          </div>

          {/* Core Info - No tags on preview */}
          <div className="min-w-0">
            <h3 className={`text-sm font-semibold transition truncate ${
              isDark ? 'text-zinc-100 group-hover:text-white' : 'text-zinc-900 group-hover:text-black'
            }`}>
              {character.name || '未命名角色'}
            </h3>
            <p className={`text-xs truncate mt-0.5 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              {character.nickname || '无别称'}
            </p>
          </div>
        </div>

        {/* Action Buttons in Compact Mode */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEdit(character)}
            title="编辑角色"
            className={`p-1.5 rounded transition cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onExportSingle(character, e)}
            title="导出独立角色数据"
            className={`p-1.5 rounded transition cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(character.id, e)}
            title="删除角色"
            className={`p-1.5 rounded transition cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40'
                : 'text-zinc-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Mode:
  // Strict 3:4 Aspect Ratio, Contrasting Split Layout:
  // Top: pure image area taking flexible remaining space (flex-1 min-h-0)
  // Bottom: distinct contrasting info block (shrink-0) with Name, Nickname, NO tags, and Edit/Export/Delete in the bottom-right corner
  return (
    <div
      onClick={() => onView(character)}
      className={`group relative aspect-[3/4] w-full rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col select-none shadow-xs ${
        isDark
          ? 'bg-[#0d0f17] border border-zinc-800 hover:border-zinc-500'
          : 'bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md'
      }`}
    >
      {/* Top Section: Pure Image Area (Takes remaining vertical space of 3:4 ratio) */}
      <div className={`relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center ${
        isDark ? 'bg-zinc-950' : 'bg-zinc-100'
      }`}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103 select-none"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-2 ${
            isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-400'
          }`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center text-xs sm:text-sm font-bold mb-1 ${
              isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-zinc-300 bg-white text-zinc-600'
            }`}>
              {character.name ? character.name.charAt(0) : '?'}
            </div>
            <span className="text-[9px] sm:text-[10px]">无头像</span>
          </div>
        )}
      </div>

      {/* Bottom Section: Contrasting Info Block (shrink-0 ensures buttons and info are never squeezed out) */}
      <div className={`shrink-0 w-full border-t p-2 sm:p-2.5 flex flex-col justify-between transition-colors ${
        isDark
          ? 'bg-[#13151f] border-zinc-800/90'
          : 'bg-zinc-50/90 border-zinc-200'
      }`}>
        {/* Name and Nickname (Tags completely removed) */}
        <div className="min-w-0 w-full">
          <h3 className={`text-xs sm:text-sm font-semibold transition truncate leading-tight ${
            isDark ? 'text-white group-hover:text-zinc-200' : 'text-zinc-900 group-hover:text-black'
          }`}>
            {character.name || '未命名角色'}
          </h3>
          <p className={`text-[10px] sm:text-xs truncate mt-0.5 leading-tight ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            {character.nickname || '无别称'}
          </p>
        </div>

        {/* Bottom Right Actions: Edit, Export, Delete (Always visible, firmly in the bottom-right corner) */}
        <div 
          className="flex items-center justify-end gap-1 pt-1.5 shrink-0 self-end"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEdit(character)}
            title="编辑角色"
            className={`p-1 sm:p-1.5 rounded-md border transition cursor-pointer shrink-0 ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/80'
                : 'bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 hover:text-black border-zinc-300 shadow-2xs'
            }`}
          >
            <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onExportSingle(character, e)}
            title="导出独立角色数据"
            className={`p-1 sm:p-1.5 rounded-md border transition cursor-pointer shrink-0 ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/80'
                : 'bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 hover:text-black border-zinc-300 shadow-2xs'
            }`}
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(character.id, e)}
            title="删除角色"
            className={`p-1 sm:p-1.5 rounded-md border transition cursor-pointer shrink-0 ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-rose-950/70 active:bg-rose-900 text-zinc-300 hover:text-rose-400 border-zinc-700/80'
                : 'bg-white hover:bg-rose-50 active:bg-rose-100 text-zinc-600 hover:text-rose-600 border-zinc-300 shadow-2xs'
            }`}
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
