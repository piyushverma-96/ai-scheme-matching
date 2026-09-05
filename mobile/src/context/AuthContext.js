import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { signInUser, signUpUser, signOutUser, getCurrentSession } from '../services/auth';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session load
    const initializeAuth = async () => {
      setLoading(true);
      const { session, user } = await getCurrentSession();
      setSession(session);
      setUser(user);
      setLoading(false);
    };

    initializeAuth();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const result = await signInUser({ email, password });
    if (result.success) {
      setSession(result.data.session);
      setUser(result.data.user);
    }
    setLoading(false);
    return result;
  };

  const signup = async (email, password, fullName, phone) => {
    setLoading(true);
    const result = await signUpUser({ email, password, fullName, phone });
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    const result = await signOutUser();
    if (result.success) {
      setSession(null);
      setUser(null);
    }
    setLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
