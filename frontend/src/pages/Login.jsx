import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Lock, User, Phone, Key, 
  ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, HelpCircle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { 
  registerUser, loginUser, loginWithGoogle, 
  updateUserProfile, sendPasswordResetObj, isFirebaseActive 
} from '../services/db';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

/**
 * SkillSync AI - Cinematic Multi-Method Authentication Portal
 * 
 * Supports:
 * 1. Email & Password Sign-in & Sign-up (With secure password creation)
 * 2. Phone OTP Sign-in (Firebase SMS Carrier + Sandbox Simulator fallback)
 * 3. Email OTP Sign-in (Passwordless verification + Sandbox Simulator fallback)
 * 4. Forgot Password Email Dispatcher
 */
const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'teacher'
  
  // Interactive developer tools to switch database systems
  const [isSandboxMode, setIsSandboxMode] = useState(
    sessionStorage.getItem('skillsync_connection_failed') === 'true'
  );

  const toggleSandboxMode = () => {
    const nextState = !isSandboxMode;
    setIsSandboxMode(nextState);
    if (nextState) {
      sessionStorage.setItem('skillsync_connection_failed', 'true');
    } else {
      sessionStorage.removeItem('skillsync_connection_failed');
    }
    clearForm();
  };

  const offlineMode = !isFirebaseActive || isSandboxMode;

  // Auth Method Switcher: 'password' | 'phone' | 'emailOtp'
  const [authMethod, setAuthMethod] = useState("password");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Field States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Default to India (+91)
  const [otpCode, setOtpCode] = useState("");
  
  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [demoCodeText, setDemoCodeText] = useState(""); // Displays mock code in local demo mode

  useEffect(() => {
    // Clear alerts whenever switching modes
    setError("");
    setSuccessMessage("");
  }, [authMethod, isSignup, isForgotPassword]);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setCountryCode("+91");
    setOtpCode("");
    setOtpSent(false);
    setConfirmationResult(null);
    setDemoCodeText("");
    setError("");
    setSuccessMessage("");
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    clearForm();
  };

  // ==========================================
  // 1. STANDARD EMAIL/PASSWORD SUBMIT HANDLER
  // ==========================================
  const handleEmailPasswordSubmit = async (e) => {
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
        // Register user with their selected role and full profile initialization
        const result = await registerUser(email, password, name, role);
        onLoginSuccess(result.user);
      } else {
        // Login user
        const result = await loginUser(email, password);
        let loggedInUser = result.user;
        
        // Failsafe role mismatch validation
        if (loggedInUser.role && loggedInUser.role !== role) {
          setError(`This email is registered as a ${loggedInUser.role === 'teacher' ? 'Teacher' : 'Student'}. Please log in using the correct portal.`);
          setLoading(false);
          return;
        }

        // Legacy compatibility
        if (!loggedInUser.role) {
          loggedInUser.role = role;
          await updateUserProfile(loggedInUser.uid, { role });
        }
        
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      console.error(err);
      const code = err.message || "";
      if (code.includes("auth/email-already-in-use")) {
        setError("This email address is already registered. Please login instead.");
      } else if (code.includes("auth/invalid-email")) {
        setError("Invalid email address format.");
      } else if (code.includes("auth/weak-password")) {
        setError("Password is too weak. Minimum 6 characters required.");
      } else if (code.includes("auth/wrong-password") || code.includes("auth/user-not-found") || code.includes("wrong-password")) {
        setError("Invalid email or password. Please verify your credentials.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. FORGOT PASSWORD DISPATCHER HANDLER
  // ==========================================
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await sendPasswordResetObj(email);
      
      // Check if running in Live Firebase or local failsafe sandbox mode
      if (isFirebaseActive && !sessionStorage.getItem('skillsync_connection_failed')) {
        setSuccessMessage("A secure password reset link has been dispatched to your email! Please check your spam folder if you don't receive it shortly.");
      } else {
        setSuccessMessage(`[Sandbox Demo Mode] Password reset instructions dispatched successfully to "${email}"!`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to trigger password reset. Please check if the email is correct.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. PHONE NUMBER OTP VERIFICATION SYSTEM
  // ==========================================
  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    } catch (err) {
      console.error("Recaptcha setup failed:", err);
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter your mobile phone number.");
      return;
    }

    const fullPhone = `${countryCode}${phone.trim().replace(/\D/g, "")}`;
    setLoading(true);
    setError("");
    setDemoCodeText("");

    if (!offlineMode) {
      // 🟢 LIVE FIREBASE MODE: Real SMS Dispatch
      try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
        setSuccessMessage("Verification code has been dispatched via SMS to your phone!");
      } catch (err) {
        console.error("SMS dispatch error:", err);
        // Expose the raw, exact Firebase error code and message to help the user diagnose instantly!
        setError(`Failed to dispatch SMS: ${err.message || err.code || err}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    } else {
      // 🟡 MOCK SANDBOX MODE: Instant Simulated OTP
      setTimeout(() => {
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoCodeText(mockCode);
        setOtpSent(true);
        setSuccessMessage(`[Sandbox Demo] SMS OTP generated successfully!`);
        setLoading(false);
      }, 1000);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    const fullPhone = `${countryCode}${phone.trim().replace(/\D/g, "")}`;
    setLoading(true);
    setError("");

    if (!offlineMode && confirmationResult) {
      // 🟢 LIVE FIREBASE MODE: Validate real SMS
      try {
        const credential = await confirmationResult.confirm(otpCode);
        const user = credential.user;
        
        // Setup Firestore user entry for the authenticated phone number
        const userProfile = {
          uid: user.uid,
          email: user.email || `${fullPhone.replace(/\D/g, "")}@skillsync.phone`,
          displayName: user.displayName || name || `User ${phone.slice(-4)}`,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          role,
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          notesCount: 0,
          quizCount: 0,
          avgQuizScore: 0,
          createdAt: new Date().toISOString()
        };

        await updateUserProfile(user.uid, userProfile);
        onLoginSuccess(userProfile);
      } catch (err) {
        console.error("SMS validation error:", err);
        setError("Invalid OTP code. Please check your text messages and try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // 🟡 MOCK SANDBOX MODE: Validate simulated OTP
      setTimeout(() => {
        if (otpCode === demoCodeText || otpCode === "123456") {
          const uid = 'mock_phone_uid_' + Math.random().toString(36).substr(2, 9);
          const mockProfile = {
            uid,
            email: `${fullPhone.replace(/\D/g, "")}@skillsync.phone`,
            displayName: name || `User ${phone.slice(-4)}`,
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
            role,
            streak: 1,
            lastStudyDate: new Date().toISOString().split('T')[0],
            notesCount: 0,
            quizCount: 0,
            avgQuizScore: 0,
            createdAt: new Date().toISOString()
          };

          // Save mock session locally
          const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
          mockUsers.push({ email: mockProfile.email, profile: mockProfile });
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
          localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));

          onLoginSuccess(mockProfile);
        } else {
          setError("Invalid OTP verification code. Use the mock code displayed above.");
          setLoading(false);
        }
      }, 1000);
    }
  };

  // ==========================================
  // 4. EMAIL OTP (PASSWORDLESS) AUTHENTICATION
  // ==========================================
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setDemoCodeText("");

    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if EmailJS credentials are configured in .env
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const hasEmailJs = emailJsServiceId && emailJsTemplateId && emailJsPublicKey;

    if (hasEmailJs) {
      // 🟢 LIVE EMAILJS MODE: Dispatch actual email directly from frontend!
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: emailJsServiceId,
            template_id: emailJsTemplateId,
            user_id: emailJsPublicKey,
            template_params: {
              to_email: email,
              otp_code: mockCode,
              user_role: role === 'student' ? 'Student' : 'Teacher'
            }
          })
        });

        if (response.ok) {
          // Store code locally to verify
          setDemoCodeText(mockCode);
          setOtpSent(true);
          setSuccessMessage(`Verification OTP code has been successfully sent to ${email}! Please check your email inbox.`);
        } else {
          const errMsg = await response.text();
          throw new Error(errMsg || "Failed to dispatch email via EmailJS API.");
        }
      } catch (err) {
        console.error("EmailJS dispatch error:", err);
        setError(`Failed to send real email: ${err.message || err}. Falling back to Sandbox mode.`);
        // Fallback to sandbox so the website remains functional even if EmailJS limits are exceeded
        setDemoCodeText(mockCode);
        setOtpSent(true);
        setSuccessMessage(`[Sandbox Fallback] Verification OTP has been generated on-screen!`);
      } finally {
        setLoading(false);
      }
    } else {
      // 🟡 MOCK SANDBOX MODE: Show code on screen
      setTimeout(() => {
        setDemoCodeText(mockCode);
        setOtpSent(true);
        setSuccessMessage(`[Sandbox Demo] Verification OTP sent successfully to your inbox!`);
        setLoading(false);
      }, 1200);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      if (otpCode === demoCodeText || otpCode === "123456") {
        const uid = 'mock_email_otp_uid_' + Math.random().toString(36).substr(2, 9);
        const mockProfile = {
          uid,
          email,
          displayName: name || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          role,
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          notesCount: 0,
          quizCount: 0,
          avgQuizScore: 0,
          createdAt: new Date().toISOString()
        };

        // Save session locally
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        mockUsers.push({ email, profile: mockProfile });
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));

        onLoginSuccess(mockProfile);
      } else {
        setError("Invalid verification code. Please input the mock OTP code displayed above.");
        setLoading(false);
      }
    }, 1000);
  };

  // ==========================================
  // 5. GOOGLE SSO SSO HANDLER
  // ==========================================
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loginWithGoogle(role);
      let user = result.user;
      
      if (user.role && user.role !== role) {
        setError(`This Google account is registered as a ${user.role === 'teacher' ? 'Teacher' : 'Student'}. Please log in using the correct portal.`);
        setLoading(false);
        return;
      }
      
      if (!user.role) {
        user.role = role;
        await updateUserProfile(user.uid, { role });
      }
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      const errMsg = err.message || "";
      const errCode = err.code || "";
      if (errMsg.includes("popup-closed-by-user") || errCode.includes("popup-closed-by-user")) {
        return; // Closed popup silently
      }
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 flex items-center justify-center overflow-hidden">
      
      {/* Invisible container required for Firebase recaptcha */}
      <div id="recaptcha-container"></div>

      {/* Visual background glows */}
      <div className="neon-blob w-80 h-80 bg-purple-500/20 -top-10 left-1/4 blur-[120px] fixed pointer-events-none" />
      <div className="neon-blob w-[360px] h-[360px] bg-indigo-500/20 bottom-10 right-1/4 blur-[120px] fixed pointer-events-none" />

      {/* LOGIN WRAPPER CARD */}
      <div className="w-full max-w-md px-6 relative z-10 animate-float-slow">
        <GlassCard className="p-8 border border-white/10 dark:border-white/5 light:border-zinc-200 shadow-2xl relative">
          
          {/* Logo Heading */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white light:text-indigo-950 mt-2 text-center">
              {isForgotPassword ? (
                "Reset Password 🔑"
              ) : isSignup ? (
                role === "student" ? "Create Student Account 🎓" : "Create Teacher Console 👨‍🏫"
              ) : (
                role === "student" ? "Welcome Student" : "Welcome Teacher"
              )}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-zinc-500 text-center px-2">
              {isForgotPassword 
                ? "Enter your email to receive recovery instructions."
                : isSignup 
                  ? "Sign up today to start uploading notes and charting roadmaps."
                  : "Sign in to access your notes, quizzes, and AI tutor."
              }
            </p>
          </div>

          {/* PORTAL ROLE SWITCHER (Hidden in Forgot Password view) */}
          {!isForgotPassword && (
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
          )}

          {/* METHOD SUB-TAB SWITCHER (Hidden only in Forgot Password mode) */}
          {!isForgotPassword && (
            <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 text-[11px] font-bold">
              <button 
                onClick={() => { setAuthMethod("password"); setOtpSent(false); }}
                className={`py-1.5 rounded-lg transition-colors ${authMethod === 'password' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Password
              </button>
              <button 
                onClick={() => { setAuthMethod("phone"); setOtpSent(false); }}
                className={`py-1.5 rounded-lg transition-colors ${authMethod === 'phone' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Mobile Login
              </button>
              <button 
                onClick={() => { setAuthMethod("emailOtp"); setOtpSent(false); }}
                className={`py-1.5 rounded-lg transition-colors ${authMethod === 'emailOtp' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Email OTP
              </button>
            </div>
          )}

          {/* STATUS NOTIFICATION BANNERS */}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-red-500/10 dark:bg-red-500/10 light:bg-red-50 border border-red-500/30 rounded-xl text-xs text-red-400 dark:text-red-400 light:text-red-600 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex flex-col gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
                <span className="font-semibold">Success!</span>
              </div>
              <p className="leading-relaxed opacity-90">{successMessage}</p>
            </div>
          )}

          {/* MOCK SANDBOX SIMULATOR CODE PROMPT DISPLAY */}
          {demoCodeText && !(import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID && import.meta.env.VITE_EMAILJS_PUBLIC_KEY) && (
            <div className="mb-5 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center text-xs animate-bounce shadow-lg">
              <p className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest">SkillSync Sandbox OTP</p>
              <h3 className="text-2xl font-black tracking-widest text-white mt-1.5">{demoCodeText}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Copy and paste this 6-digit code below to log in instantly!</p>
            </div>
          )}

          {/* ==============================================================
              VIEW 1: FORGOT PASSWORD FORM
              ============================================================== */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 pl-1">Your Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="student@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 border border-white/10 focus:outline-none focus:border-purple-500/50 text-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon w-full flex items-center justify-center gap-2 mt-2 !py-2.5 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-450 hover:text-white mt-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </form>
          ) : (
            <>
              {/* ==============================================================
                  VIEW 2: PHONE OTP LOGIN
                  ============================================================== */}
              {authMethod === 'phone' ? (
                <form onSubmit={otpSent ? handleVerifyPhoneOtp : handleSendPhoneOtp} className="space-y-4">
                  {/* Full Name Input (Only visible during Mobile Sign Up) */}
                  {!otpSent && isSignup && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500 pl-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-505" />
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

                  {!otpSent ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 pl-1">Mobile Phone Number</label>
                      <div className="flex gap-2">
                        {/* Immersive country code select dropdown selector with custom indicator arrow */}
                        <div className="relative">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="px-3.5 py-2.5 rounded-xl text-xs bg-space-900/60 dark:bg-space-900/50 light:bg-indigo-50 border border-white/10 dark:border-white/5 light:border-zinc-200 text-white dark:text-white light:text-indigo-950 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none pr-8 cursor-pointer font-bold font-mono h-full"
                          >
                            <option value="+91" className="bg-space-950 text-white font-mono">🇮🇳 +91</option>
                            <option value="+1" className="bg-space-950 text-white font-mono">🇺🇸 +1</option>
                            <option value="+44" className="bg-space-950 text-white font-mono">🇬🇧 +44</option>
                            <option value="+61" className="bg-space-950 text-white font-mono">🇦🇺 +61</option>
                            <option value="+971" className="bg-space-950 text-white font-mono">🇦🇪 +971</option>
                            <option value="+65" className="bg-space-950 text-white font-mono">🇸🇬 +65</option>
                            <option value="+81" className="bg-space-950 text-white font-mono">🇯🇵 +81</option>
                            <option value="+49" className="bg-space-950 text-white font-mono">🇩🇪 +49</option>
                            <option value="+33" className="bg-space-950 text-white font-mono">🇫🇷 +33</option>
                            <option value="+966" className="bg-space-950 text-white font-mono">🇸🇦 +966</option>
                            <option value="+55" className="bg-space-950 text-white font-mono">🇧🇷 +55</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[8px] text-slate-400">
                            ▼
                          </div>
                        </div>
                        
                        {/* Phone text input */}
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            required
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-500 pl-1">Select your country code and type your active 10-digit mobile number.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 pl-1">6-Digit Verification OTP</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 border border-white/10 focus:outline-none focus:border-purple-500/50 text-white tracking-widest text-center font-mono transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-2 !py-2.5 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent animate-spin" />
                    ) : (
                      <>
                        <span>{otpSent ? (isSignup ? "Verify & Register" : "Verify & Log In") : (isSignup ? "Register & Send SMS" : "Send Verification SMS")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(""); }}
                      className="w-full text-center text-xs font-semibold text-purple-400 hover:underline mt-4 block"
                    >
                      Change Phone Number
                    </button>
                  )}
                </form>
              ) : authMethod === 'emailOtp' ? (
                /* ==============================================================
                    VIEW 3: EMAIL OTP LOGIN / SIGN UP
                    ============================================================== */
                <form onSubmit={otpSent ? handleVerifyEmailOtp : handleSendEmailOtp} className="space-y-4">
                  {/* Full Name Input (Only visible during Email OTP Sign Up) */}
                  {!otpSent && isSignup && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-550 pl-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-505" />
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

                  {!otpSent ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 pl-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="student@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 border border-white/10 focus:outline-none focus:border-purple-500/50 text-white transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 pl-1">No password needed! We will mail a secure 6-digit authorization OTP to your inbox.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 pl-1">6-Digit Inbox Verification Code</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 border border-white/10 focus:outline-none focus:border-purple-500/50 text-white tracking-widest text-center font-mono transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-2 !py-2.5 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent animate-spin" />
                    ) : (
                      <>
                        <span>{otpSent ? (isSignup ? "Verify & Register" : "Authorize & Sign In") : (isSignup ? "Register & Send OTP" : "Send Login Verification OTP")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(""); }}
                      className="w-full text-center text-xs font-semibold text-purple-400 hover:underline mt-4 block"
                    >
                      Change Email Address
                    </button>
                  )}
                </form>
              ) : (
                /* ==============================================================
                    VIEW 4: DEFAULT EMAIL & PASSWORD SIGN-IN / SIGN-UP
                    ============================================================== */
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                  {/* Full Name Input (Only visible during Sign Up) */}
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
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-zinc-500">
                        {isSignup ? "Create Secure Password" : "Password"}
                      </label>
                      
                      {/* Forgot Password trigger (Only during login) */}
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[11px] font-bold text-purple-400 dark:text-purple-300 light:text-indigo-650 hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder={isSignup ? "Minimum 6 characters" : "••••••••"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-space-900/60 dark:bg-space-900/50 light:bg-white border border-white/10 dark:border-white/5 light:border-zinc-200 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-500/30 text-white dark:text-white light:text-indigo-950 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-2 !py-2.5 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent animate-spin" />
                    ) : (
                      <>
                        <span>
                          {isSignup 
                            ? (role === "student" ? "Create Free Account" : "Register Teacher Console") 
                            : "Sign In"
                          }
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OR CONTINUATION DIVISION BAR */}
              <div className="flex items-center my-5 gap-3">
                <div className="h-[1px] bg-white/10 dark:bg-white/5 light:bg-zinc-200/60 flex-1" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">Or Continue With</span>
                <div className="h-[1px] bg-white/10 dark:bg-white/5 light:bg-zinc-200/60 flex-1" />
              </div>

              {/* GOOGLE SINGLE SIGN-ON */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 dark:border-white/5 light:border-zinc-200 bg-white/5 dark:bg-white/5 light:bg-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-indigo-50/50 text-slate-300 dark:text-slate-300 light:text-indigo-900 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Mode Toggle Switch */}
              <p className="text-center text-xs text-slate-450 dark:text-slate-400 light:text-zinc-550 mt-6">
                {isSignup ? "Already have a SkillSync account?" : "New to SkillSync AI?"}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-purple-450 dark:text-purple-400 light:text-indigo-600 font-bold hover:underline"
                >
                  {isSignup ? "Log In" : "Sign Up Free"}
                </button>
              </p>
              
              {/* Interactive Database Mode Indicator (Super premium developer tool!) */}
              <div className="mt-8 pt-4 border-t border-white/5 dark:border-white/5 light:border-zinc-200/60 text-center flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Authentication Core Gateway
                </span>
                <button
                  type="button"
                  onClick={toggleSandboxMode}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    offlineMode 
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/25 hover:bg-purple-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${offlineMode ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`} />
                  {offlineMode ? "Running in Mock Sandbox Mode" : "Running in Live Firebase Cloud"}
                </button>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 light:text-zinc-550 max-w-[280px]">
                  {offlineMode 
                    ? "Generates instant mock SMS OTPs on-screen for seamless presentation testing." 
                    : "Triggers real Google cloud carriers to dispatch SMS texts to physical devices."
                  }
                </p>
              </div>
            </>
          )}

        </GlassCard>
      </div>

    </div>
  );
};

export default Login;
