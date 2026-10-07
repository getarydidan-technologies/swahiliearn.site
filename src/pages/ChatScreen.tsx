import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api, ChatMessage } from '../lib/api';
import {
  Send,
  Languages,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
  PartyPopper,
  DollarSign,
  Globe2,
} from 'lucide-react';

interface ChatScreenProps {
  profileId: string;
  onNavigate: (tab: string, params?: any) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ profileId, onNavigate }) => {
  const { user, refreshUser } = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partner, setPartner] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // Synchronized countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [durationSeconds, setDurationSeconds] = useState<number>(600);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [claimingReward, setClaimingReward] = useState<boolean>(false);

  // Translation cache for messages: messageId -> translatedText
  const [translatedMap, setTranslatedMap] = useState<Record<number, string>>({});
  const [translatingId, setTranslatingId] = useState<number | null>(null);

  // Auto-scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize or Start Chat Session
  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      try {
        const startRes = await api.startChat(profileId);
        if (!isMounted) return;

        setSessionId(startRes.session_id);
        setPartner(startRes.partner);
        setDurationSeconds(startRes.duration_seconds);
        setRemainingSeconds(startRes.duration_seconds);

        // Load messages
        const msgs = await api.getMessages(startRes.session_id);
        if (isMounted) {
          setMessages(msgs.messages);
        }
      } catch (err: any) {
        console.error('Failed to initiate chat session:', err);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  // 2. Synchronize Timer with Backend Every 3 seconds to prevent client-side manipulation
  useEffect(() => {
    if (!sessionId || isCompleted) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.getSession(sessionId);
        setRemainingSeconds(status.remaining_seconds);
        if (status.remaining_seconds <= 0 && !isCompleted) {
          setIsCompleted(true);
        }
      } catch (e) {
        // Fallback local tick
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, isCompleted]);

  // 3. When Timer Completes: Automatically trigger backend-verified reward crediting
  useEffect(() => {
    if (isCompleted && !rewardClaimed && !claimingReward && sessionId) {
      handleCompleteSession();
    }
  }, [isCompleted, rewardClaimed, sessionId]);

  const handleCompleteSession = async () => {
    if (!sessionId || rewardClaimed || claimingReward) return;
    setClaimingReward(true);
    try {
      const result = await api.completeSession(sessionId);
      setRewardClaimed(true);
      setCompletionData(result);
      await refreshUser();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0066FF', '#FF7A00', '#10B981', '#F59E0B'],
        });
      } catch (e) {
        // Confetti optional
      }
    } catch (err: any) {
      console.error('Error claiming reward:', err);
    } finally {
      setClaimingReward(false);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !sessionId) return;

    setInputText('');
    setSending(true);

    // Optimistically append user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setPartnerTyping(true);

    try {
      const res = await api.sendMessage(sessionId, text);
      setMessages((prev) => {
        // Replace temp and add partner response
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, res.user_message, res.partner_message];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      setPartnerTyping(false);
    }
  };

  const handleTranslateMessage = async (msgId: number, content: string) => {
    if (translatedMap[msgId]) {
      // Toggle off
      const next = { ...translatedMap };
      delete next[msgId];
      setTranslatedMap(next);
      return;
    }

    setTranslatingId(msgId);
    try {
      // If content appears mostly Swahili, translate to English, else to Swahili
      const lower = content.toLowerCase();
      const isLikelySwahili =
        lower.includes('habari') ||
        lower.includes('mambo') ||
        lower.includes('asante') ||
        lower.includes('karibu') ||
        lower.includes('jambo') ||
        lower.includes('nzuri') ||
        lower.includes('poa');

      const target = isLikelySwahili ? 'en' : 'sw';
      const res = await api.translate(content, target);
      setTranslatedMap((prev) => ({ ...prev, [msgId]: res.translated }));
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingId(null);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const quickSwahiliChips = [
    'Habari yako?',
    'Mambo vipi!',
    'Asante sana!',
    'Karibu Tanzania!',
    'Naitwa ' + (user?.full_name?.split(' ')[0] || 'rafiki'),
    'Jambo rafiki!',
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between">
      {/* 1. TOP CHAT NAVIGATION & SYNCHRONIZED TIMER */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-3">
          {/* Left: Back & Partner Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {partner && (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={partner.avatar_url}
                    alt={partner.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-slate-900">{partner.name}</h2>
                    <span className="text-[10px] font-semibold text-slate-400">({partner.country})</span>
                    <span className="font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.7)] tracking-wide">
                      online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="text-[#0066FF] font-semibold">
                      +{partner.chat_rate_tzs?.toLocaleString()} TZS Reward
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Backend Synchronized Countdown Timer */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 animate-pulse'
                  : remainingSeconds <= 60
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-[#0066FF]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider block leading-none">
                  {isCompleted ? 'Completed' : 'Session Timer'}
                </span>
                <span className="font-mono text-sm sm:text-base font-black tabular-nums">
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to end this chat session early? Unfinished sessions do not qualify for the full reward.')) {
                  onNavigate('dashboard');
                }
              }}
              className="hidden sm:block px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              End Chat
            </button>
          </div>
        </div>
      </header>

      {/* 2. COMPLETION REWARD BANNER (SHOWN WHEN TIMER REACHES 0) */}
      {isCompleted && (
        <div className="sticky top-16 z-20 mx-auto max-w-4xl w-full px-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">
                  🎉 Chat Completed Successfully!
                </h3>
                <p className="text-xs text-emerald-100">
                  {partner?.name}'s 10-minute session is complete. The backend has verified the duration.
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-black bg-white/20 px-2.5 py-0.5 rounded-lg text-emerald-50">
                  +{partner?.chat_rate_tzs?.toLocaleString()} TZS Added to Balance
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('earnings')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                View Earnings
              </button>
              <button
                onClick={() => onNavigate('discover')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                Chat Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MESSAGE HISTORY VIEWPORT */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-6 overflow-y-auto space-y-4">
        {/* Info header notice */}
        <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/80 text-center max-w-lg mx-auto shadow-2xs">
          <p className="text-[11px] text-slate-500">
            <strong>Tutoring Session with {partner?.name}</strong>. Speak in Swahili, provide everyday greetings and correct their pronunciation. Tap <strong>Translate</strong> beside any message for English & Swahili assistance.
          </p>
        </div>

        {/* Messages */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isTranslated = Boolean(translatedMap[msg.id]);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                {!isUser && partner && (
                  <img
                    src={partner.avatar_url}
                    alt={partner.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mb-1 border border-slate-200"
                  />
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0066FF] text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Translated Content if active */}
                  {isTranslated && (
                    <div
                      className={`mt-2 pt-2 border-t text-xs font-medium ${
                        isUser
                          ? 'border-blue-400 text-blue-100'
                          : 'border-slate-100 text-[#0066FF]'
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">
                        Translation:
                      </span>
                      {translatedMap[msg.id]}
                    </div>
                  )}
                </div>
              </div>

              {/* Message metadata & Translate button */}
              <div className="flex items-center gap-2 px-2 text-[10px] text-slate-400">
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>·</span>
                <button
                  onClick={() => handleTranslateMessage(msg.id, msg.content)}
                  disabled={translatingId === msg.id}
                  className="font-bold text-slate-500 hover:text-[#0066FF] transition flex items-center gap-1 cursor-pointer"
                >
                  <Languages className="w-3 h-3 text-[#0066FF]" />
                  <span>
                    {translatingId === msg.id
                      ? 'Translating...'
                      : isTranslated
                      ? 'Original'
                      : 'Translate'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Partner Typing Indicator */}
        {partnerTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <img
              src={partner?.avatar_url}
              alt=""
              className="w-6 h-6 rounded-lg object-cover"
            />
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {partner?.name} is typing
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0066FF] animate-bounce" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#0066FF] animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#0066FF] animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 4. CHAT INPUT TOOLBAR & QUICK CHIPS */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="mx-auto max-w-4xl space-y-2">
          {/* Quick Swahili Phrase Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
              Quick phrases:
            </span>
            {quickSwahiliChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputText((prev) => (prev ? prev + ' ' + chip : chip))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#0066FF] text-slate-700 text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Write in Swahili or English to ${partner?.name || 'learner'}...`}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-3 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] text-white disabled:opacity-40 transition shadow-md shadow-blue-500/20 cursor-pointer flex-shrink-0"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
