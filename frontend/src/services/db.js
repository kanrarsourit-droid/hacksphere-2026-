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
  onAuthStateChanged
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
// 1. AUTHENTICATION SERVICES
// ==========================================

/**
 * Sign up a new user using Email and Password
 */
export const registerUser = async (email, password, displayName) => {
  if (isFirebaseActive) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize a profile in Firestore for this new user
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        notesCount: 0,
        quizCount: 0,
        avgQuizScore: 0,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", user.uid), userProfile);
      return { success: true, user: userProfile };
    } catch (error) {
      console.error("Firebase Registration Error: ", error);
      throw error; // Pass error to UI so the student knows what went wrong (e.g. email already exists)
    }
  } else {
    // LOCAL STORAGE FALLBACK
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
  }
};

/**
 * Log in an existing user with Email and Password
 */
export const loginUser = async (email, password) => {
  if (isFirebaseActive) {
    try {
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
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      throw error;
    }
  } else {
    // LOCAL STORAGE FALLBACK
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
  }
};

/**
 * Single Sign-On with Google
 */
export const loginWithGoogle = async () => {
  if (isFirebaseActive) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile already exists
      const userDoc = doc(db, "users", user.uid);
      const profileSnap = await getDoc(userDoc);
      
      let userProfile = {};
      if (!profileSnap.exists()) {
        // Initialize new Google user profile
        userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
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
        await updateDoc(userDoc, userProfile);
      }
      
      return { success: true, user: userProfile };
    } catch (error) {
      console.error("Google Auth Error: ", error);
      throw error;
    }
  } else {
    // LOCAL STORAGE FALLBACK
    const mockUid = 'mock_google_' + Math.random().toString(36).substr(2, 9);
    const mockProfile = {
      uid: mockUid,
      email: "google_student@gmail.com",
      displayName: "Google Scholar 🎓",
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${mockUid}`,
      streak: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      notesCount: 2,
      quizCount: 1,
      avgQuizScore: 90,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('active_mock_session', JSON.stringify(mockProfile));
    return { success: true, user: mockProfile };
  }
};

/**
 * Log out user from active session
 */
export const logoutUser = async () => {
  if (isFirebaseActive) {
    await signOut(auth);
  } else {
    localStorage.removeItem('active_mock_session');
  }
  return { success: true };
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
            callback(snap.data());
          } else {
            callback({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (e) {
          callback({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        callback(null);
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
export const uploadStudyNote = async (file, fileName, subject, userId) => {
  const uploadDate = new Date().toISOString();
  
  if (isFirebaseActive) {
    try {
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
        keyTakeaways: []
      };
      
      const docRef = await addDoc(collection(db, "notes"), noteData);
      
      // 3. Increment total uploaded notes in User Profile
      await incrementUserNotesCount(userId);
      
      return { id: docRef.id, ...noteData };
    } catch (error) {
      console.error("Firebase Note Upload Error: ", error);
      // If Firestore or Storage rules are blocked, fall back to Local Storage
      console.warn("Storage is blocked in dashboard. Gracefully writing note to local system.");
      return uploadNoteLocally(file, fileName, subject, userId, uploadDate);
    }
  } else {
    return uploadNoteLocally(file, fileName, subject, userId, uploadDate);
  }
};

// Helper function to upload note locally
const uploadNoteLocally = async (file, fileName, subject, userId, uploadDate) => {
  // Create a virtual URL for our local PDF/Image so it can be previewed!
  const fileURL = URL.createObjectURL(file);
  
  const noteData = {
    id: 'local_note_' + Math.random().toString(36).substr(2, 9),
    fileName,
    fileURL,
    fileType: file.type,
    subject,
    uploadedBy: userId,
    uploadDate,
    summary: '',
    keyTakeaways: []
  };

  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  localNotes.push(noteData);
  localStorage.setItem('local_notes', JSON.stringify(localNotes));

  // Update profile notesCount
  incrementLocalNotesCount();

  return noteData;
};

/**
 * Fetch all notes uploaded by a specific user
 */
export const getUserNotes = async (userId) => {
  if (isFirebaseActive) {
    try {
      const q = query(
        collection(db, "notes"), 
        where("uploadedBy", "==", userId),
        orderBy("uploadDate", "desc")
      );
      const snapshot = await getDocs(q);
      const notes = [];
      snapshot.forEach(doc => {
        notes.push({ id: doc.id, ...doc.data() });
      });
      return notes;
    } catch (e) {
      console.warn("Error fetching cloud notes. Loading local storage notes instead.", e);
      return getLocalNotes(userId);
    }
  } else {
    return getLocalNotes(userId);
  }
};

const getLocalNotes = (userId) => {
  const localNotes = JSON.parse(localStorage.getItem('local_notes') || '[]');
  return localNotes.filter(note => note.uploadedBy === userId).reverse();
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
