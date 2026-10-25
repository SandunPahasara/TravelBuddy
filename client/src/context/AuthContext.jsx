import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('travelbuddy_token') || '');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Verify token on initial load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        // Also check if admin token exists from legacy storage
        const legacyAdmin = localStorage.getItem('travelbuddy_admin_token');
        if (legacyAdmin) {
          setToken(legacyAdmin);
        } else {
          setLoading(false);
          return;
        }
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.valid && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          setToken('');
          setUser(null);
          localStorage.removeItem('travelbuddy_token');
          localStorage.removeItem('travelbuddy_admin_token');
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Persist token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('travelbuddy_token', token);
      if (user?.role === 'admin') {
        localStorage.setItem('travelbuddy_admin_token', token);
      }
    } else {
      localStorage.removeItem('travelbuddy_token');
      localStorage.removeItem('travelbuddy_admin_token');
    }
  }, [token, user]);

  const login = async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, username: identifier, password })
    });

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (res.status === 404) {
        throw new Error('API route /api/auth/login not found (404). Please restart the backend server so the updated routes take effect.');
      }
      throw new Error(text || `Server error (${res.status})`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (formData) => {
    let body;
    let headers = {};

    if (formData instanceof FormData) {
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(formData);
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers,
      body
    });

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (res.status === 404) {
        throw new Error('Registration endpoint not found (404). Please restart the backend server so the new registration route takes effect.');
      }
      throw new Error(text || `Server error (${res.status})`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    setAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('travelbuddy_token');
    localStorage.removeItem('travelbuddy_admin_token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAdmin,
      loading,
      login,
      register,
      logout,
      updateUser,
      authModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
