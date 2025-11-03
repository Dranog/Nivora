/**
 * CRM Fan Detail Page Component (extracted for testing)
 */

'use client';

import { FanDetail } from '@/components/crm/FanDetail';
import {
  useFan,
  useTags,
  useChangeStage,
  useAddTag,
  useRemoveTag,
  useCreateTag,
} from '@/hooks/useFanCRM';
import type { FanStage } from '@/types/crm';

export function FanDetailPageComponent({ fanId }: { fanId: string }) {
  const { data: fan, isLoading } = useFan(fanId);
  const { data: tagsData } = useTags();
  const changeStageMutation = useChangeStage();
  const addTagMutation = useAddTag();
  const removeTagMutation = useRemoveTag();
  const createTagMutation = useCreateTag();

  const handleStageChange = (stage: FanStage) => {
    changeStageMutation.mutate({ fanId, stage });
  };

  const handleAddTag = (tagId: string) => {
    addTagMutation.mutate({ fanId, tagId });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate({ fanId, tagId });
  };

  const handleCreateTag = (name: string, color: string) => {
    createTagMutation.mutate({ name, color });
  };

  if (!fan && !isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Fan Not Found</h1>
          <p className="text-muted-foreground mt-2">The fan you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <FanDetail
        fan={fan!}
        availableTags={tagsData || []}
        isLoading={isLoading}
        onStageChange={handleStageChange}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}
