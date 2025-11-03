'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    // Update cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Reload to apply
    router.refresh();
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage?.flag} {currentLanguage?.label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={locale === lang.code ? 'bg-gray-100' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
