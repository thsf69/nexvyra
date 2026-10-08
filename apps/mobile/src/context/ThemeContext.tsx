import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightTokens, darkTokens, ThemeTokens } from '../theme/tokens';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
  mode: ThemeMode;
  isDark: boolean;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

const THEME_STORAGE_KEY = 'NEXVYRA_THEME_PREFERENCE';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    // Load persisted theme
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const tokens = isDark ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ mode, isDark, tokens, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
