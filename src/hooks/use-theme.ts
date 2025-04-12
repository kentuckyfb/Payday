
import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

/**
 * A hook for managing theme state with improved performance
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if theme was previously stored (faster than querying DOM)
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme as Theme;
    }
    
    // Check user system preferences (fallback)
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Memoized theme setter for better performance
  const setTheme = useCallback((newTheme: Theme) => {
    // No-op if theme isn't changing
    if (newTheme === theme) return;
    
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize theme based on stored preference (runs only once)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply if user hasn't explicitly set preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return { theme, setTheme };
}
