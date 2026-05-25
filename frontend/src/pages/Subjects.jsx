import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Atom, 
  FlaskConical, 
  Calculator, 
  Dna, 
  Terminal, 
  BookOpen, 
  PieChart, 
  Briefcase, 
  History, 
  Globe, 
  Award, 
  BookMarked,
  GraduationCap
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
 * SkillSync AI - Dedicated Academic Streams & Coursework Showcase Page
 */
const Subjects = ({ onNavigate }) => {

  // Streams lists
  const subjects = [
    {
      category: "Science Stream",
      list: [
        { name: "Physics", icon: Atom, desc: "Forces, quantum nodes, classical mechanics", color: "from-blue-500 to-indigo-500" },
        { name: "Chemistry", icon: FlaskConical, desc: "Atomic bonds, thermodynamics, catalyst kinetics", color: "from-teal-500 to-emerald-500" },
        { name: "Mathematics", icon: Calculator, desc: "Calculus, complex numbers, geometric nodes", color: "from-red-500 to-orange-500" },
        { name: "Biology", icon: Dna, desc: "Genetics, cellular structures, organic ecology", color: "from-green-500 to-teal-500" },
        { name: "Computer Science", icon: Terminal, desc: "Algorithms, database architectures, neural nets", color: "from-purple-500 to-pink-500" },
      ]
    },
    {
      category: "Commerce & Finance Stream",
      list: [
        { name: "Accountancy", icon: BookOpen, desc: "Corporate ledgers, auditing, balance dynamics", color: "from-cyan-500 to-blue-500" },
        { name: "Economics", icon: PieChart, desc: "Market equilibrium, macro & micro models", color: "from-emerald-500 to-teal-500" },
        { name: "Business Studies", icon: Briefcase, desc: "Corporate management, trade flow analytics", color: "from-amber-500 to-orange-500" },
      ]
    },
    {
      category: "Arts & Humanities Stream",
      list: [
        { name: "History", icon: History, desc: "Ancient timelines, revolutions, civil milestones", color: "from-yellow-600 to-amber-500" },
        { name: "Geography", icon: Globe, desc: "Climate indices, cartography, geological layers", color: "from-sky-500 to-blue-600" },
        { name: "Political Science", icon: Award, desc: "State theories, governance models, constitutions", color: "from-violet-500 to-purple-600" },
        { name: "English Literature", icon: BookMarked, desc: "Phonetics, linguistics, comparative prose", color: "from-pink-500 to-rose-500" },
      ]
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
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Syllabus coverage</span>
          </div>
          
          <h1 className="font-serif italic font-light tracking-wide text-5xl sm:text-6xl text-white dark:text-white light:text-indigo-950 leading-tight">
            Academic <span className="text-gradient font-sans font-extrabold uppercase tracking-tight not-italic">Streams & Channels</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-555 max-w-xl font-light leading-relaxed">
            Select standard high school or college courses. SkillSync handles notes, summaries, and quizzes inside each subject automatically!
          </p>
        </div>

        {/* Subjects streams breakdown */}
        <div className="space-y-20 w-full">
          {subjects.map((stream, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              
              {/* Category Subheading */}
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-8 bg-purple-500/50" />
                <h3 className="text-xl font-bold tracking-tight text-gradient">{stream.category}</h3>
              </div>

              {/* Stream subject card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {stream.list.map((sub, sIdx) => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => onNavigate('login')}
                      className="text-left w-full block focus:outline-none"
                    >
                      <GlassCard 
                        className="hover:-translate-y-1 transition-all duration-300 border border-white/5 dark:border-white/5 light:border-zinc-200 hover:border-purple-500/25 dark:hover:border-purple-500/15 light:hover:border-indigo-500/20 flex flex-col justify-between min-h-[170px] group w-full h-full"
                      >
                        <div className="flex justify-between items-start">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shadow-md`}>
                            <Icon className="w-5.5 h-5.5" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-white dark:text-white light:text-indigo-900 group-hover:text-purple-400 dark:group-hover:text-purple-300 light:group-hover:text-indigo-700 transition-colors">{sub.name}</h4>
                          <p className="text-[11px] text-slate-450 dark:text-slate-400 light:text-zinc-500 mt-1 leading-relaxed font-light">{sub.desc}</p>
                        </div>
                      </GlassCard>
                    </button>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Small Bottom Info Box */}
        <GlassCard className="mt-20 p-6 border border-white/5 dark:border-white/5 light:border-zinc-200 w-full max-w-4xl text-center bg-white/2 dark:bg-white/1 light:bg-indigo-50/20">
          <p className="text-xs text-slate-450 dark:text-slate-400 light:text-zinc-550 leading-relaxed font-light">
            💡 **Hackathon Demo Tip**: Simply click any of the subject streams above to fast-track your signup, pick your role (Student or Instructor), and auto-seed your demo analytics workspace with mock data parameters.
          </p>
        </GlassCard>

      </div>
    </div>
  );
};

export default Subjects;
