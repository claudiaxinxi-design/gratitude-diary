
import React, { useState, useRef, useMemo } from 'react';
import { QUESTIONS, TAGS } from '../constants';
import { MinimalButton, ProgressDots } from './SketchUI';
import { Entry } from '../types';
import { getTodayKey, formatDisplayDate } from '../utils';

interface HomeViewProps {
  entries: Entry[];
  onSave: (entry: Entry) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ entries, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const startY = useRef(0);

  const todayKey = getTodayKey();
  const hasEntryToday = useMemo(() => entries.some(e => e.dateKey === todayKey), [entries, todayKey]);

  const isCurrentAnswerEmpty = answers[currentStep].trim() === '';

  const handleNext = () => {
    if (isCurrentAnswerEmpty) return;
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      const entry: Entry = {
        id: Math.random().toString(36).substr(2, 9),
        date: formatDisplayDate(todayKey),
        dateKey: todayKey,
        createdAt: Date.now(),
        answers,
        color: '#E1EBDD'
      };
      onSave(entry);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY.current - endY;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentStep < QUESTIONS.length - 1 && !isCurrentAnswerEmpty) handleNext();
      else if (diff < 0 && currentStep > 0) handlePrev();
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
            You already logged today. Nice work showing up for yourself.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-[10px] text-[#A1A1A1] uppercase tracking-[0.2em] font-bold">See you tomorrow</p>
        </div>
      </div>
    );
  }

  const row1 = TAGS.slice(0, 5);
  const row2 = TAGS.slice(5, 10);
  const marqueeRow1 = [...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2];

  return (
    <div 
      className="flex-1 flex flex-col h-full relative w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="p-6 flex justify-between items-center w-full">
        <h1 className="text-sm font-semibold uppercase tracking-wider text-[#787774]">Journaling</h1>
        <ProgressDots currentStep={currentStep} totalSteps={QUESTIONS.length} />
      </div>

      <div className="flex-1 relative overflow-hidden px-6 w-full">
        <div 
          className="question-slide h-full w-full"
          style={{ transform: `translateY(-${currentStep * 100}%)` }}
        >
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className="h-full flex flex-col justify-center space-y-6 w-full">
              <h2 className="text-3xl font-medium leading-tight text-[#37352F]">{q}</h2>
              <textarea
                value={answers[idx]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[idx] = e.target.value;
                  setAnswers(newAnswers);
                }}
                autoFocus={idx === currentStep}
                placeholder="I'm grateful for..."
                style={{ outline: 'none' }}
                className="w-full h-40 bg-transparent border-none p-0 text-xl text-[#37352F] placeholder-[#A1A1A1] focus:ring-0 resize-none transition-colors duration-200"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="py-6 notion-border border-l-0 border-r-0 overflow-hidden bg-white space-y-3 w-full">
        <div className="marquee-container flex space-x-3 px-3">
          {marqueeRow1.map((tag, i) => (
            <button
              key={`row1-${tag.id}-${i}`}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentStep] = tag.autoFill;
                setAnswers(newAnswers);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F1EF] hover:bg-[#E9E9E7] notion-border notion-shadow transition-colors rounded-full whitespace-nowrap text-sm text-[#37352F]"
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
        <div className="marquee-container-reverse flex space-x-3 px-3">
          {marqueeRow2.map((tag, i) => (
            <button
              key={`row2-${tag.id}-${i}`}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentStep] = tag.autoFill;
                setAnswers(newAnswers);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F1EF] hover:bg-[#E9E9E7] notion-border notion-shadow transition-colors rounded-full whitespace-nowrap text-sm text-[#37352F]"
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex justify-between items-center bg-white border-t border-[#E9E9E7] w-full">
        <MinimalButton onClick={handlePrev} disabled={currentStep === 0} variant="ghost">
          Back
        </MinimalButton>
        <div className="text-xs text-[#787774] font-medium">
          Step {currentStep + 1} of {QUESTIONS.length}
        </div>
        <MinimalButton 
          onClick={handleNext} 
          disabled={isCurrentAnswerEmpty}
          variant="outline" 
          className={`px-8 transition-all ${isCurrentAnswerEmpty ? 'border-[#E9E9E7]' : 'border-[#37352F] hover:bg-[#37352F] hover:text-white'}`}
        >
          {currentStep === QUESTIONS.length - 1 ? "Complete" : "Continue"}
        </MinimalButton>
      </div>
    </div>
  );
};
