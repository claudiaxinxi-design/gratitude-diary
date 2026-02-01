
import React, { useState, useMemo } from 'react';
import { Entry } from '../types';
import { MinimalButton } from './SketchUI';
import { getDateKey, formatDisplayDate } from '../utils';

interface ForestViewProps {
  entries: Entry[];
}

export const ForestView: React.FC<ForestViewProps> = ({ entries }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDay = new Date(viewYear, viewMonth, 1).getDay();
  
  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => {
      const dayNumber = i - startDay + 1;
      if (dayNumber <= 0 || dayNumber > daysInMonth) return null;
      
      const d = new Date(viewYear, viewMonth, dayNumber);
      const dateKey = getDateKey(d);
      const entry = entries.find(e => e.dateKey === dateKey);
      
      return {
        day: dayNumber,
        dateKey,
        entry
      };
    });
  }, [viewYear, viewMonth, entries, startDay, daysInMonth]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewYear, viewMonth + offset, 1));
  };

  const changeYear = (offset: number) => {
    setViewDate(new Date(viewYear + offset, viewMonth, 1));
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F5] overflow-y-auto w-full no-scrollbar">
      <div className="p-6 pb-4 flex justify-between items-center w-full">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-[#37352F]">Calendar</h2>
          <p className="text-[#787774] text-xs font-medium opacity-80 uppercase tracking-widest">Traces of Gratitude</p>
        </div>
      </div>

      <div className="px-6 flex items-center justify-between mb-4 w-full">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-[#37352F] tracking-tight">{monthName}</h3>
          <span className="text-[10px] text-[#A1A1A1] uppercase tracking-[0.2em] font-black">{viewYear}</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeMonth(-1)} 
            className="p-2.5 hover:bg-white notion-border rounded-xl text-[#787774] notion-shadow bg-transparent transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button 
            onClick={() => changeMonth(1)} 
            className="p-2.5 hover:bg-white notion-border rounded-xl text-[#787774] notion-shadow bg-transparent transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="px-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#787774] mb-3 uppercase tracking-widest w-full opacity-40">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2 w-full">
          {calendarDays.map((d, i) => (
            <button
              key={i}
              disabled={!d}
              onClick={() => d?.entry && setDetailEntry(d.entry)}
              className={`aspect-square rounded-xl flex items-center justify-center text-xs transition-all duration-300 relative ${
                !d ? 'invisible' :
                d.entry ? 'bg-[#E1EBDD] text-[#37352F] border-2 border-white shadow-sm font-bold scale-100' : 
                'bg-white border border-[#E9E9E7] text-[#787774] opacity-30'
              }`}
            >
              {d?.day}
              {d?.entry && (
                <span className="absolute bottom-1.5 w-1 h-1 bg-[#37352F] rounded-full opacity-30"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-6 py-10 border-t border-[#E9E9E7] flex flex-col items-center space-y-4 bg-white/50">
         <p className="text-[10px] text-[#A1A1A1] uppercase tracking-[0.2em] font-bold opacity-60">Switch Year</p>
         <div className="flex items-center space-x-8">
            <button onClick={() => changeYear(-1)} className="p-3 bg-white notion-border notion-shadow rounded-2xl text-[#37352F] hover:bg-[#F1F1EF] transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="text-3xl font-bold text-[#37352F] tracking-tighter">{viewYear}</span>
            <button onClick={() => changeYear(1)} className="p-3 bg-white notion-border notion-shadow rounded-2xl text-[#37352F] hover:bg-[#F1F1EF] transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
         </div>
      </div>

      {detailEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setDetailEntry(null)}>
          <div 
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
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
