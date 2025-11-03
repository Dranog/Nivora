/**
 * TagPicker Component
 * Add/remove tags and create new ones
 */

'use client';

import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import type { FanTag } from '@/types/crm';
import { TAG_COLORS } from '@/types/crm';

interface TagPickerProps {
  currentTags: FanTag[];
  availableTags: FanTag[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
  disabled?: boolean;
}

export function TagPicker({
  currentTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  disabled = false,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const currentTagIds = currentTags.map((t) => t.id);
  const availableToAdd = availableTags.filter((t) => !currentTagIds.includes(t.id));

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-2" data-testid="tag-picker">
      {/* Current tags */}
      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1"
            style={{ backgroundColor: tag.color, color: 'white' }}
            data-testid={`current-tag-${tag.id}`}
          >
            {tag.name}
            {!disabled && (
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="ml-1 hover:opacity-70"
                data-testid={`remove-tag-${tag.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Add tag button */}
        {!disabled && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                data-testid="add-tag-btn"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              {!showCreateForm ? (
                <div className="space-y-2">
                  {/* Available tags to add */}
                  {availableToAdd.length > 0 ? (
                    <div className="space-y-1">
                      {availableToAdd.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            onAddTag(tag.id);
                            setIsOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted"
                          data-testid={`add-tag-option-${tag.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm">{tag.name}</span>
                          </div>
                          <Check className="h-4 w-4 opacity-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      All tags added
                    </p>
                  )}

                  {/* Create new tag */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                    data-testid="create-tag-btn"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create New Tag
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    data-testid="new-tag-name-input"
                  />

                  {/* Color picker */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewTagColor(color)}
                          className={`h-6 w-6 rounded-full border-2 ${
                            newTagColor === color ? 'border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          data-testid={`color-option-${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      data-testid="confirm-create-tag"
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
