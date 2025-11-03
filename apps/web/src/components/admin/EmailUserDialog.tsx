'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Loader2, Send } from 'lucide-react';

interface EmailUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export function EmailUserDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
}: EmailUserDialogProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  console.log('📧 [EMAIL DIALOG] Dialog opened for user:', {
    userId,
    userEmail,
    userName,
  });

  const handleSend = async () => {
    console.log('📤 [EMAIL] Attempting to send email:', {
      to: userEmail,
      subject,
      messageLength: message.length,
    });

    // Validation
    if (!subject.trim()) {
      toast.error('Le sujet est requis');
      console.error('❌ [EMAIL] Validation failed: Subject is empty');
      return;
    }

    if (!message.trim()) {
      toast.error('Le message est requis');
      console.error('❌ [EMAIL] Validation failed: Message is empty');
      return;
    }

    setSending(true);

    try {
      console.log('🔄 [EMAIL] Calling API endpoint...');

      const response = await fetch(`/api/admin/users/${userId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      console.log('📥 [EMAIL] API response:', data);

      if (response.ok && data.success) {
        console.log('✅ [EMAIL] Email sent successfully');
        toast.success('Email envoyé avec succès', {
          description: `Email envoyé à ${userName}`,
        });

        // Reset form
        setSubject('');
        setMessage('');
        onOpenChange(false);
      } else {
        console.error('❌ [EMAIL] API returned error:', data);
        toast.error('Erreur lors de l\'envoi', {
          description: data.message || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('❌ [EMAIL] Network error:', error);
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur',
      });
    } finally {
      setSending(false);
    }
  };

  const handleMailto = () => {
    console.log('📬 [EMAIL] Opening mailto: link');
    const mailtoUrl = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
    console.log('✅ [EMAIL] Mailto link opened');
  };

  const handleCancel = () => {
    console.log('🚫 [EMAIL] Dialog cancelled');
    setSubject('');
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-600" />
            Envoyer un email
          </DialogTitle>
          <DialogDescription>
            Envoyer un email à <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* To field (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="to">À</Label>
            <Input
              id="to"
              value={userEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Subject field */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Sujet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Objet de l'email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Message field */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length} caractères
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {/* Alternative: mailto link */}
          <Button
            type="button"
            variant="outline"
            onClick={handleMailto}
            disabled={sending || !subject.trim() || !message.trim()}
            className="w-full sm:w-auto"
          >
            <Mail className="w-4 h-4 mr-2" />
            Ouvrir dans mon client email
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={sending}
              className="flex-1 sm:flex-initial"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-brand-start to-brand-end"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
