import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewReportForm from './pages/NewReportForm';
import SettingsDirectory from './pages/SettingsDirectory';
import Analytics from './pages/Analytics';
import MobileAppTab from './pages/MobileAppTab';
import Login from './pages/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check logged in user
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNewReport={() => setActiveTab('new_report')}
            onViewReport={(rep) => console.log('Viewing report', rep)}
          />
        )}

        {activeTab === 'new_report' && (
          <NewReportForm
            onCancel={() => setActiveTab('dashboard')}
            onSuccess={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'settings' && <SettingsDirectory />}

        {activeTab === 'mobile' && <MobileAppTab />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <b>СводСправка</b> — Информационно-аналитическая система сводных справок и опросных листов.
          </div>
          <div className="flex items-center space-x-4 text-slate-400 font-medium">
            <span>FastAPI Backend v1.0</span>
            <span>•</span>
            <span>React Web Portal</span>
            <span>•</span>
            <span>Android APK Client</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
