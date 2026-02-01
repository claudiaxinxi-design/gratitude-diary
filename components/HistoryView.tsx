
import React, { useState, useMemo, useRef } from 'react';
import { Entry } from '../types';
import { truncateText, formatDisplayDate } from '../utils';
import { MinimalButton } from './SketchUI';

interface HistoryViewProps {
  entries: Entry[];
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ entries, onBack }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);

  const availableYears = useMemo(() => {
    const years: number[] = entries.map(e => parseInt(e.dateKey.split('-')[0]));
    years.push(new Date().getFullYear());
    return Array.from(new Set(years)).sort((a: number, b: number) => b - a);
  }, [entries]);

  const monthPills = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(selectedYear, i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const hasEntries = entries.some(e => e.dateKey.startsWith(`${selectedYear}-${String(i + 1).padStart(2, '0')}`));
      return { index: i, label, hasEntries };
    });
  }, [selectedYear, entries]);

  const filteredEntries = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return entries
      .filter(e => e.dateKey.startsWith(prefix))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, selectedYear, selectedMonth]);

  const handleYearChange = (offset: number) => {
    const idx = availableYears.indexOf(selectedYear);
    if (offset > 0 && idx > 0) setSelectedYear(availableYears[idx - 1]);
    if (offset < 0 && idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-full bg-[#F7F7F5] w-full overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-6 pb-4 border-b border-[#E9E9E7] flex items-center space-x-4 bg-white w-full shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#F1F1EF] rounded-full text-[#37352F] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 className="text-xl font-bold text-[#37352F] tracking-tight">Archive</h2>
      </div>

      <div className="bg-white border-b border-[#E9E9E7] pt-4 pb-4">
        <div className="flex items-center justify-between px-6 mb-4">
          <button onClick={() => handleYearChange(-1)} className="p-1.5 opacity-40 hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#37352F]">{selectedYear}</span>
          <button onClick={() => handleYearChange(1)} className="p-1.5 opacity-40 hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg></button>
        </div>
        <div className="flex overflow-x-auto px-6 space-x-2 no-scrollbar">
          {monthPills.map((m) => (
            <button
              key={m.index}
              onClick={() => setSelectedMonth(m.index)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all relative ${
                selectedMonth === m.index 
                  ? 'bg-[#37352F] text-white shadow-lg' 
                  : 'bg-[#F1F1EF] text-[#787774] hover:bg-[#E9E9E7]'
              } ${!m.hasEntries && selectedMonth !== m.index ? 'opacity-40' : ''}`}
            >
              {m.label}
              {m.hasEntries && selectedMonth !== m.index && (
                <span className="absolute top-1 right-1 w-1 h-1 bg-[#37352F] rounded-full opacity-30"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-12">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm text-[#787774] text-center pt-20">
            <span className="text-3xl mb-4 block">🌫️</span>
            No entries for {monthPills[selectedMonth].label} {selectedYear}.
          </div>
        ) : (
          filteredEntries.map(entry => (
            <button 
              key={entry.id} 
              onClick={() => setDetailEntry(entry)}
              className="w-full bg-white p-5 rounded-2xl notion-border notion-shadow space-y-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-wider">{formatDisplayDate(entry.dateKey)}</span>
                <div className="w-2 h-2 rounded-full bg-[#E1EBDD]"></div>
              </div>
              <div className="space-y-2">
                {entry.answers.map((ans, idx) => (
                  <p key={idx} className="text-[13px] text-[#37352F] leading-relaxed italic border-l-2 border-[#E1EBDD] pl-3">
                    {truncateText(ans, 60)}
                  </p>
                ))}
              </div>
            </button>
          ))
        )}
      </div>

      {detailEntry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setDetailEntry(null)}>
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#F1F1EF] flex flex-col items-center relative text-center">
              <button 
                onClick={() => setDetailEntry(null)}
                className="absolute top-4 right-4 p-2 hover:bg-[#F1F1EF] rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-[#37352F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h4 className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-1">Detailed Entry</h4>
              <p className="text-lg font-semibold text-[#37352F]">{formatDisplayDate(detailEntry.dateKey)}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {detailEntry.answers.map((answer, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-[#787774] uppercase tracking-widest opacity-60">Reflection {i + 1}</span>
                  </div>
                  <p className="text-base text-[#37352F] leading-relaxed italic border-l-2 border-[#E1EBDD] pl-4">
                    {answer || '...'}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F7F7F5] border-t border-[#F1F1EF]">
              <MinimalButton variant="solid" className="w-full py-4 text-sm rounded-xl" onClick={() => setDetailEntry(null)}>
                Close
              </MinimalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
