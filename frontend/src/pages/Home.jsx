import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play
} from 'lucide-react';

/**
 * SkillSync AI - Cinematic Digital Learning Portal Landing Page (Hero Entry)
 */
const Home = ({ onNavigate }) => {

  return (
    <div className="relative min-h-screen bg-space-950 dark:bg-space-950 light:bg-slate-50 transition-colors duration-500 overflow-x-hidden pt-24 pb-20 flex flex-col justify-center">
      
      {/* IMMERSIVE STARS & NEON VIGNETTE OVERLAYS */}
      <div className="absolute inset-0 stars-bg pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-950/20 to-space-950 dark:to-space-950 light:to-slate-50 pointer-events-none z-0" />
      
      {/* Glowing Neon Blobs in backgrounds */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none mix-blend-screen" />

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
          Discover a learning environment that aligns with your mind. Upload curriculum files, generate instant mock exams, and map weekly study checklists with Google Gemini 1.5 Flash intelligence.
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
