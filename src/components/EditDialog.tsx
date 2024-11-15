import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { useState } from "react"

interface EditDialogProps {
  title: string;
  content: string | Record<string, any>;
  onSave: (newContent: any) => void;
}

export function EditDialog({ title, content, onSave }: EditDialogProps) {
  const [editedContent, setEditedContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setEditedContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
    setIsOpen(true)
  }

  const handleSave = () => {
    try {
      const parsedContent = typeof content === 'string' ? editedContent : JSON.parse(editedContent)
      onSave(parsedContent)
      setIsOpen(false)
    } catch (error) {
      console.error('Invalid JSON format:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={handleOpen}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  )
} 