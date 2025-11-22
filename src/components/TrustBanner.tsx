import { Check, Star, Shield } from "lucide-react";

export const TrustBanner = () => {
  return (
    <div className="bg-card/20 backdrop-blur-sm border-y border-gold/20 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Check className="w-5 h-5 text-gold" />
            <span>Tickets offiziell über Eventim</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <span>Über 1.000 zufriedene Besucher</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <span>100% sichere Zahlung</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBanner;
