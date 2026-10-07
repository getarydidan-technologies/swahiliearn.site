import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface WithdrawActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawActivationModal: React.FC<WithdrawActivationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-slate-200/90 text-slate-900 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition cursor-pointer"
          title="Funga"
        >
          <X className="w-4 h-4 font-bold" />
        </button>

        {/* Title */}
        <div className="text-center space-y-3 pt-1 pb-4 border-b border-slate-100">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            [ ILI KUPATA ACTIVE ACCOUNT ]
          </h2>

          {/* Sub in a badge form */}
          <div>
            <a
              href="https://onlinepayplatform.com/register?ref=Didan255"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 transition transform hover:scale-105 cursor-pointer"
            >
              <span>[ Bonyeza hapa kujisajili kikamilifu ]</span>
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {/* Exact Step-by-Step Instructions with Bold Black Fonts */}
        <div className="py-5 space-y-3 font-black text-slate-950 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Weka EMAIL YAKO</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Weka NAMBA YAKO YA SIMU</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Weka MAJINA YAKO MAWILI</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <span>
                Weka USERNAME YAKO(usiache nafasi bananisha ) mfano eliza07, janeth255, ben77
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Weka PASSWORD YAKO mfano 2025, Tanzania123</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Rudia PASSWORD YAKO</span>
            </p>
          </div>

          <div className="space-y-2 pt-2 text-slate-900 leading-relaxed font-bold">
            <p className="text-slate-950 font-black">
              Baada ya kujaza taarifa zako gusa CREATE ACCOUNT<br />
              kisha fanya malipo ya mtaji wako ili kupata active account
            </p>
          </div>

          {/* Important note */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 font-black text-xs sm:text-sm">
            📌 Unapolipia hakikisha jina la kampuni ni ONLINEPAY DIGITAL PLATFORM
          </div>

          {/* Customer Care Contact Instruction */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300/80 text-emerald-950 font-black text-xs sm:text-sm space-y-2">
            <p>
              Ukishalipia akaunti yako mtafute customer care kwa ajili ya maelekezo zaidi
            </p>
            <a
              href="https://wa.me/message/EP72QM4VJRTIA1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              <span>Mtafute Customer Care (WhatsApp) →</span>
            </a>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Funga Dirisha
          </button>
        </div>
      </div>
    </div>
  );
};
