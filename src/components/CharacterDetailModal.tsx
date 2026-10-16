import React, { useState } from 'react';
import { Character, DEFAULT_CHARACTER } from '../types/character';
import { RadarChart } from './RadarChart';
import { TimelineView } from './TimelineView';
import { RelationshipNetwork } from './RelationshipNetwork';
import { ImageViewerModal, ViewerImageItem } from './ImageViewerModal';
import { 
  X, Edit3, Download, Copy,
  Check, ZoomIn, Trash2, Tag,
  Shield, Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CharacterDetailModalProps {
  character: Character | null;
  allCharacters?: Character[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (char: Character) => void;
  onExportSingle: (char: Character) => void;
  onDelete: (id: string) => void;
  onSelectCharacter?: (char: Character) => void;
}

type TabType = 'overview' | 'dossier' | 'stats' | 'lore' | 'worldview' | 'relations' | 'gallery';

const TABS: { id: TabType; label: string }[] = [
  { id: 'overview', label: '概览' },
  { id: 'dossier', label: '档案' },
  { id: 'stats', label: '九维' },
  { id: 'lore', label: '背景' },
  { id: 'worldview', label: '世界观' },
  { id: 'relations', label: '关系' },
  { id: 'gallery', label: '图库' },
];

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  allCharacters = [],
  isOpen,
  onClose,
  onEdit,
  onExportSingle,
  onDelete,
  onSelectCharacter,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedText, setCopiedText] = useState(false);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialIndex: number }>({
    isOpen: false,
    initialIndex: 0,
  });

  if (!isOpen || !character) return null;

  const themeColor = character.representativeColor || '#8b5cf6';
  const displayImage = character.standingIllustration || character.avatar;
  const safeStats = { ...DEFAULT_CHARACTER.stats, ...(character.stats || {}) };

  // Aggregate all images for gallery lightbox
  const allImages: ViewerImageItem[] = [];
  if (character.avatar) {
    allImages.push({ url: character.avatar, title: '角色头像', caption: '基础身份头像' });
  }
  if (character.standingIllustration) {
    allImages.push({ url: character.standingIllustration, title: '全身立绘', caption: '立绘全貌' });
  }
  if (character.gallery && character.gallery.length > 0) {
    character.gallery.forEach((g, idx) => {
      allImages.push({ url: g.url, title: g.caption || `相册插画 #${idx + 1}`, caption: g.caption });
    });
  }

  const openViewerAt = (imgUrl: string) => {
    const idx = allImages.findIndex((item) => item.url === imgUrl);
    setViewerState({
      isOpen: true,
      initialIndex: idx >= 0 ? idx : 0,
    });
  };

  const handleCopyText = () => {
    const cleanTags = (character.tags || []).map((t) => t.replace(/^#/, '')).join('、');
    const text = `
=== 【OC 独立档案】${character.name} ===
别称/称号：${character.nickname || '无'}
性别：${character.gender || '未知'} | 年龄：${character.age || '未知'} | 种族：${character.race || '未知'}
职位/身份：${character.occupation || '未知'}
生日：${character.birthday || '未知'} (${character.birthDate || ''})
掌握语种：${character.languages || '未知'}
代表色：${character.representativeColor || '无'} | 代表花：${character.representativeFlower || '无'} | 代表物：${character.representativeItem || '无'}
口头禅：“${character.catchphrase || '暂无'}”

【外貌特征】
身高：${character.height || '未知'} | 体重：${character.weight || '未知'} | 体型：${character.bodyType || '未知'}
发色/发型：${character.hairColor || '-'} / ${character.hairLength || '-'} / ${character.hairStyle || '-'}
眼瞳/脸型：${character.eyeColor || '-'} / ${character.eyeShape || '-'} / ${character.faceShape || '-'}
饰品：耳饰「${character.earAccessories || '无'}」发饰「${character.hairAccessories || '无'}」
颜值评价：${character.attractiveness || '未知'}
其他特征：${character.otherFeatures || '无'}

【异能与战力】
特殊能力：${character.superpower || '无'}
武器风格：${character.weaponStyle || '无'}

【喜好与日常】
口味偏好：${character.tastePreference || '无'} | 饮食习惯：${character.dietaryHabits || '无'}
过敏原：${character.allergies || '无'}
喜欢的活动：${character.favoriteActivities || '无'} | 兴趣爱好：${character.hobbies || '无'}
喜欢：${character.likes || '无'} | 讨厌：${character.dislikes || '无'}

【心理状态】
性格：${character.personality || '无'} | 精神状态：${character.mentalState || '无'}
心理阴影：${character.trauma || '无'} | 恐惧：${character.fears || '无'}
擅长：${character.proficiencies || '无'} | 追求：${character.aspirations || '无'}

【背景与世界】
出生地：${character.birthplace || '未知'} | 现居地：${character.residence || '未知'}
家庭与家族：${character.familyBackground || '无'} (习俗: ${character.familyCustoms || '无'} / 传家宝: ${character.familyHeirloom || '无'})
简介：${character.bio || '无'}
世界观：${character.worldview || '无'}
标签：${cleanTags || '无'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Fullscreen Lightbox Image Viewer */}
      <ImageViewerModal
        images={allImages}
        initialIndex={viewerState.initialIndex}
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, initialIndex: 0 })}
      />

      <div 
        className={`relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark
            ? 'bg-[#0d0f17] border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
        }`}
      >
        {/* Header Banner - Minimalist */}
        <div className={`relative p-4 sm:p-6 overflow-hidden shrink-0 border-b transition-colors ${
          isDark ? 'border-zinc-800 bg-[#11131c]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          {/* Close & Action Toolbar Top Right */}
          <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 z-10">
            <button
              type="button"
              onClick={handleCopyText}
              title="复制角色设定文本"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border-zinc-300 shadow-2xs'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">复制文本</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onExportSingle(character)}
              title="导出角色独立JSON备份"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border-zinc-300 shadow-2xs'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">导出JSON</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(character)}
              title="编辑角色信息"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-white hover:bg-zinc-200 text-black'
                  : 'bg-black hover:bg-zinc-800 text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>编辑</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Character Identity Hero Row */}
          <div className="relative z-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 pr-28 sm:pr-0">
            {/* Avatar - Click to browse large image */}
            <div 
              onClick={() => displayImage && openViewerAt(displayImage)}
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-zinc-700 bg-zinc-900 relative group cursor-pointer flex items-center justify-center shadow-xs" 
              title="点击查看高清大图"
            >
              {displayImage ? (
                <>
                  <img src={displayImage} alt={character.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white"
                  style={{ backgroundColor: `${themeColor}88` }}
                >
                  {character.name ? character.name.charAt(0) : '?'}
                </div>
              )}
            </div>

            {/* Title / Name / Nickname */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-2xl font-bold tracking-tight">
                  {character.name || '未命名角色'}
                </h2>
                {character.nickname && (
                  <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    [{character.nickname}]
                  </span>
                )}
                {character.race && (
                  <span 
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                    style={{
                      backgroundColor: themeColor ? `${themeColor}20` : '#27272a',
                      borderColor: themeColor ? `${themeColor}50` : '#3f3f46',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                  >
                    {character.race}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className={`flex flex-wrap items-center gap-1.5 text-xs pt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {character.gender && (
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    {character.gender}
                  </span>
                )}
                {character.age && (
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    {character.age}
                  </span>
                )}
                {character.occupation && (
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    {character.occupation}
                  </span>
                )}
                {character.birthday && (
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    生日: {character.birthday}
                  </span>
                )}
              </div>

              {/* Catchphrase */}
              {character.catchphrase && (
                <div className={`pt-0.5 text-xs font-serif italic ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  “{character.catchphrase.replace(/^“|”$/g, '')}”
                </div>
              )}
            </div>
          </div>

          {/* Tags row with Small Tag Icon and strictly NO '#' */}
          {character.tags && character.tags.length > 0 && (
            <div className={`flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              {character.tags.map((tag, i) => {
                const cleanTag = tag.replace(/^#/, '').trim();
                if (!cleanTag) return null;
                return (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-0.5 rounded-lg border shadow-2xs flex items-center gap-1 ${
                      isDark 
                        ? 'bg-zinc-800/90 text-zinc-200 border-zinc-700/60' 
                        : 'bg-white text-zinc-800 border-zinc-300'
                    }`}
                  >
                    <Tag className={`w-3 h-3 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <span>{cleanTag}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab Selection Bar (7 Clean Tabs) */}
        <div className={`flex items-center gap-1 px-3 sm:px-6 py-2 border-b overflow-x-auto scrollbar-none no-scrollbar shrink-0 transition-colors ${
          isDark ? 'border-zinc-800 bg-[#0e1017]' : 'border-zinc-200 bg-zinc-100/80'
        }`}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'bg-white text-black shadow-xs'
                      : 'bg-black text-white shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* TAB: 概览 */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Bio Story */}
                <div className={`lg:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <span className={`text-xs font-bold block ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                    设定简述与故事传记
                  </span>
                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    {character.bio || '暂未填写详细故事传记，可点击右上角【编辑】完善。'}
                  </p>
                </div>

                {/* Right: Nine-Dimension Radar Chart Safe Preview */}
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                      九维属性雷达
                    </span>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('stats')} 
                      className={`text-[11px] underline cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
                    >
                      详情
                    </button>
                  </div>
                  <RadarChart stats={safeStats} color={themeColor} size={200} />
                </div>
              </div>

              {/* Superpower & Weapon style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className={`p-4 rounded-2xl border space-y-1.5 transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>异能与特殊能力</span>
                  </span>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    {character.superpower || '无特殊异能或未填写'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1.5 transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>武器风格与战法</span>
                  </span>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    {character.weaponStyle || '未填写武器风格'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 档案 (外貌、生活、性格心理) */}
          {activeTab === 'dossier' && (
            <div className="space-y-4">
              {/* 外貌体征 */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className={`text-xs sm:text-sm font-bold border-b pb-2 ${
                  isDark ? 'text-zinc-200 border-zinc-800' : 'text-zinc-800 border-zinc-200'
                }`}>
                  外貌体征全表
                </h3>
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  <div><span className="text-zinc-500">身高：</span><span>{character.height || '-'}</span></div>
                  <div><span className="text-zinc-500">体重：</span><span>{character.weight || '-'}</span></div>
                  <div><span className="text-zinc-500">体型：</span><span>{character.bodyType || '-'}</span></div>
                  <div><span className="text-zinc-500">颜值：</span><span>{character.attractiveness || '-'}</span></div>
                  <div><span className="text-zinc-500">发色：</span><span>{character.hairColor || '-'}</span></div>
                  <div><span className="text-zinc-500">发长：</span><span>{character.hairLength || '-'}</span></div>
                  <div><span className="text-zinc-500">发型：</span><span>{character.hairStyle || '-'}</span></div>
                  <div><span className="text-zinc-500">脸型：</span><span>{character.faceShape || '-'}</span></div>
                  <div><span className="text-zinc-500">瞳色：</span><span>{character.eyeColor || '-'}</span></div>
                  <div><span className="text-zinc-500">眼型：</span><span>{character.eyeShape || '-'}</span></div>
                  <div><span className="text-zinc-500">耳饰：</span><span>{character.earAccessories || '-'}</span></div>
                  <div><span className="text-zinc-500">发饰：</span><span>{character.hairAccessories || '-'}</span></div>
                </div>
                {character.otherFeatures && (
                  <div className={`text-xs pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <span className="text-zinc-500">其他特征/印记：</span>
                    <span className="ml-1">{character.otherFeatures}</span>
                  </div>
                )}
              </div>

              {/* 生活与日常喜好 */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className={`text-xs sm:text-sm font-bold border-b pb-2 ${
                  isDark ? 'text-zinc-200 border-zinc-800' : 'text-zinc-800 border-zinc-200'
                }`}>
                  生活喜好与日常
                </h3>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  <div><span className="text-zinc-500">口味偏好：</span><span>{character.tastePreference || '-'}</span></div>
                  <div><span className="text-zinc-500">饮食习惯：</span><span>{character.dietaryHabits || '-'}</span></div>
                  <div><span className="text-zinc-500">过敏原：</span><span>{character.allergies || '-'}</span></div>
                  <div><span className="text-zinc-500">掌握语种：</span><span>{character.languages || '-'}</span></div>
                  <div><span className="text-zinc-500">喜欢的活动：</span><span>{character.favoriteActivities || '-'}</span></div>
                  <div><span className="text-zinc-500">兴趣爱好：</span><span>{character.hobbies || '-'}</span></div>
                  <div><span className="text-zinc-500">特别喜欢：</span><span>{character.likes || '-'}</span></div>
                  <div><span className="text-zinc-500">特别讨厌：</span><span>{character.dislikes || '-'}</span></div>
                </div>
              </div>

              {/* 心理与性格 */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className={`text-xs sm:text-sm font-bold border-b pb-2 ${
                  isDark ? 'text-zinc-200 border-zinc-800' : 'text-zinc-800 border-zinc-200'
                }`}>
                  性格特征与心理状态
                </h3>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  <div><span className="text-zinc-500">性格描述：</span><span>{character.personality || '-'}</span></div>
                  <div><span className="text-zinc-500">精神状态：</span><span>{character.mentalState || '-'}</span></div>
                  <div><span className="text-zinc-500">心理阴影：</span><span>{character.trauma || '-'}</span></div>
                  <div><span className="text-zinc-500">恐惧事物：</span><span>{character.fears || '-'}</span></div>
                  <div><span className="text-zinc-500">身体隐疾：</span><span>{character.illnesses || '-'}</span></div>
                  <div><span className="text-zinc-500">习惯举止：</span><span>{character.behaviorHabits || '-'}</span></div>
                  <div><span className="text-zinc-500">擅长之事：</span><span>{character.proficiencies || '-'}</span></div>
                  <div><span className="text-zinc-500">执念追求：</span><span>{character.aspirations || '-'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 九维 (Never crashes, safe stats) */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className={`flex flex-col lg:flex-row items-center gap-6 p-4 sm:p-6 rounded-2xl border transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex flex-col items-center justify-center shrink-0">
                  <RadarChart stats={safeStats} color={themeColor} size={250} />
                  <span className={`text-xs mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    九维能力多边形雷达评估
                  </span>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(
                    [
                      { key: 'stamina', label: '体力' },
                      { key: 'endurance', label: '耐力' },
                      { key: 'vision', label: '视力' },
                      { key: 'patience', label: '耐心' },
                      { key: 'hearing', label: '听觉' },
                      { key: 'taste', label: '味觉' },
                      { key: 'smell', label: '嗅觉' },
                      { key: 'luck', label: '运气' },
                      { key: 'constitution', label: '体质' },
                    ] as const
                  ).map((item) => {
                    const rawVal = safeStats[item.key];
                    const val = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : 50;
                    return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.label}</span>
                          <span className="font-bold font-mono">{val} / 100</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${val}%`, 
                              backgroundColor: themeColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: 背景 */}
          {activeTab === 'lore' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                  <span className="text-zinc-500 block mb-1">出生地</span>
                  <span className="font-semibold">{character.birthplace || '未知'}</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                  <span className="text-zinc-500 block mb-1">现居地</span>
                  <span className="font-semibold">{character.residence || '未知'}</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                  <span className="text-zinc-500 block mb-1">宗教信仰</span>
                  <span className="font-semibold">{character.religion || '无'}</span>
                </div>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  家族背景与传家宝
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500">家庭与家族：</span>
                    <span className="leading-relaxed">{character.familyBackground || '未填写'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">家族习俗：</span>
                    <span className="leading-relaxed">{character.familyCustoms || '未填写'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">家族传家宝：</span>
                    <span className="font-semibold">{character.familyHeirloom || '未填写'}</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 transition-colors ${
                isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  角色传记详述
                </h4>
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  {character.bio || '暂未撰写传记。'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: 世界观 */}
          {activeTab === 'worldview' && (
            <TimelineView
              worldview={character.worldview}
              timelineEvents={character.timelineEvents || []}
              themeColor={themeColor}
            />
          )}

          {/* TAB: 关系 */}
          {activeTab === 'relations' && (
            <RelationshipNetwork
              current={character}
              allCharacters={allCharacters}
              relationships={character.relationships || []}
              onSelectCharacter={onSelectCharacter}
            />
          )}

          {/* TAB: 图库 (点击立刻进入大图) */}
          {activeTab === 'gallery' && (
            <div className="space-y-5">
              {/* Standup illustration */}
              {character.standingIllustration && (
                <div className={`p-4 rounded-2xl border space-y-2 transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>全身立绘</span>
                    <span className={`text-[11px] font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      点击浏览全屏大图
                    </span>
                  </div>
                  <div 
                    onClick={() => openViewerAt(character.standingIllustration)}
                    className="relative max-w-sm mx-auto h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 cursor-zoom-in group shadow-md flex items-center justify-center p-2"
                  >
                    <img src={character.standingIllustration} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none" />
                    <img src={character.standingIllustration} alt="Standing Art" className="relative z-1 max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 z-2 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery collection */}
              {character.gallery && character.gallery.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>角色相册插画 ({character.gallery.length} 张图片)</span>
                    <span className={`text-[11px] font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      点击任意图片进入大图浏览
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {character.gallery.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => openViewerAt(item.url)}
                        className="group relative rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 aspect-square cursor-zoom-in shadow-xs hover:border-zinc-400 transition flex items-center justify-center p-1.5"
                      >
                        <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-25 scale-120 pointer-events-none" />
                        <img src={item.url} alt={item.caption} className="relative z-1 max-w-full max-h-full object-contain transition duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 z-2 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                        {item.caption && (
                          <div className="absolute bottom-0 inset-x-0 z-3 bg-black/80 px-2 py-1 text-[11px] text-white truncate text-center">
                            {item.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !character.standingIllustration && (
                  <div className={`text-center py-12 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    暂未上传立绘或相册图片，点击右上角【编辑】即可在图库中直接添加！
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-t flex items-center justify-between shrink-0 text-xs transition-colors ${
          isDark ? 'border-zinc-800 bg-[#11131c] text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
        }`}>
          <span>角色卡 ID: {character.id}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(character.id)}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除角色</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
              }`}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
