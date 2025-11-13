import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'https://molise-group-3.onrender.com';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const loadUserData = async (user) => {
    if (!user) {
      setUserData(null);
      setUserDataLoaded(false);
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    } else {
      setUserData(null);
    }
    setUserDataLoaded(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setUserDataLoaded(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(email, password, role, additionalData = {}) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      // Register with backend (best effort)
      try {
        await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
          role,
          additionalData
        });
      } catch (error) {
        console.error('Backend registration failed:', error);
      }

      // Ensure user document exists in Firestore for client-side usage
      const userDoc = {
        uid: userCredential.user.uid,
        email,
        role,
        emailVerified: false,
        createdAt: serverTimestamp(),
        ...additionalData
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc, { merge: true });

      return { success: true, user: userCredential.user };
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in');
      }

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setUserDataLoaded(true);
        return { success: true, user: userCredential.user, userData: data };
      }

      setUserDataLoaded(true);
      return { success: true, user: userCredential.user };
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setUserDataLoaded(false);
    } catch (error) {
      throw error;
    }
  }

  async function forgotPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  const value = {
    currentUser,
    userData,
    userDataLoaded,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    refreshUserData: () => loadUserData(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

