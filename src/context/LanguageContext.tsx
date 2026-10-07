import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'sw' | 'en';

interface Translations {
  [key: string]: {
    sw: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  nav_home: { sw: 'Nyumbani', en: 'Home' },
  nav_discover: { sw: 'Gundua Wageni', en: 'Discover' },
  nav_how_it_works: { sw: 'Jinsi Inavyofanya Kazi', en: 'How It Works' },
  nav_earnings: { sw: 'Mapato Yangu', en: 'Earnings' },
  nav_support: { sw: 'Msaada & Maswali', en: 'Support' },
  nav_signin: { sw: 'Jisajili', en: 'Register' },
  nav_register: { sw: 'Fungua Akaunti', en: 'Create Account' },
  nav_logout: { sw: 'Toka', en: 'Log Out' },
  nav_dashboard: { sw: 'Dashboard', en: 'Dashboard' },
  nav_wallet: { sw: 'Waleti Yangu', en: 'My Wallet' },
  nav_profile: { sw: 'Wasifu', en: 'Profile' },
  nav_history: { sw: 'Historia ya Mazungumzo', en: 'Chat History' },
  nav_notifications: { sw: 'Taarifa', en: 'Notifications' },
  nav_admin: { sw: 'Jopo la Usimamizi', en: 'Admin Panel' },
  nav_slogan: { sw: 'Lipwa kwa kufundisha wazungu kiswahili', en: 'Get paid teaching foreigners Swahili' },

  // Hero Section
  hero_badge: {
    sw: 'Jukwaa Rasmi la Kufundisha Kiswahili na Kulipwa Papo Hapo',
    en: 'Official Conversational Swahili Learning & Reward Platform',
  },
  hero_title_1: { sw: 'Lipwa kwa Kufundisha', en: 'Get Paid Teaching' },
  hero_title_2: { sw: 'Wazungu Kiswahili', en: 'Foreigners Swahili' },
  hero_subtitle: {
    sw: 'Ongea kwa njia ya maandishi au sauti na watalii na wanafunzi wa kimataifa. Pata malipo ya uhakika kwa kila dakika inayokamilika kupitia M-Pesa, Tigo Pesa, Airtel Money au Benki.',
    en: 'Chat via text with tourists and international students. Earn verified payouts for every completed minute directly to M-Pesa, Tigo Pesa, Airtel Money, or Bank.',
  },
  cta_start_now: { sw: 'Anza Kupata Pesa Sasa', en: 'Start Earning Now' },
  cta_browse_learners: { sw: 'Tazama Wageni Waliopo', en: 'Browse Available Learners' },
  stat_rate_title: { sw: 'Kiwango cha Malipo', en: 'Average Hourly Rate' },
  stat_rate_sub: { sw: 'kwa kila saa ya mazungumzo', en: 'per hour of conversation' },
  stat_payout_title: { sw: 'Muda wa Kutoa Pesa', en: 'Withdrawal Speed' },
  stat_payout_sub: { sw: 'M-Pesa / Tigo Pesa (Dakika 2)', en: 'M-Pesa / Tigo Pesa (Instant)' },
  stat_active_title: { sw: 'Wageni Mtandaoni', en: 'Active Foreign Learners' },
  stat_active_sub: { sw: 'Wapo tayari kujifunza sasa', en: 'Ready to practice right now' },

  // How it works
  hiw_title: { sw: 'Jinsi Mfumo Unavyofanya Kazi', en: 'How SWAHILI EARN Works' },
  hiw_subtitle: {
    sw: 'Hatua 4 rahisi kuanzia kujiunga hadi kutoa pesa zako mfukoni',
    en: 'Four straightforward steps from registration to withdrawing your cash',
  },
  hiw_step_1_title: { sw: '1. JISALI UPATE AKAUNTI', en: '1. REGISTER TO GET AN ACCOUNT' },
  hiw_step_1_desc: {
    sw: 'Jiunge kwa namba yako ya simu kwa sekunde chache tu na ufungue akaunti yako ya mazungumzo bila nenosiri gumu.',
    en: 'Join with your phone number in seconds and open your conversation account easily.',
  },
  hiw_step_2_title: { sw: '2. CHAGUA MZUNGU WA KUCHAT NAE', en: '2. CHOOSE A FOREIGNER TO CHAT WITH' },
  hiw_step_2_desc: {
    sw: 'Chagua mwanafunzi au mzungu unayetaka kuongea naye kutoka Marekani, Uingereza, Poland au popote duniani anayetaka kujifunza Kiswahili.',
    en: 'Choose an international learner from the US, UK, Poland, or anywhere who wants to learn Swahili.',
  },
  hiw_step_3_title: { sw: '3. LIPWA KWA MUDA ULIOTUMIA', en: '3. GET PAID FOR TIME SPENT' },
  hiw_step_3_desc: {
    sw: 'Ongea naye kwa njia ya chati. Kila sekunde na dakika inayokamilika inarekodiwa na salio lako linaongezeka mara moja.',
    en: 'Chat with them in real-time. Every completed minute is tracked and your balance increases immediately.',
  },
  hiw_step_4_title: { sw: '4. TOA PESA ZAKO', en: '4. WITHDRAW YOUR CASH' },
  hiw_step_4_desc: {
    sw: 'Hamisha mapato yako moja kwa moja kwenda M-Pesa, Tigo Pesa, Airtel Money au Benki kwa urahisi bila usumbufu.',
    en: 'Transfer your funds directly to M-Pesa, Tigo Pesa, Airtel Money, or Bank smoothly.',
  },
  hiw_activation_notice: {
    sw: 'PESA ZAKO ZITATOKA KIKAMILIFU BAADA YA KULIPIA ACTIVATION / ADA YA KUWEZESHA HUDUMA ZA MIAMALA NA MIFUMO YA KIBENKI KWENYE AKAUNTI YAKO , HALI ITAKAYOKUPA UHURU WA  KUFUNDISHA WAZUNGU WENGI NA KULIPWA PESA NYINGI ZAIDI . PESA YA MTAJI / ACTIVATION NI 16,000/= ( for Tanzania )',
    en: 'YOUR FUNDS WILL BE WITHDRAWN IN FULL AFTER PAYING ACTIVATION / THE FEE TO ENABLE TRANSACTION AND BANKING SYSTEMS ON YOUR ACCOUNT , GIVING YOU THE FREEDOM TO TEACH MORE FOREIGNERS AND EARN MORE MONEY . CAPITAL / ACTIVATION FEE IS 16,000/= ( for Tanzania )',
  },

  // Auth (Login / Register)
  auth_login_title: { sw: 'Jisajili kwenye SWAHILI EARN', en: 'Register to SWAHILI EARN' },
  auth_login_desc: {
    sw: 'Weka namba yako ya simu kuingia moja kwa moja kwenye dashboard yako na kurejesha taarifa zako',
    en: 'Enter your phone number to access your dashboard and restore your information',
  },
  auth_register_title: { sw: 'Jisajili kwenye SWAHILI EARN', en: 'Register to SWAHILI EARN' },
  auth_register_desc: {
    sw: 'Jiunge leo kwa namba ya simu na uanze kulipwa kwa kufundisha wageni Kiswahili',
    en: 'Join today with your phone number and start earning by teaching foreigners Swahili',
  },
  auth_google_signin: { sw: 'Jisajili na Google', en: 'Continue with Google' },
  auth_google_signup: { sw: 'Jisajili na Google', en: 'Continue with Google' },
  auth_or_continue: { sw: 'au endelea na', en: 'or continue with' },
  auth_or_signup: { sw: 'au jisajili moja kwa moja', en: 'or fast sign-up' },
  auth_email_or_phone: { sw: 'Namba ya Simu', en: 'Phone Number' },
  auth_password: { sw: 'Nenosiri', en: 'Password' },
  auth_confirm_password: { sw: 'Thibitisha Nenosiri', en: 'Confirm Password' },
  auth_full_name: { sw: 'Jina Kamili', en: 'Full Name' },
  auth_phone_number: { sw: 'Namba ya Simu ya Malipo (M-Pesa/Tigo Pesa)', en: 'Mobile Money Phone (+255...)' },
  auth_signin_btn: { sw: 'Jisajili & Ingia', en: 'Register & Access' },
  auth_signup_btn: { sw: 'Jisajili Sasa', en: 'Register Now' },
  auth_no_account: { sw: 'Huna akaunti bado?', en: "Don't have an account yet?" },
  auth_has_account: { sw: 'Umeshawahi kujiandikisha?', en: 'Returning user?' },
  auth_accept_terms: { sw: 'Ninakubaliana na Vigezo na Masharti ya mfumo', en: 'I accept the Terms & Conditions governing sessions' },
  auth_accept_privacy: { sw: 'Ninakubaliana na Sera ya Faragha na ulinzi wa data', en: 'I accept the Privacy Policy and database protection' },

  // Dashboard
  dash_welcome: { sw: 'Karibu tena', en: 'Welcome back' },
  dash_activated: { sw: 'Akaunti Imewezeshwa', en: 'Account Activated' },
  dash_pending_act: { sw: 'Inasubiri Uwezeshaji', en: 'Pending Activation' },
  dash_balance: { sw: 'Salio Lililopo', en: 'Available Balance' },
  dash_total_earned: { sw: 'Jumla Uliyopata', en: 'Total Earned' },
  dash_completed_sessions: { sw: 'Vikao Vilivyokamilika', en: 'Completed Sessions' },
  dash_total_duration: { sw: 'Muda wa Mazungumzo', en: 'Total Chat Duration' },
  dash_withdraw_now: { sw: 'Toa Pesa Kwenye Waleti', en: 'Withdraw From Wallet' },
  dash_start_chat: { sw: 'Anza Mazungumzo Mapya', en: 'Start New Session' },
  dash_shortcuts: { sw: 'Njia za Mkato', en: 'Quick Shortcuts' },
  dash_recent_transactions: { sw: 'Miamala ya Hivi Karibuni', en: 'Recent Transactions' },
  dash_activate_banner_title: { sw: 'Washa Waleti Yako ya Malipo', en: 'Activate Your Payment Wallet' },
  dash_activate_banner_desc: {
    sw: 'Ili uweze kutoa pesa zako kwenda M-Pesa au Tigo Pesa, kamilisha ada ya uwezeshaji ya usalama ya TZS 16,000.',
    en: 'To withdraw your earnings to M-Pesa or Tigo Pesa, complete the one-time security activation fee of 16,000 TZS.',
  },
  dash_activate_btn: { sw: 'Washa Sasa Hivi', en: 'Activate Now' },

  // Discover & Chat
  disc_title: { sw: 'Wageni Waliopo Tayari Kujifunza Kiswahili', en: 'Foreign Learners Online & Ready to Learn' },
  disc_subtitle: {
    sw: 'Chagua mwanafunzi na uanze naye mazungumzo ya Kiswahili mara moja.',
    en: 'Choose a partner and begin your conversational Swahili session immediately.',
  },
  disc_rate_tag: { sw: 'TZS / dakika', en: 'TZS / minute' },
  disc_start_button: { sw: 'Anza Kufundisha & Pata Malipo', en: 'Start Teaching & Earn' },
  disc_online: { sw: 'Mtandaoni Sasa', en: 'Online Now' },
  chat_timer: { sw: 'Muda Uliobaki', en: 'Time Remaining' },
  chat_reward: { sw: 'Malipo ya Kikao', en: 'Session Reward' },
  chat_complete_btn: { sw: 'Kamilisha & Dai Malipo', en: 'Complete & Claim Reward' },
  chat_input_placeholder: { sw: 'Andika jibu lako la Kiswahili hapa...', en: 'Type your Swahili reply here...' },
  chat_send: { sw: 'Tuma', en: 'Send' },

  // Withdrawal
  wd_title: { sw: 'Toa Malipo Yako', en: 'Withdraw Your Earnings' },
  wd_subtitle: {
    sw: 'Hamisha pesa zako moja kwa moja kwenda M-Pesa, Tigo Pesa, Airtel Money au Benki',
    en: 'Transfer your funds directly to M-Pesa, Tigo Pesa, Airtel Money, or Bank',
  },
  wd_amount_label: { sw: 'Kiasi cha Kutoa (TZS)', en: 'Withdrawal Amount (TZS)' },
  wd_method_label: { sw: 'Njia ya Malipo', en: 'Payment Method' },
  wd_phone_label: { sw: 'Namba ya Simu ya Kupokelea', en: 'Receiving Mobile Phone' },
  wd_submit_btn: { sw: 'Thibitisha Kutoa Pesa', en: 'Submit Withdrawal Request' },

  // Language selector
  lang_swahili: { sw: 'Kiswahili (Chaguo-msingi)', en: 'Swahili (Default)' },
  lang_english: { sw: 'Kiingereza', en: 'English' },
  lang_switch: { sw: 'Badili Lugha', en: 'Change Language' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to 'sw' (Swahili)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('swahili_earn_lang');
    if (saved === 'en' || saved === 'sw') {
      return saved;
    }
    return 'sw';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('swahili_earn_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations): string => {
    const item = translations[key];
    if (!item) return String(key);
    return item[language] || item.sw || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
