import React from 'react';
import { ShieldAlert, ArrowLeft, Info, FileText } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (tab: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0066FF] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A00] uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last Updated: October 2026 · SWAHILI EARN Platform Agreement
          </p>
        </div>

        {/* High Priority Disclosures Box */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <Info className="w-4 h-4" />
            <span>Essential Disclosures & Transparency Notice</span>
          </div>
          <p>
            Please read these terms carefully before participating. Conversational learner profiles featured on SWAHILI EARN are simulated educational learner personas powered by automated conversational AI systems. Rewards credited to your ledger are conditional upon genuine session completion, identity compliance, and applicable activation requirements.
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Account Requirements & Registration</h2>
            <p>
              Users must be at least 18 years of age and reside in a territory where mobile money payouts are permitted. You agree to provide accurate registration details (Full Name, Phone Number, Email) and to maintain the confidentiality of your login credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Chat Service Rules & AI Conversational Personas</h2>
            <p>
              SWAHILI EARN provides an interactive environment where users practice teaching Swahili. <strong>Disclosure:</strong> The conversation partner profiles (including Eliza, Mark, Sarah) utilize automated conversational artificial intelligence (AI) agents programmed with learner backstories. They are not living human persons. Users agree not to send offensive, defamatory, or abusive messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Reward Eligibility & Session Completion Rules</h2>
            <p>
              Rewards (e.g. 60,000 – 80,000 TZS per session) are only credited upon the genuine, unbroken completion of the backend-synchronized session timer (standard duration: 10 minutes). Sessions terminated prematurely or disconnected do not accrue rewards. Client-side browser tampering, automated script messaging, or clock manipulation are strictly prohibited and result in immediate session invalidation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Withdrawal Requirements & Account Activation Fee</h2>
            <p>
              To initiate cash withdrawals to mobile money networks (M-Pesa, Airtel Money, Tigo Pesa), your account must be verified. <strong>An account activation fee of TZS 16,000</strong> is required before withdrawal access is granted. This fee covers anti-money-laundering (AML) verification and third-party gateway licensing.
            </p>
            <p>
              Visiting the activation partner website does not automatically mark an account as activated. Activation requires verified receipt confirmation by our backend.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Payment Terms & Refund Conditions</h2>
            <p>
              The TZS 16,000 activation fee is a non-refundable administrative verification cost once processed by the payment provider. In the event of an erroneous or duplicate payment, submit a support ticket within 48 hours with proof of transaction for administrative review.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Account Suspension & Prohibited Activities</h2>
            <p>
              SWAHILI EARN reserves the right to immediately suspend accounts involved in fraudulent activity, multiple unauthorized accounts per individual, spamming, reverse-engineering of backend APIs, or abuse of the chat translation system.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">7. Changes to Services & Terms</h2>
            <p>
              We reserve the right to modify session rewards, available learner personas, and platform features. Updated terms will be posted with revision timestamps. Continued use of SWAHILI EARN constitutes acceptance of all updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
