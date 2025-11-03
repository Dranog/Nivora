/**
 * Media Uploader - F4
 * Upload signé avec validation, progress, preview
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useUploadMedia } from '@/hooks/useMedia';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

interface MediaUploaderProps {
  onUploadComplete?: (mediaId: string, mediaUrl: string) => void;
  onUploadStart?: () => void;
  onError?: (message: string) => void;
  onProgress?: (progress: number) => void;
  currentMediaUrl?: string;
  disabled?: boolean;
}

export function MediaUploader({
  onUploadComplete,
  onUploadStart,
  onError,
  onProgress,
  currentMediaUrl,
  disabled = false,
}: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentMediaUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadMedia = useUploadMedia({
    onSuccess: (response) => {
      setPreview(response.media.url);
      setIsUploading(false);
      setUploadProgress(0);
      onUploadComplete?.(response.media.id, response.media.url);
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      setPreview(null);
      onError?.(error.message || 'Upload failed');
    },
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file format. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM)';
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      const errorMsg = validateFile(file);
      if (errorMsg) {
        onError?.(errorMsg);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Start upload
      setIsUploading(true);
      setUploadProgress(0);
      onUploadStart?.();
      onProgress?.(0);

      // Simulate progress (in real app, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          const newProgress = prev + 10;
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 200);

      try {
        const result = await uploadMedia.mutateAsync({ file });
        clearInterval(progressInterval);
        setUploadProgress(100);
        onProgress?.(100);
        setIsUploading(false);

        // Call callback with media info
        if (result?.media) {
          onUploadComplete?.(result.media.id, result.media.url);
        }
      } catch (error) {
        clearInterval(progressInterval);
        setPreview(null);
        setIsUploading(false);
        setUploadProgress(0);
        onProgress?.(0);
      }
    },
    [validateFile, uploadMedia, onUploadStart, onUploadComplete, onError, onProgress]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCancel = useCallback(() => {
    // Abort upload request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset all state to stable final values
    setIsUploading(false);
    setUploadProgress(0);
    setPreview(null);
    onProgress?.(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onProgress]);

  const isImage = preview && (preview.startsWith('data:image') || preview.includes('/image'));
  const isVideo = preview && (preview.startsWith('data:video') || preview.includes('/video'));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Upload Area */}
          {!preview && !isUploading && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Images (JPEG, PNG, GIF, WebP) or Videos (MP4, WebM)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 50MB
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="w-full"
              >
                Cancel Upload
              </Button>
            </div>
          )}

          {/* Preview */}
          {preview && !isUploading && (
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {isImage && (
                  <img
                    src={preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                )}
                {isVideo && (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-cover"
                  >
                    <track kind="captions" />
                  </video>
                )}
                {!isImage && !isVideo && (
                  <div className="flex items-center justify-center h-full">
                    {ACCEPTED_IMAGE_TYPES.some((type) => preview.includes(type)) ? (
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    ) : (
                      <Video className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Button (when preview exists) */}
          {preview && !isUploading && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Change Media
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
