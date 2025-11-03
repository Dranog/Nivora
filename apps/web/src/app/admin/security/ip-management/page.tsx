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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Loader2,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Zod Schema
const addIPSchema = z.object({
  ipAddress: z.string()
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}$/,
      'Adresse IP invalide (format: xxx.xxx.xxx.xxx)'
    )
    .refine((ip) => {
      const parts = ip.split('.');
      return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    }, 'Chaque octet doit être entre 0 et 255'),
  description: z.string().min(1, 'Description requise').max(200),
  expiresAt: z.string().optional(),
});

type AddIPFormValues = z.infer<typeof addIPSchema>;

interface IPWhitelistEntry {
  id: string;
  ipAddress: string;
  description: string | null;
  enabled: boolean;
  expiresAt: string | null;
  createdAt: string;
  admin: {
    email: string;
    displayName: string | null;
  };
}

export default function IPManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [ipList, setIpList] = useState<IPWhitelistEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingIP, setDeletingIP] = useState<string | null>(null);

  const form = useForm<AddIPFormValues>({
    resolver: zodResolver(addIPSchema),
    defaultValues: {
      ipAddress: '',
      description: '',
      expiresAt: '',
    },
  });

  useEffect(() => {
    fetchIPList();
  }, []);

  const fetchIPList = async () => {
    try {
      const response = await fetch('/api/security/ip-whitelist');
      if (!response.ok) throw new Error('Failed to fetch IP list');

      const data = await response.json();
      setIpList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement de la liste');
      setIpList([]);
    }
  };

  const onSubmit = async (data: AddIPFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/security/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: data.ipAddress,
          description: data.description,
          expiresAt: data.expiresAt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add IP');
      }

      toast.success('IP ajoutée avec succès');
      form.reset();
      setIsDialogOpen(false);
      await fetchIPList();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ipAddress: string) => {
    if (!confirm(`Voulez-vous vraiment retirer ${ipAddress} de la whitelist ?`)) {
      return;
    }

    setDeletingIP(ipAddress);
    try {
      const response = await fetch(`/api/security/ip-whitelist/${encodeURIComponent(ipAddress)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete IP');

      toast.success('IP retirée de la whitelist');
      await fetchIPList();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingIP(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (entry: IPWhitelistEntry) => {
    if (!entry.enabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          <XCircle className="w-3 h-3" />
          Désactivée
        </span>
      );
    }

    if (isExpired(entry.expiresAt)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
          <Calendar className="w-3 h-3" />
          Expirée
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des IP Autorisées</h1>
            <p className="text-gray-500 mt-1">Contrôle d'accès basé sur l'adresse IP</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une IP à la Whitelist</DialogTitle>
              <DialogDescription>
                Cette IP sera autorisée à accéder aux zones sécurisées
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse IP *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="192.168.1.1"
                          {...field}
                          disabled={isLoading}
                          aria-label="IP address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bureau principal, VPN entreprise, etc."
                          {...field}
                          disabled={isLoading}
                          aria-label="Description"
                        />
                      </FormControl>
                      <FormDescription>
                        Identifiez cette IP pour référence future
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'expiration (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isLoading}
                          aria-label="Expiration date"
                        />
                      </FormControl>
                      <FormDescription>
                        Laissez vide pour une autorisation permanente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      'Ajouter'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{(ipList ?? []).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(ipList ?? []).filter(ip => ip.enabled && !isExpired(ip.expiresAt)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Expirées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {(ipList ?? []).filter(ip => ip.enabled && isExpired(ip.expiresAt)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IP List Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            <CardTitle>Liste des IPs Autorisées</CardTitle>
          </div>
          <CardDescription>
            {(ipList ?? []).length === 0
              ? 'Aucune IP dans la whitelist'
              : `${(ipList ?? []).length} IP${(ipList ?? []).length > 1 ? 's' : ''} enregistrée${(ipList ?? []).length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(ipList ?? []).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune IP autorisée</p>
              <p className="text-sm mt-1">Ajoutez des adresses IP pour restreindre l'accès</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adresse IP</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Ajoutée par</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ipList ?? []).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.ipAddress}</TableCell>
                    <TableCell>{entry.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(entry)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{entry.admin.displayName || 'Admin'}</p>
                        <p className="text-xs text-gray-500">{entry.admin.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.expiresAt ? (
                        <div className={isExpired(entry.expiresAt) ? 'text-amber-600' : ''}>
                          {format(new Date(entry.expiresAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </div>
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(entry.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.ipAddress)}
                        disabled={deletingIP === entry.ipAddress}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingIP === entry.ipAddress ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
