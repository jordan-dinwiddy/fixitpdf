import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useGetUserInfo } from "@/lib/hooks/useGetUserInfo"
import { UserFile } from "fixitpdf-shared"
import { Coins, Loader2 } from 'lucide-react'
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

  const { data: userInfo } = useGetUserInfo({
    enabled: open,
    refreshInterval: 30000,
  });

  const handleProceed = async () => {
    setIsLoading(true)

    try {
      const result = await onProceed();

      // Close if successful
      if (result) {
        onOpenChange(false);
      }
    } catch (e) {
      console.log(e);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!open) setIsLoading(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto my-4 w-[calc(100%-2rem)] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-purple-700 text-xl">Fix PDF File</DialogTitle>
          <div className="space-y-4 py-4">
            <DialogDescription className="pt-3">
                Are you sure you want to fix <span className="font-medium text-foreground">{userFile?.name}</span>?
            </DialogDescription>
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Cost:</span>
                </div>
                <span className="font-medium text-purple-500">{userFile?.costInCredits} credits</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-3">
                <span className="font-medium">Your balance:</span>
                <span className="">{userInfo?.creditBalance} credits</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto py-6 sm:py-4 text-base md:text-sm order-1 sm:order-none"
            onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={isLoading}
            className="w-full sm:w-auto py-6 sm:py-4 text-base md:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
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