export const BLACK_WEEK_CONFIG = {
  // Black Week aktiviert – Endet automatisch am 1.12.2025 um 23:59
  enabled: true,
  
  // Zeitraum (MEZ/Berlin Timezone)
  startDate: new Date('2025-11-25T16:00:00+01:00'),
  endDate: new Date('2025-12-01T23:59:59+01:00'),
  
  // Rabatt
  discount: 30,
  
  // Texte
  texts: {
    badge: 'BLACK WEEK',
    discount: '30% Rabatt',
    cta: 'JETZT 30% RABATT SICHERN!',
    banner: 'BLACK WEEK – 30% Rabatt auf alle Termine bis 1.12.',
    countdown: 'Noch {time}'
  }
};

// Prüft, ob Black Week aktiv ist (Feature Flag + automatisches Ende)
export const isBlackWeekActive = (): boolean => {
  if (!BLACK_WEEK_CONFIG.enabled) return false;
  
  const now = new Date();
  return now <= BLACK_WEEK_CONFIG.endDate;
};

// Berechnet verbleibende Zeit - Deutsche Ausgabe
export const getTimeRemaining = () => {
  const now = new Date();
  const end = BLACK_WEEK_CONFIG.endDate;
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Deutsche, ausgeschriebene Zeitangaben
  if (days > 1) return `${days} Tage und ${hours} Stunden`;
  if (days === 1) return `1 Tag und ${hours} Stunden`;
  if (hours > 1) return `${hours} Stunden`;
  if (hours === 1) return `1 Stunde`;
  if (minutes > 1) return `${minutes} Minuten`;
  return `1 Minute`;
};
