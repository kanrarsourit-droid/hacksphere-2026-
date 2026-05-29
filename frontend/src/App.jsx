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
import PortalHome from './pages/PortalHome';
import NoticeBoard from './pages/NoticeBoard';
import Statistics from './pages/Statistics';
import Features from './pages/Features';
import Subjects from './pages/Subjects';
import AITools from './pages/AITools';

// Services
import { listenToAuthChanges, logoutUser, setFirebaseOffline } from './services/db';

// Services
// (Note: Removed duplicate imports or placeholders)

/**
 * SkillSync AI - Main Application Assembler
 */
function App() {
  // Navigation State: 'home' | 'login' | 'dashboard'
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('skillsync_current_page') || 'home';
  });
  
  // Dashboard Sub-Tab State: 'home' | 'dashboard' | 'notes' | 'quiz' | 'chatbot' | 'roadmap' | 'profile' | 'notice_board'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('skillsync_active_tab') || 'home';
  });
  
  // User Session State
  const [activeUser, setActiveUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Deep link context (for starting quiz based on a specific note upload)
  const [initialQuizNote, setInitialQuizNote] = useState(null);

  // Persist current page & tab when changed
  useEffect(() => {
    localStorage.setItem('skillsync_current_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('skillsync_active_tab', activeTab);
  }, [activeTab]);

  // Listen to Firebase or Local Storage Authentication changes
  useEffect(() => {
    let resolved = false;

    // Failsafe connection timer: if Firebase connection hangs for >2.5s, bypass loading screen!
    const failsafeTimer = setTimeout(() => {
      if (!resolved) {
        console.warn("⏱️ SkillSync Session Sync timed out. Bypassing loading screen...");
        
        // Check local storage for mock session before defaulting to null
        const mockSession = localStorage.getItem('active_mock_session');
        if (mockSession) {
          setActiveUser(JSON.parse(mockSession));
        } else {
          setActiveUser(null);
        }
        setLoadingSession(false);
      }
    }, 2500);

    const unsubscribe = listenToAuthChanges(async (user) => {
      resolved = true;
      clearTimeout(failsafeTimer);
      
      if (user) {
        // Strict role bypass check for both standard and Google SSO
        const selectedRole = localStorage.getItem('skillsync_oauth_role') || user.role;
        
        if (user.role && selectedRole && user.role !== selectedRole) {
          console.warn("🔐 SkillSync Security: Role Mismatch Detected! User role:", user.role, "Chosen role:", selectedRole);
          
          // Clear active session to prevent access
          localStorage.removeItem('active_mock_session');
          localStorage.removeItem('skillsync_current_page');
          localStorage.removeItem('skillsync_active_tab');
          localStorage.removeItem('skillsync_oauth_role');
          
          await logoutUser();
          
          setActiveUser(null);
          setCurrentPage('login');
          
          sessionStorage.setItem('skillsync_auth_error', `This email address is registered as a ${user.role === 'teacher' ? 'Teacher' : 'Student'}. Please log in using the correct portal.`);
          window.dispatchEvent(new Event('skillsync_role_mismatch'));
          setLoadingSession(false);
          return;
        }

        setActiveUser(user);
        setLoadingSession(false);
        setCurrentPage('dashboard');
        
        // Restore their exact tab they had open before reload!
        const restoredTab = localStorage.getItem('skillsync_active_tab');
        if (restoredTab && restoredTab !== 'home') {
          setActiveTab(restoredTab);
        }
      } else {
        // Only reset to home if they are not already on other public routes
        setCurrentPage(prev => {
          if (['features', 'subjects', 'aitools', 'login'].includes(prev)) return prev;
          return 'home';
        });
      }
    });

    return () => {
      clearTimeout(failsafeTimer);
      unsubscribe();
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      // 1. Immediately clear local states and session cache so UI updates instantly
      localStorage.removeItem('active_mock_session');
      localStorage.removeItem('skillsync_current_page');
      localStorage.removeItem('skillsync_active_tab');
      setActiveUser(null);
      setCurrentPage('home');
      setActiveTab('home');
      
      // 2. Perform DB logout in the background without blocking the UI
      logoutUser().catch(err => console.warn("Background signout issue:", err));
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Login Success Callback
  const handleLoginSuccess = (user) => {
    setActiveUser(user);
    setCurrentPage('dashboard');
    setActiveTab('home');
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
          onNavigate={(page) => {
            setCurrentPage(page);
          }}
          activeUser={activeUser}
          onLogout={handleLogout}
        />

        {/* Main Work Area Panel */}
        <main className="flex-1 md:ml-64 px-6 md:px-8 py-20 md:py-8 min-h-screen overflow-y-auto max-w-7xl mx-auto w-full relative">
          {activeTab === 'home' && (
            <PortalHome 
              activeUser={activeUser} 
              onTabChange={(tabId) => {
                setActiveTab(tabId);
                // Clear deep-link quiz context if student clicks on a different tab manually
                if (tabId !== 'quiz') setInitialQuizNote(null);
              }} 
            />
          )}

          {activeTab === 'notice_board' && (
            <NoticeBoard activeUser={activeUser} />
          )}

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
          
          {activeTab === 'stats' && (
            <Statistics activeUser={activeUser} />
          )}
          
          {activeTab === 'quiz' && (
            <QuizGenerator 
              activeUser={activeUser} 
              initialNoteContext={initialQuizNote} 
              onNavigateToNotes={() => setActiveTab('notes')}
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
            <Profile 
              activeUser={activeUser} 
              onUpdateUser={(updatedFields) => {
                setActiveUser(prev => ({ ...prev, ...updatedFields }));
              }}
            />
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
          setActiveTab('home');
        }} 
      />

      {/* Main Public Viewport Pages */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <Home 
            onNavigate={(page) => {
              setCurrentPage(page);
              setActiveTab('home');
            }} 
          />
        )}

        {currentPage === 'features' && (
          <Features 
            onNavigate={(page) => {
              setCurrentPage(page);
              setActiveTab('home');
            }} 
          />
        )}

        {currentPage === 'subjects' && (
          <Subjects 
            onNavigate={(page) => {
              setCurrentPage(page);
              setActiveTab('home');
            }} 
          />
        )}

        {currentPage === 'aitools' && (
          <AITools 
            onNavigate={(page) => {
              setCurrentPage(page);
              setActiveTab('home');
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
          setActiveTab('home');
        }} 
      />
    </div>
  );
}

export default App;
