import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wallet,
  MessageSquare,
  Sparkles,
  Globe2,
  ChevronDown,
  MessageCircle,
  Phone,
  Radio,
  ExternalLink,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, ChatProfile } from '../lib/api';
import { DEFAULT_PROFILES } from '../lib/defaultProfiles';
import heroImage from '../assets/images/hero_swahili_earn_1790978664336.jpg';

interface HomePageProps {
  onNavigate: (tab: string, params?: any) => void;
}

// Verified live payments dataset across Swahili-speaking Africa
const VERIFIED_PAYMENTS = [
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
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [profiles, setProfiles] = useState<ChatProfile[]>(DEFAULT_PROFILES.slice(0, 3));
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Dynamic verified payments dataset
  const [paymentsList, setPaymentsList] = useState(VERIFIED_PAYMENTS);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    whatsapp_support_url: 'https://wa.me/message/EP72QM4VJRTIA1',
    whatsapp_channel_url: 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q',
    support_sms_number: '0743697677',
  });

  // Live online chatting counter ranging between 9,850 and 15,000
  const [onlineChatters, setOnlineChatters] = useState(12430);

  // Customer care pop-up state: visible for 15s, then hidden for 45s, then cycles
  const [showCarePopup, setShowCarePopup] = useState(true);
  const [popupDismissed, setPopupDismissed] = useState(false);

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    if (popupDismissed) return;

    let hideTimer: any;
    let showTimer: any;

    // Initially show for 15s, then hide for 45s, then loop
    const scheduleCycle = () => {
      setShowCarePopup(true);
      hideTimer = setTimeout(() => {
        setShowCarePopup(false);
        showTimer = setTimeout(() => {
          scheduleCycle();
        }, 45000); // 45 seconds hidden
      }, 15000); // 15 seconds visible
    };

    scheduleCycle();

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [popupDismissed]);

  useEffect(() => {
    api.getProfiles()
      .then((res) => setProfiles(res.profiles.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingProfiles(false));

    api.getPublicSettings()
      .then((res) => {
        if (res.settings) {
          setSiteSettings((prev) => ({ ...prev, ...res.settings }));
          if (res.settings.verified_payments) {
            try {
              const parsed = JSON.parse(res.settings.verified_payments);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPaymentsList(parsed);
              }
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fluctuating chatters counter (9,850 - 15,000)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineChatters((prev) => {
        const delta = Math.floor(Math.random() * 51) - 25;
        const next = prev + delta;
        if (next < 9850) return 9850 + Math.floor(Math.random() * 60);
        if (next > 15000) return 15000 - Math.floor(Math.random() * 60);
        return next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const isSw = language === 'sw';

  const faqs = [
    {
      q: 'JE HII FURSA NI UTAPELI ?',
      a: 'swahili earn ni fursa hali ambayo ipo chini ya kampuni halali ya onlinepay platform iliosajiliwa na BRELA , kwa usajili wa namba 712919 . lakini pia platform yetu inalipia ushuru wa akaunti active za wateja wake kwenye shirika la kodi TRA',
    },
    {
      q: 'KWANINI NALIPA MTAJI WA 16,000/= NDO NITOE PESA ZANGU',
      a: 'Unalipia mtaji au activation fee ya 16,000/= ili kuwezesha mifumo ya miamala na kibenki ya kampuni ili iweze kufanya kazi kwa uhalali na ufanisi mkubwa wakati wa kufanya miamala yako kutoka kwenye waleti yako . lakini pia ni pamoja na kulipia kodi / ushuru wa TRA kwa ajili ya akaunt yako kuweza kufanya kazi kwa muda mrefu na kihalali na kupata pesa nyingi',
    },
    {
      q: 'MFUMO WENU UNAFANYAJE KAZI',
      a: 'Platform ya Onlinepay digital imetengeza fursa hii kwa vijana . kwa kuunganisha wazungu / watalii / pamoja na raia wa kigeni wanaotaka kujifunza kiswahili kwenye site hii ya SWAHILI EARN . wazungu hao wanalipia pesa ya kujifunza kiswahili kupitia watu wanaojua vizuri lugha ya kiswahili ambao ni vijana wa kiafrica ambao hawana fursa za kipato au ajira na kulipwa pesa nyingi kupitia smartphone zao na mtandao pekee',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      {/* FLOATING CUSTOMER CARE POP-UP (ONLY ON HOMEPAGE) */}
      <div
        className={`fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm w-[92%] sm:w-auto transition-all duration-700 ease-in-out ${
          showCarePopup && !popupDismissed
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="relative bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-[0_12px_40px_rgba(16,185,129,0.45)] transition-all">
          {/* Close button */}
          <button
            onClick={() => {
              setShowCarePopup(false);
              setPopupDismissed(true);
            }}
            className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
            title="Funga taarifa hii"
          >
            <X className="w-3.5 h-3.5" />
          </button>

            {/* Clickable redirection */}
            <a
              href="https://wa.me/message/EP72QM4VJRTIA1"
              target="_blank"
              rel="noopener noreferrer"
              className="block group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-emerald-800">
                  [ SWAHILI EARN HUDUMA KWA WATEJA ]
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-900 leading-snug">
                Habari Karibu Swahili Earn site . Bonyeza hapa kuwasiliana na huduma kwa wateja kwa ajili ya taarifa zaidi .
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 group-hover:text-emerald-800 underline decoration-emerald-500 underline-offset-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                <span>Bofya kuanza chati ya WhatsApp (Customer Care) →</span>
              </div>
            </a>
          </div>
        </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft Ambient Gradients */}
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -z-10 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-4 py-1.5 text-xs font-bold text-[#0066FF] shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#0066FF] animate-pulse" />
                <span>SWAHILI EARN 2026</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-medium">
                  {isSw ? 'Malipo ya Uhakika kwa Wageni' : 'Verified Learner Payouts'}
                </span>
              </div>

              {/* Hero Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                {t('hero_title_1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#0047BA]">
                  {t('hero_title_2')}
                </span>
              </h1>

              {/* REQUIRED PLAIN WEBTOP INFO PARAGRAPH (NOT IN BADGE FORM) */}
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 pt-1">
                SWAHILI EARN SITE ni fursa ya kipekee kwa vijana kwa sababu inatoa nafasi za kutengeneza kipato cha ziada au hata kujiajiri kupitia simu yako kwa kufundisha wazungu kama watalii au wanachuo lugha ya kiswahili na kulipwa / kutengeneza hadi Tsh 160,000/= kwa siku ,fursa hii ipo Chini ya ONLINEPAY DIGITAL PLATFORM ilioingia ushirika na wazungu wanaotaka kujifunza kiswahili kutoka mataifa mbali mbali
              </p>

              {/* Payout note */}
              <p className="text-xs sm:text-sm font-bold text-[#FF7A00] max-w-xl mx-auto lg:mx-0">
                {isSw
                  ? '⚡ Pokea malipo ya 60,000 - 80,000 TZS moja kwa moja kupitia M-Pesa, Airtel Money au Tigo Pesa.'
                  : '⚡ Earn 60,000 - 80,000 TZS per completed 10-minute session directly to M-Pesa or Bank.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                {user ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t('nav_dashboard')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('register')}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>{t('cta_start_now')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onNavigate('login')}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-base font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>{t('nav_signin')}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => onNavigate('discover')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-slate-600 hover:text-slate-900 text-sm font-semibold transition cursor-pointer"
                >
                  <Globe2 className="w-4 h-4 text-[#0066FF]" />
                  <span>{t('cta_browse_learners')}</span>
                </button>
              </div>

              {/* Trust Checkmarks */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Waleti Salama ya M-Pesa & Tigo</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Muda Halisi Unaothibitishwa</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Uhakiki wa Malipo ya Papo Hapo</span>
                </span>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white group">
                  <img
                    src={heroImage}
                    alt="Digital professional conversing and teaching Swahili on smartphone"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 sm:h-96 object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Jukwaa la Kufundisha Kiswahili</span>
                    </span>
                    <p className="text-lg font-bold text-white mt-1">
                      Fundisha watalii na wanafunzi wa kimataifa Kiswahili
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Pata TZS 60,000 - 80,000 kwa kila kikao cha dakika 10.
                    </p>
                  </div>
                </div>

                {/* Floating Preview Card */}
                <div className="absolute -top-4 -right-2 sm:-right-6 liquid-glass-blue p-3.5 rounded-2xl shadow-xl border border-blue-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0066FF] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    <Clock className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0066FF]">
                      Kikao cha Moja kwa Moja
                    </div>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      10:00 · 80,000 TZS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PEOPLE AVAILABLE NOW PREVIEW SECTION */}
      <section className="py-14 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A00] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                {isSw ? 'Wanafunzi wa Kimataifa Waliopo' : 'Live Conversational Partners'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {t('disc_title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0066FF] hover:bg-blue-50 transition shadow-xs cursor-pointer"
            >
              <span>{isSw ? 'Tazama Wote Waliopo' : 'View All Available'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* REQUIRED TRIANGULAR BADGE ON TOP OF WAZUNGU LIST (9,850 - 15K RANGE) */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FF7A00] text-black font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 tracking-wide">
              {/* Small triangular badge symbol */}
              <span className="inline-block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black -rotate-90" />
              <span>▲ {onlineChatters.toLocaleString()} Watu wapo mtandaoni wakichati sasa hivi</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="liquid-glass rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top: Avatar & ONLY ONE TIME SOLID GREEN GLOWING ONLINE BADGE */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    <div className="text-right">
                      {/* REQUIRED LITTLE BADGE WRITTEN ONLINE WITH SOLID GREEN GLOWING BACKGROUND (1 TIME ONLY) */}
                      <span className="inline-flex items-center gap-1.5 font-black text-white bg-emerald-500 px-3 py-1 rounded-full text-[10px] sm:text-[11px] shadow-[0_0_12px_rgba(16,185,129,0.7)] tracking-wide mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>online</span>
                      </span>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {isSw ? 'Malipo ya Kikao' : 'Session Reward'}
                      </span>
                      <p className="text-lg font-black text-[#0066FF] font-mono">
                        {profile.chat_rate_tzs.toLocaleString()} <span className="text-xs">TZS</span>
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {profile.session_duration_minutes} {isSw ? 'dakika za kikao' : 'minutes session'}
                      </span>
                    </div>
                  </div>

                  {/* Profile info - NO DUPLICATE ONLINE PHRASE HERE */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">
                      {profile.name}
                    </h3>
                    {profile.status && profile.status !== 'online' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 capitalize">
                        {profile.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                    <span className="font-semibold text-slate-700">{profile.country}</span>
                    <span>·</span>
                    <span>{isSw ? 'Lugha' : 'Language'}: {profile.language}</span>
                    {profile.occupation && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {profile.occupation}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-6">
                    {profile.bio}
                  </p>
                </div>

                {/* Chat CTA: Only 'start chatting' (en) and 'Anza Mazungumzo' (sw) without time and amount */}
                <button
                  onClick={() => {
                    if (user) {
                      onNavigate('chat', { profileId: profile.id });
                    } else {
                      onNavigate('register');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isSw ? 'Anza Mazungumzo' : 'start chatting'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
              {isSw ? 'Mwongozo wa Hatua kwa Hatua' : 'Step-by-Step Guide'}
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {t('hiw_title')}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {t('hiw_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative">
              <span className="w-10 h-10 rounded-2xl bg-[#0066FF] text-white font-black text-sm flex items-center justify-center shadow-md mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">{t('hiw_step_1_title')}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('hiw_step_1_desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative">
              <span className="w-10 h-10 rounded-2xl bg-[#FF7A00] text-white font-black text-sm flex items-center justify-center shadow-md mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">{t('hiw_step_2_title')}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('hiw_step_2_desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900">{t('hiw_step_3_title')}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('hiw_step_3_desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative">
              <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md mb-4">
                4
              </span>
              <h3 className="text-base font-bold text-slate-900">{t('hiw_step_4_title')}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('hiw_step_4_desc')}
              </p>
            </div>
          </div>

          {/* BOUNCING ANIMATION BADGE WITH GLOWING AND SHADOW EDGES */}
          <div className="mt-14 max-w-4xl mx-auto px-2">
            <div className="animate-bounce-glow relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-orange-500/15 border-2 border-amber-400 p-6 sm:p-8 backdrop-blur-md transition-all">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/35 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-400/35 rounded-full blur-2xl pointer-events-none" />

              <p className="relative z-10 text-xs sm:text-sm md:text-base font-black text-slate-900 leading-relaxed text-center tracking-wide uppercase drop-shadow-xs">
                {t('hiw_activation_notice')}
              </p>
            </div>
          </div>

          {/* REQUIRED WINDOW-LIKE BADGE SHOWING VERIFIED PAYOUTS IN INFINITE LIVE UP SCROLLING MOTION */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden">
              {/* Window Title Bar */}
              <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    MIAMALA YA PAPO HAPO ILIYOTHIBITISHWA (LIVE VERIFIED PAYOUTS)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Mtandao Uko Hewani</span>
                </div>
              </div>

              {/* Infinite live up-scrolling viewport */}
              <div className="h-64 overflow-hidden relative p-4 bg-slate-950/90">
                <div className="animate-scroll-up space-y-3">
                  {/* First set of payouts */}
                  {paymentsList.map((payment, idx) => (
                    <div
                      key={`p1-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            <span className="text-emerald-400">{payment.name}</span> amelipwa{' '}
                            <span className="text-amber-300 font-mono font-black">{payment.amount}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Kutokea {payment.location} via <span className="text-blue-400 font-semibold">{payment.method}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {payment.time}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                          Imelipwa
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate set for seamless continuous scrolling */}
                  {paymentsList.map((payment, idx) => (
                    <div
                      key={`p2-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            <span className="text-emerald-400">{payment.name}</span> amelipwa{' '}
                            <span className="text-amber-300 font-mono font-black">{payment.amount}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Kutokea {payment.location} via <span className="text-blue-400 font-semibold">{payment.method}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {payment.time}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                          Imelipwa
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REQUIRED CLEAN BADGE WITH WHITE BACKGROUND & ELECTRONIC BLUE GLOWING EDGES */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border-2 border-[#0066FF] shadow-[0_0_35px_rgba(0,102,255,0.45)] space-y-6">
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-black tracking-wider uppercase">
                  Mawasiliano Rasmi
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  [ HUDUMA KWA WATEJA / CUSTOMER CARE ]
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tupo hapa kukuhudumia masaa 24/7 kupitia njia zifuatazo za mawasiliano:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* 1. WHATSAPP CHANNEL */}
                <a
                  href={siteSettings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-[#0066FF] transition flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
                    <Radio className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    FOLLOW CHANNEL YETU
                  </span>
                  <span className="text-xs font-bold text-[#0066FF] flex items-center gap-1">
                    <span>Jiunge Hapa</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pata taarifa na miongozo yote
                  </span>
                </a>

                {/* 2. TUMA NORMAL TEXT / SMS */}
                <a
                  href={`sms:${siteSettings.support_sms_number || '0743697677'}`}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-[#0066FF] transition flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    TUMA NORMAL TEXT / SMS
                  </span>
                  <span className="text-xs font-bold text-[#0066FF] font-mono">
                    {siteSettings.support_sms_number || '0743 697 677'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tuma ujumbe mfupi wa simu
                  </span>
                </a>

                {/* 3. WHATSAPP */}
                <a
                  href={siteSettings.whatsapp_support_url || 'https://wa.me/message/EP72QM4VJRTIA1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-500 transition flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    WHATSAPP
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Msaada wa WhatsApp
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chata moja kwa moja na admin
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REQUIRED FAQ SECTION (JE HII FURSA NI UTAPELI ? n.k.) */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Maswali Yanayoulizwa Mara kwa Mara (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Majibu ya kina kuhusu usajili wa kisheria wa BRELA, TRA, mtaji wa akaunti na uendeshaji wa mfumo.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="liquid-glass rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#0066FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3.5 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
