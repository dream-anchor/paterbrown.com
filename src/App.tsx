import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UploadProvider } from "@/contexts/UploadContext";
import GlobalUploadIndicator from "@/components/admin/GlobalUploadIndicator";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsletterThankYou = lazy(() => import("./pages/NewsletterThankYou"));
const NewsletterSent = lazy(() => import("./pages/NewsletterSent"));
const TicketThankYou = lazy(() => import("./pages/TicketThankYou"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Admin = lazy(() => import("./pages/Admin"));
const Download = lazy(() => import("./pages/Download"));
const ShareDownload = lazy(() => import("./pages/ShareDownload"));
const BundleDownload = lazy(() => import("./pages/BundleDownload"));

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

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      <span className="text-sm text-gray-500 font-medium">Lädt...</span>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UploadProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/newsletter-gesendet" element={<NewsletterSent />} />
                <Route path="/danke-newsletter" element={<NewsletterThankYou />} />
                <Route path="/danke-ticket" element={<TicketThankYou />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/download/:id" element={<Download />} />
                <Route path="/dl/:token" element={<ShareDownload />} />
                <Route path="/bundle/:token" element={<BundleDownload />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          {/* Global Upload Indicator - visible across all pages */}
          <GlobalUploadIndicator />
        </UploadProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
