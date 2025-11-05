'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icône d'annulation */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
          <XCircle className="w-24 h-24 text-orange-500 mx-auto relative" />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Paiement Annulé
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Vous avez annulé le paiement. Aucun montant n'a été débité.
        </p>

        {/* Informations */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-left text-sm">
              <p className="font-medium text-gray-900 mb-1">
                Vous avez changé d'avis ?
              </p>
              <p className="text-gray-600 text-xs">
                Vous pouvez réessayer à tout moment. Aucun frais n'a été appliqué.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-[#00B8A9] to-[#009B8E] hover:opacity-90"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Réessayer
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-3">
            Questions fréquentes
          </p>
          <div className="text-left space-y-2 text-xs text-gray-600">
            <details className="cursor-pointer">
              <summary className="font-medium text-gray-700 hover:text-gray-900">
                Pourquoi mon paiement a-t-il été refusé ?
              </summary>
              <p className="mt-2 pl-4">
                Vérifiez que votre carte a des fonds suffisants et que les paiements internationaux sont autorisés.
              </p>
            </details>
            <details className="cursor-pointer">
              <summary className="font-medium text-gray-700 hover:text-gray-900">
                Puis-je utiliser une autre méthode de paiement ?
              </summary>
              <p className="mt-2 pl-4">
                Nous acceptons toutes les cartes Visa, Mastercard et American Express.
              </p>
            </details>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Besoin d'aide ?{' '}
            <a href="mailto:support@yoursite.com" className="text-[#00B8A9] hover:underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
