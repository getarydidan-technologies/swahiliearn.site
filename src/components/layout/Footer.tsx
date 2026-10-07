import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Heart, Lock, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Logo } from '../common/Logo';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [socialSettings, setSocialSettings] = useState<Record<string, string>>({
    instagram_url: 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3',
    tiktok_url: 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA',
    facebook_url: 'https://www.facebook.com/share/1HgRiAX6J2/',
    sponsor_url: 'https://onlinepay-d7wjpyve.manus.space/',
  });

  useEffect(() => {
    api.getPublicSettings()
      .then((res) => {
        if (res.settings) {
          setSocialSettings((prev) => ({ ...prev, ...res.settings }));
        }
      })
      .catch(() => {});
  }, []);
  return (
    <footer className="w-full bg-[#001D4A] text-white pt-14 pb-8 border-t border-[#003B99]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-blue-900/60">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SWAHILI EARN
                <span className="h-2 w-2 rounded-full bg-[#FF7A00]"></span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed max-w-sm">
              Lipwa kwa kufundisha wazungu kiswahili na ulipwe. Jukwaa halali la kuunganisha vijana wa Kiafrika na wageni wanaojifunza Kiswahili.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-blue-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                BRELA 712919
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#FF7A00] font-semibold">
                <Sparkles className="w-4 h-4" />
                TRA Verified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Urambazaji
            </h4>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Nyumbani
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Jinsi Inavyofanya Kazi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discover')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Wageni Waliopo Mtandaoni
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Msaada & Mawasiliano
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & FAQ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Sheria & Msaada
            </h4>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Maswali Yanayoulizwa (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sera ya Faragha
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Vigezo na Masharti
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links (FOLLOW US ON) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>FOLLOW US ON</span>
            </h4>
            <div className="space-y-2.5">
              {/* Instagram */}
              <a
                href={socialSettings.instagram_url || 'https://www.instagram.com/odp_tanzania?stkn=c3M0aDFiajM3Z3J3'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 text-xs font-bold text-blue-100 hover:text-white transition group"
              >
                <svg className="w-4 h-4 fill-current text-pink-400 group-hover:scale-110 transition" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              {/* TikTok */}
              <a
                href={socialSettings.tiktok_url || 'https://www.tiktok.com/@swahiliearn.site?_r=1&_t=ZS-9AKTTdEWwMA'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 text-xs font-bold text-blue-100 hover:text-white transition group"
              >
                <svg className="w-4 h-4 fill-current text-cyan-300 group-hover:scale-110 transition" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>TikTok</span>
              </a>

              {/* Facebook */}
              <a
                href={socialSettings.facebook_url || 'https://www.facebook.com/share/1HgRiAX6J2/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 text-xs font-bold text-blue-100 hover:text-white transition group"
              >
                <svg className="w-4 h-4 fill-current text-blue-400 group-hover:scale-110 transition" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sponsor Banner (Glowing in Light Orange) */}
        <div className="pt-6 pb-4 text-center">
          <p className="text-xs text-blue-200">
            Jukwaa hili linawezeshwa na:{' '}
            <a
              href={socialSettings.sponsor_url || 'https://onlinepay-d7wjpyve.manus.space/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#FFB066] hover:text-[#FFA040] font-black text-sm tracking-wide transition-all uppercase drop-shadow-[0_0_14px_rgba(255,160,64,0.9)] underline decoration-amber-400 underline-offset-4"
            >
              sponsored by ONLINEPAY DIGITAL PLATFORM
            </a>
          </p>
        </div>

        {/* Bottom Bar with Admin Log In Icon */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300 border-t border-blue-900/40">
          <p>© 2026 SWAHILI EARN. Haki zote zimehifadhiwa.</p>

          <div className="flex items-center gap-5">
            <p className="hidden md:flex items-center gap-1 text-blue-400">
              Imetengenezwa kwa ajili ya vijana wa Afrika Mashariki
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            </p>

            {/* ADMIN LOG IN BUTTON CHINI KABISA */}
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/90 hover:bg-blue-900 border border-blue-700/80 text-[11px] font-bold text-amber-300 hover:text-white transition shadow-sm cursor-pointer tracking-wider"
              title="Kuingia kwenye Jopo la Msimamizi Mkuu (Admin)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN LOG IN</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
