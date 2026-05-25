import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Terminal, 
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import { solveAcademicDoubt } from '../services/ai';

/**
 * SkillSync AI - Futuristic AI Doubt Solver Chatbot Terminal
 */
const DoubtSolver = ({ activeUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "### Hello student! 👋\n\nI am your dedicated **SkillSync AI Doubt Solver**. I'm connected to the Google Gemini model in the cloud to act as your personalized 24/7 study mentor.\n\nYou can type any academic question, formula derivation, or coding bug below. I will explain it step-by-step!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clickable shortcut suggestions
  const suggestions = [
    { label: "Explain quantum mechanics simply", text: "Explain quantum mechanics simply in 3 paragraphs with bullet points." },
    { label: "Help me debug React useEffect", text: "Explain how a React useEffect dependency array works and how to prevent infinite loops." },
    { label: "List 5 high-speed revision tips", text: "What are the top 5 high-speed active recall revision tips for board exams?" },
    { label: "Explain supply and demand laws", text: "Provide a simple macroeconomics explanation of the laws of supply and demand." }
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

    // Append user message
    const userMsgId = 'msg_' + Date.now();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Connect to Gemini solver wrapper
      const aiReplyText = await solveAcademicDoubt(
        messages.filter(m => m.id !== 'welcome'), // Exclude welcome string context
        query,
        "General Studies"
      );

      // Append AI reply
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh] animate-fade-in pb-4">
      
      {/* Title */}
      <div className="pb-4 border-b border-white/5 dark:border-white/5 light:border-zinc-200/50 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-indigo-950">AI Doubt Solver Chatbot</h1>
        <p className="text-sm text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-1">
          Solve academic equations, coding syntax bugs, or literature reviews instantly with Gemini.
        </p>
      </div>

      {/* SUGGESTIONS PANEL */}
      <div className="flex gap-2 py-3 overflow-x-auto shrink-0 scrollbar-none">
        {suggestions.map((sug, sIdx) => (
          <button
            key={sIdx}
            onClick={() => handleSend(sug.text)}
            className="px-3.5 py-1.5 rounded-full border border-white/10 dark:border-white/5 light:border-zinc-200/80 bg-white/5 dark:bg-white/5 light:bg-white hover:bg-purple-600/10 hover:border-purple-500/40 hover:text-purple-400 text-[10px] font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-600 transition-all shrink-0 active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
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
                  <div className="space-y-1">
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
          placeholder="Ask your AI study doubt (e.g., 'What is F = ma?')"
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
