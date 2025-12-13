import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEO 
        title="404 - Seite nicht gefunden"
        description="Die angeforderte Seite wurde leider nicht gefunden."
        robots="noindex, nofollow"
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Seite nicht gefunden</p>
        <a href="/" className="text-gold underline hover:text-gold/80">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
};

export default NotFound;
