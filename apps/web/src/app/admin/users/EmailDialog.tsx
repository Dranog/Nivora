'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userEmail: string;
}

export function EmailDialog({ open, onOpenChange, userName, userEmail }: EmailDialogProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }
    toast.success(`Email envoyé à ${userEmail}`);
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un email à {userName}</DialogTitle>
          <DialogDescription>
            Email envoyé à {userEmail}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Écrivez votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend}>
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
