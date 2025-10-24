import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Eye, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const NewsletterThankYou = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Calendar,
      title: "Exklusive Termine",
      description: "Erfahre als Erstes von neuen Show-Terminen",
    },
    {
      icon: Eye,
      title: "Behind-the-Scenes",
      description: "Einblicke hinter die Kulissen der Produktion",
    },
    {
      icon: Bell,
      title: "News & Updates",
      description: "Alle wichtigen Neuigkeiten direkt in dein Postfach",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Elegant background with radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--neon-gold)/0.08),transparent_50%)]" />
      
      <main className="flex-grow flex items-center justify-center px-4 py-20 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Success Icon with elegant glow */}
          <div className="flex justify-center mb-10 cinematic-enter">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[hsl(var(--neon-gold))] opacity-20 animate-pulse" />
              <CheckCircle className="w-28 h-28 text-[hsl(var(--neon-gold))] drop-shadow-[0_0_30px_hsl(var(--neon-gold)/0.6)] relative z-10" />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-16 cinematic-enter space-y-6" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gold tracking-tight leading-tight">
              Willkommen beim<br />Pater Brown Newsletter!
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed font-light">
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Ab sofort erhältst du exklusive Updates, 
              Termine und Einblicke direkt in dein Postfach.
            </p>
          </div>

          {/* Benefits Cards with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group relative premium-card p-8 text-center cinematic-enter hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-gold)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-[hsl(var(--neon-gold))] opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                        <Icon className="w-14 h-14 text-[hsl(var(--neon-gold))] relative z-10 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-3 text-gold">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call-to-Actions with elegant spacing */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center cinematic-enter px-4" style={{ animationDelay: "0.5s" }}>
            <Button
              variant="neon"
              size="lg"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('tour-dates')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-xl px-12 py-7 font-semibold tracking-wide hover:scale-105 transition-transform duration-300"
            >
              Zu den Terminen
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="text-xl px-12 py-7 font-semibold tracking-wide border-2 border-[hsl(var(--neon-gold))] text-[hsl(var(--neon-gold))] hover:bg-[hsl(var(--neon-gold))]/10 hover:scale-105 transition-all duration-300"
            >
              Zurück zur Startseite
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsletterThankYou;
