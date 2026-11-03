'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pb, getUserRole } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import type { RecordModel } from 'pocketbase';

interface DemoUser {
  id: string;
  email: string;
  role: 'admin' | 'employer' | 'candidate';
  created: string;
  updated: string;
  [key: string]: any;
}

interface AuthContextType {
  user: RecordModel | DemoUser | null;
  isLoggedIn: boolean;
  role: string | null;
  needsRoleSelection: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  loginAsDemo: (role: 'admin' | 'employer' | 'candidate') => void;
  assignRole: (role: 'candidate' | 'employer') => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  updateUser: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | DemoUser | null>(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Cek dari PocketBase authStore
    if (pb.authStore.isValid && pb.authStore.record) {
      setUser(pb.authStore.record as RecordModel);
    } else if (typeof window !== 'undefined') {
      // 2. Cek dari LocalStorage demo session
      const savedDemo = localStorage.getItem('demo_user');
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
        } catch {
          // ignore
        }
      }
    }

    const unsub = pb.authStore.onChange((_token, record) => {
      if (record) {
        setUser(record as RecordModel);
      } else if (typeof window !== 'undefined') {
        const savedDemo = localStorage.getItem('demo_user');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => { unsub(); };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const auth = await pb.collection('users').authWithPassword(email, password);
      setUser(auth.record as RecordModel);
      const userRole = (auth.record as RecordModel).role;
      if (typeof window !== 'undefined' && userRole === 'admin') {
        localStorage.setItem('admin_auth', 'true');
      }
      if (userRole === 'admin') router.push('/admin');
      else if (userRole === 'employer') router.push('/employer');
      else router.push('/candidate');
    } catch (err) {
      // Jika PB offline atau user memakai kredensial demo default
      if (email === 'admin@hrtech.id' && password === 'Admin@hrtech123') {
        loginAsDemo('admin');
        return;
      }
      throw err;
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider });
      const record = authData.record as RecordModel;
      setUser(record);

      const existingRole = record.role;
      if (!existingRole) {
        // User baru mendaftar via Google / GitHub -> Munculkan dialog pemilihan peran
        setNeedsRoleSelection(true);
        return;
      }

      if (typeof window !== 'undefined' && existingRole === 'admin') {
        localStorage.setItem('admin_auth', 'true');
      }

      if (existingRole === 'admin') router.push('/admin');
      else if (existingRole === 'employer') router.push('/employer');
      else router.push('/candidate');
    } catch (err) {
      console.error(`OAuth login error (${provider}):`, err);
      throw err;
    }
  };

  const assignRole = async (chosenRole: 'candidate' | 'employer') => {
    try {
      if (pb.authStore.isValid && pb.authStore.record?.id) {
        const updated = await pb.collection('users').update(pb.authStore.record.id, {
          role: chosenRole,
        });
        setUser(updated as RecordModel);
      } else if (user?.id) {
        await updateUser({ role: chosenRole });
      }
      setNeedsRoleSelection(false);
      if (chosenRole === 'employer') router.push('/employer');
      else router.push('/candidate');
    } catch (err) {
      console.warn('Error saving chosen OAuth role:', err);
      if (user) {
        setUser((prev: any) => ({ ...prev, role: chosenRole }));
      }
      setNeedsRoleSelection(false);
      if (chosenRole === 'employer') router.push('/employer');
      else router.push('/candidate');
    }
  };

  const loginAsDemo = (role: 'admin' | 'employer' | 'candidate') => {
    const demoData: DemoUser = {
      id: `demo-${role}-01`,
      email: role === 'admin' ? 'admin@hrtech.id' : role === 'employer' ? 'employer@demo.com' : 'kandidat@demo.com',
      role,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(demoData));
      localStorage.setItem('demo_role', role);
      if (role === 'admin') {
        localStorage.setItem('admin_auth', 'true');
      }
    }
    setUser(demoData);

    if (role === 'admin') router.push('/admin');
    else if (role === 'employer') router.push('/employer');
    else router.push('/candidate');
  };

  const register = async (email: string, password: string, role: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        role,
      });
      await login(email, password);
    } catch (err) {
      // Fallback demo register jika offline
      loginAsDemo(role as any);
    }
  };

  const updateUser = async (data: Record<string, any>) => {
    try {
      if (pb.authStore.isValid && user?.id && !user.id.startsWith('demo-')) {
        const updated = await pb.collection('users').update(user.id, data);
        setUser(updated as RecordModel);
        return;
      }
    } catch (err) {
      console.warn('PocketBase user update error, falling back to local state:', err);
    }
    setUser((prev: any) => {
      const merged = { ...prev, ...data, updated: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(merged));
      }
      return merged;
    });
  };

  const logout = () => {
    pb.authStore.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_role');
      localStorage.removeItem('admin_auth');
    }
    setNeedsRoleSelection(false);
    setUser(null);
    router.push('/');
  };

  const hasDemoRole = typeof window !== 'undefined' ? Boolean(localStorage.getItem('demo_role')) : false;
  const currentRole = user?.role || getUserRole();
  const isLoggedIn = Boolean(user || pb.authStore.isValid || hasDemoRole);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      role: currentRole,
      needsRoleSelection,
      login,
      loginWithOAuth,
      loginAsDemo,
      assignRole,
      register,
      updateUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
