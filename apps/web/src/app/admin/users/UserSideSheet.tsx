// apps/web/src/app/admin/users/UserSideSheet.tsx
'use client';

import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Mail, Ban, CheckCircle2, UserCircle2, Save } from 'lucide-react';

// Define local types for user data
type Role = 'Admin' | 'Creator' | 'User';
type Status = 'Verified' | 'Pending' | 'Rejected' | 'Suspended' | 'Active';
type Category = string;

export interface UserFormData {
  name: string;
  email: string;
  role: Role;
  category?: Category;
  status: Status;
  avatar?: string;
}

export interface UserRecord extends UserFormData {
  id: string;
  createdAt: string;
  lastLogin?: string;
}

type Props = {
  open: boolean;
  user: UserRecord | null;
  onClose: () => void;
  onUpdate: (user: UserRecord) => void;
  onSuspendToggle: (userId: string, nextStatus: Status) => void;
};

export function UserSideSheet({
  open,
  user,
  onClose,
  onUpdate,
  onSuspendToggle,
}: Props) {
  const [local, setLocal] = useState<UserRecord | null>(user);
  const [saving, setSaving] = useState(false);

  useMemo(() => setLocal(user), [user]); // keep in sync with prop

  if (!local) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>User</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const isSuspended = local.status === 'Suspended';

  const save = async () => {
    if (local.name.trim().length < 2) {
      toast.error('Validation Error', {
        description: 'Name must be at least 2 characters'
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(local.email)) {
      toast.error('Validation Error', {
        description: 'Invalid email'
      });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onUpdate(local);
    setSaving(false);
    toast.success('Profile Updated', {
      description: 'Changes saved successfully'
    });
  };

  const toggleSuspend = () => {
    const next: Status = isSuspended ? 'Active' : 'Suspended';
    const ok = confirm(
      `${isSuspended ? 'Re-activate' : 'Suspend'} user "${local.name}"?\n\nCurrent: ${local.status}\nNext: ${next}`
    );
    if (!ok) return;
    onSuspendToggle(local.id, next);
    setLocal((p) => (p ? { ...p, status: next } : p));
    if (isSuspended) {
      toast.success('User Re-activated', {
        description: 'User can log in again'
      });
    } else {
      toast.warning('User Suspended', {
        description: 'User access has been disabled'
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-[#00B8A9]" /> User Profile
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarImage src={local.avatar || ''} />
              <AvatarFallback>{local.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{local.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{local.role}</Badge>
                {local.category && <Badge className="bg-gray-100 text-gray-700">{local.category}</Badge>}
                <Badge className={local.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {local.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <Input
                  value={local.email}
                  onChange={(e) => setLocal((p) => (p ? { ...p, email: e.target.value } : p))}
                />
              </div>
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                value={local.name}
                onChange={(e) => setLocal((p) => (p ? { ...p, name: e.target.value } : p))}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={local.role}
                onChange={(e) => setLocal((p) => (p ? { ...p, role: e.target.value as Role } : p))}
                placeholder="Admin | Creator | User"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={local.category || ''}
                onChange={(e) => setLocal((p) => (p ? { ...p, category: e.target.value as Category } : p))}
                placeholder="Photography, Fitness, Gaming, ..."
              />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input
                placeholder="https://..."
                value={local.avatar || ''}
                onChange={(e) => setLocal((p) => (p ? { ...p, avatar: e.target.value } : p))}
              />
            </div>
            <div className="text-xs text-gray-500">
              <p>Created: {local.createdAt}</p>
              {local.lastLogin && <p>Last login: {local.lastLogin}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-gradient-to-r from-brand-start to-brand-end text-white disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </span>
            </Button>

            <Button
              variant={isSuspended ? 'secondary' : 'destructive'}
              onClick={toggleSuspend}
              className="w-full"
            >
              {isSuspended ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Re-activate
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
