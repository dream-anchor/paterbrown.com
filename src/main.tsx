import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./fonts.css";
import "./index.css";
import { initWebVitals } from "./lib/vitals";

// Initialize Web Vitals tracking
if (typeof window !== 'undefined') {
  initWebVitals();
}

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service Worker registration failed, silently ignore
    });
  });
}

const rootElement = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Conditional Hydration: wenn SSG pre-rendered hat, hydrateRoot verwenden
if (rootElement.childNodes.length > 0) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
