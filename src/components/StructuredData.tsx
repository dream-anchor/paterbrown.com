import { Helmet } from 'react-helmet-async';

/**
 * FAQ Structured Data Component
 * Provides rich snippets for frequently asked questions
 */
export const FAQStructuredData = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wie lange dauert die Show?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Gesamtdauer beträgt ca. 2 Stunden inklusive einer 15-minütigen Pause."
        }
      },
      {
        "@type": "Question",
        "name": "Wo kann ich Tickets kaufen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tickets sind über Eventim.de (Deutschland) und Ticketcorner.ch (Schweiz) erhältlich."
        }
      },
      {
        "@type": "Question",
        "name": "Wer sind die Hauptdarsteller?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Antoine Monot als Pater Brown und Wanja Mues als Flambeau, beide bekannt aus der ZDF-Serie 'Ein Fall für Zwei'."
        }
      },
      {
        "@type": "Question",
        "name": "Was macht diese Show besonders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine einzigartige Kombination aus Live-Theater, Hörspiel-Performance und Beatbox-Sound durch Marvelin mit Loop-Station."
        }
      },
      {
        "@type": "Question",
        "name": "Gibt es Ermäßigungen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Informationen zu Ermäßigungen und Preisen finden Sie direkt beim jeweiligen Ticketanbieter (Eventim oder Ticketcorner)."
        }
      },
      {
        "@type": "Question",
        "name": "Ist die Show für Kinder geeignet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Show ist ein Krimi-Hörspiel mit Spannung und Humor. Eine Empfehlung ab 12 Jahren ist ratsam."
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

/**
 * LocalBusiness Structured Data for Venues
 */
export const LocalBusinessSchema = ({ venue }: { venue: {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  telephone?: string;
}}) => {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    "name": venue.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": venue.address,
      "addressLocality": venue.city,
      "postalCode": venue.postalCode,
      "addressCountry": venue.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": venue.latitude,
      "longitude": venue.longitude
    },
    ...(venue.telephone && { "telephone": venue.telephone })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(businessSchema)}
      </script>
    </Helmet>
  );
};
