import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  MessageCircle,
  Phone,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (tab: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'JE HII FURSA NI UTAPELI ?',
      a: 'swahili earn ni fursa hali ambayo ipo chini ya kampuni halali ya onlinepay platform iliosajiliwa na BRELA , kwa usajili wa namba 712919 . lakini pia platform yetu inalipia ushuru wa akaunti active za wateja wake kwenye shirika la kodi TRA',
    },
    {
      q: 'KWANINI NALIPA MTAJI WA 16,000/= NDO NITOE PESA ZANGU',
      a: 'Unalipia mtaji au activation fee ya 16,000/= ili kuwezesha mifumo ya miamala na kibenki ya kampuni ili iweze kufanya kazi kwa uhalali na ufanisi mkubwa wakati wa kufanya miamala yako kutoka kwenye waleti yako . lakini pia ni pamoja na kulipia kodi / ushuru wa TRA kwa ajili ya akaunt yako kuweza kufanya kazi kwa muda mrefu na kihalali na kupata pesa nyingi',
    },
    {
      q: 'MFUMO WENU UNAFANYAJE KAZI',
      a: 'Platform ya Onlinepay digital imetengeza fursa hii kwa vijana . kwa kuunganisha wazungu / watalii / pamoja na raia wa kigeni wanaotaka kujifunza kiswahili kwenye site hii ya SWAHILI EARN . wazungu hao wanalipia pesa ya kujifunza kiswahili kupitia watu wanaojua vizuri lugha ya kiswahili ambao ni vijana wa kiafrica ambao hawana fursa za kipato au ajira na kulipwa pesa nyingi kupitia smartphone zao na mtandao pekee',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            Msaada & Maswali Yanayoulizwa Mara kwa Mara
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            SWAHILI EARN Support & FAQ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pata majibu ya moja kwa moja kuhusu uhalali wa mfumo, mtaji wa akaunti, na jinsi unavyopata mapato.
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Maswali Muhimu (FAQ)</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="liquid-glass rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#0066FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3.5 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Care Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0066FF] shadow-[0_0_30px_rgba(0,102,255,0.25)] space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-black tracking-wider uppercase">
              Huduma Rasmi
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              [ HUDUMA KWA WATEJA / CUSTOMER CARE ]
            </h3>
            <p className="text-xs text-slate-500">
              Wasiliana nasi moja kwa moja kwa njia zifuatazo kupata msaada wa haraka:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* WhatsApp */}
            <a
              href="https://wa.me/message/EP72QM4VJRTIA1"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition flex flex-col items-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase text-emerald-900 tracking-wider">
                WHATSAPP
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Customer Care WhatsApp
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                Bonyeza hapa kuanza chati papo hapo
              </span>
            </a>

            {/* Normal SMS */}
            <a
              href="sms:0743697677"
              className="p-5 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition flex flex-col items-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                TUMA NORMAL TEXT / SMS
              </span>
              <span className="text-xs font-bold text-[#0066FF] font-mono">
                0743 697 677
              </span>
              <span className="text-[11px] text-blue-600 font-medium">
                Tuma ujumbe mfupi wa kawaida
              </span>
            </a>

            {/* WhatsApp Channel */}
            <a
              href="https://whatsapp.com/channel/0029VbEGCJ3EgGfNE6THN73q"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition flex flex-col items-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
                <Radio className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                FOLLOW CHANNEL YETU
              </span>
              <span className="text-xs font-bold text-amber-700">
                Swahili Earn Updates
              </span>
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <span>Jiunge kupata miongozo mipya</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
