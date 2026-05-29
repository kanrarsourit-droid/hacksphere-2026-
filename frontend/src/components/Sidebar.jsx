import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  MessageSquareCode, 
  Map, 
  User, 
  LogOut, 
  Flame,
  Sparkles,
  Menu,
  X,
  Home as HomeNavIcon,
  Megaphone,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggler from './ThemeToggler';

/**
 * SkillSync AI - Dashboard Sidebar navigation console
 */
const Sidebar = ({ activeTab, onTabChange, activeUser, onLogout, onNavigate }) => {
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);

  const isTeacher = activeUser?.role === 'teacher';

  React.useEffect(() => {
    if (isTeacher) return;
    
    const checkNotices = () => {
      try {
        const saved = localStorage.getItem('skillsync_announcements');
        if (saved) {
          const announcements = JSON.parse(saved);
          if (announcements.length > 0) {
            const lastSeen = localStorage.getItem('skillsync_last_seen_notice') || "";
            if (lastSeen !== announcements[0].id) {
              setHasUnreadNotice(true);
              return;
            }
          }
        }
        setHasUnreadNotice(false);
      } catch (e) {
        console.error(e);
      }
    };

    checkNotices();

    // Event listeners for responsive dashboard resets
    window.addEventListener('skillsync_notices_read', checkNotices);
    window.addEventListener('storage', checkNotices);
    const interval = setInterval(checkNotices, 1000);

    return () => {
      window.removeEventListener('skillsync_notices_read', checkNotices);
      window.removeEventListener('storage', checkNotices);
      clearInterval(interval);
    };
  }, [isTeacher, activeTab]);

  // List of sidebar navigation links filtered dynamically by role!
  const menuItems = isTeacher 
    ? [
        { id: 'home', label: 'Portal Home', icon: HomeNavIcon },
        { id: 'notice_board', label: 'Notice Board', icon: Megaphone },
        { id: 'dashboard', label: 'Teacher Console', icon: LayoutDashboard },
        { id: 'notes', label: 'Curriculum Studio', icon: FileText },
        { id: 'stats', label: 'Classroom Analytics', icon: BarChart3 },
        { id: 'profile', label: 'Teacher Profile', icon: User },
      ]
    : [
        { id: 'home', label: 'Portal Home', icon: HomeNavIcon },
        { id: 'notice_board', label: 'Notice Board', icon: Megaphone },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'notes', label: 'Classroom Library', icon: FileText },
        { id: 'stats', label: 'Study Analytics', icon: BarChart3 },
        { id: 'quiz', label: 'AI Quiz', icon: BrainCircuit },
        { id: 'chatbot', label: 'Doubt Solver', icon: MessageSquareCode },
        { id: 'roadmap', label: 'Roadmap timeline', icon: Map },
        { id: 'profile', label: 'Student Profile', icon: User },
      ];

  const handleMenuClick = (itemId) => {
    onTabChange(itemId);
    setMobileOpen(false);
  };

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      onTabChange('home');
    }
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div>
        {/* BRAND BRANDING */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2 px-3 mb-8 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-indigo-950">
            SkillSync <span className="text-gradient">AI</span>
          </span>
        </div>

        {/* PROFILE CARD */}
        {activeUser && (
          <div className="glass-panel p-4 mb-6 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-200/60 bg-white/5 dark:bg-white/5 light:bg-indigo-50/50 flex items-center gap-3 relative overflow-hidden">
            <img 
              src={activeUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.uid}`}
              alt="avatar" 
              className="w-10 h-10 rounded-full border border-purple-500/20 bg-space-800 dark:bg-space-900 light:bg-white p-0.5"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate text-white dark:text-white light:text-indigo-900">{activeUser.displayName}</h4>
              <p className="text-[10px] text-purple-400 dark:text-purple-450 light:text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                {isTeacher ? "Class Teacher 👨‍🏫" : "Student Scholar 🎓"}
              </p>
            </div>
            
            {/* Streak or Staff Badge */}
            {isTeacher ? (
              <div className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-1 px-2 rounded-lg text-[9px] font-bold shadow-md shrink-0 border border-purple-500/30">
                <span>Staff</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-1 px-2 rounded-lg text-xs font-bold shadow-md animate-pulse shrink-0">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{activeUser.streak || 1}d</span>
              </div>
            )}
          </div>
        )}

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/5 dark:from-indigo-500/15 dark:to-pink-500/5 light:from-indigo-50 light:to-indigo-50 border-l-4 border-purple-500 dark:border-purple-400 light:border-indigo-600 text-purple-400 dark:text-purple-400 light:text-indigo-700 shadow-sm'
                    : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-zinc-600 light:hover:text-indigo-900 hover:bg-white/5 dark:hover:bg-white/3 light:hover:bg-indigo-50/40 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-purple-400 dark:text-purple-400 light:text-indigo-600' : ''}`} />
                <span>{item.label}</span>
                
                {item.id === 'notice_board' && hasUnreadNotice && (
                  <span className="relative flex h-2 w-2 ml-auto shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500 shadow-[0_0_10px_#ec4899]"></span>
                  </span>
                )}
                
                {/* Micro hover glow line */}
                <div className={`absolute top-0 right-0 h-full w-[2px] bg-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* LOWER OPTIONS - THEME & LOGOUT */}
      <div className="space-y-3.5 pt-6 border-t border-white/5 dark:border-t-white/5 light:border-t-zinc-200/50">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-slate-500 dark:text-slate-500 light:text-zinc-500">Visual Theme</span>
          <ThemeToggler />
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 light:text-red-600 light:hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/5 light:hover:bg-red-50 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* LAPTOP SIDEBAR BAR (Always visible above md screens) */}
      <aside className="hidden md:block w-64 h-screen fixed top-0 left-0 bg-space-950 dark:bg-space-950 light:bg-white border-r border-white/5 dark:border-white/5 light:border-zinc-200/60 z-30 transition-colors duration-500">
        <SidebarContent />
      </aside>

      {/* MOBILE HEADER BUTTON BAR (Only visible under md screens) */}
      <header className="md:hidden w-full bg-space-950/80 dark:bg-space-950/80 light:bg-white/80 backdrop-blur-md border-b border-white/5 dark:border-white/5 light:border-zinc-200/60 fixed top-0 left-0 h-16 px-6 flex items-center justify-between z-40">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white dark:text-white light:text-indigo-950">
            SkillSync <span className="text-gradient">AI</span>
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-indigo-50 hover:opacity-80"
        >
          {mobileOpen ? <X className="w-5 h-5 text-white dark:text-white light:text-indigo-900" /> : <Menu className="w-5 h-5 text-white dark:text-white light:text-indigo-900" />}
        </button>
      </header>

      {/* MOBILE DRAWER DRAWER */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60 dark:bg-black/60 light:bg-zinc-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)}>
          <aside 
            className="w-64 h-full bg-space-950 dark:bg-space-950 light:bg-white border-r border-white/5 dark:border-white/5 light:border-zinc-200/60 relative animate-slide-in"
            onClick={(e) => e.stopPropagation()} // Prevent closing drawer when clicking inside
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
