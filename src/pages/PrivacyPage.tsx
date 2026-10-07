import React from 'react';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (tab: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Compliance & Security
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Effective Date: October 2026 · SWAHILI EARN Platform
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              SWAHILI EARN collects account registration details, including your Full Name, Email Address, and Phone Number (used for mobile money disbursements). When you participate in chat tutoring sessions, chat logs, session durations, timestamps, and reward calculations are recorded securely in our relational database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Why Information Is Collected</h2>
            <p>
              Your information is collected solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Facilitate language learning conversations with international learner personas.</li>
              <li>Accurately verify completed 10-minute sessions and calculate reward ledgers.</li>
              <li>Disburse withdrawal requests to your authorized mobile network provider.</li>
              <li>Prevent fraud, bot manipulation, or duplicate reward claims.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Non-Disclosure & Public Privacy</h2>
            <p>
              We enforce strict confidentiality: <strong>users' personal information, phone numbers, and full names are NEVER exposed publicly</strong> or shared with third-party advertisers. All database records are protected with restricted backend authentication middleware.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Payment & Mobile Money Data</h2>
            <p>
              Payment data for withdrawals (such as your phone number and selected mobile provider) is processed strictly for disbursement execution. We do not store raw credit card numbers or banking passwords.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Data Retention & User Rights</h2>
            <p>
              You maintain full rights to request correction, review, or deletion of your account records. Inactive or requested deletions are purged from active server stores within 30 days, subject to legal financial transaction record-keeping requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Contact Information</h2>
            <p>
              For privacy inquiries, contact our Data Protection Officer at: <strong className="text-slate-900">privacy@swahiliearn.com</strong> or via the in-app Support ticket system.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
