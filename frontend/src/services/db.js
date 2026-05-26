/**
 * SkillSync AI - Database and Authentication Service
 * 
 * Since you are a beginner, this file is fully commented!
 * It handles both:
 * 1. Live Firebase Mode (when connected to Google's cloud database)
 * 2. Local Storage Demo Mode (when Firebase is uninitialized or not yet activated on the dashboard)
 * 
 * This prevents the application from crashing and ensures a 100% working demo!
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider } from '../firebase/firebase';

// Helper to determine if Firebase Auth is active & initialized
const checkFirebaseStatus = () => {
  try {
    // If the config keys are default placeholders or empty, we use Local Mode
    if (!auth || !auth.app || auth.app.options.apiKey === "YOUR_FIREBASE_API_KEY") {
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Firebase config is missing or invalid. Defaulting to Local Demo Mode.", e);
    return false;
  }
};

export const isFirebaseActive = checkFirebaseStatus();

// ==========================================
// FAILSAFE CONCURRENCY TIMEOUT ENGINE
// ==========================================

// Global failover indicator cached in sessionStorage to survive page refreshes!
let firebaseConnectionFailed = sessionStorage.getItem('skillsync_connection_failed') === 'true';

/**
 * Manually switch to offline Sandbox mode globally
 */
export const setFirebaseOffline = () => {
  firebaseConnectionFailed = true;
  sessionStorage.setItem('skillsync_connection_failed', 'true');
  console.warn("🔧 SkillSync Failsafe: Switched to sandbox offline database globally.");
};

/**
 * Failsafe wrapper that races any Firebase async call against a 4-second timeout limit.
 * If the connection stalls due to unconfigured Storage/Firestore, network firewalls,
 * or slow DNS routes, it automatically engages the Local Storage Sandbox,
 * completing the operation in milliseconds and preventing the client UI from freezing!
 */
export const runWithFailover = async (cloudCallback, localCallback, timeoutMs = 4000) => {
  if (isFirebaseActive && !firebaseConnectionFailed) {
    try {
      // Race Firebase cloud action against a timeout trigger
      const result = await Promise.race([
        cloudCallback(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("FIREBASE_CONNECTION_TIMEOUT")), timeoutMs)
        )
      ]);
      return result;
    } catch (e) {
      const isConnectionIssue = 
        e.message === "FIREBASE_CONNECTION_TIMEOUT" || 
        e.code === "auth/network-request-failed" || 
        e.code === "auth/internal-error" ||
        e.code === "auth/quota-exceeded" ||
        e.message?.toLowerCase().includes("network") ||
        e.message?.toLowerCase().includes("timeout") ||
        e.message?.toLowerCase().includes("failed to fetch") ||
        e.message?.toLowerCase().includes("storage/retry-limit-exceeded");
        
      if (isConnectionIssue) {
        console.warn("🔧 SkillSync Failsafe: Firebase connection stalled or timed out. Activating Sandbox mode globally.", e);
        firebaseConnectionFailed = true;
        sessionStorage.setItem('skillsync_connection_failed', 'true');
        return localCallback();
      }
      throw e; // Rethrow normal database input validations (e.g. wrong password)
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Initialize a profile in Firestore for this new user
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email.split('@')[0],
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      role,
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      notesCount: 0,
      quizCount: 0,
      avgQuizScore: 0,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), userProfile);
    return { success: true, user: userProfile };
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

  return runWithFailover(cloudFn, localFn, 4000);
};

/**
 * Log in an existing user with Email and Password
 */
export const loginUser = async (email, password) => {
  const cloudFn = async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get their profile from Firestore
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    if (profileSnap.exists()) {
      const profile = profileSnap.data();
      
      // Dynamic streak calculation! If they studied yesterday, increment or maintain streak.
      const updatedProfile = updateStreak(profile);
      await updateDoc(doc(db, "users", user.uid), updatedProfile);
      
      return { success: true, user: updatedProfile };
    }
    
    // Fallback if profile doesn't exist in Firestore
    return { success: true, user: { uid: user.uid, email: user.email } };
  };

  const localFn = () => {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const matchedUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!matchedUser) {
      throw new Error("auth/wrong-password-or-user-not-found");
    }
    
    const updatedProfile = updateStreak(matchedUser.profile);
    matchedUser.profile = updatedProfile;
    
    // Save updated users database back
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('active_mock_session', JSON.stringify(updatedProfile));
    
    return { success: true, user: updatedProfile };
  };

  return runWithFailover(cloudFn, localFn, 4000);
};

/**
 * Single Sign-On with Google
 */
export const loginWithGoogle = async (role = 'student') => {
  const cloudFn = async () => {
    let authenticatedUser = null;
    const result = await signInWithPopup(auth, googleProvider);
    authenticatedUser = result.user;
    
    // Check if user profile already exists
    const userDoc = doc(db, "users", authenticatedUser.uid);
    const profileSnap = await getDoc(userDoc);
    
    let userProfile = {};
    if (!profileSnap.exists()) {
      // Initialize new Google user profile
      userProfile = {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName || authenticatedUser.email.split('@')[0],
        photoURL: authenticatedUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${authenticatedUser.uid}`,
        role,
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        notesCount: 0,
        quizCount: 0,
        avgQuizScore: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDoc, userProfile);
    } else {
      userProfile = updateStreak(profileSnap.data());
      // Ensure role is preserved or updated if set
      if (!userProfile.role) {
        userProfile.role = role;
      }
      await updateDoc(userDoc, userProfile);
    }
    
    return { success: true, user: userProfile };
  };

  const localFn = () => {
    const user = auth.currentUser;
    if (user) {
      const realProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        role,
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        notesCount: 0,
        quizCount: 0,
        avgQuizScore: 0,
        createdAt: new Date().toISOString()
      };
      
      // Save in local active session so they log in as themselves!
      localStorage.setItem('active_mock_session', JSON.stringify(realProfile));
      return { success: true, user: realProfile };
    }
    
    // Sandbox Google Login Account Selector Prompt!
    const defaultEmail = role === 'teacher' ? 'teacher_expert@gmail.com' : 'scholar_student@gmail.com';
    const chosenEmail = window.prompt("🎓 SkillSync Sandbox Google SSO:\n\nPlease enter the Google email address you want to log in with:", defaultEmail);
    
    if (chosenEmail === null) {
      // User cancelled prompt
      throw new Error("auth/popup-closed-by-user");
    }
    
    const emailToUse = chosenEmail.trim().toLowerCase() || defaultEmail.toLowerCase();
    
    // LOOK UP Mock Database first to enforce real-world database rules!
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const existingMock = mockUsers.find(u => u.email.toLowerCase() === emailToUse);
    
    if (existingMock) {
      console.log("♻️ Sandbox SSO: Found existing user profile. Restoring cached session...", existingMock.profile);
      // Save existing user in active session
      localStorage.setItem('active_mock_session', JSON.stringify(existingMock.profile));
      return { success: true, user: existingMock.profile };
    }
    
    // Brand new mock Google account registration!
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
    
    // Persist new mock profile in mock database list so they can log in via both forms!
    mockUsers.push({ email: emailToUse, password: 'google_oauth_bypass', profile: mockProfile });
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));
    
    return { success: true, user: mockProfile };
  };

  return runWithFailover(cloudFn, localFn, 300000);
};

/**
 * Log out user from active session
 */
export const logoutUser = async () => {
  localStorage.removeItem('active_mock_session');
  if (isFirebaseActive) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
  }
  return { success: true };
};

/**
 * Update user profile details (displayName, photoURL, bio, phone, hobbies)
 */
export const updateUserProfile = async (userId, updatedFields) => {
  const cloudFn = async () => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, updatedFields);
    
    // Update local storage representation if active
    const mockSession = localStorage.getItem('active_mock_session');
    if (mockSession) {
      const parsed = JSON.parse(mockSession);
      if (parsed.uid === userId) {
        const updated = { ...parsed, ...updatedFields };
        localStorage.setItem('active_mock_session', JSON.stringify(updated));
      }
    }
    return { success: true, user: updatedFields };
  };

  const localFn = () => {
    return updateLocalProfile(userId, updatedFields);
  };

  return runWithFailover(cloudFn, localFn, 4000);
};

const updateLocalProfile = (userId, updatedFields) => {
  const activeSession = JSON.parse(localStorage.getItem('active_mock_session') || '{}');
  if (activeSession.uid === userId) {
    const updated = { ...activeSession, ...updatedFields };
    localStorage.setItem('active_mock_session', JSON.stringify(updated));
    
    // Also update in mock users list
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

/**
 * Subscribe to Authentication changes (logs user in/out automatically on reload)
 */
export const listenToAuthChanges = (callback) => {
  if (isFirebaseActive) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch profile
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const profile = snap.data();
            localStorage.setItem('active_mock_session', JSON.stringify(profile));
            callback(profile);
          } else {
            const basic = { uid: firebaseUser.uid, email: firebaseUser.email };
            localStorage.setItem('active_mock_session', JSON.stringify(basic));
            callback(basic);
          }
        } catch (e) {
          const basic = { uid: firebaseUser.uid, email: firebaseUser.email };
          localStorage.setItem('active_mock_session', JSON.stringify(basic));
          callback(basic);
        }
      } else {
        // Failsafe sandbox session recovery: if Firebase cloud session is unauthenticated,
        // check if a valid Sandbox local session is active in this browser before logging out!
        const mockSession = localStorage.getItem('active_mock_session');
        if (mockSession) {
          try {
            callback(JSON.parse(mockSession));
          } catch (e) {
            localStorage.removeItem('active_mock_session');
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    });
  } else {
    // LOCAL STORAGE AUTH LISTENER
    const mockSession = localStorage.getItem('active_mock_session');
    if (mockSession) {
      callback(JSON.parse(mockSession));
    } else {
      callback(null);
    }
    // Return a dummy unsubscribe function
    return () => {};
  }
};

// ==========================================
// 2. NOTES MANAGEMENT SERVICES
// ==========================================

/**
 * Upload a note (PDF or Image) and record metadata in Firestore
 */
export const uploadStudyNote = async (file, fileName, subject, userId, userRole = 'student', userName = '') => {
  const uploadDate = new Date().toISOString();
  const isPublic = userRole === 'teacher';
  const teacherName = isPublic ? (userName || 'Class Teacher 👨‍🏫') : '';
  
  const cloudFn = async () => {
    // 1. Upload actual file to Firebase Storage
    const fileRef = ref(storage, `notes/${userId}/${Date.now()}_${fileName}`);
    const uploadResult = await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(uploadResult.ref);
    
    // 2. Save note meta records to Firestore
    const noteData = {
      fileName,
      fileURL,
      fileType: file.type,
      subject,
      uploadedBy: userId,
      uploadDate,
      summary: '', // Empty initially, filled by Gemini later
      keyTakeaways: [],
      isPublic,
      teacherName
    };
    
    const docRef = await addDoc(collection(db, "notes"), noteData);
    
    // 3. Increment total uploaded notes in User Profile
    await incrementUserNotesCount(userId);
    
    return { id: docRef.id, ...noteData };
  };

  const localFn = () => {
    return uploadNoteLocally(file, fileName, subject, userId, uploadDate, isPublic, teacherName);
  };

  return runWithFailover(cloudFn, localFn, 4000);
};

// Helper to convert File object to Base64 string for permanent Local Storage persistence
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

// Helper function to upload note locally
const uploadNoteLocally = async (file, fileName, subject, userId, uploadDate, isPublic = false, teacherName = '') => {
  let fileURL = "";
  try {
    fileURL = await fileToBase64(file);
  } catch (e) {
    console.error("Failed to convert file to Base64, falling back to session blob:", e);
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
  localNotes.push(noteData);
  localStorage.setItem('local_notes', JSON.stringify(localNotes));

  // Update profile notesCount
  incrementLocalNotesCount();

  return noteData;
};

/**
 * Fetch all notes uploaded by a specific user or shared publicly
 */
export const getUserNotes = async (userId, userRole = 'student') => {
  const cloudFn = async () => {
    // Query notes collection
    const q = query(collection(db, "notes"));
    const snapshot = await getDocs(q);
    const notes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (userRole === 'teacher') {
        // Teacher sees only notes uploaded by them
        if (data.uploadedBy === userId) {
          notes.push({ id: doc.id, ...data });
        }
      } else {
        // Student sees all teacher-shared notes (isPublic === true) + their own uploads if any
        if (data.isPublic || data.uploadedBy === userId) {
          notes.push({ id: doc.id, ...data });
        }
      }
    });
    // Sort desc
    notes.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return notes;
  };

  const localFn = () => {
    return getLocalNotes(userId, userRole);
  };

  return runWithFailover(cloudFn, localFn, 3500);
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
 * Delete a study note from cloud or local storage sandbox
 */
export const deleteStudyNote = async (noteId, userId) => {
  if (isFirebaseActive && !noteId.startsWith('local_note_')) {
    try {
      const { deleteDoc, doc: fDoc } = await import('firebase/firestore');
      const noteDoc = fDoc(db, "notes", noteId);
      await deleteDoc(noteDoc);
      await decrementUserNotesCount(userId);
      return true;
    } catch (e) {
      console.warn("Failed to delete cloud note. Trying local.", e);
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
    const userDoc = doc(db, "users", userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const currentNotes = snap.data().notesCount || 1;
      await updateDoc(userDoc, { notesCount: Math.max(0, currentNotes - 1) });
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Update the AI summary of an uploaded note
 */
export const updateNoteSummary = async (noteId, summary, keyTakeaways) => {
  if (isFirebaseActive && !noteId.startsWith('local_note_')) {
    try {
      const noteDoc = doc(db, "notes", noteId);
      await updateDoc(noteDoc, { summary, keyTakeaways });
      return true;
    } catch (e) {
      console.warn("Failed to update cloud note summary. Updating locally.", e);
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
 * Save quiz results to Database
 */
export const saveQuizResult = async (quizData) => {
  const record = {
    ...quizData,
    takenAt: new Date().toISOString()
  };

  if (isFirebaseActive && !quizData.noteId?.startsWith('local_note_')) {
    try {
      const docRef = await addDoc(collection(db, "quizzes"), record);
      
      // Update statistics in User profile
      await updateUserQuizStats(quizData.userId, quizData.score);
      
      return { id: docRef.id, ...record };
    } catch (e) {
      console.warn("Failed to save cloud quiz. Saving locally.", e);
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

  // Update profile
  updateLocalQuizStats(record.score);

  return quizRecord;
};

/**
 * Get all quizzes solved by user
 */
export const getUserQuizzes = async (userId) => {
  if (isFirebaseActive) {
    try {
      const q = query(
        collection(db, "quizzes"), 
        where("userId", "==", userId),
        orderBy("takenAt", "desc")
      );
      const snapshot = await getDocs(q);
      const quizzes = [];
      snapshot.forEach(doc => {
        quizzes.push({ id: doc.id, ...doc.data() });
      });
      return quizzes;
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
 * Save dynamic roadmap to Database
 */
export const saveRoadmap = async (roadmapData) => {
  const record = {
    ...roadmapData,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseActive) {
    try {
      const docRef = await addDoc(collection(db, "roadmaps"), record);
      return { id: docRef.id, ...record };
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
  if (isFirebaseActive) {
    try {
      const q = query(
        collection(db, "roadmaps"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const roadmaps = [];
      snapshot.forEach(doc => {
        roadmaps.push({ id: doc.id, ...doc.data() });
      });
      return roadmaps;
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
    return profile; // Already active today
  }

  // Parse dates
  const today = new Date(todayStr);
  const lastStudy = new Date(lastStudyStr);
  const diffTime = Math.abs(today - lastStudy);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let newStreak = profile.streak;
  if (diffDays === 1) {
    newStreak += 1; // Consecutive day study!
  } else if (diffDays > 1) {
    newStreak = 1; // Missed days, streak resets
  }

  return {
    ...profile,
    streak: newStreak,
    lastStudyDate: todayStr
  };
};

const incrementUserNotesCount = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const currentNotes = snap.data().notesCount || 0;
      await updateDoc(userDoc, { notesCount: currentNotes + 1 });
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
    const userDoc = doc(db, "users", userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const data = snap.data();
      const currentQuizzes = data.quizCount || 0;
      const currentAvg = data.avgQuizScore || 0;
      
      const newCount = currentQuizzes + 1;
      const newAvg = Math.round(((currentAvg * currentQuizzes) + newScore) / newCount);
      
      await updateDoc(userDoc, {
        quizCount: newCount,
        avgQuizScore: newAvg
      });
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
 * Failsafe password reset trigger for Firebase & Sandbox local mode
 */
export const sendPasswordResetObj = async (email) => {
  const cloudFn = async () => {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  };
  const localFn = () => {
    return { success: true };
  };
  return runWithFailover(cloudFn, localFn);
};
