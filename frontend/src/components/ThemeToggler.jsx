import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggler = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-300 relative overflow-hidden group 
        ${theme === 'dark' 
          ? 'bg-space-700/60 hover:bg-space-600/80 border border-white/10 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]' 
          : 'bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/50 text-indigo-700 shadow-sm'
        } active:scale-90 hover:shadow-md ${className}`}
      aria-label="Toggle visual theme"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Dynamic Rotating Icon */}
      <div className="relative w-5 h-5 transition-transform duration-500 transform group-hover:rotate-45">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 fill-yellow-400/20 stroke-[2]" />
        ) : (
          <Moon className="w-5 h-5 fill-indigo-500/10 stroke-[2]" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggler;
