import React, { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: fullName,
      });
    } else {
      console.warn(
        "Could not update profile immediately after signup, currentUser is null."
      );
    }

    return userCredential;
  };

  const logout = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
