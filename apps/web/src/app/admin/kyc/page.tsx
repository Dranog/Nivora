'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

// Données mock temporaires
const mockKycVerifications = [
  {
    id: '1',
    userId: '2',
    userName: 'Jon Kelly',
    userEmail: 'jon.kelly@example.com',
    submittedAt: '2025-10-15T14:30:00Z',
    documentType: 'Passeport',
    status: 'PENDING',
  },
  {
    id: '2',
    userId: '3',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@example.com',
    submittedAt: '2025-10-20T09:15:00Z',
    documentType: 'Carte d\'identité',
    status: 'PENDING',
  },
  {
    id: '3',
    userId: '4',
    userName: 'Marc Dubois',
    userEmail: 'marc.dubois@example.com',
    submittedAt: '2025-10-18T16:45:00Z',
    documentType: 'Permis de conduire',
    status: 'APPROVED',
  },
];

export default function KycPage() {
  const handleApprove = (id: string) => {
    console.log('Approuver KYC:', id);
    alert('Fonctionnalité à implémenter');
  };

  const handleReject = (id: string) => {
    console.log('Rejeter KYC:', id);
    alert('Fonctionnalité à implémenter');
  };

  const handleView = (id: string) => {
    console.log('Voir détails KYC:', id);
    alert('Fonctionnalité à implémenter');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vérification KYC</h1>
        <p className="text-gray-600 mt-2">Gestion des vérifications d'identité</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vérifications en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Date de soumission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockKycVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">{verification.userName}</TableCell>
                  <TableCell>{verification.userEmail}</TableCell>
                  <TableCell>{verification.documentType}</TableCell>
                  <TableCell>{formatDate(verification.submittedAt)}</TableCell>
                  <TableCell>{getStatusBadge(verification.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(verification.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      {verification.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(verification.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(verification.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockKycVerifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune vérification KYC en attente
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
