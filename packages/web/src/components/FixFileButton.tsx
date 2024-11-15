import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Wrench } from 'lucide-react'


interface FileFileButtonProps {
  onClick: () => void
}

/**
 * Renders a button to download a file.
 * 
 * @param param0 
 * @returns 
 */
export const FixFileButton: React.FC<FileFileButtonProps> = ({ onClick }) => {

  // For Tooltips to work, we need to wrap the component in a TooltipProvider at a higher level
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant="ghost"
          size="icon"
        >
          <Wrench className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Fix issues</p>
      </TooltipContent>
    </Tooltip>
  );
}