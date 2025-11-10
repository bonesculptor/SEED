export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  panel: string;
  elevated: string;
  muted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
}

const lightTheme: ThemeColors = {
  bg: '#F5F6F7',
  panel: '#FFFFFF',
  elevated: '#FAFAFA',
  muted: '#E8EAED',
  border: '#E0E3E7',
  text: '#1A1D1F',
  textMuted: '#6B7280',
  primary: '#0066FF',
  primaryHover: '#0052CC'
};

const darkTheme: ThemeColors = {
  bg: '#0f1419',
  panel: '#1a1f2e',
  elevated: '#242938',
  muted: '#2d3548',
  border: '#384152',
  text: '#E9EDF1',
  textMuted: '#8B95A5',
  primary: '#00D9FF',
  primaryHover: '#00B8D9'
};

export class ThemeService {
  private currentMode: ThemeMode = 'dark';

  getCurrentMode(): ThemeMode {
    return this.currentMode;
  }

  setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    this.applyTheme(mode);
    this.storePreference(mode);
  }

  toggleMode(): ThemeMode {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
    return newMode;
  }

  applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    const theme = mode === 'light' ? lightTheme : darkTheme;

    root.setAttribute('data-theme', mode);

    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
  }

  getThemeColors(): ThemeColors {
    return this.currentMode === 'light' ? lightTheme : darkTheme;
  }

  initializeTheme(): void {
    const stored = localStorage.getItem('theme_mode') as ThemeMode;
    if (stored && (stored === 'light' || stored === 'dark')) {
      this.setMode(stored);
    } else {
      this.applyTheme(this.currentMode);
    }
  }

  private storePreference(mode: ThemeMode): void {
    localStorage.setItem('theme_mode', mode);
  }
}

export const themeService = new ThemeService();
