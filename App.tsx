
import React, { useState, useEffect } from 'react';
import { Screen, Entry } from './types';
import { Icons } from './constants';
import { HomeView } from './components/HomeView';
import { ForestView } from './components/ForestView';
import { ProfileView } from './components/ProfileView';
import { migrateEntries } from './utils';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('HOME');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('gratitude_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = migrateEntries(parsed);
        setEntries(migrated);
      } catch (e) {
        console.error("Failed to parse saved entries", e);
      }
    }
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const saveEntry = (entry: Entry) => {
    setEntries(prevEntries => {
      const updatedEntries = [entry, ...prevEntries];
      localStorage.setItem('gratitude_entries', JSON.stringify(updatedEntries));
      return updatedEntries;
    });
    setActiveScreen('FOREST');
  };

  if (showSplash) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F7F5] w-full h-full">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light tracking-tighter text-[#37352F]">Restoration</h1>
          <p className="text-xs text-[#787774] uppercase tracking-widest opacity-50">v1.1.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F7F5] w-full relative overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {activeScreen === 'HOME' && <HomeView entries={entries} onSave={saveEntry} />}
        {activeScreen === 'FOREST' && <ForestView entries={entries} />}
        {activeScreen === 'PROFILE' && <ProfileView entries={entries} />}
      </main>

      <nav className="h-16 bg-white border-t border-[#E9E9E7] flex justify-around items-center z-20">
        <button 
          onClick={() => setActiveScreen('HOME')}
          className={`p-3 transition-colors ${activeScreen === 'HOME' ? 'text-[#37352F]' : 'text-[#D3D1CB]'}`}
          aria-label="Home"
        >
          <Icons.Home />
        </button>
        <button 
          onClick={() => setActiveScreen('FOREST')}
          className={`p-3 transition-colors ${activeScreen === 'FOREST' ? 'text-[#37352F]' : 'text-[#D3D1CB]'}`}
          aria-label="Calendar"
        >
          <Icons.Forest />
        </button>
        <button 
          onClick={() => setActiveScreen('PROFILE')}
          className={`p-3 transition-colors ${activeScreen === 'PROFILE' ? 'text-[#37352F]' : 'text-[#D3D1CB]'}`}
          aria-label="Profile"
        >
          <Icons.Profile />
        </button>
      </nav>
    </div>
  );
};

export default App;
