import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'system',
  );

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
};
