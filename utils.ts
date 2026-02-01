
export const getTodayKey = (): string => {
  const d = new Date();
  return getDateKey(d);
};

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateKey: string): string => {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  const [year, month, day] = parts.map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const truncateText = (text: string, limit: number = 60): string => {
  if (text.length <= limit) return text;
  return text.substring(0, limit).trim() + "...";
};

export const getMonthTags = (entries: any[], year: number, month: number, allTags: any[]): { label: string, count: number }[] => {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthlyEntries = entries.filter(e => e.dateKey.startsWith(prefix));
  const counts: Record<string, number> = {};

  monthlyEntries.forEach(entry => {
    const text = entry.answers.join(' ').toLowerCase();
    allTags.forEach(tag => {
      // Check if tag label or specific keywords appear in entry text
      const regex = new RegExp(`\\b${tag.label.toLowerCase()}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        counts[tag.label] = (counts[tag.label] || 0) + matches.length;
      }
    });
  });

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

export const migrateEntries = (entries: any[]): any[] => {
  return entries.map(entry => {
    if (!entry.dateKey) {
      const d = new Date(entry.date);
      const stableKey = isNaN(d.getTime()) ? '2025-01-01' : getDateKey(d);
      return {
        ...entry,
        dateKey: stableKey,
        createdAt: entry.createdAt || d.getTime() || Date.now()
      };
    }
    return entry;
  });
};
