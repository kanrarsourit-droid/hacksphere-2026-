import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Trash2, 
  Calendar, 
  Tag, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import { uploadStudyNote, getUserNotes, updateNoteSummary, deleteStudyNote } from '../services/db';
import { generateNoteSummary } from '../services/ai';

/**
 * SkillSync AI - Smart Notes Upload System and AI Summarizer
 */
const NotesUpload = ({ activeUser, onStartQuiz }) => {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  // Uploader form state
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("Physics");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // AI Active state
  const [activeNote, setActiveNote] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [drawerTab, setDrawerTab] = useState("document"); // "document" or "ai"

  // Active Subject Filter state
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Filtered notes based on selected capsule category
  const filteredNotes = selectedFilter === "All"
    ? notes
    : notes.filter(n => n.subject.toLowerCase() === selectedFilter.toLowerCase());

  // Subject options
  const subjectsList = [
    // Science
    "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science",
    // Commerce
    "Accountancy", "Economics", "Business Studies",
    // Arts
    "History", "Geography", "Political Science", "English"
  ];

  // Fetch uploaded notes
  const loadNotes = async () => {
    if (!activeUser) return;
    try {
      setLoadingNotes(true);
      const userNotes = await getUserNotes(activeUser.uid, activeUser.role || 'student');
      setNotes(userNotes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [activeUser]);

  // File Drag & Drop Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("File size exceeds 10MB limit.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadError("");
    }
  };

  // Submit Note Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !activeUser) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const uploadedNote = await uploadStudyNote(
        file,
        file.name,
        subject,
        activeUser.uid,
        activeUser.role || 'student',
        activeUser.displayName || ''
      );
      
      setNotes(prev => [uploadedNote, ...prev]);
      setFile(null);
      setUploadSuccess(true);
      
      // Auto-focus the filter view on the uploaded subject category
      setSelectedFilter(subject);
      
      // Auto-clear success banner after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please ensure Firebase console Storage is enabled or write permissions are allowed.");
    } finally {
      setUploading(false);
    }
  };

  // Delete Note Callback
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this document from the curriculum?")) return;
    try {
      await deleteStudyNote(noteId, activeUser.uid);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (activeNote?.id === noteId) {
        setActiveNote(null);
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  // Preview Note Callback
  const handlePreviewNote = (note) => {
    setActiveNote(note);
    setDrawerTab("document");
  };

  // Trigger Gemini Summary Generation
  const handleGenerateSummary = async (note) => {
    setActiveNote(note);
    setDrawerTab("ai");
    if (note.summary) return; // Summary already exists, just open the view!

    setGeneratingSummary(true);

    try {
      // Prompt Gemini to read note contents (simulating reading of files via prompt templates)
      const aiResult = await generateNoteSummary(
        note.fileName,
        note.subject,
        `Title: ${note.fileName}. Category: ${note.subject}. Date: ${new Date(note.uploadDate).toLocaleDateString()}`
      );

      // Save summary in database
      await updateNoteSummary(note.id, aiResult.summary, aiResult.keyTakeaways);
      
      // Update note locally in state
      setNotes(prev => prev.map(n => {
        if (n.id === note.id) {
          return { ...n, summary: aiResult.summary, keyTakeaways: aiResult.keyTakeaways };
        }
        return n;
      }));

      // Update active note details
      setActiveNote({ 
        ...note, 
        summary: aiResult.summary, 
        keyTakeaways: aiResult.keyTakeaways 
      });

    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const isTeacher = activeUser?.role === 'teacher';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in pb-12">
      
      {/* ==========================================
          LEFT COLUMN: FILE UPLOADER & HISTORY LIST
          ========================================== */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950">
            {isTeacher ? "Teacher Curriculum Studio" : "Classroom Study Library"}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            {isTeacher 
              ? "Upload reference PDFs, curriculum notes, or homework worksheets to instantly share them with your students."
              : "Access premium reference notes, worksheets, and concept documents uploaded by your classroom Teachers."
            }
          </p>
        </div>

        {/* DRAG-AND-DROP UPLOAD GLASS CARD (ONLY RENDERED FOR TEACHER!) */}
        {isTeacher ? (
          <GlassCard className="p-6 border border-white/5 relative">
            <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Shared Curriculum Note
            </h3>

            {/* Error & Success indicators */}
            {uploadError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 dark:bg-red-500/10 light:bg-red-50 border border-red-500/30 rounded-xl text-xs text-red-400 dark:text-red-400 light:text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/15 dark:bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 dark:text-emerald-400 light:text-emerald-600 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Document successfully uploaded and published to the student catalog!</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              
              {/* Subject Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Course / Subject Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                >
                  {subjectsList.map((sub, sIdx) => (
                    <option key={sIdx} value={sub} className="bg-space-900 text-white dark:bg-space-950 dark:text-white light:bg-white light:text-indigo-900">{sub}</option>
                  ))}
                </select>
              </div>

              {/* Visual File uploader box */}
              <div className="relative border-2 border-dashed border-white/10 dark:border-white/5 light:border-zinc-200/80 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/3 dark:bg-white/2 light:bg-indigo-50/20 group">
                <input
                  type="file"
                  required
                  accept=".pdf, image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white dark:text-white light:text-indigo-900">
                      {file ? file.name : "Drag & drop reference PDF or click to select"}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">Accepts PDF or Image (Max 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold"
                >
                  {uploading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Upload & Publish to Class</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

            </form>
          </GlassCard>
        ) : (
          /* Student classroom banner */
          <GlassCard className="p-5 border border-purple-500/10 bg-gradient-to-r from-purple-500/10 to-transparent flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-500/5 blur-[25px]" />
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Interactive Syllabus Mode Active</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Students are locked in study mode. Read and review curriculum documents published by your Teacher below to prepare for exams!
              </p>
            </div>
          </GlassCard>
        )}

        {/* UPLOADED NOTES DOCUMENT LIST */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-indigo-950">
              {isTeacher ? "My Classroom Uploads" : "Shared Class Documents"}
            </h3>
            <span className="text-xs text-slate-500">Total Notes: {notes.length}</span>
          </div>

          {/* SUBJECT FILTER CAPSULES */}
          {!loadingNotes && notes.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {["All", ...subjectsList].map((opt, idx) => {
                const isActive = selectedFilter === opt;
                const count = opt === "All" 
                  ? notes.length 
                  : notes.filter(n => n.subject === opt).length;

                // Only render capsules that have uploaded materials or represent 'All'
                if (opt !== "All" && count === 0 && selectedFilter !== opt) return null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedFilter(opt)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                        : 'bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 dark:border-white/5 light:border-zinc-200 text-slate-450 hover:bg-white/10 dark:hover:bg-white/8 light:text-zinc-650'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 dark:bg-white/10 light:bg-indigo-100 text-slate-455 light:text-indigo-900'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {loadingNotes ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-2 bg-white/2 dark:bg-white/1 light:bg-indigo-50/20 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-2xl w-full">
              <span className="text-3xl">📁</span>
              <h4 className="text-sm font-semibold text-slate-350 dark:text-slate-300 light:text-zinc-800">
                {selectedFilter === "All" ? "Curriculum list is empty" : `No ${selectedFilter} notes yet`}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                {selectedFilter === "All" 
                  ? (isTeacher ? "You haven't uploaded any study notes yet. Drop a syllabus PDF in the cabinet above to share with students!" : "Your classroom teacher has not uploaded any study materials yet. Please wait for curriculum items to populate!")
                  : `There are currently no notes published under the ${selectedFilter} category.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <GlassCard 
                  key={note.id} 
                  onClick={() => handlePreviewNote(note)}
                  className={`p-4 border cursor-pointer hover:scale-[1.01] transition-all duration-300 ${
                    activeNote?.id === note.id 
                      ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-glow-border' 
                      : 'border-white/5 hover:border-purple-500/30'
                  } flex flex-col justify-between min-h-[150px]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate text-white dark:text-white light:text-indigo-900" title={note.fileName}>{note.fileName}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] font-semibold text-slate-400">
                        <Tag className="w-3 h-3 text-purple-400" />
                        <span>{note.subject}</span>
                        {note.isPublic && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[7px] shrink-0">
                            Shared Class Note 🏫
                          </span>
                        )}
                      </div>
                      
                      {/* Teacher name credit for students */}
                      {!isTeacher && note.teacherName && (
                        <p className="text-[8.5px] text-slate-500 italic mt-1.5 pl-0.5">
                          Uploaded by: {note.teacherName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(note.uploadDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all z-20"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a 
                        href={note.fileURL} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 hover:border-purple-500/50 text-slate-400 hover:text-purple-400 light:text-zinc-650 light:hover:text-indigo-600 transition-colors z-20"
                        title="View Original File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateSummary(note);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-[10px] font-semibold text-white flex items-center gap-1 transition-colors z-20"
                      >
                        <span>{note.summary ? "View Summary" : "Generate AI"}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* ==========================================
          RIGHT COLUMN: AI SUMMARIZER DRAWER/DISPLAY
          ========================================== */}
      <div className="xl:col-span-1">
        
        {generatingSummary ? (
          <GlassCard className="p-6 border border-white/5 h-full flex items-center justify-center min-h-[400px]">
            <LoadingState message="Gemini AI is analyzing material & creating summary..." />
          </GlassCard>
        ) : activeNote ? (
          <div className="space-y-6">
            
            {/* ACTIVE NOTE REVIEW */}
            <GlassCard className="p-6 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent relative shadow-xl overflow-hidden min-h-[400px]">
              
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

              {/* DUAL DRAWER TABS */}
              <div className="flex gap-2 p-1 bg-space-950/60 dark:bg-space-950/50 light:bg-indigo-50/50 border border-white/10 dark:border-white/5 light:border-zinc-200 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setDrawerTab("document")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    drawerTab === "document"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Document View 📄
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("ai")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    drawerTab === "ai"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  AI Study Report 🤖
                </button>
              </div>

              <h2 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 mb-1">{activeNote.fileName}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400 mb-5">
                {activeNote.subject}
              </span>

              {drawerTab === "document" ? (
                 /* DOCUMENT PREVIEWER FRAME */
                 <div className="space-y-3 mt-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Classroom File Cabinet</span>
                     <a 
                       href={activeNote.fileURL} 
                       target="_blank" 
                       rel="noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-[9px] text-purple-400 hover:text-purple-300 font-bold underline flex items-center gap-1 z-20"
                     >
                       Open in New Tab ↗️
                     </a>
                   </div>
                   
                   {activeNote.fileType?.includes("pdf") || activeNote.fileName?.toLowerCase().endsWith(".pdf") ? (
                     <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-white/10 dark:border-white/5 light:border-zinc-200 bg-space-950/60">
                       <iframe 
                         src={activeNote.fileURL} 
                         className="w-full h-full border-none"
                         title="PDF Note Preview"
                       />
                     </div>
                   ) : (
                     <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-white/10 dark:border-white/5 light:border-zinc-200 bg-space-950 flex items-center justify-center p-2">
                       <img 
                         src={activeNote.fileURL} 
                         className="w-full h-full object-contain rounded-lg"
                         alt="JPG Note Preview"
                         onError={(e) => {
                           e.target.style.display = 'none';
                         }}
                       />
                     </div>
                   )}
                 </div>
               ) : (
                 /* AI STUDY REPORT */
                 <div className="space-y-5">
                   
                   {/* 1. Main Markdown summary text */}
                   <div>
                     <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-1 mb-2.5 uppercase tracking-wide">Concept Summary</h3>
                     <div className="text-xs text-slate-350 dark:text-slate-300 light:text-zinc-705 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                       {activeNote.summary || "No summary generated yet. Click 'Generate AI' on this note card to solve!"}
                     </div>
                   </div>

                   {/* 2. Key Takeaways */}
                   {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                     <div>
                       <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-1 mb-2.5 uppercase tracking-wide">Exam Study Takeaways</h3>
                       <ul className="space-y-2">
                         {activeNote.keyTakeaways.map((take, tIdx) => (
                           <li key={tIdx} className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-650 flex items-start gap-2.5">
                             <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                             <span>{take}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {/* INTERACTIVE STUDY REDIRECT */}
                   {activeNote.summary && (
                     <div className="mt-8 pt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex flex-col gap-3">
                       <span className="text-[10px] text-center text-slate-500 font-semibold uppercase tracking-wider">Reinforce Your Learning</span>
                       <button
                         onClick={() => onStartQuiz(activeNote)}
                         className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold shadow-md shadow-purple-500/10 group"
                       >
                         <BookOpen className="w-4 h-4" />
                         Start AI Quiz on this note
                         <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                       </button>
                     </div>
                   )}

                 </div>
               )}

            </GlassCard>

          </div>
        ) : (
          /* Initial visual placeholder */
          <GlassCard className="p-6 border border-white/5 h-full flex flex-col items-center justify-center text-center min-h-[400px] bg-white/1 dark:bg-white/1 light:bg-indigo-50/20">
            <span className="text-4xl animate-bounce duration-[2000ms]">✨</span>
            <h3 className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-zinc-800 mt-4">AI Summarizer Panel</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
              Select a note from your Cabinet and click **"Generate AI"** to open Gemini's full concept summary report and flash sheets here!
            </p>
          </GlassCard>
        )}

      </div>

    </div>
  );
};

export default NotesUpload;
