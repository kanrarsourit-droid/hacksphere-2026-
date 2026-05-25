import React, { useRef } from 'react';

/**
 * Reusable premium Glassmorphic Card with interactive mouse-glow effect!
 * 
 * Since you are a beginner, here is how the glow works:
 * On mousemove, we calculate where the mouse is relative to the card's boundary
 * and set custom CSS variables (--mouse-x and --mouse-y) on the card container.
 * The CSS in index.css reads these variables to render a beautiful glowing aura under the pointer!
 */
const GlassCard = ({ children, className = '', onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`glass-panel glow-card p-6 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 relative ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
    >
      {/* Dynamic Glow Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl opacity-20 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/5 dark:from-indigo-500/5 dark:via-transparent dark:to-pink-500/3 z-0" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
