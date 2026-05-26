import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Terminal, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  Key,
  FileText
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import { solveAcademicDoubt } from '../services/ai';
import { getUserNotes } from '../services/db';

/**
 * SkillSync AI - Futuristic AI Doubt Solver Chatbot Terminal
 */
const DoubtSolver = ({ activeUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "### Hello student! 👋\n\nI am your dedicated **SkillSync AI Doubt Solver**. I'm connected to the Google Gemini model in the cloud to act as your personalized 24/7 study mentor.\n\nYou can select a **Focus Subject** and reference any **Uploaded Study Note** from the select boxes below, then ask me absolutely any question. I will read your document and explain it step-by-step!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Subject and Note selector states
  const [subjectsList] = useState(['General Studies', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology', 'Literature']);
  const [selectedSubject, setSelectedSubject] = useState('General Studies');
  const [notesList, setNotesList] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load user notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      if (!activeUser) return;
      try {
        setLoadingNotes(true);
        const notes = await getUserNotes(activeUser.uid, activeUser.role || 'student');
        setNotesList(notes);
      } catch (err) {
        console.error("Failed to load notes for Doubt Solver:", err);
      } finally {
        setLoadingNotes(false);
      }
    };
    loadNotes();
  }, [activeUser]);

  // Gemini API Key Management
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    const cached = localStorage.getItem('skillsync_gemini_api_key') || "";
    if (cached.startsWith("AIzaSyCaBiUhrrycUwCjLYnoyL0WwqYA3qbeKdU") || cached.startsWith("sk-proj") || cached.startsWith("AIzaSyAcor3Xr3HMWyCBbEmkFV6TrR_xCof28NQ")) {
      localStorage.removeItem('skillsync_gemini_api_key');
      return "";
    }
    return cached;
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clickable shortcut suggestions
  const suggestions = [
    { label: "What is Schrödinger's Equation?", text: "What is Schrödinger's Equation? Explain the terms simply and step-by-step." },
    { label: "Explain quantum mechanics", text: "Explain quantum mechanics simply in 3 paragraphs with bullet points." },
    { label: "Help me debug React useEffect", text: "Explain how a React useEffect dependency array works and how to prevent infinite loops." },
    { label: "Explain photosynthesis formula", text: "Explain the photosynthesis balanced formula and phases step-by-step." }
  ];

  // Custom text formatter to support markdown in chat bubbles
  const formatMessageText = (text) => {
    if (!text) return "";
    
    // Split text by lines to parse block elements
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent = [];

    return lines.map((line, idx) => {
      // 1. Parse fenced code block entry/exit
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeContent.join('\n');
          codeContent = [];
          return (
            <pre key={idx} className="my-3 p-4 bg-zinc-950/90 text-emerald-400 font-mono text-[11px] rounded-xl border border-white/5 overflow-x-auto shadow-inner">
              <code>{codeString}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null; // Don't render entry string
        }
      }

      // If inside code block, accumulate code text
      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // 2. Parse Markdown headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-white dark:text-white light:text-indigo-900 mt-3 mb-1.5">{line.substring(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-bold text-white dark:text-white light:text-indigo-900 mt-2 mb-1">{line.substring(5)}</h4>;
      }

      // 3. Parse Markdown lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-300 dark:text-slate-300 light:text-zinc-700 my-1 leading-relaxed">
            {parseInlineStyles(line.trim().substring(2))}
          </li>
        );
      }

      // 4. Default Paragraph
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs text-slate-300 dark:text-slate-300 light:text-zinc-700 my-1 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to parse bold text (**word**)
  const parseInlineStyles = (line) => {
    const parts = line.split('**');
    return parts.map((part, index) => {
      // Every odd indices are words wrapped in **
      if (index % 2 === 1) {
        return <strong key={index} className="text-white dark:text-white light:text-indigo-950 font-bold">{part}</strong>;
      }
      return part;
    });
  };

  // Submit Handler
  const handleSend = async (messageText) => {
    const query = messageText || input;
    if (!query.trim()) return;

    const refNote = selectedNoteId ? notesList.find(n => n.id === selectedNoteId) : null;

    // Append user message with active context values
    const userMsgId = 'msg_' + Date.now();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date(),
      subject: selectedSubject !== 'General Studies' ? selectedSubject : null,
      noteName: refNote ? refNote.fileName : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Build rich query context by embedding the selected note contents
      let richSubjectContext = selectedSubject;
      if (refNote) {
        richSubjectContext = `${selectedSubject} | Study Document Reference: "${refNote.fileName}" (Class: ${refNote.subject}). Document Core Content & AI Summary Context: ${refNote.summary || "General study overview"}`;
      }

      // Connect to Gemini solver wrapper
      const aiReplyText = await solveAcademicDoubt(
        messages.filter(m => m.id !== 'welcome'), // Exclude welcome string context
        query,
        richSubjectContext
      );

      // Append AI reply
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date(),
          subject: selectedSubject !== 'General Studies' ? selectedSubject : null,
          noteName: refNote ? refNote.fileName : null
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save Dynamic API Key
  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = tempKey.trim();
    if (!cleanKey) {
      alert("Please enter a valid API Key.");
      return;
    }
    localStorage.setItem('skillsync_gemini_api_key', cleanKey);
    setGeminiApiKey(cleanKey);
    setShowKeyConfig(false);
    
    if (cleanKey.startsWith("sk-")) {
      alert("OpenAI API Key successfully updated! Live GPT model initialized.");
    } else {
      alert("Gemini API Key successfully updated! Live Gemini model initialized.");
    }
  };

  // Clear Dynamic API Key
  const handleClearKey = () => {
    localStorage.removeItem('skillsync_gemini_api_key');
    setGeminiApiKey("");
    setTempKey("");
    setShowKeyConfig(false);
    alert("Key cleared! Defaulting back to high-fidelity Offline AI Simulator.");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh] animate-fade-in pb-4 relative">
      
      {/* DEVELOPER API KEY MODAL OVERLAY */}
      {showKeyConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 text-left shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="text-purple-400 w-5 h-5" />
              Configure Cloud AI API Key
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enter your own personal <strong>Google Gemini</strong> or <strong>OpenAI ChatGPT</strong> API Key to connect directly to the active live cloud AI models. 
              This allows the Doubt Solver to answer absolutely any academic question, derivation, or coding task dynamically!
            </p>

            <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-lg text-[10px] text-purple-300 leading-relaxed mb-4 space-y-1.5">
              <div>
                🟢 <strong>Option A (OpenAI):</strong> Paste your OpenAI key starting with <code>sk-...</code>. Works extremely stably.
              </div>
              <div>
                🔵 <strong>Option B (Gemini):</strong> Paste your Gemini key starting with <code>AIzaSy...</code> from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-400 hover:text-purple-300">Google AI Studio</a>.
              </div>
            </div>

            <form onSubmit={handleSaveKey}>
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Cloud API Key (Gemini or OpenAI)</label>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="sk-... or AIzaSy..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                {geminiApiKey && (
                  <button 
                    type="button" 
                    onClick={handleClearKey}
                    className="px-3.5 py-2 bg-red-950/30 border border-red-500/20 text-red-400 hover:bg-red-900/10 text-xs rounded-xl transition-colors font-semibold"
                  >
                    Clear Key
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => { setShowKeyConfig(false); setTempKey(geminiApiKey); }}
                  className="px-3.5 py-2 bg-transparent hover:bg-white/5 text-slate-400 text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="pb-4 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 
            onDoubleClick={() => setShowKeyConfig(true)}
            title="Double-click to configure AI credentials"
            className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950 cursor-default select-none hover:text-purple-400 transition-colors"
          >
            AI Doubt Solver Chatbot
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
            Solve academic equations, coding syntax bugs, or literature reviews instantly.
          </p>
        </div>
      </div>

      {/* DYNAMIC SUBJECT & NOTE REFERENCE CONSOLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-white/5 dark:bg-white/3 light:bg-indigo-50/40 border border-white/8 dark:border-white/5 light:border-zinc-200/80 mt-4 shrink-0 shadow-sm">
        
        {/* Subject dropdown selector */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[9px] font-extrabold text-slate-450 dark:text-slate-400 light:text-zinc-550 uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-450 dark:text-purple-400" />
            <span>Select Focus Subject</span>
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-space-950 dark:bg-space-950 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-indigo-950 cursor-pointer shadow-inner transition-colors"
          >
            {subjectsList.map((sub) => (
              <option key={sub} value={sub} className="bg-space-950 text-white dark:text-white light:text-indigo-950 dark:bg-space-950 light:bg-white">
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Note dropdown selector */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[9px] font-extrabold text-slate-455 dark:text-slate-400 light:text-zinc-555 uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-pink-450 dark:text-pink-400 animate-pulse" />
            <span>Reference Study Note</span>
          </label>
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            disabled={loadingNotes}
            className="w-full bg-space-950 dark:bg-space-950 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-indigo-950 cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="" className="bg-space-950 text-white dark:text-white light:text-indigo-950 dark:bg-space-950 light:bg-white">
              {loadingNotes ? '⏳ Loading classroom notes...' : '🚫 No specific note reference'}
            </option>
            {notesList.map((note) => (
              <option key={note.id} value={note.id} className="bg-space-950 text-white dark:text-white light:text-indigo-950 dark:bg-space-950 light:bg-white">
                {note.fileName} ({note.subject})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* SUGGESTIONS PANEL */}
      <div className="flex gap-2 py-3 overflow-x-auto shrink-0 scrollbar-none">
        {suggestions.map((sug, sIdx) => (
          <button
            key={sIdx}
            onClick={() => handleSend(sug.text)}
            className="px-3.5 py-1.5 rounded-full border border-white/10 dark:border-white/5 light:border-zinc-200/80 bg-white/5 dark:bg-white/5 light:bg-white hover:bg-purple-600/10 hover:border-purple-500/40 hover:text-purple-400 text-[10px] font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-600 transition-all shrink-0 active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
            {sug.label}
          </button>
        ))}
      </div>

      {/* CHAT DISPLAY SPACE */}
      <div className="flex-1 overflow-y-auto pr-2 my-2 space-y-4 min-h-0">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          
          return (
            <div 
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  isUser 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white'
                }`}>
                  {isUser ? <Terminal className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble Card */}
                <div className={`p-4 rounded-2xl border ${
                  isUser
                    ? 'bg-purple-600/20 border-purple-500/30 text-white rounded-tr-none shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'glass-panel text-slate-300 dark:text-slate-300 light:text-zinc-800 rounded-tl-none border-white/8 dark:border-white/5 light:border-zinc-200/80'
                }`}>
                  {/* Context Badges */}
                  {(msg.subject || msg.noteName) && (
                    <div className="flex flex-wrap gap-1.5 mb-2 pl-0.5">
                      {msg.subject && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center gap-1 shadow-sm">
                          <BookOpen className="w-2.5 h-2.5" />
                          {msg.subject}
                        </span>
                      )}
                      {msg.noteName && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-500/10 border border-pink-500/25 text-pink-400 flex items-center gap-1 shadow-sm">
                          <FileText className="w-2.5 h-2.5" />
                          {msg.noteName}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    {formatMessageText(msg.text)}
                  </div>
                  <span className="text-[8px] text-slate-500 block text-right mt-2 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            </div>
          );
        })}

        {/* LOADING INDICATOR BUBBLE */}
        {loading && (
          <div className="flex w-full justify-start animate-fade-in">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <LoadingState type="typing" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM FIELD */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-white/5 dark:bg-white/3 light:bg-indigo-50/50 p-2.5 rounded-2xl border border-white/10 dark:border-white/5 light:border-zinc-200/80 shrink-0 shadow-lg relative"
      >
        <input
          type="text"
          disabled={loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI study doubt (e.g. 'What is Schrödinger\'s Equation?')"
          className="flex-1 bg-transparent px-3 text-xs focus:outline-none text-white dark:text-white light:text-indigo-950"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            input.trim() && !loading
              ? 'btn-neon scale-100'
              : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};

export default DoubtSolver;
