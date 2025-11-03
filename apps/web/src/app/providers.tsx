"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if ((error as { response?: { status: number } })?.response?.status &&
                  (error as { response?: { status: number } }).response!.status >= 400 &&
                  (error as { response?: { status: number } }).response!.status < 500) {
                return false;
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            onError: (error) => {
              // Global mutation error handling
              const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
              if (message && typeof message === 'string') {
                toast.error('Erreur', { description: message });
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
