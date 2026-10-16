import React from 'react';
import { Search, X, Tag, SlidersHorizontal, LayoutGrid, ListFilter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  availableTags: string[];
  sortBy: 'updatedAt' | 'createdAt' | 'name';
  onSortByChange: (sort: 'updatedAt' | 'createdAt' | 'name') => void;
  viewMode: 'grid' | 'compact';
  onViewModeChange: (mode: 'grid' | 'compact') => void;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  availableTags,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full max-w-full overflow-hidden">
      {/* Search, Sort, View Toggle Bar - Strict Single Row Adaptation */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full">
        {/* Search input (flex-1 min-w-0 for narrow phone screens) */}
        <div className="relative flex-1 min-w-0">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索角色名、种族、职业、标签..."
            className={`w-full pl-8 sm:pl-8.5 pr-6 sm:pr-7 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm outline-none transition shadow-2xs border ${
              isDark
                ? 'bg-[#12141c] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500'
                : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-600'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs p-0.5 rounded cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown (最新更新) */}
        <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 border rounded-xl text-xs shrink-0 transition-colors ${
          isDark
            ? 'bg-[#12141c] border-zinc-800 text-zinc-300'
            : 'bg-white border-zinc-300 text-zinc-700 shadow-2xs'
        }`}>
          <SlidersHorizontal className={`w-3 h-3 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className={`bg-transparent outline-none cursor-pointer pr-0 text-[11px] sm:text-xs font-medium ${
              isDark ? 'text-zinc-200' : 'text-zinc-800'
            }`}
          >
            <option value="updatedAt" className={isDark ? 'bg-[#12141c] text-zinc-200' : 'bg-white text-zinc-900'}>最新更新</option>
            <option value="createdAt" className={isDark ? 'bg-[#12141c] text-zinc-200' : 'bg-white text-zinc-900'}>创建时间</option>
            <option value="name" className={isDark ? 'bg-[#12141c] text-zinc-200' : 'bg-white text-zinc-900'}>角色名称</option>
          </select>
        </div>

        {/* View Mode Toggle (排列方式) */}
        <div className={`flex items-center border p-0.5 rounded-xl shrink-0 transition-colors ${
          isDark ? 'bg-[#12141c] border-zinc-800' : 'bg-zinc-100 border-zinc-300'
        }`}>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="网格视图"
            className={`p-1 sm:p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === 'grid'
                ? isDark
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-black text-white font-semibold shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('compact')}
            title="紧凑列表视图"
            className={`p-1 sm:p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === 'compact'
                ? isDark
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-black text-white font-semibold shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Tags Filter Carousel - With Small Tag Icon and strictly NO '#' */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 w-full max-w-full scrollbar-none no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => onSelectTag('')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all shrink-0 cursor-pointer font-medium text-xs whitespace-nowrap ${
            selectedTag === ''
              ? isDark
                ? 'bg-white text-black font-semibold shadow-xs border border-white'
                : 'bg-black text-white font-semibold shadow-xs border border-black'
              : isDark
              ? 'bg-[#12141c] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              : 'bg-white text-zinc-600 hover:text-black hover:bg-zinc-100 border border-zinc-300 shadow-2xs'
          }`}
        >
          全部角色
        </button>

        {availableTags.map((tag) => {
          const isSelected = selectedTag === tag;
          const cleanTagName = tag.replace(/^#/, '').trim();
          if (!cleanTagName) return null;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? '' : tag)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer text-xs whitespace-nowrap ${
                isSelected
                  ? isDark
                    ? 'bg-white text-black font-semibold shadow-xs border border-white'
                    : 'bg-black text-white font-semibold shadow-xs border border-black'
                  : isDark
                  ? 'bg-[#12141c] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  : 'bg-white text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-300 shadow-2xs'
              }`}
            >
              <Tag className={`w-3 h-3 shrink-0 ${
                isSelected
                  ? isDark ? 'text-black' : 'text-white'
                  : isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`} />
              <span>{cleanTagName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
