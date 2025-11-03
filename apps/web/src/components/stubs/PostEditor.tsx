/**
 * PostEditor Stub Component
 * Temporary placeholder until full implementation
 */

interface PostEditorProps {
  onSaveDraft?: () => void;
  onPublish?: () => void;
}

export default function PostEditor({ onSaveDraft, onPublish }: PostEditorProps) {
  return (
    <div className="p-4 border rounded bg-gray-50 text-center">
      <p className="text-lg font-semibold">🧩 PostEditor (stub)</p>
      <p className="text-sm text-muted-foreground mt-2">
        Component will be implemented in next phase
      </p>
    </div>
  );
}
