import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string; nativeName: string }[] = [
    {
      code: 'sw',
      label: 'Kiswahili',
      flag: '🇹🇿',
      nativeName: 'Chaguo-msingi (Default)',
    },
    {
      code: 'en',
      label: 'English',
      flag: '🇬🇧',
      nativeName: 'English Language',
    },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
        title={t('lang_switch')}
        aria-label="Select language"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="font-semibold">{currentLang.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-[#0066FF]" />
            <span>{t('lang_switch')}</span>
          </div>

          <div className="p-1 space-y-0.5">
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-[#0066FF] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div>
                      <div className="font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        {item.nativeName}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0066FF]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
