import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { colors } from '../constants/theme';
import { getSettings, saveSettings } from '../utils/storage';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  theme: typeof colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved color scheme
    const loadColorScheme = async () => {
      const settings = await getSettings();
      setColorScheme(settings.colorScheme);
      setIsLoaded(true);
    };
    loadColorScheme();
  }, []);

  const toggleColorScheme = async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
    const settings = await getSettings();
    await saveSettings({ ...settings, colorScheme: newScheme });
  };

  const theme = colors[colorScheme];

  if (!isLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme, theme }}>
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
