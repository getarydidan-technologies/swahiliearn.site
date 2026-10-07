import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogIn,
  Wallet,
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle } = useAuth();
  const { language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberedPhone, setRememberedPhone] = useState('');
  const [rememberedName, setRememberedName] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSw = language === 'sw';

  // Load from live memory on mount
  useEffect(() => {
    try {
      const livePhone = localStorage.getItem('swahili_earn_live_memory_phone');
      const liveName = localStorage.getItem('swahili_earn_live_memory_name');
      const memoryLead = localStorage.getItem('swahili_earn_client_lead');

      let foundPhone = livePhone || '';
      let foundName = liveName || '';

      if (memoryLead) {
        const parsed = JSON.parse(memoryLead);
        if (parsed.phone_number && !foundPhone) foundPhone = parsed.phone_number;
        if (parsed.full_name && !foundName) foundName = parsed.full_name;
      }

      if (foundPhone) {
        setRememberedPhone(foundPhone);
        setPhoneNumber(foundPhone);
      }
      if (foundName) {
        setRememberedName(foundName);
        setFullName(foundName);
      }
    } catch {}
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onNavigate('dashboard');
    } catch (err: any) {
      setError(
        err.message ||
          (isSw ? 'Kujisajili kwa Google kumeshindwa. Jaribu tena.' : 'Google Sign-in failed. Please try again.')
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phoneNumber.trim();
    const cleanName = fullName.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      setError(
        isSw
          ? 'Tafadhali weka namba sahihi ya simu ya Tanzania (mfano: 0712345678 au +255...).'
          : 'Please enter a valid phone number (e.g., 0712345678 or +255...).'
      );
      return;
    }

    setLoading(true);
    try {
      // Direct login and restoration of existing account via phone number & name
      await login(cleanName, cleanPhone);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(
        err.message ||
          (isSw
            ? 'Imeshindwa kufungua akaunti. Tafadhali hakikisha namba yako ya simu ipo sahihi.'
            : 'Login failed. Please check your phone number.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRestore = async (phoneToUse: string) => {
    setError(null);
    setLoading(true);
    try {
      await login('', phoneToUse);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(
        err.message ||
          (isSw ? 'Imeshindwa kurejesha akaunti.' : 'Failed to retrieve account.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0047BA] text-white font-black text-2xl shadow-xl shadow-blue-500/25">
            SE
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {isSw ? 'INGIA KWENYE AKAUNTI' : 'LOG IN TO ACCOUNT'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {isSw
              ? 'Weka namba yako ya simu kuingia moja kwa moja kwenye dashboard yako na kurejesha taarifa zako zote na salio'
              : 'Enter your phone number to access your dashboard directly and restore all your details and wallet balance'}
          </p>
        </div>

        {/* Live Memory Quick Restore Banner */}
        {rememberedPhone && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50 border border-blue-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {isSw
                      ? 'Namba Yako Imekumbukwa (Live Memory)'
                      : 'Remembered Phone Detected'}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {rememberedName ? `${rememberedName} · ` : ''}
                  {rememberedPhone}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickRestore(rememberedPhone)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSw ? 'Ingia Papo Hapo' : 'Quick Log In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Card Form */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xl">
          {/* Quick Notice Badge */}
          <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 flex items-start gap-3 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#0066FF] font-bold block mb-0.5">
                {isSw ? 'Urahisi wa Kuingia kwa Namba ya Simu' : 'Fast Easy Mobile Access'}
              </strong>
              <span>
                {isSw
                  ? 'Kama uliwahi kujiandikisha, weka namba yako ya simu tu na taarifa zako zote na salio lako kwenye waleti zitarudi kama mwanzo.'
                  : 'Returning users can simply enter their phone number to restore all previous records, sessions, and wallet balance.'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  {isSw ? 'Namba ya Simu ya Malipo (M-Pesa / Tigo Pesa)' : 'Mobile Money Phone Number'}{' '}
                  <span className="text-rose-500">*</span>
                </span>
                {rememberedPhone && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isSw ? 'Kutoka Live Memory' : 'Live Memory'}
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  autoFocus={!rememberedPhone}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={isSw ? '0712 345 678 au +255...' : '0712 345 678 or +255...'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] font-medium transition"
                />
              </div>
            </div>

            {/* 2. Full Name (optional if returning) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isSw ? 'Jina Kamili' : 'Full Name'}{' '}
                <span className="text-slate-400 font-normal">
                  {isSw ? '(Hiari kama umeshajisajili)' : '(Optional if returning)'}
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isSw ? 'mfano: Juma Dickson' : 'e.g. Juma Dickson'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] font-medium transition"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>{isSw ? 'Inapakia taarifa zako...' : 'Loading your account...'}</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isSw ? 'INGIA KWENYE AKAUNTI' : 'LOG IN TO ACCOUNT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Link to Register */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-xs text-slate-600 hover:text-[#0066FF] font-semibold cursor-pointer underline"
              >
                {isSw
                  ? 'Huna akaunti bado? Bonyeza hapa Kujisajili'
                  : "Don't have an account yet? Click here to Register"}
              </button>
            </div>
          </form>

          {/* Google Sign-in Alternative */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isSw ? 'au endelea kwa' : 'or continue with'}
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {googleLoading
                ? isSw
                  ? 'Inaunganisha na Google...'
                  : 'Connecting with Google...'
                : isSw
                ? 'Endelea na Google'
                : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {isSw
              ? 'Taarifa zako na waleti vinalindwa kwa usalama wa hali ya juu'
              : 'Your client records and wallet are securely remembered'}
          </span>
        </div>
      </div>
    </div>
  );
};
