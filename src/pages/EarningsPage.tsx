import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Transaction } from '../lib/api';
import {
  Wallet,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface EarningsPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const EarningsPage: React.FC<EarningsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, txnsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getTransactions(),
        ]);
        setStats(dashRes);
        setTransactions(txnsRes.transactions);
      } catch (err) {
        console.error('Failed to load earnings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatChatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const filteredTxns = transactions.filter((t) => {
    if (filterType === 'reward') return t.type === 'reward';
    if (filterType === 'withdrawal') return t.type === 'withdrawal';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified Financial Ledger
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Earnings & Rewards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Detailed breakdown of your session rewards, daily earnings, and verified balance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('withdraw')}
              className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw to Mobile Money</span>
            </button>
          </div>
        </div>

        {/* 6 Key Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Current Available Balance */}
          <div className="liquid-glass-blue p-6 rounded-3xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Current Available Balance</span>
              <Wallet className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {Number(stats?.balance ?? user?.balance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#0066FF]">TZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Liquid funds ready for M-Pesa / Tigo / Airtel payout
            </p>
          </div>

          {/* 2. Total Cumulative Earnings */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Lifetime Earnings</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {Number(stats?.total_earned ?? user?.total_earned ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600">TZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              All rewards earned across completed sessions
            </p>
          </div>

          {/* 3. Today's Earnings */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Today's Earnings</span>
              <Calendar className="w-4 h-4 text-[#FF7A00]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {Number(stats?.today_earnings ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#FF7A00]">TZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Sessions credited since midnight
            </p>
          </div>

          {/* 4. Weekly Earnings */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Weekly Earnings (Last 7 Days)</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {Number(stats?.weekly_earnings ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-purple-600">TZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Rolling 7-day verified rewards
            </p>
          </div>

          {/* 5. Completed Sessions */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Completed Sessions</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {stats?.completed_chats ?? user?.completed_chats_count ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400">chats</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Fully completed, timer-verified sessions
            </p>
          </div>

          {/* 6. Total Chat Time */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Chat Time</span>
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {formatChatDuration(stats?.total_chat_seconds ?? user?.total_chat_seconds ?? 0)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Combined tutoring duration logged
            </p>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Transaction History Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every transaction contains a server-generated ID and cryptographic ledger reference.
              </p>
            </div>

            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setFilterType('reward')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'reward'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rewards Only
              </button>
              <button
                onClick={() => setFilterType('withdrawal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'withdrawal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Withdrawals
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredTxns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Session / Description</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4 text-right">Reward / Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxns.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-sm">
                        {t.description}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                        {t.id}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {t.type === 'reward' ? (
                          <span className="text-emerald-600 font-bold">
                            +{Number(t.amount).toLocaleString()} TZS
                          </span>
                        ) : (
                          <span className="text-slate-900 font-bold">
                            -{Number(t.amount).toLocaleString()} TZS
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
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
            <div className="text-center py-12 text-slate-400 text-xs">
              No transactions found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
