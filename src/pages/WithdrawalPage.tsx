import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Withdrawal } from '../lib/api';
import {
  Wallet,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Info,
  Clock,
} from 'lucide-react';
import { WithdrawActivationModal } from '../components/WithdrawActivationModal';

interface WithdrawalPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();

  const [activationInfo, setActivationInfo] = useState<{
    is_activated: boolean;
    balance: number;
    activation_fee: number;
    activation_url: string;
  } | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // Activation modal state
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [verifyingActivation, setVerifyingActivation] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  // Withdrawal form state
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '+255');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, wdlRes] = await Promise.all([
        api.checkWithdrawalStatus(),
        api.getWithdrawals(),
      ]);
      setActivationInfo(statusRes);
      setWithdrawals(wdlRes.withdrawals);
      setAmount(statusRes.balance > 0 ? statusRes.balance : 0);
    } catch (err) {
      console.error('Failed to load withdrawal details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateFee = (amt: number) => {
    if (!amt || amt <= 0) return 0;
    return Math.min(2500, Math.max(1000, Math.round(amt * 0.02)));
  };

  const currentFee = calculateFee(amount);
  const netAmount = Math.max(0, amount - currentFee);

  const handleOpenActivation = () => {
    setShowActivationModal(true);
    setActivationError(null);
  };

  const handleVerifyActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim()) {
      setActivationError('Please enter your payment receipt or reference code from OnlinePayPlatform.');
      return;
    }

    setVerifyingActivation(true);
    setActivationError(null);
    try {
      const res = await api.activateAccount(referenceCode.trim());
      setActivationSuccess(res.message);
      await refreshUser();
      await loadData();
      setTimeout(() => {
        setShowActivationModal(false);
      }, 1500);
    } catch (err: any) {
      setActivationError(err.message || 'Payment reference verification failed. Please ensure the reference is correct.');
    } finally {
      setVerifyingActivation(false);
    }
  };

  const handleWithdrawalSubmit = async () => {
    setWithdrawalError(null);
    if (!amount || amount < 10000) {
      setWithdrawalError('Minimum withdrawal amount is 10,000 TZS.');
      return;
    }
    if (amount > (activationInfo?.balance || 0)) {
      setWithdrawalError('Withdrawal amount exceeds your current available balance.');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 9) {
      setWithdrawalError('Please enter a valid mobile recipient number.');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const res = await api.submitWithdrawal({
        amount,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      });

      setWithdrawalSuccess(
        `Withdrawal of ${res.amount.toLocaleString()} TZS queued successfully (ID: ${res.withdrawal_id}). Net payout: ${res.net_amount.toLocaleString()} TZS.`
      );
      setShowConfirmModal(false);
      await refreshUser();
      await loadData();
    } catch (err: any) {
      setWithdrawalError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const paymentMethods = [
    { id: 'M-Pesa', label: 'Vodacom M-Pesa', color: 'text-red-600' },
    { id: 'Airtel Money', label: 'Airtel Money', color: 'text-red-500' },
    { id: 'Tigo Pesa', label: 'Tigo Pesa / Yas', color: 'text-blue-600' },
    { id: 'Halopesa', label: 'Halopesa', color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A00] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
              Mobile Money Disbursements
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Withdraw Funds
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Disburse your verified Swahili chat rewards to your personal mobile money wallet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-right shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Available Balance
              </span>
              <p className="text-xl font-black text-slate-900 font-mono">
                {Number(activationInfo?.balance ?? user?.balance ?? 0).toLocaleString()}{' '}
                <span className="text-xs text-[#0066FF]">TZS</span>
              </p>
            </div>
          </div>
        </div>

        {/* REQUIRED VIRTUAL ACCOUNT NOTICE ON WHITE BACKGROUND AND BOLD FONTS */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-md">
          <p className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-relaxed text-center sm:text-left">
            Lipia mtaji wa 16,000/= ili kupata akaunti kamili yenye uwezo kutoa pesa zako , pesa ya mtaji ina wezesha mifumo ya miamala na kibenki ya kampuni kufanya kazi
          </p>
        </div>

        {/* 1. ACTIVATION STATUS BANNER / GATE */}
        {!activationInfo?.is_activated ? (
          <div className="liquid-glass-orange p-6 sm:p-8 rounded-3xl border border-orange-200/90 shadow-md space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#FF7A00] text-white flex-shrink-0 shadow-md">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Account Activation Required Before Withdrawal
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Account activation is required before accessing withdrawal services. This one-time identity & payment verification fee of <strong>TZS 16,000</strong> ensures anti-fraud compliance for all Tanzanian mobile money networks (M-Pesa, Airtel, Tigo).
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleOpenActivation}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#FF7A00] hover:bg-[#E06A00] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ACTIVATE YOUR ACCOUNT NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="liquid-glass rounded-2xl p-4 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Your Account is Verified & Fully Activated for Withdrawals</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Active Status</span>
          </div>
        )}

        {/* 2. WITHDRAWAL FORM (ENABLED FOR ACTIVATED USERS) */}
        <div className={`liquid-glass rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 ${!activationInfo?.is_activated ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Submit Mobile Money Withdrawal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Funds are disbursed via Tanzanian mobile network gateways to your registered mobile line.
            </p>
          </div>

          {withdrawalError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{withdrawalError}</span>
            </div>
          )}

          {withdrawalSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{withdrawalSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Withdrawal Amount (TZS)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10000"
                  max={activationInfo?.balance || 0}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 80000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
                <button
                  type="button"
                  onClick={() => setAmount(activationInfo?.balance || 0)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-blue-50 text-[11px] font-bold text-[#0066FF] hover:bg-blue-100 transition cursor-pointer"
                >
                  Max Balance
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Minimum withdrawal: 10,000 TZS</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#0066FF] bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">{m.id}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recipient Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+255 712 345 678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Fee & Net Amount Preview Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Withdrawal:</span>
                <span className="font-mono font-bold text-slate-900">
                  {amount.toLocaleString()} TZS
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Standard Carrier Fee:</span>
                <span className="font-mono text-slate-700">
                  {currentFee.toLocaleString()} TZS
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Net Amount to Receive:</span>
                <span className="font-mono text-[#0066FF]">
                  {netAmount.toLocaleString()} TZS
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={amount <= 0 || amount > (activationInfo?.balance || 0)}
                className="w-full py-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Payout of {netAmount.toLocaleString()} TZS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. WITHDRAWAL HISTORY LEDGER */}
        <div className="liquid-glass rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Withdrawals Ledger
          </h3>

          {withdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Withdrawal ID</th>
                    <th className="py-3 px-4">Method & Recipient</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Net Payout</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {w.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{w.payment_method}</span>
                        <span className="text-[11px] text-slate-500">{w.phone_number}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(w.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {Number(w.net_amount).toLocaleString()} TZS
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            w.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : w.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : w.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No previous withdrawal requests found.
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM WITHDRAWAL MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-900 space-y-4">
            <h3 className="text-lg font-black text-slate-900 text-center">
              Confirm Withdrawal
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  TZS {amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Fee:</span>
                <span className="font-mono text-slate-700">
                  TZS {currentFee.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Net Amount:</span>
                <span className="font-mono text-[#0066FF]">
                  TZS {netAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Destination: <strong className="text-slate-800">{paymentMethod}</strong> ({phoneNumber})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdrawalSubmit}
                disabled={submittingWithdrawal}
                className="w-1/2 py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {submittingWithdrawal ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT ACTIVATION / WITHDRAW MODAL */}
      <WithdrawActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSuccess={() => {
          loadData();
          refreshUser();
        }}
      />
    </div>
  );
};
