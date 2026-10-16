import React from 'react';
import { X, Sparkles, Database, ShieldCheck, Image, Tags, Sliders } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col border transition-colors ${
        isDark ? 'bg-[#111422] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>OC 独立全设定集 · 新手创作者指南</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>无需懂任何代码，轻松管理专属于你的原创世界</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 overflow-y-auto space-y-4 text-xs">
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-[#161a2b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <Database className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <div className="space-y-1">
              <span className={`font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>每个角色都是独立的本地数据库</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                您的全部角色卡、立绘、相册和文字设定，均储存于您当前浏览器的高性能本地数据库 (IndexedDB) 中。无需担心联网泄露隐私，安全保密且极速加载。
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-[#161a2b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <Image className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <div className="space-y-1">
              <span className={`font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>相册与大图直传</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                在编辑弹窗的【外貌体征】分页中，点击【从相册选择】，支持从电脑桌面或手机相册直接选取图片。系统会自动进行高清自适应无损压缩，保证速度。
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-[#161a2b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <Sliders className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <div className="space-y-1">
              <span className={`font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>可视化九维属性雷达图</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                体力、耐力、视力、耐心、听觉、味觉、嗅觉、运气、体质等 9 大维度，支持拖动滑块实时生成个性化能力雷达！
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-[#161a2b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <Tags className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <div className="space-y-1">
              <span className={`font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>多维度标签分类与检索</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                支持输入 主角、反派、赛博朋克 等个性标签，主页面顶部可一键按标签快速筛选不同世界线或阵营的 OC。
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-[#161a2b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <div className="space-y-1">
              <span className={`font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>一键备份与恢复</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                随时点击右上角的【备份】，即可将全部角色和插画打包下载为 .json 文件，换电脑或换手机时直接【导入】即可秒速还原！
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t flex justify-end shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm ${
              isDark ? 'bg-white hover:bg-zinc-200 text-black' : 'bg-black hover:bg-zinc-800 text-white'
            }`}
          >
            我知道了，开始创作
          </button>
        </div>
      </div>
    </div>
  );
};
