
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { QUESTIONS, TAGS } from '../constants';
import { MinimalButton, ProgressDots } from './SketchUI';
import { Entry, Category } from '../types';
import { getTodayKey, formatDisplayDate } from '../utils';

interface HomeViewProps {
  entries: Entry[];
  onSave: (entry: Entry) => void;
}

type Phase = 'TEXT' | 'CATEGORY_PICKER';

export const HomeView: React.FC<HomeViewProps> = ({ entries, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('TEXT');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['', '', '']);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gratitude_user_categories');
    if (saved) {
      try {
        setUserCategories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load user categories", e);
      }
    }
  }, []);

  const todayKey = getTodayKey();
  const hasEntryToday = useMemo(() => entries.some(e => e.dateKey === todayKey), [entries, todayKey]);

  const allCategories = useMemo(() => {
    const systemCats: Category[] = TAGS.map(t => ({ id: t.id, label: t.label, emoji: t.emoji }));
    const combined = [...systemCats, ...userCategories];
    
    const frequency: Record<string, number> = {};
    entries.forEach(e => {
      e.categories?.forEach(cat => {
        frequency[cat] = (frequency[cat] || 0) + 1;
      });
    });

    return combined.sort((a, b) => (frequency[b.label] || 0) - (frequency[a.label] || 0));
  }, [userCategories, entries]);

  const handleSelectCategory = (label: string) => {
    const newCats = [...selectedCategories];
    newCats[currentStep] = label;
    setSelectedCategories(newCats);
    setPhase('TEXT');
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const exists = allCategories.find(c => c.label.toLowerCase() === newCategoryName.trim().toLowerCase());
    if (exists) {
      handleSelectCategory(exists.label);
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        label: newCategoryName.trim(),
        emoji: '🌱'
      };
      const updated = [newCat, ...userCategories];
      setUserCategories(updated);
      localStorage.setItem('gratitude_user_categories', JSON.stringify(updated));
      handleSelectCategory(newCat.label);
    }
    setNewCategoryName('');
    setIsAddingCustom(false);
  };

  const handleNext = () => {
    if (answers[currentStep].trim() === '') return;
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1);
      setPhase('TEXT');
    } else {
      const entry: Entry = {
        id: Math.random().toString(36).substr(2, 9),
        date: formatDisplayDate(todayKey),
        dateKey: todayKey,
        createdAt: Date.now(),
        answers,
        categories: selectedCategories.filter(c => c !== ''),
        color: '#E1EBDD'
      };
      onSave(entry);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      setPhase('TEXT');
    }
  };

  if (hasEntryToday) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-[#F7F7F5] animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-[#E1EBDD] flex items-center justify-center text-4xl notion-shadow border-2 border-white mb-2">
          ✨
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#37352F]">Today is complete.</h2>
          <p className="text-sm text-[#787774] leading-relaxed max-w-[240px] mx-auto">
            Your patterns for today have been recorded. Take this peace with you.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-[10px] text-[#A1A1A1] uppercase tracking-[0.2em] font-bold">See you tomorrow</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative w-full bg-[#F7F7F5]">
      {/* Header */}
      <div className="p-6 flex justify-between items-center w-full bg-[#F7F7F5] z-20">
        <div className="flex flex-col">
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A1A1A1]">Journaling</h1>
          <span className="text-xs font-bold text-[#37352F]">Step {currentStep + 1} of 3</span>
        </div>
        <ProgressDots currentStep={currentStep} totalSteps={QUESTIONS.length} />
      </div>

      <div className="flex-1 relative overflow-hidden px-8 w-full">
        <div className="h-full flex flex-col justify-start space-y-8 pt-4 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#787774] opacity-40">Reflection</p>
            <h2 className="text-2xl font-semibold leading-tight text-[#37352F] max-w-[95%]">{QUESTIONS[currentStep]}</h2>
            
            <div className="flex items-center space-x-3 pt-2">
              <div 
                onClick={() => setPhase('CATEGORY_PICKER')}
                className="cursor-pointer group flex items-center space-x-2"
              >
                <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-colors ${
                  selectedCategories[currentStep] 
                  ? 'bg-[#E1EBDD] text-[#37352F] border-white/50' 
                  : 'bg-white/50 text-[#A1A1A1] border-[#E9E9E7]'
                }`}>
                   FOCUS: {selectedCategories[currentStep] || 'GENERAL'}
                </div>
                <span className="text-[9px] font-black text-[#A1A1A1] group-hover:text-[#37352F] uppercase tracking-widest transition-colors">
                  CHANGE
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={answers[currentStep]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[currentStep] = e.target.value;
                setAnswers(newAnswers);
              }}
              autoFocus
              placeholder="Start typing..."
              style={{ outline: 'none' }}
              className="w-full flex-1 bg-transparent border-none p-0 text-xl text-[#37352F] placeholder-[#D3D1CB] focus:ring-0 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 flex justify-between items-center bg-white border-t border-[#E9E9E7] w-full z-20">
        <div className="flex items-center space-x-6">
          {currentStep > 0 && (
             <button 
              onClick={handlePrev} 
              className="text-[#A1A1A1] hover:text-[#37352F] font-black uppercase tracking-widest text-[10px] transition-colors"
            >
              Back
            </button>
          )}
        </div>
        
        <MinimalButton 
          onClick={handleNext} 
          disabled={answers[currentStep].trim() === ''}
          variant="solid" 
          className="px-10 py-3.5 rounded-xl notion-shadow text-sm tracking-tight font-bold bg-[#37352F]"
        >
          {currentStep === QUESTIONS.length - 1 ? "Plant Traces" : "Continue"}
        </MinimalButton>
      </div>

      {/* Category Picker Overlay */}
      {phase === 'CATEGORY_PICKER' && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300 flex flex-col justify-end">
          <div 
            className="bg-white rounded-t-[32px] p-8 max-h-[85vh] flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#37352F]">Focus Category</h3>
                <p className="text-xs text-[#787774] font-medium">Categorize this specific gratitude.</p>
              </div>
              <button 
                onClick={() => setPhase('TEXT')}
                className="p-2 hover:bg-[#F1F1EF] rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-[#37352F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-10">
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleSelectCategory('')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    selectedCategories[currentStep] === '' 
                    ? 'bg-[#37352F] text-white border-transparent' 
                    : 'bg-[#F7F7F5] text-[#787774] border-[#E9E9E7] hover:bg-[#F1F1EF]'
                  }`}
                >
                  <span>None</span>
                </button>
                
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.label)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      selectedCategories[currentStep] === cat.label 
                      ? 'bg-[#37352F] text-white border-transparent' 
                      : 'bg-[#F7F7F5] text-[#787774] border-[#E9E9E7] hover:bg-[#F1F1EF]'
                    }`}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[#F1F1EF]">
                {isAddingCustom ? (
                  <div className="flex items-center space-x-2 w-full animate-in zoom-in-95 duration-200">
                    <input
                      autoFocus
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                      placeholder="New label..."
                      className="flex-1 px-4 py-3 bg-[#F7F7F5] border border-[#E9E9E7] rounded-xl text-sm focus:ring-1 focus:ring-[#37352F] outline-none font-medium"
                    />
                    <button 
                      onClick={handleAddCustomCategory}
                      className="p-3 bg-[#37352F] text-white rounded-xl active:scale-90 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCustom(true)}
                    className="w-full py-4 border-2 border-dashed border-[#E9E9E7] rounded-xl text-xs font-black uppercase tracking-widest text-[#A1A1A1] hover:text-[#37352F] hover:border-[#37352F] transition-all"
                  >
                    + Create Custom Category
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
