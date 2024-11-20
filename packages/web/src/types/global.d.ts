// Extend the Window interface to include gtag
interface Window {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gtag?: (...args: any[]) => void;
}