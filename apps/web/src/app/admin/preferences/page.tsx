'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Bell,
  BellRing,
  Layout,
  Settings,
} from 'lucide-react';

// Zod Schema
const preferencesSchema = z.object({
  language: z.enum(['fr', 'en', 'es', 'de']),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  compactMode: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

// Language options
const LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function AdminPreferencesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get current locale from cookie
  const getCurrentLocale = (): 'fr' | 'en' | 'es' | 'de' => {
    if (typeof document === 'undefined') return 'fr';
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1].trim();
      if (['fr', 'en', 'es', 'de'].includes(locale)) {
        return locale as 'fr' | 'en' | 'es' | 'de';
      }
    }
    return 'fr';
  };

  // Get preferences from localStorage
  const getPreferencesFromStorage = () => {
    try {
      const prefsJson = localStorage.getItem('admin_preferences');
      return prefsJson ? JSON.parse(prefsJson) : null;
    } catch {
      return null;
    }
  };

  const savedPreferences = getPreferencesFromStorage();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: savedPreferences?.language || getCurrentLocale(),
      emailNotifications: savedPreferences?.emailNotifications ?? true,
      pushNotifications: savedPreferences?.pushNotifications ?? true,
      compactMode: savedPreferences?.compactMode ?? false,
    },
  });

  // Form submit
  const onSubmit = async (data: PreferencesFormValues) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save to localStorage
      localStorage.setItem('admin_preferences', JSON.stringify(data));

      // Update locale cookie if language changed
      if (data.language !== getCurrentLocale()) {
        document.cookie = `NEXT_LOCALE=${data.language}; path=/; max-age=31536000`;
        toast.success('Préférences enregistrées. Rechargement de la page pour appliquer la langue...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.success('Préférences enregistrées avec succès');
      }

      router.refresh();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement des préférences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préférences</h1>
          <p className="text-gray-500 mt-1">Personnalisez votre expérience admin</p>
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Language Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-500" />
                <CardTitle>Langue</CardTitle>
              </div>
              <CardDescription>
                Sélectionnez votre langue préférée pour l'interface admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue de l'interface</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Select language">
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      La page sera rechargée pour appliquer la nouvelle langue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-500" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Gérez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <FormLabel className="text-base font-medium">
                          Notifications Email
                        </FormLabel>
                      </div>
                      <FormDescription>
                        Recevez des notifications par email pour les événements importants
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        aria-label="Toggle email notifications"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-gray-500" />
                        <FormLabel className="text-base font-medium">
                          Notifications Push
                        </FormLabel>
                      </div>
                      <FormDescription>
                        Recevez des notifications push dans votre navigateur
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        aria-label="Toggle push notifications"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Display Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-cyan-500" />
                <CardTitle>Affichage</CardTitle>
              </div>
              <CardDescription>
                Personnalisez l'affichage des tableaux et listes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-gray-500" />
                        <FormLabel className="text-base font-medium">
                          Mode Compact
                        </FormLabel>
                      </div>
                      <FormDescription>
                        Affiche plus de données en réduisant l'espacement dans les tableaux
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        aria-label="Toggle compact mode"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les préférences
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
