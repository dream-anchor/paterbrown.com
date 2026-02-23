import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UploadProvider } from "@/contexts/UploadContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import GlobalUploadIndicator from "@/components/admin/GlobalUploadIndicator";
import { AppRoutes } from "./AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Dehydrated State vom SSG Pre-Render (falls vorhanden)
const dehydratedState =
  typeof window !== "undefined"
    ? (window as unknown as Record<string, unknown>).__REACT_QUERY_STATE__
    : undefined;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <TooltipProvider>
          <NotificationProvider>
          <UploadProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            {/* Global Upload Indicator - visible across all pages */}
            <GlobalUploadIndicator />
          </UploadProvider>
          </NotificationProvider>
        </TooltipProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
