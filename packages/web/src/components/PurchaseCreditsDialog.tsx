import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { motion } from 'framer-motion'
import { Check, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from "react"
import { Drawer, DrawerContent } from "./ui/drawer"
import { ScrollArea } from "./ui/scroll-area"

interface PurchaseCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}



interface PurchaseOption {
  id: string
  credits: number
  price: number
  tagline: string
}



interface PurchaseOptionButtonProps {
  option: PurchaseOption
  isSelected: boolean
  onOptionSelect: (option: PurchaseOption) => void
}

/**
 * A nice selection button represenging a purchase option.
 * 
 * @param param0 
 * @returns 
 */
const PurchaseOptionButton = ({ option, isSelected, onOptionSelect }: PurchaseOptionButtonProps) => {

  return (
    <motion.button
      key={option.id}
      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ease-in-out ${isSelected
        ? 'bg-blue-50 border-2 border-blue-500'
        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
        }`}
      onClick={() => onOptionSelect(option)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-gray-800">{option.credits} Credits</p>
          <p className="text-sm text-gray-500">${option.price} USD</p>
          <p className="text-xs text-gray-400 mt-1">{option.tagline}</p>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'border-2 border-gray-300'
          }`}>
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </motion.button>
  )
}

interface PurchaseOptionsProps {
  isDesktop: boolean
  options: PurchaseOption[]
  onOpenChange: (open: boolean) => void
}

/**
 * Renders the view listing purchase options incl header, options, footer with a button to purchase.
 */
const PurchaseOptions = ({ isDesktop, onOpenChange, options }: PurchaseOptionsProps) => {
  const [selectedOption, setSelectedOption] = useState<PurchaseOption | null>(null)


  const handleOptionSelect = useCallback((purchaseOption: PurchaseOption) => {
    setSelectedOption(purchaseOption)
  }, []);

  const handlePurchase = useCallback(() => {
    console.log('purchasing', selectedOption);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden flex flex-col h-full max-h border-red-600 border-2">

      {/* Scrollable area listing options*/}
      <ScrollArea className="flex-grow border-green-600 border-2">
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            {options.map((option) => (
              <PurchaseOptionButton key={option.id} option={option} isSelected={selectedOption === option} onOptionSelect={handleOptionSelect} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
        <button
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ease-in-out flex items-center justify-center ${selectedOption !== null
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-300 cursor-not-allowed'
            }`}
          onClick={handlePurchase}
          disabled={selectedOption === null}
        >
          {selectedOption !== null ? (
            <>
              Purchase {selectedOption.credits} Credits
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            'Select a plan to continue'
          )}
        </button>
      </div>
    </div>
  );

}


function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}


export const PurchaseCreditsDialog = ({
  open,
  onOpenChange,
}: PurchaseCreditsDialogProps) => {

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const options: PurchaseOption[] = [
    { id: '1', credits: 5, price: 5, tagline: "Perfect to try things out" },
    { id: '2', credits: 15, price: 10, tagline: "Save 33%" },
    { id: '3', credits: 35, price: 20, tagline: "Save 43%" },
    { id: '4', credits: 100, price: 50, tagline: "Best value! Save 50%" },
  ];

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col sm:max-w-[425px] max-h-[calc(100vh-64px)]">
          <DialogHeader className="space-y-3">
            <DialogTitle>Buy Credits</DialogTitle>
            <DialogDescription className="text-base">
              Choose your credit package and start fixing PDFs like a pro!
            </DialogDescription>
          </DialogHeader>
          <PurchaseOptions isDesktop={isDesktop} options={options} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex flex-col h-[100dvh]">
          <div className="p-6 md:p-8 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Buy Credits</h2>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
          <PurchaseOptions isDesktop={isDesktop} options={options} onOpenChange={onOpenChange} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}