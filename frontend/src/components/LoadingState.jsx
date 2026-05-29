import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * SkillSync AI - Beautiful futuristic loading states
 */
const LoadingState = ({ type = "default", message = "AI is thinking..." }) => {
  
  // 1. CHATBOT TYPING DOTS LOADER
  if (type === "typing") {
    return (
      <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-indigo-50/50 border border-white/5 dark:border-white/5 light:border-zinc-200/50 rounded-2xl w-fit">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-typing" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-typing" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    );
  }

  // 2. DEFAULT SPINNER LOADER (For summaries, quizzes, roadmaps)
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-6">
        
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full blur-[20px] bg-purple-500/30 animate-pulse" />
        
        {/* Outer spinning ring */}
        <div className="w-16 h-16 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin duration-1000" />
        
        {/* Inner reverse spinning ring */}
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-2 border-t-transparent border-r-pink-500 border-b-transparent border-l-purple-400 animate-spin duration-1500 direction-reverse" />
        
        {/* Sparkle center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
        </div>
      </div>
      
      {/* Messages */}
      <h3 className="text-sm font-semibold text-gradient tracking-wide animate-pulse">{message}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-500 light:text-zinc-400 mt-1 max-w-xs">
        SyncVerse AI is working with Google Gemini to generate high-quality learning materials.
      </p>
    </div>
  );
};

export default LoadingState;
