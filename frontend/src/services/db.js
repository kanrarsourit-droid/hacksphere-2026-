/**
 * SkillSync AI - Database and Authentication Service (Supabase Migrated)
 * 
 * It handles both:
 * 1. Live Supabase Mode (connected to your free Postgres cloud database)
 * 2. Local Storage Demo Mode (when Supabase is offline or unconfigured)
 * 
 * This ensures the application is completely robust and stable!
 */

import { supabase, isSupabaseActive } from '../firebase/supabase';

// Map Firebase active check to Supabase active check for perfect backward compatibility!
export const isFirebaseActive = isSupabaseActive;

// ==========================================
// FAILSAFE CONCURRENCY TIMEOUT ENGINE
// ==========================================

// Global failover indicator cached in sessionStorage
let supabaseConnectionFailed = sessionStorage.getItem('skillsync_supabase_failed') === 'true';

/**
 * Manually switch to offline Sandbox mode globally
 */
export const setFirebaseOffline = () => {
  supabaseConnectionFailed = true;
  sessionStorage.setItem('skillsync_supabase_failed', 'true');
  console.warn("🔧 SkillSync Failsafe: Switched to sandbox offline database globally.");
};

/**
 * Failsafe wrapper that races Supabase calls against a 4-second timeout limit.
 */
export const runWithFailover = async (cloudCallback, localCallback, timeoutMs = 4000) => {
  if (isSupabaseActive && !supabaseConnectionFailed) {
    try {
      const result = await Promise.race([
        cloudCallback(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("SUPABASE_CONNECTION_TIMEOUT")), timeoutMs)
        )
      ]);
      return result;
    } catch (e) {
      const isConnectionIssue = 
        e.message === "SUPABASE_CONNECTION_TIMEOUT" || 
        e.message?.toLowerCase().includes("network") ||
        e.message?.toLowerCase().includes("timeout") ||
        e.message?.toLowerCase().includes("failed to fetch");
        
      if (isConnectionIssue) {
        console.warn("🔧 SkillSync Failsafe: Supabase connection stalled or timed out. Activating Sandbox mode globally.", e);
        supabaseConnectionFailed = true;
        sessionStorage.setItem('skillsync_supabase_failed', 'true');
        return localCallback();
      }
      throw e;
    }
  } else {
    return localCallback();
  }
};

// ==========================================
// 1. AUTHENTICATION SERVICES
// ==========================================

/**
 * Sign up a new user using Email and Password
 */
export const registerUser = async (email, password, displayName, role = 'student') => {
  const cloudFn = async () => {
    // 0. Strict check: verify if the email is already in the database
    const { data: existingUser } = await supabase
      .from('users')
      .select('role')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingUser) {
      throw new Error("auth/email-already-in-use");
    }

    // 1. Create User in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role
        }
      }
    });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Supabase Auth Registration Failed");

    // 2. Initialize a profile record in public.users table
    const userProfile = {
      uid: user.id,
      email: user.email,
      display_name: displayName || user.email.split('@')[0],
      photo_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      role,
      streak: 1,
      last_study_date: new Date().toISOString().split('T')[0],
      notes_count: 0,
      quiz_count: 0,
      avg_quiz_score: 0,
      created_at: new Date().toISOString()
    };

    const { error: dbError } = await supabase.from('users').upsert(userProfile);
    if (dbError) throw dbError;

    // Format fields back for client state compatibility
    const clientUser = {
      uid: userProfile.uid,
      email: userProfile.email,
      displayName: userProfile.display_name,
      photoURL: userProfile.photo_url,
      role: userProfile.role,
      streak: userProfile.streak,
      lastStudyDate: userProfile.last_study_date,
      notesCount: userProfile.notes_count,
      quizCount: userProfile.quiz_count,
      avgQuizScore: userProfile.avg_quiz_score,
      createdAt: userProfile.created_at
    };

    // Store mock session as a cache
    localStorage.setItem('active_mock_session', JSON.stringify(clientUser));
    return { success: true, user: clientUser };
  };

  const localFn = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (mockUsers.some(u => u.email === email)) {
      throw new Error("auth/email-already-in-use");
    }
    
    const uid = 'mock_uid_' + Math.random().toString(36).substr(2, 9);
    const mockProfile = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
      role,
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      notesCount: 0,
      quizCount: 0,
      avgQuizScore: 0,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push({ email, password, profile: mockProfile });
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));
    
    return { success: true, user: mockProfile };
  };

  return runWithFailover(cloudFn, localFn, 5000);
};

/**
 * Log in an existing user with Email and Password
 */
export const loginUser = async (email, password) => {
  const cloudFn = async () => {
    // 1. Sign in via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Login failed");

    // 2. Fetch profile details from users table
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', user.id)
      .single();

    if (dbError || !profile) {
      // Return a basic profile if record is missing
      const fallbackProfile = { uid: user.id, email: user.email, role: 'student' };
      localStorage.setItem('active_mock_session', JSON.stringify(fallbackProfile));
      return { success: true, user: fallbackProfile };
    }

    // Map DB camelCase back for React UI
    const clientUser = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.display_name,
      photoURL: profile.photo_url,
      role: profile.role,
      streak: profile.streak,
      lastStudyDate: profile.last_study_date,
      notesCount: profile.notes_count,
      quizCount: profile.quiz_count,
      avgQuizScore: profile.avg_quiz_score,
      createdAt: profile.created_at
    };

    // Update study streak
    const updatedProfile = updateStreak(clientUser);
    await supabase.from('users').update({
      streak: updatedProfile.streak,
      last_study_date: updatedProfile.lastStudyDate
    }).eq('uid', user.id);

    localStorage.setItem('active_mock_session', JSON.stringify(updatedProfile));
    return { success: true, user: updatedProfile };
  };

  const localFn = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const matchedUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!matchedUser) {
      throw new Error("auth/wrong-password-or-user-not-found");
    }
    
    const updatedProfile = updateStreak(matchedUser.profile);
    matchedUser.profile = updatedProfile;
    
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('active_mock_session', JSON.stringify(updatedProfile));
    
    return { success: true, user: updatedProfile };
  };

  return runWithFailover(cloudFn, localFn, 5000);
};

/**
 * Single Sign-On with Google
 */
export const loginWithGoogle = async (role = 'student') => {
  localStorage.setItem('skillsync_oauth_role', role);

  const cloudFn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return { success: true };
  };

  const localFn = () => {
    // Sandbox Google SSO Simulator
    const defaultEmail = role === 'teacher' ? 'teacher_expert@gmail.com' : 'scholar_student@gmail.com';
    const chosenEmail = window.prompt("🎓 SkillSync Sandbox Google SSO:\n\nPlease enter the Google email address you want to log in with:", defaultEmail);
    
    if (chosenEmail === null) {
      throw new Error("auth/popup-closed-by-user");
    }
    
    const emailToUse = chosenEmail.trim().toLowerCase() || defaultEmail.toLowerCase();
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const existingMock = mockUsers.find(u => u.email.toLowerCase() === emailToUse);
    
    if (existingMock) {
      localStorage.setItem('active_mock_session', JSON.stringify(existingMock.profile));
      return { success: true, user: existingMock.profile };
    }
    
    const namePart = emailToUse.split('@')[0];
    const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const mockUid = 'mock_google_' + Math.random().toString(36).substr(2, 9);
    
    const mockProfile = {
      uid: mockUid,
      email: emailToUse,
      displayName: role === 'teacher' ? `${cleanName} 👨‍🏫` : `${cleanName} 🎓`,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${mockUid}`,
      role,
      streak: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      notesCount: 2,
      quizCount: 1,
      avgQuizScore: 90,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push({ email: emailToUse, password: 'google_oauth_bypass', profile: mockProfile });
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));
    
    return { success: true, user: mockProfile };
  };

  // If Supabase is active, ALWAYS attempt actual Google Sign-In pop-up directly!
  if (isSupabaseActive) {
    try {
      return await cloudFn();
    } catch (err) {
      console.warn("Actual Google Login failed, falling back to Sandbox:", err);
      return localFn();
    }
  }

  return localFn();
};

/**
 * Log out user from active session
 */
export const logoutUser = async () => {
  localStorage.removeItem('active_mock_session');
  if (isSupabaseActive) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout error:", e);
    }
  }
  return { success: true };
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (userId, updatedFields) => {
  const cloudFn = async () => {
    const dbFields = {};
    if (updatedFields.displayName !== undefined) dbFields.display_name = updatedFields.displayName;
    if (updatedFields.photoURL !== undefined) dbFields.photo_url = updatedFields.photoURL;
    if (updatedFields.role !== undefined) dbFields.role = updatedFields.role;
    if (updatedFields.streak !== undefined) dbFields.streak = updatedFields.streak;
    if (updatedFields.lastStudyDate !== undefined) dbFields.last_study_date = updatedFields.lastStudyDate;
    if (updatedFields.notesCount !== undefined) dbFields.notes_count = updatedFields.notesCount;
    if (updatedFields.quizCount !== undefined) dbFields.quiz_count = updatedFields.quizCount;
    if (updatedFields.avgQuizScore !== undefined) dbFields.avg_quiz_score = updatedFields.avgQuizScore;

    // Handle arbitrary additional fields
    Object.keys(updatedFields).forEach(key => {
      if (!['displayName', 'photoURL', 'role', 'streak', 'lastStudyDate', 'notesCount', 'quizCount', 'avgQuizScore'].includes(key)) {
        dbFields[key] = updatedFields[key];
      }
    });

    const { error } = await supabase.from('users').update(dbFields).eq('uid', userId);
    if (error) throw error;

    // Update active session representation
    const mockSession = localStorage.getItem('active_mock_session');
    if (mockSession) {
      const parsed = JSON.parse(mockSession);
      if (parsed.uid === userId) {
        localStorage.setItem('active_mock_session', JSON.stringify({ ...parsed, ...updatedFields }));
      }
    }
    return { success: true, user: updatedFields };
  };

  const localFn = () => {
    return updateLocalProfile(userId, updatedFields);
  };

  return runWithFailover(cloudFn, localFn, 5000);
};

const updateLocalProfile = (userId, updatedFields) => {
  const activeSession = JSON.parse(localStorage.getItem('active_mock_session') || '{}');
  if (activeSession.uid === userId) {
    const updated = { ...activeSession, ...updatedFields };
    localStorage.setItem('active_mock_session', JSON.stringify(updated));
    
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const index = mockUsers.findIndex(u => u.profile.uid === userId);
    if (index !== -1) {
      mockUsers[index].profile = updated;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    }
    
    return { success: true, user: updated };
  }
  return { success: false };
};

const initializeDatabaseProfile = async (user, callback) => {
  try {
    const selectedRole = localStorage.getItem('skillsync_oauth_role') || 'student';
    
    const newProfile = {
      uid: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email.split('@')[0],
      photo_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      role: selectedRole,
      streak: 1,
      last_study_date: new Date().toISOString().split('T')[0],
      notes_count: 0,
      quiz_count: 0,
      avg_quiz_score: 0,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('users').upsert(newProfile);
    if (error) throw error;

    const formatted = {
      uid: newProfile.uid,
      email: newProfile.email,
      displayName: newProfile.display_name,
      photoURL: newProfile.photo_url,
      role: newProfile.role,
      streak: newProfile.streak,
      lastStudyDate: newProfile.last_study_date,
      notesCount: newProfile.notes_count,
      quizCount: newProfile.quiz_count,
      avgQuizScore: newProfile.avg_quiz_score,
      createdAt: newProfile.created_at
    };

    localStorage.setItem('active_mock_session', JSON.stringify(formatted));
    callback(formatted);
  } catch (e) {
    console.error("Failed to initialize Google profile:", e);
    const basic = { uid: user.id, email: user.email, role: 'student' };
    localStorage.setItem('active_mock_session', JSON.stringify(basic));
    callback(basic);
  }
};

/**
 * Subscribe to Authentication changes (auto login listener)
 */
export const listenToAuthChanges = (callback) => {
  if (isSupabaseActive) {
    // 1. Check existing session active on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        supabase.from('users').select('*').eq('uid', user.id).single().then(({ data: profile }) => {
          if (profile) {
            const formatted = {
              uid: profile.uid,
              email: profile.email,
              displayName: profile.display_name,
              photoURL: profile.photo_url,
              role: profile.role,
              streak: profile.streak,
              lastStudyDate: profile.last_study_date,
              notesCount: profile.notes_count,
              quizCount: profile.quiz_count,
              avgQuizScore: profile.avg_quiz_score,
              createdAt: profile.created_at
            };
            localStorage.setItem('active_mock_session', JSON.stringify(formatted));
            callback(formatted);
          } else {
            initializeDatabaseProfile(user, callback);
          }
        });
      } else {
        const mockSession = localStorage.getItem('active_mock_session');
        if (mockSession) {
          try {
            callback(JSON.parse(mockSession));
          } catch (e) {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    });

    // 2. Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = session.user;
        const { data: profile } = await supabase.from('users').select('*').eq('uid', user.id).single();
        if (profile) {
          const formatted = {
            uid: profile.uid,
            email: profile.email,
            displayName: profile.display_name,
            photoURL: profile.photo_url,
            role: profile.role,
            streak: profile.streak,
            lastStudyDate: profile.last_study_date,
            notesCount: profile.notes_count,
            quizCount: profile.quiz_count,
            avgQuizScore: profile.avg_quiz_score,
            createdAt: profile.created_at
          };
          localStorage.setItem('active_mock_session', JSON.stringify(formatted));
          callback(formatted);
        } else {
          initializeDatabaseProfile(user, callback);
        }
      } else {
        const mockSession = localStorage.getItem('active_mock_session');
        if (mockSession) {
          try {
            callback(JSON.parse(mockSession));
          } catch (e) {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  } else {
    const mockSession = localStorage.getItem('active_mock_session');
    if (mockSession) {
      callback(JSON.parse(mockSession));
    } else {
      callback(null);
    }
    return () => {};
  }
};

// ==========================================
// 2. NOTES MANAGEMENT SERVICES
// ==========================================

/**
 * Upload a note and record metadata in public.notes table
 */
export const uploadStudyNote = async (file, fileName, subject, userId, userRole = 'student', userName = '') => {
  const uploadDate = new Date().toISOString();
  const isPublic = userRole === 'teacher';
  const teacherName = isPublic ? (userName || 'Class Teacher 👨‍🏫') : '';

  const cloudFn = async () => {
    // 1. Upload note document to Supabase Storage Bucket 'notes'
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('notes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (storageErr) throw storageErr;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    // 2. Insert record in notes table
    const noteData = {
      file_name: fileName,
      file_url: publicUrl,
      file_type: file.type,
      subject,
      uploaded_by: userId,
      upload_date: uploadDate,
      summary: '',
      key_takeaways: [],
      is_public: isPublic,
      teacher_name: teacherName
    };

    const { data: insertedData, error: dbErr } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (dbErr) throw dbErr;

    // 3. Increment profile document counters
    await incrementUserNotesCount(userId);

    // Format record back for client compatibility
    const formattedNote = {
      id: insertedData.id,
      fileName: insertedData.file_name,
      fileURL: insertedData.file_url,
      fileType: insertedData.file_type,
      subject: insertedData.subject,
      uploadedBy: insertedData.uploaded_by,
      uploadDate: insertedData.upload_date,
      summary: insertedData.summary,
      keyTakeaways: insertedData.key_takeaways || [],
      isPublic: insertedData.is_public,
      teacherName: insertedData.teacher_name
    };

    // Concurrently cache locally for Sandbox compatibility
    try {
      const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
      if (!localNotes.some(n => n.fileName === fileName && n.subject === subject)) {
        localNotes.push(formattedNote);
        localStorage.setItem('local_notes', JSON.stringify(localNotes));
        incrementLocalNotesCount();
      }
    } catch (cacheErr) {
      console.warn("Failed to cache uploaded note locally:", cacheErr);
    }

    return formattedNote;
  };

  const localFn = () => {
    return uploadNoteLocally(file, fileName, subject, userId, uploadDate, isPublic, teacherName);
  };

  return runWithFailover(cloudFn, localFn, 8000);
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

const uploadNoteLocally = async (file, fileName, subject, userId, uploadDate, isPublic = false, teacherName = '') => {
  let fileURL = "";
  try {
    fileURL = await fileToBase64(file);
  } catch (e) {
    fileURL = URL.createObjectURL(file);
  }
  
  const noteData = {
    id: 'local_note_' + Math.random().toString(36).substr(2, 9),
    fileName,
    fileURL,
    fileType: file.type,
    subject,
    uploadedBy: userId,
    uploadDate,
    summary: '',
    keyTakeaways: [],
    isPublic,
    teacherName
  };

  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  if (!localNotes.some(n => n.fileName === fileName && n.subject === subject)) {
    localNotes.push(noteData);
    localStorage.setItem('local_notes', JSON.stringify(localNotes));
    incrementLocalNotesCount();
  }

  return noteData;
};

/**
 * Fetch all study notes uploaded by users or publicly shared
 */
export const getUserNotes = async (userId, userRole = 'student') => {
  const cloudFn = async () => {
    const { data, error } = await supabase.from('notes').select('*');
    if (error) throw error;

    const notes = [];
    data.forEach(item => {
      const formatted = {
        id: item.id,
        fileName: item.file_name,
        fileURL: item.file_url,
        fileType: item.file_type,
        subject: item.subject,
        uploadedBy: item.uploaded_by,
        uploadDate: item.upload_date,
        summary: item.summary,
        keyTakeaways: item.key_takeaways || [],
        isPublic: item.is_public,
        teacherName: item.teacher_name
      };

      if (userRole === 'teacher') {
        if (formatted.uploadedBy === userId) {
          notes.push(formatted);
        }
      } else {
        if (formatted.isPublic || formatted.uploadedBy === userId) {
          notes.push(formatted);
        }
      }
    });

    // Merge unique notes from local storage cache
    try {
      const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
      localNotes.forEach(localNote => {
        const isDuplicate = notes.some(n => n.fileName === localNote.fileName && n.subject === localNote.subject);
        if (!isDuplicate) {
          if (userRole === 'teacher') {
            if (localNote.uploadedBy === userId) {
              notes.push(localNote);
            }
          } else {
            if (localNote.isPublic || localNote.uploadedBy === userId) {
              notes.push(localNote);
            }
          }
        }
      });
    } catch (mergeErr) {
      console.warn("Failed to synchronize local notes cache:", mergeErr);
    }

    notes.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return notes;
  };

  const localFn = () => {
    return getLocalNotes(userId, userRole);
  };

  return runWithFailover(cloudFn, localFn, 5000);
};

const getLocalNotes = (userId, userRole = 'student') => {
  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  if (userRole === 'teacher') {
    return localNotes.filter(note => note.uploadedBy === userId).reverse();
  } else {
    return localNotes.filter(note => note.isPublic || note.uploadedBy === userId).reverse();
  }
};

/**
 * Delete a study note
 */
export const deleteStudyNote = async (noteId, userId) => {
  if (isSupabaseActive && !noteId.startsWith('local_note_')) {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
      await decrementUserNotesCount(userId);
      return true;
    } catch (e) {
      deleteLocalNote(noteId);
      return true;
    }
  } else {
    deleteLocalNote(noteId);
    return true;
  }
};

const deleteLocalNote = (noteId) => {
  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  const filtered = localNotes.filter(n => n.id !== noteId);
  localStorage.setItem('local_notes', JSON.stringify(filtered));
  decrementLocalNotesCount();
};

const decrementLocalNotesCount = () => {
  const activeSession = JSON.parse(localStorage.getItem('active_mock_session') || '{}');
  if (activeSession.uid) {
    activeSession.notesCount = Math.max(0, (activeSession.notesCount || 1) - 1);
    localStorage.setItem('active_mock_session', JSON.stringify(activeSession));
    updateMockUserList(activeSession);
  }
};

const decrementUserNotesCount = async (userId) => {
  try {
    const { data: profile } = await supabase.from('users').select('notes_count').eq('uid', userId).single();
    if (profile) {
      const currentNotes = profile.notes_count || 1;
      await supabase.from('users').update({ notes_count: Math.max(0, currentNotes - 1) }).eq('uid', userId);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Update Note Summaries
 */
export const updateNoteSummary = async (noteId, summary, keyTakeaways) => {
  if (isSupabaseActive && !noteId.startsWith('local_note_')) {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ summary, key_takeaways: keyTakeaways })
        .eq('id', noteId);
      if (error) throw error;
      return true;
    } catch (e) {
      updateLocalNoteSummary(noteId, summary, keyTakeaways);
      return true;
    }
  } else {
    updateLocalNoteSummary(noteId, summary, keyTakeaways);
    return true;
  }
};

const updateLocalNoteSummary = (noteId, summary, keyTakeaways) => {
  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  const index = localNotes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    localNotes[index].summary = summary;
    localNotes[index].keyTakeaways = keyTakeaways;
    localStorage.setItem('local_notes', JSON.stringify(localNotes));
  }
};

// ==========================================
// 3. QUIZZES & ROADMAPS SERVICES
// ==========================================

/**
 * Save quiz results
 */
export const saveQuizResult = async (quizData) => {
  const record = {
    ...quizData,
    takenAt: new Date().toISOString()
  };

  if (isSupabaseActive && !quizData.noteId?.startsWith('local_note_')) {
    try {
      const dbData = {
        note_id: quizData.noteId,
        user_id: quizData.userId,
        subject: quizData.subject,
        score: quizData.score,
        max_score: quizData.maxScore,
        taken_at: record.takenAt
      };
      
      const { data, error } = await supabase
        .from('quizzes')
        .insert(dbData)
        .select()
        .single();
        
      if (error) throw error;
      
      await updateUserQuizStats(quizData.userId, quizData.score);
      
      return {
        id: data.id,
        noteId: data.note_id,
        userId: data.user_id,
        subject: data.subject,
        score: data.score,
        maxScore: data.max_score,
        takenAt: data.taken_at
      };
    } catch (e) {
      return saveQuizLocally(record);
    }
  } else {
    return saveQuizLocally(record);
  }
};

const saveQuizLocally = (record) => {
  const localQuizzes = JSON.parse(localStorage.getItem('local_quizzes') || '[]');
  const id = 'local_quiz_' + Math.random().toString(36).substr(2, 9);
  const quizRecord = { id, ...record };
  
  localQuizzes.push(quizRecord);
  localStorage.setItem('local_quizzes', JSON.stringify(localQuizzes));
  updateLocalQuizStats(record.score);

  return quizRecord;
};

/**
 * Fetch quizzes solved by user
 */
export const getUserQuizzes = async (userId) => {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        noteId: item.note_id,
        userId: item.user_id,
        subject: item.subject,
        score: item.score,
        maxScore: item.max_score,
        takenAt: item.taken_at
      }));
    } catch (e) {
      return getLocalQuizzes(userId);
    }
  } else {
    return getLocalQuizzes(userId);
  }
};

const getLocalQuizzes = (userId) => {
  const localQuizzes = JSON.parse(localStorage.getItem('local_quizzes') || '[]');
  return localQuizzes.filter(q => q.userId === userId).reverse();
};

/**
 * Save dynamic roadmap
 */
export const saveRoadmap = async (roadmapData) => {
  const record = {
    ...roadmapData,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseActive) {
    try {
      const dbData = {
        user_id: roadmapData.userId,
        goal: roadmapData.goal,
        weeks: roadmapData.weeks,
        created_at: record.createdAt
      };
      
      const { data, error } = await supabase
        .from('roadmaps')
        .insert(dbData)
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        goal: data.goal,
        weeks: data.weeks,
        createdAt: data.created_at
      };
    } catch (e) {
      return saveRoadmapLocally(record);
    }
  } else {
    return saveRoadmapLocally(record);
  }
};

const saveRoadmapLocally = (record) => {
  const localRoadmaps = JSON.parse(localStorage.getItem('local_roadmaps') || '[]');
  const id = 'local_roadmap_' + Math.random().toString(36).substr(2, 9);
  const roadmapRecord = { id, ...record };
  
  localRoadmaps.push(roadmapRecord);
  localStorage.setItem('local_roadmaps', JSON.stringify(localRoadmaps));
  return roadmapRecord;
};

/**
 * Get user roadmaps
 */
export const getUserRoadmaps = async (userId) => {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        goal: item.goal,
        weeks: item.weeks,
        createdAt: item.created_at
      }));
    } catch (e) {
      return getLocalRoadmaps(userId);
    }
  } else {
    return getLocalRoadmaps(userId);
  }
};

const getLocalRoadmaps = (userId) => {
  const localRoadmaps = JSON.parse(localStorage.getItem('local_roadmaps') || '[]');
  return localRoadmaps.filter(r => r.userId === userId).reverse();
};

// ==========================================
// INTERNAL STATS INCREMENTATION UTILITIES
// ==========================================

const updateStreak = (profile) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastStudyStr = profile.lastStudyDate;
  
  if (lastStudyStr === todayStr) {
    return profile;
  }

  const today = new Date(todayStr);
  const lastStudy = new Date(lastStudyStr);
  const diffTime = Math.abs(today - lastStudy);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let newStreak = profile.streak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  return {
    ...profile,
    streak: newStreak,
    lastStudyDate: todayStr
  };
};

const incrementUserNotesCount = async (userId) => {
  try {
    const { data: profile } = await supabase.from('users').select('notes_count').eq('uid', userId).single();
    if (profile) {
      const currentNotes = profile.notes_count || 0;
      await supabase.from('users').update({ notes_count: currentNotes + 1 }).eq('uid', userId);
    }
  } catch (e) {
    console.error(e);
  }
};

const incrementLocalNotesCount = () => {
  const activeSession = JSON.parse(localStorage.getItem('active_mock_session') || '{}');
  if (activeSession.uid) {
    activeSession.notesCount = (activeSession.notesCount || 0) + 1;
    localStorage.setItem('active_mock_session', JSON.stringify(activeSession));
    updateMockUserList(activeSession);
  }
};

const updateUserQuizStats = async (userId, newScore) => {
  try {
    const { data: profile } = await supabase.from('users').select('quiz_count, avg_quiz_score').eq('uid', userId).single();
    if (profile) {
      const currentQuizzes = profile.quiz_count || 0;
      const currentAvg = profile.avg_quiz_score || 0;
      
      const newCount = currentQuizzes + 1;
      const newAvg = Math.round(((currentAvg * currentQuizzes) + newScore) / newCount);
      
      await supabase.from('users').update({
        quiz_count: newCount,
        avg_quiz_score: newAvg
      }).eq('uid', userId);
    }
  } catch (e) {
    console.error(e);
  }
};

const updateLocalQuizStats = (newScore) => {
  const activeSession = JSON.parse(localStorage.getItem('active_mock_session') || '{}');
  if (activeSession.uid) {
    const currentQuizzes = activeSession.quizCount || 0;
    const currentAvg = activeSession.avgQuizScore || 0;
    
    const newCount = currentQuizzes + 1;
    const newAvg = Math.round(((currentAvg * currentQuizzes) + newScore) / newCount);
    
    activeSession.quizCount = newCount;
    activeSession.avgQuizScore = newAvg;
    
    localStorage.setItem('active_mock_session', JSON.stringify(activeSession));
    updateMockUserList(activeSession);
  }
};

const updateMockUserList = (updatedProfile) => {
  const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
  const index = mockUsers.findIndex(u => u.profile.uid === updatedProfile.uid);
  if (index !== -1) {
    mockUsers[index].profile = updatedProfile;
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  }
};

/**
 * Failsafe password reset trigger
 */
export const sendPasswordResetObj = async (email) => {
  const cloudFn = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return { success: true };
  };
  const localFn = () => {
    return { success: true };
  };
  return runWithFailover(cloudFn, localFn);
};
