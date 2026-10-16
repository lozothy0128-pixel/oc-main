import React, { useState, useRef } from 'react';
import { exportAllData, importData } from '../utils/db';
import { Download, Upload, X, Check, AlertCircle, FileJson } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ExportImportModalProps {
  isOpen: boolean;
  mode: 'export' | 'import';
  onClose: () => void;
  onRefresh: () => void;
  characterCount: number;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  mode,
  onClose,
  onRefresh,
  characterCount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Export Download
  const handleDownloadBackup = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `OC全设定集_备份_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setResultMsg({ type: 'success', text: `成功导出 ${characterCount} 个OC角色完整独立备份文件！` });
    } catch (err: any) {
      setResultMsg({ type: 'error', text: '备份生成失败：' + (err.message || '未知错误') });
    }
  };

  // Handle Import File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResultMsg(null);

    try {
      const text = await file.text();
      const count = await importData(text, importMode);
      setResultMsg({
        type: 'success',
        text: `导入成功！已成功同步 ${count} 个OC角色档案。`,
      });
      onRefresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: '解析或导入失败：' + (err.message || '请确认文件是否为本站导出的标准JSON'),
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 border transition-colors ${
        isDark ? 'bg-[#111422] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
            }`}>
              {mode === 'export' ? <Download className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {mode === 'export' ? '备份全部 OC 数据库' : '导入 OC 设定集备份'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {mode === 'export' ? '将当前浏览器中保存的所有角色与图片导出' : '从之前的备份JSON文件还原角色卡'}
              </p>
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

        {/* Modal Body */}
        <div className="py-5 space-y-4">
          {resultMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          {mode === 'export' ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#161a2b] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>当前本地数据库角色数量：</span>
                  <span className="font-bold text-sm">{characterCount} 个</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  备份文件为通用标准 JSON 格式，包含了您上传的全部立绘、头像、标签及 50+ 字段设定，可长期存放在电脑或微信收藏中，随时可以重新导入。
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                  isDark ? 'bg-white hover:bg-zinc-200 text-black' : 'bg-black hover:bg-zinc-800 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>立即下载完整备份文件 (.json)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Import Mode selection */}
              <div className="space-y-2">
                <label className={`text-xs font-semibold block ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>导入模式：</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      importMode === 'merge'
                        ? isDark
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-zinc-100 border-zinc-900 text-black'
                        : isDark
                        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <div className="font-semibold mb-1">合并导入（推荐）</div>
                    <div className="text-[11px] opacity-80">保留当前已有角色，追加备份文件中的角色</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-rose-500/15 border-rose-500/60 text-rose-400'
                        : isDark
                        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <div className="font-semibold text-rose-400 mb-1">覆盖清空导入</div>
                    <div className="text-[11px] opacity-80">清空当前数据库，完全替换为备份内容</div>
                  </button>
                </div>
              </div>

              {/* Upload Drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                  isDark
                    ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900'
                    : 'border-zinc-300 hover:border-zinc-600 bg-zinc-50 hover:bg-zinc-100'
                }`}
              >
                <FileJson className={`w-8 h-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`} />
                <span className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {importing ? '正在解析并导入数据...' : '点击选择备份 JSON 文件'}
                </span>
                <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>支持电脑或手机中保存的 .json 备份文件</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`pt-3 border-t flex justify-end ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
            }`}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
