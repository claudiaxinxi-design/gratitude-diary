import React, { useMemo, useState } from 'react';
import { Entry } from '../types';
import { getDateKey } from '../utils';

interface ProfileViewProps {
  entries: Entry[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ entries }) => {
  const [reportDate, setReportDate] = useState(new Date());

  // ✅ Monthly Seeds: single source of truth = entry.categories
  const currentMonthTags = useMemo(() => {
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth(); // 0-11
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`; // e.g. "2026-02"

    const monthlyEntries = entries.filter((e) => (e.dateKey || '').startsWith(prefix));
    const counts: Record<string, number> = {};

    monthlyEntries.forEach((entry) => {
      (entry.categories || []).forEach((label) => {
        if (!label) return;
        counts[label] = (counts[label] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries, reportDate]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    let count = 0;
    let checkDate = new Date();

    const todayKey = getDateKey(checkDate);
    let startIndex = sorted.findIndex((e) => e.dateKey === todayKey);

    if (startIndex === -1) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = getDateKey(checkDate);
      startIndex = sorted.findIndex((e) => e.dateKey === yesterdayKey);
    }

    if (startIndex === -1) return 0;

    for (let i = startIndex; i < sorted.length; i++) {
      const expectedKey = getDateKey(checkDate);
      if (sorted[i].dateKey === expectedKey) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [entries]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(reportDate);
    nextDate.setMonth(nextDate.getMonth() + offset);
    setReportDate(nextDate);
  };

  const monthLabel = reportDate.toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F5] w-full overflow-hidden">
      <div className="p-6 border-b border-[#E9E9E7] bg-white w-full shadow-sm">
        <h2 className="text-xl font-bold text-[#37352F] tracking-tight">Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center p-8 space-y-10 no-scrollbar pb-24">
        <div className="w-24 h-24 rounded-full bg-[#E1EBDD] flex items-center justify-center text-4xl notion-shadow border-4 border-white animate-in zoom-in duration-700">
          🌿
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-[#37352F] tracking-tighter">Your Journey</h3>
          <p className="text-sm text-[#787774] max-w-[240px] leading-relaxed mx-auto">
            Every trace you leave is a seed planted in the garden of your life.
          </p>
        </div>

        {/* Unified Card Frame: Streak */}
        <div className="w-full max-w-sm">
          <div className="bg-white notion-border rounded-2xl notion-shadow p-6 flex justify-between items-center transition-all active:scale-[0.98]">
            <div className="space-y-1">
              <span className="text-[10px] text-[#A1A1A1] uppercase tracking-[0.2em] font-black">Consistency</span>
              <p className="text-sm font-bold text-[#37352F]">Daily streak</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-[#37352F] leading-none">{streak}</span>
              <span className="text-[9px] text-[#787774] uppercase tracking-widest font-bold">Days</span>
            </div>
          </div>
        </div>

        {/* Seed Box Visual Report */}
        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <h4 className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-[0.3em] text-center">
              Monthly Seeds
            </h4>

            <div className="flex items-center space-x-6 bg-white notion-border notion-shadow px-4 py-1.5 rounded-full">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-[#F1F1EF] rounded-full text-[#787774] transition-colors"
                aria-label="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <span className="text-[10px] font-black text-[#37352F] uppercase tracking-widest min-w-[90px] text-center">
                {monthLabel}
              </span>

              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-[#F1F1EF] rounded-full text-[#787774] transition-colors"
                aria-label="Next Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white notion-border rounded-2xl notion-shadow p-6 h-[260px] flex flex-col relative overflow-hidden group">
            <div className="flex-1 flex flex-wrap items-end justify-center gap-2 overflow-y-auto no-scrollbar content-end pb-2">
              {currentMonthTags.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none p-8 text-center">
                  <span className="text-4xl mb-4">🌱</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black leading-relaxed">
                    No seeds found for this cycle.
                  </p>
                </div>
              ) : (
                currentMonthTags.map((tag, i) => {
                  const bgColor =
                    tag.count > 3 ? 'bg-[#98B68E]' : tag.count > 1 ? 'bg-[#C8D9C4]' : 'bg-[#E1EBDD]';
                  const textColor = tag.count > 3 ? 'text-white' : 'text-[#37352F]';
                  return (
                    <div
                      key={tag.label}
                      className={`px-3 py-1.5 ${bgColor} ${textColor} text-[11px] font-bold rounded-xl border border-white/30 animate-in slide-in-from-bottom duration-500 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-default`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {tag.label}
                      <span className="ml-1.5 opacity-50 font-medium text-[9px]">{tag.count}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <p className="text-[9px] text-[#A1A1A1] text-center uppercase tracking-widest font-bold">
              Darker seeds reflect more frequent traces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};