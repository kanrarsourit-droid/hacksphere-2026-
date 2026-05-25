import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  MessageSquareCode, 
  Map, 
  FileText, 
  Zap, 
  Terminal,
  Cpu
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
 * SkillSync AI - Futuristic AI Tools Interactive Showcase Page
 */
const AITools = ({ onNavigate }) => {

  return (
    <div className="relative min-h-screen bg-space-950 dark:bg-space-950 light:bg-slate-50 transition-colors duration-500 overflow-x-hidden pt-28 pb-20">
      
      {/* IMMERSIVE STARS & NEON VIGNETTE OVERLAYS */}
      <div className="absolute inset-0 stars-bg pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-950/20 to-space-950 dark:to-space-950 light:to-slate-50 pointer-events-none z-0" />
      
      {/* Glowing Neon Blobs in backgrounds */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-20 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-6 z-10 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/10 light:bg-indigo-50 border border-purple-500/20 text-xs font-bold text-purple-400 dark:text-purple-400 light:text-indigo-700">
            <Cpu className="w-3.5 h-3.5" />
            <span>Active LLM engines</span>
          </div>
          
          <h1 className="font-serif italic font-light tracking-wide text-5xl sm:text-6xl text-white dark:text-white light:text-indigo-950 leading-tight">
            Gemini Core <span className="text-gradient font-sans font-extrabold uppercase tracking-tight not-italic">AI Engines</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-555 max-w-xl font-light leading-relaxed">
            Take a deep dive into the high-speed machine learning models coordinating summaries, diagnostic evaluations, and custom curriculums.
          </p>
        </div>

        {/* AI Tools Detailed Showcase Grid (2x2 Visual Mockups) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          
          {/* Tool 1: AI Quiz Generator */}
          <GlassCard className="border border-white/5 dark:border-white/5 light:border-zinc-200 p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950">AI Quiz Generator</h3>
                  <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">Live Assessment Module</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-zinc-550 leading-relaxed font-light">
                Generates robust diagnostic tests (MCQs, conceptual checks, fill-in-the-blanks) directly matching your uploaded PDF study sheets. Explains every answer logic on completion.
              </p>

              {/* High-Fidelity UI Card Mockup */}
              <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/40 light:bg-white/80 space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  <span>Question 2 of 5</span>
                  <span className="text-amber-400">Streak Triggered</span>
                </div>
                <p className="text-xs text-white dark:text-white light:text-indigo-950 font-medium leading-relaxed">
                  "Which particle transition in the hydrogen atom emits a photon of the shortest wavelength?"
                </p>
                <div className="space-y-2">
                  <div className="p-2 bg-purple-500/10 border border-purple-550/30 rounded-lg text-[11px] text-purple-300 dark:text-purple-300 light:text-indigo-900 font-semibold flex items-center justify-between">
                    <span>A) Lyman Transition (n=2 to n=1)</span>
                    <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[9px] text-white">✓</span>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/10 dark:border-white/5 light:border-zinc-200 rounded-lg text-[11px] text-slate-400 dark:text-slate-450 light:text-zinc-600">
                    <span>B) Balmer Transition (n=3 to n=2)</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('login')}
              className="mt-8 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white dark:text-white light:text-indigo-950 border border-white/10 dark:border-white/5 light:border-zinc-250 flex items-center justify-between group-hover:border-purple-500/40 transition-all duration-300"
            >
              <span>Activate Practice Engine</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </GlassCard>

          {/* Tool 2: Doubt Solver Chatbot */}
          <GlassCard className="border border-white/5 dark:border-white/5 light:border-zinc-200 p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <MessageSquareCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950">AI Doubt Solver Chatbot</h3>
                  <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">24/7 conversational tutor</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-zinc-555 leading-relaxed font-light">
                Resolves complex derivations, programming compiler errors, or essay reviews in conversational depth. Automatically supplies interactive subject suggestion chips.
              </p>

              {/* High-Fidelity UI Chat Mockup */}
              <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/40 light:bg-white/80 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider font-bold">Gemini 1.5 Flash Online</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 p-2.5 rounded-lg max-w-[85%] self-end">
                    <p className="text-[11px] text-slate-300 dark:text-slate-300 light:text-indigo-950 leading-relaxed font-light">"How do I explain recursion to a 10-year-old?"</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-550/20 p-2.5 rounded-lg max-w-[90%] self-start">
                    <p className="text-[11px] text-indigo-300 dark:text-indigo-300 light:text-indigo-900 leading-relaxed font-light font-sans">
                      "Imagine a set of matching wooden Matryoshka dolls! You open the biggest doll, and inside is a smaller but identical doll. You open that one..."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('login')}
              className="mt-8 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white dark:text-white light:text-indigo-950 border border-white/10 dark:border-white/5 light:border-zinc-250 flex items-center justify-between group-hover:border-indigo-500/40 transition-all duration-300"
            >
              <span>Initialize Chat Mentor</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </GlassCard>

          {/* Tool 3: AI Roadmap Generator */}
          <GlassCard className="border border-white/5 dark:border-white/5 light:border-zinc-200 p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950">AI Roadmap Generator</h3>
                  <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Chronological Timeline planner</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-zinc-555 leading-relaxed font-light">
                Constructs a chronological, week-by-week career track checklist with interactive sub-task nodes, milestone checks, and active checklist percentage trackers.
              </p>

              {/* High-Fidelity Roadmap UI Mockup */}
              <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/40 light:bg-white/80 space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 dark:text-slate-400 light:text-zinc-500 font-bold uppercase tracking-wider">Milestone Progress: 75%</span>
                  <div className="w-14 bg-white/5 dark:bg-white/5 light:bg-zinc-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[75%]" />
                  </div>
                </div>
                <div className="space-y-2 pl-3 border-l-2 border-emerald-500/40">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Week 1: CSS Flexbox & Box Model Grid</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-350 dark:text-slate-300 light:text-indigo-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Week 2: Advanced React Context State Patterns</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('login')}
              className="mt-8 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white dark:text-white light:text-indigo-950 border border-white/10 dark:border-white/5 light:border-zinc-250 flex items-center justify-between group-hover:border-emerald-500/40 transition-all duration-300"
            >
              <span>Build Career Roadmap</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </GlassCard>

          {/* Tool 4: Smart Notes Upload & Summarizer */}
          <GlassCard className="border border-white/5 dark:border-white/5 light:border-zinc-200 p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950">Smart Notes Uploader</h3>
                  <span className="text-[9px] uppercase tracking-wider bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full font-bold">Takeaways & outlines studio</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-zinc-555 leading-relaxed font-light">
                Securely uploads curriculum PDFs and image matrices, automatically extracts core key-points, and builds interactive visual notes cards.
              </p>

              {/* High-Fidelity Keypoints UI Mockup */}
              <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/40 light:bg-white/80 space-y-3 shadow-inner">
                <div className="p-2 bg-pink-500/5 border border-pink-550/20 rounded-lg space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-pink-400">Active Summary extraction</span>
                  <p className="text-[11px] text-slate-350 dark:text-slate-300 light:text-indigo-950 italic leading-relaxed font-light">
                    "1. Kinetic Energy increases proportionally with the square of velocity ($KE = \frac{1}{2}mv^2$)."
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('login')}
              className="mt-8 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white dark:text-white light:text-indigo-950 border border-white/10 dark:border-white/5 light:border-zinc-250 flex items-center justify-between group-hover:border-pink-500/40 transition-all duration-300"
            >
              <span>Access Summarizer</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};

export default AITools;
