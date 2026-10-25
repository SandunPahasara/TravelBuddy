import React, { useState } from 'react';
import {
  X, LogIn, UserPlus, Mail, Lock, User,
  FileText, Image as ImageIcon, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSwitchTab = (newTab) => {
    resetState();
    setTab(newTab);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetState();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetState();

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        bio: regBio.trim(),
        profilePicture: regAvatarUrl.trim()
      });
      setSuccessMsg('Account created successfully! Welcome to TravelBuddy.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(5, 10, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fadeIn"
        style={{
          width: '100%', maxWidth: 460,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 26px', position: 'relative',
          borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-accent)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button
            onClick={() => handleSwitchTab('login')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              border: tab === 'login' ? '1px solid var(--border-accent)' : '1px solid transparent',
              background: tab === 'login' ? 'rgba(20,184,166,0.15)' : 'none',
              color: tab === 'login' ? 'var(--text-accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            onClick={() => handleSwitchTab('register')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              border: tab === 'register' ? '1px solid var(--border-accent)' : '1px solid transparent',
              background: tab === 'register' ? 'rgba(20,184,166,0.15)' : 'none',
              color: tab === 'register' ? 'var(--text-accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: '0.8125rem'
          }}>
            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#6ee7b7', fontSize: '0.8125rem'
          }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Sign In Form ── */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email or Username
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="name@example.com or username"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: 4, borderRadius: 10 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Registration Form ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Full Display Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Kasun Perera"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Email Address *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Password (min 6 characters) *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Choose a secure password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Profile Picture URL (Optional)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ImageIcon size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={regAvatarUrl}
                  onChange={e => setRegAvatarUrl(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Short Bio (Optional)
              </label>
              <textarea
                placeholder="Share a few words about your travel interests..."
                value={regBio}
                onChange={e => setRegBio(e.target.value)}
                className="tb-input"
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: 4, borderRadius: 10 }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
