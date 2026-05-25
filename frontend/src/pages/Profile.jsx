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
  Bookmark,
  Phone,
  Heart,
  Edit2,
  Save,
  Check,
  Mail,
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../components/GlassCard';
import { getUserNotes, getUserQuizzes, getUserRoadmaps, updateUserProfile } from '../services/db';

/**
 * SkillSync AI - Interactive Student Profile & Achievements Console
 * Now featuring biography writing, phone updates, hobby tags, and preset avatar builders!
 */
const Profile = ({ activeUser, onUpdateUser }) => {
  const [notesCount, setNotesCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form States
  const [editName, setEditName] = useState(activeUser.displayName || "");
  const [editPhoto, setEditPhoto] = useState(activeUser.photoURL || "");
  const [editBio, setEditBio] = useState(activeUser.bio || "");
  const [editPhone, setEditPhone] = useState(activeUser.phone || "");
  const [editHobbies, setEditHobbies] = useState(activeUser.hobbies || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick preset avatars seed list (Dicebear seeds)
  const avatarPresets = [
    { name: 'Alex', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex' },
    { name: 'Sarah', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah' },
    { name: 'Max', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Max' },
    { name: 'Leo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Leo' },
    { name: 'Luna', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna' },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setEditPhoto(base64Image);
      
      // Instant database upload and session header update!
      try {
        setIsSaving(true);
        const result = await updateUserProfile(activeUser.uid, { photoURL: base64Image });
        if (result.success) {
          onUpdateUser({ photoURL: base64Image });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (err) {
        console.error("Instant avatar upload failed:", err);
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

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

  // Sync state if activeUser updates in background
  useEffect(() => {
    if (activeUser) {
      setEditName(activeUser.displayName || "");
      setEditPhoto(activeUser.photoURL || "");
      setEditBio(activeUser.bio || "");
      setEditPhone(activeUser.phone || "");
      setEditHobbies(activeUser.hobbies || "");
    }
  }, [activeUser]);

  // Form Submit Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !activeUser) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedFields = {
        displayName: editName,
        photoURL: editPhoto,
        bio: editBio,
        phone: editPhone,
        hobbies: editHobbies
      };

      // Call database update helper
      await updateUserProfile(activeUser.uid, updatedFields);

      // Trigger reactive state cascade in main App container
      if (onUpdateUser) {
        onUpdateUser(updatedFields);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // fade out alert bubble
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isTeacher = activeUser?.role === 'teacher';

  // Comparative subject chart data
  const subjectChartData = isTeacher
    ? [
        { name: 'Curriculum', score: notesCount > 0 ? 95 : 0 },
        { name: 'Broadcasting', score: 85 },
        { name: 'Quiz Prep', score: quizCount > 0 ? 90 : 0 },
        { name: 'Tutoring', score: avgScore > 0 ? avgScore : 0 },
      ]
    : [
        { name: 'Physics', score: notesCount > 0 ? 88 : 0 },
        { name: 'Chemistry', score: quizCount > 0 ? 74 : 0 },
        { name: 'Math', score: avgScore > 0 ? avgScore : 0 },
        { name: 'CompSci', score: roadmapCount > 0 ? 95 : 0 },
      ];

  // List of unlockable academic badges
  const achievementsList = isTeacher
    ? [
        {
          id: "ai_scholar",
          title: "Digital Educator 📚",
          desc: "Published your first syllabus study notes into the digital cabinet.",
          unlocked: notesCount >= 1
        },
        {
          id: "streak_specialist",
          title: "Instructional Streak ⚡",
          desc: "Maintained active classroom instruction for 3+ consecutive days.",
          unlocked: (activeUser.streak || 1) >= 3
        },
        {
          id: "exam_crusher",
          title: "High Impact Mentor 🎓",
          desc: "Helped students achieve high performance streaks across sections.",
          unlocked: true
        },
        {
          id: "polymath",
          title: "Curriculum Specialist 🏛️",
          desc: "Published study documents covering 3 or more academic subject tracks.",
          unlocked: notesCount >= 3
        },
        {
          id: "roadmap_architect",
          title: "Quiz Architect 📝",
          desc: "Generated customized practice exam materials for student training.",
          unlocked: quizCount >= 1
        }
      ]
    : [
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

          {/* Large Avatar with click/drag-to-upload hover overlay */}
          <div className="relative group mx-auto w-20 h-20 rounded-full border-2 border-purple-500/30 p-1 bg-space-850 dark:bg-space-900 light:bg-white shadow-lg overflow-hidden flex items-center justify-center">
            <img 
              src={editPhoto || activeUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.uid}`}
              alt="profile avatar" 
              className="w-full h-full rounded-full object-cover"
            />
            {/* Dark glass label overlay directly over the image */}
            <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[8px] font-bold text-white gap-0.5 z-10">
              <UploadCloud className="w-4 h-4 text-purple-400" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Clickable text link directly below the picture */}
          <div className="mt-2.5 relative">
            <label className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 mt-4">{activeUser.displayName || (isTeacher ? 'Teacher' : 'Student')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-0.5 flex items-center justify-center gap-1">
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>{activeUser.email}</span>
          </p>

          {/* Phone Number Display */}
          {activeUser.phone && (
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-zinc-600 mt-1 flex items-center justify-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeUser.phone}</span>
            </p>
          )}

          {/* Biography Block */}
          <div className="mt-4 pt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-0.5">Biography</span>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-600 mt-1 pl-0.5 leading-relaxed italic">
              {activeUser.bio || (isTeacher ? "No biography written yet. Use the 'Modify Profile' card on the right to publish your bio!" : "No biography written yet. Use the 'Modify Profile' card on the right to share your bio!")}
            </p>
          </div>

          {/* Hobbies Glow Badges */}
          {activeUser.hobbies && (
            <div className="mt-4 pt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-0.5 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span>Interests & Hobbies</span>
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2 pl-0.5">
                {activeUser.hobbies.split(',').map((hobby, index) => (
                  <span 
                    key={index}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0"
                  >
                    {hobby.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registration Date */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-6 font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{isTeacher ? "Faculty Appointed: " : "Enrolled: "}{activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
        </GlassCard>

        {/* METRICS SUMMARY GRID */}
        <GlassCard className="p-5 border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-2 uppercase tracking-wide">
            {isTeacher ? "Faculty Portfolio Stats" : "Academic Record"}
          </h3>
          
          <div className="space-y-3.5">
            {/* Notes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                {isTeacher ? "Published Lesson Notes" : "Uploaded Documents"}
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{notesCount} items</span>
            </div>

            {/* Quizzes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                {isTeacher ? "Practice Quizzes Created" : "Quizzes Answered"}
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{quizCount} units</span>
            </div>

            {/* Average grade */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" />
                {isTeacher ? "Mentorship Score Avg" : "Practice Score Avg"}
              </span>
              <span className="font-bold text-white dark:text-white light:text-indigo-950">{isTeacher ? "96%" : `${avgScore}%`}</span>
            </div>

            {/* Streaks */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                {isTeacher ? "Consecutive Lecture Days" : "Active Streak"}
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
        
        {/* EDIT PROFILE DETAILS CARD (NEWLY REQUESTED FEATURE!) */}
        <GlassCard className="p-6 border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950 flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-purple-400" />
                Modify Profile Console
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize your name, contact phone, hobbies, and display avatars</p>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Saved successfully!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Display Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Full / Pen Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie Curie, Albert"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>

              {/* Phone Number Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555-0199"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>

              {/* Hobbies comma-separated */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Interests & Hobbies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Reading, Space Physics, Guitar"
                  value={editHobbies}
                  onChange={(e) => setEditHobbies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>

              {/* Biography biography description */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Biography / About Me</label>
                <textarea
                  placeholder={isTeacher ? "Tell us about yourself! E.g. I am an AP Science educator aiming to simplify complex topics..." : "Tell us about yourself! E.g. I am a sophomore physics student aiming to master quantum mechanics..."}
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Profile Image Preset Selection or Custom URL */}
              <div className="flex flex-col gap-2.5 md:col-span-2 pt-2 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Custom Photo URL or Choose Preset Bot</label>
                
                {/* Visual seed preset blocks */}
                <div className="flex flex-wrap gap-3 items-center mb-2 pl-0.5">
                  {avatarPresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditPhoto(preset.url)}
                      className={`w-11 h-11 rounded-xl p-1 border transition-all flex items-center justify-center bg-space-850 dark:bg-space-900 light:bg-white ${
                        editPhoto === preset.url
                          ? 'border-purple-500 shadow-md scale-105 bg-purple-500/10'
                          : 'border-white/5 hover:border-purple-500/20'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full rounded-lg" />
                    </button>
                  ))}
                  
                  <span className="text-[10px] text-slate-500 font-semibold italic">Presets</span>
                </div>

                <input
                  type="url"
                  placeholder="https://example.com/your-custom-image.png"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>

            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={isSaving || !editName.trim()}
              className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold mt-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>

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
