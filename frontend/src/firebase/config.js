import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Option 1: Use environment variables (recommended for production)
// Option 2: Replace the values directly below
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC0SzzjlR2cEJKHTDa8JBOZ6mXUvDhfLt4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "molise-ce8ea.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "molise-ce8ea",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "molise-ce8ea.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "19333850259",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:19333850259:web:8a45c97255ff0258c81966",
  measurementId: process.env.REACT_APP_FIREBASE_API_KEY ||  "G-9QHQB1DCYK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

