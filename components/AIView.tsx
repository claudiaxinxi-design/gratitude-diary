import React, { useState, useEffect, useRef } from 'react';
import { Entry, Message, Badge } from '../types';
import { getWeeklyReflection } from '../geminiService';
import { MinimalButton } from './SketchUI';

interface AIViewProps {
  entries: Entry[];
}

export const AIView: React.FC<AIViewProps> = ({ entries }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Time leaves traces. Marks appear quietly." }
  ]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBadges = localStorage.getItem('gratitude_badges');
    if (savedBadges) {
      try {
        setBadges(JSON.parse(savedBadges));
      } catch (e) {
        console.error("Failed to load traces", e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleRequestReflection = async () => {
    const todayStr = new Date().toLocaleDateString();

    // 1. Check for existing badge for today (Idempotency check)
    const existingBadge = badges.find(b => b.date === todayStr);

    if (existingBadge) {
      setMessages(prev => [...prev, 
        { role: 'user', content: "See what stayed." },
        { 
          role: 'model', 
          content: "The mark from today remains.",
          isBadge: true,
          badgeData: existingBadge
        }
      ]);
      return;
    }

    if (entries.length === 0) {
      setMessages(prev => [...prev, 
        { role: 'user', content: "Recall this period." },
        { role: 'model', content: "No marks have been left yet." }
      ]);
      return;
    }

    // 2. No badge exists for today, request from AI
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: "See what stayed." }]);
    
    const result = await getWeeklyReflection(entries);
    
    if (result.title && result.summary) {
      const newBadge: Badge = {
        id: Math.random().toString(36).substr(2, 9),
        date: todayStr,
        emoji: result.emoji || "✨",
        summary: result.summary,
        title: result.title,
        imageUrl: result.imageUrl || "",
        anchorObject: result.anchorObject
      };
      
      const updatedBadges = [newBadge, ...badges];
      setBadges(updatedBadges);
      localStorage.setItem('gratitude_badges', JSON.stringify(updatedBadges));

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "This period left a mark.",
        isBadge: true,
        badgeData: newBadge
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F5] overflow-hidden relative w-full">
      <div className="p-6 pb-4 border-b border-[#E9E9E7] flex justify-between items-center bg-white w-full">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#787774]">Observations</h2>
        <button 
          onClick={() => setShowGallery(true)}
          className="p-2 hover:bg-[#F1F1EF] rounded-full transition-colors relative"
          aria-label="Open Gallery of Traces"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#37352F" strokeWidth="2" className="w-5 h-5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {badges.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
          )}
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-5 pt-6 w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2 w-full`}>
            <div className={`max-w-[92%] p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#37352F] text-white rounded-2xl rounded-tr-none' 
                : 'bg-white notion-border notion-shadow text-[#37352F] rounded-2xl rounded-tl-none'
            }`}>
              {msg.content}
            </div>
            
            {msg.isBadge && msg.badgeData && (
              <div className="w-[85%] bg-white notion-border p-2 rounded-xl shadow-xl flex flex-col items-center border-[#E9E9E7] transition-all transform hover:rotate-0 rotate-1">
                <div className="w-full aspect-square bg-[#FBFBFA] rounded-lg overflow-hidden border border-[#F1F1EF]">
                  {msg.badgeData.imageUrl ? (
                    <img 
                      src={msg.badgeData.imageUrl} 
                      alt={msg.badgeData.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                      {msg.badgeData.emoji}
                    </div>
                  )}
                </div>
                
                <div className="py-5 px-3 w-full text-center">
                  <h3 className="text-base font-bold text-[#37352F] leading-tight mb-1">{msg.badgeData.title}</h3>
                  <p className="text-[10px] text-[#A1A1A1] uppercase tracking-wider font-semibold">{msg.badgeData.date}</p>
                  <div className="mt-4 pt-4 border-t border-[#F1F1EF]">
                    <p className="text-[12px] text-[#787774] leading-relaxed italic text-center px-2">
                      {msg.badgeData.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="p-4 text-xs italic text-[#787774] animate-pulse">
              Observing traces...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[#E9E9E7] bg-white w-full">
        <MinimalButton 
          onClick={handleRequestReflection} 
          disabled={loading}
          variant="solid"
          className="w-full py-4 rounded-xl shadow-lg border-none text-base"
        >
          {loading ? "Observing..." : "View this period"}
        </MinimalButton>
      </div>

      {/* Gallery of Traces Modal - Absolute Full Screen */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-[#F7F7F5] flex flex-col animate-in fade-in slide-in-from-bottom duration-300 w-full h-full">
          <div className="p-6 border-b border-[#E9E9E7] flex justify-between items-center bg-white shadow-sm w-full">
            <h2 className="text-lg font-semibold text-[#37352F]">Gallery of Traces</h2>
            <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-[#F1F1EF] rounded-full transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 w-full">
            {badges.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm text-[#787774]">
                No traces have been added.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 items-start w-full">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-white p-2 rounded-2xl notion-border notion-shadow flex flex-col items-center group transition-all hover:scale-[1.02] hover:shadow-lg w-full">
                    <div className="w-full aspect-square bg-[#FBFBFA] rounded-xl overflow-hidden border border-[#F1F1EF] relative">
                      {badge.imageUrl ? (
                        <img 
                          src={badge.imageUrl} 
                          alt={badge.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                          {badge.emoji}
                        </div>
                      )}
                      <div className="absolute inset-0 border border-black/5 rounded-xl pointer-events-none"></div>
                    </div>
                    <div className="pt-3 pb-2 w-full text-center px-1">
                      <h4 className="text-[11px] font-bold text-[#37352F] leading-tight truncate px-0.5">{badge.title}</h4>
                      <div className="flex items-center justify-center mt-1.5 opacity-40">
                         <div className="h-px w-2 bg-[#37352F]"></div>
                         <span className="text-[8px] text-[#37352F] uppercase tracking-[0.2em] font-black mx-1">{badge.date}</span>
                         <div className="h-px w-2 bg-[#37352F]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
