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
import { useEffect, useRef, useState } from "react"
import { GoogleIcon, AppleIcon } from "../Icons"

interface LoginOrSignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'signup'
}

export const LoginOrSignupModal = ({
  open,
  onOpenChange,
}: LoginOrSignupModalProps) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | 'apple' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timeout ID

  const handleLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    // Remove any existing timeout and set a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoadingProvider(provider);

    timeoutRef.current = setTimeout(() => {
      setLoadingProvider(null);
    }, 4000);

    try {
      // Note that user is probably still on this page even after signIn() returns
      // That's why we dont immediately hide the loading spinner and instead wait 
      // for the timeout
      await signIn(provider);
    } catch (e) {
      console.error(e);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLoadingProvider(null);
    }
  }

  // Cleanup the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full rounded-lg outline-none bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0">
        <DialogHeader className="space-y-3 mb-4">
          <DialogTitle className="text-2xl font-bold">Login or Sign Up</DialogTitle>
          <DialogDescription className="text-base text-white">
            Choose a method to login or create an account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={() => handleLogin('google')}
            disabled={loadingProvider !== null}
            className="bg-white hover:bg-purple-50 text-base text-purple-700 w-full justify-center px-4 py-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            {loadingProvider === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
              <>
                <GoogleIcon fillColor="#7e22ce" className="h-5 w-5 mr-2" />
                Continue with Google
              </>
            )}
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
            className="bg-purple-600 hover:bg-purple-700 text-base text-white w-full justify-center px-4 py-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            {loadingProvider === 'apple' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
              <>
                <AppleIcon fillColor="#ffffff" className="h-5 w-5 mr-2" />
                Continue with Apple
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}