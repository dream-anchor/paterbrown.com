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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-card/20 to-background">
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          {/* Success Icon */}
          <div className="flex justify-center mb-8 cinematic-enter">
            <CheckCircle className="w-24 h-24 text-[hsl(var(--neon-gold))] drop-shadow-[0_0_20px_hsl(var(--neon-gold)/0.5)]" />
          </div>

          {/* Headline */}
          <div className="text-center mb-12 cinematic-enter" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
              Willkommen beim Pater Brown Newsletter!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Ab sofort erhältst du exklusive Updates, 
              Termine und Einblicke direkt in dein Postfach.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="premium-card p-6 text-center cinematic-enter"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="w-12 h-12 text-[hsl(var(--neon-gold))]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gold">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Call-to-Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center cinematic-enter" style={{ animationDelay: "0.5s" }}>
            <Button
              variant="neon"
              size="lg"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('tour-dates')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-lg px-8"
            >
              Zu den Terminen
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="text-lg px-8 border-[hsl(var(--neon-gold))] text-[hsl(var(--neon-gold))] hover:bg-[hsl(var(--neon-gold))]/10"
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
