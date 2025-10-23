import { useState } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich angemeldet!",
        description: "Sie erhalten ab jetzt alle Updates zu unseren Shows.",
      });
      setEmail("");
    } catch (error: any) {
      const errorMessage = error.message || "Ein Fehler ist aufgetreten.";
      toast({
        title: "Fehler",
        description: errorMessage.includes("duplicate") 
          ? "Diese E-Mail ist bereits registriert." 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-card/10 to-background" role="region" aria-labelledby="newsletter-heading">
      <div className="container mx-auto max-w-2xl text-center">
        <Bell className="w-16 h-16 mx-auto mb-6 text-gold" aria-hidden="true" />
        <h2 id="newsletter-heading" className="text-3xl md:text-4xl font-heading mb-4 tracking-wider text-foreground">
          Bleiben Sie informiert
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Erhalten Sie exklusive Updates zu neuen Terminen und besonderen Ankündigungen
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <label htmlFor="newsletter-email" className="sr-only">
            E-Mail-Adresse für Newsletter
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ihre E-Mail-Adresse"
            className="flex-1 px-6 py-4 bg-input border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-gold"
            required
            aria-required="true"
            aria-describedby="newsletter-description"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gold hover:bg-gold-dark text-primary-foreground font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            disabled={isSubmitting}
            aria-label="Für Newsletter anmelden"
          >
            {isSubmitting ? "Wird gesendet..." : "Anmelden"}
          </button>
        </form>
        <p id="newsletter-description" className="sr-only">
          Melden Sie sich für unseren Newsletter an, um Updates zu neuen Terminen und Ankündigungen zu erhalten
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
