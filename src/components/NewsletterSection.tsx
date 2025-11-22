import { Bell } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

const newsletterSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Bitte gültige E-Mail-Adresse eingeben" })
    .max(255, { message: "E-Mail zu lang" }),
  name: z.string()
    .trim()
    .max(100, { message: "Name zu lang (max. 100 Zeichen)" })
    .regex(/^[a-zA-ZäöüÄÖÜß\s-]*$/, { message: "Nur Buchstaben, Leerzeichen und Bindestriche erlaubt" })
    .optional()
});

const NewsletterSection = () => {
  const [validationError, setValidationError] = useState<string>("");
  const isBlackWeek = isBlackWeekActive();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setValidationError("");
    
    const formData = new FormData(e.currentTarget);
    const result = newsletterSchema.safeParse({
      email: formData.get('EMAIL') as string,
      name: formData.get('FULLNAME') as string || undefined
    });
    
    if (!result.success) {
      e.preventDefault();
      const firstError = result.error.issues[0];
      setValidationError(firstError.message);
      return;
    }
    
    // Form is valid, allow submission to Brevo
  };
  return <section 
    id="newsletter-heading" 
    className="py-24 px-6 bg-gradient-to-b from-card/20 to-background relative overflow-hidden"
    aria-labelledby="newsletter-heading"
    role="region"
  >
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <div className="premium-card p-12 md:p-16 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4">
            <Bell className="w-8 h-8 text-gold" />
          </div>
          
          <h2 id="newsletter-heading" className="text-4xl md:text-5xl font-heading tracking-wider text-foreground uppercase">
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

          {/* Validation Error Message */}
          {validationError && (
            <div 
              className="max-w-md mx-auto p-4 bg-destructive/10 border border-destructive/30 rounded-md"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 512 512" className="w-6 h-6 flex-shrink-0 text-destructive fill-current" aria-hidden="true">
                  <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
                </svg>
                <span className="text-sm text-destructive">
                  {validationError}
                </span>
              </div>
            </div>
          )}

          {/* Error Message with ARIA (for Brevo errors) */}
          <div 
            id="error-message" 
            className="sib-form-message-panel hidden max-w-md mx-auto p-4 bg-destructive/10 border border-destructive/30 rounded-md"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 512 512" className="w-6 h-6 flex-shrink-0 text-destructive fill-current" aria-hidden="true">
                <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
              </svg>
              <span className="text-sm text-destructive">
                Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es erneut.
              </span>
            </div>
          </div>

          {/* Success Message with ARIA */}
          <div 
            id="success-message" 
            className="sib-form-message-panel hidden max-w-md mx-auto p-4 bg-green-500/10 border border-green-500/30 rounded-md"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 512 512" className="w-6 h-6 flex-shrink-0 text-green-500 fill-current" aria-hidden="true">
                <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
              </svg>
              <span className="text-sm text-green-500">
                Deine Anmeldung war erfolgreich.
              </span>
            </div>
          </div>
          
          <form 
            method="POST" 
            action="https://cf890442.sibforms.com/serve/MUIFAKTFM5ftDcjl36_R-0XNz_CSkr1PkKZNd9YnbE94F0mFmNvrQIaf4EXUr3IIV6yqH-KhSn6ulGWuj4VHTdC2NSGKsFLB0taZdyiFDl--e0IocY12JACdrvSmELOqYGZ_ThPKerjpMa3yXXIpb7nKnLjbmfyh0oe4T8q7_YZwcThoMRwHHn-PGQoHWNJCjra5HoFkWlazNJKy" 
            target="_self" 
            className="max-w-md mx-auto mt-8 space-y-4"
            data-testid="newsletter-form"
            onSubmit={handleSubmit}
          >
            {/* Name Field */}
            <div>
              <label htmlFor="FULLNAME" className="sr-only">Dein Name</label>
              <input 
                className="w-full px-6 py-4 bg-card/40 border-2 border-gold/30 rounded-none text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:border-gold transition-colors" 
                maxLength={200} 
                type="text" 
                id="FULLNAME" 
                name="FULLNAME" 
                autoComplete="name" 
                placeholder="Dein Name"
                aria-label="Dein Name" 
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="EMAIL" className="sr-only">Deine E-Mail Adresse</label>
              <input 
                className="w-full px-6 py-4 bg-card/40 border-2 border-gold/30 rounded-none text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:border-gold transition-colors" 
                type="email" 
                id="EMAIL" 
                name="EMAIL" 
                autoComplete="email" 
                placeholder="Deine E-Mail Adresse" 
                required 
                aria-required="true"
              />
            </div>

            {/* GDPR Consent Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded-sm border-2 border-gold/30 bg-transparent checked:bg-gold checked:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 cursor-pointer" value="1" id="OPT_IN" name="OPT_IN" required />
                <span className="text-sm text-muted-foreground leading-relaxed">Ich möchte den Newsletter erhalten und akzeptiere die Datenschutzerklärung.</span>
              </label>
              <p className="text-xs text-muted-foreground/70 leading-relaxed mt-2 ml-7">
                Du kannst den Newsletter jederzeit über den Link in unserem Newsletter abbestellen.
              </p>
            </div>


            {/* Brevo Declaration */}
            <div className="sib-form__declaration text-center py-4">
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Wir verwenden Brevo als unsere Marketing-Plattform. Indem du das Formular absendest, erklärst du dich einverstanden, dass die von dir angegebenen persönlichen Informationen an Brevo zur Bearbeitung übertragen werden gemäß den{" "}
                <a target="_blank" href="https://www.brevo.com/de/legal/privacypolicy/" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline transition-colors">
                  Datenschutzrichtlinien von Brevo
                </a>.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button type="submit" className="btn-premium w-full">
                Anmelden
              </button>
            </div>

            {/* Hidden Fields */}
            <input type="text" name="email_address_check" value="" className="input--hidden" />
            <input type="hidden" name="locale" value="de" />
          </form>
        </div>
      </div>
    </section>;
};
export default NewsletterSection;