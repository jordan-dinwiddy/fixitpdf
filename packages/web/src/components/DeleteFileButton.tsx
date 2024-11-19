import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Loader2, X } from 'lucide-react'
import { useState } from "react"

interface DeleteFileButtonProps {
  onClick: () => Promise<void>
}

/**
 * Renders a button to download a file.
 * 
 * @param param0 
 * @returns 
 */
export const DeleteFileButton: React.FC<DeleteFileButtonProps> = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  // For Tooltips to work, we need to wrap the component in a TooltipProvider at a higher level
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleClick}
          variant="ghost"
          size="icon"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Delete file</p>
      </TooltipContent>
    </Tooltip>
  );
}