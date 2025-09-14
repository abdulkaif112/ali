import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase implementation using global Firebase object
  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      await auth.signOut();
      localStorage.removeItem('ali_enterprises_user'); // Clean up local storage
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (!auth || !window.firebase) {
      throw new Error('Firebase not initialized');
    }
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  useEffect(() => {
    const initAuth = () => {
      if (auth) {
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
          if (user) {
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User'
            };
            setCurrentUser(userData);
            localStorage.setItem('ali_enterprises_user', JSON.stringify(userData));
          } else {
            setCurrentUser(null);
            localStorage.removeItem('ali_enterprises_user');
          }
          setLoading(false);
        });
        return unsubscribe;
      } else {
        // Fallback to check localStorage if Firebase not ready
        const storedUser = localStorage.getItem('ali_enterprises_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
      }
    };

    // Try to initialize immediately or wait for Firebase
    if (auth) {
      initAuth();
    } else {
      const checkFirebase = setInterval(() => {
        if (auth) {
          clearInterval(checkFirebase);
          initAuth();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkFirebase);
        if (!auth) {
          console.warn('Firebase auth not available, using fallback');
          const storedUser = localStorage.getItem('ali_enterprises_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
          setLoading(false);
        }
      }, 5000);
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    loginWithGoogle,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};