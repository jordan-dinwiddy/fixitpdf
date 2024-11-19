import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { AlertCircle } from 'lucide-react'

interface InsufficientCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceed: () => void;
}

export const InsufficientCreditsDialog = ({
  open,
  onOpenChange,
  onProceed
}: InsufficientCreditsDialogProps) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto my-4 w-[calc(100%-2rem)] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-purple-700 text-xl">Insufficient Credits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <DialogDescription className="text-yellow-600">
              You don&apos;t have enough credits to perform this action.
            </DialogDescription>
          </div>
          <p className="text-sm text-muted-foreground">
            Please purchase more credits to continue fixing PDF files.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto py-6 sm:py-4 text-base md:text-sm order-1 sm:order-none" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onProceed}
            className="w-full sm:w-auto py-6 sm:py-4 text-base md:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            Buy More Credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}