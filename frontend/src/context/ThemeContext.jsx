import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the Theme
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize state from local storage or default to dark mode
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'dark';
  });

  // Effect to apply the correct class to the <html> tag
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      // Set body background for a nice dark fallback
      document.body.style.backgroundColor = '#030014';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      // Set body background for a nice light fallback
      document.body.style.backgroundColor = '#fcfbfe';
    }
    
    // Save selection to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle function between dark and light
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext in any component
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
