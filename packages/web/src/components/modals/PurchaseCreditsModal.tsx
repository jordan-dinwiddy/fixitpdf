import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/axios"
import {
  CreateCheckoutSessionsResponse,
  DEV_PURCHASE_OPTIONS,
  PROD_PURCHASE_OPTIONS,
  PurchaseOption,
} from "fixitpdf-shared"
import { motion } from 'framer-motion'
import { Check, ChevronRight, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from "react"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PurchaseCreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ease-in-out outline-none ${isSelected
        ? 'bg-purple-50 border-2 border-purple-700'
        : 'bg-gray-50 border border-gray-200'
        }`}
      onClick={() => onOptionSelect(option)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-purple-700">{option.credits} Credits</p>
          <p className="text-sm text-gray-500">${option.price} USD</p>
          <p className="text-xs text-gray-400 mt-1">{option.tagline}</p>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-purple-700' : 'border-2 border-gray-300'
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
  handlePurchase: (purchaseOption: PurchaseOption) => void
}

/**
 * Renders the view listing purchase options incl header, options, footer with a button to purchase.
 */
const PurchaseOptions = ({ isDesktop, options, handlePurchase }: PurchaseOptionsProps) => {
  const [selectedOption, setSelectedOption] = useState<PurchaseOption | null>(null)
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionSelect = useCallback((purchaseOption: PurchaseOption) => {
    setSelectedOption(purchaseOption)
  }, []);

  const handlePurchaseWrapped = useCallback(async () => {
    setIsLoading(true);

    try {
      if (selectedOption !== null) {
        await handlePurchase(selectedOption)
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedOption, handlePurchase]);

  return (
    <div className="flex flex-col w-full mx-auto bg-white rounded-2xl h-full min-h-0">
      {/* Scrollable area listing options*/}
      <ScrollArea className="flex-grow overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            {options.map((option) => (
              <PurchaseOptionButton key={option.id} option={option} isSelected={selectedOption === option} onOptionSelect={handleOptionSelect} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={`p-6 md:p-8 ${!isDesktop && 'bg-gray-50'} border-t border-gray-200`}>
        <Button
          className={'w-full py-6 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ease-in-out flex items-center justify-center outline-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'}
          onClick={handlePurchaseWrapped}
          disabled={isLoading || selectedOption === null}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : selectedOption !== null ? (
            <>
              Purchase {selectedOption.credits} Credits
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            'Select a plan to continue'
          )}
        </Button>
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

/**
 * Renders a Dialog (or Drawer on mobile) to purchase credits.
 * 
 * @param param0 
 * @returns 
 */
export const PurchaseCreditsModal = ({
  open,
  onOpenChange,
}: PurchaseCreditsModalProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handlePurchase = useCallback(async (purchaseOption: PurchaseOption) => {
    const { data } = await apiClient.post<CreateCheckoutSessionsResponse>("/api/checkout-sessions", { priceId: purchaseOption.priceId });

    if (!data.success || !data.data) {
      throw new Error(data.error || "An error whilst creating the checkout session");
    }

    window.location.href = data.data.url;
  }, []);

  // Strip has a different set of pricing for dev vs production
  const options: PurchaseOption[] = process.env.NODE_ENV === "development" ? DEV_PURCHASE_OPTIONS : PROD_PURCHASE_OPTIONS;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col sm:max-w-[525px] max-h-[calc(100vh-64px)]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-gray-800 text-xl">Buy Credits</DialogTitle>
            <DialogDescription className="text-sm">
              Choose your credit package and start fixing PDFs like a pro!
            </DialogDescription>
          </DialogHeader>
          <PurchaseOptions isDesktop={isDesktop} options={options} handlePurchase={handlePurchase} />
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
          <PurchaseOptions isDesktop={isDesktop} options={options} handlePurchase={handlePurchase} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}