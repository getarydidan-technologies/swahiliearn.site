import React, { useState, useEffect, useRef } from 'react';
import { api, ChatProfile } from '../lib/api';
import avatarSarah from '../assets/images/avatar_sarah_partner_1790978693289.jpg';
import avatarMark from '../assets/images/avatar_mark_partner_1790978683862.jpg';
import avatarEliza from '../assets/images/avatar_eliza_partner_1790978674237.jpg';
import avatarDavid from '../assets/images/avatar_david_partner_1790979990804.jpg';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Wallet,
  Settings,
  Plus,
  CheckCircle2,
  XCircle,
  Save,
  MessageSquare,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Globe2,
  Search,
  Activity,
  Clock,
  Sparkles,
  LogOut,
  Upload,
  Image as ImageIcon,
  Check,
  Camera,
  RefreshCw,
  Phone,
  MessageCircle,
  Copy,
  Radio,
  Share2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

// 12 High-Quality Preset Avatars so admin can pick instantly with 1 tap (No URL required)
const AVATAR_PRESETS = [
  { label: 'Sarah (USA)', url: avatarSarah, country: 'United States' },
  { label: 'Mark (UK)', url: avatarMark, country: 'United Kingdom' },
  { label: 'Eliza (Poland)', url: avatarEliza, country: 'Poland' },
  { label: 'David (Canada)', url: avatarDavid, country: 'Canada' },
  { label: 'Elena (Sweden)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', country: 'Sweden' },
  { label: 'Michael (Australia)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', country: 'Australia' },
  { label: 'Sophie (France)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', country: 'France' },
  { label: 'Lucas (Italy)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', country: 'Italy' },
  { label: 'Emily (Germany)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', country: 'Germany' },
  { label: 'Alexander (Norway)', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', country: 'Norway' },
  { label: 'Chloe (Netherlands)', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', country: 'Netherlands' },
  { label: 'Oliver (New Zealand)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', country: 'New Zealand' },
];

const NAME_SUGGESTIONS = [
  'Sarah Jenkins',
  'Mark Thompson',
  'Eliza Novak',
  'David Miller',
  'Elena Rostova',
  'Lucas Rossi',
  'Sophie Laurent',
  'Michael Anderson',
  'Emily Schmidt',
  'Alexander Berg',
];

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  // Passcode Gate state (Access Code: 8998admin)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('swahili_earn_admin_unlocked') === '8998admin';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active sub-navigation in Admin Portal
  const [activeTab, setActiveTab] = useState<'profiles' | 'users' | 'leads' | 'payments' | 'social' | 'withdrawals' | 'settings'>('profiles');

  // Data states
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<ChatProfile[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    activation_url: 'https://onlinepayplatform.com/register?ref=Didan255',
    activation_fee: '16000',
    admin_email: 'getarydickson@gmail.com',
    instagram_url: 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3',
    tiktok_url: 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA',
    facebook_url: 'https://www.facebook.com/share/1HgRiAX6J2/',
    sponsor_url: 'https://onlinepay-d7wjpyve.manus.space/',
    whatsapp_support_url: 'https://wa.me/message/EP72QM4VJRTIA1',
    whatsapp_channel_url: 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q',
    support_sms_number: '0743697677',
  });

  // Verified Payments in infinite scroll
  const [verifiedPayments, setVerifiedPayments] = useState<any[]>([
    { name: 'Asha M.', amount: '180,000 Tsh', location: 'Dar es Salaam, Tanzania', method: 'Halopesa', time: 'Sekunde 14 zilizopita' },
    { name: 'Chazi O.', amount: '2,000 Ksh', location: 'Nairobi, Kenya', method: 'Safaricom M-Pesa', time: 'Sekunde 28 zilizopita' },
    { name: 'Juma K.', amount: '140,000 Tsh', location: 'Mwanza, Tanzania', method: 'Vodacom M-Pesa', time: 'Sekunde 45 zilizopita' },
    { name: 'Wanjiku N.', amount: '3,500 Ksh', location: 'Mombasa, Kenya', method: 'Safaricom M-Pesa', time: 'Dakika 1 iliyopita' },
    { name: 'Neema S.', amount: '210,000 Tsh', location: 'Arusha, Tanzania', method: 'Tigo Pesa', time: 'Dakika 1 iliyopita' },
    { name: 'Kambale B.', amount: '95,000 FC / $35', location: 'Goma, DRC (Kongo)', method: 'Airtel Money', time: 'Dakika 2 zilizopita' },
    { name: 'Baraka E.', amount: '160,000 Tsh', location: 'Dodoma, Tanzania', method: 'Airtel Money', time: 'Dakika 2 zilizopita' },
    { name: 'Uwase D.', amount: '48,000 RWF', location: 'Kigali, Rwanda', method: 'MTN MoMo', time: 'Dakika 3 zilizopita' },
    { name: 'Fatma H.', amount: '190,000 Tsh', location: 'Zanzibar, Tanzania', method: 'Vodacom M-Pesa', time: 'Dakika 3 zilizopita' },
    { name: 'Otieno P.', amount: '2,800 Ksh', location: 'Kisumu, Kenya', method: 'Safaricom M-Pesa', time: 'Dakika 4 zilizopita' },
    { name: 'Kelvin M.', amount: '150,000 Tsh', location: 'Mbeya, Tanzania', method: 'Halopesa', time: 'Dakika 4 zilizopita' },
    { name: 'Nkurunziza J.', amount: '85,000 BIF', location: 'Bujumbura, Burundi', method: 'Lumicash', time: 'Dakika 5 zilizopita' },
    { name: 'Mukamba C.', amount: '120,000 FC', location: 'Bukavu, DRC (Kongo)', method: 'Orange Money', time: 'Dakika 5 zilizopita' },
    { name: 'Okello T.', amount: '180,000 UGX', location: 'Kampala, Uganda', method: 'MTN Mobile Money', time: 'Dakika 6 zilizopita' },
    { name: 'Zuhura A.', amount: '175,000 Tsh', location: 'Tanga, Tanzania', method: 'Tigo Pesa', time: 'Dakika 6 zilizopita' },
    { name: 'Kiprono S.', amount: '4,200 Ksh', location: 'Nakuru, Kenya', method: 'Safaricom M-Pesa', time: 'Dakika 7 zilizopita' },
  ]);

  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: '',
    location: '',
    method: 'Vodacom M-Pesa',
    time: 'Sekunde chache zilizopita',
  });

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Hidden File input ref for 1-click device photo upload (Zero URL required)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Add / Edit Foreign Learner Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProfile, setEditingProfile] = useState<any>({
    id: '',
    name: '',
    country: 'United States',
    language: 'English',
    status: 'tourist',
    occupation: 'Tourist / Explorer',
    chat_rate_tzs: 80000,
    session_duration_minutes: 10,
    avatar_url: avatarSarah,
    bio: 'Traveling to East Africa soon. I want to learn basic daily conversation and polite greetings.',
    personality: 'Friendly, patient, eager to learn.',
  });

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [l, u, w, p, s] = await Promise.all([
        api.getAdminLeads().catch(() => ({ leads: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminWithdrawals().catch(() => ({ withdrawals: [] })),
        api.getProfiles().catch(() => ({ profiles: [] })),
        api.getAdminSettings().catch(() => ({ settings: {} })),
      ]);
      setLeadsList(l.leads || []);
      setUsersList(u.users || []);
      setWithdrawalsList(w.withdrawals || []);
      setProfilesList(p.profiles || []);
      if (s.settings && Object.keys(s.settings).length > 0) {
        const adminMap = s.settings as Record<string, string>;
        setSettings((prev) => ({ ...prev, ...adminMap }));
        if (adminMap.verified_payments) {
          try {
            const parsed = JSON.parse(adminMap.verified_payments);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setVerifiedPayments(parsed);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadAdminData();
    }
  }, [isUnlocked]);

  // Handle Passcode Submission (Code: 8998admin)
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    const cleanCode = passcode.trim();
    if (cleanCode !== '8998admin') {
      setPasscodeError('Code maalum si sahihi! Huna idhini ya kuingia kwenye jopo hili.');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.verifyAdminPasscode(cleanCode);
      if (res.token) {
        localStorage.setItem('swahili_earn_token', res.token);
      }
      sessionStorage.setItem('swahili_earn_admin_unlocked', '8998admin');
      setIsUnlocked(true);
      await loadAdminData();
    } catch {
      sessionStorage.setItem('swahili_earn_admin_unlocked', '8998admin');
      setIsUnlocked(true);
      await loadAdminData();
    } finally {
      setVerifying(false);
    }
  };

  const handleAdminLock = () => {
    sessionStorage.removeItem('swahili_earn_admin_unlocked');
    setIsUnlocked(false);
    setPasscode('');
    setActionMessage(null);
  };

  // 1. Direct File Upload from Device (NO URL NEEDED)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setEditingProfile((prev: any) => ({ ...prev, avatar_url: dataUrl }));
        setUploadSuccessMessage('✓ Picha imepakiwa kutoka kifaa chako bila kuhitaji link yoyote!');
        setTimeout(() => setUploadSuccessMessage(null), 4000);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 2. Foreign Learners Management
  const handleOpenAddProfile = () => {
    setModalMode('add');
    setEditingProfile({
      id: '',
      name: '',
      country: 'United States',
      language: 'English',
      status: 'tourist',
      occupation: 'Tourist / Explorer',
      chat_rate_tzs: 80000,
      session_duration_minutes: 10,
      avatar_url: avatarSarah,
      bio: 'Habari! I want to practice daily conversational Swahili, greetings, and common phrases with native speakers.',
      personality: 'Kind, polite, patient, eager to learn.',
    });
    setUploadSuccessMessage(null);
    setShowProfileModal(true);
  };

  const handleOpenEditProfile = (profile: ChatProfile) => {
    setModalMode('edit');
    setEditingProfile({
      id: profile.id,
      name: profile.name,
      country: profile.country,
      language: profile.language,
      status: profile.status || 'tourist',
      occupation: profile.occupation || 'Tourist / Explorer',
      chat_rate_tzs: profile.chat_rate_tzs,
      session_duration_minutes: profile.session_duration_minutes,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      personality: profile.personality,
    });
    setUploadSuccessMessage(null);
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile.name.trim()) {
      alert('Tafadhali weka jina la mzungu/mwanafunzi');
      return;
    }

    try {
      await api.saveAdminProfile(editingProfile);
      setShowProfileModal(false);
      setActionMessage(
        modalMode === 'add'
          ? `Mzungu mpya "${editingProfile.name}" ameongezwa kikamilifu!`
          : `Taarifa za "${editingProfile.name}" zimesahihishwa kikamilifu!`
      );
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Hitilafu wakati wa kuhifadhi taarifa za mzungu');
    }
  };

  const handleDeleteProfile = async (id: string, name: string) => {
    if (!window.confirm(`Je, una uhakika unataka kumfuta "${name}" kwenye mfumo?`)) {
      return;
    }
    try {
      await api.deleteAdminProfile(id);
      setActionMessage(`"${name}" ameondolewa kwenye mfumo.`);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Hitilafu wakati wa kufuta');
    }
  };

  // 3. Users Activation Toggle
  const handleToggleActivation = async (userId: number, currentStatus: boolean) => {
    try {
      await api.setAdminUserActivation(userId, !currentStatus);
      setActionMessage(`Mtumiaji #${userId} sasa ni: ${!currentStatus ? 'IMEEZESHWA (Active)' : 'IMEZIMWA (Pending)'}`);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Hitilafu kubadili hali ya uwezeshaji');
    }
  };

  // 4. Withdrawals Status Update
  const handleUpdateWithdrawal = async (withdrawalId: string, status: string) => {
    try {
      await api.updateAdminWithdrawalStatus(withdrawalId, status);
      setActionMessage(`Ombi la kutoa pesa #${withdrawalId} limewekwa: ${status.toUpperCase()}`);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Hitilafu kurekodi hali ya kutoa pesa');
    }
  };

  // 5. Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAdminSettings(settings);
      setActionMessage('Mipangilio ya mfumo na viungo vya mitandao vimehifadhiwa kikamilifu!');
    } catch (e: any) {
      alert(e.message || 'Hitilafu kuhifadhi mipangilio');
    }
  };

  // 6. Manage Verified Payments (Infinite Live Scroll on Homepage)
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.name.trim() || !newPayment.amount.trim()) {
      alert('Tafadhali jaza Jina na Kiasi cha muamala');
      return;
    }
    const updated = [newPayment, ...verifiedPayments];
    setVerifiedPayments(updated);
    setNewPayment({
      name: '',
      amount: '',
      location: '',
      method: 'Vodacom M-Pesa',
      time: 'Sekunde chache zilizopita',
    });
    const updatedSettings = { ...settings, verified_payments: JSON.stringify(updated) };
    setSettings(updatedSettings);
    try {
      await api.saveAdminSettings(updatedSettings);
      setActionMessage('Muamala mpya ulioidhinishwa umeongezwa kwenye live scroll ya tovuti!');
    } catch (err: any) {
      alert(err.message || 'Hitilafu kuhifadhi muamala');
    }
  };

  const handleDeletePayment = async (idx: number) => {
    const updated = verifiedPayments.filter((_, i) => i !== idx);
    setVerifiedPayments(updated);
    const updatedSettings = { ...settings, verified_payments: JSON.stringify(updated) };
    setSettings(updatedSettings);
    try {
      await api.saveAdminSettings(updatedSettings);
      setActionMessage('Muamala umeondolewa kutoka kwenye live scroll!');
    } catch (err: any) {
      alert(err.message || 'Hitilafu kuondoa muamala');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionMessage(`Umenakili ${label}: ${text}`);
  };

  // Filtered users for search
  const filteredUsers = usersList.filter((u) => {
    if (!searchUserQuery.trim()) return true;
    const q = searchUserQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.phone_number && u.phone_number.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // =========================================================================
  // VIEW 1: PASSCODE GATE (Access Code: 8998admin)
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001433] to-slate-900 py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Top Badge */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-2xl shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-bold text-amber-300 mt-4 uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Administrative Access Only</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
              ADMIN PORTAL LOG IN
            </h1>
            <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
              Eneo hili limelindwa. Weka code maalum ya siri ya kiutawala ili kufungua jopo kuu.
            </p>
          </div>

          {/* Passcode Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
            {passcodeError && (
              <div className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3 text-rose-300 text-xs">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Code Maalum ya Admin (Security Passcode) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Weka code ya admin (mfano: 8998...)"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Uthibitisho wa kiwango cha juu unahitajika kufikia akaunti na wageni.
                </p>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <span>Inathibitisha code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>THIBITISHA & INGIA KWENYE PORTAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <button
                onClick={() => onNavigate('home')}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Rudi Kwenye Tovuti ya Kawaida
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: UNLOCKED ADMIN PORTAL SUITE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hidden File Input for Device Photo Upload (NO URL REQUIRED) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileUpload}
        className="hidden"
      />

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
              SE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">SWAHILI EARN ADMIN PORTAL</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase">
                  Live & Unlocked
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Utawala Mkuu: Ongeza & Sahihisha Wazungu Bila URL · Mornitor Akaunti · Mornitor Watembeleaji
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onNavigate('discover')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Tazama Wageni Nje (Discover)</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              Home Page
            </button>
            <button
              onClick={handleAdminLock}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Funga Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer text-xs"
            >
              Funga
            </button>
          </div>
        )}

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Foreign Learners */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Wazungu / Wanafunzi</span>
              <Globe2 className="w-4 h-4 text-[#0066FF]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">
              {profilesList.length}
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Wapo tayari nje mtandaoni
            </span>
          </div>

          {/* Metric 2: Registered Users */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Watu Waliojiunga</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">
              {usersList.length}
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {usersList.filter((u) => u.is_activated).length} Waleti Zilizowashwa
            </span>
          </div>

          {/* Metric 3: Leads / Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Watembeleaji / Leads</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">
              {leadsList.length}
            </p>
            <span className="text-[11px] text-amber-400 font-semibold">
              Traffic ya mtandaoni
            </span>
          </div>

          {/* Metric 4: Total Payouts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Maombi ya Malipo</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">
              {withdrawalsList.length}
            </p>
            <span className="text-[11px] text-purple-400 font-semibold">
              {withdrawalsList.filter((w) => w.status === 'pending').length} Yanayosubiri
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profiles'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Wazungu / Marafiki wa Kiswahili ({profilesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Waliotembelea & Kufungua Akaunti Pepe ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Watembeleaji / Traffic ({leadsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Miamala Iliyothibitishwa ({verifiedPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'social'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Viungo vya Mitandao (Social Links)</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Maombi ya Kutoa Pesa ({withdrawalsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Mipangilio ya Mfumo</span>
          </button>
        </div>

        {/* ===================================================================
            TAB 1: WAZUNGU / MARAFIKI WA KISWAHILI
            =================================================================== */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Usimamizi wa Wazungu & Marafiki Wanaotaka Kujifunza Kiswahili
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Bila URL Yeyote
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Sahihisha jina, picha ya wasifu (kwa kuipakia kutoka kwenye kifaa chako au kuchagua kwenye maktaba), nchi, na malipo. Mabadiliko yoyote yanawekwa alama mara moja kwenye UI ya nje.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddProfile}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ ONGEZA MZUNGU / MWANAFUNZI MPYA</span>
              </button>
            </div>

            {/* Profiles Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profilesList.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden"
                >
                  <div>
                    {/* Top: Avatar, Name & Live Outside Indicator */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={p.avatar_url}
                            alt={p.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-base font-bold text-white">{p.name}</h3>
                            {p.status && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 capitalize">
                                {p.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                            <span>{p.country}</span>
                            <span>·</span>
                            <span className="text-blue-400">{p.language}</span>
                            {p.occupation && (
                              <>
                                <span>·</span>
                                <span className="text-amber-400 text-[11px] font-medium">
                                  {p.occupation}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="inline-block mt-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                            [ online ]
                          </span>
                        </div>
                      </div>

                      {/* Outside UI Status Marker */}
                      <div className="text-right">
                        <span className="inline-block font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs mb-1">
                          [ online ]
                        </span>
                        <span className="block text-[9px] text-emerald-400 font-semibold">
                          🟢 Inaonekana Kwenye UI
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                      {p.bio}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between mb-4">
                      <span className="text-slate-400">Malipo ya Kikao:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {p.chat_rate_tzs?.toLocaleString()} TZS ({p.session_duration_minutes} min)
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onNavigate('chat', { profileId: p.id })}
                      className="w-full py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>ONGEA NAYE SASA (TEST / CHAT)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenEditProfile(p)}
                        className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Sahihisha Taarifa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id, p.name)}
                        className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Futa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: MORNITOR WATU WALIOJIUNGA (REGISTERED ACCOUNTS)
            =================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Mornitor Akaunti za Watu Waliojiunga ({usersList.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Tazama salio zao, jumla walizopata, vikao vya mazungumzo, na washa au zima waleti zao papo hapo.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tafuta kwa jina au namba..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4"># ID</th>
                    <th className="py-3 px-4">Mtumiaji (Jina & Simu)</th>
                    <th className="py-3 px-4">Salio Lililopo</th>
                    <th className="py-3 px-4">Jumla Alizopata</th>
                    <th className="py-3 px-4">Vikao</th>
                    <th className="py-3 px-4">Hali ya Waleti</th>
                    <th className="py-3 px-4 text-center">Ufuatiliaji (Follow-up)</th>
                    <th className="py-3 px-4">Kitendo (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Hakuna mtumiaji aliyepatikana.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const cleanPhone = (u.phone_number || '').replace(/[^0-9]/g, '');
                      const waPhone = cleanPhone.startsWith('0') ? '255' + cleanPhone.slice(1) : cleanPhone;
                      const waMsg = encodeURIComponent(
                        `Habari ${u.full_name || ''}, karibu SWAHILI EARN! Tumegundua umefungua akaunti yako ya virtual. Je unahitaji msaada wowote kuanza kuchati na wazungu na kutoa malipo yako kwenda M-Pesa au Tigo Pesa?`
                      );
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                            #{u.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{u.full_name || 'Mteja'}</div>
                            <div className="text-[11px] text-blue-400 font-mono mt-0.5">
                              {u.phone_number}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                            {Number(u.balance || 0).toLocaleString()} TZS
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-200">
                            {Number(u.total_earned || 0).toLocaleString()} TZS
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            {u.completed_chats_count || 0}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.is_activated ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                Imewashwa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                <Clock className="w-3 h-3" />
                                Virtual (Inasubiri Mtaji)
                              </span>
                            )}
                          </td>
                          {/* Follow-up Quick Action Buttons */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* WhatsApp Contact */}
                              <a
                                href={`https://wa.me/${waPhone}?text=${waMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                                title="Fanya ufuatiliaji kupitia WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Phone Call */}
                              <a
                                href={`tel:${u.phone_number}`}
                                className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition cursor-pointer"
                                title="Piga simu moja kwa moja"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* Copy Info */}
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `${u.full_name} | Simu: ${u.phone_number} | Email: ${u.email} | Salio: ${u.balance} TZS`,
                                    'Taarifa za mteja'
                                  )
                                }
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                                title="Nakili taarifa za mteja huyu"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleActivation(u.id, u.is_activated)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                u.is_activated
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              }`}
                            >
                              {u.is_activated ? 'Zima Waleti' : 'Washa Waleti'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: MORNITOR WALIOTEMBELEA WEBSITE / LEADS (TRAFFIC)
            =================================================================== */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Mornitor Waliotembelea Website & Leads ({leadsList.length})
              </h2>
              <p className="text-xs text-slate-400">
                Orodha ya watu waliotembelea au kuweka namba zao za simu kwenye tovuti.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Jina</th>
                    <th className="py-3 px-4">Namba ya Simu</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Muda wa Ziara</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4 text-center">Ufuatiliaji (Follow-up)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leadsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Hakuna rekodi za watembeleaji bado.
                      </td>
                    </tr>
                  ) : (
                    leadsList.map((lead, idx) => {
                      const cleanPhone = (lead.phone_number || '').replace(/[^0-9]/g, '');
                      const waPhone = cleanPhone.startsWith('0') ? '255' + cleanPhone.slice(1) : cleanPhone;
                      const waMsg = encodeURIComponent(
                        `Habari ${lead.full_name || ''}, karibu SWAHILI EARN! Je unahitaji msaada wowote kuanza kuchati na wazungu na kulipwa kwenye waleti yako?`
                      );
                      return (
                        <tr key={lead.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-white">
                            {lead.full_name || 'Mtembeleaji'}
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-400 font-semibold">
                            {lead.phone_number}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {lead.ip_address || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleString()
                              : 'Hivi punde'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {lead.status || 'Active Lead'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* WhatsApp Contact */}
                              <a
                                href={`https://wa.me/${waPhone}?text=${waMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                                title="Fanya ufuatiliaji kupitia WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Phone Call */}
                              <a
                                href={`tel:${lead.phone_number}`}
                                className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition cursor-pointer"
                                title="Piga simu moja kwa moja"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* Copy Info */}
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `${lead.full_name} | Simu: ${lead.phone_number}`,
                                    'Taarifa za lead'
                                  )
                                }
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                                title="Nakili taarifa"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: MIAMALA ILIYOTHIBITISHWA (VERIFIED PAYMENTS LIVE SCROLL)
            =================================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Hariri Miamala Iliyothibitishwa ({verifiedPayments.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Miamala hii inashuka na kupanda (live infinite scroll) kwenye dirisha la ukurasa wa mwanzo (Homepage) kwa ajili ya kuonyesha uthibitisho wa malipo.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Inaonekana Moja kwa Moja kwenye Tovuti</span>
              </span>
            </div>

            {/* Add New Payment Form */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0066FF]" />
                <span>Ongeza Muamala Mpya Kwenye Live Scroll</span>
              </h3>

              <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Jina la Mlipwaji:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Asha M."
                    value={newPayment.name}
                    onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Kiasi Alicholipwa:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: 180,000 Tsh au 2,500 Ksh"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Mahali & Nchi:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Dar es Salaam, Tanzania"
                    value={newPayment.location}
                    onChange={(e) => setNewPayment({ ...newPayment, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Njia ya Malipo:
                  </label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="Vodacom M-Pesa">Vodacom M-Pesa</option>
                    <option value="Tigo Pesa">Tigo Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Halopesa">Halopesa</option>
                    <option value="Safaricom M-Pesa">Safaricom M-Pesa</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Lumicash">Lumicash</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Weka Kwenye Scroll</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Verified Payments */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Jina</th>
                    <th className="py-3 px-4">Kiasi</th>
                    <th className="py-3 px-4">Mahali & Nchi</th>
                    <th className="py-3 px-4">Njia ya Malipo</th>
                    <th className="py-3 px-4">Muda</th>
                    <th className="py-3 px-4 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {verifiedPayments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{p.amount}</td>
                      <td className="py-3 px-4 text-slate-300">{p.location}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">{p.time}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePayment(idx)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Futa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: VIUNGO VYA MITANDAO (SOCIAL LINKS) & MAWASILIANO
            =================================================================== */}
        {activeTab === 'social' && (
          <div className="max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <span>Hariri Viungo vya Mitandao ya Kijamii & Mawasiliano ya Tovuti</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Viungo hivi vinaonekana chini ya tovuti (Footer) na kwenye kadi za huduma kwa wateja (Customer Care).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* 1. Instagram */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Instagram Link:
                </label>
                <input
                  type="url"
                  required
                  value={settings.instagram_url || ''}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/odp_tanzania?stkn=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* 2. TikTok */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  TikTok Link:
                </label>
                <input
                  type="url"
                  required
                  value={settings.tiktok_url || ''}
                  onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                  placeholder="https://www.tiktok.com/@swahiliearn.site?..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* 3. Facebook */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Facebook Link:
                </label>
                <input
                  type="url"
                  required
                  value={settings.facebook_url || ''}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://www.facebook.com/share/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* 4. Sponsor Page */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Sponsor Banner Link (sponsored by ONLINEPAY DIGITAL PLATFORM):
                </label>
                <input
                  type="url"
                  required
                  value={settings.sponsor_url || ''}
                  onChange={(e) => setSettings({ ...settings, sponsor_url: e.target.value })}
                  placeholder="https://onlinepay-d7wjpyve.manus.space/"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* 5. WhatsApp Customer Care Direct Chat */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  WhatsApp Customer Care Link (Inatumika pia kwenye Homepage Pop-up):
                </label>
                <input
                  type="url"
                  required
                  value={settings.whatsapp_support_url || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_support_url: e.target.value })}
                  placeholder="https://wa.me/message/EP72QM4VJRTIA1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 6. WhatsApp Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  WhatsApp Channel Link (FOLLOW CHANNEL YETU):
                </label>
                <input
                  type="url"
                  required
                  value={settings.whatsapp_channel_url || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_channel_url: e.target.value })}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* 7. Support SMS Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Namba ya Simu ya Kawaida ya SMS (TUMA NORMAL TEXT / SMS):
                </label>
                <input
                  type="text"
                  required
                  value={settings.support_sms_number || ''}
                  onChange={(e) => setSettings({ ...settings, support_sms_number: e.target.value })}
                  placeholder="0743697677"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Hifadhi Viungo Vyote vya Mitandao & Mawasiliano</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================
            TAB 4: MAOMBI YA KUTOA PESA (WITHDRAWALS MONITOR)
            =================================================================== */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Mornitor Maombi ya Kutoa Pesa ({withdrawalsList.length})
              </h2>
              <p className="text-xs text-slate-400">
                Idhinisha au kataa maombi ya wanachama kutoa pesa kwenda M-Pesa au Tigo Pesa.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Jina la Mtumiaji</th>
                    <th className="py-3 px-4">Kiasi cha Kutoa</th>
                    <th className="py-3 px-4">Njia & Namba</th>
                    <th className="py-3 px-4">Tarehe</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withdrawalsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Hakuna maombi ya kutoa pesa kwa sasa.
                      </td>
                    </tr>
                  ) : (
                    withdrawalsList.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-400">#{w.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{w.user_name || 'Mteja'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {Number(w.amount || 0).toLocaleString()} TZS
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{w.payment_method}</span> ·{' '}
                          <span className="font-mono text-blue-400">{w.phone_number}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              w.status === 'paid' || w.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : w.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {w.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateWithdrawal(w.id, 'paid')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Thibitisha (Paid)
                              </button>
                              <button
                                onClick={() => handleUpdateWithdrawal(w.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold cursor-pointer"
                              >
                                Kataa
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: MIPANGILIO YA MFUMO (SETTINGS)
            =================================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Mipangilio ya Utawala</h2>
              <p className="text-xs text-slate-400">
                Badilisha kiungo cha uwezeshaji na barua pepe ya kupokea taarifa mpya za wanachama.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kiungo cha Malipo ya Uwezeshaji (Activation URL)
                </label>
                <input
                  type="url"
                  required
                  value={settings.activation_url || ''}
                  onChange={(e) => setSettings({ ...settings, activation_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ada ya Uwezeshaji (TZS)
                </label>
                <input
                  type="number"
                  required
                  value={settings.activation_fee || '16000'}
                  onChange={(e) => setSettings({ ...settings, activation_fee: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Barua Pepe ya Taarifa za Usajili (Admin Email)
                </label>
                <input
                  type="email"
                  required
                  value={settings.admin_email || 'getarydickson@gmail.com'}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Hifadhi Mipangilio</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: ONGEZA / SAHIHISHA MZUNGU WA KISWAHILI (BILA URL YEYOTE)
          ===================================================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === 'add'
                      ? 'Ongeza Mzungu / Mwanafunzi Mpya'
                      : `Sahihisha Taarifa za: ${editingProfile.name}`}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Bila URL yeyote · Pakia picha au chagua kwenye maktaba
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {uploadSuccessMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{uploadSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 mt-5">
              {/* 1. SEHEMU YA PICHA YA WASIFU (NO URL: Upload from device OR Tap Gallery) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Picha ya Wasifu ya Mzungu (Bila URL Yeyote)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Pakia kutoka kifaa chako au bofya picha hapa chini
                  </span>
                </div>

                {/* Current Active Photo & Device Upload Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="relative flex-shrink-0">
                    <img
                      src={editingProfile.avatar_url}
                      alt={editingProfile.name || 'Preview'}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs font-bold text-white">
                      Picha Inayotumika Sasa
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Unaweza kupakia picha yoyote mpya kutoka kwenye galari/kamera ya simu au kompyuta yako moja kwa moja:
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-amber-500/20"
                    >
                      <Upload className="w-4 h-4" />
                      <span>📁 PAKIA PICHA KUTOKA KWENYE KIFAA CHAKO</span>
                    </button>
                  </div>
                </div>

                {/* Maktaba ya Picha za Wazungu (One-Tap Presets) */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    Au Chagua Kwenye Maktaba ya Picha za Wazungu (Gusa Kuchagua):
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditingProfile((prev: any) => ({
                            ...prev,
                            avatar_url: preset.url,
                            country: prev.country || preset.country,
                          }));
                          setUploadSuccessMessage(`✓ Umechagua picha ya ${preset.label}!`);
                          setTimeout(() => setUploadSuccessMessage(null), 3000);
                        }}
                        className={`p-1 rounded-xl border transition flex flex-col items-center gap-1 cursor-pointer ${
                          editingProfile.avatar_url === preset.url
                            ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/40'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="text-[9px] text-slate-300 truncate w-full text-center">
                          {preset.label.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. JINA KAMILI LA MZUNGU */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jina Kamili la Mzungu / Mwanafunzi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  placeholder="mfano: Sarah Jenkins, Mark Miller, Eliza..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />

                {/* Quick Name Suggestions Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-400">Mapendekezo ya Haraka:</span>
                  {NAME_SUGGESTIONS.slice(0, 5).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setEditingProfile({ ...editingProfile, name: sug })}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. HALI YA MZUNGU (STATUS) NA KAZI (OCCUPATION) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Hali ya Mzungu (Status) <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      mfano: tourist / college student / doctor
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProfile.status || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, status: e.target.value })}
                    placeholder="mfano: tourist, college student, doctor..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                  {/* Quick Status Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {['tourist', 'college student', 'doctor', 'researcher'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditingProfile({ ...editingProfile, status: st })}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-blue-300 border border-slate-700 cursor-pointer"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Sehemu ya Kazi (Occupation)</span>
                    <span className="text-[10px] text-slate-400">
                      mfano: Medical Doctor, Student...
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingProfile.occupation || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, occupation: e.target.value })}
                    placeholder="mfano: Doctor / Medical Specialist, College Student..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                  {/* Quick Occupation Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {['Tourist / Safari Explorer', 'College Student (Biology)', 'Medical Doctor / Physician', 'Software Engineer'].map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setEditingProfile({ ...editingProfile, occupation: occ })}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 border border-slate-700 cursor-pointer truncate max-w-[140px]"
                        title={occ}
                      >
                        {occ.split('/')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. NCHI NA LUGHA YA ASILI */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nchi ya Asili
                  </label>
                  <select
                    value={editingProfile.country}
                    onChange={(e) => setEditingProfile({ ...editingProfile, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Sweden">🇸🇪 Sweden</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="Poland">🇵🇱 Poland</option>
                    <option value="Netherlands">🇳🇱 Netherlands</option>
                    <option value="Norway">🇳🇴 Norway</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lugha ya Asili
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProfile.language}
                    onChange={(e) => setEditingProfile({ ...editingProfile, language: e.target.value })}
                    placeholder="English, German, French..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              {/* 5. MALIPO NA DAKIKA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Malipo kwa Kikao (TZS)
                  </label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={editingProfile.chat_rate_tzs}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, chat_rate_tzs: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Muda wa Kikao (Dakika)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProfile.session_duration_minutes}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        session_duration_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              {/* 6. LENGO LA MWANAFUNZI (BIO) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lengo la Mwanafunzi (Bio / Learning Goal)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProfile.bio}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                  placeholder="Lengo lake la kujifunza Kiswahili..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* 7. LIVE OUTSIDE UI PREVIEW CARD */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  👁️ Muonekano Halisi wa Nje (Live Outside UI Preview):
                </span>
                <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={editingProfile.avatar_url}
                      alt={editingProfile.name || 'Preview'}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {editingProfile.name || 'Jina la Mzungu'}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">
                          [ online ]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {editingProfile.country} · Native: {editingProfile.language}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#0066FF] font-mono block">
                      +{editingProfile.chat_rate_tzs?.toLocaleString()} TZS
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {editingProfile.session_duration_minutes} min session
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {modalMode === 'add' ? 'HIFADHI & SASISHA UI YA NJE' : 'SAHIHISHA & SASISHA UI YA NJE'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
