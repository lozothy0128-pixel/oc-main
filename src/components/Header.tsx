import React from 'react';
import { Sparkles, Plus, Download, Upload, HelpCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNewCharacter: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleHelp: () => void;
  characterCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewCharacter,
  onExport,
  onImport,
  onToggleHelp,
  characterCount,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-30 transition-colors duration-200 border-b ${
      isDark ? 'border-zinc-800 bg-[#0c0d12]/95 backdrop-blur-md' : 'border-zinc-200 bg-white/95 backdrop-blur-md'
    } px-2.5 sm:px-6 py-2 sm:py-2.5 w-full max-w-full overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left Branding - Compact & clean */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs transition-colors ${
            isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'
          }`}>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap transition-colors ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
          }`}>
            {characterCount} 个OC
          </span>
        </div>

        {/* Right Actions - Fully mobile-optimized single-row */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Day / Night Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? '切换至日间模式' : '切换至夜间模式'}
            title={isDark ? '切换至日间模式 (明亮白底)' : '切换至夜间模式 (深黑护眼)'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-2xs ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border-zinc-700/80 active:scale-95'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-zinc-950 border-zinc-300 active:scale-95'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 transition-transform hover:rotate-45" />
                <span className="hidden md:inline text-xs font-medium text-zinc-300">日间</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-700 transition-transform hover:-rotate-12" />
                <span className="hidden md:inline text-xs font-medium text-zinc-700">夜间</span>
              </>
            )}
          </button>

          {/* Help Guide (Desktop) */}
          <button
            type="button"
            onClick={onToggleHelp}
            title="查看使用指南"
            className={`p-1.5 rounded-lg transition border border-transparent cursor-pointer hidden md:flex items-center gap-1 text-xs whitespace-nowrap shrink-0 ${
              isDark
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>指南</span>
          </button>

          {/* Backup Button (Compact on mobile) */}
          <button
            type="button"
            onClick={onExport}
            title="备份全部数据至本地 JSON"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80 active:scale-95'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300 active:scale-95'
            }`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">备份</span>
          </button>

          {/* Import Button (Compact on mobile) */}
          <button
            type="button"
            onClick={onImport}
            title="导入角色数据备份"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80 active:scale-95'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300 active:scale-95'
            }`}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">导入</span>
          </button>

          {/* Create New OC Button */}
          <button
            type="button"
            onClick={onNewCharacter}
            title="新建 OC 角色档案"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-black active:scale-95'
                : 'bg-black hover:bg-zinc-800 text-white active:scale-95'
            }`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>新建</span>
          </button>
        </div>
      </div>
    </header>
  );
};
