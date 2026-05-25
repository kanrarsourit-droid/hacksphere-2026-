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
import { uploadStudyNote, getUserNotes, updateNoteSummary } from '../services/db';
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
      const userNotes = await getUserNotes(activeUser.uid);
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
        activeUser.uid
      );
      
      setNotes(prev => [uploadedNote, ...prev]);
      setFile(null);
      setUploadSuccess(true);
      
      // Auto-clear success banner after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please ensure Firebase console Storage is enabled or write permissions are allowed.");
    } finally {
      setUploading(false);
    }
  };

  // Trigger Gemini Summary Generation
  const handleGenerateSummary = async (note) => {
    setActiveNote(note);
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in pb-12">
      
      {/* ==========================================
          LEFT COLUMN: FILE UPLOADER & HISTORY LIST
          ========================================== */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950">Study Notes Upload System</h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            Upload PDFs or image worksheets, organize by subject category, and trigger dynamic AI summaries.
          </p>
        </div>

        {/* DRAG-AND-DROP UPLOAD GLASS CARD */}
        <GlassCard className="p-6 border border-white/5 relative">
          <h3 className="text-base font-bold text-white dark:text-white light:text-indigo-950 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            Upload New File
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
              <span>Note uploaded successfully! Active stats incremented.</span>
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white dark:text-white light:text-indigo-900">
                    {file ? file.name : "Drag & drop file or click to select"}
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
                    <span>Confirm Note Upload</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

          </form>
        </GlassCard>

        {/* UPLOADED NOTES DOCUMENT LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-indigo-950">My Document Cabinet</h3>
            <span className="text-xs text-slate-500">Total Notes: {notes.length}</span>
          </div>

          {loadingNotes ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-2 bg-white/2 dark:bg-white/1 light:bg-indigo-50/20 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-2xl">
              <span className="text-3xl">📁</span>
              <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-zinc-800">Cabinet is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">No documents have been uploaded yet. Drop a PDF file in the box above to activate your dashboard cabinet!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((note) => (
                <GlassCard 
                  key={note.id} 
                  className={`p-4 border ${
                    activeNote?.id === note.id 
                      ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-glow-border' 
                      : 'border-white/5'
                  } flex flex-col justify-between min-h-[150px]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate text-white dark:text-white light:text-indigo-900" title={note.fileName}>{note.fileName}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-semibold text-slate-400">
                        <Tag className="w-3 h-3 text-purple-400" />
                        <span>{note.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 dark:border-white/5 light:border-zinc-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(note.uploadDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <a 
                        href={note.fileURL} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 hover:border-purple-500/50 text-slate-400 hover:text-purple-400 light:text-zinc-600 light:hover:text-indigo-600 transition-colors"
                        title="View Original File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleGenerateSummary(note)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-[10px] font-semibold text-white flex items-center gap-1 transition-colors"
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

              {/* Note meta */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Gemini AI Study Report</span>
              </div>

              <h2 className="text-lg font-bold text-white dark:text-white light:text-indigo-950 mb-1">{activeNote.fileName}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400">
                {activeNote.subject}
              </span>

              {/* SUMMARY AREA */}
              <div className="mt-6 space-y-5">
                
                {/* 1. Main Markdown summary text */}
                <div>
                  <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-1 mb-2.5 uppercase tracking-wide">Concept Summary</h3>
                  <div className="text-xs text-slate-300 dark:text-slate-300 light:text-zinc-700 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                    {activeNote.summary || "No summary generated yet. Click 'Generate AI' on this note card to solve!"}
                  </div>
                </div>

                {/* 2. Key Takeaways */}
                {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white dark:text-white light:text-indigo-900 border-b border-white/5 dark:border-white/5 light:border-zinc-200 pb-1 mb-2.5 uppercase tracking-wide">Exam Study Takeaways</h3>
                    <ul className="space-y-2">
                      {activeNote.keyTakeaways.map((take, tIdx) => (
                        <li key={tIdx} className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-600 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{take}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

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
