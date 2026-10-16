import React from 'react';
import { TimelineEvent } from '../types/character';
import { sortTimelineEvents } from '../utils/timeline';
import { Clock, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TimelineViewProps {
  worldview?: string;
  timelineEvents?: TimelineEvent[];
  themeColor?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  worldview,
  timelineEvents = [],
  themeColor = '#8b5cf6',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sortedEvents = sortTimelineEvents(timelineEvents);

  return (
    <div className="space-y-6">
      {/* Worldview description section */}
      {worldview ? (
        <div className={`p-4 rounded-2xl border space-y-2 transition-colors ${
          isDark ? 'bg-[#111422] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Globe className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
            <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>世界观宏观设定</span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
            isDark ? 'text-zinc-300' : 'text-zinc-700'
          }`}>
            {worldview}
          </p>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl border text-xs italic transition-colors ${
          isDark ? 'bg-[#111422] border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
        }`}>
          暂未填写宏观世界观设定，可在编辑中补充。
        </div>
      )}

      {/* Timeline Chronicle Header */}
      <div className={`flex items-center justify-between border-b pb-2 ${
        isDark ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        <div className={`flex items-center gap-2 text-xs font-bold ${
          isDark ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          <Clock className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
          <span>世界线编年史 ({sortedEvents.length} 个纪元节点)</span>
        </div>
        <span className="text-[10px] text-zinc-500">已按历史年代自动升序编排</span>
      </div>

      {/* Timeline track */}
      {sortedEvents.length > 0 ? (
        <div className={`relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 ${
          isDark ? 'before:bg-zinc-700' : 'before:bg-zinc-300'
        }`}>
          {sortedEvents.map((evt, idx) => (
            <div key={evt.id || idx} className="relative group">
              {/* Node dot on the line */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border-2 transition-colors ${
                  isDark
                    ? 'border-[#0c0d12] bg-zinc-400 group-hover:bg-white'
                    : 'border-white bg-zinc-600 group-hover:bg-black'
                }`}
              />

              {/* Event card */}
              <div className={`p-3.5 sm:p-4 rounded-xl border transition space-y-1.5 shadow-xs ${
                isDark
                  ? 'bg-[#101322] border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-400'
              }`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {evt.year && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                        }`}
                      >
                        {evt.year}
                      </span>
                    )}
                    <h4 className={`text-sm font-semibold transition ${
                      isDark ? 'text-white group-hover:text-zinc-200' : 'text-zinc-900 group-hover:text-black'
                    }`}>
                      {evt.title || '未命名事件'}
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #NODE {idx + 1}
                  </span>
                </div>

                {evt.description && (
                  <p className={`text-xs leading-relaxed whitespace-pre-line pt-0.5 ${
                    isDark ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`py-10 text-center rounded-2xl border border-dashed text-xs space-y-2 transition-colors ${
          isDark ? 'border-zinc-800 bg-[#0c0e18] text-zinc-500' : 'border-zinc-300 bg-white text-zinc-500 shadow-xs'
        }`}>
          <Clock className="w-6 h-6 mx-auto text-zinc-400" />
          <p>暂无编年史世界线条目</p>
          <p className="text-[11px]">点击「编辑」按钮进入「世界观」栏目，即可添加带有历史年代的纪元条目。</p>
        </div>
      )}
    </div>
  );
};
