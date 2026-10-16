import React, { useState, useRef, useEffect } from 'react';
import { Character, CharacterStats, GalleryItem, TimelineEvent, CharacterRelationship, DEFAULT_CHARACTER } from '../types/character';
import { processImageFile } from '../utils/image';
import { sortTimelineEvents } from '../utils/timeline';
import { RadarChart } from './RadarChart';
import { 
  X, Save, Upload, Trash2, 
  Palette, AlertCircle, Plus, Clock, Network, 
  Image as ImageIcon, Images, Calendar, Shield, Globe, Tag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CharacterEditModalProps {
  initialCharacter: Character;
  allCharacters?: Character[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
}

type EditTabKey = 'overview' | 'dossier' | 'stats' | 'lore' | 'worldview' | 'relations' | 'gallery';

const TABS: { id: EditTabKey; label: string }[] = [
  { id: 'overview', label: '概览' },
  { id: 'dossier', label: '档案' },
  { id: 'stats', label: '九维' },
  { id: 'lore', label: '背景' },
  { id: 'worldview', label: '世界观' },
  { id: 'relations', label: '关系' },
  { id: 'gallery', label: '图库' },
];

const PRESET_COLORS = [
  '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4', 
  '#10b981', '#f59e0b', '#ef4444', '#6366f1', 
  '#14b8a6', '#e11d48', '#a855f7', '#64748b',
];

const RELATION_SUGGESTIONS = [
  '挚友', '宿敌', '搭档', '恋人', '师徒', '同盟', '亲属', '竞争对手'
];

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  initialCharacter,
  allCharacters = [],
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Character>(() => ({ 
    ...DEFAULT_CHARACTER,
    ...initialCharacter,
    stats: {
      ...DEFAULT_CHARACTER.stats,
      ...(initialCharacter?.stats || {}),
    },
    timelineEvents: initialCharacter?.timelineEvents || [],
    relationships: initialCharacter?.relationships || [],
    gallery: initialCharacter?.gallery || [],
    tags: (initialCharacter?.tags || []).map((t) => t.replace(/^#/, '')),
  }));

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...DEFAULT_CHARACTER,
        ...initialCharacter,
        stats: {
          ...DEFAULT_CHARACTER.stats,
          ...(initialCharacter?.stats || {}),
        },
        timelineEvents: initialCharacter?.timelineEvents || [],
        relationships: initialCharacter?.relationships || [],
        gallery: initialCharacter?.gallery || [],
        tags: (initialCharacter?.tags || []).map((t) => t.replace(/^#/, '')),
      });
      setActiveTab('overview');
      setTagInput('');
      setUploadError(null);
    }
  }, [isOpen, initialCharacter]);

  const [activeTab, setActiveTab] = useState<EditTabKey>('overview');
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Timeline form state
  const [newTimeline, setNewTimeline] = useState({ year: '', title: '', description: '' });

  // Relationship form state
  const otherCharacters = allCharacters.filter((c) => c.id !== formData.id);
  const [newRel, setNewRel] = useState({
    targetCharacterId: otherCharacters[0]?.id || '',
    relationType: '挚友',
    description: '',
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const standingInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof Character, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (statKey: keyof CharacterStats, value: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statKey]: value,
      },
    }));
  };

  // Image Upload handler with compression
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'avatar' | 'standingIllustration' | 'gallery'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      if (targetField === 'gallery') {
        const newItems: GalleryItem[] = [];
        for (let i = 0; i < files.length; i++) {
          const base64 = await processImageFile(files[i], 1600, 0.85);
          newItems.push({
            id: `g_${Date.now()}_${i}`,
            url: base64,
            caption: files[i].name.replace(/\.[^/.]+$/, ''),
          });
        }
        setFormData((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), ...newItems],
        }));
      } else {
        const base64 = await processImageFile(files[0], 1200, 0.88);
        setFormData((prev) => ({
          ...prev,
          [targetField]: base64,
        }));
      }
    } catch {
      setUploadError('图片读取失败，请检查图片格式');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Timeline events helpers
  const handleAddTimelineEvent = () => {
    if (!newTimeline.year.trim() && !newTimeline.title.trim()) return;
    const item: TimelineEvent = {
      id: `evt_${Date.now()}`,
      year: newTimeline.year.trim() || '未知年代',
      title: newTimeline.title.trim() || '重大纪元事件',
      description: newTimeline.description.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      timelineEvents: [...(prev.timelineEvents || []), item],
    }));
    setNewTimeline({ year: '', title: '', description: '' });
  };

  const handleRemoveTimelineEvent = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      timelineEvents: (prev.timelineEvents || []).filter((e) => e.id !== id),
    }));
  };

  // Relationship helpers
  const handleAddRelationship = () => {
    if (!newRel.targetCharacterId) return;
    const targetChar = allCharacters.find((c) => c.id === newRel.targetCharacterId);
    if (!targetChar) return;

    const item: CharacterRelationship = {
      id: `rel_${Date.now()}`,
      targetCharacterId: newRel.targetCharacterId,
      relationType: newRel.relationType.trim() || '关联',
      description: newRel.description.trim(),
    };

    // Filter out duplicate relation with same target
    setFormData((prev) => ({
      ...prev,
      relationships: [
        ...(prev.relationships || []).filter((r) => r.targetCharacterId !== newRel.targetCharacterId),
        item,
      ],
    }));

    setNewRel((prev) => ({
      ...prev,
      description: '',
    }));
  };

  const handleRemoveRelationship = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      relationships: (prev.relationships || []).filter((r) => r.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setActiveTab('overview');
      alert('请至少填写角色名字！');
      return;
    }
    onSave(formData);
  };

  const sortedTimeline = sortTimelineEvents(formData.timelineEvents || []);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark
            ? 'bg-[#0f1118] border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
          isDark ? 'border-zinc-800 bg-[#121520]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: formData.representativeColor || '#475569' }}
            >
              {formData.name ? formData.name.charAt(0) : 'OC'}
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {formData.id ? '编辑角色设定档案' : '新建独立 OC 角色卡'}
              </h2>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                支持时间轴编年史与关系网络图 · 数据永久安全保存在本地
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition ${
                isDark
                  ? 'bg-white hover:bg-zinc-200 text-black'
                  : 'bg-black hover:bg-zinc-800 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>保存设定</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (7 Simplified Tabs - Monochrome) */}
        <div className={`flex items-center gap-1 px-4 py-2 border-b overflow-x-auto scrollbar-none no-scrollbar shrink-0 transition-colors ${
          isDark ? 'border-zinc-800 bg-[#0e1017]' : 'border-zinc-200 bg-zinc-100/70'
        }`}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-black text-white font-semibold shadow-sm'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB: 概览 */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    角色名字 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="如：艾尔诺斯·星芒"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">别称 / 称号</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    placeholder="如：月影隐修 / 白夜守望"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">性别</label>
                  <input
                    type="text"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    placeholder="如：男 / 女 / 无性别 / 自定义"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">年龄</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="如：24岁 (表象) / 真实未知"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">种族</label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => handleChange('race', e.target.value)}
                    placeholder="如：星灵月裔 / 人类 / 半精灵"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">职位 / 身份</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="如：深空观测者 / 骑士团长"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">生日</label>
                  <input
                    type="text"
                    value={formData.birthday}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                    placeholder="如：10月24日"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">出生日期 / 历法</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    placeholder="如：霜降之月 / 星历320年"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">掌握语种</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => handleChange('languages', e.target.value)}
                    placeholder="如：大陆通用语、古代精灵符文"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              {/* 象征标志 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-purple-300 block">象征与标志</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">代表花</label>
                    <input
                      type="text"
                      value={formData.representativeFlower}
                      onChange={(e) => handleChange('representativeFlower', e.target.value)}
                      placeholder="如：幽夜昙华"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">代表物</label>
                    <input
                      type="text"
                      value={formData.representativeItem}
                      onChange={(e) => handleChange('representativeItem', e.target.value)}
                      placeholder="如：永曜星轨罗盘"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">代表色</label>
                      <button
                        type="button"
                        onClick={() => handleChange('representativeColor', '')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          !formData.representativeColor || formData.representativeColor === 'none'
                            ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 font-medium'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        无
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.representativeColor || '#8b5cf6'}
                        onChange={(e) => handleChange('representativeColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <div className="flex items-center gap-1 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleChange('representativeColor', '')}
                          title="选择无标志色"
                          className={`w-5 h-5 rounded-full border text-[9px] flex items-center justify-center shrink-0 cursor-pointer ${
                            !formData.representativeColor || formData.representativeColor === 'none'
                              ? 'border-white bg-slate-800 text-white font-bold'
                              : 'border-slate-700 bg-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          无
                        </button>
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleChange('representativeColor', c)}
                            className={`w-4 h-4 rounded-full border shrink-0 transition-transform ${
                              formData.representativeColor === c ? 'border-white scale-110' : 'border-white/20'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs text-slate-400">口头禅</label>
                  <input
                    type="text"
                    value={formData.catchphrase}
                    onChange={(e) => handleChange('catchphrase', e.target.value)}
                    placeholder="如：“繁星从不向黑夜低头，我也一样。”"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* 标签栏 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">分类标签</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="输入标签按回车添加（如：主角、赛博朋克）"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                  >
                    添加
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.map((t) => (
                      <span
                        key={t}
                        className={`px-2 py-0.5 rounded-lg text-xs border flex items-center gap-1 ${
                          isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700/60' : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                        }`}
                      >
                        <Tag className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{t.replace(/^#/, '')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400 text-zinc-400 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: 档案 (外貌、体征、生活、性格心理、战斗) */}
          {activeTab === 'dossier' && (
            <div className="space-y-5">
              {/* 外貌体征 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-purple-300 block">外貌体征</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">身高</label>
                    <input type="text" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="如：183 cm" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">体重</label>
                    <input type="text" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="如：67 kg" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">体型</label>
                    <input type="text" value={formData.bodyType} onChange={(e) => handleChange('bodyType', e.target.value)} placeholder="如：修长匀称" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">颜值</label>
                    <input type="text" value={formData.attractiveness} onChange={(e) => handleChange('attractiveness', e.target.value)} placeholder="如：9.6 / 10" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">发色</label>
                    <input type="text" value={formData.hairColor} onChange={(e) => handleChange('hairColor', e.target.value)} placeholder="如：银白泛紫" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">发长</label>
                    <input type="text" value={formData.hairLength} onChange={(e) => handleChange('hairLength', e.target.value)} placeholder="如：及肩长发" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">发型</label>
                    <input type="text" value={formData.hairStyle} onChange={(e) => handleChange('hairStyle', e.target.value)} placeholder="如：侧边微挽" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">脸型</label>
                    <input type="text" value={formData.faceShape} onChange={(e) => handleChange('faceShape', e.target.value)} placeholder="如：清冷鹅蛋脸" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">瞳色</label>
                    <input type="text" value={formData.eyeColor} onChange={(e) => handleChange('eyeColor', e.target.value)} placeholder="如：琉璃紫异色" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">眼型</label>
                    <input type="text" value={formData.eyeShape} onChange={(e) => handleChange('eyeShape', e.target.value)} placeholder="如：微扬凤眼" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">耳饰</label>
                    <input type="text" value={formData.earAccessories} onChange={(e) => handleChange('earAccessories', e.target.value)} placeholder="如：星盘银晶耳坠" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">发饰</label>
                    <input type="text" value={formData.hairAccessories} onChange={(e) => handleChange('hairAccessories', e.target.value)} placeholder="如：星芒银簪" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-slate-400">其他特点 (印记、伤疤、纹身等)</label>
                  <input type="text" value={formData.otherFeatures} onChange={(e) => handleChange('otherFeatures', e.target.value)} placeholder="如：后颈伴生星座契约胎记" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
              </div>

              {/* 异能与武器 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-indigo-300 block">异能与战法风格</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">异能 / 特殊能力</label>
                    <textarea rows={2} value={formData.superpower} onChange={(e) => handleChange('superpower', e.target.value)} placeholder="如：重力曲翘、星光具象化" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">武器风格 / 战斗方式</label>
                    <textarea rows={2} value={formData.weaponStyle} onChange={(e) => handleChange('weaponStyle', e.target.value)} placeholder="如：星轨提灯与符文轻剑" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white resize-none" />
                  </div>
                </div>
              </div>

              {/* 生活与日常喜好 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-emerald-300 block">生活习惯与日常喜好</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">口味偏好</label>
                    <input type="text" value={formData.tastePreference} onChange={(e) => handleChange('tastePreference', e.target.value)} placeholder="如：清冽微甜的冰酿" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">特殊饮食习惯</label>
                    <input type="text" value={formData.dietaryHabits} onChange={(e) => handleChange('dietaryHabits', e.target.value)} placeholder="如：进食极少但需吸收星光能量" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">过敏原</label>
                    <input type="text" value={formData.allergies} onChange={(e) => handleChange('allergies', e.target.value)} placeholder="如：曼陀罗花粉" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">喜欢的活动</label>
                    <input type="text" value={formData.favoriteActivities} onChange={(e) => handleChange('favoriteActivities', e.target.value)} placeholder="如：塔尖观星绘图" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">兴趣爱好</label>
                    <input type="text" value={formData.hobbies} onChange={(e) => handleChange('hobbies', e.target.value)} placeholder="如：星象测算、提琴独奏" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">喜欢的事物</label>
                    <input type="text" value={formData.likes} onChange={(e) => handleChange('likes', e.target.value)} placeholder="如：宁静夜空、羊皮纸香气" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                </div>
              </div>

              {/* 心理健康与行为 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-sky-300 block">心理状态与性格特征</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">性格描述</label>
                    <input type="text" value={formData.personality} onChange={(e) => handleChange('personality', e.target.value)} placeholder="如：外冷内热，理性克制" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">精神状态</label>
                    <input type="text" value={formData.mentalState} onChange={(e) => handleChange('mentalState', e.target.value)} placeholder="如：平静中潜藏警惕" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">心理阴影 / 创伤</label>
                    <input type="text" value={formData.trauma} onChange={(e) => handleChange('trauma', e.target.value)} placeholder="如：目睹母城坍塌" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">恐惧事物</label>
                    <input type="text" value={formData.fears} onChange={(e) => handleChange('fears', e.target.value)} placeholder="如：同伴在眼前消逝" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">擅长技能</label>
                    <input type="text" value={formData.proficiencies} onChange={(e) => handleChange('proficiencies', e.target.value)} placeholder="如：星轨推衍、全域地图记忆" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">执念追求</label>
                    <input type="text" value={formData.aspirations} onChange={(e) => handleChange('aspirations', e.target.value)} placeholder="如：寻找遗失的原初星核" className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 九维 (实时动态多边形雷达图预览) */}
          {activeTab === 'stats' && (() => {
            const safeStats = { ...DEFAULT_CHARACTER.stats, ...(formData.stats || {}) };
            return (
              <div className="space-y-4">
                <div className={`flex flex-col lg:flex-row items-center gap-6 p-4 sm:p-5 rounded-2xl border transition-colors ${
                  isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <RadarChart stats={safeStats} color={formData.representativeColor || '#8b5cf6'} size={240} />
                    <span className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      拖动滑块实时预览九维能力变化
                    </span>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      const val = safeStats[item.key] ?? 50;
                      return (
                        <div key={item.key} className={`space-y-1 p-2 rounded-xl border ${
                          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
                        }`}>
                          <div className="flex justify-between text-xs">
                            <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.label}</span>
                            <span className="font-bold font-mono">{val} / 100</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={val}
                            onChange={(e) => handleStatChange(item.key, parseInt(e.target.value, 10))}
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: 背景 */}
          {activeTab === 'lore' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">出生地</label>
                  <input type="text" value={formData.birthplace} onChange={(e) => handleChange('birthplace', e.target.value)} placeholder="如：月辉祭仪殿堂" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">现居地</label>
                  <input type="text" value={formData.residence} onChange={(e) => handleChange('residence', e.target.value)} placeholder="如：极光号苍穹之舟" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">宗教信仰</label>
                  <input type="text" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} placeholder="如：星辰守望古律" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">家庭与家族背景</label>
                  <input type="text" value={formData.familyBackground} onChange={(e) => handleChange('familyBackground', e.target.value)} placeholder="如：星轨一脉末裔" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">家族习俗</label>
                  <input type="text" value={formData.familyCustoms} onChange={(e) => handleChange('familyCustoms', e.target.value)} placeholder="如：雪峰观测流星雨誓言" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">家族传家宝</label>
                  <input type="text" value={formData.familyHeirloom} onChange={(e) => handleChange('familyHeirloom', e.target.value)} placeholder="如：“逆流之刻”金表" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">角色小传与设定简介</label>
                <textarea
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="详细书写角色故事背景、成长经历与人物命运..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB: 世界观 (宏观世界观 + 可视化编辑时间轴) */}
          {activeTab === 'worldview' && (
            <div className="space-y-6">
              {/* 世界观宏观 */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>所处世界观宏观设定</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.worldview}
                  onChange={(e) => handleChange('worldview', e.target.value)}
                  placeholder="如：以魔晶与以太能驱动的高魔架空奇幻大陆《原初天穹》，天界、地表与深渊裂隙并存..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white resize-none"
                />
              </div>

              {/* 时间轴条目编辑 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Clock className="w-4 h-4" />
                    <span>添加世界线纪元节点</span>
                  </div>
                  <span className="text-[11px] text-slate-500">按输入的历史年代自动升序排布</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">年代 / 节点</label>
                    <input
                      type="text"
                      value={newTimeline.year}
                      onChange={(e) => setNewTimeline({ ...newTimeline, year: e.target.value })}
                      placeholder="如：星陨纪元 342年"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">事件标题</label>
                    <input
                      type="text"
                      value={newTimeline.title}
                      onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                      placeholder="如：天城崩塌之灾"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">事件详细记载</label>
                  <textarea
                    rows={2}
                    value={newTimeline.description}
                    onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                    placeholder="描述该年代发生了什么重大转折..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddTimelineEvent}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加至时间轴</span>
                </button>

                {/* Current Timeline Events */}
                {sortedTimeline.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block">
                      已排布时间轴 ({sortedTimeline.length} 个纪元)
                    </span>
                    <div className="space-y-2">
                      {sortedTimeline.map((evt, idx) => (
                        <div
                          key={evt.id || idx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono text-[11px] font-bold">
                                {evt.year}
                              </span>
                              <span className="font-bold text-white truncate">{evt.title}</span>
                            </div>
                            {evt.description && (
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {evt.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTimelineEvent(evt.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                            title="删除该事件"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: 关系 (选择其他OC建立关系网络) */}
          {activeTab === 'relations' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 border-b border-slate-800 pb-2">
                  <Network className="w-4 h-4" />
                  <span>建立与其它 OC 的人际关系</span>
                </div>

                {otherCharacters.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                    <p>当前数据库仅有此 1 个角色卡，暂无其他 OC 可关联。</p>
                    <p className="text-[11px] text-slate-600">
                      可在主页面新建更多 OC 角色，随后在此处建立朋友、搭档、宿敌等人际关系，系统会自动绘制关系网。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">选择目标 OC</label>
                        <select
                          value={newRel.targetCharacterId}
                          onChange={(e) => setNewRel({ ...newRel, targetCharacterId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          {otherCharacters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.nickname ? `(${c.nickname})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">关系类型</label>
                        <input
                          type="text"
                          value={newRel.relationType}
                          onChange={(e) => setNewRel({ ...newRel, relationType: e.target.value })}
                          placeholder="如：时空盟友 / 宿敌 / 挚友"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500">快捷预设：</span>
                      {RELATION_SUGGESTIONS.map((relName) => (
                        <button
                          key={relName}
                          type="button"
                          onClick={() => setNewRel({ ...newRel, relationType: relName })}
                          className={`text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                            newRel.relationType === relName
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {relName}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">关系说明与往事羁绊</label>
                      <textarea
                        rows={2}
                        value={newRel.description}
                        onChange={(e) => setNewRel({ ...newRel, description: e.target.value })}
                        placeholder="描述两人如何相识、现在的立场与关系往事..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRelationship}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>保存此关系条目</span>
                    </button>

                    {/* Current Relations List */}
                    {formData.relationships && formData.relationships.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block">
                          已建立关系列表 ({formData.relationships.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {formData.relationships.map((rel) => {
                            const targetChar = allCharacters.find((c) => c.id === rel.targetCharacterId);
                            if (!targetChar) return null;
                            return (
                              <div
                                key={rel.id}
                                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2.5 text-xs"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate">{targetChar.name}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-[10px] font-bold">
                                      {rel.relationType}
                                    </span>
                                  </div>
                                  {rel.description && (
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                      {rel.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRelationship(rel.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                                  title="移除此关系"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: 图库 (头像、全身立绘、相册图库) */}
          {activeTab === 'gallery' && (
            <div className="space-y-5">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* 头像与立绘 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 头像 */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">头像上传</span>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => handleChange('avatar', '')}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        清除头像
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-500">无头像</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? '处理中...' : '选择本地头像'}</span>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                  </div>
                </div>

                {/* 全身立绘 */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">全身立绘上传</span>
                    {formData.standingIllustration && (
                      <button
                        type="button"
                        onClick={() => handleChange('standingIllustration', '')}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        清除立绘
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 p-1">
                      {formData.standingIllustration ? (
                        <img src={formData.standingIllustration} alt="Standing" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-500 text-center">无立绘</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => standingInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? '处理中...' : '选择全身插画'}</span>
                    </button>
                    <input
                      ref={standingInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'standingIllustration')}
                    />
                  </div>
                </div>
              </div>

              {/* 相册图库 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">相册插画图库</span>
                    <span className="text-[11px] text-slate-500">支持批量选择多张插图，自动压缩存入本地</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-xs text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加相册插图</span>
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                  />
                </div>

                {formData.gallery && formData.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formData.gallery.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col p-1.5 space-y-1.5"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden relative flex items-center justify-center bg-black/40">
                          <img src={item.url} alt="" className="max-w-full max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                gallery: prev.gallery.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-900 text-rose-300 transition"
                            title="删除此图"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              gallery: prev.gallery.map((g, i) => (i === idx ? { ...g, caption: val } : g)),
                            }));
                          }}
                          placeholder="图片备注说明"
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    暂未上传相册插图，点击右上角按钮即可从相册添加
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-[#141827]/90 shrink-0 text-xs">
          <span className="text-slate-400">完成编辑后请点击保存</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>保存设定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
