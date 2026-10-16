/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Character, DEFAULT_CHARACTER } from './types/character';
import { 
  getAllCharacters, 
  saveCharacter, 
  deleteCharacter,
  checkAndInitPresets,
  PRESET_CHARACTERS
} from './utils/db';
import { Header } from './components/Header';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { CharacterCard } from './components/CharacterCard';
import { CharacterEditModal } from './components/CharacterEditModal';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { ExportImportModal } from './components/ExportImportModal';
import { HelpModal } from './components/HelpModal';
import { Plus, Sparkles, FolderHeart, RefreshCw } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'createdAt'>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailCharacter, setActiveDetailCharacter] = useState<Character | null>(null);

  const [exportImportModal, setExportImportModal] = useState<{
    isOpen: boolean;
    mode: 'export' | 'import';
  }>({ isOpen: false, mode: 'export' });

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load characters from IndexedDB
  const loadCharacters = async () => {
    try {
      await checkAndInitPresets();
      const list = await getAllCharacters();
      setCharacters(list);
    } catch (err) {
      console.error('Failed to load characters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  // Compute all unique tags from all characters
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    characters.forEach((char) => {
      if (char.tags && Array.isArray(char.tags)) {
        char.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [characters]);

  // Filter & sort characters
  const filteredCharacters = useMemo(() => {
    return characters
      .filter((char) => {
        if (selectedTag && (!char.tags || !char.tags.includes(selectedTag))) {
          return false;
        }

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const searchable = [
          char.name,
          char.nickname,
          char.race,
          char.occupation,
          char.gender,
          char.personality,
          char.superpower,
          char.weaponStyle,
          char.representativeFlower,
          char.representativeItem,
          char.worldview,
          char.bio,
          ...(char.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchable.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '', 'zh-CN');
        }
        if (sortBy === 'createdAt') {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }, [characters, searchQuery, selectedTag, sortBy]);

  // Handler: Create new character
  const handleOpenCreate = () => {
    const newChar: Character = {
      ...DEFAULT_CHARACTER,
      id: `oc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingCharacter(newChar);
    setIsEditModalOpen(true);
  };

  // Handler: Save Character
  const handleSaveCharacter = async (charToSave: Character) => {
    try {
      await saveCharacter(charToSave);
      await loadCharacters();
      setIsEditModalOpen(false);
      setEditingCharacter(null);

      if (activeDetailCharacter && activeDetailCharacter.id === charToSave.id) {
        setActiveDetailCharacter(charToSave);
      }
      showToast(`已成功保存「${charToSave.name || 'OC角色'}」至独立数据库！`);
    } catch (err: any) {
      alert('保存失败：' + (err.message || '未知错误'));
    }
  };

  // Handler: Delete character with confirmation
  const handleDeleteCharacter = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const char = characters.find((c) => c.id === id);
    const confirmName = char?.name || '该角色';
    if (!window.confirm(`确认要删除「${confirmName}」吗？此操作不可逆。`)) {
      return;
    }

    try {
      await deleteCharacter(id);
      await loadCharacters();
      if (activeDetailCharacter?.id === id) {
        setIsDetailModalOpen(false);
        setActiveDetailCharacter(null);
      }
      showToast(`已成功删除「${confirmName}」`);
    } catch (err: any) {
      alert('删除失败：' + (err.message || '未知错误'));
    }
  };

  // Handler: Duplicate character
  const handleDuplicateCharacter = async (char: Character, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cloned: Character = {
      ...char,
      id: `oc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${char.name} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await saveCharacter(cloned);
      await loadCharacters();
      showToast(`已克隆「${cloned.name}」`);
    } catch (err: any) {
      alert('克隆失败：' + (err.message || '未知错误'));
    }
  };

  // Handler: Export single character JSON
  const handleExportSingleCharacter = (char: Character, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const json = JSON.stringify(char, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OC_${char.name || '角色卡'}_${char.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`已导出「${char.name}」独立角色卡数据！`);
  };

  const handleResetPresets = async () => {
    for (const p of PRESET_CHARACTERS) {
      await saveCharacter(p);
    }
    await loadCharacters();
    showToast('已重新加载预设OC演示角色！');
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark
        ? 'bg-[#0c0d12] text-zinc-100 selection:bg-white/20 selection:text-white'
        : 'bg-[#f8fafc] text-zinc-900 selection:bg-black/10 selection:text-black'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-60 border px-3.5 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-fadeIn ${
          isDark
            ? 'bg-zinc-900 border-zinc-700 text-white'
            : 'bg-white border-zinc-300 text-zinc-900 shadow-lg'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onNewCharacter={handleOpenCreate}
        onExport={() => setExportImportModal({ isOpen: true, mode: 'export' })}
        onImport={() => setExportImportModal({ isOpen: true, mode: 'import' })}
        onToggleHelp={() => setIsHelpModalOpen(true)}
        characterCount={characters.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-3 sm:py-5 space-y-3.5 sm:space-y-5">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          availableTags={availableTags}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`} />
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>正在连接专属独立数据库...</span>
          </div>
        ) : filteredCharacters.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5'
                : 'space-y-3'
            }
          >
            {filteredCharacters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                viewMode={viewMode}
                onView={(c) => {
                  setActiveDetailCharacter(c);
                  setIsDetailModalOpen(true);
                }}
                onEdit={(c) => {
                  setEditingCharacter(c);
                  setIsEditModalOpen(true);
                }}
                onDuplicate={handleDuplicateCharacter}
                onExportSingle={handleExportSingleCharacter}
                onDelete={handleDeleteCharacter}
              />
            ))}
          </div>
        ) : (
          <div className={`py-20 px-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 ${
            isDark ? 'border-zinc-800 bg-[#11131a]' : 'border-zinc-300 bg-white shadow-xs'
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
            }`}>
              <FolderHeart className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {searchQuery || selectedTag ? '未找到匹配的角色卡' : '暂无任何角色卡'}
              </h3>
              <p className={`text-xs max-w-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {searchQuery || selectedTag
                  ? '尝试清除搜索关键词或切换其它分类标签'
                  : '每个角色都是一个独立的世界。点击下方按钮即可开启你的第一个设定！'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {searchQuery || selectedTag ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer border ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                  }`}
                >
                  重置筛选条件
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                      isDark
                        ? 'bg-white hover:bg-zinc-200 text-black'
                        : 'bg-black hover:bg-zinc-800 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>新建第一个 OC</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPresets}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                    }`}
                  >
                    载入演示角色
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className={`border-t py-3 sm:py-4 px-4 text-center text-xs shrink-0 transition-colors ${
        isDark
          ? 'border-zinc-800 bg-[#0a0d15] text-zinc-500'
          : 'border-zinc-200 bg-white text-zinc-600'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>数据存储在本地浏览器，请及时备份</span>
        </div>
      </footer>

      {/* Modals */}
      {isEditModalOpen && editingCharacter && (
        <CharacterEditModal
          isOpen={isEditModalOpen}
          initialCharacter={editingCharacter}
          allCharacters={characters}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCharacter(null);
          }}
          onSave={handleSaveCharacter}
        />
      )}

      {isDetailModalOpen && activeDetailCharacter && (
        <CharacterDetailModal
          isOpen={isDetailModalOpen}
          character={activeDetailCharacter}
          allCharacters={characters}
          onSelectCharacter={(char) => {
            setActiveDetailCharacter(char);
          }}
          onClose={() => {
            setIsDetailModalOpen(false);
            setActiveDetailCharacter(null);
          }}
          onEdit={(char) => {
            setIsDetailModalOpen(false);
            setEditingCharacter(char);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDeleteCharacter}
          onExportSingle={handleExportSingleCharacter}
        />
      )}

      {exportImportModal.isOpen && (
        <ExportImportModal
          isOpen={exportImportModal.isOpen}
          mode={exportImportModal.mode}
          onClose={() => setExportImportModal({ isOpen: false, mode: 'export' })}
          onRefresh={loadCharacters}
          characterCount={characters.length}
        />
      )}

      {isHelpModalOpen && (
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
      )}
    </div>
  );
}
