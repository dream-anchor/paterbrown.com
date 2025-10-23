import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Vielen Dank! Wir informieren dich über neue Termine.");
      setEmail("");
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
                className="btn-premium"
              >
                Senden
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
