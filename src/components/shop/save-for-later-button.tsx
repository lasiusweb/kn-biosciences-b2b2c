import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, RotateCcw } from 'lucide-react';
import { useSaveForLater } from '@/hooks/use-save-for-later';

interface SaveForLaterButtonProps {
  variantId: string;
  isSaved?: boolean;
  onStatusChange?: (isSaved: boolean) => void;
  className?: string;
}

export function SaveForLaterButton({ 
  variantId, 
  isSaved: initialIsSaved = false, 
  onStatusChange,
  className 
}: SaveForLaterButtonProps) {
  const { saveItem, removeSavedItem } = useSaveForLater();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const handleSaveToggle = async () => {
    if (isSaving) return;

    setIsSaving(true);
    
    try {
      if (isSaved) {
        // Remove from saved items
        const result = await removeSavedItem(variantId);
        if (result.success) {
          setIsSaved(false);
          onStatusChange?.(false);
        }
      } else {
        // Add to saved items
        const result = await saveItem(variantId);
        if (result.success) {
          setIsSaved(true);
          onStatusChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={handleSaveToggle}
      disabled={isSaving}
      className={className}
      aria-label={isSaved ? "Remove from saved items" : "Save for later"}
    >
      {isSaving ? (
        <RotateCcw className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 ${
            isSaved ? "fill-current text-white" : "text-earth-600"
          }`}
        />
      )}
      <span className="ml-2">
        {isSaving ? "Saving..." : isSaved ? "Saved" : "Save for Later"}
      </span>
    </Button>
  );
}