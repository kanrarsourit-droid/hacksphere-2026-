import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Sparkles, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Calendar, 
  ExternalLink,
  RotateCcw,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import { saveRoadmap, getUserRoadmaps } from '../services/db';
import { generateStudyRoadmap } from '../services/ai';

/**
 * SkillSync AI - Interactive AI Study Roadmap Builder
 */
const Roadmap = ({ activeUser }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form states
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("6 months");
  const [generating, setGenerating] = useState(false);

  // Active roadmap states
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [checkedTasks, setCheckedTasks] = useState({}); // { 'weekIdx-taskIdx': boolean }

  useEffect(() => {
    const loadRoadmaps = async () => {
      if (!activeUser) return;
      try {
        setLoadingHistory(true);
        const userRoadmaps = await getUserRoadmaps(activeUser.uid);
        setRoadmaps(userRoadmaps);
        if (userRoadmaps.length > 0) {
          setActiveRoadmap(userRoadmaps[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadRoadmaps();
  }, [activeUser]);

  // Submit Goal to Gemini
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim() || !activeUser) return;

    setGenerating(true);
    setActiveRoadmap(null);
    setCheckedTasks({});

    try {
      // Connect to Google Gemini API roadmap generator
      const aiRoadmapResult = await generateStudyRoadmap(
        goal,
        time
      );

      // Save roadmap in database logs
      const saved = await saveRoadmap({
        userId: activeUser.uid,
        ...aiRoadmapResult
      });

      setRoadmaps(prev => [saved, ...prev]);
      setActiveRoadmap(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Toggle checklist tasks
  const handleToggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    setCheckedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get total tasks progress percentage
  const getProgressPercentage = () => {
    if (!activeRoadmap || !activeRoadmap.weeks) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;

    activeRoadmap.weeks.forEach((week, wIdx) => {
      if (week.tasks) {
        week.tasks.forEach((_, tIdx) => {
          totalTasks += 1;
          if (checkedTasks[`${wIdx}-${tIdx}`]) {
            completedTasks += 1;
          }
        });
      }
    });

    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in pb-12">
      
      {/* ==========================================
          LEFT COLUMN: CREATOR FORM & HISTORY LIST
          ========================================== */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950">AI Roadmap Generator</h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            Build step-by-step milestone schedules for any learning goal.
          </p>
        </div>

        {/* INPUT GOAL FORM CARD */}
        <GlassCard className="p-6 border border-white/5">
          <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-purple-400" />
            Charter New Pathway
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Goal Target input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Target Study Goal</label>
              <textarea
                required
                placeholder="e.g., Become MERN Developer, Master organic chemistry, Learn calculus in 30 days"
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Time frame select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Target Duration</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
              >
                <option value="30 days" className="bg-space-900 text-white dark:bg-space-950 light:bg-white light:text-indigo-900">Short-Term (30 Days)</option>
                <option value="3 months" className="bg-space-900 text-white dark:bg-space-950 light:bg-white light:text-indigo-900">Quarterly (3 Months)</option>
                <option value="6 months" className="bg-space-900 text-white dark:bg-space-950 light:bg-white light:text-indigo-900">Standard (6 Months)</option>
                <option value="12 months" className="bg-space-900 text-white dark:bg-space-950 light:bg-white light:text-indigo-900">Long-Term (12 Months)</option>
              </select>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={generating || !goal.trim()}
              className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        </GlassCard>

        {/* ROADMAP HISTORY ARCHIVE */}
        <div className="space-y-4">
          <div className="pb-1 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-indigo-950">Roadmap Archive</h3>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
            </div>
          ) : roadmaps.length === 0 ? (
            <p className="text-xs text-slate-500 text-center italic py-4">No study schedules generated yet.</p>
          ) : (
            <div className="space-y-3">
              {roadmaps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => {
                    setActiveRoadmap(map);
                    setCheckedTasks({});
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    activeRoadmap?.id === map.id
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-md font-bold'
                      : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-300 dark:text-slate-300 light:text-zinc-700 hover:bg-white/5 dark:hover:bg-white/3 light:hover:bg-indigo-50/40 hover:border-purple-500/20'
                  }`}
                >
                  <span className="text-xs font-bold truncate pr-2 w-full">{map.goal}</span>
                  <div className="flex items-center justify-between w-full text-[9px] text-slate-500 mt-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {map.duration}
                    </span>
                    <span>{map.weeks?.length || 4} Chronological Checkpoints</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          RIGHT COLUMN: ROADMAP NODES DISPLAY & CHECKLISTS
          ========================================== */}
      <div className="xl:col-span-2">
        
        {generating ? (
          <GlassCard className="p-6 border border-white/5 h-full flex items-center justify-center min-h-[450px]">
            <LoadingState message="Gemini AI is parsing details & building roadmap nodes..." />
          </GlassCard>
        ) : activeRoadmap ? (
          <div className="space-y-6">
            
            {/* ROADMAP TARGET METADATA BLOCK */}
            <GlassCard className="p-6 border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/5 blur-[40px] pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">AI Chartered Roadmap</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white dark:text-white light:text-indigo-950">{activeRoadmap.goal}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1 pl-0.5">
                    Target: {activeRoadmap.duration} | Course: {activeRoadmap.targetAudience || 'Beginner to Advanced'}
                  </p>
                </div>

                {/* Checklist Progress Bar Ring */}
                <div className="flex flex-col items-center bg-black/20 dark:bg-black/30 light:bg-white p-3 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-200 shrink-0 text-center min-w-[120px]">
                  <span className="text-xs font-semibold text-slate-500">Path Progress</span>
                  <span className="text-2xl font-extrabold text-white dark:text-white light:text-indigo-900 mt-1">{getProgressPercentage()}%</span>
                  
                  {/* Neon slider progress indicator */}
                  <div className="w-full bg-white/5 dark:bg-white/5 light:bg-zinc-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${getProgressPercentage()}%` }} />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* TIMELINE WEEK-BY-WEEK CHRONOLOGICAL NODES */}
            <div className="relative pl-6 md:pl-8 space-y-6">
              
              {/* Central vertical glowing spine line */}
              <div className="absolute left-3 md:left-4 top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500/20 dark:via-purple-500 dark:to-pink-500/10 pointer-events-none" />

              {activeRoadmap.weeks && activeRoadmap.weeks.map((week, wIdx) => {
                
                // Calculate completion status of this week
                let weekCompleted = true;
                if (week.tasks && week.tasks.length > 0) {
                  weekCompleted = week.tasks.every((_, tIdx) => checkedTasks[`${wIdx}-${tIdx}`]);
                } else {
                  weekCompleted = false;
                }

                return (
                  <div key={wIdx} className="relative group">
                    
                    {/* Node Dot on vertical timeline */}
                    <div className={`absolute -left-[27px] md:-left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-10 ${
                      weekCompleted 
                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                        : 'bg-space-950 border-purple-500 group-hover:scale-110 shadow-md'
                    }`} />

                    {/* Milestone Card */}
                    <GlassCard className={`p-5 border ${
                      weekCompleted 
                        ? 'border-emerald-500/15 bg-emerald-500/2 dark:bg-emerald-500/1 light:bg-emerald-50/10' 
                        : 'border-white/5'
                    }`}>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                            weekCompleted ? 'text-emerald-400' : 'text-purple-400'
                          }`}>
                            {week.week}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white dark:text-white light:text-indigo-950 mt-0.5">
                            {week.topic}
                          </h3>
                        </div>

                        {/* Resource tags */}
                        {week.resources && (
                          <div className="flex items-center gap-1.5 bg-purple-500/10 py-1 px-2.5 rounded-lg border border-purple-500/20 text-[9px] font-bold text-purple-400 shrink-0 w-fit">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Resources: {week.resources}</span>
                          </div>
                        )}
                      </div>

                      {/* TASKS CHECKLIST GRID */}
                      {week.tasks && (
                        <div className="mt-4 space-y-2.5">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pl-0.5">Checkpoint Checklist</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {week.tasks.map((task, tIdx) => {
                              const isChecked = checkedTasks[`${wIdx}-${tIdx}`] || false;
                              return (
                                <button
                                  key={tIdx}
                                  onClick={() => handleToggleTask(wIdx, tIdx)}
                                  className={`text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 w-full group/btn ${
                                    isChecked
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300 dark:text-slate-300 light:text-zinc-600 line-through'
                                      : 'bg-black/10 dark:bg-black/20 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-300 dark:text-slate-300 light:text-zinc-700 hover:border-purple-500/20'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 group-hover/btn:text-purple-400 shrink-0 mt-0.5" />
                                  )}
                                  <span className="min-w-0 flex-1">{task}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </GlassCard>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Initial Visual placeholder */
          <GlassCard className="p-6 border border-white/5 h-full flex flex-col items-center justify-center text-center min-h-[450px] bg-white/1 dark:bg-white/1 light:bg-indigo-50/20">
            <span className="text-4xl animate-bounce">🗺️</span>
            <h3 className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-zinc-800 mt-4">AI Study Milestones</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
              Enter your study milestone (e.g. Become MERN developer) in the left panel to trigger Gemini's week-by-week curriculum timeline here!
            </p>
          </GlassCard>
        )}

      </div>

    </div>
  );
};

export default Roadmap;
