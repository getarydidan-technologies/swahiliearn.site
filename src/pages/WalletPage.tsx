import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Transaction } from '../lib/api';
import {
  Wallet,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { WithdrawActivationModal } from '../components/WithdrawActivationModal';

interface WalletPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, txns] = await Promise.all([
        api.getDashboardStats(),
        api.getTransactions(),
      ]);
      setStats(dash);
      setTransactions(txns.transactions);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    refreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
              Cryptographic Wallet & Balances
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              My Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your balances, review escrow holds, and initiate cashouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadData();
                refreshUser();
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (!user?.is_activated) {
                  setShowWithdrawModal(true);
                } else {
                  onNavigate('withdraw');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>

        {/* REQUIRED VIRTUAL ACCOUNT NOTICE ON WHITE BACKGROUND AND BOLD FONTS */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-md">
          <p className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-relaxed text-center sm:text-left">
            Lipia mtaji wa 16,000/= ili kupata akaunti kamili yenye uwezo kutoa pesa zako , pesa ya mtaji ina wezesha mifumo ya miamala na kibenki ya kampuni kufanya kazi
          </p>
        </div>

        {/* 4 Wallet Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Balance */}
          <div className="liquid-glass-blue p-6 rounded-3xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Available Balance</span>
              <Wallet className="w-4 h-4 text-[#0066FF]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Number(stats?.balance ?? user?.balance ?? 0).toLocaleString()}
            </p>
            <span className="text-[11px] font-bold text-[#0066FF] mt-1 block">TZS Available</span>
          </div>

          {/* Pending Balance */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Pending Escrow</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Number(stats?.pending_balance ?? user?.pending_balance ?? 0).toLocaleString()}
            </p>
            <span className="text-[11px] font-medium text-amber-600 mt-1 block">TZS in Processing</span>
          </div>

          {/* Total Earned */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Number(stats?.total_earned ?? user?.total_earned ?? 0).toLocaleString()}
            </p>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Lifetime Rewards</span>
          </div>

          {/* Total Withdrawn */}
          <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Withdrawn</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Number(stats?.total_withdrawn ?? user?.total_withdrawn ?? 0).toLocaleString()}
            </p>
            <span className="text-[11px] font-medium text-purple-600 mt-1 block">Disbursed to Mobile</span>
          </div>
        </div>

        {/* Ledger */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Wallet Transaction History
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {transactions.length} records found
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Transaction Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        {t.type === 'reward' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                            Debit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {t.id}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {t.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
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
                              : 'bg-amber-50 text-amber-700'
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
            <div className="py-12 text-center text-xs text-slate-400">
              No transactions logged in this wallet yet.
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
