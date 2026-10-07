import { ChatProfile } from './api';
import avatarSarah from '../assets/images/avatar_sarah_partner_1790978693289.jpg';
import avatarMark from '../assets/images/avatar_mark_partner_1790978683862.jpg';
import avatarEliza from '../assets/images/avatar_eliza_partner_1790978674237.jpg';
import avatarDavid from '../assets/images/avatar_david_partner_1790979990804.jpg';

export const DEFAULT_PROFILES: ChatProfile[] = [
  {
    id: 'eliza-poland',
    name: 'Eliza',
    country: 'Poland',
    language: 'English',
    status: 'tourist',
    occupation: 'Tourist / Travel Blogger',
    chat_rate_tzs: 80000,
    session_duration_minutes: 10,
    avatar_url: avatarEliza,
    bio: 'Habari! I am Eliza from Warsaw, Poland. I am visiting Zanzibar next month and want to practice conversational Swahili with native speakers.',
    personality: 'Warm, eager to learn basic Swahili phrases, polite, asks about daily life in Swahili and appreciates pronunciation corrections.',
    is_ai_disclosed: true,
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
    avatar_url: avatarMark,
    bio: 'Hello! Mark here from California. I work in wildlife conservation and I am learning Swahili for my field trip to Serengeti National Park.',
    personality: 'Enthusiastic, inquisitive, asks about wildlife and community terms in Swahili.',
    is_ai_disclosed: true,
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
    avatar_url: avatarSarah,
    bio: 'Jambo! I am Sarah from London. I work on educational exchange programs and enjoy learning East African cultures and Swahili proverbs.',
    personality: 'Friendly, patient, loves Swahili sayings and vocabulary practice.',
    is_ai_disclosed: true,
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
    avatar_url: avatarDavid,
    bio: 'Habari zenu! David from Toronto. Passionate about world languages and excited to learn Swahili for business travel.',
    personality: 'Professional, articulate, eager to practice conversational dialogues.',
    is_ai_disclosed: false,
  },
];
