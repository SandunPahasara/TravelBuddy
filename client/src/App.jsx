import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Explore from './pages/Explore';
import AttractionDetails from './pages/AttractionDetails';
import MapPage from './pages/MapPage';
import PlannerPage from './pages/PlannerPage';
import UserProfile from './pages/UserProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const [attractions, setAttractions] = useState([]);
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('travelbuddy_day_plan');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState('');

  const { token, authModalOpen, authModalTab, closeAuthModal } = useAuth();

  // ── Dark / Light Mode ──────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('travelbuddy_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('travelbuddy_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  // ── Persist plan ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('travelbuddy_day_plan', JSON.stringify(plan));
  }, [plan]);

  // ── Toast ──────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Fetch attractions ──────────────────────────────────────────
  const fetchAttractions = async () => {
    try {
      const res = await fetch('/api/attractions');
      const data = await res.json();
      if (data.success) setAttractions(data.data);
    } catch (err) {
      console.error('Failed to load attractions', err);
    }
  };

  useEffect(() => { fetchAttractions(); }, []);

  // ── Plan handlers ──────────────────────────────────────────────
  const handleTogglePlan = (attraction) => {
    const id = attraction.id || attraction._id;
    const exists = plan.some(item => (item.id || item._id) === id);
    if (exists) {
      setPlan(plan.filter(item => (item.id || item._id) !== id));
      showToast('Removed from your day plan.');
    } else {
      setPlan([...plan, attraction]);
      showToast('Added to your day plan!');
    }
  };

  const handleRemoveFromPlan = (id) => {
    setPlan(plan.filter(item => (item.id || item._id) !== id));
    showToast('Attraction removed from your day plan.');
  };

  const handleClearPlan = () => { setPlan([]); showToast('Day plan cleared.'); };
  const handleReorderPlan = (newPlan) => setPlan(newPlan);

  const planIds = plan.map(item => item.id || item._id);

  return (
    <Router>
      <div className="tb-app">

        {/* ── Top Navigation Bar ── */}
        <Navbar
          planCount={plan.length}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

        {/* ── Page Wrapper ── */}
        <div className="tb-page-wrapper">

          {/* Toast Notification */}
          {toast && (
            <div className="toast">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)', flexShrink: 0 }} />
              {toast}
            </div>
          )}

          {/* Page Content */}
          <main className="tb-main">
            <Routes>
              <Route path="/" element={
                <Home attractions={attractions} planIds={planIds} onTogglePlan={handleTogglePlan} />
              } />
              <Route path="/explore" element={
                <Explore attractions={attractions} planIds={planIds} onTogglePlan={handleTogglePlan} />
              } />
              <Route path="/attractions/:id" element={
                <AttractionDetails
                  attractions={attractions}
                  planIds={planIds}
                  onTogglePlan={handleTogglePlan}
                />
              } />
              <Route path="/map" element={
                <MapPage attractions={attractions} planIds={planIds} onTogglePlan={handleTogglePlan} />
              } />
              <Route path="/planner" element={
                <PlannerPage
                  planAttractions={plan}
                  onRemoveFromPlan={handleRemoveFromPlan}
                  onClearPlan={handleClearPlan}
                  onReorderPlan={handleReorderPlan}
                />
              } />
              <Route path="/profile" element={
                <UserProfile />
              } />
              <Route path="/users/:id" element={
                <UserProfile />
              } />
              <Route path="/admin/login" element={
                <AdminLogin />
              } />
              <Route path="/admin/dashboard" element={
                <AdminDashboard
                  attractions={attractions}
                  adminToken={token}
                  onRefreshAttractions={fetchAttractions}
                />
              } />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Universal Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          initialTab={authModalTab}
          onSuccess={() => showToast('Signed in successfully!')}
        />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
