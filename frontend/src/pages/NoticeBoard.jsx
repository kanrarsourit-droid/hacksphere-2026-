import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Send, 
  Calendar, 
  Bookmark, 
  Sparkles, 
  Tag, 
  Bell, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

/**
 * SkillSync AI - Interactive Gen-Z Classroom Notice Board Page
 */
const NoticeBoard = ({ activeUser, onQuizFinished }) => {
  const isTeacher = activeUser?.role === 'teacher';

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [annCategory, setAnnCategory] = useState("General"); // General, Exam, Homework, Lab
  const [broadcasting, setBroadcasting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    { label: "All Notices", value: "All" },
    { label: "📢 General", value: "General" },
    { label: "⏰ Exams", value: "Exam" },
    { label: "📘 Homework", value: "Homework" },
    { label: "🧪 Lab Activities", value: "Lab" }
  ];

  // Load announcements & auto-mark as read for students
  useEffect(() => {
    const loadNotices = () => {
      const saved = localStorage.getItem('skillsync_announcements');
      let loaded = [];
      if (saved) {
        loaded = JSON.parse(saved);
        setAnnouncements(loaded);
      } else {
        const seed = [
          {
            id: 'seed-1',
            text: "Welcome scholars to the SyncVerse platform! Explore study timelines, doubt solvers, and mock quizzes.",
            author: "Admin Portal",
            category: "General",
            date: new Date().toLocaleDateString()
          }
        ];
        localStorage.setItem('skillsync_announcements', JSON.stringify(seed));
        setAnnouncements(seed);
        loaded = seed;
      }

      // If student loads this page, immediately mark notices as read!
      if (!isTeacher && loaded.length > 0) {
        localStorage.setItem('skillsync_last_seen_notice', loaded[0].id);
        // Dispatch custom event to update sidebar in real-time
        window.dispatchEvent(new Event('skillsync_notices_read'));
      }
    };

    loadNotices();
  }, [isTeacher]);

  // Post Notice
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
    }, 700);
  };

  // Delete Notice
  const handleDeleteAnnouncement = (id) => {
    if (!window.confirm("Are you sure you want to delete this notice forever?")) return;
    const updated = announcements.filter(ann => ann.id !== id);
    localStorage.setItem('skillsync_announcements', JSON.stringify(updated));
    setAnnouncements(updated);
  };

  // Filtered List
  const filteredAnnouncements = announcements.filter(ann => {
    if (activeFilter === "All") return true;
    return ann.category === activeFilter;
  });

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Exam':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Homework':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Lab':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. HEADER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950 flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-purple-500 animate-pulse" />
            Classroom Broadcast Board
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            {isTeacher 
              ? "Publish important syllabus notices, assignments, and exam schedules to the scholar roster."
              : "Review live academic timelines, assignments, and reminders posted by your educator."
            }
          </p>
        </div>

        {/* Dynamic Gen-Z Live Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 shadow-md shadow-purple-500/5 shrink-0 self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-extrabold text-slate-200 dark:text-slate-350 light:text-indigo-900 tracking-wider uppercase">Live Feed active</span>
        </div>
      </div>

      {/* 2. CATEGORY HORIZONTAL FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-1 scrollbar-thin">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 ${
              activeFilter === cat.value
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/15'
                : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-400 hover:border-purple-500/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. CORE VIEWPORT CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE BROADCAST LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 pl-1">
            Active Classroom Feeds ({filteredAnnouncements.length})
          </h2>

          {filteredAnnouncements.length === 0 ? (
            <GlassCard className="p-12 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-4xl animate-bounce">📭</span>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-indigo-950">No notifications found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                There are currently no active announcements matching the selected category. Take a study break!
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((ann) => (
                <GlassCard 
                  key={ann.id} 
                  className="p-5 border border-white/5 bg-gradient-to-r from-space-850 to-transparent hover:border-purple-500/30 hover:scale-[1.01] transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 blur-[30px] pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5 mb-3.5">
                    
                    {/* Header tags */}
                    <div className="flex items-center gap-2">
                      <div className="w-8.5 h-8.5 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white dark:text-white light:text-indigo-950 block">{ann.author}</strong>
                        <span className="text-[9px] text-slate-500 dark:text-slate-500 light:text-zinc-500">Instructor Account</span>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getCategoryStyles(ann.category)}`}>
                        {ann.category}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{ann.date}</span>
                      </div>
                    </div>

                  </div>

                  {/* Announcement body */}
                  <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium pl-1">
                    {ann.text}
                  </p>

                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PUBLISHING/STATS SIDEBAR */}
        <div className="lg:col-span-1">
          {isTeacher ? (
            /* TEACHER BROADCAST UPLOAD BOX */
            <GlassCard className="p-6 border border-white/5 sticky top-6">
              <h3 className="text-base font-extrabold text-white dark:text-white light:text-indigo-950 mb-1.5 flex items-center gap-2 border-b border-white/5 pb-2.5">
                <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                Publish Live Notice
              </h3>
              <p className="text-xs text-slate-550 leading-normal mb-5">
                Announce exam dates, upload links, or syllabus reminders. Students will be alerted instantly in their sidebar!
              </p>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                
                {/* 1. Category selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 pl-1">Notice Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="General">📢 General Update</option>
                    <option value="Exam">⏰ Exam Timeline</option>
                    <option value="Homework">📘 Homework Schedule</option>
                    <option value="Lab">🧪 Lab/Practical Work</option>
                  </select>
                </div>

                {/* 2. Text Area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 pl-1">Message Description</label>
                  <textarea
                    required
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Type notice details..."
                    rows={4}
                    className="w-full p-3 rounded-xl text-xs bg-space-900/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold"
                >
                  {broadcasting ? (
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish Broadcast</span>
                    </>
                  )}
                </button>

              </form>

              {/* ACTIVE NOTICE DELETION COMPONENT */}
              {announcements.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-5 space-y-3">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pl-0.5">
                    Delete Shared Notices
                  </h4>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex items-center justify-between gap-3 p-2 bg-white/2 border border-white/5 rounded-lg text-[10px]">
                        <span className="truncate text-slate-300 font-semibold" title={ann.text}>
                          [{ann.category}] "{ann.text}"
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-red-400 hover:text-red-300 shrink-0 p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
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
          ) : (
            /* STUDENT SCHOLAR NOTIFICATION OVERVIEW */
            <GlassCard className="p-6 border border-white/5 sticky top-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 animate-swing" />
              </div>
              
              <div>
                <h3 className="text-sm font-extrabold text-white dark:text-white light:text-indigo-950">Notice Inbox Status</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  You are completely up to date with your classroom broadcast timelines. Good job!
                </p>
              </div>

              <div className="p-4 bg-white/2 rounded-xl border border-white/5 text-[11px] text-left text-slate-400 leading-relaxed">
                💡 **Pro-Tip**: Click on filter tags at the top to quickly discover specific exam timelines or practical work details shared by teachers.
              </div>
            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
};

export default NoticeBoard;
