'use client'

import App from "@/components/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";


export default function HomePage() {
  const { data: session, status } = useSession();

  const [queryClient] = useState(() => new QueryClient());

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (session) {
    return (
      <QueryClientProvider  client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  }

  return (
    <div>
      Not signed in <br />
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}