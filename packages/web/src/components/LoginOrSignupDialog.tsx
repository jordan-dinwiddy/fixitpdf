import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import { signIn } from "next-auth/react"
import { useState } from "react"

interface LoginOrSignupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'signup'
}

export const LoginOrSignupDialog = ({
  open,
  onOpenChange,
}: LoginOrSignupDialogProps) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | 'apple' | null>(null);

  const handleLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setLoadingProvider(provider);
    try {
      await signIn(provider);
    } catch (e) {
      console.error(e);
      setLoadingProvider(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full rounded-lg outline-none">
        <DialogHeader className="space-y-3 mb-4">
          <DialogTitle className="text-2xl font-bold">Login or Sign Up</DialogTitle>
          <DialogDescription className="text-base">
            Choose a method to login or create an account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={() => handleLogin('google')}
            disabled={loadingProvider !== null}
            className="bg-red-500 hover:bg-red-600 text-white w-full justify-center px-4 py-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            {loadingProvider === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <div>Continue with Google</div>}
          </Button>
          {/* <Button
            onClick={() => handleLogin('microsoft')}
            disabled={loadingProvider !== null}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full justify-center px-4 py-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            {loadingProvider === 'microsoft' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <div>Continue with Microsoft</div>}
          </Button>
          */}
          <Button
            onClick={() => handleLogin('apple')}
            disabled={loadingProvider !== null}
            className="bg-black hover:bg-gray-800 text-white w-full justify-center px-4 py-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            {loadingProvider === 'apple' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <div>Continue with Apple</div>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}