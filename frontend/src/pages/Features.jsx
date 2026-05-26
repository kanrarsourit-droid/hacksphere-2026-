import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  BrainCircuit, 
  MessageSquareCode, 
  Map, 
  LayoutDashboard, 
  TrendingUp,
  Activity,
  Flame,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
 * SkillSync AI - Dedicated System Capabilities & Features Showcase Page
 */
const Features = ({ onNavigate }) => {
  // Intersection scroll observer for smooth reveal animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.05 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // List of high-speed features
  const features = [
    {
      title: "AI Quiz Generator",
      desc: "Instantly create customized MCQs, True/False, and short-answer exams from your uploaded documents to drill your memory. Compiles grading metrics automatically.",
      icon: BrainCircuit,
      color: "from-purple-500 to-indigo-500",
      accent: "text-purple-400 light:text-indigo-600"
    },
    {
      title: "AI Doubt Solver Chatbot",
      desc: "Ask your AI study mentor programming bugs, complex math derivations, or essays. Get conversational structured explanations 24/7 with active reference chips.",
      icon: MessageSquareCode,
      color: "from-indigo-500 to-cyan-500",
      accent: "text-indigo-400 light:text-purple-600"
    },
    {
      title: "Smart Notes Upload",
      desc: "Drag-and-drop notes in PDF or image format. SkillSync safely categorizes them by subject and creates interactive AI summaries and key takeaway grids.",
      icon: FileText,
      color: "from-pink-500 to-rose-500",
      accent: "text-pink-400 light:text-pink-600"
    },
    {
      title: "AI Roadmap Generator",
      desc: "Input your career milestone (e.g. Become MERN stack developer) and receive a week-by-week visual curriculum loaded with interactive study checklists.",
      icon: Map,
      color: "from-emerald-500 to-teal-500",
      accent: "text-emerald-400 light:text-emerald-600"
    },
    {
      title: "Student Dashboard Stats",
      desc: "Track total uploads, quiz average grades, and hourly study patterns cleanly in a central visual command center loaded with responsive Recharts metrics.",
      icon: LayoutDashboard,
      color: "from-amber-500 to-orange-500",
      accent: "text-amber-400 light:text-amber-600"
    },
    {
      title: "Streak & Badge Tracking",
      desc: "Keep daily learning habits alive with active streak counters, performance levels, and diagnostic milestone badge awards.",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      accent: "text-cyan-400 light:text-cyan-600"
    }
  ];

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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Core Capabilities</span>
          </div>
          
          <h1 className="font-serif italic font-light tracking-wide text-5xl sm:text-6xl text-white dark:text-white light:text-indigo-950 leading-tight">
            Comprehensive <span className="text-gradient font-sans font-extrabold uppercase tracking-tight not-italic">AI Utilities</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-550 max-w-xl font-light leading-relaxed">
            Every learning tool in SkillSync is engineered using high-speed Gemini LLM protocols, helping you summarize sheets, solve equations, and generate exams instantly.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <GlassCard 
                key={idx} 
                tilt={true}
                className={`hover:-translate-y-1 transition-all duration-300 border border-white/5 dark:border-white/5 light:border-zinc-200 hover:border-purple-500/30 dark:hover:border-purple-500/20 light:hover:border-indigo-500/30 shadow-md group relative overflow-hidden flex flex-col justify-between min-h-[260px] scroll-reveal stagger-${(idx % 3) + 1}`}
              >
                {/* Visual backdrops */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.08] blur-[25px] transition-opacity duration-500 pointer-events-none`} />

                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} text-white flex items-center justify-center shadow-md shadow-indigo-500/10`}>
                    <Icon className="w-6 h-6 transition-transform duration-500 group-hover:rotate-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 group-hover:text-purple-400 dark:group-hover:text-purple-300 light:group-hover:text-indigo-700 transition-colors">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 light:text-zinc-500 leading-relaxed font-light">{feature.desc}</p>
                </div>

                <button 
                  onClick={() => onNavigate('login')}
                  className="mt-6 pt-3 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex items-center justify-between text-[10px] font-bold text-purple-400 dark:text-purple-400 light:text-indigo-650"
                >
                  <span>ACCESS THIS TOOL</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </GlassCard>
            );
          })}
        </div>

        {/* Dynamic CTA Board */}
        <div className="w-full max-w-5xl mt-24 scroll-reveal">
          <div className="glass-panel rounded-3xl border border-white/10 dark:border-white/5 light:border-zinc-200 p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3.5xl font-extrabold text-white dark:text-white light:text-indigo-950 max-w-xl leading-tight">
              Ready to Activate your Academic Workspace?
            </h2>
            <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 light:text-zinc-550 max-w-md font-light leading-relaxed">
              Launch your secure, serverless dashboard to test your skills, summarize PDF chapters, and collaborate with your educators.
            </p>

            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-3.5 rounded-full bg-white text-black hover:bg-slate-100 font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Features;
