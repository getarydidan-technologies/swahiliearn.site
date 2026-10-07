import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  User,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface ChatHistoryPageProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const ChatHistoryPage: React.FC<ChatHistoryPageProps> = ({ onNavigate }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChatHistory()
      .then((res) => setSessions(res.sessions))
      .catch((err) => console.error('Failed to load chat history:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
            Tutoring Logbook
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Chat Session History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archived logs of your Swahili conversations, session timings, and associated reward transactions.
          </p>
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="liquid-glass rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={s.avatar_url}
                    alt={s.partner_name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-white shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {s.partner_name}
                      </h3>
                      <span className="text-xs text-slate-400">({s.country})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(s.start_time).toLocaleDateString([], {
                          dateStyle: 'medium',
                        })}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {Math.round(s.duration_seconds / 60)} mins
                      </span>
                      {s.transaction_id && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            Ref: {s.transaction_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Reward Credited
                    </span>
                    <span className="font-mono text-base font-black text-emerald-600">
                      +{Number(s.reward_tzs).toLocaleString()} TZS
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('chat', { profileId: s.profile_id })}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-[#0066FF] hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
                  >
                    Chat Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="liquid-glass rounded-3xl p-12 text-center border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Chat Sessions Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start your first conversation with an international learner to practice Swahili and log session records.
            </p>
            <button
              onClick={() => onNavigate('discover')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#0066FF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Discover Available Learners
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
