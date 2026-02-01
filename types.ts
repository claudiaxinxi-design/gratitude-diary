
export interface Entry {
  id: string;
  date: string;     // Legacy display date
  dateKey: string;  // Stable YYYY-MM-DD
  createdAt: number;
  answers: string[];
  color: string;
}

export type Screen = 'HOME' | 'FOREST' | 'PROFILE';

export interface FloatingTag {
  id: string;
  label: string;
  emoji: string;
  autoFill: string;
  duration: string;
  delay: string;
  top: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  isBadge?: boolean;
  badgeData?: Badge;
}

export interface Badge {
  id: string;
  date: string;
  emoji: string;
  summary: string;
  title: string;
  imageUrl: string;
  anchorObject?: string;
}
