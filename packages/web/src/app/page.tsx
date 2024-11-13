'use client'

import App from "@/components/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function HomePage() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider  client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}