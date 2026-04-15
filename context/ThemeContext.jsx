import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LightTheme, DarkTheme } from '../constants/Themes.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = create(
  persist(
    (set) => ({
      isDark: false,
      theme: LightTheme,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        return {
          isDark: newIsDark,
          theme: newIsDark ? DarkTheme : LightTheme,
        };
      }),
    }),
    {
      name: 'appTheme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const ThemeProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useTheme.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useTheme.persist.hasHydrated());
    return unsubFinishHydration;
  }, []);

  if (!isHydrated) return null; 

  return (
    children
  );
};