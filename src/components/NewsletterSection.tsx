import { useState } from "react";
import { Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const NewsletterSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consent: false
  });

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
          
          <form 
            method="POST" 
            action="https://cf890442.sibforms.com/serve/MUIFAKTFM5ftDcjl36_R-0XNz_CSkr1PkKZNd9YnbE94F0mFmNvrQIaf4EXUr3IIV6yqH-KhSn6ulGWuj4VHTdC2NSGKsFLB0taZdyiFDl--e0IocY12JACdrvSmELOqYGZ_ThPKerjpMa3yXXIpb7nKnLjbmfyh0oe4T8q7_YZwcThoMRwHHn-PGQoHWNJCjra5HoFkWlazNJKy"
            id="sib-form"
            className="max-w-md mx-auto mt-8 space-y-4"
          >
            {/* Name Field */}
            <div>
              <input
                type="text"
                id="FULLNAME"
                name="FULLNAME"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dein Name (optional)"
                className="w-full px-6 py-4 bg-background/50 border-2 border-gold/30 rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                autoComplete="off"
                maxLength={200}
              />
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                id="EMAIL"
                name="EMAIL"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Deine E-Mail-Adresse"
                required
                className="w-full px-6 py-4 bg-background/50 border-2 border-gold/30 rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                autoComplete="off"
              />
            </div>

            {/* GDPR Consent Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="OPT_IN"
                  name="OPT_IN"
                  value="1"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  required
                  className="mt-1 border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <Label 
                  htmlFor="OPT_IN" 
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Ich möchte Updates zu neuen Terminen erhalten und akzeptiere die{" "}
                  <a 
                    href="/datenschutz" 
                    className="text-gold hover:text-gold/80 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Datenschutzerklärung
                  </a>.
                </Label>
              </div>
              
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Du kannst den Newsletter jederzeit abbestellen. Wir verwenden Brevo als Marketing-Plattform. 
                Mit dem Absenden stimmst du zu, dass deine Daten gemäß den{" "}
                <a 
                  href="https://www.brevo.com/de/legal/privacypolicy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold/70 hover:text-gold underline transition-colors"
                >
                  Datenschutzrichtlinien von Brevo
                </a>{" "}
                verarbeitet werden.
              </p>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center py-2">
              <div 
                className="g-recaptcha" 
                data-sitekey="6Lc5r_UrAAAAAMEpIzFr9-eojqEQ0wPvEkugYWA4"
                data-theme="dark"
              />
            </div>

            {/* Hidden Fields */}
            <input type="text" name="email_address_check" value="" className="hidden" />
            <input type="hidden" name="locale" value="de" />

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn-premium w-full"
              >
                Anmelden
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
