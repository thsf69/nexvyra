'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-8" />; // placeholder
  }

  return (
    <div className="flex items-center space-x-1 bg-surface border border-border rounded-lg p-1 shadow-sm">
      <button
        onClick={() => setTheme('light')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-background hover:text-text'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-background hover:text-text'
        }`}
      >
        Auto
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-background hover:text-text'
        }`}
      >
        Dark
      </button>
    </div>
  );
};
