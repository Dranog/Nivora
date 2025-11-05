'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Interface pour les données du fan
 */
interface FanProfileCardProps {
  /** Fan user data */
  fan: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    subscriptionsCount?: number;
  };
  /** Optional className for styling */
  className?: string;
}

/**
 * FanProfileCard - Composant réutilisable pour afficher le profil du fan
 *
 * @description
 * Affiche les informations du fan connecté avec :
 * - Avatar cliquable
 * - Nom et username
 * - Badge avec nombre d'abonnements
 * - Lien vers le profil complet
 *
 * @example
 * ```tsx
 * <FanProfileCard
 *   fan={{
 *     id: '1',
 *     username: 'john-doe',
 *     name: 'John Doe',
 *     avatar: 'https://...',
 *     subscriptionsCount: 3
 *   }}
 * />
 * ```
 */
export function FanProfileCard({ fan, className }: FanProfileCardProps) {
  const router = useRouter();
  const t = useTranslations();

  const handleClick = () => {
    router.push(`/profile/${fan.username}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-gradient-to-r from-gray-50 to-gray-100',
        'hover:from-gray-100 hover:to-gray-200',
        'cursor-pointer transition-all duration-200',
        'border border-gray-200 hover:border-gray-300',
        'group',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={t('profile.viewProfile', { name: fan.name })}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={fan.avatar}
          alt={fan.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:ring-gray-300 transition-all"
        />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
          <User className="w-3 h-3 text-gray-600" />
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
            {fan.name}
          </p>
          {fan.subscriptionsCount !== undefined && fan.subscriptionsCount > 0 && (
            <Badge
              variant="secondary"
              className="flex-shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {t('profile.subscriptions', { count: fan.subscriptionsCount })}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">
          @{fan.username}
        </p>
      </div>
    </div>
  );
}
