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
  BookMarked
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
 * SkillSync AI - Interactive Landing Page
 */
const Home = ({ onNavigate }) => {

  // List of subject definitions with icons and specific colors
  const subjects = [
    {
      category: "Science",
      list: [
        { name: "Physics", icon: Atom, desc: "Forces, relativity, mechanics", color: "from-blue-500 to-indigo-500" },
        { name: "Chemistry", icon: FlaskConical, desc: "Atoms, bonding, thermodynamics", color: "from-teal-500 to-emerald-500" },
        { name: "Mathematics", icon: Calculator, desc: "Calculus, algebra, geometry", color: "from-red-500 to-orange-500" },
        { name: "Biology", icon: Dna, desc: "Genetics, ecology, human anatomy", color: "from-green-500 to-teal-500" },
        { name: "Computer Science", icon: Terminal, desc: "Algorithms, programming, systems", color: "from-purple-500 to-pink-500" },
      ]
    },
    {
      category: "Commerce",
      list: [
        { name: "Accountancy", icon: BookOpen, desc: "Financial balance, audits", color: "from-cyan-500 to-blue-500" },
        { name: "Economics", icon: PieChart, desc: "Macro & micro market analysis", color: "from-emerald-500 to-teal-500" },
        { name: "Business Studies", icon: Briefcase, desc: "Management, commerce dynamics", color: "from-amber-500 to-orange-500" },
      ]
    },
    {
      category: "Arts & Humanities",
      list: [
        { name: "History", icon: History, desc: "Global civilizations, milestones", color: "from-yellow-600 to-amber-500" },
        { name: "Geography", icon: Globe, desc: "Landforms, cartography, climate", color: "from-sky-500 to-blue-600" },
        { name: "Political Science", icon: Award, desc: "Governance, comparative politics", color: "from-violet-500 to-purple-600" },
        { name: "English Literature", icon: BookMarked, desc: "Prose, poetry, linguistics", color: "from-pink-500 to-rose-500" },
      ]
    }
  ];

  // List of website features
  const features = [
    {
      title: "AI Quiz Generator",
      desc: "Instantly create customized MCQs, True/False, and short-answer exams from your uploaded documents to drill your memory.",
      icon: BrainCircuit,
      color: "text-purple-400 light:text-indigo-600"
    },
    {
      title: "AI Doubt Solver Chatbot",
      desc: "Ask your AI study mentor programming bugs, complex math derivations, or essays. Get conversational structured explanations 24/7.",
      icon: MessageSquareCode,
      color: "text-indigo-400 light:text-purple-600"
    },
    {
      title: "Smart Notes Upload",
      desc: "Drag-and-drop notes in PDF or image format. SkillSync safely categorizes them by subject and creates interactive AI summaries.",
      icon: FileText,
      color: "text-pink-400 light:text-pink-600"
    },
    {
      title: "AI Roadmap Generator",
      desc: "Input your career milestone (e.g. Become MERN stack developer) and receive a week-by-week visual curriculum loaded with study checklists.",
      icon: Map,
      color: "text-emerald-400 light:text-emerald-600"
    },
    {
      title: "Student Dashboard",
      desc: "Track total uploads, quiz average grades, and study patterns cleanly in a central visual command center.",
      icon: LayoutDashboard,
      color: "text-amber-400 light:text-amber-600"
    },
    {
      title: "Progress Tracking",
      desc: "Beautiful charts plotting weekly study metrics, subject mastery levels, and visual achievements badges to keep streaks active.",
      icon: TrendingUp,
      color: "text-cyan-400 light:text-cyan-600"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-20">
      
      {/* BACKGROUND FLOATING NEON BLOBS */}
      <div className="neon-blob w-96 h-96 bg-purple-600 top-20 -left-20 animate-float-slow" />
      <div className="neon-blob w-[400px] h-[400px] bg-indigo-600 top-1/3 -right-20 animate-float-medium" style={{ animationDelay: '2s' }} />
      <div className="neon-blob w-80 h-80 bg-pink-600 bottom-10 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />

      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-20 flex flex-col md:flex-row items-center justify-between gap-12 z-10">
        
        {/* Left text column */}
        <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
          
          {/* Futuristic Sparkle Tagline */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-purple-500/20 px-4.5 py-1.5 rounded-full w-fit mx-auto md:mx-0 animate-glow-border">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-indigo-900 tracking-wide uppercase">Next-Gen Personalized Education</span>
          </div>

          {/* Large Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950 leading-tight">
            Learn Smarter <br />
            with <span className="text-gradient">SkillSync AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-zinc-600 max-w-lg leading-relaxed">
            Upload notes, generate dynamic interactive quizzes, construct custom career roadmaps, and solve academic doubts instantly with your personalized study mentor.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center md:justify-start">
            <button
              onClick={() => onNavigate('login')}
              className="btn-neon w-full sm:w-auto flex items-center justify-center gap-2 shadow-purple-500/10 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href="#features"
              className="btn-neon-secondary w-full sm:w-auto text-center"
            >
              Explore Features
            </a>
          </div>

          {/* Interactive Stat badge */}
          <div className="flex items-center gap-6 mt-6 justify-center md:justify-start text-xs text-slate-500 dark:text-slate-500 light:text-zinc-500">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white dark:text-white light:text-indigo-900">99.8%</span>
              <span>Gemini AI Accuracy</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10 dark:bg-white/10 light:bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white dark:text-white light:text-indigo-900">Instant</span>
              <span>Quiz & Summary Grids</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10 dark:bg-white/10 light:bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white dark:text-white light:text-indigo-900">Free</span>
              <span>Open-Source for Students</span>
            </div>
          </div>

        </div>

        {/* Right high-tech card visual container */}
        <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center items-center">
          <div className="relative w-full max-w-[420px] aspect-square animate-float-slow">
            
            {/* Floating visual card panels */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/5 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl" />
            
            {/* Overlay Glass Card 1 (Quiz stats representation) */}
            <GlassCard className="absolute top-8 -left-8 w-56 p-4 shadow-xl border border-purple-500/20 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white dark:text-white light:text-indigo-900">Physics MCQ Quiz</h4>
                  <p className="text-[10px] text-slate-500">Solved: 5/5 | Grade: A</p>
                </div>
              </div>
              <div className="w-full bg-white/5 dark:bg-white/5 light:bg-indigo-50 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-purple-500 h-full w-[100%]" />
              </div>
            </GlassCard>

            {/* Overlay Glass Card 2 (Roadmap tracker representation) */}
            <GlassCard className="absolute bottom-10 -right-8 w-60 p-4 shadow-xl border border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white dark:text-white light:text-indigo-900">MERN Developer Path</h4>
                  <p className="text-[10px] text-slate-500">Progress: Week 3 of 12</p>
                </div>
              </div>
              <div className="w-full bg-white/5 dark:bg-white/5 light:bg-indigo-50 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[25%]" />
              </div>
            </GlassCard>

            {/* Main Interactive Uploader Mock Glass Panel */}
            <GlassCard className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 p-5 border border-pink-500/20 bg-space-950/70 shadow-2xl flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md animate-pulse-glow mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-white dark:text-white light:text-indigo-900 text-center">Interactive Study Mentor</span>
              <p className="text-[10px] text-slate-500 text-center mt-1">Upload note, get instantaneous AI summary and full textbook review notes.</p>
              
              <button 
                onClick={() => onNavigate('login')}
                className="mt-4 px-4 py-1.5 bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 hover:border-purple-500/50 text-[10px] font-semibold rounded-lg text-slate-300 dark:text-slate-300 light:text-indigo-900 transition-colors w-full text-center"
              >
                Launch App Console
              </button>
            </GlassCard>

          </div>
        </div>

      </section>

      {/* ==========================================
          2. FEATURES SECTION
          ========================================== */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5 dark:border-t-white/5 light:border-t-zinc-200/50">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold tracking-widest text-purple-400 dark:text-purple-400 light:text-indigo-600 uppercase">Features & Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-indigo-950">
            Powered by High-Speed Gemini AI
          </h2>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-600">
            Discover a comprehensive suite of AI study capabilities specifically customized to streamline learning retention.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <GlassCard 
                key={idx} 
                className="hover:-translate-y-1 transition-transform border border-white/5 hover:border-purple-500/30"
              >
                <div className={`w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center ${feature.color} mb-5 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-600 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            );
          })}
        </div>

      </section>

      {/* ==========================================
          3. SUBJECTS SECTION
          ========================================== */}
      <section id="subjects" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5 dark:border-t-white/5 light:border-t-zinc-200/50">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold tracking-widest text-purple-400 dark:text-purple-400 light:text-indigo-600 uppercase">Interactive Coursework</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-indigo-950">
            Select Your Academic Stream
          </h2>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-zinc-600">
            Select standard high school or college courses. SkillSync handles notes, summaries, and roadmaps inside each subject automatically!
          </p>
        </div>

        {/* Subjects streams breakdown */}
        <div className="space-y-16">
          {subjects.map((stream, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              
              {/* Category Subheading */}
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-8 bg-purple-500/50" />
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gradient">{stream.category}</h3>
              </div>

              {/* Stream subject card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {stream.list.map((sub, sIdx) => {
                  const Icon = sub.icon;
                  return (
                    <GlassCard 
                      key={sIdx} 
                      onClick={() => onNavigate('login')}
                      className="hover:-translate-y-1 transition-transform border border-white/5 hover:border-purple-500/25 flex flex-col justify-between min-h-[160px] group"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shadow-md`}>
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-white dark:text-white light:text-indigo-900 group-hover:text-purple-400 transition-colors">{sub.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1 leading-relaxed">{sub.desc}</p>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ==========================================
          4. HACKATHON CTA
          ========================================== */}
      <section className="relative max-w-5xl mx-auto px-6 py-20 z-10">
        
        {/* Glowing glass panel */}
        <div className="glass-panel rounded-3xl border border-white/10 dark:border-white/5 light:border-zinc-200/50 p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 text-center flex flex-col items-center gap-6 shadow-2xl">
          
          {/* Glow center */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-indigo-950 max-w-xl leading-tight">
            Ready to Supercharge Your Academic Journey?
          </h2>
          
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-600 max-w-md">
            Create your account today and unlock instantaneous notes summarizing, doubt solving, and structured roadmap charting. It takes less than a minute.
          </p>

          <button
            onClick={() => onNavigate('login')}
            className="btn-neon flex items-center gap-2 group mt-2"
          >
            Create Your Free Account
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

        </div>

      </section>

    </div>
  );
};

export default Home;
