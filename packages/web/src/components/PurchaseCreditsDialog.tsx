import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Rocket, Sparkles, Star, Zap } from 'lucide-react'
import { useState } from "react"

interface PurchaseCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PurchaseCreditsDialog = ({
  open,
  onOpenChange,
}: PurchaseCreditsDialogProps) => {
  const [selectedCredits, setSelectedCredits] = useState<string | null>(null);

  const handlePurchase = async () => {
    console.log('Purchasing credits:', selectedCredits);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] sm:w-full rounded-lg outline-none bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0">
        <DialogHeader className="space-y-3 mb-4">
          <DialogTitle className="text-2xl font-bold">Buy Credits</DialogTitle>
          <DialogDescription className="text-base text-white">
            Choose your credit package and start fixing PDFs like a pro!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup onValueChange={setSelectedCredits} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="5" id="5-credits" className="peer sr-only" />
              <Label
                htmlFor="5-credits"
                className="flex flex-col items-center justify-between rounded-md border-2 border-white bg-white p-4 hover:shadow-2xl peer-data-[state=checked]:border-yellow-950 peer-data-[state=checked]:bg-white transition-all duration-300 ease-in-out cursor-pointer"
              >
                <Zap className="mb-3 h-6 w-6 text-purple-500" />
                <div className="text-xl font-semibold">5 Credits</div>
                <div className="text-3xl font-bold text-purple-300">$5</div>
                <div className="text-sm text-purple-200">Perfect for quick fixes</div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="15" id="15-credits" className="peer sr-only" />
              <Label
                htmlFor="15-credits"
                className="flex flex-col items-center justify-between rounded-md border-2 border-white bg-white p-4 hover:shadow-2xl peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-white transition-all duration-300 ease-in-out cursor-pointer"
              >
                <Star className="mb-3 h-6 w-6 text-yellow-400" />
                <div className="text-3xl font-bold text-purple-500">$10</div>
                <div className="text-xl font-semibold text-purple-500">15 Credits</div>
                <div className="text-sm text-purple-400">Save 33%</div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="35" id="35-credits" className="peer sr-only" />
              <Label
                htmlFor="35-credits"
                className="flex flex-col items-center justify-between rounded-md border-2 border-purple-200 bg-white p-4 hover:bg-purple-50 hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all duration-300 ease-in-out cursor-pointer"
              >
                <Sparkles className="mb-3 h-6 w-6 text-yellow-400" />
                <div className="text-xl font-semibold">35 Credits</div>
                <div className="text-3xl font-bold text-purple-300">$20</div>
                <div className="text-sm text-purple-200">Save 43%</div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="100" id="100-credits" className="peer sr-only" />
              <Label
                htmlFor="100-credits"
                className="flex flex-col items-center justify-between rounded-md border-2 border-purple-200 bg-white p-4 hover:bg-purple-50 hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all duration-300 ease-in-out cursor-pointer"
              >
                <Rocket className="mb-3 h-6 w-6 text-yellow-400" />
                <div className="text-xl font-semibold">100 Credits</div>
                <div className="text-3xl font-bold text-purple-300">$50</div>
                <div className="text-sm text-purple-200">Best value! Save 50%</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <Button
          onClick={handlePurchase}
          disabled={!selectedCredits}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transform transition duration-500 ease-in-out hover:scale-105"
        >
          Get Started Now!
        </Button>
        <p className="text-center text-sm text-white mt-4">
          Unlock the full potential of your PDFs with our credit packages.
          The more you buy, the more you save!
        </p>
      </DialogContent>
    </Dialog>
  )
}