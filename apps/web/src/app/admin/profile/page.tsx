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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Link2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Save,
} from 'lucide-react';

// Zod Schema
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  avatarType: z.enum(['upload', 'url']),
  avatarUrl: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If any password field is filled, all must be filled
  const hasAnyPassword = data.currentPassword || data.newPassword || data.confirmPassword;
  if (hasAnyPassword) {
    return data.currentPassword && data.newPassword && data.confirmPassword;
  }
  return true;
}, {
  message: 'Tous les champs mot de passe sont requis si vous souhaitez changer votre mot de passe',
  path: ['currentPassword'],
}).refine((data) => {
  // Validate new password strength if provided
  if (data.newPassword) {
    const hasUpperCase = /[A-Z]/.test(data.newPassword);
    const hasNumber = /[0-9]/.test(data.newPassword);
    const hasMinLength = data.newPassword.length >= 8;
    return hasUpperCase && hasNumber && hasMinLength;
  }
  return true;
}, {
  message: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre',
  path: ['newPassword'],
}).refine((data) => {
  // Check passwords match if new password is provided
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userJson = localStorage.getItem('admin_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  };

  const user = getUserFromStorage();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      avatarType: 'upload',
      avatarUrl: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  // Avatar upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format invalide. Utilisez JPG, PNG ou WebP uniquement');
      return;
    }

    // Size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (maximum 5MB)');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    toast.success('Photo sélectionnée');
  };

  // Form submit
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setIsUploading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update localStorage (in production, this would come from API response)
      const updatedUser = {
        ...user,
        displayName: data.name,
        avatar: data.avatarType === 'url' && data.avatarUrl ? data.avatarUrl : avatarPreview,
      };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));

      toast.success('Profil mis à jour avec succès');

      // Clear password fields
      form.setValue('currentPassword', '');
      form.setValue('newPassword', '');
      form.setValue('confirmPassword', '');

      // Refresh to update sidebar
      router.refresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Photo de Profil</CardTitle>
              <CardDescription>
                Choisissez une photo de profil (JPG, PNG ou WebP - max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" onClick={() => form.setValue('avatarType', 'upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" onClick={() => form.setValue('avatarType', 'url')}>
                    <Link2 className="w-4 h-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-2xl">
                          {user?.displayName?.slice(0, 2).toUpperCase() || 'AD'}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploading}
                        aria-label="Upload avatar"
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={isUploading}
                        >
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choisir un fichier
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500">JPG, PNG ou WebP - Maximum 5MB</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'avatar</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setAvatarPreview(e.target.value);
                              }}
                              disabled={isLoading}
                              aria-label="Avatar URL"
                            />
                            {field.value && (
                              <div className="flex justify-center">
                                <Avatar className="w-32 h-32">
                                  <AvatarImage src={field.value} />
                                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-2xl">
                                    <User className="w-16 h-16" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Mettez à jour votre nom et email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom Complet *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Votre nom complet"
                          className="pl-10"
                          {...field}
                          disabled={isLoading}
                          aria-label="Full name"
                          aria-required="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          className="pl-10 bg-gray-50"
                          {...field}
                          disabled
                          readOnly
                          aria-label="Email address"
                          aria-readonly="true"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Votre email ne peut pas être modifié
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Changer le Mot de Passe</CardTitle>
              <CardDescription>
                Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de Passe Actuel</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                          disabled={isLoading}
                          aria-label="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau Mot de Passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                          disabled={isLoading}
                          aria-label="New password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Minimum 8 caractères, 1 majuscule et 1 chiffre
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le Mot de Passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                          disabled={isLoading}
                          aria-label="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
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
              disabled={isLoading || isUploading}
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
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
