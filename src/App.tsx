/**
 * SWAHILI EARN - Main App Component
 * Integrates full-stack state routing, Navbar, Footer, OfflineIndicator, and Pages.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ChatScreen } from './pages/ChatScreen';
import { EarningsPage } from './pages/EarningsPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatHistoryPage } from './pages/ChatHistoryPage';
import { SupportPage } from './pages/SupportPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminPage } from './pages/AdminPage';
import { NotificationsPage } from './pages/NotificationsPage';

import { api } from './lib/api';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tabParams, setTabParams] = useState<any>({});
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.getNotifications();
      const unread = res.notifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Ignore background failure
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [user, currentTab]);

  const handleNavigate = (tab: string, params?: any) => {
    // If navigating to chat or dashboard while logged out, redirect to login
    if ((tab === 'chat' || tab === 'dashboard' || tab === 'withdraw' || tab === 'wallet' || tab === 'profile') && !user) {
      setCurrentTab('login');
      return;
    }

    setCurrentTab(tab);
    setTabParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white font-black text-xl shadow-lg animate-pulse">
            SE
          </div>
          <p className="text-xs font-bold text-slate-500 tracking-wider">
            Loading SWAHILI EARN...
          </p>
        </div>
      </div>
    );
  }

  // Render Current Page
  const renderPage = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'how-it-works':
        return <HomePage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'discover':
        return <DiscoverPage onNavigate={handleNavigate} />;
      case 'chat':
        return (
          <ChatScreen
            profileId={tabParams.profileId || 'eliza-poland'}
            onNavigate={handleNavigate}
          />
        );
      case 'earnings':
      case 'transactions':
        return <EarningsPage onNavigate={handleNavigate} />;
      case 'withdraw':
        return <WithdrawalPage onNavigate={handleNavigate} />;
      case 'wallet':
        return <WalletPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'history':
        return <ChatHistoryPage onNavigate={handleNavigate} />;
      case 'support':
      case 'faq':
        return <SupportPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      case 'notifications':
        return (
          <NotificationsPage
            onNavigate={handleNavigate}
            onRefreshUnread={fetchUnreadNotifications}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Hide Navbar and Footer inside full-screen immersive live Chat Screen
  const isChatActive = currentTab === 'chat';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {!isChatActive && (
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          unreadCount={unreadCount}
        />
      )}

      <div className="flex-1">{renderPage()}</div>

      {!isChatActive && <Footer onNavigate={handleNavigate} />}

      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
