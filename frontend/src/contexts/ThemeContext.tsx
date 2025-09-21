import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'yantra-daan-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const updateActualTheme = (newTheme: Theme) => {
    const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    setActualTheme(resolvedTheme);
    
    // Only update DOM if we're in the browser
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      const body = window.document.body;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the resolved theme class
      root.classList.add(resolvedTheme);
      body.classList.add(resolvedTheme);
      
      // Set data attribute for CSS targeting
      root.setAttribute('data-theme', resolvedTheme);
      
      // Add smooth transition class
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
  };

  const handleSetTheme = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      updateActualTheme(newTheme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  // Initialize theme on mount and when theme changes
  useEffect(() => {
    updateActualTheme(theme);
  }, [theme]);

  // Initialize theme on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the saved theme or use default
      const savedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
      const resolvedTheme = savedTheme === 'system' ? getSystemTheme() : savedTheme;
      
      // Apply the theme immediately
      const root = window.document.documentElement;
      const body = window.document.body;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the resolved theme class
      root.classList.add(resolvedTheme);
      body.classList.add(resolvedTheme);
      
      // Set data attribute
      root.setAttribute('data-theme', resolvedTheme);
      
      // Update state
      setActualTheme(resolvedTheme);
      if (savedTheme !== theme) {
        setTheme(savedTheme);
      }
    }
  }, []); // Only run on mount

  // Handle system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        if (theme === 'system') {
          updateActualTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};