import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../common/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  MessageSquare,
  Compass,
  DollarSign,
  HelpCircle,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('nav_home'), icon: null },
    { id: 'discover', label: t('nav_discover'), icon: Compass },
    { id: 'how-it-works', label: t('nav_how_it_works'), icon: null },
    { id: 'support', label: t('nav_support'), icon: HelpCircle },
  ];

  const handleNav = (tab: string, params?: any) => {
    onNavigate(tab, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
          >
            <Logo size="md" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                SWAHILI EARN
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00]"></span>
              </span>
              <p className="text-[10px] font-medium text-slate-500 hidden sm:block truncate max-w-[260px]">
                {t('nav_slogan')}
              </p>
            </div>
          </button>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-xs lg:text-sm font-semibold transition-colors cursor-pointer relative py-1 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#0066FF]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5 text-[#0066FF]" />}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#0066FF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          <PWAInstallButton />

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Wallet quick balance pill */}
              <button
                onClick={() => handleNav('wallet')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 hover:bg-blue-100/70 transition-colors cursor-pointer"
                title={t('nav_wallet')}
              >
                <Wallet className="w-3.5 h-3.5 text-[#0066FF]" />
                <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                  {Number(user.balance).toLocaleString()} TZS
                </span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => handleNav('notifications')}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title={t('nav_notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF7A00] text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs uppercase shadow-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNav('dashboard')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#0066FF]" />
                        <span>{t('nav_dashboard')}</span>
                      </button>
                      <button
                        onClick={() => handleNav('wallet')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                      >
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>{t('nav_wallet')}</span>
                      </button>
                      <button
                        onClick={() => handleNav('withdraw')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                      >
                        <DollarSign className="w-4 h-4 text-[#FF7A00]" />
                        <span>{t('wd_title')}</span>
                      </button>
                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>{t('nav_profile')}</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-lg text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>{t('nav_admin')}</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          handleNav('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav_logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Toka / Log Out button */}
              <button
                onClick={() => {
                  logout();
                  handleNav('home');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title={t('nav_logout')}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('nav_logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('login')}
                className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
              >
                {t('nav_signin')}
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                {t('nav_register')}
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">{t('lang_switch')}:</span>
            <LanguageSwitcher />
          </div>

          {user && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                <p className="text-[11px] text-slate-500">{user.phone_number}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {t('dash_balance')}
                </span>
                <p className="font-mono text-xs font-bold text-[#0066FF]">
                  {Number(user.balance).toLocaleString()} TZS
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                  currentTab === link.id
                    ? 'bg-blue-50 text-[#0066FF]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </button>
            ))}

            {user ? (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <MessageSquare className="w-4 h-4 text-[#0066FF]" />
                  <span>{t('nav_dashboard')}</span>
                </button>
                <button
                  onClick={() => handleNav('withdraw')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <DollarSign className="w-4 h-4 text-[#FF7A00]" />
                  <span>{t('wd_title')}</span>
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>{t('nav_profile')}</span>
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold text-purple-700 bg-purple-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('nav_admin')}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleNav('home');
                  }}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-center text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 mt-2 transition shadow-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>{t('nav_logout')} (Toka Kwenye Akaunti)</span>
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 text-center"
                >
                  {t('nav_signin')}
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2.5 rounded-xl bg-[#0066FF] text-white text-sm font-bold text-center shadow-md shadow-blue-500/20"
                >
                  {t('nav_register')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
