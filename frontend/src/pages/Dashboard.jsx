import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Clock, 
  Flame, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import GlassCard from '../components/GlassCard';
import { getUserNotes, getUserQuizzes, getUserRoadmaps } from '../services/db';

/**
 * SkillSync AI - Interactive Student Dashboard View
 */
const Dashboard = ({ activeUser, onTabChange }) => {
  const [loading, setLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [activities, setActivities] = useState([]);

  // Dynamic Chart States
  const [weeklyStudyData, setWeeklyStudyData] = useState([]);
  const [subjectMasteryData, setSubjectMasteryData] = useState([]);
  const [lackingSubject, setLackingSubject] = useState(null);
  const [strongestSubject, setStrongestSubject] = useState(null);

  const isTeacher = activeUser?.role === 'teacher';

  // Load actual counts from services
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!activeUser) return;
      
      try {
        setLoading(true);
        const [notes, quizzes, roadmaps] = await Promise.all([
          getUserNotes(activeUser.uid, activeUser.role || 'student'),
          getUserQuizzes(activeUser.uid),
          getUserRoadmaps(activeUser.uid)
        ]);

        setNotesCount(notes.length);
        setQuizCount(quizzes.length);
        
        // Calculate average quiz grade
        if (quizzes.length > 0) {
          const total = quizzes.reduce((sum, q) => sum + q.score, 0);
          setAvgScore(Math.round(total / quizzes.length));
        } else {
          setAvgScore(activeUser.avgQuizScore || 0);
        }

        // Build recent activities feed chronologically
        const combined = [];
        
        notes.forEach(note => {
          combined.push({
            type: 'note',
            title: isTeacher ? `Published Class Note: "${note.fileName}"` : `Access note: "${note.fileName}"`,
            time: new Date(note.uploadDate),
            subject: note.subject,
            details: isTeacher ? `Published & Shared with Classroom` : `Ready for AI summary generation`
          });
        });

        if (!isTeacher) {
          quizzes.forEach(quiz => {
            combined.push({
              type: 'quiz',
              title: `Completed ${quiz.subject} AI Quiz`,
              time: new Date(quiz.takenAt),
              subject: quiz.subject,
              details: `Scored: ${quiz.score}/${quiz.maxScore} (${Math.round((quiz.score/quiz.maxScore)*100)}%)`
            });
          });

          roadmaps.forEach(map => {
            combined.push({
              type: 'roadmap',
              title: `Generated Study Path: "${map.goal}"`,
              time: new Date(map.createdAt),
              subject: 'Roadmap',
              details: `${map.weeks?.length || 4} learning milestones chartered`
            });
          });
        } else {
          // Simulated Teacher Activities
          combined.push({
            type: 'quiz',
            title: `AI Question Bank Verified`,
            time: new Date(Date.now() - 3600000),
            subject: 'Physics',
            details: `40 practice questions compiled dynamically by Gemini AI`
          });
          combined.push({
            type: 'roadmap',
            title: `Classroom Syllabus Sync Complete`,
            time: new Date(Date.now() - 7200000),
            subject: 'Computer Science',
            details: `Synced curriculum catalog successfully with active local clients`
          });
        }

        // Sort by most recent
        combined.sort((a, b) => b.time - a.time);
        setActivities(combined.slice(0, 4)); // Show top 4 activities

        // Calculate dynamic analytics data based on active role
        if (isTeacher) {
          const mathCount = notes.filter(n => n.subject.toLowerCase().includes('math')).length;
          const physicsCount = notes.filter(n => n.subject.toLowerCase().includes('physic')).length;
          const chemistryCount = notes.filter(n => n.subject.toLowerCase().includes('chemist')).length;
          const compSciCount = notes.filter(n => n.subject.toLowerCase().includes('computer') || n.subject.toLowerCase().includes('comp') || n.subject.toLowerCase().includes('cs')).length;

          const teacherCoverage = [
            { name: 'Math', coverage: Math.min(100, Math.max(10, mathCount * 25)), color: '#6366f1' },
            { name: 'Physics', coverage: Math.min(100, Math.max(10, physicsCount * 25)), color: '#8b5cf6' },
            { name: 'Chemistry', coverage: Math.min(100, Math.max(10, chemistryCount * 25)), color: '#ec4899' },
            { name: 'CompSci', coverage: Math.min(100, Math.max(10, compSciCount * 25)), color: '#06b6d4' },
          ];
          setSubjectMasteryData(teacherCoverage);

          const sortedCoverage = [...teacherCoverage].sort((a, b) => a.coverage - b.coverage);
          setLackingSubject(sortedCoverage[0]);
          setStrongestSubject(sortedCoverage[sortedCoverage.length - 1]);

          const baseViews = notes.length * 15;
          setWeeklyStudyData([
            { name: 'Mon', views: Math.max(10, Math.round(baseViews * 0.8)) },
            { name: 'Tue', views: Math.max(20, Math.round(baseViews * 1.2)) },
            { name: 'Wed', views: Math.max(15, Math.round(baseViews * 0.9)) },
            { name: 'Thu', views: Math.max(25, Math.round(baseViews * 1.4)) },
            { name: 'Fri', views: Math.max(18, Math.round(baseViews * 1.1)) },
            { name: 'Sat', views: Math.max(5, Math.round(baseViews * 0.3)) },
            { name: 'Sun', views: Math.max(8, Math.round(baseViews * 0.5)) },
          ]);
        } else {
          // Student dynamic mastery calculated from AI quiz average scores in each subject!
          const getAvgScoreForSubject = (subjName, baseVal) => {
            const subjectQuizzes = quizzes.filter(q => q.subject.toLowerCase().includes(subjName));
            if (subjectQuizzes.length > 0) {
              const total = subjectQuizzes.reduce((sum, q) => sum + (q.score / q.maxScore) * 100, 0);
              return Math.round(total / subjectQuizzes.length);
            }
            // Fallback based on study libraries note uploads count
            const subjectNotes = notes.filter(n => n.subject.toLowerCase().includes(subjName));
            return Math.min(95, baseVal + (subjectNotes.length * 12));
          };

          const mathLevel = getAvgScoreForSubject('math', 50);
          const physicsLevel = getAvgScoreForSubject('physic', 55);
          const chemistryLevel = getAvgScoreForSubject('chemist', 45);
          const compSciLevel = getAvgScoreForSubject('comp', 60);

          const studentMastery = [
            { name: 'Math', level: mathLevel, color: '#6366f1' },
            { name: 'Physics', level: physicsLevel, color: '#8b5cf6' },
            { name: 'Chemistry', level: chemistryLevel, color: '#ec4899' },
            { name: 'CompSci', level: compSciLevel, color: '#06b6d4' },
          ];
          setSubjectMasteryData(studentMastery);

          const sortedMastery = [...studentMastery].sort((a, b) => a.level - b.level);
          setLackingSubject(sortedMastery[0]);
          setStrongestSubject(sortedMastery[sortedMastery.length - 1]);

          const baseHours = (notes.length * 1.5) + (quizzes.length * 2.0) + (roadmaps.length * 1.0);
          setWeeklyStudyData([
            { name: 'Mon', hours: Math.max(0.5, Math.round(baseHours * 0.7 * 10) / 10) },
            { name: 'Tue', hours: Math.max(1.0, Math.round(baseHours * 1.1 * 10) / 10) },
            { name: 'Wed', hours: Math.max(0.8, Math.round(baseHours * 0.8 * 10) / 10) },
            { name: 'Thu', hours: Math.max(1.5, Math.round(baseHours * 1.3 * 10) / 10) },
            { name: 'Fri', hours: Math.max(1.2, Math.round(baseHours * 1.0 * 10) / 10) },
            { name: 'Sat', hours: Math.max(0.2, Math.round(baseHours * 0.4 * 10) / 10) },
            { name: 'Sun', hours: Math.max(0.4, Math.round(baseHours * 0.6 * 10) / 10) },
          ]);
        }

      } catch (err) {
        console.error("Dashboard data load error: ", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeUser]);

  // Dynamic welcome quotes
  const studyQuotes = [
    "The secret of getting ahead is getting started.",
    "Active recall is the fastest path to conceptual mastery.",
    "Your streak is climbing! Keep up the incredible momentum today.",
    "Every dynamic roadmap is a ladder to your dream career."
  ];

  const teacherQuotes = [
    "Empowering minds with real-time collaborative AI curriculum.",
    "Your shared notes are helping students retain concepts 60% faster today.",
    "Interactive learning is the ultimate catalyst for student performance.",
    "Upload comprehensive syllabus PDFs to seed practice quiz banks!"
  ];

  const [quote] = useState(() => {
    const list = isTeacher ? teacherQuotes : studyQuotes;
    return list[Math.floor(Math.random() * list.length)];
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* ==========================================
          1. HEADER WELCOME SECTION
          ========================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 dark:border-white/5 light:border-zinc-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950 flex items-center gap-2">
            Welcome back, {activeUser.displayName || (isTeacher ? 'Teacher' : 'Student')} 👋
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1 max-w-xl italic">
            "{quote}"
          </p>
        </div>
        
        {/* Quick Launch Notes CTA */}
        <button
          onClick={() => onTabChange('notes')}
          className="btn-neon !py-2 !px-4.5 text-xs flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {isTeacher ? "Upload Syllabus Note" : "View Class Library"}
        </button>
      </div>

      {/* ==========================================
          2. METRIC STATISTICS GRID (DYNAMICAL PER ROLE)
          ========================================== */}
      {isTeacher ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* TEACHER STAT 1: NOTES PUBLISHED */}
          <GlassCard className="p-5 border-l-4 border-l-purple-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Curriculum Uploaded</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">{notesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileText className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-400" />
              <span>Syllabus items shared live</span>
            </p>
          </GlassCard>

          {/* TEACHER STAT 2: STUDENTS ACTIVE */}
          <GlassCard className="p-5 border-l-4 border-l-indigo-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Class Enrollment</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">148</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Award className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Active students in current semester</p>
          </GlassCard>

          {/* TEACHER STAT 3: SUMMARIES GENERATED */}
          <GlassCard className="p-5 border-l-4 border-l-pink-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">AI Concepts Compiled</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">{notesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50/10 text-pink-400 flex items-center justify-center">
                <BrainCircuit className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Summaries indexed by Gemini AI</p>
          </GlassCard>

          {/* TEACHER STAT 4: ACTIVE COURSES */}
          <GlassCard className="p-5 border-l-4 border-l-orange-500 hover:-translate-y-0.5 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Active Subjects</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950 flex items-center gap-1.5">
                  4 <span className="text-sm font-semibold text-slate-400">Streams</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Clock className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Math, CS, Physics, Chemistry</p>
          </GlassCard>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* STUDENT STAT 1: NOTES UPLOADED */}
          <GlassCard className="p-5 border-l-4 border-l-purple-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Notes Uploaded</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">{notesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileText className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-400" />
              <span>Ready for AI Summarizer</span>
            </p>
          </GlassCard>

          {/* STUDENT STAT 2: QUIZ SCORE */}
          <GlassCard className="p-5 border-l-4 border-l-indigo-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Avg Quiz Score</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">{avgScore}%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-400" />
              <span>Solved: {quizCount} full quizzes</span>
            </p>
          </GlassCard>

          {/* STUDENT STAT 3: STUDY HOURS */}
          <GlassCard className="p-5 border-l-4 border-l-pink-500 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Study Hours</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950">
                  {Math.round((weeklyStudyData.reduce((sum, d) => sum + d.hours, 0) + (notesCount * 0.5)) * 10) / 10}h
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50/10 text-pink-400 flex items-center justify-center">
                <Clock className="w-5.5 h-5.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Simulated active course reading</p>
          </GlassCard>

          {/* STUDENT STAT 4: STUDY STREAK */}
          <GlassCard className="p-5 border-l-4 border-l-orange-500 hover:-translate-y-0.5 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 uppercase tracking-wider">Learning Streak</span>
                <span className="text-3xl font-bold mt-1 text-white dark:text-white light:text-indigo-950 flex items-center gap-1.5">
                  {activeUser.streak || 1} <span className="text-sm font-semibold text-slate-400">days</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center animate-pulse">
                <Flame className="w-5.5 h-5.5 fill-orange-400/10" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Study daily to grow your streak!</p>
          </GlassCard>

        </div>
      )}

      {/* ==========================================
          3. RECHARTS ANALYTICS CHARTS (ROLE TAILORED)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART A: STUDY HOURS WEEKLY TREND (Student) OR CLASSROOM VIEWS (Teacher) */}
        <GlassCard className="lg:col-span-2 p-5 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950">
                {isTeacher ? "Curriculum Views Engagement" : "Study Progress Hours Trend"}
              </h3>
              <p className="text-xs text-slate-500 pl-0.5">
                {isTeacher ? "Student views per day on your uploaded files" : "Hours logged per day this week"}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isTeacher ? "#a855f7" : "#8b5cf6"} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isTeacher ? "#a855f7" : "#8b5cf6"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(9, 5, 32, 0.9)', 
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey={isTeacher ? "views" : "hours"} 
                  stroke={isTeacher ? "#a855f7" : "#8b5cf6"} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#hoursGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* CHART B: SUBJECT MASTERY LEVELS (Student) OR SYLLABUS COVERAGE (Teacher) */}
        <GlassCard className="p-5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950">
                {isTeacher ? "Syllabus Stream Coverage" : "Subject Mastery Rating"}
              </h3>
              <p className="text-xs text-slate-500 pl-0.5">
                {isTeacher ? "Syllabus completeness per stream" : "Diagnosed by quiz grades"}
              </p>
            </div>
            <Award className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectMasteryData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(9, 5, 32, 0.9)', 
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey={isTeacher ? "coverage" : "level"} radius={[8, 8, 0, 0]} barSize={28}>
                  {subjectMasteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200 pt-3 flex justify-between text-xs">
            {strongestSubject && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-white dark:text-white light:text-indigo-900">{strongestSubject.name}</span>
                <span className="text-[10px] text-emerald-400">
                  {isTeacher 
                    ? `${strongestSubject.coverage}% Covered` 
                    : `${strongestSubject.level}% (Peak 👍)`
                  }
                </span>
              </div>
            )}
            <div className="h-6 w-[1px] bg-white/10 dark:bg-white/10 light:bg-zinc-200" />
            {lackingSubject && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-white dark:text-white light:text-indigo-900">{lackingSubject.name}</span>
                <span className="text-[10px] text-pink-400">
                  {isTeacher 
                    ? `${lackingSubject.coverage}% Covered` 
                    : `${lackingSubject.level}% (Needs work ⚠️)`
                  }
                </span>
              </div>
            )}
          </div>

          {!isTeacher && lackingSubject && (
            <div className="mt-4 p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10 text-[11px] leading-relaxed text-slate-400 dark:text-slate-400 light:text-zinc-600">
              <span className="font-bold text-purple-400 dark:text-purple-400 light:text-indigo-700 flex items-center gap-1 mb-1">
                🧠 AI Diagnostic Report
              </span>
              You are currently lagging behind in <strong className="text-white dark:text-white light:text-indigo-950 font-bold">{lackingSubject.name}</strong> ({lackingSubject.level}% average). We recommend studying this more by generating a practice quiz!
            </div>
          )}
          {isTeacher && lackingSubject && (
            <div className="mt-4 p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10 text-[11px] leading-relaxed text-slate-400 dark:text-slate-400 light:text-zinc-600">
              <span className="font-bold text-purple-400 dark:text-purple-400 light:text-indigo-700 flex items-center gap-1 mb-1">
                📊 Classroom Analytics
              </span>
              Your lowest curriculum stream is <strong className="text-white dark:text-white light:text-indigo-950 font-bold">{lackingSubject.name}</strong> ({lackingSubject.coverage}% syllabus coverage). Upload more notes to complete the stream!
            </div>
          )}
        </GlassCard>

      </div>

      {/* ==========================================
          4. RECENT ACTIVITY FEED
          ========================================== */}
      <GlassCard className="p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
          <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950">
            {isTeacher ? "Curriculum Publishing Feed" : "Recent Study Activities"}
          </h3>
          <span className="text-xs font-semibold text-purple-400 dark:text-purple-400 light:text-indigo-600">Updated Real-Time</span>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-2">
            <span className="text-2xl">📖</span>
            <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-zinc-800">Your Activity Feed is empty</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              {isTeacher 
                ? "Upload your first curriculum document to see it appear in the public feed!"
                : "Upload your first study document in the notes section to start generating summaries and quizzes!"
              }
            </p>
            <button
              onClick={() => onTabChange('notes')}
              className="mt-2 text-xs font-bold text-purple-400 dark:text-purple-400 light:text-indigo-600 flex items-center gap-1 hover:underline"
            >
              {isTeacher ? "Go publish notes" : "Go upload notes"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 bg-white/3 dark:bg-white/3 light:bg-indigo-50/30 rounded-xl border border-transparent hover:border-white/5 dark:hover:border-white/5 light:hover:border-zinc-200 transition-all duration-300"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  act.type === 'note' ? 'bg-purple-500/10 text-purple-400' :
                  act.type === 'quiz' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'
                }`}>
                  {act.type === 'note' && <FileText className="w-4.5 h-4.5" />}
                  {act.type === 'quiz' && <BrainCircuit className="w-4.5 h-4.5" />}
                  {act.type === 'roadmap' && <TrendingUp className="w-4.5 h-4.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold truncate text-white dark:text-white light:text-indigo-900">{act.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">{act.time.toLocaleDateString()} at {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-0.5">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default Dashboard;
