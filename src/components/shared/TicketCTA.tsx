import { Link } from "react-router-dom";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { useNextEvent } from "@/hooks/useNextEvent";

type Variant = "hero" | "informative" | "emotional" | "personal" | "concrete";

interface TicketCTAProps {
  variant: Variant;
  className?: string;
}

const TicketCTA = ({ variant, className = "" }: TicketCTAProps) => {
  const { city, date, isLoading } = useNextEvent();

  const label = getLabel(variant, city, date, isLoading);
  const buttonText = getButtonText(variant);
  const isInternal = variant === "concrete";

  return (
    <div className={`py-16 md:py-20 text-center ${className}`}>
      {label && (
        <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">
          {label}
        </p>
      )}
      {isInternal ? (
        <Link to="/termine">
          <button className="btn-premium" type="button">
            {buttonText}
          </button>
        </Link>
      ) : (
        <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
          <button className="btn-premium" type="button">
            {buttonText}
          </button>
        </a>
      )}
    </div>
  );
};

function getLabel(variant: Variant, city: string, date: string, isLoading: boolean): string | null {
  switch (variant) {
    case "hero":
      return null;
    case "informative":
      if (isLoading || !city) return "Nächster Termin";
      return `Nächster Termin: ${city} · ${date}`;
    case "emotional":
      return "Gänsehaut garantiert";
    case "personal":
      return "Live herausfinden";
    case "concrete":
      return "Nur noch wenige Termine";
  }
}

function getButtonText(variant: Variant): string {
  switch (variant) {
    case "hero":
      return "Tickets sichern";
    case "informative":
      return "Jetzt Tickets sichern";
    case "emotional":
      return "Live erleben";
    case "personal":
      return "Tickets ab 29 €";
    case "concrete":
      return "Alle Termine ansehen";
  }
}

export default TicketCTA;
