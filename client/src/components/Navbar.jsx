import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, Lock, LayoutDashboard,
  LogOut, Home, Search, Menu, X, Sun, Moon, User,
  ChevronDown, Shield, ThumbsUp, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function Navbar({ planCount, darkMode, onToggleTheme }) {
  const location = useLocation();
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdownOpen]);

  const navLinks = [
    { to: '/',        label: 'Home',            icon: Home },
    { to: '/explore', label: 'Explore',         icon: Search },
    { to: '/map',     label: 'Map',             icon: MapPin },
    { to: '/planner', label: 'Day Plan',        icon: Calendar },
  ];

  return (
    <>
      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      <header
        className={`tb-navbar${scrolled ? ' tb-navbar--scrolled' : ''}`}
        role="banner"
      >
        <div className="tb-navbar__inner">

          {/* Brand */}
          <Link to="/" className="tb-brand" aria-label="TravelBuddy Home">
            <div className="tb-brand__icon">
              <Compass size={20} color="#050d10" />
            </div>
            <div>
              <span className="tb-brand__name">TravelBuddy</span>
              <span className="tb-brand__sub">Panadura Day-Visit</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="tb-nav" aria-label="Main navigation">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`tb-nav__link${isActive(to) ? ' tb-nav__link--active' : ''}`}
              >
                <Icon size={15} />
                <span>{label}</span>
                {to === '/planner' && planCount > 0 && (
                  <span className="tb-badge">{planCount}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="tb-actions">
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="tb-icon-btn"
              aria-label="Toggle light/dark mode"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Session Profile & Controls */}
            {user ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 10px 4px 5px', borderRadius: 999,
                    background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                    cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={resolveImageUrl(user.profilePicture, `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`)}
                    alt={user.name}
                    onError={handleImageError}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="glass-card animate-fadeIn"
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: 220, padding: '8px 6px', borderRadius: 14,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100,
                      border: '1px solid var(--border-accent)'
                    }}
                  >
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email || user.username}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="tb-nav__link"
                      style={{ padding: '8px 10px', borderRadius: 8, fontSize: '0.8125rem' }}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User size={15} /> My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="tb-nav__link"
                        style={{ padding: '8px 10px', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--text-accent)' }}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="tb-nav__link"
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 8,
                        fontSize: '0.8125rem', color: '#ef4444', textAlign: 'left',
                        background: 'none', border: 'none', cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => openAuthModal('login')}
                  className="tb-btn-outline"
                  style={{ cursor: 'pointer' }}
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
                <Link to="/admin/login" className="tb-icon-btn" title="Admin Portal" aria-label="Admin Portal">
                  <Lock size={15} />
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <div className="tb-mobile-controls">
              {planCount > 0 && (
                <Link to="/planner" className="tb-icon-btn" aria-label={`Day plan: ${planCount} items`}>
                  <Calendar size={18} />
                  <span className="tb-badge tb-badge--abs">{planCount}</span>
                </Link>
              )}
              <button
                className="tb-icon-btn tb-hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`tb-overlay${menuOpen ? ' tb-overlay--visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Menu Drawer ── */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`tb-mobile-menu${menuOpen ? ' tb-mobile-menu--open' : ''}`}
        role="dialog"
      >
        <div className="tb-mobile-menu__header">
          <Link to="/" className="tb-brand" onClick={() => setMenuOpen(false)}>
            <div className="tb-brand__icon">
              <Compass size={18} color="#050d10" />
            </div>
            <span className="tb-brand__name" style={{ fontSize: '1rem' }}>TravelBuddy</span>
          </Link>
          <button className="tb-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="tb-mobile-nav" style={{ padding: '16px' }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`tb-mobile-nav__link${isActive(to) ? ' tb-mobile-nav__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === '/planner' && planCount > 0 && (
                <span className="tb-badge">{planCount}</span>
              )}
            </Link>
          ))}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  to="/profile"
                  className="tb-mobile-nav__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={18} />
                  <span>My Profile ({user.name})</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="tb-mobile-nav__link"
                    onClick={() => setMenuOpen(false)}
                    style={{ color: 'var(--text-accent)' }}
                  >
                    <LayoutDashboard size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="tb-mobile-nav__link"
                  style={{ color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <User size={16} /> Sign In
                </button>
                <Link
                  to="/admin/login"
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Lock size={16} /> Admin Portal
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
