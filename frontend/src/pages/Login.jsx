import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { registerUser, loginUser, loginWithGoogle, updateUserProfile } from '../services/db';

/**
 * SkillSync AI - Dynamic Login and Signup Page
 */
const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'teacher'
  
  // Form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    clearForm();
  };

  // Submit handler (Email/Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    if (isSignup && !name) {
      setError("Please enter your display name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        // Register user with their selected role
        const result = await registerUser(email, password, name, role);
        onLoginSuccess(result.user);
      } else {
        // Login user
        const result = await loginUser(email, password);
        onLoginSuccess(result.user);
      }
    } catch (err) {
      console.error(err);
      
      // Beginner-friendly error messages!
      const code = err.message || "";
      if (code.includes("auth/email-already-in-use")) {
        setError("This email address is already registered. Please login instead.");
      } else if (code.includes("auth/invalid-email")) {
        setError("Invalid email address format.");
      } else if (code.includes("auth/weak-password")) {
        setError("Password is too weak. Please use a stronger password.");
      } else if (code.includes("auth/wrong-password") || code.includes("auth/user-not-found") || code.includes("wrong-password")) {
        setError("Invalid email or password. Please verify your credentials.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google SSO handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loginWithGoogle(role);
      let user = result.user;
      
      // If the authenticated user profile doesn't have a role yet, assign the picker role!
      if (!user.role) {
        user.role = role;
        await updateUserProfile(user.uid, { role });
      }
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 flex items-center justify-center overflow-hidden">
      
      {/* Visual background glows */}
      <div className="neon-blob w-80 h-80 bg-purple-500 -top-10 left-1/4" />
      <div className="neon-blob w-[360px] h-[360px] bg-indigo-500 bottom-10 right-1/4" />

      {/* LOGIN WRAPPER CARD */}
      <div className="w-full max-w-md px-6 relative z-10 animate-float-slow">
        <GlassCard className="p-8 border border-white/10 dark:border-white/5 light:border-zinc-200 shadow-2xl relative">
          
          {/* Logo Heading */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white light:text-indigo-950 mt-2">
              {isSignup 
                ? (role === "student" ? "Create Student Account 🎓" : "Create Teacher Console 👨‍🏫") 
                : (role === "student" ? "Welcome Student" : "Welcome Teacher")
              }
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 text-center">
              {isSignup 
                ? "Sign up today to start uploading notes and charting roadmaps."
                : "Sign in to access your notes, quizzes, and AI tutor."
              }
            </p>
          </div>

          {/* ROLE SELECTOR DOUBLE SWITCH */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 light:text-zinc-500 pl-1 text-center">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-space-950/60 dark:bg-space-950/50 light:bg-indigo-50/50 border border-white/10 dark:border-white/5 light:border-zinc-200 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  role === "student"
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-white/3"
                }`}
              >
                Student 🎓
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  role === "teacher"
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-white/3"
                }`}
              >
                Teacher Portal 👨‍🏫
              </button>
            </div>
          </div>

          {/* Glowing error message banner */}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-red-500/10 dark:bg-red-500/10 light:bg-red-50 border border-red-500/30 rounded-xl text-xs text-red-400 dark:text-red-400 light:text-red-600 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AUTHENTICATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name Input (Only on signup) */}
            {isSignup && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="student@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                />
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full flex items-center justify-center gap-2 mt-2 !py-2.5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin" />
              ) : (
                <>
                  {isSignup 
                    ? (role === "student" ? "Create Free Account" : "Register Teacher Console") 
                    : "Sign In"
                  }
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* OR DIVIDER */}
          <div className="flex items-center my-5 gap-3">
            <div className="h-[1px] bg-white/10 dark:bg-white/5 light:bg-zinc-200 flex-1" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Or Continue With</span>
            <div className="h-[1px] bg-white/10 dark:bg-white/5 light:bg-zinc-200 flex-1" />
          </div>

          {/* GOOGLE SSO LOGIN BUTTON */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 dark:border-white/5 light:border-zinc-200 bg-white/5 dark:bg-white/5 light:bg-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-indigo-50/50 text-slate-300 dark:text-slate-300 light:text-indigo-900 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Switch link */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 mt-6 pl-1">
            {isSignup ? "Already have a SkillSync account?" : "New to SkillSync AI?"}{" "}
            <button
              onClick={handleToggleMode}
              className="text-purple-400 dark:text-purple-400 light:text-indigo-600 font-bold hover:underline"
            >
              {isSignup ? "Log In" : "Sign Up Free"}
            </button>
          </p>

        </GlassCard>
      </div>

    </div>
  );
};

export default Login;
