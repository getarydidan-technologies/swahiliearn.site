import React, { useState, useEffect } from 'react';
import { api, AppNotification } from '../lib/api';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (tab: string) => void;
  onRefreshUnread?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate, onRefreshUnread }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onRefreshUnread?.();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reward_credited':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'chat_completed':
      case 'chat_started':
        return <MessageSquare className="w-5 h-5 text-[#0066FF]" />;
      case 'activation':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      case 'withdrawal_submitted':
      case 'withdrawal_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'withdrawal_rejected':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#FF7A00]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time alerts for sessions, reward disbursements, and compliance updates.
            </p>
          </div>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  n.is_read
                    ? 'liquid-glass border-slate-200/70 text-slate-700'
                    : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-2xs flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="liquid-glass rounded-3xl p-12 text-center border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Notifications</h4>
            <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};
