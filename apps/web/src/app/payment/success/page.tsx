'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    // Countdown pour redirection automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icône de succès animée */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto relative animate-bounce" />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Paiement Réussi !
        </h1>

        {/* Message de succès */}
        <p className="text-gray-600 mb-6">
          Votre transaction a été effectuée avec succès. Merci de votre soutien !
        </p>

        {/* Détails de la transaction */}
        {subscriptionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <p className="text-gray-500 mb-1">ID de transaction</p>
            <p className="text-gray-900 font-mono text-xs break-all">
              {subscriptionId}
            </p>
          </div>
        )}

        {/* Informations */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-left text-sm">
              <p className="font-medium text-gray-900 mb-1">
                Votre contenu est maintenant disponible !
              </p>
              <p className="text-gray-600 text-xs">
                Les tips apparaîtront dans les commentaires et le contenu déverrouillé est accessible immédiatement.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#00B8A9] to-[#009B8E] hover:opacity-90"
            size="lg"
          >
            <Link href="/">
              <ArrowRight className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>

          <p className="text-xs text-gray-500">
            Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Un reçu a été envoyé à votre adresse email.
            <br />
            En cas de question, contactez{' '}
            <a href="mailto:support@yoursite.com" className="text-[#00B8A9] hover:underline">
              support@yoursite.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
