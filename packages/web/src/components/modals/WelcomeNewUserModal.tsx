import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Upload } from 'lucide-react'

interface WelcomeNewUserModalProps {
  open: boolean
  onProceed: () => void
}

export const WelcomeNewUserModal = ({
  open,
  onProceed,
}: WelcomeNewUserModalProps) => {

  return (
    <Dialog open={open} onOpenChange={() => onProceed()}>
      <DialogContent className="sm:max-w-md mx-auto my-4 w-[calc(100%-2rem)] rounded-lg outline-none">
        <DialogHeader>
          <DialogTitle className="text-gray-800 text-xl">Welcome to FixItPDF! 🎉</DialogTitle>
          <div className="space-y-4 py-4 lign">
            <DialogDescription className="space-y-4 pt-3 text-base text-left">
              We&apos;re excited to have you here! To help you get started, we&apos;ve added{" "}
              <span className="underline text-primary">5 free credits</span> to your account.
            </DialogDescription>
            <div className="rounded-lg bg-secondary/50 p-4 text-sm text-left">
              <h3 className="font-semibold text-foreground">Getting Started is Easy:</h3>
              <ol className="mt-2 list-decimal pl-4 text-gray-500">
                <li>Upload any PDF file using the drag & drop area</li>
                <li>We&apos;ll automatically scan and detect issues</li>
                <li>Click &quot;Fix&quot; to resolve the problems we find</li>
              </ol>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button 
            className="w-full gap-2 py-6 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={onProceed}>
            <Upload className="h-4 w-4" strokeWidth={3}/>
            Start Uploading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}