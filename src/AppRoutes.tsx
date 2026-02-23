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
const WanjaMues = lazy(() => import("./pages/WanjaMues"));
const AntoineMonot = lazy(() => import("./pages/AntoineMonot"));
const MarvelinPage = lazy(() => import("./pages/Marvelin"));
const StefanieSick = lazy(() => import("./pages/StefanieSick"));
const Hoerspiel = lazy(() => import("./pages/Hoerspiel"));
const GKChesterton = lazy(() => import("./pages/GKChesterton"));
const FatherBrown = lazy(() => import("./pages/FatherBrown"));
const KrimiHoerspiel = lazy(() => import("./pages/KrimiHoerspiel"));
const Admin = lazy(() => import("./pages/Admin"));
const Download = lazy(() => import("./pages/Download"));
const ShareDownload = lazy(() => import("./pages/ShareDownload"));
const BundleDownload = lazy(() => import("./pages/BundleDownload"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground font-heading uppercase tracking-widest">Lädt...</span>
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
  "/wanja-mues",
  "/antoine-monot",
  "/marvelin",
  "/stefanie-sick",
  "/hoerspiel",
  "/g-k-chesterton",
  "/father-brown",
  "/krimi-hoerspiel",
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
      <Route path="/wanja-mues" element={<WanjaMues />} />
      <Route path="/antoine-monot" element={<AntoineMonot />} />
      <Route path="/marvelin" element={<MarvelinPage />} />
      <Route path="/stefanie-sick" element={<StefanieSick />} />
      <Route path="/hoerspiel" element={<Hoerspiel />} />
      <Route path="/g-k-chesterton" element={<GKChesterton />} />
      <Route path="/father-brown" element={<FatherBrown />} />
      <Route path="/krimi-hoerspiel" element={<KrimiHoerspiel />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/download/:id" element={<Download />} />
      <Route path="/dl/:token" element={<ShareDownload />} />
      <Route path="/bundle/:token" element={<BundleDownload />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
