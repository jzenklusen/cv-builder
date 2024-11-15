import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const handleFeedback = (feedback: 'up' | 'down') => {
    console.log('User feedback:', feedback);
    // Here you would typically send this to your analytics or backend
    alert('Thanks for your feedback! We\'ll keep working on making this better.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sorry! This Feature is Under Construction!</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center mb-6">
            Would you like to have this AI enhancement feature in the future? Let us know!
          </p>
          <div className="flex justify-center gap-8">
            <Button
              variant="ghost"
              onClick={() => handleFeedback('down')}
              className="flex flex-col items-center"
            >
              <ThumbsDown className="w-8 h-8 mb-2" />
              No, thanks
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleFeedback('up')}
              className="flex flex-col items-center"
            >
              <ThumbsUp className="w-8 h-8 mb-2" />
              Yes, please!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 