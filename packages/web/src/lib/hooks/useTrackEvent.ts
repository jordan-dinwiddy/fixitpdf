import { useCallback } from 'react';
import { trackEvent } from '@/lib/gtag';

export const useTrackEvent = () => {
  return useCallback(
    ({
      action,
      category,
      label,
      value,
    }: {
      action: string;
      category: string;
      label?: string;
      value?: number;
    }) => {
      trackEvent({ action, category, label, value });
    },
    []
  );
};