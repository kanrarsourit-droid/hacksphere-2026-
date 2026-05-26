import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  MessageSquareCode, 
  Map, 
  User, 
  Megaphone, 
  Users, 
  Sparkles, 
  Send, 
  Trash2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Activity
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
  * SkillSync AI - Portal Home Hub Console
  */
const PortalHome = ({ activeUser, onTabChange }) => {
  const isTeacher = activeUser?.role === 'teacher';

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const [annCategory, setAnnCategory] = useState("General");

  // Load announcements & check unread status
  useEffect(() => {
    const saved = localStorage.getItem('skillsync_announcements');
    let loadedAnnouncements = [];
    if (saved) {
      loadedAnnouncements = JSON.parse(saved);
      setAnnouncements(loadedAnnouncements);
    } else {
      // Seed default announcement
      const seed = [
        {
          id: 'seed-1',
          text: "Welcome scholars to the SkillSync platform! Explore study timelines, doubt solvers, and mock quizzes.",
          author: "Admin Portal",
          category: "General",
          date: new Date().toLocaleDateString()
        }
      ];
      localStorage.setItem('skillsync_announcements', JSON.stringify(seed));
      setAnnouncements(seed);
      loadedAnnouncements = seed;
    }

    // Unread notice check (Student only!)
    const isTeacherRole = activeUser?.role === 'teacher';
    if (!isTeacherRole && loadedAnnouncements.length > 0) {
      const lastSeen = localStorage.getItem('skillsync_last_seen_notice') || "";
      const latestId = loadedAnnouncements[0].id;
      if (lastSeen !== latestId) {
        setHasNewNotice(true);
      }
    }
  }, [activeUser]);

  const markNoticesAsRead = () => {
    if (announcements.length > 0) {
      localStorage.setItem('skillsync_last_seen_notice', announcements[0].id);
      setHasNewNotice(false);
    }
  };

  // Post Announcement (Teacher only!)
  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    setBroadcasting(true);
    const added = {
      id: `ann-${Date.now()}`,
      text: newAnnouncement,
      author: activeUser?.displayName || "Class Teacher",
      category: annCategory,
      date: new Date().toLocaleDateString()
    };

    const updated = [added, ...announcements];
    localStorage.setItem('skillsync_announcements', JSON.stringify(updated));
    setAnnouncements(updated);
    setNewAnnouncement("");
    
    setTimeout(() => {
      setBroadcasting(false);
    }, 800);
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id) => {
    const updated = announcements.filter(ann => ann.id !== id);
    localStorage.setItem('skillsync_announcements', JSON.stringify(updated));
    setAnnouncements(updated);
  };

  // Mock Student Roster (for Teacher's extra features!)
  const studentRoster = [
    { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", streak: "12 days", avgQuiz: "88%", notesUploaded: 14, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aarav" },
    { name: "Ananya Iyer", email: "ananya.iyer@gmail.com", streak: "8 days", avgQuiz: "94%", notesUploaded: 9, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ananya" },
    { name: "Kabir Mehta", email: "kabir.mehta@gmail.com", streak: "2 days", avgQuiz: "76%", notesUploaded: 5, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kabir" },
    { name: "Diya Roy", email: "diya.roy@gmail.com", streak: "22 days", avgQuiz: "91%", notesUploaded: 18, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Diya" },
    { name: "Rohan Das", email: "rohan.das@gmail.com", streak: "0 days", avgQuiz: "N/A", notesUploaded: 1, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Rohan" }
  ];

  // Core visual navigation cards grid
  const hubs = isTeacher 
    ? [
        {
          id: 'dashboard',
          title: "Teacher Console",
          desc: "Analyze class averages, engagement graphs, and daily stream coverages.",
          icon: LayoutDashboard,
          color: "from-indigo-500 to-purple-500",
          tag: "Metrics"
        },
        {
          id: 'notes',
          title: "Curriculum Studio",
          desc: "Upload reference notes, course PDFs, and syllabus sheets for students.",
          icon: FileText,
          color: "from-purple-500 to-pink-500",
          tag: "Upload Studio"
        },
        {
          id: 'profile',
          title: "Teacher Profile Settings",
          desc: "Manage your faculty profile information, credential tags, and active streams.",
          icon: User,
          color: "from-pink-500 to-orange-500",
          tag: "Manage"
        }
      ]
    : [
        {
          id: 'dashboard',
          title: "Workspace Analytics",
          desc: "Review your custom study stats, average quiz levels, and hourly patterns.",
          icon: LayoutDashboard,
          color: "from-indigo-500 to-purple-500",
          tag: "Study Stats"
        },
        {
          id: 'notes',
          title: "Classroom Study Library",
          desc: "Open curriculum documents shared by teachers and run Gemini summaries.",
          icon: FileText,
          color: "from-purple-500 to-indigo-500",
          tag: "Notes Library"
        },
        {
          id: 'quiz',
          title: "AI Quiz Studio",
          desc: "Generate structured, mock exams and flash cards with Gemini 1.5 Flash.",
          icon: BrainCircuit,
          color: "from-pink-500 to-purple-500",
          tag: "Practice Tests"
        },
        {
          id: 'chatbot',
          title: "AI Doubt Solver",
          desc: "Ask any academic doubt and solve complex textbook formulas in real-time.",
          icon: MessageSquareCode,
          color: "from-orange-500 to-pink-500",
          tag: "Instant Solver"
        },
        {
          id: 'roadmap',
          title: "Syllabus Chronological Roadmaps",
          desc: "Formulate step-by-step milestones to complete course timelines on time.",
          icon: Map,
          color: "from-emerald-500 to-indigo-500",
          tag: "Timeline Planners"
        },
        {
          id: 'profile',
          title: "Scholar Profile Achievements",
          desc: "Unlock custom badges, academic grades, and review diagnostic charts.",
          icon: User,
          color: "from-cyan-500 to-purple-500",
          tag: "Scholar Card"
        }
      ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* ==========================================
          1. GORGEOUS GRADIENT ANNOUNCEMENT BROADCASTER (Student Marquee vs Teacher Form)
          ========================================== */}
      {announcements.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 dark:from-indigo-600/15 dark:to-pink-500/5 light:from-indigo-50/80 light:to-pink-50/80 border border-purple-500/20 dark:border-purple-500/20 light:border-indigo-200/60 p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/5 blur-[50px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 dark:text-purple-400 light:text-indigo-600 flex items-center justify-center shadow-inner">
                <Megaphone className="w-4.5 h-4.5 text-purple-400 dark:text-purple-400 light:text-indigo-650 animate-bounce" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 dark:text-purple-400 light:text-indigo-700">Class Broadcast Ticker</h4>
                <p className="text-[9px] text-slate-500 font-medium">Updated by Faculty</p>
              </div>
            </div>

            {/* Marquee Scroller */}
            <div className="flex-1 w-full overflow-hidden bg-black/10 dark:bg-black/20 light:bg-white/60 backdrop-blur-sm rounded-xl py-2 px-4 border border-white/5 dark:border-white/5 light:border-zinc-200 text-xs text-slate-355 dark:text-slate-300 light:text-zinc-700 italic">
              <div className="overflow-x-hidden relative w-full h-5">
                <div className="absolute flex gap-8 animate-marquee whitespace-nowrap">
                  {announcements.map((ann) => (
                    <span key={ann.id} className="inline-flex items-center gap-2 shrink-0 pr-8 text-slate-200 dark:text-slate-300 light:text-indigo-950 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      <strong>{ann.author}:</strong> "{ann.text}" <span className="text-[10px] text-slate-500">({ann.date})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. HERO GREETING BANNER WITH RICH FLOATING GLOWS
          ========================================== */}
      <GlassCard className="p-8 border border-white/5 bg-gradient-to-r from-space-850 to-transparent dark:from-space-850 light:from-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Animated backgrounds */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-purple-500/10 blur-[50px] pointer-events-none animate-float-slow" />

        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/10 light:bg-indigo-50 border border-purple-500/20 text-xs font-bold text-purple-400 dark:text-purple-400 light:text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Welcome to SkillSync AI Hub</span>
          </div>

          <h1 className="text-3.5xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950 leading-tight">
            Welcome back, {isTeacher ? "Professor" : ""} <span className="text-gradient">{activeUser?.displayName || (isTeacher ? "Educator" : "Student")}</span> {isTeacher ? "👨‍🏫" : "👋"}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 max-w-lg leading-relaxed">
            {isTeacher 
              ? "Welcome to your Faculty Administration Portal. Publish study notes, broadcast exam schedules, and monitor student academic performance streaks from your hub."
              : "Welcome to your personal Study Hub. Upload notes, resolve homework equations, generate practice quizzes, and monitor your hourly averages below!"
            }
          </p>
        </div>

        {/* Floating statistics preview block */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-zinc-200 bg-white/5 dark:bg-white/5 light:bg-indigo-50/30 flex items-center gap-4 shrink-0 shadow-lg min-w-[200px] animate-float-medium">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-widest">Portal System Status</h4>
            <p className="text-lg font-black text-emerald-400 mt-0.5 animate-pulse">Online & Sync'd</p>
            <span className="text-[9px] text-slate-500 dark:text-slate-550 light:text-zinc-400 font-medium">{isTeacher ? "Staff Privileges Active" : "Streak System Locked"}</span>
          </div>
        </div>
      </GlassCard>

      {/* ==========================================
          3. PREMIUM INTERACTIVE NAV TILES GRID
          ========================================== */}
      <div>
        <h2 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 border-b border-white/5 dark:border-white/5 light:border-zinc-200/85 pb-3 mb-6 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-400" />
          Jump Into Core Workspaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hubs.map((hub, hIdx) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.id}
                onClick={() => onTabChange(hub.id)}
                className="group text-left w-full block focus:outline-none"
              >
                <GlassCard className="p-6 h-full border border-white/5 dark:border-white/5 light:border-zinc-200 hover:border-purple-500/40 dark:hover:border-purple-500/30 light:hover:border-indigo-500/40 bg-white/3 dark:bg-white/3 light:bg-white hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-indigo-50/30 rounded-2xl flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm relative overflow-hidden group min-h-[200px]">
                  
                  {/* Decorative glowing backdrops */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${hub.color} opacity-0 group-hover:opacity-10 blur-[30px] transition-opacity duration-500 pointer-events-none`} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${hub.color} text-white flex items-center justify-center shadow-md shadow-purple-500/10`}>
                        <Icon className="w-6 h-6 transition-transform duration-500 group-hover:rotate-6" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 dark:border-white/5 light:border-zinc-200 text-slate-400 dark:text-slate-400 light:text-indigo-700">
                        {hub.tag}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950 group-hover:text-purple-400 dark:group-hover:text-purple-400 light:group-hover:text-indigo-700 transition-colors">
                        {hub.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 leading-relaxed">
                        {hub.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex items-center justify-between text-[10px] font-bold text-purple-400 dark:text-purple-400 light:text-indigo-600">
                    <span>LAUNCH CONSOLE</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>

                </GlassCard>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          4. EXTRA FACILITIES FOR TEACHERS (Student Roster & Announcement Publisher)
          ========================================== */}
      {isTeacher && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* TEACHER ANNOUNCEMENT BROADCAST CONSOLE */}
          <div className="xl:col-span-1">
            <GlassCard className="p-6 border border-white/5 dark:border-white/5 light:border-zinc-200 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white dark:text-white light:text-indigo-950 mb-1.5 flex items-center gap-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2">
                  <Megaphone className="w-4.5 h-4.5 text-purple-400" />
                  Publish Classroom Broadcast
                </h3>
                <p className="text-xs text-slate-500 leading-normal mb-4">
                  Broadcast exam schedules, homework updates, or notices directly onto all active student workspace tickers.
                </p>

                 <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Notice Category</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-[11px] bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 text-white dark:text-white light:text-indigo-950 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="General">📢 General Update</option>
                      <option value="Exam">⏰ Exam Timeline</option>
                      <option value="Homework">📘 Homework Schedule</option>
                      <option value="Lab">🧪 Lab/Practical Work</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5 font-medium">Notice Description</label>
                    <textarea
                      required
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Type your notice here... e.g. Electromagnetism worksheets uploaded! Quiz scheduled this Friday."
                      className="w-full h-24 p-3 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold shadow-md shadow-purple-500/10 hover:scale-[1.01]"
                  >
                    {broadcasting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish Class Notice</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Delete previous notices */}
              {announcements.length > 0 && (
                <div className="mt-6 space-y-2 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 pt-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Active Broadcasters</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex items-center justify-between gap-2 p-2 bg-white/2 dark:bg-white/2 light:bg-indigo-50/30 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-lg text-[10px]">
                        <span className="truncate text-slate-300 dark:text-slate-300 light:text-zinc-800" title={ann.text}>"{ann.text}"</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-red-400 hover:text-red-300 shrink-0 p-1 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* STUDENT PERFORMANCE ROSTER TABLE */}
          <div className="xl:col-span-2">
            <GlassCard className="p-6 border border-white/5 dark:border-white/5 light:border-zinc-200">
              <h3 className="text-sm font-extrabold text-white dark:text-white light:text-indigo-950 mb-1.5 flex items-center gap-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2">
                <Users className="w-4.5 h-4.5 text-indigo-400" />
                Active Class Scholar Roster
              </h3>
              <p className="text-xs text-slate-500 leading-normal mb-5">
                Monitor student attendance patterns, quiz completion rates, and curriculum notes uploaded in your streams.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 dark:border-white/5 light:border-zinc-200/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="pb-3 pl-2">Scholar Name</th>
                      <th className="pb-3">Academic Email</th>
                      <th className="pb-3 text-center">Active Streak</th>
                      <th className="pb-3 text-center">Avg Quiz Grade</th>
                      <th className="pb-3 text-center">Files Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 dark:divide-white/3 light:divide-zinc-200/50">
                    {studentRoster.map((student, sIdx) => (
                      <tr key={sIdx} className="hover:bg-white/2 dark:hover:bg-white/1 light:hover:bg-indigo-50/20 transition-colors">
                        <td className="py-3 pl-2 flex items-center gap-2.5">
                          <img src={student.avatar} alt="avatar" className="w-7 h-7 rounded-full border border-purple-500/10 bg-white/10 dark:bg-white/5 light:bg-indigo-50 p-0.5 shrink-0" />
                          <span className="font-semibold text-white dark:text-white light:text-indigo-900">{student.name}</span>
                        </td>
                        <td className="py-3 text-slate-400 dark:text-slate-400 light:text-zinc-600 font-mono text-[10px]">{student.email}</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 dark:text-orange-400 light:text-orange-600 font-bold text-[10px] border border-orange-500/15">
                            {student.streak}
                          </span>
                        </td>
                        <td className="py-3 text-center font-bold text-emerald-400 dark:text-emerald-400 light:text-emerald-600">{student.avgQuiz}</td>
                        <td className="py-3 text-center text-slate-350 dark:text-slate-300 light:text-zinc-800 font-semibold">{student.notesUploaded} files</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {!isTeacher && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* STUDENT DEDICATED CLASS ANNOUNCEMENT BOARD */}
          <div className="xl:col-span-2">
            <GlassCard className="p-6 border border-white/5 dark:border-white/5 light:border-zinc-200 relative min-h-[350px] flex flex-col justify-between">
              
              {/* Pointing attention finger cursor if there are new unread notices! */}
              {hasNewNotice && (
                <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-400 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>👉 New Notice Posted!</span>
                </div>
              )}

              <div>
                <h3 className="text-sm font-extrabold text-white dark:text-white light:text-indigo-950 mb-1.5 flex items-center gap-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2">
                  <Megaphone className="w-4.5 h-4.5 text-purple-400" />
                  Classroom Notice Board
                  {hasNewNotice && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-pink-500 text-white animate-pulse">
                      NEW BROADCAST
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 leading-normal mb-5">
                  Stay updated with official exam timetables, homework releases, and important reminders published by your Faculty.
                </p>

                {announcements.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center gap-2 bg-white/2 dark:bg-white/1 light:bg-indigo-50/20 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-2xl">
                    <span className="text-2xl">📭</span>
                    <h4 className="text-xs font-bold text-slate-400">Notice Board is empty</h4>
                    <p className="text-[10px] text-slate-500">There are currently no active announcements published by your teachers.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        className="p-4 rounded-xl bg-white/3 dark:bg-white/2 light:bg-indigo-50/30 border border-white/10 dark:border-white/5 light:border-zinc-200 hover:border-purple-500/30 transition-all flex items-start gap-3 relative group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-xs text-white dark:text-white light:text-indigo-950 font-bold">{ann.author}</strong>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{ann.date}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-350 dark:text-slate-300 light:text-zinc-700 leading-relaxed mt-1.5 whitespace-pre-wrap">
                            {ann.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasNewNotice && (
                <div className="mt-6 pt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex justify-end">
                  <button
                    type="button"
                    onClick={markNoticesAsRead}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-[10px] font-bold text-white transition-colors cursor-pointer"
                  >
                    ✓ Mark all as Read
                  </button>
                </div>
              )}

            </GlassCard>
          </div>

          {/* DEDICATED SIDEBAR: ACADEMIC MOTIVATION CARD */}
          <div className="xl:col-span-1">
            <GlassCard className="p-6 border border-white/5 dark:border-white/5 light:border-zinc-200 h-full flex flex-col justify-between min-h-[350px] relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none" />
              
              <div>
                <h3 className="text-sm font-extrabold text-white dark:text-white light:text-indigo-950 mb-1.5 flex items-center gap-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2">
                  <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
                  Weekly Scholar Tips
                </h3>
                <p className="text-xs text-slate-500 leading-normal mb-4">
                  Boost your study retention and optimize exam scores using standard learning techniques built directly into SkillSync:
                </p>

                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-white/2 dark:bg-white/2 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                    🎓 **Active Recall**: Test your memory boundaries using **AI Quiz generator** rather than just rereading notes!
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/2 dark:bg-white/2 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                    ⏰ **Feynman Method**: Explain complex queries simply in **Doubt Solver Chatbot** to find syllabus learning gaps instantly!
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-semibold text-center text-slate-500">
                ⚡ Powered by SkillSync AI Engine
              </div>
            </GlassCard>
          </div>

        </div>
      )}

    </div>
  );
};

export default PortalHome;
