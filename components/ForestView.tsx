
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Entry } from '../types';
import { MinimalButton } from './SketchUI';
import { getDateKey, formatDisplayDate } from '../utils';

interface ForestViewProps {
  entries: Entry[];
}

const MonthSection: React.FC<{
  year: number;
  month: number;
  entries: Entry[];
  onEntryClick: (entry: Entry) => void;
  isCurrentMonth: boolean;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ year, month, entries, onEntryClick, isCurrentMonth, sectionRef }) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  
  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => {
      const dayNumber = i - startDay + 1;
      if (dayNumber <= 0 || dayNumber > daysInMonth) return null;
      
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const entry = entries.find(e => e.dateKey === dateKey);
      
      return {
        day: dayNumber,
        dateKey,
        entry
      };
    });
  }, [year, month, entries, startDay, daysInMonth]);

  return (
    <div 
      ref={sectionRef}
      className={`py-8 px-6 transition-colors duration-500 ${isCurrentMonth ? 'bg-white/40' : ''}`}
    >
      <div className="mb-6">
        <h3 className={`text-xl font-bold tracking-tight ${isCurrentMonth ? 'text-[#37352F]' : 'text-[#787774] opacity-60'}`}>
          {monthName}
          {isCurrentMonth && <span className="ml-2 text-[10px] bg-[#E1EBDD] px-2 py-0.5 rounded-full uppercase tracking-widest font-black align-middle">Current</span>}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-[#787774] mb-3 uppercase tracking-widest opacity-30">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((d, i) => (
          <button
            key={i}
            disabled={!d}
            onClick={() => d?.entry && onEntryClick(d.entry)}
            className={`aspect-square rounded-xl flex items-center justify-center text-xs transition-all duration-300 relative ${
              !d ? 'invisible' :
              d.entry ? 'bg-[#E1EBDD] text-[#37352F] border-2 border-white shadow-sm font-bold scale-100 ring-2 ring-transparent hover:ring-[#E1EBDD]' : 
              'bg-white border border-[#E9E9E7] text-[#787774] opacity-30 hover:opacity-50'
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
  );
};

export const ForestView: React.FC<ForestViewProps> = ({ entries }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Auto-scroll to current month on mount or year change
  useEffect(() => {
    if (selectedYear === currentYear && currentMonthRef.current) {
      setTimeout(() => {
        currentMonthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [selectedYear, currentYear]);

  // Handle click outside year picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
        setIsYearPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F5] w-full overflow-hidden relative">
      {/* Fixed Header */}
      <div className="bg-[#F7F7F5]/80 backdrop-blur-md z-30 border-b border-[#E9E9E7]/50">
        <div className="p-6 pb-4 space-y-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[#37352F]">Calendar</h2>
            <p className="text-[#787774] text-xs font-medium opacity-80 uppercase tracking-widest">Traces of Gratitude</p>
          </div>
          
          {/* Year Selector UI */}
          <div className="relative inline-block" ref={yearPickerRef}>
            <button 
              onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
              className="flex items-center space-x-2 bg-white notion-border notion-shadow px-3 py-1.5 rounded-xl text-sm font-bold text-[#37352F] hover:bg-white/80 transition-all active:scale-95"
            >
              <span>{selectedYear}</span>
              <svg className={`w-3 h-3 transition-transform duration-300 ${isYearPickerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isYearPickerOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white notion-border notion-shadow rounded-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-64 overflow-y-auto no-scrollbar px-1">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearPickerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                        year === selectedYear ? 'bg-[#E1EBDD] text-[#37352F]' : 'text-[#787774] hover:bg-[#F7F7F5]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32"
      >
        {Array.from({ length: 12 }).map((_, month) => (
          <MonthSection
            key={month}
            year={selectedYear}
            month={month}
            entries={entries}
            onEntryClick={setDetailEntry}
            isCurrentMonth={selectedYear === currentYear && month === currentMonth}
            sectionRef={selectedYear === currentYear && month === currentMonth ? currentMonthRef : undefined}
          />
        ))}
      </div>

      {/* Entry Detail Modal */}
      {detailEntry && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setDetailEntry(null)}>
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
