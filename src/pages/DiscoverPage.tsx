import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, ChatProfile } from '../lib/api';
import { DEFAULT_PROFILES } from '../lib/defaultProfiles';
import {
  MessageSquare,
  Search,
  Globe2,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface DiscoverPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [profiles, setProfiles] = useState<ChatProfile[]>(DEFAULT_PROFILES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('All');

  const isSw = language === 'sw';

  // Live online chatting counter ranging between 9,850 and 15,000
  const [onlineChatters, setOnlineChatters] = useState(12430);

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

  useEffect(() => {
    api.getProfiles()
      .then((res) => setProfiles(res.profiles))
      .catch((err) => console.error('Failed to load profiles:', err))
      .finally(() => setLoading(false));
  }, []);

  const countries = ['All', ...Array.from(new Set(profiles.map((p) => p.country)))];

  const filtered = profiles.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCountry = filterCountry === 'All' || p.country === filterCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A00] uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isSw ? 'Wanafunzi Waliopo Mtandaoni Sasa' : 'Real-Time Swahili Conversational Partners'}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {t('disc_title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {t('disc_subtitle')}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="liquid-glass rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isSw ? 'Tafuta kwa jina, nchi au lugha...' : 'Search by name, country or language...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>

          {/* Country segmented filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCountry(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterCountry === c
                    ? 'bg-[#0066FF] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Live Online Chatting Triangular Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FF7A00] text-black font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 tracking-wide">
            <span className="inline-block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black -rotate-90" />
            <span>▲ {onlineChatters.toLocaleString()} Watu wapo mtandaoni wakichati sasa hivi</span>
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((profile) => (
              <div
                key={profile.id}
                className="liquid-glass rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Avatar + ONLY ONE TIME SOLID GREEN GLOWING ONLINE BADGE */}
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
                      {/* SOLID GREEN GLOWING ONLINE BADGE */}
                      <span className="inline-flex items-center gap-1.5 font-black text-white bg-emerald-500 px-3 py-1 rounded-full text-[10px] sm:text-[11px] shadow-[0_0_12px_rgba(16,185,129,0.7)] tracking-wide mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>online</span>
                      </span>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Session Reward
                      </span>
                      <p className="text-xl font-black text-[#0066FF] font-mono">
                        {profile.chat_rate_tzs.toLocaleString()} <span className="text-xs">TZS</span>
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {profile.session_duration_minutes} min session
                      </span>
                    </div>
                  </div>

                  {/* Name and Origin - NO DUPLICATE ONLINE HERE */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">
                        {profile.name}
                      </h3>
                      {profile.status && profile.status !== 'online' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 capitalize">
                          {profile.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-semibold text-slate-700">{profile.country}</span>
                      <span>·</span>
                      <span>Native: {profile.language}</span>
                      {profile.occupation && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {profile.occupation}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {profile.bio}
                  </p>

                  {/* Personality Highlights */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-5">
                    <p>
                      <strong className="text-slate-800">Learner Goal:</strong> Practice greetings, polite vocabulary & daily conversational Swahili.
                    </p>
                  </div>
                </div>

                {/* Chat Action: Only start chatting / Anza Mazungumzo without time and amount */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (user) {
                        onNavigate('chat', { profileId: profile.id });
                      } else {
                        onNavigate('register');
                      }
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {isSw ? 'Anza Mazungumzo' : 'start chatting'}
                    </span>
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    {isSw
                      ? 'Mita ya muda inaanza unapoingia kwenye chumba cha mazungumzo'
                      : 'Timer starts when you enter the chat room'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center liquid-glass rounded-3xl border border-slate-200">
            <Globe2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No learners match your filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting your country filter or search keyword.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCountry('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
