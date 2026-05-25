import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  BookOpen, 
  RotateCcw,
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import { getUserNotes, saveQuizResult } from '../services/db';
import { generateQuizFromNote } from '../services/ai';

/**
 * SkillSync AI - Interactive Exam Simulator and AI Quiz Generator
 */
const QuizGenerator = ({ activeUser, initialNoteContext, onQuizFinished }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(initialNoteContext ? initialNoteContext.id : "");
  const [quizType, setQuizType] = useState("mcq"); // mcq, true_false, short_answer
  const [subject, setSubject] = useState(initialNoteContext ? initialNoteContext.subject : "Physics");

  // Flow State: 'setup' | 'loading' | 'active' | 'graded'
  const [flowState, setFlowState] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores selected answers
  
  // Results
  const [score, setScore] = useState(0);
  const [gradingDetails, setGradingDetails] = useState([]);
  const [savingResult, setSavingResult] = useState(false);

  // Subject choices for general tests
  const subjectsList = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "Economics", "History"];

  useEffect(() => {
    const loadNotes = async () => {
      if (!activeUser) return;
      try {
        const userNotes = await getUserNotes(activeUser.uid);
        setNotes(userNotes);
        
        // If an initial note context was passed from uploader page, select it!
        if (initialNoteContext) {
          setSelectedNote(initialNoteContext.id);
          setSubject(initialNoteContext.subject);
        } else if (userNotes.length > 0) {
          setSelectedNote(userNotes[0].id);
          setSubject(userNotes[0].subject);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadNotes();
  }, [activeUser, initialNoteContext]);

  // Sync subject when selected note changes
  const handleNoteChange = (noteId) => {
    setSelectedNote(noteId);
    const selected = notes.find(n => n.id === noteId);
    if (selected) {
      setSubject(selected.subject);
    }
  };

  // Launch AI Quiz creation
  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setFlowState("loading");
    
    let noteText = "";
    let noteTitle = "";
    
    // Find text context from chosen note
    if (selectedNote) {
      const active = notes.find(n => n.id === selectedNote);
      if (active) {
        noteText = active.summary || `Syllabus review of ${active.subject}`;
        noteTitle = active.fileName;
      }
    } else {
      noteTitle = `General ${subject} Test`;
      noteText = `General academic curriculum guidelines for the subject ${subject}`;
    }

    try {
      // Connect to Google Gemini API to fetch dynamic questions
      const aiQuestions = await generateQuizFromNote(
        noteTitle,
        subject,
        quizType,
        noteText
      );
      
      setQuestions(aiQuestions);
      setCurrentIdx(0);
      setAnswers({});
      setFlowState("active");
    } catch (err) {
      console.error(err);
      setFlowState("setup");
    }
  };

  // Option selection
  const handleSelectOption = (option) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: option
    }));
  };

  // Next question
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Previous question
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Submit and Grade
  const handleSubmitQuiz = async () => {
    let earnedPoints = 0;
    const details = [];

    questions.forEach((q, idx) => {
      const studentAns = answers[idx] || "";
      const isCorrect = studentAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
      
      if (isCorrect) earnedPoints += 20; // 20 points per question (5 questions total = 100 max score)

      details.push({
        question: q.question,
        options: q.options,
        studentAnswer: studentAns,
        correctAnswer: q.answer,
        explanation: q.explanation,
        isCorrect
      });
    });

    setScore(earnedPoints);
    setGradingDetails(details);
    setFlowState("graded");
    setSavingResult(true);

    try {
      // Save results permanently to database logs
      await saveQuizResult({
        userId: activeUser.uid,
        noteId: selectedNote || 'general',
        subject,
        score: earnedPoints,
        maxScore: 100
      });
      
      // Notify parent to refresh streak or dashboard counts
      if (onQuizFinished) onQuizFinished();
      
    } catch (err) {
      console.error("Failed to save quiz results:", err);
    } finally {
      setSavingResult(false);
    }
  };

  // Get dynamic Grade lettering
  const getLetterGrade = (points) => {
    if (points >= 90) return { letter: "A+", desc: "Outstanding!", color: "text-emerald-400" };
    if (points >= 80) return { letter: "A", desc: "Excellent!", color: "text-indigo-400" };
    if (points >= 60) return { letter: "B", desc: "Good Job!", color: "text-purple-400" };
    if (points >= 40) return { letter: "C", desc: "Keep practicing", color: "text-amber-400" };
    return { letter: "F", desc: "Needs Work", color: "text-red-400" };
  };

  // ==========================================
  // VIEW 1: SETUP PANEL
  // ==========================================
  if (flowState === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950">AI Quiz Generator</h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            Build interactive, customized practice exams from your study notes using Gemini AI.
          </p>
        </div>

        <GlassCard className="p-6 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>

          <form onSubmit={handleStartQuiz} className="space-y-6">
            
            {/* 1. Context Source Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Choose Study Context</label>
              <select
                value={selectedNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
              >
                <option value="">General Subject Test (No document required)</option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id} className="bg-space-900 text-white dark:bg-space-950 dark:text-white light:bg-white light:text-indigo-950">Document Note: {note.fileName}</option>
                ))}
              </select>
            </div>

            {/* 2. Subject Selector (Only active if general test selected) */}
            {!selectedNote && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Select General Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                >
                  {subjectsList.map((sub, sIdx) => (
                    <option key={sIdx} value={sub} className="bg-space-900 text-white dark:bg-space-950 dark:text-white light:bg-white light:text-indigo-950">{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Quiz format choices */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Quiz Question Format</label>
              <div className="grid grid-cols-3 gap-3">
                
                {/* MCQ option */}
                <button
                  type="button"
                  onClick={() => setQuizType("mcq")}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    quizType === 'mcq'
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-sm'
                      : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-400 light:text-zinc-600 hover:border-purple-500/25'
                  }`}
                >
                  Multiple Choice
                </button>

                {/* True/False option */}
                <button
                  type="button"
                  onClick={() => setQuizType("true_false")}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    quizType === 'true_false'
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm'
                      : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-400 light:text-zinc-600 hover:border-indigo-500/25'
                  }`}
                >
                  True / False
                </button>

                {/* Short Answer option */}
                <button
                  type="button"
                  onClick={() => setQuizType("short_answer")}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    quizType === 'short_answer'
                      ? 'bg-pink-600/10 border-pink-500 text-pink-400 shadow-sm'
                      : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-400 light:text-zinc-600 hover:border-pink-500/25'
                  }`}
                >
                  Short Q&A
                </button>

              </div>
            </div>

            {/* Launch Action */}
            <button
              type="submit"
              className="btn-neon w-full flex items-center justify-center gap-2 !py-2.5 text-xs font-bold mt-4"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>Generate Gemini AI Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        </GlassCard>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOADING PROGRESS SPINNER
  // ==========================================
  if (flowState === "loading") {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex items-center justify-center">
        <GlassCard className="p-8 border border-white/5 w-full flex items-center justify-center">
          <LoadingState message={`Gemini is building your 5-Question ${subject} Quiz...`} />
        </GlassCard>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: LIVE ACTIVE EXAM PANEL
  // ==========================================
  if (flowState === "active" && questions.length > 0) {
    const q = questions[currentIdx];
    const isAnswered = answers[currentIdx] !== undefined;
    const selectedAns = answers[currentIdx] || "";
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-400">
              {subject}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Active Quiz</span>
          </div>
          
          {/* Question marker */}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-zinc-700">Question {currentIdx + 1} of {questions.length}</span>
        </div>

        {/* PROGRESS NEON BAR */}
        <div className="w-full bg-white/5 dark:bg-white/5 light:bg-zinc-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* QUESTION DISPLAY CONTAINER */}
        <GlassCard className="p-6 border border-white/5 relative">
          
          {/* Glowing dot index marker */}
          <div className="absolute top-6 left-6 w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs">
            {currentIdx + 1}
          </div>

          <div className="pl-12 min-h-[140px] flex flex-col justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-indigo-950 leading-relaxed mb-6">
              {q.question}
            </h3>

            {/* OPTIONS CHANNELS (MCQ / True/False) */}
            {q.options && q.options.length > 0 ? (
              <div className="space-y-3">
                {q.options.map((opt, oIdx) => {
                  const isChecked = selectedAns === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-5 py-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-md font-bold'
                          : 'bg-white/3 dark:bg-white/2 light:bg-white border-white/5 dark:border-white/5 light:border-zinc-200 text-slate-300 dark:text-slate-300 light:text-zinc-700 hover:bg-white/5 dark:hover:bg-white/4 light:hover:bg-indigo-50/40 hover:border-purple-500/20'
                      }`}
                    >
                      <span>{opt}</span>
                      {isChecked && <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* SHORT ANSWER INPUT BOX */
              <div className="space-y-2 mt-4">
                <label className="text-xs text-slate-500 font-semibold pl-1">Type your response below</label>
                <textarea
                  placeholder="Explain your answer conceptually here..."
                  rows={3}
                  value={selectedAns}
                  onChange={(e) => handleSelectOption(e.target.value)}
                  className="w-full p-4 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors resize-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 italic pl-1">Note: AI will evaluate your conceptual matching keywords upon submit.</p>
              </div>
            )}

          </div>

        </GlassCard>

        {/* BOTTOM STEER NAVIGATION BUTTONS */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              currentIdx === 0
                ? 'opacity-40 border-white/5 cursor-not-allowed text-slate-500'
                : 'border-white/10 hover:border-purple-500/30 text-slate-300 dark:text-slate-300 light:text-indigo-900 light:border-zinc-200 light:hover:bg-indigo-50'
            }`}
          >
            Previous
          </button>

          {currentIdx === questions.length - 1 ? (
            /* SUBMIT FINAL QUIZ TRIGGER */
            <button
              onClick={handleSubmitQuiz}
              disabled={!isAnswered}
              className={`btn-neon flex items-center gap-2 !py-2.5 !px-6 text-xs font-bold ${
                !isAnswered ? 'opacity-50 cursor-not-allowed hover:scale-100 shadow-none' : ''
              }`}
            >
              <span>Submit & Grade Quiz</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            /* NEXT TRIGGER */
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-5 py-2.5 bg-white/5 dark:bg-white/5 light:bg-indigo-50 border border-white/10 hover:border-purple-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-slate-200 dark:text-slate-200 light:text-indigo-900 ${
                !isAnswered ? 'opacity-40 cursor-not-allowed hover:border-white/10' : 'hover:scale-[1.02]'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 4: GRADED SCORE AND DIAGNOSTIC REPORTS
  // ==========================================
  if (flowState === "graded") {
    const grade = getLetterGrade(score);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
        
        {/* Graded success card */}
        <GlassCard className="p-8 border border-white/5 text-center relative overflow-hidden bg-gradient-to-b from-indigo-500/5 to-transparent">
          
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-purple-500/10 blur-[50px] pointer-events-none" />

          {/* Letter Grade Circle Badge */}
          <div className="mx-auto w-24 h-24 rounded-full border-4 border-white/10 dark:border-white/5 light:border-zinc-200 flex flex-col justify-center items-center relative mb-4">
            {/* Pulsing neon halo */}
            <div className="absolute inset-0 rounded-full blur-[10px] bg-purple-500/20 animate-pulse" />
            
            <span className={`text-4xl font-extrabold tracking-tight ${grade.color}`}>{grade.letter}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{grade.desc}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white dark:text-white light:text-indigo-950">Test Grade: {score}%</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 max-w-xs mx-auto mt-1">
            You scored {score / 20} out of 5 correct answers in this AI study milestone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => setFlowState("setup")}
              className="btn-neon flex items-center justify-center gap-1.5 !py-2 !px-5 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              Retake / New Quiz
            </button>
            
            {onQuizFinished && (
              <button
                onClick={() => onQuizFinished()}
                className="btn-neon-secondary flex items-center justify-center gap-1.5 !py-2 !px-5 text-xs font-bold"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </GlassCard>

        {/* DETAILED QUESTION-BY-QUESTION GRADE REPORT */}
        <div className="space-y-4">
          <div className="pb-1 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-indigo-950">Diagnostic Analysis Report</h3>
            <p className="text-xs text-slate-500">Read Gemini's step-by-step explanations for each query</p>
          </div>

          <div className="space-y-4">
            {gradingDetails.map((item, idx) => (
              <GlassCard 
                key={idx} 
                className={`p-5 border ${
                  item.isCorrect 
                    ? 'border-emerald-500/20 bg-emerald-500/3 dark:bg-emerald-500/2 light:bg-emerald-50/20' 
                    : 'border-red-500/20 bg-red-500/3 dark:bg-red-500/2 light:bg-red-50/20'
                }`}
              >
                
                {/* Visual Status Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    item.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Question {idx + 1}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    item.isCorrect ? 'text-emerald-400' : 'text-red-400'
                  }`}>{item.isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>

                {/* Question */}
                <h4 className="text-sm font-bold text-white dark:text-white light:text-indigo-950 mb-3">{item.question}</h4>

                {/* Answers grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3.5">
                  <div className="p-2.5 rounded-lg bg-black/20 dark:bg-black/30 light:bg-white border border-white/5 dark:border-white/5 light:border-zinc-200">
                    <span className="text-[9px] text-slate-500 block">Your Answer:</span>
                    <span className={`font-semibold ${item.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{item.studentAnswer || "Not answered"}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/20 dark:bg-black/30 light:bg-white border border-white/5 dark:border-white/5 light:border-zinc-200">
                    <span className="text-[9px] text-slate-500 block">Correct Answer:</span>
                    <span className="font-semibold text-emerald-400">{item.correctAnswer}</span>
                  </div>
                </div>

                {/* AI Explanation block */}
                <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/10 text-xs text-slate-400 dark:text-slate-400 light:text-zinc-600 leading-relaxed">
                  <span className="font-bold text-purple-400 dark:text-purple-400 light:text-indigo-700 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Explanations:
                  </span>
                  {item.explanation || "Gemini recommends double-checking key textbook pages regarding this syllabus question."}
                </div>

              </GlassCard>
            ))}
          </div>

        </div>

      </div>
    );
  }

  return null;
};

export default QuizGenerator;
