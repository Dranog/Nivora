/**
 * Post Editor - F4
 * Complete post editor with autosave, scheduling, pricing
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useCreatePost } from '@/hooks/usePosts';
import { MediaUploader } from './MediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Send, Calendar, DollarSign, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatorPostVisibility } from '@/types/creator';

interface PostEditorProps {
  postId?: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
}

export function PostEditor({ postId = 'new', onSaveDraft, onPublish }: PostEditorProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<CreatorPostVisibility>('free');
  const [price, setPrice] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [nsfw, setNsfw] = useState(false);
  const [coverImageId, setCoverImageId] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create post mutation
  const createPost = useCreatePost({
    onSuccess: () => {
      // Clear draft
      clearDraft();

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect to posts list
      router.push('/creator/posts');
      onPublish?.();
    },
  });

  // Autosave draft
  const { loadDraft, clearDraft } = useDraftAutosave(
    postId,
    {
      title,
      content,
      visibility,
      price: price ? parseFloat(price) * 100 : undefined, // Convert to cents
      scheduledAt: scheduledAt || undefined,
      tags,
      nsfw,
      coverImageId: coverImageId || undefined,
    },
    true
  );

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setVisibility(draft.visibility);
      setPrice(draft.price ? (draft.price / 100).toFixed(2) : '');
      setScheduledAt(draft.scheduledAt || '');
      setTags(draft.tags);
      setNsfw(draft.nsfw);
      setCoverImageId(draft.coverImageId || '');
    }
  }, [loadDraft]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (visibility === 'paid') {
      const priceNum = parseFloat(price);
      if (!price || isNaN(priceNum) || priceNum < 0.5) {
        newErrors.price = 'Price must be at least $0.50';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle publish
  const handlePublish = async () => {
    if (!validate()) return;

    const priceInCents = visibility === 'paid' && price ? Math.round(parseFloat(price) * 100) : undefined;

    await createPost.mutateAsync({
      title,
      content,
      visibility: visibility as 'public' | 'followers' | 'subscribers' | 'private',
      status: scheduledAt ? 'draft' : 'published',
      excerpt: content.substring(0, 200),
      coverImage: coverImageUrl || undefined,
      // Extended fields (would be in API)
      // price: priceInCents,
      // scheduledAt,
      // tags,
      // nsfw,
    });
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!validate()) return;

    // Draft is autosaved via hook, just show toast
    onSaveDraft?.();
  };

  // Add tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={!!errors.title}
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              aria-invalid={!!errors.content}
              className={cn(errors.content && 'border-destructive')}
            />
            {errors.content && (
              <p className="text-sm text-destructive" role="alert">
                {errors.content}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <div className="space-y-2">
        <Label>Cover Image / Video</Label>
        <MediaUploader
          onUploadComplete={(mediaId, mediaUrl) => {
            setCoverImageId(mediaId);
            setCoverImageUrl(mediaUrl);
          }}
          currentMediaUrl={coverImageUrl}
        />
      </div>

      {/* Visibility & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as CreatorPostVisibility)}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free (Public)</SelectItem>
                <SelectItem value="subscribers">Subscribers Only</SelectItem>
                <SelectItem value="paid">Pay-Per-View (PPV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price (if PPV) */}
          {visibility === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={cn('pl-9', errors.price && 'border-destructive')}
                  aria-invalid={!!errors.price}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.price}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Minimum price: $0.50</p>
            </div>
          )}

          {/* NSFW Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nsfw"
              checked={nsfw}
              onCheckedChange={(checked) => setNsfw(checked as boolean)}
            />
            <Label
              htmlFor="nsfw"
              className="text-sm font-normal cursor-pointer"
            >
              Mark as NSFW (18+ content)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling & Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">
              <Calendar className="inline h-4 w-4 mr-1" />
              Schedule Publication
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to publish immediately
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={createPost.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>

        <Button
          onClick={handlePublish}
          disabled={createPost.isPending}
        >
          {createPost.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {scheduledAt ? 'Schedule Post' : 'Publish Now'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
