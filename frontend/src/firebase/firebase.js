import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// We load them from environment variables if present, otherwise we fall back to your provided config!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDRN5gWr5XUo_a4qH0_ZsY_A096QW0Msuk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hacksphere-f6a7b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hacksphere-f6a7b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hacksphere-f6a7b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "124432834934",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:124432834934:web:bba65efcb43cb1320b9a57"
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
