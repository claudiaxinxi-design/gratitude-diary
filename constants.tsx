
import React from 'react';
import { FloatingTag } from './types';

export const QUESTIONS = [
  "What is one small thing that brought you comfort today?",
  "Who is someone you are grateful for right now?",
  "What is a personal strength you've noticed recently?"
];

export const TAGS: FloatingTag[] = [
  { id: '1', label: 'Coffee', emoji: '☕️', autoFill: "I'm grateful for that first sip of hot coffee this morning; it woke up my senses.", duration: '', delay: '', top: '' },
  { id: '2', label: 'Weather', emoji: '🌥️', autoFill: "The gentle shift in the weather today felt like a peaceful embrace.", duration: '', delay: '', top: '' },
  { id: '3', label: 'Sleep', emoji: '🛌', autoFill: "I'm thankful for a moment of deep rest that restored my energy.", duration: '', delay: '', top: '' },
  { id: '4', label: 'Reading', emoji: '📖', autoFill: "A quiet moment with a book allowed my mind to wander and heal.", duration: '', delay: '', top: '' },
  { id: '5', label: 'Kindness', emoji: '🤝', autoFill: "A small act of kindness from a stranger reminded me of the world's warmth.", duration: '', delay: '', top: '' },
  { id: '6', label: 'Nature', emoji: '🌿', autoFill: "The vibrant green of the trees today reminded me of life's resilience.", duration: '', delay: '', top: '' },
  { id: '7', label: 'Music', emoji: '🎵', autoFill: "A melody I heard today perfectly captured a feeling I couldn't put into words.", duration: '', delay: '', top: '' },
  { id: '8', label: 'Family', emoji: '🏠', autoFill: "The comfort of home and the support of family ground me in the best way.", duration: '', delay: '', top: '' },
  { id: '9', label: 'Health', emoji: '✨', autoFill: "I'm grateful for my body's strength and the simple ability to breathe deeply.", duration: '', delay: '', top: '' },
  // Fixed: removed 'laugh' property which is not defined in FloatingTag interface
  { id: '10', label: 'Laughter', emoji: '😂', autoFill: "A genuine laugh today lightened my spirit and cleared the clouds for a moment.", duration: '', delay: '', top: '' },
];

export const COLORS = {
  wasteland: '#E9E9E7',
  forest: '#E1EBDD'
};

export const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Forest: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Profile: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};
