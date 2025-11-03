/**
 * New Post Page - F4
 * Create new post with editor
 */

'use client';

import PostEditor from '@/components/stubs/PostEditor';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your changes have been saved',
    });
  };

  const handlePublish = () => {
    toast({
      title: 'Post published!',
      description: 'Your post is now live',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Post</h1>
            <p className="text-muted-foreground">
              Share your content with your audience
            </p>
          </div>
        </div>

        {/* Editor */}
        <PostEditor
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
