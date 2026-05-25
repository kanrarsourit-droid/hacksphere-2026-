import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// We load them from environment variables if present, otherwise we fall back to your provided config!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAC3RTLQrhVjPriagcJI8-KJCH9VsQ3kqA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillsync-9cce2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillsync-9cce2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillsync-9cce2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "662250882281",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:662250882281:web:030281eed940e63d3f5c78"
};

// Initialize Firebase (safely checks if already initialized to prevent hot-reloading errors)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Provider for "Sign in with Google"
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export the main app
export default app;
