# 🎯 PROMPT CLAUDE DEV - Finalisation 100% Intégration CCBill Frontend

## 🎯 Objectif

Finaliser complètement le code frontend pour l'intégration CCBill afin qu'il ne reste plus qu'à :
1. Brancher les credentials CCBill (variables d'env)
2. Tester avec la carte de test
3. Déployer en production

**Résultat attendu** : Code 100% prêt, testable en mode simulation

## 📋 Tâches à Accomplir

### 1. Mettre à Jour TipModal (Remplacer Stripe → CCBill)

**Fichier** : `apps/web/src/components/posts/TipModal.tsx`

**Modifications** :

```tsx
// AVANT (chercher ces lignes)
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

// Remplacer par
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout';

// DANS le composant
// AVANT
const { createTipCheckout } = useStripeCheckout();

// APRÈS
const { createTipCheckout } = useCCBillCheckout();

// Le reste du code reste IDENTIQUE
```

**Code complet du composant** (si besoin de réécrire) :

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout';
import { toast } from 'sonner';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  onTipSuccess?: () => void;
}

export function TipModal({ isOpen, onClose, creator, onTipSuccess }: TipModalProps) {
  const [tipAmount, setTipAmount] = useState<number>(10);
  const [tipMessage, setTipMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTipCheckout } = useCCBillCheckout();

  const predefinedAmounts = [5, 10, 20, 50, 100];

  const handleTipSubmit = async () => {
    if (!tipAmount || tipAmount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    if (tipAmount < 1) {
      toast.error('Le montant minimum est de 1€');
      return;
    }

    if (tipAmount > 10000) {
      toast.error('Le montant maximum est de 10,000€');
      return;
    }

    setIsSubmitting(true);

    try {
      // Redirection automatique vers CCBill
      await createTipCheckout(creator.id, tipAmount, tipMessage);
      
      // Note: La redirection se fait avant ce point
      // Ces lignes ne seront exécutées qu'en cas d'erreur
    } catch (error) {
      console.error('Error creating tip checkout:', error);
      toast.error('Erreur lors de la création du paiement');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Envoyer un Tip à {creator.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Montants prédéfinis */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Montant rapide
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={tipAmount === amount ? 'default' : 'outline'}
                  onClick={() => setTipAmount(amount)}
                  className="w-full"
                >
                  {amount}€
                </Button>
              ))}
            </div>
          </div>

          {/* Montant personnalisé */}
          <div>
            <label htmlFor="tipAmount" className="text-sm font-medium mb-2 block">
              Montant personnalisé (€)
            </label>
            <Input
              id="tipAmount"
              type="number"
              min="1"
              max="10000"
              step="1"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
              placeholder="10"
              className="w-full"
            />
          </div>

          {/* Message optionnel */}
          <div>
            <label htmlFor="tipMessage" className="text-sm font-medium mb-2 block">
              Message (optionnel)
            </label>
            <Textarea
              id="tipMessage"
              value={tipMessage}
              onChange={(e) => setTipMessage(e.target.value)}
              placeholder="Merci pour ton contenu !"
              maxLength={200}
              rows={3}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {tipMessage.length}/200 caractères
            </p>
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total à payer</span>
              <span className="text-2xl font-bold text-yellow-600">
                {tipAmount}€
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Paiement sécurisé via CCBill
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleTipSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Redirection...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Envoyer {tipAmount}€
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Mettre à Jour LockedPostOverlay (Remplacer Stripe → CCBill)

**Fichier** : `apps/web/src/components/posts/LockedPostOverlay.tsx`

**Modifications** :

```tsx
// AVANT
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

// APRÈS
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout';

// DANS le composant
// AVANT
const { createUnlockCheckout } = useStripeCheckout();

// APRÈS
const { createUnlockCheckout } = useCCBillCheckout();
```

**Code complet du composant** :

```tsx
'use client';

import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout';
import { toast } from 'sonner';

interface LockedPostOverlayProps {
  post: {
    id: string;
    unlockPrice: number;
    tier?: string;
  };
  onUnlockSuccess?: () => void;
}

export function LockedPostOverlay({ post, onUnlockSuccess }: LockedPostOverlayProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { createUnlockCheckout } = useCCBillCheckout();

  const handleUnlock = async () => {
    setIsUnlocking(true);

    try {
      // Redirection automatique vers CCBill
      await createUnlockCheckout(post.id);
      
      // Note: La redirection se fait avant ce point
    } catch (error) {
      console.error('Error unlocking post:', error);
      toast.error('Erreur lors du déverrouillage');
      setIsUnlocking(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-10 rounded-lg">
      <div className="text-center text-white p-8 max-w-sm">
        <div className="mb-6">
          <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h3 className="text-2xl font-bold mb-2">Contenu VIP</h3>
          <p className="text-sm text-gray-300 mb-4">
            Déverrouillez ce contenu exclusif pour y accéder
          </p>
        </div>

        {post.tier && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">
              {post.tier === 'vip' ? 'VIP' : post.tier === 'qa' ? 'Q&A' : 'Premium'}
            </span>
          </div>
        )}

        <div className="mb-6">
          <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {post.unlockPrice}€
          </div>
          <p className="text-xs text-gray-400">Paiement unique</p>
        </div>

        <Button
          onClick={handleUnlock}
          disabled={isUnlocking}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg"
          size="lg"
        >
          {isUnlocking ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Redirection vers le paiement...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Déverrouiller maintenant
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Paiement sécurisé via CCBill
        </p>
      </div>
    </div>
  );
}
```

### 3. Créer Page Success

**Fichier** : `apps/web/src/app/payment/success/page.tsx`

```tsx
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
```

### 4. Créer Page Cancel

**Fichier** : `apps/web/src/app/payment/cancel/page.tsx`

```tsx
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
```

### 5. Ajouter Mode Simulation au Hook

**Fichier** : `apps/web/src/hooks/useCCBillCheckout.ts`

Ajouter un mode simulation pour tester sans CCBill :

```typescript
import { toast } from 'sonner';

// Mode simulation (pour développement sans CCBill)
const SIMULATION_MODE = process.env.NEXT_PUBLIC_CCBILL_SIMULATION === 'true';

export const useCCBillCheckout = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const createTipCheckout = async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    // Mode simulation
    if (SIMULATION_MODE) {
      toast.info('Mode simulation activé');
      console.log('Simulation: Tip checkout créé', {
        creatorId,
        amount,
        message,
      });
      
      // Simuler redirection après 1 seconde
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = `/payment/success?subscription_id=sim_${Date.now()}`;
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Vous devez être connecté pour envoyer un tip');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/ccbill/create-tip-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ creatorId, amount, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirection vers CCBill
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating CCBill checkout:', error);
      toast.error('Erreur lors de la création du paiement');
      throw error;
    }
  };

  const createUnlockCheckout = async (postId: string) => {
    // Mode simulation
    if (SIMULATION_MODE) {
      toast.info('Mode simulation activé');
      console.log('Simulation: Unlock checkout créé', { postId });
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = `/payment/success?subscription_id=sim_unlock_${Date.now()}`;
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Vous devez être connecté pour déverrouiller du contenu');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/ccbill/create-unlock-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating unlock checkout:', error);
      toast.error('Erreur lors du déverrouillage');
      throw error;
    }
  };

  return {
    createTipCheckout,
    createUnlockCheckout,
  };
};
```

### 6. Créer Template Variables d'Environnement

**Fichier** : `apps/web/.env.example`

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# CCBill Simulation Mode (pour dev sans CCBill)
# true = simulation locale, false = vraie intégration CCBill
NEXT_PUBLIC_CCBILL_SIMULATION=false

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Fichier** : `apps/api/.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET=your_jwt_secret_here

# CCBill Credentials (obtenir sur https://admin.ccbill.com)
CCBILL_ACCOUNT_NUMBER=123456
CCBILL_SUBACCOUNT_NUMBER=0000
CCBILL_FORM_NAME=your_form_name
CCBILL_SALT=your_secret_salt_from_ccbill
CCBILL_API_TOKEN=your_api_token_optional

# Frontend URL (pour redirections)
FRONTEND_URL=http://localhost:3000
```

### 7. Créer Guide de Test

**Fichier** : `TESTING_GUIDE.md`

```markdown
# 🧪 Guide de Test CCBill

## Mode Simulation (Sans CCBill)

Pour tester l'UI sans compte CCBill :

1. Activer le mode simulation :
```bash
# apps/web/.env.local
NEXT_PUBLIC_CCBILL_SIMULATION=true
```

2. Lancer les serveurs :
```bash
pnpm dev
```

3. Tester les flows :
   - Cliquer "Envoyer un Tip" → Devrait simuler et rediriger vers /payment/success
   - Cliquer "Déverrouiller" → Même comportement
   - Vérifier la page success
   - Tester la page cancel

## Tests Avec CCBill (Après Configuration)

### 1. Configuration Préalable

```bash
# apps/api/.env
CCBILL_ACCOUNT_NUMBER=123456
CCBILL_SUBACCOUNT_NUMBER=0000
CCBILL_FORM_NAME=test_form
CCBILL_SALT=your_salt_here
FRONTEND_URL=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_CCBILL_SIMULATION=false
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. Test Tip

1. Ouvrir un post
2. Cliquer "💰 Envoyer un Tip"
3. Saisir montant (€10) et message
4. Cliquer "Envoyer"
5. → Devrait rediriger vers CCBill
6. Utiliser carte test CCBill :
   - **Numéro** : 4539791001730106
   - **Expiration** : 01/2030
   - **CVV** : 123
7. Compléter le paiement
8. → Devrait revenir sur /payment/success
9. Vérifier que le tip apparaît dans les commentaires

### 3. Test Unlock

1. Voir un post verrouillé (avec overlay flou)
2. Cliquer "🔓 Déverrouiller maintenant"
3. → Redirection vers CCBill
4. Payer avec carte test
5. → Retour sur /payment/success
6. Rafraîchir la page
7. → Le post devrait être déverrouillé et visible

### 4. Test Webhook (Backend)

Vérifier que le postback fonctionne :

```bash
# Logs backend
cd apps/api
pnpm dev

# Après un paiement, devrait voir :
# "CCBill Postback received: { subscription_id: '...', ... }"
# "Tip created: ..."
# "Comment created: ..."
```

## Checklist de Test Complet

### Frontend
- [ ] TipModal s'ouvre correctement
- [ ] Montants prédéfinis fonctionnent
- [ ] Montant personnalisé accepté
- [ ] Message optionnel sauvegardé
- [ ] Validation min/max montant
- [ ] Redirection CCBill fonctionne
- [ ] LockedPostOverlay s'affiche
- [ ] Bouton déverrouillage fonctionne
- [ ] Page /payment/success s'affiche
- [ ] Page /payment/cancel s'affiche
- [ ] Countdown redirection fonctionne

### Backend
- [ ] POST /create-tip-checkout retourne URL
- [ ] POST /create-unlock-checkout retourne URL
- [ ] POST /postback reçu
- [ ] Signature postback vérifiée
- [ ] Tip créé en DB
- [ ] Comment créé (type: 'tip')
- [ ] UnlockedPost créé en DB
- [ ] Ledger entries créés

### Mode Simulation
- [ ] NEXT_PUBLIC_CCBILL_SIMULATION=true fonctionne
- [ ] Toast "Mode simulation" affiché
- [ ] Redirection success simulée
- [ ] Logs console visibles

### Intégration CCBill
- [ ] Variables d'env configurées
- [ ] FlexForms CCBill créés
- [ ] Webhooks configurés
- [ ] Carte test fonctionne
- [ ] Postback reçu par backend
- [ ] Transaction visible dans CCBill Admin
- [ ] Tip s'affiche dans UI
- [ ] Post déverrouillé accessible

## Troubleshooting

### "Mode simulation" ne se désactive pas
→ Vérifier `NEXT_PUBLIC_CCBILL_SIMULATION=false` dans .env.local
→ Rebuild : `pnpm build`

### Redirection CCBill ne fonctionne pas
→ Vérifier variables CCBILL_* dans apps/api/.env
→ Vérifier form_name correspond à CCBill Admin

### Postback non reçu
→ Vérifier URL publique (ngrok en dev)
→ Vérifier logs backend
→ Tester manuellement avec curl

### Tip n'apparaît pas
→ Vérifier logs backend (tip créé ?)
→ Vérifier postback reçu et vérifié
→ Rafraîchir la page

## Prochaines Étapes

Une fois tous les tests passés :
1. Déployer en staging
2. Tester avec vraies cartes (petits montants)
3. Configurer monitoring (Sentry)
4. Go live production !
```

## ✅ Checklist de Finalisation

Après avoir appliqué toutes ces modifications :

**Frontend** :
- [ ] TipModal mis à jour (useCCBillCheckout)
- [ ] LockedPostOverlay mis à jour (useCCBillCheckout)
- [ ] Page /payment/success créée
- [ ] Page /payment/cancel créée
- [ ] Mode simulation ajouté au hook
- [ ] .env.example créé

**Backend** :
- [ ] .env.example créé avec toutes les variables

**Documentation** :
- [ ] TESTING_GUIDE.md créé
- [ ] Instructions mode simulation
- [ ] Instructions tests avec CCBill
- [ ] Checklist complète

**Build & Test** :
- [ ] `pnpm build` réussit (frontend)
- [ ] `pnpm build` réussit (backend)
- [ ] Mode simulation fonctionne
- [ ] Pages success/cancel accessibles

## 🎯 Résultat Final

Après ces modifications, le projet sera **100% prêt** :
1. ✅ Code complet et fonctionnel
2. ✅ Mode simulation pour dev
3. ✅ Pages success/cancel
4. ✅ Templates .env
5. ✅ Guide de test complet
6. ✅ Prêt pour brancher CCBill

**Il ne restera plus qu'à** :
1. Copier .env.example → .env
2. Ajouter credentials CCBill (quand reçus)
3. Passer SIMULATION=false
4. Tester avec carte test
5. Deploy ! 🚀

**Code 100% production-ready !** ✨
