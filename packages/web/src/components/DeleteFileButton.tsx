import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { X } from 'lucide-react'

interface DeleteFileButtonProps {
  onClick: () => void
}

/**
 * Renders a button to download a file.
 * 
 * @param param0 
 * @returns 
 */
export const DeleteFileButton: React.FC<DeleteFileButtonProps> = ({ onClick }) => {

  // For Tooltips to work, we need to wrap the component in a TooltipProvider at a higher level
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant="ghost"
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Delete file</p>
      </TooltipContent>
    </Tooltip>
  );
}