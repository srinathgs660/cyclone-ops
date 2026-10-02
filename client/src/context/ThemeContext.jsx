import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eoc_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('eoc_theme', theme);
    const root = document.documentElement;
    const themeColorMeta = document.getElementById('theme-color-meta');
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#FFFFFF');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#0B1120');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight: theme === 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
