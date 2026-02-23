import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsletterThankYou = lazy(() => import("./pages/NewsletterThankYou"));
const NewsletterSent = lazy(() => import("./pages/NewsletterSent"));
const TicketThankYou = lazy(() => import("./pages/TicketThankYou"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Termine = lazy(() => import("./pages/Termine"));
const LiveHoerspiel = lazy(() => import("./pages/LiveHoerspiel"));
const PaterBrown = lazy(() => import("./pages/PaterBrown"));
const Muenchen = lazy(() => import("./pages/Muenchen"));
const Hamburg = lazy(() => import("./pages/Hamburg"));
const Koeln = lazy(() => import("./pages/Koeln"));
const Berlin = lazy(() => import("./pages/Berlin"));
const Bremen = lazy(() => import("./pages/Bremen"));
const Admin = lazy(() => import("./pages/Admin"));
const Download = lazy(() => import("./pages/Download"));
const ShareDownload = lazy(() => import("./pages/ShareDownload"));
const BundleDownload = lazy(() => import("./pages/BundleDownload"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      <span className="text-sm text-gray-500 font-medium">Lädt...</span>
    </div>
  </div>
);

/** Routen die beim Build pre-gerendert werden */
export const SSG_ROUTES = [
  "/",
  "/impressum",
  "/datenschutz",
  "/newsletter-gesendet",
  "/danke-newsletter",
  "/danke-ticket",
  "/termine",
  "/live-hoerspiel",
  "/pater-brown",
  "/muenchen",
  "/hamburg",
  "/koeln",
  "/berlin",
  "/bremen",
];

/** Client-Side Routes mit lazy loading (Code Splitting) */
export const AppRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/newsletter-gesendet" element={<NewsletterSent />} />
      <Route path="/danke-newsletter" element={<NewsletterThankYou />} />
      <Route path="/danke-ticket" element={<TicketThankYou />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/termine" element={<Termine />} />
      <Route path="/live-hoerspiel" element={<LiveHoerspiel />} />
      <Route path="/pater-brown" element={<PaterBrown />} />
      <Route path="/muenchen" element={<Muenchen />} />
      <Route path="/hamburg" element={<Hamburg />} />
      <Route path="/koeln" element={<Koeln />} />
      <Route path="/berlin" element={<Berlin />} />
      <Route path="/bremen" element={<Bremen />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/download/:id" element={<Download />} />
      <Route path="/dl/:token" element={<ShareDownload />} />
      <Route path="/bundle/:token" element={<BundleDownload />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
