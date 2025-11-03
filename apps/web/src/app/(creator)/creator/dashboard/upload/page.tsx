'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { UploadZone } from '@/components/upload/upload-zone'
import { UploadProgress } from '@/components/upload/upload-progress'
import { PostForm } from '@/components/upload/post-form'
import { PreviewPanel } from '@/components/upload/preview-panel'
import { Button } from '@/components/ui/button'
import { Save, CheckCircle } from 'lucide-react'

const mockUploads = [
  { id: '1', name: 'mountain.jpg', size: '3.4 MB', progress: 20, status: 'uploading' as const },
  { id: '2', name: 'sunset.jpg', size: '62.9 MB', progress: 90, status: 'watermarking' as const },
  { id: '3', name: 'video.mp4', size: '560 MB', progress: 60, status: 'uploading' as const },
  { id: '4', name: 'photo.jpg', size: '2.1 MB', progress: 0, status: 'failed' as const }
]

export default function UploadPage() {
  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected:', files);
    // TODO: Implement file upload logic
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...');
    // TODO: Implement save draft logic
  };

  const handlePublish = () => {
    console.log('Publishing...');
    // TODO: Implement publish logic
  };

  return (
    <PageContainer
      title="Create New Post"
      description="Upload and publish your content"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Upload' }
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Publish
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <UploadZone onFilesSelected={handleFilesSelected} />
          <UploadProgress uploads={mockUploads} />
        </div>
        <div className="space-y-6">
          <PostForm onSaveDraft={handleSaveDraft} onPublish={handlePublish} />
          <PreviewPanel />
        </div>
      </div>
    </PageContainer>
  )
}
