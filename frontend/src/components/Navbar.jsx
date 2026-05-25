import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';
import ThemeToggler from './ThemeToggler';

/**
 * SkillSync AI - Responsive Global Navbar
 */
const Navbar = ({ activeUser, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add frosted background shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId, pageName = 'home') => {
    setIsOpen(false);
    
    // Notify main app to switch pages
    onNavigate(pageName);
    
    // Smooth scroll to the target section if on home page
    if (pageName === 'home' && sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-space-900/80 dark:bg-space-900/80 light:bg-white/80 backdrop-blur-md shadow-lg border-b border-white/5 dark:border-white/5 light:border-indigo-100/50' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => handleNavClick(null, 'home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 dark:from-white dark:via-indigo-200 dark:to-purple-300 light:from-indigo-900 light:to-purple-700">
            SkillSync <span className="text-gradient">AI</span>
          </span>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleNavClick(null, 'home')}
            className="text-sm font-medium hover:text-purple-500 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('features', 'home')}
            className="text-sm font-medium hover:text-purple-500 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('subjects', 'home')}
            className="text-sm font-medium hover:text-purple-500 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 transition-colors"
          >
            Subjects
          </button>
          <button 
            onClick={() => handleNavClick('features', 'home')} // AI Tools are described inside features section
            className="text-sm font-medium hover:text-purple-500 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 transition-colors"
          >
            AI Tools
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggler />
          
          {activeUser ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-neon !py-2 !px-5 text-sm flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="btn-neon-secondary !py-2 !px-5 text-sm hover:border-purple-500/50"
            >
              Login
            </button>
          )}
        </div>

        {/* MOBILE NAVIGATION BUTTON */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggler />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-indigo-50 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel dark:bg-space-900/95 light:bg-white/95 backdrop-blur-xl border-b border-white/5 dark:border-white/5 light:border-zinc-200 p-6 flex flex-col gap-4 animate-fade-in shadow-2xl">
          <button 
            onClick={() => handleNavClick(null, 'home')}
            className="text-left py-2 font-medium hover:text-purple-400 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 border-b border-white/5 dark:border-white/5 light:border-zinc-100"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('features', 'home')}
            className="text-left py-2 font-medium hover:text-purple-400 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 border-b border-white/5 dark:border-white/5 light:border-zinc-100"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('subjects', 'home')}
            className="text-left py-2 font-medium hover:text-purple-400 dark:hover:text-purple-400 light:text-zinc-700 light:hover:text-indigo-600 border-b border-white/5 dark:border-white/5 light:border-zinc-100"
          >
            Subjects
          </button>
          
          {activeUser ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('dashboard');
              }}
              className="btn-neon w-full justify-center flex items-center gap-2 mt-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('login');
              }}
              className="btn-neon w-full justify-center mt-2"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
