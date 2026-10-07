import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, ChatProfile, Transaction } from '../lib/api';
import {
  Wallet,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowRight,
  Compass,
  DollarSign,
  User as UserIcon,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { WithdrawActivationModal } from '../components/WithdrawActivationModal';

interface DashboardPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, logout, refreshUser } = useAuth();
  const { t, language } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [profiles, setProfiles] = useState<ChatProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const isSw = language === 'sw';

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, profilesRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getProfiles(),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      if (profilesRes.status === 'fulfilled') {
        setProfiles(profilesRes.value.profiles);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    refreshUser();
  }, []);

  const formatChatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const shortcuts = [
    { id: 'discover', label: isSw ? 'Anza Mazungumzo' : 'Start Chat', icon: MessageSquare, color: 'bg-[#0066FF]', textColor: 'text-white' },
    { id: 'discover', label: t('nav_discover'), icon: Compass, color: 'bg-blue-50 text-[#0066FF]', textColor: 'text-[#0066FF]' },
    { id: 'earnings', label: t('nav_earnings'), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', textColor: 'text-emerald-700' },
    { id: 'transactions', label: isSw ? 'Miamala' : 'Transactions', icon: DollarSign, color: 'bg-purple-50 text-purple-600', textColor: 'text-purple-700' },
    { id: 'withdraw', label: t('wd_title'), icon: Wallet, color: 'bg-[#FFF3E8] text-[#FF7A00]', textColor: 'text-[#FF7A00]' },
    { id: 'support', label: t('nav_support'), icon: HelpCircle, color: 'bg-cyan-50 text-cyan-600', textColor: 'text-cyan-700' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {t('dash_welcome')}, {user?.full_name}!
              </h1>
              {user?.is_activated ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('dash_activated')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('dash_pending_act')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.phone_number} · {user?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('discover')}
              className="px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('dash_start_chat')}</span>
            </button>
            <button
              onClick={() => {
                if (!user?.is_activated) {
                  setShowWithdrawModal(true);
                } else {
                  onNavigate('withdraw');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Wallet className="w-4 h-4 text-[#FF7A00]" />
              <span>{t('dash_withdraw_now')}</span>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={isSw ? 'Toka kwenye akaunti' : 'Log out of account'}
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>{isSw ? 'Toka' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* REQUIRED VIRTUAL ACCOUNT NOTICE ON WHITE BACKGROUND AND BOLD FONTS */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-md">
          <p className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-relaxed text-center sm:text-left">
            Lipia mtaji wa 16,000/= ili kupata akaunti kamili yenye uwezo kutoa pesa zako , pesa ya mtaji ina wezesha mifumo ya miamala na kibenki ya kampuni kufanya kazi
          </p>
        </div>

        {/* Activation Warning Banner if not activated */}
        {!user?.is_activated && (
          <div className="liquid-glass-orange p-5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-[#FF7A00]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Account Activation Required for Cash Withdrawals
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  You can chat and earn rewards freely. To unlock mobile money withdrawals (M-Pesa, Airtel, Tigo), complete account verification (Activation Fee: TZS 16,000).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E06A00] text-white text-xs font-bold shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              Activate Account Now
            </button>
          </div>
        )}

        {/* Core Stats Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Balance */}
          <div className="liquid-glass-blue p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>{t('dash_balance')}</span>
              <Wallet className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {Number(stats?.balance ?? user?.balance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#0066FF]">TZS</span>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-100/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">{isSw ? 'Tayari kutoa' : 'Ready to withdraw'}</span>
              <button
                onClick={() => {
                  if (!user?.is_activated) {
                    setShowWithdrawModal(true);
                  } else {
                    onNavigate('withdraw');
                  }
                }}
                className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{t('wd_title')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2. Total Earnings */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>{t('dash_total_earned')}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {Number(stats?.total_earned ?? user?.total_earned ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600">TZS</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{isSw ? 'Jumla ya mapato' : 'Cumulative rewards'}</span>
              <span className="text-emerald-600 font-bold">{isSw ? '100% Imethibitishwa' : '100% Verified'}</span>
            </div>
          </div>

          {/* 3. Chat Time */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>{t('dash_total_duration')}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {formatChatDuration(stats?.total_chat_seconds ?? user?.total_chat_seconds ?? 0)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{isSw ? 'Muda uliofundisha' : 'Duration spent teaching'}</span>
              <span className="text-amber-600 font-bold">{isSw ? 'Hai' : 'Active'}</span>
            </div>
          </div>

          {/* 4. Completed Chats */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>{t('dash_completed_sessions')}</span>
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {stats?.completed_chats ?? user?.completed_chats_count ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400">{isSw ? 'vikao' : 'sessions'}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{isSw ? 'Vikao vilivyolipwa' : 'Eligible paid sessions'}</span>
              <span className="text-purple-600 font-bold">{isSw ? 'Imerekodiwa' : 'Logged'}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Shortcuts */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Dashboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {shortcuts.map((sc, i) => {
              const Icon = sc.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(sc.id)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition text-center flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-xl ${sc.color} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold ${sc.textColor}`}>
                    {sc.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Partners for Quick Start */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Available Conversational Partners
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-500">
                Select a foreign learner to start an instant 10-minute session and earn rewards.
              </p>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {profiles.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="liquid-glass rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={p.avatar_url}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                        <p className="text-[11px] text-slate-500">{p.country} · {p.language}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0066FF] font-mono">
                        {p.chat_rate_tzs.toLocaleString()} <span className="text-[10px]">TZS</span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">10 mins</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {p.bio}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('chat', { profileId: p.id })}
                  className="w-full py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Start Chat Session</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="liquid-glass rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Recent Transactions Ledger
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_transactions.map((t: Transaction) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {t.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {t.type === 'reward' ? (
                          <span className="text-emerald-600">+{Number(t.amount).toLocaleString()} TZS</span>
                        ) : (
                          <span className="text-slate-900">-{Number(t.amount).toLocaleString()} TZS</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No transactions recorded yet. Complete your first chat session to earn rewards!
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAW / ACTIVATION POPUP */}
      <WithdrawActivationModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => {
          loadData();
          refreshUser();
        }}
      />
    </div>
  );
};
