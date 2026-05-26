import React, { useRef, useState } from 'react';

/**
 * Reusable premium Glassmorphic Card with interactive mouse-glow and 3D parallax tilt effects!
 */
const GlassCard = ({ children, className = '', onClick, tilt = false, style: parentStyle = {}, ...rest }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 11; // Max 11 degree tilt
      const rotateY = ((x - centerX) / centerX) * 11;
      
      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
        transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)'
      });
    }
  };

  const handleMouseLeave = () => {
    if (tilt) {
      setStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ ...parentStyle, ...style }}
      className={`glass-panel glow-card p-6 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...rest}
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
