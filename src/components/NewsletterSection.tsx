import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: email.trim() }
      });

      if (error) {
        console.error("Newsletter subscription error:", error);
        toast.error(error.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Vielen Dank! Wir informieren dich über neue Termine.");
      setEmail("");
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-40 px-6 bg-gradient-to-b from-card/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <div className="premium-card p-12 md:p-16 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4">
            <Bell className="w-8 h-8 text-gold" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading tracking-wider text-foreground uppercase">
            Verpasse keine neuen Termine
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Trage dich ein und erhalte Updates zu neuen Shows
          </p>
          
          <div className="flex gap-2 text-xs text-gold uppercase tracking-[0.2em] justify-center flex-wrap">
            <span>Exklusive Updates</span>
            <span>·</span>
            <span>Neue Termine</span>
            <span>·</span>
            <span>Behind-the-Scenes</span>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                className="flex-1 px-6 py-4 bg-background/50 border-2 border-gold/30 rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Newsletter abonnieren"
              >
                {isSubmitting ? "Wird gesendet..." : "Senden"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
