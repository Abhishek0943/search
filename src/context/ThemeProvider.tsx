// theme/ThemeProvider.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  Text,
  TouchableHighlight,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, darkColors, lightColors } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;              // ← new flag
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'themeMode';

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  isDark: false,
  colors: lightColors ,
  setMode: () => { },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setMode(saved);
      }
    });
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);
  const { scheme, colors, isDark } = useMemo(() => {
    const scheme = mode === 'system' ? systemScheme : mode;
    const isDark = scheme === 'dark';
    const colors = isDark ? darkColors : lightColors;
    return { scheme, colors, isDark };
  }, [mode, systemScheme]);
  const toggleTheme = () => {
    const next: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {/* debug toggle in top-right */}
      {/* <View
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          zIndex: 100,
          backgroundColor: colors.background,
        }}
      >
        <TouchableHighlight onPress={toggleTheme} style={{ padding: 16 }}>
          <Text style={{ color: isDark ? '#FFF' : '#000' }}>
            {mode.toUpperCase()} / {isDark ? '🌙' : '☀️'}
          </Text>
        </TouchableHighlight>
      </View> */}

      {children}
    </ThemeContext.Provider>
  );
};
