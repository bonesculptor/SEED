import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { themeService, ThemeMode } from '../services/themeService';

export function SectorThemeSelector() {
  const [currentMode, setCurrentMode] = useState<ThemeMode>(themeService.getCurrentMode());

  const handleToggle = () => {
    const newMode = themeService.toggleMode();
    setCurrentMode(newMode);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
      style={{
        backgroundColor: 'var(--color-elevated)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        color: 'var(--color-text)'
      }}
      title={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
    >
      {currentMode === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
