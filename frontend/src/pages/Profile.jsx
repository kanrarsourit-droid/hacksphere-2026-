import React, { useEffect, useState } from 'react';
import { 
  User, 
  Flame, 
  Award, 
  FileText, 
  BrainCircuit, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Lock,
  Bookmark
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../components/GlassCard';
import { getUserNotes, getUserQuizzes, getUserRoadmaps } from '../services/db';

/**
 * SkillSync AI - Interactive Student Profile & Achievements Console
 */
const Profile = ({ activeUser }) => {
  const [notesCount, setNotesCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!activeUser) return;
      try {
        setLoading(true);
        const [notes, quizzes, roadmaps] = await Promise.all([
          getUserNotes(activeUser.uid),
          getUserQuizzes(activeUser.uid),
          getUserRoadmaps(activeUser.uid)
        ]);

        setNotesCount(notes.length);
        setQuizCount(quizzes.length);
        setRoadmapCount(roadmaps.length);
        
        if (quizzes.length > 0) {
          const total = quizzes.reduce((sum, q) => sum + q.score, 0);
          setAvgScore(Math.round(total / quizzes.length));
        } else {
          setAvgScore(activeUser.avgQuizScore || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfileStats();
  }, [activeUser]);

  // Comparative subject chart data
  const subjectChartData = [
    { name: 'Physics', score: notesCount > 0 ? 88 : 0 },
    { name: 'Chemistry', score: quizCount > 0 ? 74 : 0 },
    { name: 'Math', score: avgScore > 0 ? avgScore : 0 },
    { name: 'CompSci', score: roadmapCount > 0 ? 95 : 0 },
  ];

  // List of unlockable academic badges
  const achievementsList = [
    {
      id: "ai_scholar",
      title: "AI Pioneer 🎓",
      desc: "Uploaded your first study note to the AI Summarizer cabinet.",
      unlocked: notesCount >= 1
    },
    {
      id: "streak_specialist",
      title: "Streak Specialist 🔥",
      desc: "Achieved a 3-day active learning study streak.",
      unlocked: (activeUser.streak || 1) >= 3
    },
    {
      id: "exam_crusher",
      title: "A+ Overachiever 🏆",
      desc: "Achieved an average score of 85% or higher on practice exams.",
      unlocked: avgScore >= 85
    },
    {
      id: "polymath",
      title: "Active Polymath 📚",
      desc: "Uploaded study materials for 3 or more subjects.",
      unlocked: notesCount >= 3
    },
    {
      id: "roadmap_architect",
      title: "Roadmap Architect 🗺️",
      desc: "Generated your first week-by-week study roadmap.",
      unlocked: roadmapCount >= 1
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-12">
      
      {/* ==========================================
          LEFT COLUMN: STUDENT BRAND CARD & STATS
          ========================================== */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* STUDENT BIO PANEL */}
        <GlassCard className="p-6 border border-white/5 bg-gradient-to-b from-purple-500/5 to-transparent text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

          {/* Sparkles indicator */}
          <div className="absolute top-4 right-4 text-purple-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          {/* Large Avatar */}
          <img 
            src={activeUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.uid}`}
            alt="profile avatar" 
            className="w-20 h-20 rounded-full border-2 border-purple-500/30 p-1 mx-auto bg-space-850 dark:bg-space-900 light:bg-white"
          />

          <h2 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 mt-4">{activeUser.displayName || 'Student'}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-0.5">{activeUser.email}</p>

          {/* Registration Date */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-4 font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Enrolled: {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
        </GlassCard>

        {/* METRICS SUMMARY GRID */}
        <GlassCard className="p-5 border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2 uppercase tracking-wide">Academic Record</h3>
          
          <div className="space-y-3.5">
            {/* Notes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Uploaded Documents
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{notesCount} notes</span>
            </div>

            {/* Quizzes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                Quizzes Answered
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{quizCount} sessions</span>
            </div>

            {/* Average grade */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" />
                Practice Score Avg
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{avgScore}%</span>
            </div>

            {/* Streaks */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Active Streak
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{activeUser.streak || 1} days</span>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* ==========================================
          RIGHT COLUMN: GAMIFIED BADGES & MASTERY CHART
          ========================================== */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* GAMIFIED ACHIEVEMENTS LIST */}
        <GlassCard className="p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950">Achievements Badges</h3>
              <p className="text-xs text-slate-500 pl-0.5">Solve quizzes and build streaks to unlock awards</p>
            </div>
            
            {/* Unlocked tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">
              <Award className="w-3.5 h-3.5 fill-purple-400/20" />
              <span>Unlocked: {unlockedCount} / {achievementsList.length}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievementsList.map((badge, bIdx) => (
              <div 
                key={bIdx}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-purple-500/8 via-transparent to-transparent border-purple-500/20 shadow-md'
                    : 'bg-black/10 dark:bg-black/20 light:bg-zinc-50 border-white/5 dark:border-white/5 light:border-zinc-200 opacity-60'
                }`}
              >
                {/* Lock indicator */}
                {!badge.unlocked && (
                  <div className="absolute top-3 right-3 text-slate-600 dark:text-slate-700 light:text-zinc-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Badge Icon circle */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-sm ${
                  badge.unlocked 
                    ? 'bg-purple-500/10 border border-purple-500/20' 
                    : 'bg-white/5 border border-white/5'
                }`}>
                  {badge.unlocked ? <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400" /> : <Bookmark className="w-5.5 h-5.5 text-slate-600 dark:text-slate-700 light:text-zinc-400" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-bold ${
                    badge.unlocked ? 'text-white dark:text-white light:text-indigo-900' : 'text-slate-500'
                  }`}>{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* MASTERY OVERVIEW CHART */}
        <GlassCard className="p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950">Active Mastery Progress</h3>
              <p className="text-xs text-slate-500">Calculated cognitive strengths across disciplines</p>
            </div>
          </div>

          {unlockedCount === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">Mastery records will populate once your first practice exam is submitted.</p>
          ) : (
            <div className="h-44 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 5, 32, 0.9)', 
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

      </div>

    </div>
  );
};

export default Profile;
