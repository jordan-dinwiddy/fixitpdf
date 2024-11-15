import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { UserFile } from "fixitpdf-shared"
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from "react"

interface PurchaseFileConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userFile: UserFile | null
  onProceed: () => Promise<boolean>
}

export const PurchaseFileConfirmationDialog = ({
  open,
  onOpenChange,
  userFile,
  onProceed
}: PurchaseFileConfirmationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleProceed = async () => {
    setIsLoading(true)

    try {
      const result = await onProceed();

      // Close if successful
      if (result) {
        onOpenChange(false);
      }
    } catch (e) {

    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!open) setIsLoading(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
        </DialogHeader>
        {userFile && (<div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to process this file?
          </p>
          <p className="text-lg font-semibold text-primary">
            {userFile.name}
          </p>
          <p className="text-sm text-muted-foreground">
            It will cost <strong>{userFile.costInCredits}</strong> credits (you have <strong>15</strong> available).
          </p>
        </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleProceed} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              'Proceed'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}