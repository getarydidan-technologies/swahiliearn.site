/**
 * SWAHILI EARN - Relational Database Layer
 * Uses pg-mem (in-memory relational PostgreSQL engine) with optional snapshot persistence.
 */

import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbInstance = newDb();
// pg-mem provides a standard pg-compatible client adapter
const pg = dbInstance.adapters.createPg();
export const pool = new pg.Pool();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'db_state.json');

// Initialize Schema and Seed Data
export async function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create Relational Tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) DEFAULT 'lead_no_password_required',
      referral_code VARCHAR(100),
      is_verified BOOLEAN DEFAULT TRUE,
      is_activated BOOLEAN DEFAULT FALSE,
      balance BIGINT DEFAULT 0,
      pending_balance BIGINT DEFAULT 0,
      total_earned BIGINT DEFAULT 0,
      total_withdrawn BIGINT DEFAULT 0,
      total_chat_seconds INTEGER DEFAULT 0,
      completed_chats_count INTEGER DEFAULT 0,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(100) NOT NULL,
      ip_address VARCHAR(100),
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_profiles (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(100) NOT NULL,
      language VARCHAR(100) NOT NULL,
      status VARCHAR(100) DEFAULT 'tourist',
      occupation VARCHAR(100) DEFAULT 'Tourist / Explorer',
      chat_rate_tzs INTEGER NOT NULL,
      session_duration_minutes INTEGER NOT NULL,
      avatar_url TEXT NOT NULL,
      bio TEXT NOT NULL,
      personality TEXT NOT NULL,
      is_ai_disclosed BOOLEAN DEFAULT TRUE,
      badge VARCHAR(100),
      is_updated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id VARCHAR(100) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      profile_id VARCHAR(100) REFERENCES chat_profiles(id),
      status VARCHAR(50) NOT NULL, -- 'active', 'completed', 'cancelled'
      duration_seconds INTEGER NOT NULL,
      elapsed_seconds INTEGER DEFAULT 0,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP,
      reward_tzs INTEGER NOT NULL,
      is_reward_credited BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100) REFERENCES chat_sessions(id),
      sender VARCHAR(50) NOT NULL, -- 'user' | 'partner'
      content TEXT NOT NULL,
      translated_content TEXT,
      detected_language VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(100) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      session_id VARCHAR(100),
      type VARCHAR(50) NOT NULL, -- 'reward', 'withdrawal', 'activation', 'referral'
      amount BIGINT NOT NULL,
      fee BIGINT DEFAULT 0,
      net_amount BIGINT NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) NOT NULL, -- 'completed', 'pending', 'processing', 'rejected'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id VARCHAR(100) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      amount BIGINT NOT NULL,
      fee BIGINT NOT NULL,
      net_amount BIGINT NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      phone_number VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(100) NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    await pool.query(`ALTER TABLE chat_profiles ADD COLUMN IF NOT EXISTS badge VARCHAR(100)`);
    await pool.query(`ALTER TABLE chat_profiles ADD COLUMN IF NOT EXISTS is_updated BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE chat_profiles ADD COLUMN IF NOT EXISTS occupation VARCHAR(100) DEFAULT 'Tourist / Explorer'`);
    await pool.query(`UPDATE chat_profiles SET badge = NULL;`);
  } catch {}

  // Insert default settings
  await pool.query(`
    INSERT INTO admin_settings (key, value) VALUES
      ('activation_url', 'https://onlinepayplatform.com/register?ref=Didan255'),
      ('activation_fee', '16000'),
      ('admin_email', 'getarydickson@gmail.com'),
      ('site_name', 'SWAHILI EARN'),
      ('instagram_url', 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3'),
      ('tiktok_url', 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA'),
      ('facebook_url', 'https://www.facebook.com/share/1HgRiAX6J2/'),
      ('sponsor_url', 'https://onlinepay-d7wjpyve.manus.space/'),
      ('whatsapp_support_url', 'https://wa.me/message/EP72QM4VJRTIA1'),
      ('whatsapp_channel_url', 'https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q'),
      ('support_sms_number', '0743697677')
    ON CONFLICT (key) DO NOTHING;
  `);

  // Seed default chat profiles
  const profiles = [
    {
      id: 'eliza-poland',
      name: 'Eliza',
      country: 'Poland',
      language: 'English',
      status: 'tourist',
      occupation: 'Tourist / Travel Blogger',
      chat_rate_tzs: 80000,
      session_duration_minutes: 10,
      avatar_url: '/src/assets/images/avatar_eliza_partner_1790978674237.jpg',
      bio: 'Habari! I am Eliza from Warsaw, Poland. I am visiting Zanzibar next month and want to practice conversational Swahili with native speakers.',
      personality: 'Warm, eager to learn basic Swahili phrases, polite, asks about daily life in Swahili and appreciates pronunciation corrections.',
      is_ai_disclosed: true
    },
    {
      id: 'mark-usa',
      name: 'Mark',
      country: 'United States',
      language: 'English',
      status: 'college student',
      occupation: 'College Student (Biology)',
      chat_rate_tzs: 75000,
      session_duration_minutes: 10,
      avatar_url: '/src/assets/images/avatar_mark_partner_1790978683862.jpg',
      bio: 'Hello! Mark here from California. I work in wildlife conservation and I am learning Swahili for my field trip to Serengeti National Park.',
      personality: 'Enthusiastic, inquisitive, asks about wildlife and community terms in Swahili.',
      is_ai_disclosed: true
    },
    {
      id: 'sarah-uk',
      name: 'Sarah',
      country: 'United Kingdom',
      language: 'English',
      status: 'doctor',
      occupation: 'Doctor / Medical Researcher',
      chat_rate_tzs: 60000,
      session_duration_minutes: 10,
      avatar_url: '/src/assets/images/avatar_sarah_partner_1790978693289.jpg',
      bio: 'Jambo! I am Sarah from London. I work on educational exchange programs and enjoy learning East African cultures and Swahili proverbs.',
      personality: 'Friendly, patient, loves Swahili sayings and vocabulary practice.',
      is_ai_disclosed: true
    },
    {
      id: 'david-canada',
      name: 'David',
      country: 'Canada',
      language: 'English',
      status: 'tourist',
      occupation: 'Tourist / Professional Photographer',
      chat_rate_tzs: 65000,
      session_duration_minutes: 10,
      avatar_url: '/src/assets/images/avatar_david_partner_1790979990804.jpg',
      bio: 'Habari zenu! David from Toronto. Passionate about world languages and excited to learn Swahili for business travel.',
      personality: 'Professional, articulate, eager to practice conversational dialogues.',
      is_ai_disclosed: false
    }
  ];

  for (const p of profiles) {
    await pool.query(`
      INSERT INTO chat_profiles (id, name, country, language, status, occupation, chat_rate_tzs, session_duration_minutes, avatar_url, bio, personality, is_ai_disclosed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        avatar_url = EXCLUDED.avatar_url,
        is_ai_disclosed = EXCLUDED.is_ai_disclosed,
        status = EXCLUDED.status,
        occupation = EXCLUDED.occupation;
    `, [p.id, p.name, p.country, p.language, p.status, p.occupation, p.chat_rate_tzs, p.session_duration_minutes, p.avatar_url, p.bio, p.personality, p.is_ai_disclosed]);
  }

  // Ensure David's avatar is specifically updated if already seeded
  await pool.query(
    "UPDATE chat_profiles SET avatar_url = '/src/assets/images/avatar_david_partner_1790979990804.jpg' WHERE id = 'david-canada'"
  );

  // Create an Admin user for dashboard admin features
  const adminEmail = 'admin@swahiliearn.com';
  const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existingAdmin.rows.length === 0) {
    const adminHash = await bcrypt.hash('Admin2026!Secure', 10);
    await pool.query(`
      INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ['System Administrator', '+255700000001', adminEmail, adminHash, 'admin', true, true, 0]);
  }

  // Create a Demo user for immediate testing convenience
  const demoEmail = 'demo@swahiliearn.com';
  const existingDemo = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
  if (existingDemo.rows.length === 0) {
    const demoHash = await bcrypt.hash('Demo123456!', 10);
    const demoUser = await pool.query(`
      INSERT INTO users (full_name, phone_number, email, password_hash, role, is_verified, is_activated, balance, total_earned, completed_chats_count, total_chat_seconds)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, ['Juma Bakari', '+255712345678', demoEmail, demoHash, 'user', true, false, 80000, 80000, 1, 600]);

    const demoUserId = demoUser.rows[0].id;
    // Add initial demonstration transaction for Juma
    await pool.query(`
      INSERT INTO transactions (id, user_id, type, amount, fee, net_amount, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'TXN-INIT-89412',
      demoUserId,
      'reward',
      80000,
      0,
      80000,
      'Swahili session reward - Eliza (10 mins completed)',
      'completed'
    ]);

    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
    `, [
      demoUserId,
      'Welcome to SWAHILI EARN!',
      'Your account is ready. Connect with international learners and earn rewards for teaching Swahili.',
      'registration'
    ]);
  }
}
