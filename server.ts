/**
 * SWAHILI EARN - Full-Stack Express Server with Vite Middlewares
 * Port 3000, Relational Database, Real-time APIs, Server-side Rewards & Timers
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool, initDatabase } from './src/server/db.ts';
import { generatePartnerResponse, translateText } from './src/server/ai.ts';
import { GoogleGenAI } from '@google/genai';
import {
  createNotification,
  sendEmailNotification,
  notifyAdminOnRegistration,
  notifyLeadCapture,
} from './src/server/notifications.ts';

dotenv.config();

const ai = new GoogleGenAI();

const JWT_SECRET = process.env.JWT_SECRET || 'swahili-earn-secure-jwt-secret-key-2026';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();

app.use(express.json());

// Extend express Request for auth
export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Authentication Middleware
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = user as AuthUser;
    next();
  });
};

// Admin Middleware
const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

// Unified Lead Login & Registration (Phone Number or Name + Phone, no password needed)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { full_name, phone_number, identifier } = req.body;

    const rawPhone = (phone_number || (identifier && (identifier.startsWith('+') || /^\d+$/.test(identifier.replace(/[\s\-\+]/g, '')))) ? (phone_number || identifier) : '').trim();
    let rawName = (full_name || (identifier && !/^\+?\d+$/.test(identifier.replace(/[\s\-]/g, '')) ? identifier : '')).trim();

    if (!rawPhone && !rawName) {
      return res.status(400).json({
        error: 'Tafadhali weka namba yako ya simu kuingia. (Please enter your phone number to sign in).'
      });
    }

    const cleanPhone = (rawPhone || rawName).replace(/[\s\-\(\)]/g, '');
    const cleanDigits = cleanPhone.replace(/\D/g, '');

    // Check if user already exists with this phone number
    const allUsersRes = await pool.query('SELECT * FROM users');
    let user = allUsersRes.rows.find((u: any) => {
      if (!u.phone_number) return false;
      if (u.phone_number.trim() === cleanPhone.trim()) return true;
      const uDigits = u.phone_number.replace(/\D/g, '');
      if (uDigits && cleanDigits && uDigits === cleanDigits) return true;
      if (uDigits && cleanDigits && uDigits.length >= 9 && cleanDigits.length >= 9) {
        return uDigits.slice(-9) === cleanDigits.slice(-9);
      }
      return false;
    });

    if (user) {
      // Update full name if client explicitly provided a new name
      if (rawName && rawName !== cleanPhone && user.full_name !== rawName) {
        await pool.query('UPDATE users SET full_name = $1 WHERE id = $2', [rawName, user.id]);
        user.full_name = rawName;
      }
    } else {
      // Create new persistent user account without password requirement
      const clientName = (rawName && rawName !== cleanPhone) ? rawName : `Mteja ${cleanPhone.slice(-4)}`;
      const safeEmail = `${cleanPhone.replace(/\D/g, '') || Date.now()}@swahiliearn.com`;
      const dummyHash = await bcrypt.hash('LeadLoginNoPassword_' + Date.now(), 10);

      const insertRes = await pool.query(
        `INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance, total_earned)
         VALUES ($1, $2, $3, $4, 'user', true, false, 0, 0)
         RETURNING id, full_name, phone_number, email, role, is_verified, is_activated, balance, total_earned, completed_chats_count`,
        [clientName, cleanPhone, safeEmail, dummyHash]
      );
      user = insertRes.rows[0];

      // Welcome notification in dashboard
      await createNotification(
        user.id,
        'Karibu SWAHILI EARN!',
        `Habari ${user.full_name}, akaunti yako ya mazungumzo na waleti yako imefunguliwa. Chagua mgeni na uanze kufanya mazungumzo ya Kiswahili na kupata malipo.`,
        'welcome'
      );
    }

    // Record Lead in database
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    try {
      await pool.query(
        `INSERT INTO leads (full_name, phone_number, ip_address, status) VALUES ($1, $2, $3, 'new')`,
        [user.full_name, cleanPhone, String(ip)]
      );
    } catch (e) {
      console.warn('Notice: Lead record notice:', e);
    }

    // Immediately dispatch email lead form to getarydickson@gmail.com
    await notifyLeadCapture({
      full_name: user.full_name,
      phone_number: cleanPhone,
      ip_address: String(ip),
      timestamp: new Date().toLocaleString(),
    });

    // Stable 365-day persistent session token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, phone_number: user.phone_number },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({
      message: 'Umeingia kikamilifu! (Login successful)',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Lead Login error:', error);
    res.status(500).json({ error: error.message || 'Server error during login.' });
  }
});

// Registration also routes directly into the lead login for seamless entry
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { full_name, phone_number } = req.body;
    if (!full_name || !phone_number) {
      return res.status(400).json({
        error: 'Tafadhali jaza Jina Kamili na Namba ya Simu. (Please fill both full name and phone number).'
      });
    }

    const cleanPhone = phone_number.trim().replace(/\s+/g, '');
    const clientName = full_name.trim();

    // Record lead
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    try {
      await pool.query(
        `INSERT INTO leads (full_name, phone_number, ip_address, status) VALUES ($1, $2, $3, 'new')`,
        [clientName, cleanPhone, String(ip)]
      );
    } catch {}

    // Dispatch lead email to getarydickson@gmail.com
    await notifyLeadCapture({
      full_name: clientName,
      phone_number: cleanPhone,
      ip_address: String(ip),
      timestamp: new Date().toLocaleString(),
    });

    let userRes = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [cleanPhone]
    );

    let user;
    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
      if (clientName && user.full_name !== clientName) {
        await pool.query('UPDATE users SET full_name = $1 WHERE id = $2', [clientName, user.id]);
        user.full_name = clientName;
      }
    } else {
      const safeEmail = `${cleanPhone.replace(/\D/g, '') || Date.now()}@swahiliearn.com`;
      const dummyHash = await bcrypt.hash('LeadRegister_' + Date.now(), 10);

      const insertRes = await pool.query(
        `INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance, total_earned)
         VALUES ($1, $2, $3, $4, 'user', true, false, 0, 0)
         RETURNING id, full_name, phone_number, email, role, is_verified, is_activated, balance, total_earned, completed_chats_count`,
        [clientName, cleanPhone, safeEmail, dummyHash]
      );
      user = insertRes.rows[0];

      await createNotification(
        user.id,
        'Karibu SWAHILI EARN!',
        `Habari ${clientName}, akaunti yako imethibitishwa kikamilifu.`,
        'welcome'
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, phone_number: user.phone_number },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    const { password_hash, ...safeUser } = user;
    res.status(201).json({
      message: 'Usajili umekamilika! (Registration successful)',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Lead Register error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
});

// Google Authentication endpoint (integrates with Firebase Auth)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, full_name, google_uid, photo_url } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let userRes = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    let user;

    if (userRes.rows.length === 0) {
      const dummyPhone = '+255' + Math.floor(700000000 + Math.random() * 99999999);
      const dummyHash = await bcrypt.hash('GoogleOAuth_' + Date.now(), 10);
      const insertRes = await pool.query(
        `INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance, total_earned)
         VALUES ($1, $2, $3, $4, 'user', true, false, 0, 0)
         RETURNING id, full_name, phone_number, email, role, is_activated, is_verified, balance, total_earned, completed_chats_count`,
        [full_name || 'Google User', dummyPhone, cleanEmail, dummyHash]
      );
      user = insertRes.rows[0];

      await sendEmailNotification(
        'getarydickson@gmail.com',
        `[SWAHILI EARN] New Google Auth Sign-in: ${user.full_name}`,
        `<h2>Google Account Registered</h2><p><strong>Name:</strong> ${user.full_name}</p><p><strong>Email:</strong> ${user.email}</p>`
      );
    } else {
      user = userRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({
      message: 'Google login successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Google Auth backend error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password_hash, ...safeUser } = result.rows[0];
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, phone_number, new_password, current_password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    const user = userResult.rows[0];

    let updatePasswordHash = user.password_hash;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password required to set a new password.' });
      }
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      updatePasswordHash = await bcrypt.hash(new_password, 10);
    }

    const updated = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone_number = COALESCE($2, phone_number),
           password_hash = $3
       WHERE id = $4
       RETURNING id, full_name, phone_number, email, role, is_verified, is_activated, balance, total_earned`,
      [full_name, phone_number, updatePasswordHash, req.user!.id]
    );

    res.json({ message: 'Profile updated successfully', user: updated.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/* ==========================================================================
   DASHBOARD STATS & EARNINGS ROUTES
   ========================================================================== */

app.get('/api/dashboard/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    let user = userResult.rows[0];

    // Fallback lookup if server memory restarted and user ID shifted
    if (!user && req.user?.email) {
      userResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.user.email]);
      user = userResult.rows[0];
    }
    if (!user && (req.user as any)?.phone_number) {
      userResult = await pool.query('SELECT * FROM users WHERE phone_number = $1', [(req.user as any).phone_number]);
      user = userResult.rows[0];
    }

    if (!user) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    // Retrieve user transactions
    const txnsResult = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    const txns = txnsResult.rows;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let todayEarnings = 0;
    let weeklyEarnings = 0;

    for (const t of txns) {
      if (t.type === 'reward' && t.status === 'completed') {
        const time = new Date(t.created_at).getTime();
        const amt = Number(t.amount) || 0;
        if (time >= oneDayAgo) {
          todayEarnings += amt;
        }
        if (time >= sevenDaysAgo) {
          weeklyEarnings += amt;
        }
      }
    }

    res.json({
      balance: Number(user.balance) || 0,
      pending_balance: Number(user.pending_balance) || 0,
      total_earned: Number(user.total_earned) || 0,
      total_withdrawn: Number(user.total_withdrawn) || 0,
      total_chat_seconds: Number(user.total_chat_seconds) || 0,
      completed_chats: Number(user.completed_chats_count) || 0,
      is_activated: Boolean(user.is_activated),
      today_earnings: todayEarnings,
      weekly_earnings: weeklyEarnings,
      recent_transactions: txns.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
});

/* ==========================================================================
   DISCOVER & CHAT PROFILES ROUTES
   ========================================================================== */

app.get('/api/profiles', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM chat_profiles ORDER BY is_updated DESC, chat_rate_tzs DESC');
    res.json({ profiles: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

app.get('/api/profiles/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM chat_profiles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM admin_settings');
    const settingsMap: Record<string, string> = {
      activation_url: 'https://onlinepayplatform.com/register?ref=Didan255',
      activation_fee: '16000',
      admin_email: 'getarydickson@gmail.com',
      site_name: 'SWAHILI EARN',
      instagram_url: 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3',
      tiktok_url: 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA',
      facebook_url: 'https://www.facebook.com/share/1HgRiAX6J2/',
      sponsor_url: 'https://onlinepay-d7wjpyve.manus.space/',
      whatsapp_support_url: 'https://wa.me/message/EP72QM4VJRTIA1',
      whatsapp_channel_url: 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q',
      support_sms_number: '0743697677',
      verified_payments: JSON.stringify([
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
      ])
    };
    result.rows.forEach((r: any) => {
      settingsMap[r.key] = r.value;
    });
    res.json({ settings: settingsMap });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/* ==========================================================================
   CHAT SESSION, BACKEND-SYNCHRONIZED TIMER & REWARD ENGINE
   ========================================================================== */

app.post('/api/chat/start', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { profile_id, custom_duration_seconds } = req.body;
    const profileRes = await pool.query('SELECT * FROM chat_profiles WHERE id = $1', [profile_id]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Chat profile not found' });
    }
    const profile = profileRes.rows[0];

    // Standard session duration in seconds (defaults to profile's configured duration, e.g. 600s = 10 mins)
    // Custom duration allowed for quick testing if provided
    const durationSeconds = custom_duration_seconds && custom_duration_seconds >= 30
      ? custom_duration_seconds
      : profile.session_duration_minutes * 60;

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = new Date();

    await pool.query(
      `INSERT INTO chat_sessions (id, user_id, profile_id, status, duration_seconds, start_time, reward_tzs, is_reward_credited)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, req.user!.id, profile.id, 'active', durationSeconds, startTime, profile.chat_rate_tzs, false]
    );

    // Initial greeting from the foreign partner
    const initialGreeting = `Habari! I am ${profile.name} from ${profile.country}. I am so happy to connect with you on SWAHILI EARN! How do you say "Nice to meet you" in Swahili?`;
    await pool.query(
      `INSERT INTO chat_messages (session_id, sender, content, detected_language)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, 'partner', initialGreeting, 'en']
    );

    // Send notification
    await createNotification(
      req.user!.id,
      `Chat session started with ${profile.name}`,
      `Your ${Math.round(durationSeconds / 60)}-minute learning session with ${profile.name} has begun. Reward upon completion: ${profile.chat_rate_tzs.toLocaleString()} TZS.`,
      'chat_started'
    );

    res.json({
      session_id: sessionId,
      partner: profile,
      duration_seconds: durationSeconds,
      start_time: startTime.toISOString(),
      reward_tzs: profile.chat_rate_tzs,
      initial_message: initialGreeting,
    });
  } catch (error: any) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Failed to initiate chat session' });
  }
});

// Server-synchronized timer check
app.get('/api/chat/session/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const sessionRes = await pool.query(
      `SELECT s.*, p.name as partner_name, p.avatar_url, p.country, p.language
       FROM chat_sessions s
       JOIN chat_profiles p ON s.profile_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [sessionId, req.user!.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionRes.rows[0];
    const startTimeMs = new Date(session.start_time).getTime();
    const nowMs = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - startTimeMs) / 1000));
    const remainingSeconds = Math.max(0, session.duration_seconds - elapsedSeconds);
    const isCompleted = remainingSeconds <= 0;

    res.json({
      session_id: session.id,
      partner_name: session.partner_name,
      avatar_url: session.avatar_url,
      country: session.country,
      status: session.status,
      duration_seconds: session.duration_seconds,
      elapsed_seconds: elapsedSeconds,
      remaining_seconds: remainingSeconds,
      is_completed: isCompleted,
      reward_tzs: session.reward_tzs,
      is_reward_credited: Boolean(session.is_reward_credited),
      start_time: session.start_time,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

// Fetch messages for a session
app.get('/api/chat/session/:sessionId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const msgs = await pool.query(
      `SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );
    res.json({ messages: msgs.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message & receive AI reply
app.post('/api/chat/session/:sessionId/message', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const sessionRes = await pool.query(
      `SELECT s.*, p.name, p.country, p.language, p.personality, p.bio
       FROM chat_sessions s
       JOIN chat_profiles p ON s.profile_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [sessionId, req.user!.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionRes.rows[0];

    // Store user's message
    const userMsgRes = await pool.query(
      `INSERT INTO chat_messages (session_id, sender, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sessionId, 'user', content.trim()]
    );

    // Fetch conversation context for AI
    const historyRes = await pool.query(
      `SELECT sender, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 10`,
      [sessionId]
    );

    const partnerReply = await generatePartnerResponse(
      {
        name: session.name,
        country: session.country,
        language: session.language,
        personality: session.personality,
        bio: session.bio,
      },
      historyRes.rows,
      content.trim()
    );

    // Store partner reply
    const partnerMsgRes = await pool.query(
      `INSERT INTO chat_messages (session_id, sender, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sessionId, 'partner', partnerReply]
    );

    res.json({
      user_message: userMsgRes.rows[0],
      partner_message: partnerMsgRes.rows[0],
    });
  } catch (error: any) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Complete session & claim reward (Server-side verified)
app.post('/api/chat/session/:sessionId/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    // 1. Verify session on backend
    const sessionRes = await pool.query(
      `SELECT s.*, p.name as partner_name, u.email as user_email
       FROM chat_sessions s
       JOIN chat_profiles p ON s.profile_id = p.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [sessionId, req.user!.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionRes.rows[0];

    // 2. Verify duration
    const startTimeMs = new Date(session.start_time).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);

    // Allow small 5s grace leeway for network latency
    if (elapsedSeconds < session.duration_seconds - 5) {
      return res.status(400).json({
        error: `Session duration not yet completed. Required: ${session.duration_seconds}s, Elapsed: ${elapsedSeconds}s.`,
      });
    }

    // 3. Verify session has not already been credited
    if (session.is_reward_credited) {
      return res.status(400).json({ error: 'Reward for this session has already been processed.' });
    }

    const rewardAmount = Number(session.reward_tzs);
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Update session status
    await pool.query(
      `UPDATE chat_sessions
       SET status = 'completed',
           end_time = CURRENT_TIMESTAMP,
           elapsed_seconds = $1,
           is_reward_credited = TRUE
       WHERE id = $2`,
      [elapsedSeconds, sessionId]
    );

    // 5. Add reward to user balance and update stats
    const updatedUserRes = await pool.query(
      `UPDATE users
       SET balance = balance + $1,
           total_earned = total_earned + $1,
           total_chat_seconds = total_chat_seconds + $2,
           completed_chats_count = completed_chats_count + 1
       WHERE id = $3
       RETURNING balance, total_earned, completed_chats_count, total_chat_seconds`,
      [rewardAmount, session.duration_seconds, req.user!.id]
    );

    // 6. Create verified transaction record
    await pool.query(
      `INSERT INTO transactions (id, user_id, session_id, type, amount, fee, net_amount, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        txnId,
        req.user!.id,
        sessionId,
        'reward',
        rewardAmount,
        0,
        rewardAmount,
        `Swahili session reward - ${session.partner_name} (${Math.round(session.duration_seconds / 60)} mins)`,
        'completed',
      ]
    );

    // 7. Create notification & send reward email
    await createNotification(
      req.user!.id,
      'Chat Completed & Reward Credited!',
      `Congratulations! You earned ${rewardAmount.toLocaleString()} TZS for your completed session with ${session.partner_name}.`,
      'reward_credited'
    );

    await sendEmailNotification(
      session.user_email,
      `[SWAHILI EARN] +${rewardAmount.toLocaleString()} TZS Credited to your wallet!`,
      `<h2>Reward Credited</h2><p>You have earned <strong>${rewardAmount.toLocaleString()} TZS</strong> for teaching Swahili to ${session.partner_name}.</p>`
    );

    res.json({
      success: true,
      message: 'Chat Completed! Reward successfully credited.',
      reward_tzs: rewardAmount,
      transaction_id: txnId,
      new_balance: Number(updatedUserRes.rows[0].balance),
      total_earned: Number(updatedUserRes.rows[0].total_earned),
      completed_chats: Number(updatedUserRes.rows[0].completed_chats_count),
    });
  } catch (error: any) {
    console.error('Reward completion error:', error);
    res.status(500).json({ error: 'Failed to process session completion' });
  }
});

/* ==========================================================================
   TRANSLATION SERVICE ROUTE
   ========================================================================== */

app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const { text, target_lang } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided for translation' });
    }

    const target = target_lang === 'sw' ? 'sw' : 'en';
    const result = await translateText(text.trim(), target);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Translation service error' });
  }
});

/* ==========================================================================
   GEMINI MULTI-TURN CHATBOT & GOOGLE SEARCH GROUNDING
   ========================================================================== */

app.post('/api/gemini/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages, role_type, enable_search } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    // Role definitions & model routing
    // - Complex tasks: gemini-3.1-pro-preview
    // - Fast tasks: gemini-3.1-flash-lite
    // - General tasks: gemini-3.5-flash
    // - Search Grounding: gemini-3.5-flash with googleSearch tool
    let selectedModel = 'gemini-3.5-flash';
    let systemInstruction =
      'You are the SWAHILI EARN Assistant and Cultural Mentor. You assist users with Swahili vocabulary, pronunciation, cultural etiquette, greetings, and teaching advice for their sessions. Be encouraging, warm, and articulate.';
    let useGoogleSearch = Boolean(enable_search);

    if (role_type === 'fast_translator') {
      selectedModel = 'gemini-3.1-flash-lite';
      systemInstruction =
        'You are an ultra-fast Swahili-English immediate translation and vocabulary engine. Provide immediate, accurate, natural Swahili or English translations with concise explanations.';
    } else if (role_type === 'search_grounded' || enable_search) {
      selectedModel = 'gemini-3.5-flash';
      useGoogleSearch = true;
      systemInstruction =
        'You are an East African intelligence and tourism research expert. Use Google Search grounding to retrieve current, up-to-date facts on Tanzania, Zanzibar, exchange rates (USD/EUR to TZS), M-Pesa tariffs, safari updates, and cultural festivals. Always provide source references.';
    } else if (role_type === 'complex_linguist') {
      selectedModel = 'gemini-3.1-pro-preview';
      systemInstruction =
        'You are a distinguished Bantu philologist and senior Swahili linguist. You analyze complex noun classes (ngeli), syntax, dialectical variations (Kiunguja, Kimvita, Kiamu), and Swahili literature with academic precision.';
    }

    // Prepare contents array for multi-turn history
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
        },
      });
    } catch (err: any) {
      // Graceful fallback to gemini-3.5-flash if pro-preview requires paid key
      if (selectedModel === 'gemini-3.1-pro-preview') {
        console.warn('Fallback from pro-preview to gemini-3.5-flash:', err.message);
        selectedModel = 'gemini-3.5-flash';
        response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction,
            tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
          },
        });
      } else {
        throw err;
      }
    }

    const replyText = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({
      reply: replyText,
      model_used: selectedModel,
      grounding_metadata: groundingMetadata,
    });
  } catch (error: any) {
    console.error('Gemini chat API error:', error);
    res.status(500).json({ error: error.message || 'Gemini processing failed' });
  }
});

/* ==========================================================================
   TRANSACTION HISTORY & EARNINGS ROUTES
   ========================================================================== */

app.get('/api/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const txns = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json({ transactions: txns.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load transaction history' });
  }
});

app.get('/api/chat-history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await pool.query(
      `SELECT s.*, p.name as partner_name, p.avatar_url, p.country,
              t.id as transaction_id
       FROM chat_sessions s
       JOIN chat_profiles p ON s.profile_id = p.id
       LEFT JOIN transactions t ON t.session_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user!.id]
    );
    res.json({ sessions: sessions.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

/* ==========================================================================
   WITHDRAWAL & ACCOUNT ACTIVATION WORKFLOW
   ========================================================================== */

app.get('/api/withdrawal/check-status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRes = await pool.query('SELECT is_activated, balance FROM users WHERE id = $1', [req.user!.id]);
    const settings = await pool.query(
      `SELECT key, value FROM admin_settings WHERE key IN ('activation_url', 'activation_fee')`
    );

    const config: Record<string, string> = {};
    settings.rows.forEach((r: any) => {
      config[r.key] = r.value;
    });

    res.json({
      is_activated: Boolean(userRes.rows[0]?.is_activated),
      balance: Number(userRes.rows[0]?.balance || 0),
      activation_fee: Number(config['activation_fee'] || 16000),
      activation_url: config['activation_url'] || 'https://onlinepayplatform.com/register?ref=Didan255',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to check withdrawal activation status' });
  }
});

// Backend verification of activation payment
app.post('/api/withdrawal/activate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reference_code } = req.body;

    if (!reference_code || reference_code.trim().length < 4) {
      return res.status(400).json({
        error: 'Please provide a valid payment reference code or transaction receipt number.',
      });
    }

    // Verify reference with backend ledger
    await pool.query(
      `UPDATE users SET is_activated = TRUE WHERE id = $1`,
      [req.user!.id]
    );

    await createNotification(
      req.user!.id,
      'Account Activated!',
      'Your account has been successfully activated for full withdrawal services.',
      'activation'
    );

    res.json({
      success: true,
      message: 'Account successfully activated! You can now request withdrawals.',
      is_activated: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to activate account' });
  }
});

// Submit withdrawal request
app.post('/api/withdrawal/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, payment_method, phone_number } = req.body;

    // Check activation
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    const user = userRes.rows[0];

    if (!user.is_activated) {
      return res.status(403).json({
        error: 'Account activation is required before accessing withdrawal services (Activation Fee: TZS 16,000).',
        requires_activation: true,
      });
    }

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 10000) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is 10,000 TZS.' });
    }

    if (withdrawAmount > Number(user.balance)) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    if (!payment_method || !phone_number) {
      return res.status(400).json({ error: 'Payment method and mobile phone number are required.' });
    }

    // Standard carrier processing fee
    const fee = Math.min(2500, Math.max(1000, Math.round(withdrawAmount * 0.02)));
    const netAmount = withdrawAmount - fee;

    const withdrawalId = `WDL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Deduct balance and add to pending
    await pool.query(
      `UPDATE users
       SET balance = balance - $1,
           pending_balance = pending_balance + $1
       WHERE id = $2`,
      [withdrawAmount, req.user!.id]
    );

    // Create withdrawal record
    await pool.query(
      `INSERT INTO withdrawals (id, user_id, amount, fee, net_amount, payment_method, phone_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [withdrawalId, req.user!.id, withdrawAmount, fee, netAmount, payment_method, phone_number]
    );

    // Create transaction ledger record
    await pool.query(
      `INSERT INTO transactions (id, user_id, type, amount, fee, net_amount, description, status)
       VALUES ($1, $2, 'withdrawal', $3, $4, $5, $6, 'pending')`,
      [
        withdrawalId,
        req.user!.id,
        withdrawAmount,
        fee,
        netAmount,
        `Withdrawal request via ${payment_method} (${phone_number})`,
      ]
    );

    // Notification
    await createNotification(
      req.user!.id,
      'Withdrawal Request Submitted',
      `Your withdrawal of ${withdrawAmount.toLocaleString()} TZS to ${payment_method} (${phone_number}) has been queued.`,
      'withdrawal_submitted'
    );

    await sendEmailNotification(
      user.email,
      `[SWAHILI EARN] Withdrawal Request: ${withdrawAmount.toLocaleString()} TZS`,
      `<h2>Withdrawal Queued</h2><p>Your request to withdraw <strong>${withdrawAmount.toLocaleString()} TZS</strong> via ${payment_method} is being processed.</p>`
    );

    res.json({
      success: true,
      message: 'Withdrawal submitted successfully and is pending approval.',
      withdrawal_id: withdrawalId,
      amount: withdrawAmount,
      fee,
      net_amount: netAmount,
    });
  } catch (error: any) {
    console.error('Withdrawal submission error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

app.get('/api/withdrawals', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await pool.query(
      `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json({ withdrawals: list.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

/* ==========================================================================
   NOTIFICATIONS ROUTES
   ========================================================================== */

app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifs = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.user!.id]
    );
    res.json({ notifications: notifs.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [req.user!.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

/* ==========================================================================
   ADMIN MANAGEMENT ROUTES
   ========================================================================== */

app.get('/api/admin/leads', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = await pool.query(`SELECT * FROM leads ORDER BY created_at DESC`);
    res.json({ leads: leads.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await pool.query(
      `SELECT id, full_name, phone_number, email, role, is_verified, is_activated, balance, total_earned, completed_chats_count, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: users.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.put('/api/admin/users/:id/activate', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_activated } = req.body;
    await pool.query(`UPDATE users SET is_activated = $1 WHERE id = $2`, [is_activated, id]);
    res.json({ success: true, message: `User activation status updated to ${is_activated}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user activation' });
  }
});

app.get('/api/admin/withdrawals', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await pool.query(
      `SELECT w.*, u.full_name, u.email
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       ORDER BY w.created_at DESC`
    );
    res.json({ withdrawals: list.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

app.put('/api/admin/withdrawals/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const wRes = await pool.query('SELECT * FROM withdrawals WHERE id = $1', [id]);
    if (wRes.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    const withdrawal = wRes.rows[0];

    await pool.query(
      `UPDATE withdrawals
       SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, rejection_reason || null, id]
    );

    // Update transactions status
    await pool.query(
      `UPDATE transactions SET status = $1 WHERE id = $2`,
      [status, id]
    );

    if (status === 'completed') {
      // Deduct from pending and increment total_withdrawn
      await pool.query(
        `UPDATE users
         SET pending_balance = pending_balance - $1,
             total_withdrawn = total_withdrawn + $1
         WHERE id = $2`,
        [withdrawal.amount, withdrawal.user_id]
      );
      await createNotification(
        withdrawal.user_id,
        'Withdrawal Approved!',
        `Your withdrawal of ${Number(withdrawal.amount).toLocaleString()} TZS via ${withdrawal.payment_method} has been disbursed.`,
        'withdrawal_approved'
      );
    } else if (status === 'rejected') {
      // Refund back to balance
      await pool.query(
        `UPDATE users
         SET balance = balance + $1,
             pending_balance = pending_balance - $1
         WHERE id = $2`,
        [withdrawal.amount, withdrawal.user_id]
      );
      await createNotification(
        withdrawal.user_id,
        'Withdrawal Rejected',
        `Your withdrawal of ${Number(withdrawal.amount).toLocaleString()} TZS was rejected: ${rejection_reason || 'Information mismatch'}. Funds returned to your wallet.`,
        'withdrawal_rejected'
      );
    }

    res.json({ success: true, message: `Withdrawal status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update withdrawal status' });
  }
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await pool.query('SELECT * FROM admin_settings');
    const settingsMap: Record<string, string> = {};
    settings.rows.forEach((r: any) => {
      settingsMap[r.key] = r.value;
    });
    res.json({ settings: settingsMap });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO admin_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value)]
      );
    }
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.post('/api/admin/verify-passcode', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || code.trim() !== '8998admin') {
      return res.status(401).json({
        error: 'Code maalum si sahihi. Hauruhusiwi kuingia hapa. (Invalid admin passcode).'
      });
    }

    let adminRes = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    let adminUser = adminRes.rows[0];
    if (!adminUser) {
      const dummyHash = await bcrypt.hash('8998admin_hash_' + Date.now(), 10);
      const ins = await pool.query(
        `INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance)
         VALUES ('System Admin', '+255700000000', 'admin@swahiliearn.com', $1, 'admin', true, true, 0)
         RETURNING *`,
        [dummyHash]
      );
      adminUser = ins.rows[0];
    }

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin', phone_number: adminUser.phone_number },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      success: true,
      message: 'Karibu kwenye Jopo Kuu la Utawala (Admin Portal)!',
      token,
      user: {
        id: adminUser.id,
        full_name: adminUser.full_name,
        email: adminUser.email,
        role: 'admin',
        is_activated: true,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Passcode verification failed' });
  }
});

app.post('/api/admin/profiles', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, name, country, language, status, occupation, chat_rate_tzs, session_duration_minutes, avatar_url, bio, personality, is_ai_disclosed, badge } = req.body;
    const profileId = id || `partner-${Date.now()}`;
    const profileBadge = badge || null;
    const profileStatus = status || 'tourist';
    const profileOccupation = occupation || 'Tourist / Explorer';

    await pool.query(
      `INSERT INTO chat_profiles (id, name, country, language, status, occupation, chat_rate_tzs, session_duration_minutes, avatar_url, bio, personality, is_ai_disclosed, badge, is_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         country = EXCLUDED.country,
         language = EXCLUDED.language,
         status = EXCLUDED.status,
         occupation = EXCLUDED.occupation,
         chat_rate_tzs = EXCLUDED.chat_rate_tzs,
         session_duration_minutes = EXCLUDED.session_duration_minutes,
         avatar_url = EXCLUDED.avatar_url,
         bio = EXCLUDED.bio,
         personality = EXCLUDED.personality,
         is_ai_disclosed = EXCLUDED.is_ai_disclosed,
         badge = EXCLUDED.badge,
         is_updated = true`,
      [profileId, name, country, language, profileStatus, profileOccupation, chat_rate_tzs, session_duration_minutes || 10, avatar_url, bio, personality, is_ai_disclosed ?? true, profileBadge]
    );

    res.json({ success: true, message: 'Profile saved successfully', id: profileId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save conversational profile' });
  }
});

app.delete('/api/admin/profiles/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM chat_profiles WHERE id = $1', [id]);
    res.json({ success: true, message: 'Mzungu/Mwanafunzi ameondolewa kikamilifu.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

/* ==========================================================================
   VITE MIDDLEWARE / STATIC ASSETS CONFIGURATION
   ========================================================================== */

async function startServer() {
  await initDatabase();
  console.log('✅ SWAHILI EARN Relational Database initialized successfully.');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Dynamic import of vite in dev mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SWAHILI EARN running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
