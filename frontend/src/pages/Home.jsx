import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

// 3D Neural Vector Mask Avatar details for developer credits
const developers = [
  {
    name: "SOURIT KANRAR",
    role: "Lead Fullstack & Database Developer",
    badge: "SYS_CORE_ACTIVE",
    quote: "“Code is not just syntax; it is the art of building new universes from nothing.”",
    glowColor: "#10b981", // Emerald green
    avatarSvg: (
      <svg className="w-12 h-12 text-emerald-450 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" viewBox="0 0 100 100">
        <rect x="25" y="25" width="50" height="50" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
      </svg>
    )
  },
  {
    name: "SOMESH KAYAL",
    role: "Core Systems Error Debugger",
    badge: "DEBUG_ENGINE_ON",
    quote: "“Finding bugs is an art, but transforming errors into smooth pathways is pure craftsmanship.”",
    glowColor: "#f43f5e", // Rose Red
    avatarSvg: (
      <svg className="w-12 h-12 text-rose-450 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M30,30 L70,70 M70,30 L30,70" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="6" fill="currentColor" />
      </svg>
    )
  },
  {
    name: "AVANTIKA NATH",
    role: "Code Reviewer & UI/UX Director",
    badge: "GLASS_GLARE_ON",
    quote: "“Design is not just what it looks like and feels like. Design is how it works.”",
    glowColor: "#a855f7", // Purple
    avatarSvg: (
      <svg className="w-12 h-12 text-purple-450 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" viewBox="0 0 100 100">
        <polygon points="50,15 85,38 85,78 50,92 15,78 15,38" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="52" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin-slow" />
        <circle cx="50" cy="52" r="4" fill="currentColor" />
      </svg>
    )
  },
  {
    name: "SUPRODIP BISWAS",
    role: "Strategic Marketing Director",
    badge: "ROLLOUT_ACTIVE",
    quote: "“Great products tell a story that connects minds and solves real-world puzzles.”",
    glowColor: "#06b6d4", // Cyan
    avatarSvg: (
      <svg className="w-12 h-12 text-cyan-450 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" viewBox="0 0 100 100">
        <path d="M50,15 L80,75 L50,60 L20,75 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="45" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse" />
      </svg>
    )
  }
];

/**
 * SkillSync AI - Cinematic Digital Learning Portal Landing Page (Hero Entry)
 */
const Home = ({ onNavigate }) => {
  const [imageError, setImageError] = React.useState(false);
  const [hoveredDevIdx, setHoveredDevIdx] = React.useState(null);
  const canvasRef = React.useRef(null);
  const mouseRef = React.useRef({ x: -1000, y: -1000, tx: -1000, ty: -1000, active: false });

  // 1. High-Graphics SVG Image Displacement Wave Physics
  React.useEffect(() => {
    let animationFrameId;
    let scaleValue = 0;
    let targetScale = 0;
    let time = 0;

    const handleMouseMove = () => {
      // Surge the displacement ripple scale when mouse moves
      targetScale = 45;
    };

    const handleMouseLeave = () => {
      targetScale = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const animateWarp = () => {
      time += 0.04;
      
      // Interpolate the scale for ultra-smooth fluid trailing
      scaleValue += (targetScale - scaleValue) * 0.06;
      
      // Apply a subtle base breathing fluid motion even at rest
      const finalScale = scaleValue + Math.sin(time * 0.8) * 5;

      const displacementMap = document.getElementById('skillsync-wave-displacement-map');
      if (displacementMap) {
        displacementMap.setAttribute('scale', finalScale.toString());
      }

      const turbulence = document.getElementById('skillsync-wave-turbulence');
      if (turbulence) {
        // Morph the fractal base frequency so it looks like flowing currents!
        const xFreq = 0.006 + Math.sin(time * 0.4) * 0.002;
        const yFreq = 0.025 + Math.cos(time * 0.2) * 0.005;
        turbulence.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);
      }

      // Decay the surge scale gently over frames
      if (targetScale > 0) {
        targetScale -= 0.8;
        if (targetScale < 0) targetScale = 0;
      }

      animationFrameId = requestAnimationFrame(animateWarp);
    };

    animateWarp();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Interactive Canvas Grid Fallback (Active when /wave.png is missing or fails to load)
  React.useEffect(() => {
    if (!imageError) return; // Only trigger if image fails

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cols = 38;
    const rows = 26;
    let points = [];

    // Re-initialize points array dynamically to span the full screen perfectly on resize
    const initPoints = () => {
      const spacingX = width / (cols - 1);
      const spacingY = (height / 2.3) / (rows - 1);
      points.length = 0; // Clear the array safely
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          points.push({
            x: c * spacingX,
            baseY: height * 0.65 + r * spacingY - (rows * spacingY) / 2,
            y: 0
          });
        }
      }
    };

    initPoints();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initPoints(); // Re-compute grid points to never cut off on the right
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      // Since background canvas is fixed, coordinates map 1:1 to viewport e.clientX and e.clientY
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.tx = -1000;
      mouseRef.current.ty = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.07;
      mouse.y += (mouse.ty - mouse.y) * 0.07;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p = points[idx];
          if (!p) continue;

          const wave1 = Math.sin(c * 0.16 + time * 1.3) * Math.cos(r * 0.2 + time * 0.7) * 32;
          const wave2 = Math.sin(c * 0.08 - time * 0.9) * 12;
          let yOffset = wave1 + wave2;

          if (mouse.active || mouse.x > 0) {
            const dx = p.x - mouse.x;
            const dy = (p.baseY + yOffset) - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 260;

            if (dist < maxDist) {
              const force = (1 - dist / maxDist) ** 2;
              yOffset += Math.sin(dist * 0.06 - time * 4.5) * force * 45;
            }
          }

          p.y = p.baseY + yOffset;
        }
      }

      ctx.lineWidth = 0.85;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
      gradient.addColorStop(0.32, 'rgba(6, 182, 212, 0.3)');
      gradient.addColorStop(0.68, 'rgba(99, 102, 241, 0.35)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.22)');
      ctx.strokeStyle = gradient;

      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = points[r * cols + c];
          if (!p) continue;
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.lineWidth = 0.55;
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = points[r * cols + c];
          if (!p) continue;
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.lineWidth = 0.3;
      for (let r = 0; r < rows - 1; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols - 1; c++) {
          const p1 = points[r * cols + c];
          const p2 = points[(r + 1) * cols + (c + 1)];
          if (!p1 || !p2) continue;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageError]);

  // 3. Cinematic Intersection Scroll Observer for Scroll Reveal animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-space-950 dark:bg-space-950 light:bg-slate-50 transition-colors duration-500 overflow-x-hidden pt-24 pb-20 flex flex-col justify-center">
      
      {/* 3D NEON IMAGE DISPLACEMENT BACKGROUND (Loads their exact uploaded image) */}
      {!imageError ? (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none opacity-85">
          <img 
            src="/wave.png" 
            alt="Exact Grid Wave Background" 
            className="w-full h-full object-cover"
            style={{ filter: 'url(#skillsync-wave-displacement)' }}
            onError={() => setImageError(true)}
          />
          
          {/* SVG fractal noise displacement shader definition */}
          <svg className="absolute w-0 h-0 pointer-events-none">
            <defs>
              <filter id="skillsync-wave-displacement">
                <feTurbulence 
                  id="skillsync-wave-turbulence"
                  type="fractalNoise" 
                  baseFrequency="0.006 0.025" 
                  numOctaves="2" 
                  result="noise" 
                />
                <feDisplacementMap 
                  id="skillsync-wave-displacement-map"
                  in="SourceGraphic" 
                  in2="noise" 
                  scale="0" 
                  xChannelSelector="R" 
                  yChannelSelector="G" 
                />
              </filter>
            </defs>
          </svg>
        </div>
      ) : (
        /* Dynamic 3D Neon Canvas Fallback if image fails to load */
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80" />
      )}
      
      {/* Modular Anti-Gravity Drift Animation Styles */}
      <style>{`
        @keyframes slow-scale-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes float-drift-1 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(30px, -45px) rotate(120deg); }
          66% { transform: translate(-20px, 25px) rotate(240deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        @keyframes float-drift-2 {
          0% { transform: translate(0px, 0px) rotate(360deg); }
          50% { transform: translate(-45px, 50px) rotate(180deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes float-drift-3 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(50px, -30px) rotate(-180deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes spark-drift-1 {
          0% { transform: translate(0px, 0px); opacity: 0.3; }
          50% { transform: translate(45px, -55px); opacity: 0.85; }
          100% { transform: translate(0px, 0px); opacity: 0.3; }
        }
        @keyframes spark-drift-2 {
          0% { transform: translate(0px, 0px); opacity: 0.4; }
          50% { transform: translate(-40px, -35px); opacity: 0.9; }
          100% { transform: translate(0px, 0px); opacity: 0.4; }
        }
        @keyframes spark-drift-3 {
          0% { transform: translate(0px, 0px); opacity: 0.3; }
          50% { transform: translate(35px, 45px); opacity: 0.75; }
          100% { transform: translate(0px, 0px); opacity: 0.3; }
        }
        @keyframes spark-drift-4 {
          0% { transform: translate(0px, 0px); opacity: 0.5; }
          50% { transform: translate(-25px, -60px); opacity: 0.95; }
          100% { transform: translate(0px, 0px); opacity: 0.5; }
        }
        .bg-ambient-geometry {
          background-image: url('/hero_premium_ambient_geometry.png');
          background-size: cover;
          background-position: center;
          animation: slow-scale-pulse 28s infinite ease-in-out;
        }
        .drifter-sphere-1 {
          animation: float-drift-1 25s infinite ease-in-out;
        }
        .drifter-sphere-2 {
          animation: float-drift-2 30s infinite ease-in-out;
        }
        .drifter-sphere-3 {
          animation: float-drift-3 27s infinite ease-in-out;
        }
        .spark-node-1 { animation: spark-drift-1 16s infinite ease-in-out; }
        .spark-node-2 { animation: spark-drift-2 20s infinite ease-in-out; }
        .spark-node-3 { animation: spark-drift-3 24s infinite ease-in-out; }
        .spark-node-4 { animation: spark-drift-4 18s infinite ease-in-out; }
      `}</style>

      {/* DUAL-LAYER PREMIUM AMBIENT GEOMETRY BACKGROUND ENGINE */}
      <div className="fixed inset-0 bg-ambient-geometry pointer-events-none z-0 opacity-28 dark:opacity-28 light:opacity-15 light:invert light:mix-blend-normal mix-blend-lighten" />
      
      {/* Matte black vignette backing & color gradient anchors */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-space-950/20 to-space-950 dark:to-space-950 light:to-slate-50 pointer-events-none z-0" />
      
      {/* HIGH GRAPHICS DYNAMIC NEURAL SPARKS OVERLAY */}
      <div className="absolute top-48 left-[14%] pointer-events-none z-0 spark-node-1">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 light:bg-indigo-600 shadow-[0_0_10px_rgba(34,211,238,0.85),0_0_20px_rgba(34,211,238,0.4)] light:shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-cyan-400/20 light:bg-indigo-600/10 animate-ping opacity-50" />
          <div className="absolute top-1.5 left-[2px] w-[1px] h-24 bg-gradient-to-b from-cyan-400/20 via-cyan-400/5 to-transparent light:from-indigo-600/15" />
          <div className="absolute top-[3px] left-1.5 w-24 h-[1px] bg-gradient-to-r from-cyan-400/15 via-purple-500/5 to-transparent light:from-indigo-600/10" />
        </div>
      </div>

      <div className="absolute top-[32%] right-[18%] pointer-events-none z-0 spark-node-2">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 light:bg-purple-600 shadow-[0_0_10px_rgba(192,132,252,0.85),0_0_20px_rgba(192,132,252,0.4)] light:shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-purple-400/20 light:bg-purple-600/10 animate-ping opacity-40" />
          <div className="absolute top-1.5 left-[2px] w-[1px] h-28 bg-gradient-to-b from-purple-400/20 via-purple-400/5 to-transparent light:from-purple-600/15" />
          <div className="absolute top-[3px] right-1.5 w-32 h-[1px] bg-gradient-to-l from-purple-400/15 via-cyan-500/5 to-transparent light:from-purple-600/10" />
        </div>
      </div>

      <div className="absolute top-[58%] left-[24%] pointer-events-none z-0 spark-node-3">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 light:bg-indigo-600 shadow-[0_0_10px_rgba(34,211,238,0.85),0_0_20px_rgba(34,211,238,0.4)] light:shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-cyan-400/20 light:bg-indigo-600/10 animate-ping opacity-50" />
          <div className="absolute bottom-1.5 left-[2px] w-[1px] h-20 bg-gradient-to-t from-cyan-400/20 via-cyan-400/5 to-transparent light:from-indigo-600/15" />
          <div className="absolute top-[3px] left-1.5 w-20 h-[1px] bg-gradient-to-r from-cyan-400/15 via-pink-500/5 to-transparent light:from-indigo-600/10" />
        </div>
      </div>

      <div className="absolute top-[75%] right-[14%] pointer-events-none z-0 spark-node-4">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400 light:bg-purple-600 shadow-[0_0_10px_rgba(244,114,182,0.85),0_0_20px_rgba(244,114,182,0.4)] light:shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-pink-400/20 light:bg-purple-600/10 animate-ping opacity-45" />
          <div className="absolute top-1.5 left-[2px] w-[1px] h-24 bg-gradient-to-b from-pink-400/20 via-pink-400/5 to-transparent light:from-purple-600/15" />
          <div className="absolute top-[3px] right-1.5 w-28 h-[1px] bg-gradient-to-l from-pink-400/15 via-cyan-400/5 to-transparent light:from-purple-600/10" />
        </div>
      </div>

      <div className="absolute top-[42%] left-[62%] pointer-events-none z-0 spark-node-1 animate-delay-[4s]">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 light:bg-indigo-600 shadow-[0_0_10px_rgba(34,211,238,0.85),0_0_20px_rgba(34,211,238,0.4)] light:shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-cyan-400/20 light:bg-indigo-600/10 animate-ping opacity-35" />
          <div className="absolute top-1.5 left-[2px] w-[1px] h-16 bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent light:from-indigo-600/15" />
        </div>
      </div>

      <div className="absolute top-28 right-[32%] pointer-events-none z-0 spark-node-3 animate-delay-[3s]">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 light:bg-purple-600 shadow-[0_0_10px_rgba(192,132,252,0.85),0_0_20px_rgba(192,132,252,0.4)] light:shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
          <div className="absolute -inset-1 rounded-full bg-purple-400/20 light:bg-purple-600/10 animate-ping opacity-40" />
          <div className="absolute top-[3px] left-1.5 w-36 h-[1px] bg-gradient-to-r from-purple-400/15 via-cyan-400/5 to-transparent light:from-purple-600/10" />
        </div>
      </div>
      
      {/* Translucent Zero-Gravity Drifting Spheres */}
      <div className="absolute top-24 left-[12%] w-64 h-64 rounded-full bg-gradient-to-tr from-purple-500/10 via-indigo-500/8 to-cyan-500/5 dark:bg-gradient-to-tr dark:from-purple-500/10 dark:via-indigo-500/8 dark:to-cyan-500/5 light:bg-white/40 backdrop-blur-[12px] border border-white/8 dark:border-white/5 light:border-indigo-500/15 shadow-[0_0_50px_rgba(139,92,246,0.12)] light:shadow-[0_0_30px_rgba(99,102,241,0.06)] pointer-events-none z-0 drifter-sphere-1" />
      <div className="absolute top-[40%] right-[15%] w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/8 via-pink-500/6 to-purple-500/5 dark:bg-gradient-to-br dark:from-indigo-500/8 dark:via-pink-500/6 dark:to-purple-500/5 light:bg-white/40 backdrop-blur-[15px] border border-white/8 dark:border-white/5 light:border-indigo-500/15 shadow-[0_0_60px_rgba(99,102,241,0.12)] light:shadow-[0_0_30px_rgba(99,102,241,0.06)] pointer-events-none z-0 drifter-sphere-2" />
      <div className="absolute bottom-[20%] left-[8%] w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/8 via-purple-500/8 to-indigo-500/5 dark:bg-gradient-to-tr dark:from-cyan-500/8 dark:via-purple-500/8 dark:to-indigo-500/5 light:bg-white/40 backdrop-blur-[10px] border border-white/8 dark:border-white/5 light:border-indigo-500/15 shadow-[0_0_45px_rgba(6,182,212,0.1)] light:shadow-[0_0_25px_rgba(99,102,241,0.05)] pointer-events-none z-0 drifter-sphere-3" />

      {/* Floating Ambient Glowing Neon Blobs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 dark:bg-purple-600/10 light:bg-purple-400/5 blur-[130px] pointer-events-none mix-blend-screen light:mix-blend-normal" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 light:bg-indigo-400/5 blur-[120px] pointer-events-none mix-blend-screen light:mix-blend-normal" />

      {/* ==========================================
          IMMERSIVE HERO AREA (Starry Night + Liquid Metallic Orb)
          ========================================== */}
      <section className="relative max-w-7xl mx-auto px-6 py-8 flex flex-col items-center text-center z-10 w-full">
        
        {/* Rounded Navigation Capsule Menu Anchor (Exactly like reference picture!) */}
        <div className="hidden sm:flex items-center gap-6 bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200/80 backdrop-blur-md px-6 py-2 rounded-full text-xs text-slate-350 dark:text-slate-300 light:text-zinc-600 shadow-lg mx-auto w-fit animate-glow-border">
          <span className="cursor-pointer hover:text-white dark:hover:text-white light:hover:text-indigo-950 font-medium transition-colors" onClick={() => onNavigate('home')}>Home</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 dark:bg-white/20 light:bg-zinc-200" />
          <span className="cursor-pointer hover:text-white dark:hover:text-white light:hover:text-indigo-950 font-medium transition-colors" onClick={() => onNavigate('features')}>Features</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 dark:bg-white/20 light:bg-zinc-200" />
          <span className="cursor-pointer hover:text-white dark:hover:text-white light:hover:text-indigo-950 font-medium transition-colors" onClick={() => onNavigate('subjects')}>Academic Streams</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 dark:bg-white/20 light:bg-zinc-200" />
          <span className="cursor-pointer hover:text-white dark:hover:text-white light:hover:text-indigo-950 font-medium transition-colors" onClick={() => onNavigate('login')}>Plan Launch</span>
        </div>

        {/* Floating Capsule tag (V2 Educator Modules) */}
        <div className="inline-flex items-center gap-2 bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 dark:border-white/5 light:border-zinc-200/60 px-4 py-1.5 rounded-full text-[11px] text-slate-300 dark:text-slate-300 light:text-indigo-950 font-medium mt-10">
          <span className="bg-white text-black font-extrabold uppercase text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">New</span>
          <span>Maiden Collaborative Educator Modules Live 2026</span>
        </div>

        {/* Cinematic Editorial Serif Headline */}
        <h1 className="font-serif italic font-light tracking-wide text-5xl sm:text-6xl md:text-7.5xl text-white dark:text-white light:text-indigo-950 max-w-4xl leading-tight mt-8">
          Venture Past Traditional Study <br />
          Across the <span className="text-gradient font-sans font-extrabold uppercase tracking-tight not-italic">AI Universe</span>
        </h1>

        {/* Descriptive subtitle */}
        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-550 max-w-2xl mt-4 leading-relaxed font-light">
          Discover a learning environment that aligns with your mind. Upload curriculum files, generate instant mock exams, and map weekly study checklists with SkillSync AI intelligence.
        </p>

        {/* Immersive Action Capsule Buttons */}
        <div className="flex items-center gap-4 mt-8 justify-center">
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 rounded-full bg-white text-black hover:bg-slate-100 font-medium text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Start Your Voyage
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('features')}
            className="px-6 py-3 rounded-full bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-250 hover:bg-white/10 hover:border-white/20 text-white dark:text-white light:text-indigo-950 font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5 fill-white dark:fill-white light:fill-indigo-950" />
            <span>Explore Systems</span>
          </button>
        </div>

        {/* ==========================================
            CENTRAL METALLIC ORGANIC FLUID ORB
            ========================================== */}
        <div className="relative w-80 h-80 md:w-[460px] md:h-[460px] mx-auto my-14 flex items-center justify-center">
          
          {/* Glowing colorful drop backdrops */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-indigo-600 to-cyan-500 blur-[85px] opacity-35 animate-pulse-glow pointer-events-none" />

          {/* Morphing fluid metallic physical body */}
          <div className="absolute inset-4 bg-gradient-to-tr from-amber-300 via-purple-700 via-indigo-950 to-cyan-400 liquid-metallic-orb border border-white/15 dark:border-white/10 light:border-zinc-200/50 shadow-[0_0_80px_rgba(236,201,72,0.25),inset_0_0_60px_rgba(255,255,255,0.15)] relative overflow-hidden group">
            
            {/* Shifting radial glass layers */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1.5px] shadow-[inset_0_0_50px_rgba(255,255,255,0.35)]" />

            {/* Neural Spark grid overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Floating golden specular highlight */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-amber-300/35 to-indigo-500/0 blur-2xl animate-float-medium" />

            {/* Floating central glow item */}
            <div className="absolute inset-0 flex items-center justify-center animate-float-slow">
              <Sparkles className="w-16 h-16 text-amber-200/80 drop-shadow-[0_0_20px_rgba(252,211,77,0.5)] animate-pulse" />
            </div>
          </div>

          {/* Stat Overlay glass chips suspended over the orb bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm grid grid-cols-2 gap-4 px-4 z-20">
            
            {/* Stat Card 1 */}
            <div className="glass-panel p-4.5 rounded-2xl border border-white/10 dark:border-white/5 light:border-zinc-200 bg-black/40 dark:bg-black/50 light:bg-white/90 backdrop-blur-md shadow-2xl flex flex-col justify-center text-center">
              <span className="text-xl sm:text-2xl font-serif italic text-amber-300 dark:text-amber-300 light:text-indigo-800">14.5 Days</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-400 light:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Average Study Streak</span>
            </div>

            {/* Stat Card 2 */}
            <div className="glass-panel p-4.5 rounded-2xl border border-white/10 dark:border-white/5 light:border-zinc-200 bg-black/40 dark:bg-black/50 light:bg-white/90 backdrop-blur-md shadow-2xl flex flex-col justify-center text-center">
              <span className="text-xl sm:text-2xl font-serif italic text-cyan-300 dark:text-cyan-300 light:text-indigo-800">2.8M+</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-400 light:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Scholars Active</span>
            </div>
          </div>
        </div>

        {/* ==========================================
            DEV CONSOLE CREDITS (Face Masks with 3D Parallax Tilt)
            ========================================== */}
        <div className="w-full max-w-5xl my-28 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 pt-16 scroll-reveal">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif italic font-light text-3xl sm:text-4xl text-white dark:text-white light:text-indigo-950">
              Maiden Developer <span className="text-gradient font-sans font-extrabold uppercase tracking-tight not-italic">Core Console</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-zinc-550 mt-3 font-light leading-relaxed">
              Hover over the vector neural face masks to swivel and inspect the active developers behind the SkillSync system matrix.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {developers.map((dev, idx) => (
              <GlassCard 
                key={idx} 
                tilt={true}
                onMouseEnter={() => setHoveredDevIdx(idx)}
                onMouseLeave={() => setHoveredDevIdx(null)}
                style={{
                  borderColor: hoveredDevIdx === idx ? dev.glowColor : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: hoveredDevIdx === idx 
                    ? `0 15px 45px -10px ${dev.glowColor}30, 0 0 25px -3px ${dev.glowColor}40, inset 0 0 20px 0 ${dev.glowColor}15` 
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className="relative overflow-hidden group flex flex-col justify-between items-center text-center p-8 min-h-[340px] border border-white/5 dark:border-white/5 shadow-2xl transition-all duration-300"
              >
                {/* Dynamic colorful blur circle matching developer's specific theme color */}
                <div 
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[35px] opacity-[0.06] group-hover:opacity-[0.22] transition-all duration-500 pointer-events-none" 
                  style={{ backgroundColor: dev.glowColor, transform: hoveredDevIdx === idx ? 'scale(1.3) translate(-10px, 10px)' : 'scale(1)' }}
                />

                <div className="flex flex-col items-center gap-5 w-full">
                  {/* Glowing 3D Vector "Face Mask" Orbit Avatar */}
                  <div 
                    className="w-20 h-20 rounded-2xl bg-white/5 dark:bg-white/3 light:bg-indigo-50 border flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-350"
                    style={{
                      borderColor: hoveredDevIdx === idx ? dev.glowColor : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: hoveredDevIdx === idx ? `0 0 20px ${dev.glowColor}40` : 'none',
                      transform: hoveredDevIdx === idx ? 'scale(1.08) rotate(5deg)' : 'scale(1)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {dev.avatarSvg}
                  </div>

                  {/* Dev Metadata */}
                  <div className="space-y-1">
                    <h3 
                      className="text-lg font-bold text-white dark:text-white light:text-indigo-950 transition-all duration-300"
                      style={{
                        textShadow: hoveredDevIdx === idx ? `0 0 12px ${dev.glowColor}` : 'none',
                        color: hoveredDevIdx === idx ? '#ffffff' : ''
                      }}
                    >
                      {dev.name}
                    </h3>
                    <p className="text-[10px] text-purple-400 dark:text-purple-300 light:text-indigo-650 uppercase tracking-widest font-extrabold">{dev.role}</p>
                  </div>

                  <p className="text-xs text-slate-350 dark:text-slate-300 light:text-zinc-650 italic font-serif leading-relaxed mt-2 px-1">
                    {dev.quote}
                  </p>
                </div>

                {/* Developer social tag capsule */}
                <div 
                  className="mt-8 px-4 py-1.5 rounded-full bg-white/5 dark:bg-white/3 border border-white/10 dark:border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-300 light:text-zinc-650 transition-all duration-300"
                  style={{
                    borderColor: hoveredDevIdx === idx ? dev.glowColor : 'rgba(255, 255, 255, 0.1)',
                    color: hoveredDevIdx === idx ? '#ffffff' : '',
                    backgroundColor: hoveredDevIdx === idx ? `${dev.glowColor}15` : ''
                  }}
                >
                  {dev.badge}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Academic collaborators footer list */}
        <div className="w-full max-w-4xl border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 pt-8 mt-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-500 light:text-zinc-500 font-bold">Collaborating with top academic institutions globally</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-5 font-serif text-lg italic text-slate-400 dark:text-slate-400 light:text-zinc-550 opacity-60">
            <span className="hover:text-white dark:hover:text-white light:hover:text-indigo-950 transition-colors">Aeon Academy</span>
            <span className="hover:text-white dark:hover:text-white light:hover:text-indigo-950 transition-colors">Vela Studies</span>
            <span className="hover:text-white dark:hover:text-white light:hover:text-indigo-950 transition-colors">Apex Research</span>
            <span className="hover:text-white dark:hover:text-white light:hover:text-indigo-950 transition-colors">Orbit Institute</span>
            <span className="hover:text-white dark:hover:text-white light:hover:text-indigo-950 transition-colors">Zeno AI Group</span>
          </div>
        </div>

      </section>

    </div>
  );
};

export default Home;
