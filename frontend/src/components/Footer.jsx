import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="relative border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 bg-space-950/40 dark:bg-space-950/40 light:bg-zinc-50/50 backdrop-blur-md py-12 overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[120px] bg-indigo-500/10 dark:bg-indigo-500/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* BRAND COLUMN */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-indigo-900">
              SkillSync <span className="text-gradient">AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-600 max-w-sm">
            Empowering students worldwide with state-of-the-art Generative AI capabilities. Upload notes, solve doubts, and crush exams effortlessly.
          </p>
        </div>

        {/* RESOURCE MAP */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-white dark:text-white light:text-indigo-950 uppercase tracking-wider">Features</h4>
          <button onClick={() => onNavigate('home')} className="text-sm text-left text-slate-400 dark:text-slate-400 light:text-zinc-600 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-indigo-600 transition-colors">Quiz Generator</button>
          <button onClick={() => onNavigate('home')} className="text-sm text-left text-slate-400 dark:text-slate-400 light:text-zinc-600 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-indigo-600 transition-colors">AI Chatbot Tutor</button>
          <button onClick={() => onNavigate('home')} className="text-sm text-left text-slate-400 dark:text-slate-400 light:text-zinc-600 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-indigo-600 transition-colors">Roadmap Builder</button>
        </div>

        {/* NEWSLETTER */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-white dark:text-white light:text-indigo-950 uppercase tracking-wider">Join Newsletter</h4>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-600">Get the latest feature updates and study strategies sent directly to your inbox.</p>
          <div className="flex gap-2 mt-1">
            <input 
              type="email" 
              placeholder="Enter email" 
              className="px-3 py-2 rounded-lg text-xs bg-space-800 dark:bg-space-850 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 w-full"
            />
            <button className="btn-neon !py-2 !px-4 text-xs font-medium">Join</button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500 light:text-zinc-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} SkillSync AI. Built for the future of learning.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" /> for HackSphere 2026.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
