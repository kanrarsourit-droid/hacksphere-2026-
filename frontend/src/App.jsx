import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotesUpload from './pages/NotesUpload';
import QuizGenerator from './pages/QuizGenerator';
import DoubtSolver from './pages/DoubtSolver';
import Roadmap from './pages/Roadmap';
import Profile from './pages/Profile';

// Services
import { listenToAuthChanges, logoutUser } from './services/db';

// Services
// (Note: Removed duplicate imports or placeholders)

/**
 * SkillSync AI - Main Application Assembler
 */
function App() {
  // Navigation State: 'home' | 'login' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  
  // Dashboard Sub-Tab State: 'dashboard' | 'notes' | 'quiz' | 'chatbot' | 'roadmap' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // User Session State
  const [activeUser, setActiveUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Deep link context (for starting quiz based on a specific note upload)
  const [initialQuizNote, setInitialQuizNote] = useState(null);

  // Listen to Firebase or Local Storage Authentication changes
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((user) => {
      setActiveUser(user);
      setLoadingSession(false);
      
      // Auto-transition to dashboard if user logs in
      if (user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('home');
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setActiveUser(null);
      setCurrentPage('home');
      setActiveTab('dashboard');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Login Success Callback
  const handleLoginSuccess = (user) => {
    setActiveUser(user);
    setCurrentPage('dashboard');
    setActiveTab('dashboard');
  };

  // Deep Link Trigger: Start Quiz from Notes Upload page
  const handleStartQuizFromNote = (note) => {
    setInitialQuizNote(note);
    setActiveTab('quiz');
  };

  // Render Loading spinner on boot
  if (loadingSession) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-space-950 text-white">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Synchronizing SkillSync AI Session...</span>
      </div>
    );
  }

  // ==========================================
  // VIEWPORT LAYOUT ROUTING MAP
  // ==========================================

  // 1. DASHBOARD INTERNAL LAYOUT (Sidebar + Main Tab Panel)
  if (currentPage === 'dashboard' && activeUser) {
    return (
      <div className="min-h-screen bg-space-950 dark:bg-space-950 light:bg-zinc-50 transition-colors duration-500 text-white dark:text-white light:text-zinc-900 flex flex-col md:flex-row">
        
        {/* Left collapsable Sidebar console */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            // Clear deep-link quiz context if student clicks on a different tab manually
            if (tabId !== 'quiz') setInitialQuizNote(null);
          }}
          activeUser={activeUser}
          onLogout={handleLogout}
        />

        {/* Main Work Area Panel */}
        <main className="flex-1 md:ml-64 px-6 md:px-8 py-20 md:py-8 min-h-screen overflow-y-auto max-w-7xl mx-auto w-full relative">
          {activeTab === 'dashboard' && (
            <Dashboard 
              activeUser={activeUser} 
              onTabChange={(tabId) => {
                setActiveTab(tabId);
                if (tabId !== 'quiz') setInitialQuizNote(null);
              }} 
            />
          )}
          
          {activeTab === 'notes' && (
            <NotesUpload 
              activeUser={activeUser} 
              onStartQuiz={handleStartQuizFromNote} 
            />
          )}
          
          {activeTab === 'quiz' && (
            <QuizGenerator 
              activeUser={activeUser} 
              initialNoteContext={initialQuizNote} 
              onQuizFinished={() => {
                // Return to dashboard and clear initial quiz context
                setInitialQuizNote(null);
              }}
            />
          )}
          
          {activeTab === 'chatbot' && (
            <DoubtSolver activeUser={activeUser} />
          )}
          
          {activeTab === 'roadmap' && (
            <Roadmap activeUser={activeUser} />
          )}
          
          {activeTab === 'profile' && (
            <Profile activeUser={activeUser} />
          )}
        </main>
      </div>
    );
  }

  // 2. LANDING PAGE & ONBOARDING LAYOUTS (Standard Top Navbar + Footer Scaffolding)
  return (
    <div className="min-h-screen bg-space-950 dark:bg-space-950 light:bg-zinc-50 transition-colors duration-500 text-white dark:text-white light:text-zinc-900 flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Navbar 
        activeUser={activeUser} 
        onNavigate={(page) => {
          setCurrentPage(page);
          setActiveTab('dashboard');
        }} 
      />

      {/* Main Public Viewport Pages */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <Home 
            onNavigate={(page) => {
              setCurrentPage(page);
              setActiveTab('dashboard');
            }} 
          />
        )}
        
        {currentPage === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Dynamic Footer */}
      <Footer 
        onNavigate={(page) => {
          setCurrentPage(page);
          setActiveTab('dashboard');
        }} 
      />
    </div>
  );
}

export default App;
