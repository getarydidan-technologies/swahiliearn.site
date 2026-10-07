import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';
import { signInWithGoogle, signOutFirebase, syncUserToFirestore } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (fullName: string, phoneNumber: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const curToken = getStoredToken();
    if (!curToken) {
      // Check if we have a stable memory login saved locally
      try {
        const memoryLead = localStorage.getItem('swahili_earn_client_lead');
        if (memoryLead) {
          const parsed = JSON.parse(memoryLead);
          if (parsed.full_name && parsed.phone_number) {
            const res = await api.login({ full_name: parsed.full_name, phone_number: parsed.phone_number });
            setStoredToken(res.token);
            setToken(res.token);
            setUser(res.user);
            setLoading(false);
            return;
          }
        }
      } catch {}

      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);

      // Keep Firestore in sync if Firebase user is authenticated
      if (data.user) {
        syncUserToFirestore({
          email: data.user.email,
          full_name: data.user.full_name,
          phone_number: data.user.phone_number,
          balance: data.user.balance,
          is_activated: data.user.is_activated,
        });
      }
    } catch (err) {
      // Auto-recover session from stable client memory
      try {
        const memoryLead = localStorage.getItem('swahili_earn_client_lead');
        if (memoryLead) {
          const parsed = JSON.parse(memoryLead);
          if (parsed.full_name && parsed.phone_number) {
            const res = await api.login({ full_name: parsed.full_name, phone_number: parsed.phone_number });
            setStoredToken(res.token);
            setToken(res.token);
            setUser(res.user);
            setLoading(false);
            return;
          }
        }
      } catch {}

      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Stable memory login: Name & Phone Number only
  const login = async (fullName: string, phoneNumber: string) => {
    const res = await api.login({ full_name: fullName, phone_number: phoneNumber });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);

    // Persist live memory credentials (never wiped on logout so returning user is remembered)
    try {
      const activeName = (res.user && res.user.full_name) || fullName || '';
      const activePhone = (res.user && res.user.phone_number) || phoneNumber || '';
      localStorage.setItem(
        'swahili_earn_client_lead',
        JSON.stringify({
          full_name: activeName,
          phone_number: activePhone,
          user_id: res.user.id,
          saved_at: new Date().toISOString(),
        })
      );
      if (activePhone) {
        localStorage.setItem('swahili_earn_live_memory_phone', activePhone);
      }
      if (activeName) {
        localStorage.setItem('swahili_earn_live_memory_name', activeName);
      }
    } catch {}

    // Sync to Firestore
    syncUserToFirestore({
      email: res.user.email,
      full_name: res.user.full_name,
      phone_number: res.user.phone_number,
      balance: res.user.balance,
      is_activated: res.user.is_activated,
    });
  };

  const register = async (payload: any) => {
    const fullName = payload.full_name || '';
    const phoneNumber = payload.phone_number || '';
    return login(fullName, phoneNumber);
  };

  const loginWithGoogle = async () => {
    const fbUser = await signInWithGoogle();
    const res = await api.loginWithGoogle({
      email: fbUser.email || '',
      full_name: fbUser.displayName || 'Google User',
      google_uid: fbUser.uid,
      photo_url: fbUser.photoURL || undefined,
    });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);

    // Sync to Firestore with Firebase UID
    await syncUserToFirestore({
      email: res.user.email,
      full_name: res.user.full_name,
      phone_number: res.user.phone_number,
      balance: res.user.balance,
      is_activated: res.user.is_activated,
    });
  };

  const logout = () => {
    removeStoredToken();
    // Live memory credentials (swahili_earn_live_memory_phone and client_lead) are preserved
    // so when returning, the user's phone number is instantly ready to restore the account!
    setToken(null);
    setUser(null);
    signOutFirebase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
