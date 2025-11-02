import React from 'react';
import { useStore } from '../lib/store';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useStore();

  return (
    <div className={`inline-flex items-center ${compact ? '' : 'bg-gray-100'} rounded-lg p-0.5`} aria-label="Language selector">
      <div className="px-1 text-gray-500 hidden sm:inline-flex items-center">
        <Globe className="w-4 h-4" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 text-xs rounded-md transition ${language === 'en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`ml-1 px-2.5 py-1.5 text-xs rounded-md transition ${language === 'th' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        aria-pressed={language === 'th'}
      >
        TH
      </button>
    </div>
  );
}

