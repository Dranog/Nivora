/**
 * NoteEditor Component
 * Add notes with autosave functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Note } from '@/types/crm';
import { useUpdateNote, useAddNote } from '@/hooks/useFanCRM';

interface NoteEditorProps {
  fanId: string;
  notes: Note[];
}

export function NoteEditor({ fanId, notes }: NoteEditorProps) {
  const [newNote, setNewNote] = useState('');
  const addNoteMutation = useAddNote();
  const { debouncedUpdate, isSaving } = useUpdateNote();

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(
        { fanId, content: newNote.trim() },
        {
          onSuccess: () => {
            setNewNote('');
          },
        }
      );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const charCount = newNote.length;
  const maxChars = 1000;

  return (
    <div className="space-y-4" data-testid="note-editor">
      {/* Add new note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note about this fan..."
            className="min-h-[100px]"
            maxLength={maxChars}
            data-testid="new-note-textarea"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {charCount}/{maxChars} characters
            </span>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNoteMutation.isPending}
              data-testid="add-note-btn"
            >
              {addNoteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous notes */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Previous Notes ({notes.length})</h3>
          {notes
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((note) => (
              <Card key={note.id} data-testid={`note-${note.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm flex-1 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {note.createdBy} • {formatDate(note.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {notes.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No notes yet. Add your first note above.
        </p>
      )}
    </div>
  );
}
