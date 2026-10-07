/**
 * SWAHILI EARN - Typed API Client
 */

export interface User {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  is_activated: boolean;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  total_chat_seconds: number;
  completed_chats_count: number;
}

export interface ChatProfile {
  id: string;
  name: string;
  country: string;
  language: string;
  status: string;
  occupation?: string;
  chat_rate_tzs: number;
  session_duration_minutes: number;
  avatar_url: string;
  bio: string;
  personality: string;
  is_ai_disclosed: boolean;
  badge?: string;
  is_updated?: boolean;
}

export interface Transaction {
  id: string;
  user_id: number;
  session_id?: string;
  type: string;
  amount: number;
  fee: number;
  net_amount: number;
  description: string;
  status: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method: string;
  phone_number: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  sender: 'user' | 'partner';
  content: string;
  translated_content?: string;
  detected_language?: string;
  created_at: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('swahili_earn_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('swahili_earn_token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('swahili_earn_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    // Provide safe defaults when running as a static export without backend server
    if (endpoint === '/api/profiles') {
      const { DEFAULT_PROFILES } = await import('./defaultProfiles');
      return { profiles: DEFAULT_PROFILES } as unknown as T;
    }
    if (endpoint === '/api/settings') {
      return {
        settings: {
          whatsapp_support_url: 'https://wa.me/message/EP72QM4VJRTIA1',
          whatsapp_channel_url: 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q',
          support_sms_number: '0743697677',
          instagram_url: 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3',
          tiktok_url: 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA',
          facebook_url: 'https://www.facebook.com/share/1HgRiAX6J2/',
          sponsor_url: 'https://onlinepay-d7wjpyve.manus.space/',
        },
      } as unknown as T;
    }
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload: any) => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request<{ user: User }>('/api/auth/me'),
  updateProfile: (payload: any) => request<{ user: User; message: string }>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  // Dashboard Stats
  getDashboardStats: () => request<{
    balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
    total_chat_seconds: number;
    completed_chats: number;
    is_activated: boolean;
    today_earnings: number;
    weekly_earnings: number;
    recent_transactions: Transaction[];
  }>('/api/dashboard/stats'),

  // Profiles
  getProfiles: () => request<{ profiles: ChatProfile[] }>('/api/profiles'),
  getProfile: (id: string) => request<{ profile: ChatProfile }>(`/api/profiles/${id}`),

  // Chat
  startChat: (profile_id: string, custom_duration_seconds?: number) =>
    request<{
      session_id: string;
      partner: ChatProfile;
      duration_seconds: number;
      start_time: string;
      reward_tzs: number;
      initial_message: string;
    }>('/api/chat/start', {
      method: 'POST',
      body: JSON.stringify({ profile_id, custom_duration_seconds }),
    }),

  getSession: (sessionId: string) =>
    request<{
      session_id: string;
      partner_name: string;
      avatar_url: string;
      country: string;
      status: string;
      duration_seconds: number;
      elapsed_seconds: number;
      remaining_seconds: number;
      is_completed: boolean;
      reward_tzs: number;
      is_reward_credited: boolean;
      start_time: string;
    }>(`/api/chat/session/${sessionId}`),

  getMessages: (sessionId: string) =>
    request<{ messages: ChatMessage[] }>(`/api/chat/session/${sessionId}/messages`),

  sendMessage: (sessionId: string, content: string) =>
    request<{ user_message: ChatMessage; partner_message: ChatMessage }>(`/api/chat/session/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  completeSession: (sessionId: string) =>
    request<{
      success: boolean;
      message: string;
      reward_tzs: number;
      transaction_id: string;
      new_balance: number;
      total_earned: number;
      completed_chats: number;
    }>(`/api/chat/session/${sessionId}/complete`, { method: 'POST' }),

  // Translation
  translate: (text: string, target_lang: 'sw' | 'en') =>
    request<{ translated: string; detectedSource: string }>('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, target_lang }),
    }),

  // Transactions & History
  getTransactions: () => request<{ transactions: Transaction[] }>('/api/transactions'),
  getChatHistory: () => request<{ sessions: any[] }>('/api/chat-history'),

  // Withdrawals & Activation
  checkWithdrawalStatus: () =>
    request<{
      is_activated: boolean;
      balance: number;
      activation_fee: number;
      activation_url: string;
    }>('/api/withdrawal/check-status'),

  activateAccount: (reference_code: string) =>
    request<{ success: boolean; message: string; is_activated: boolean }>('/api/withdrawal/activate', {
      method: 'POST',
      body: JSON.stringify({ reference_code }),
    }),

  submitWithdrawal: (payload: { amount: number; payment_method: string; phone_number: string }) =>
    request<{
      success: boolean;
      message: string;
      withdrawal_id: string;
      amount: number;
      fee: number;
      net_amount: number;
    }>('/api/withdrawal/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getWithdrawals: () => request<{ withdrawals: Withdrawal[] }>('/api/withdrawals'),

  // Notifications
  getNotifications: () => request<{ notifications: AppNotification[] }>('/api/notifications'),
  markNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // Admin APIs
  verifyAdminPasscode: (code: string) =>
    request<{ success: boolean; token: string; user: any; message: string }>('/api/admin/verify-passcode', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  getAdminUsers: () => request<{ users: any[] }>('/api/admin/users'),
  setAdminUserActivation: (id: number, is_activated: boolean) =>
    request<{ success: boolean; message: string }>(`/api/admin/users/${id}/activate`, {
      method: 'PUT',
      body: JSON.stringify({ is_activated }),
    }),
  getAdminWithdrawals: () => request<{ withdrawals: any[] }>('/api/admin/withdrawals'),
  getAdminLeads: () => request<{ leads: any[] }>('/api/admin/leads'),
  updateAdminWithdrawalStatus: (id: string, status: string, rejection_reason?: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/withdrawals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejection_reason }),
    }),
  getAdminSettings: () => request<{ settings: Record<string, string> }>('/api/admin/settings'),
  saveAdminSettings: (settings: Record<string, string>) =>
    request<{ success: boolean; message: string }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
  saveAdminProfile: (profile: any) =>
    request<{ success: boolean; message: string; id: string }>('/api/admin/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
  deleteAdminProfile: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/profiles/${id}`, {
      method: 'DELETE',
    }),

  getPublicSettings: () =>
    request<{ settings: Record<string, string> }>('/api/settings'),

  // Google Auth integration
  loginWithGoogle: (payload: { email: string; full_name?: string; google_uid?: string; photo_url?: string }) =>
    request<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Gemini Chatbot & Search Grounding
  sendGeminiMessage: (payload: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    role_type?: 'general_mentor' | 'search_grounded' | 'fast_translator' | 'complex_linguist';
    enable_search?: boolean;
  }) =>
    request<{
      reply: string;
      model_used: string;
      grounding_metadata?: {
        webSearchQueries?: string[];
        searchChunks?: Array<{ web?: { uri?: string; title?: string } }>;
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      } | null;
    }>('/api/gemini/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
